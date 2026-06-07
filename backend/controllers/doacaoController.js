// =============================================================
// controllers/doacaoController.js
// Integração completa com Mercado Pago PIX
// =============================================================

const db = require('../config/db');
const { criarNotificacao } = require('./notificacaoController');
const { verificarDoacaoRelevante } = require('../services/priorityService');

// ─────────────────────────────────────────────────────────────
// SDK do Mercado Pago (v2)
// npm install mercadopago
// ─────────────────────────────────────────────────────────────
const { MercadoPagoConfig, Payment } = require('mercadopago');

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const payment = new Payment(mpClient);

// =============================================================
// POST /api/doacoes/criar-pix
// Cria uma cobrança PIX no Mercado Pago e salva no banco
// Body: { ong_id, valor, descricao, usuario_email }
// =============================================================
exports.criarPix = async (req, res) => {
  const usuarios_id = req.usuarioId;
  const { ong_id, valor, descricao, usuario_email } = req.body;

  // ── Validações básicas ──────────────────────────────────────
  if (!ong_id || !valor || !usuario_email) {
    return res.status(400).json({
      erro: 'ong_id, valor e usuario_email são obrigatórios.'
    });
  }

  const valorNum = parseFloat(String(valor).replace(',', '.'));
  if (isNaN(valorNum) || valorNum <= 0) {
    return res.status(400).json({ erro: 'Valor inválido.' });
  }

  try {
    // ── 1. Busca dados da ONG para preencher a descrição ───────
    const [ongRows] = await dbQuery(
      'SELECT nome FROM usuarios WHERE id = ? AND admin = 2',
      [ong_id]
    );

    if (!ongRows) {
      return res.status(404).json({ erro: 'ONG não encontrada.' });
    }

    // ── 2. Cria o pagamento PIX no Mercado Pago ────────────────
    const mpResponse = await payment.create({
      body: {
        transaction_amount: valorNum,
        description: descricao || `Doação para ${ongRows.nome}`,
        payment_method_id: 'pix',
        payer: {
          email: usuario_email,
        },
        // Chama seu backend quando o pagamento for confirmado
        notification_url: `${process.env.API_BASE_URL}/api/doacoes/webhook`,
        // Metadados para identificar a doação no webhook
        metadata: {
          ong_id: String(ong_id),
          usuarios_id: String(usuarios_id),
          valor: String(valorNum),
        },
      },
    });

    const pixData = mpResponse.point_of_interaction?.transaction_data;

    if (!pixData?.qr_code) {
      console.error('Resposta inesperada do Mercado Pago:', mpResponse);
      return res.status(500).json({ erro: 'Erro ao gerar PIX. Tente novamente.' });
    }

    // ── 3. Salva a doação no banco com status 'pendente' ───────
    const sqlInsert = `
      INSERT INTO doacoes 
        (usuarios_id, ong_id, valor, descricao, status, mp_payment_id, qr_code, qr_code_base64)
      VALUES (?, ?, ?, ?, 'pendente', ?, ?, ?)
    `;

    const insertResult = await dbQuery(sqlInsert, [
      usuarios_id,
      ong_id,
      valorNum,
      descricao || `Doação para ${ongRows.nome}`,
      String(mpResponse.id),
      pixData.qr_code,
      pixData.qr_code_base64 || null,
    ]);

    // ── 4. Retorna o QR Code para o app exibir ─────────────────
    return res.status(201).json({
      doacao_id:      insertResult.insertId,
      mp_payment_id:  mpResponse.id,
      qr_code:        pixData.qr_code,
      qr_code_base64: pixData.qr_code_base64,
      valor:          valorNum,
      expiracao:      mpResponse.date_of_expiration,
      status:         'pendente',
    });

  } catch (err) {
    console.error('Erro ao criar PIX:', err);
    return res.status(500).json({ erro: 'Erro interno ao processar doação.' });
  }
};

