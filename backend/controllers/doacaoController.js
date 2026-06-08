// =============================================================
// controllers/doacaoController.js
// Fluxo simples: registra doação em postagens + retorna chave_pix da ONG
// Sem Mercado Pago — pagamento feito pelo usuário direto no banco via PIX
// =============================================================

const db = require('../config/db');
const { criarNotificacao } = require('./notificacaoController');
const { verificarDoacaoRelevante } = require('../services/priorityService');

// =============================================================
// POST /api/doacoes/registrar
// Registra a intenção de doação e retorna a chave_pix da ONG
// Body: { ong_id, valor, descricao? }
// Header: Authorization Bearer <token>
// =============================================================
exports.registrar = async (req, res) => {
  const usuarios_id = req.usuarioId;
  const { ong_id, valor, descricao } = req.body;

  // ── Validações básicas ──────────────────────────────────────
  if (!ong_id || !valor) {
    return res.status(400).json({ erro: 'ong_id e valor são obrigatórios.' });
  }

  const valorNum = parseFloat(String(valor).replace(',', '.'));
  if (isNaN(valorNum) || valorNum <= 0) {
    return res.status(400).json({ erro: 'Valor inválido.' });
  }

  try {
    // ── 1. Busca a ONG — nome + chave_pix ──────────────────────
    const ong = await dbQuery(
      `SELECT id, nome, chave_pix FROM usuarios WHERE id = ? AND admin = 2`,
      [ong_id]
    );

    if (!ong) {
      return res.status(404).json({ erro: 'ONG não encontrada.' });
    }

    // ── 2. Insere a postagem de doação ─────────────────────────
    const titulo    = `Doação para ${ong.nome}`;
    const desc      = descricao || `Doação de R$ ${valorNum.toFixed(2)} via PIX para ${ong.nome}.`;

    const inserted = await dbInsert(
      `INSERT INTO postagens
         (tipo_postagem, titulo, descricao, usuarios_id, ong_destino_id, valor_doacao)
       VALUES ('doacao', ?, ?, ?, ?, ?)`,
      [titulo, desc, usuarios_id, ong_id, valorNum]
    );

    // ── 3. Notifica a ONG se doação relevante (≥ R$500) ────────
    const { relevante, limite } = verificarDoacaoRelevante({ valor: valorNum });

    if (relevante) {
      const msgNotif = `💰 Doação de R$ ${valorNum.toFixed(2).replace('.', ',')} registrada — acima de R$ ${limite},00! O usuário irá transferir via PIX.`;

      await criarNotificacao({
        ong_id,
        postagem_id: inserted.insertId,
        tipo: 'doacao_relevante',
        mensagem: msgNotif,
      }).catch(e => console.error('Erro ao criar notificação:', e));
    }

    // ── 4. Retorna confirmação + chave PIX da ONG ───────────────
    return res.status(201).json({
      doacao_id:  inserted.insertId,
      ong_nome:   ong.nome,
      chave_pix:  ong.chave_pix || null,
      valor:      valorNum,
      relevante,
      mensagem:   relevante
        ? `Doação relevante registrada! A ONG foi notificada.`
        : `Doação registrada! Copie a chave PIX e transfira no seu banco.`,
    });

  } catch (err) {
    console.error('Erro ao registrar doação:', err);
    return res.status(500).json({ erro: 'Erro interno ao registrar doação.' });
  }
};

// =============================================================
// GET /api/doacoes/ong/:ong_id/chave-pix
// Retorna apenas a chave PIX de uma ONG (para exibir no app)
// =============================================================
exports.chavePix = async (req, res) => {
  const ong_id = parseInt(req.params.ong_id);

  if (!ong_id) {
    return res.status(400).json({ erro: 'ong_id inválido.' });
  }

  try {
    const ong = await dbQuery(
      `SELECT id, nome, chave_pix FROM usuarios WHERE id = ? AND admin = 2`,
      [ong_id]
    );

    if (!ong) {
      return res.status(404).json({ erro: 'ONG não encontrada.' });
    }

    return res.status(200).json({
      ong_id:    ong.id,
      ong_nome:  ong.nome,
      chave_pix: ong.chave_pix || null,
    });

  } catch (err) {
    console.error('Erro ao buscar chave PIX:', err);
    return res.status(500).json({ erro: 'Erro ao buscar chave PIX.' });
  }
};

// =============================================================
// GET /api/doacoes/historico
// Lista doações (postagens tipo 'doacao') do usuário logado
// =============================================================
exports.historico = async (req, res) => {
  const usuarios_id = req.usuarioId;

  try {
    const rows = await dbQueryAll(
      `SELECT p.id, p.titulo, p.descricao, p.valor_doacao, p.data_criacao,
              u.nome AS ong_nome, u.foto_perfil AS ong_foto
       FROM postagens p
       LEFT JOIN usuarios u ON p.ong_destino_id = u.id
       WHERE p.usuarios_id = ? AND p.tipo_postagem = 'doacao'
       ORDER BY p.data_criacao DESC
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
// Lista doações recebidas por uma ONG (só a própria ONG acessa)
// =============================================================
exports.doacoesOng = async (req, res) => {
  const usuarioId = req.usuarioId;
  const ong_id    = parseInt(req.params.ong_id);

  if (usuarioId !== ong_id) {
    return res.status(403).json({ erro: 'Acesso negado.' });
  }

  try {
    const rows = await dbQueryAll(
      `SELECT p.id, p.valor_doacao AS valor, p.descricao, p.data_criacao,
              u.nome AS doador_nome
       FROM postagens p
       LEFT JOIN usuarios u ON p.usuarios_id = u.id
       WHERE p.ong_destino_id = ? AND p.tipo_postagem = 'doacao'
       ORDER BY p.data_criacao DESC
       LIMIT 100`,
      [ong_id]
    );

    const total = rows.reduce((acc, d) => acc + parseFloat(d.valor || 0), 0);

    return res.status(200).json({ doacoes: rows, total_recebido: total });
  } catch (err) {
    console.error('Erro ao buscar doações da ONG:', err);
    return res.status(500).json({ erro: 'Erro ao buscar doações.' });
  }
};

// =============================================================
// HELPERS
// =============================================================
function dbQuery(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      const rows = Array.isArray(results) ? results : [results];
      resolve(rows[0] || null);
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

function dbInsert(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}