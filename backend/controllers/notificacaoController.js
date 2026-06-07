// =============================================================
// controllers/notificacaoController.js
// Gerencia notificações geradas automaticamente para ONGs
// =============================================================

const db = require('../config/db');

// ─────────────────────────────────────────────────────────────
// Função interna — chamada pelo postagemController após criar
// uma postagem que aciona regra de priorização.
// NÃO é uma rota HTTP; use diretamente no código.
// ─────────────────────────────────────────────────────────────
exports.criarNotificacao = ({ ong_id, postagem_id, tipo, mensagem }) => {
  return new Promise((resolve, reject) => {
    if (!ong_id || !postagem_id || !tipo || !mensagem) {
      return reject(new Error('Parâmetros insuficientes para criar notificação'));
    }

    const sql = `
      INSERT INTO notificacoes (ong_id, postagem_id, tipo, mensagem)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [ong_id, postagem_id, tipo, mensagem], (err, result) => {
      if (err) return reject(err);
      resolve(result.insertId);
    });
  });
};

// ─────────────────────────────────────────────────────────────
// GET /api/notificacoes
// Retorna todas as notificações da ONG autenticada
// Query param opcional: ?apenas_nao_lidas=true
// ─────────────────────────────────────────────────────────────
exports.listarNotificacoes = (req, res) => {
  const ong_id = req.usuarioId;
  const apenasNaoLidas = req.query.apenas_nao_lidas === 'true';

  let sql = `
    SELECT 
      n.id,
      n.tipo,
      n.mensagem,
      n.lida,
      n.criada_em,
      n.postagem_id,
      p.titulo        AS postagem_titulo,
      p.tipo_postagem AS postagem_tipo,
      p.prioridade    AS postagem_prioridade,
      p.localizacao   AS postagem_localizacao
    FROM notificacoes n
    INNER JOIN postagens p ON n.postagem_id = p.id
    WHERE n.ong_id = ?
  `;

  if (apenasNaoLidas) {
    sql += ' AND n.lida = 0';
  }

  sql += ' ORDER BY n.criada_em DESC LIMIT 100';

  db.query(sql, [ong_id], (err, results) => {
    if (err) {
      console.error('Erro ao listar notificações:', err);
      return res.status(500).json({ erro: 'Erro ao buscar notificações.' });
    }
    res.status(200).json(results);
  });
};

// ─────────────────────────────────────────────────────────────
// GET /api/notificacoes/contagem
// Retorna o número de notificações não lidas (para badge no app)
// ─────────────────────────────────────────────────────────────
exports.contarNaoLidas = (req, res) => {
  const ong_id = req.usuarioId;

  const sql = `
    SELECT COUNT(*) AS total
    FROM notificacoes
    WHERE ong_id = ? AND lida = 0
  `;

  db.query(sql, [ong_id], (err, results) => {
    if (err) {
      console.error('Erro ao contar notificações:', err);
      return res.status(500).json({ erro: 'Erro ao contar notificações.' });
    }
    res.status(200).json({ total: results[0].total });
  });
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/notificacoes/:id/lida
// Marca uma notificação específica como lida
// ─────────────────────────────────────────────────────────────
exports.marcarComoLida = (req, res) => {
  const ong_id  = req.usuarioId;
  const notifId = req.params.id;

  const sql = `
    UPDATE notificacoes
    SET lida = 1
    WHERE id = ? AND ong_id = ?
  `;

  db.query(sql, [notifId, ong_id], (err, result) => {
    if (err) {
      console.error('Erro ao marcar notificação como lida:', err);
      return res.status(500).json({ erro: 'Erro ao atualizar notificação.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Notificação não encontrada ou sem permissão.' });
    }

    res.status(200).json({ mensagem: 'Notificação marcada como lida.' });
  });
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/notificacoes/marcar-todas-lidas
// Marca TODAS as notificações da ONG como lidas
// ─────────────────────────────────────────────────────────────
exports.marcarTodasComoLidas = (req, res) => {
  const ong_id = req.usuarioId;

  const sql = `
    UPDATE notificacoes
    SET lida = 1
    WHERE ong_id = ? AND lida = 0
  `;

  db.query(sql, [ong_id], (err, result) => {
    if (err) {
      console.error('Erro ao marcar todas como lidas:', err);
      return res.status(500).json({ erro: 'Erro ao atualizar notificações.' });
    }

    res.status(200).json({
      mensagem: 'Todas as notificações marcadas como lidas.',
      atualizadas: result.affectedRows,
    });
  });
};