// =============================================================
// POST /api/doacoes/webhook
// Recebe notificações do Mercado Pago (pagamento aprovado etc.)
// ROTA PÚBLICA — sem autenticação (Mercado Pago chama direto)
// =============================================================
exports.webhook = async (req, res) => {
  // Mercado Pago espera 200 imediato — processamos em background
  res.sendStatus(200);

  try {
    const { type, data } = req.body;

    // Só processa notificações de pagamento
    if (type !== 'payment' || !data?.id) return;

    // ── 1. Busca os detalhes do pagamento no Mercado Pago ──────
    const mpPayment = await payment.get({ id: data.id });

    if (mpPayment.status !== 'approved') return; // Ignora não aprovados

    const mp_payment_id = String(mpPayment.id);
    const metadata      = mpPayment.metadata || {};
    const ong_id        = parseInt(metadata.ong_id);
    const usuarios_id   = parseInt(metadata.usuarios_id);
    const valorPago     = mpPayment.transaction_amount;

    // ── 2. Verifica se já processamos esse pagamento ───────────
    const [doacaoExistente] = await dbQuery(
      `SELECT id, status FROM doacoes WHERE mp_payment_id = ?`,
      [mp_payment_id]
    );

    if (!doacaoExistente) {
      // Pagamento não estava no banco (edge case) — insere agora
      await dbQuery(
        `INSERT INTO doacoes (usuarios_id, ong_id, valor, status, mp_payment_id)
         VALUES (?, ?, ?, 'aprovado', ?)`,
        [usuarios_id || null, ong_id || null, valorPago, mp_payment_id]
      );
    } else if (doacaoExistente.status === 'aprovado') {
      // Já processado — idempotência
      return;
    } else {
      // Atualiza para aprovado
      await dbQuery(
        `UPDATE doacoes SET status = 'aprovado', aprovado_em = NOW() WHERE mp_payment_id = ?`,
        [mp_payment_id]
      );
    }

    // ── 3. Verifica se é doação relevante (≥ R$500) ───────────
    if (!ong_id) return;

    const { relevante, valor: vCheck, limite } = verificarDoacaoRelevante({ valor: valorPago });

    let mensagem;
    let tipo;

    if (relevante) {
      mensagem = `💰 Doação PIX CONFIRMADA de R$ ${vCheck.toFixed(2).replace('.', ',')} — acima de R$ ${limite},00! Pagamento aprovado pelo Mercado Pago.`;
      tipo     = 'doacao_relevante';
    } else {
      mensagem = `✅ Doação PIX de R$ ${valorPago.toFixed(2).replace('.', ',')} confirmada e aprovada.`;
      tipo     = 'doacao_confirmada';
    }

    // Busca o doacao_id atualizado
    const [doacaoAtual] = await dbQuery(
      `SELECT id FROM doacoes WHERE mp_payment_id = ?`,
      [mp_payment_id]
    );

    if (doacaoAtual) {
      await criarNotificacao({
        ong_id,
        postagem_id: doacaoAtual.id, // Reutiliza o ID da doação como referência
        tipo,
        mensagem,
      }).catch(e => console.error('Erro ao criar notificação de doação:', e));
    }

    console.log(`✅ Webhook processado: pagamento ${mp_payment_id} aprovado — R$ ${valorPago}`);

  } catch (err) {
    console.error('Erro ao processar webhook:', err);
  }
};

// =============================================================
// GET /api/doacoes/status/:mp_payment_id
// Polling do app para checar se o PIX foi pago
// =============================================================
exports.verificarStatus = async (req, res) => {
  const { mp_payment_id } = req.params;

  try {
    // Consulta direto no Mercado Pago (fonte da verdade)
    const mpPayment = await payment.get({ id: mp_payment_id });

    const statusMap = {
      approved:   'aprovado',
      pending:    'pendente',
      in_process: 'processando',
      rejected:   'rejeitado',
      cancelled:  'cancelado',
      refunded:   'estornado',
    };

    const statusTraduzido = statusMap[mpPayment.status] || mpPayment.status;

    // Atualiza no banco se aprovado
    if (mpPayment.status === 'approved') {
      await dbQuery(
        `UPDATE doacoes SET status = 'aprovado', aprovado_em = NOW()
         WHERE mp_payment_id = ? AND status != 'aprovado'`,
        [String(mp_payment_id)]
      );
    }

    return res.status(200).json({
      mp_payment_id,
      status:          statusTraduzido,
      status_original: mpPayment.status,
      valor:           mpPayment.transaction_amount,
      aprovado_em:     mpPayment.date_approved || null,
    });

  } catch (err) {
    console.error('Erro ao verificar status:', err);
    return res.status(500).json({ erro: 'Erro ao consultar status do pagamento.' });
  }
};

// =============================================================
// GET /api/doacoes/historico
// Lista doações do usuário logado
// =============================================================
exports.historico = async (req, res) => {
  const usuarios_id = req.usuarioId;

  try {
    const rows = await dbQueryAll(
      `SELECT d.*, u.nome AS ong_nome, u.foto_perfil AS ong_foto
       FROM doacoes d
       LEFT JOIN usuarios u ON d.ong_id = u.id
       WHERE d.usuarios_id = ?
       ORDER BY d.criado_em DESC
       LIMIT 50`,
      [usuarios_id]
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error('Erro ao buscar histórico:', err);
    return res.status(500).json({ erro: 'Erro ao buscar histórico de doações.' });
  }
};

// =============================================================
// GET /api/doacoes/ong/:ong_id
// Lista doações recebidas por uma ONG (acesso apenas da própria ONG)
// =============================================================
exports.doacoesOng = async (req, res) => {
  const usuarioId = req.usuarioId;
  const ong_id    = parseInt(req.params.ong_id);

  // Garante que só a própria ONG veja suas doações
  if (usuarioId !== ong_id) {
    return res.status(403).json({ erro: 'Acesso negado.' });
  }

  try {
    const rows = await dbQueryAll(
      `SELECT d.id, d.valor, d.status, d.descricao, d.criado_em, d.aprovado_em,
              u.nome AS doador_nome
       FROM doacoes d
       LEFT JOIN usuarios u ON d.usuarios_id = u.id
       WHERE d.ong_id = ? AND d.status = 'aprovado'
       ORDER BY d.aprovado_em DESC
       LIMIT 100`,
      [ong_id]
    );

    const total = rows.reduce((acc, d) => acc + parseFloat(d.valor), 0);

    return res.status(200).json({ doacoes: rows, total_recebido: total });
  } catch (err) {
    console.error('Erro ao buscar doações da ONG:', err);
    return res.status(500).json({ erro: 'Erro ao buscar doações.' });
  }
};

// =============================================================
// HELPERS — Promisifica db.query para usar com async/await
// =============================================================
function dbQuery(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(Array.isArray(results) ? results[0] : results);
    });
  });
}

function dbQueryAll(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}