// =============================================================
// controllers/postagemController.js
// =============================================================

const db   = require('../config/db');
const fs   = require('fs');
const path = require('path');

const {
  calcularPrioridadeDenuncia,
  calcularPrioridadeComunicado,
  calcularPrioridadeAdocao,
  verificarDoacaoRelevante,
} = require('../services/priorityService');

const { criarNotificacao } = require('./notificacaoController');

// =============================================================
// HELPER — promisifica db.query
// =============================================================
function dbQuery(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// =============================================================
// POST /api/postagens
// =============================================================
exports.criarPostagem = (req, res) => {
  const {
    tipo_postagem,
    titulo,
    descricao,
    localizacao,
    raca,
    genero,
    idade,
    fixado,
    ong_id,
    valor_doacao,
  } = req.body;

  if (tipo_postagem === 'denuncia' && !ong_id) {
    return res.status(400).json({
      erro: 'É obrigatório selecionar uma ONG para registrar uma denúncia.',
    });
  }

  const usuarios_id = req.usuarioId;
  if (!usuarios_id) {
    return res.status(401).json({ erro: 'Usuário não autenticado.' });
  }

  // ── Priorização automática ──────────────────────────────────
  let prioridade        = 'normal';
  let prioridade_score  = 0;
  let motivoNotificacao = null;
  let tipoNotificacao   = null;

  if (tipo_postagem === 'denuncia') {
    const result = calcularPrioridadeDenuncia({ titulo: titulo || '', descricao: descricao || '' });
    prioridade       = result.prioridade;
    prioridade_score = result.score;

    if (prioridade === 'urgente' || prioridade === 'alta') {
      const emoji = prioridade === 'urgente' ? '🚨' : '⚠️';
      const label = prioridade === 'urgente' ? 'URGENTE' : 'ALTA PRIORIDADE';
      motivoNotificacao = `${emoji} Denúncia ${label}: "${titulo}". Palavras detectadas: ${result.motivos.slice(0, 3).join(', ')}.`;
      tipoNotificacao   = 'denuncia_urgente';
    }

  } else if (tipo_postagem === 'comunicado') {
    const result = calcularPrioridadeComunicado({ titulo: titulo || '', descricao: descricao || '' });
    prioridade       = result.prioridade;
    prioridade_score = result.score;

    // Notifica a própria ONG autora se o comunicado for urgente/alta
    if ((prioridade === 'urgente' || prioridade === 'alta') && ong_id) {
      const emoji = prioridade === 'urgente' ? '📢' : '🔔';
      const label = prioridade === 'urgente' ? 'URGENTE' : 'IMPORTANTE';
      motivoNotificacao = `${emoji} Comunicado ${label}: "${titulo}". Motivo detectado: ${result.motivos.slice(0, 2).join(', ')}.`;
      tipoNotificacao   = 'comunicado_urgente';
    }

  } else if (tipo_postagem === 'adocao') {
    const result = calcularPrioridadeAdocao({ idade });
    prioridade = result.prioridade;

  } else if (tipo_postagem === 'doacao') {
    const result = verificarDoacaoRelevante({ valor: valor_doacao });
    prioridade = result.relevante ? 'relevante' : 'normal';

    if (result.relevante && ong_id) {
      motivoNotificacao = `💰 Doação relevante recebida: R$ ${result.valor.toFixed(2).replace('.', ',')} — acima de R$ ${result.limite},00.`;
      tipoNotificacao   = 'doacao_relevante';
    }
  }
  // ────────────────────────────────────────────────────────────

  const campoFixado    = (fixado === 'true' || fixado === '1' || fixado === 1) ? 1 : 0;
  const ongDestino     = ong_id ? parseInt(ong_id) : null;
  const valorDoacaoNum = valor_doacao ? parseFloat(String(valor_doacao).replace(',', '.')) : null;

  let nomesDasFotos = [];
  if (req.files && req.files.length > 0) {
    nomesDasFotos = req.files.map(file => file.filename);
  }
  const fotosJsonString = JSON.stringify(nomesDasFotos);

  const sql = `
    INSERT INTO postagens 
    (tipo_postagem, prioridade, prioridade_score, titulo, descricao, localizacao,
     raca, genero, idade, foto, usuarios_id, fixado, ong_destino_id, valor_doacao) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    tipo_postagem, prioridade, prioridade_score,
    titulo, descricao, localizacao || null,
    raca || null, genero || null, idade || null,
    fotosJsonString, usuarios_id, campoFixado,
    ongDestino, valorDoacaoNum,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Erro ao inserir postagem:', err);
      return res.status(500).json({ erro: 'Erro ao salvar postagem.' });
    }

    const postagem_id = result.insertId;

    if (motivoNotificacao && ongDestino && tipoNotificacao) {
      criarNotificacao({
        ong_id: ongDestino,
        postagem_id,
        tipo: tipoNotificacao,
        mensagem: motivoNotificacao,
      }).catch(e => console.error('Falha ao salvar notificação:', e));
    }

    return res.status(201).json({
      mensagem: 'Postagem criada com sucesso!',
      id: postagem_id,
      prioridade,
      prioridade_score,
    });
  });
};

// =============================================================
// POST /api/postagens/recalcular-prioridades
// =============================================================
exports.recalcularPrioridades = async (req, res) => {
  try {
    const rows = await dbQuery(
      'SELECT id, tipo_postagem, titulo, descricao, idade FROM postagens',
      []
    );

    let atualizadas = 0;

    for (const post of rows) {
      let prioridade = 'normal';
      let score      = 0;

      if (post.tipo_postagem === 'denuncia') {
        const r = calcularPrioridadeDenuncia({
          titulo:    post.titulo    || '',
          descricao: post.descricao || '',
        });
        prioridade = r.prioridade;
        score      = r.score;

      } else if (post.tipo_postagem === 'comunicado') {
        const r = calcularPrioridadeComunicado({
          titulo:    post.titulo    || '',
          descricao: post.descricao || '',
        });
        prioridade = r.prioridade;
        score      = r.score;

      } else if (post.tipo_postagem === 'adocao') {
        const r = calcularPrioridadeAdocao({ idade: post.idade });
        prioridade = r.prioridade;
      }

      await dbQuery(
        'UPDATE postagens SET prioridade = ?, prioridade_score = ? WHERE id = ?',
        [prioridade, score, post.id]
      );

      atualizadas++;
    }

    return res.json({
      mensagem: `✅ ${atualizadas} postagens recalculadas com sucesso.`,
    });

  } catch (err) {
    console.error('Erro ao recalcular prioridades:', err);
    return res.status(500).json({ erro: 'Erro ao recalcular prioridades.' });
  }
};

// =============================================================
// PUT /api/postperfil/:id
// =============================================================
exports.atualizarPostagem = (req, res) => {
  const postId    = req.params.id;
  const usuarioId = req.usuarioId;

  const { tipo_postagem, titulo, descricao, raca, genero, localizacao, idade, fotosMantidas } = req.body;

  let fotosFinais = [];
  if (fotosMantidas) {
    try { fotosFinais = JSON.parse(fotosMantidas); } catch (e) { fotosFinais = []; }
  }
  if (req.files && req.files.length > 0) {
    fotosFinais = [...fotosFinais, ...req.files.map(f => f.filename)];
  }

  let prioridade       = 'normal';
  let prioridade_score = 0;

  if (tipo_postagem === 'denuncia') {
    const r = calcularPrioridadeDenuncia({ titulo: titulo || '', descricao: descricao || '' });
    prioridade       = r.prioridade;
    prioridade_score = r.score;
  } else if (tipo_postagem === 'comunicado') {
    const r = calcularPrioridadeComunicado({ titulo: titulo || '', descricao: descricao || '' });
    prioridade       = r.prioridade;
    prioridade_score = r.score;
  } else if (tipo_postagem === 'adocao') {
    const r = calcularPrioridadeAdocao({ idade });
    prioridade = r.prioridade;
  }

  const query = `
    UPDATE postagens 
    SET tipo_postagem = ?, titulo = ?, descricao = ?, raca = ?, genero = ?,
        localizacao = ?, idade = ?, foto = ?, prioridade = ?, prioridade_score = ?
    WHERE id = ? AND usuarios_id = ?
  `;

  db.query(
    query,
    [tipo_postagem, titulo, descricao, raca, genero, localizacao, idade,
     JSON.stringify(fotosFinais), prioridade, prioridade_score, postId, usuarioId],
    (err, result) => {
      if (err) {
        console.error('Erro ao atualizar postagem:', err);
        return res.status(500).json({ erro: 'Erro ao atualizar postagem.' });
      }
      if (result.affectedRows === 0) {
        return res.status(403).json({ erro: 'Postagem não encontrada ou sem permissão.' });
      }
      res.json({ mensagem: 'Postagem atualizada com sucesso!', prioridade, prioridade_score });
    }
  );
};

// =============================================================
// DELETE /api/postagensDelete/:id
// =============================================================
exports.deletarPostagem = (req, res) => {
  const postId     = req.params.id;
  const usuarioId  = req.usuarioId;
  const nivelAdmin = req.usuarioAdmin;

  if (!usuarioId) {
    return res.status(403).json({ erro: 'Usuário não autenticado.' });
  }

  db.query('SELECT foto, usuarios_id FROM postagens WHERE id = ?', [postId], (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar postagem.' });
    if (results.length === 0) return res.status(404).json({ erro: 'Postagem não encontrada.' });

    const postagem = results[0];

    if (postagem.usuarios_id !== usuarioId && nivelAdmin !== 1) {
      return res.status(403).json({ erro: 'Sem permissão.' });
    }

    if (postagem.foto) {
      try {
        JSON.parse(postagem.foto).forEach(nomeFoto => {
          const caminho = path.join(__dirname, '..', 'uploads', nomeFoto);
          if (fs.existsSync(caminho)) fs.unlinkSync(caminho);
        });
      } catch (e) {}
    }

    db.query('DELETE FROM postagens WHERE id = ?', [postId], (errDelete) => {
      if (errDelete) return res.status(500).json({ erro: 'Erro ao deletar.' });
      return res.status(200).json({ mensagem: 'Postagem deletada com sucesso!' });
    });
  });
};

// =============================================================
// GET /api/postagens/tipo/:tipo
// =============================================================
exports.listarPorTipo = (req, res) => {
  const tipo = req.params.tipo;

  const query = `
    SELECT 
      p.*,
      u.nome        AS usuario_nome,
      u.foto_perfil AS usuario_foto,
      u.admin       AS usuario_admin,
      o.id          AS ong_id,
      o.nome        AS ong_nome,
      o.foto_perfil AS ong_foto
    FROM postagens p
    INNER JOIN usuarios u ON p.usuarios_id = u.id
    LEFT JOIN usuarios o ON p.ong_destino_id = o.id
    WHERE p.tipo_postagem = ?
    ORDER BY
      p.fixado DESC,
      CASE p.prioridade
        WHEN 'urgente'     THEN 1
        WHEN 'alta'        THEN 2
        WHEN 'prioritario' THEN 3
        WHEN 'relevante'   THEN 4
        ELSE                    5
      END ASC,
      p.prioridade_score DESC,
      p.data_criacao DESC
  `;

  db.query(query, [tipo], (err, results) => {
    if (err) {
      console.error('Erro ao listar postagens:', err);
      return res.status(500).json({ erro: 'Erro ao buscar postagens.' });
    }
    res.json(results);
  });
};

// =============================================================
// GET /api/postagens/usuario/:id
// =============================================================
exports.listarPorUsuario = (req, res) => {
  const usuarioId = req.params.id;
  db.query(
    'SELECT * FROM postagens WHERE usuarios_id = ? ORDER BY id DESC',
    [usuarioId],
    (err, results) => {
      if (err) return res.status(500).json({ erro: 'Erro ao buscar postagens.' });
      res.status(200).json(results);
    }
  );
};

// =============================================================
// GET /api/postperfil
// =============================================================
exports.PostagensPerfil = (req, res) => {
  const usuarioId = req.usuarioId;

  db.query(
    `SELECT p.*, u.nome AS usuario_nome, u.foto_perfil AS usuario_foto, u.admin AS usuario_admin
     FROM postagens p
     INNER JOIN usuarios u ON p.usuarios_id = u.id
     WHERE p.usuarios_id = ?
     ORDER BY p.data_criacao DESC`,
    [usuarioId],
    (err, results) => {
      if (err) return res.status(500).json({ erro: 'Erro ao buscar postagens.' });
      res.status(200).json(results);
    }
  );
};

// =============================================================
// GET /api/postagens/:id
// =============================================================
exports.buscarPorId = (req, res) => {
  db.query('SELECT * FROM postagens WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar postagem.' });
    if (results.length === 0) return res.status(404).json({ erro: 'Postagem não encontrada.' });
    res.status(200).json(results[0]);
  });
};

// =============================================================
// GET /api/postagens/direcionadas/:ong_id
// =============================================================
exports.listarDenunciasDirecionadas = (req, res) => {
  const ong_id = req.params.ong_id;

  const sql = `
    SELECT 
      p.*,
      u.nome        AS nome_autor,
      u.foto_perfil AS foto_autor
    FROM postagens p
    JOIN usuarios u ON p.usuarios_id = u.id
    WHERE p.tipo_postagem = 'denuncia'
      AND p.ong_destino_id = ?
    ORDER BY
      CASE p.prioridade
        WHEN 'urgente' THEN 1
        WHEN 'alta'    THEN 2
        ELSE                3
      END ASC,
      p.prioridade_score DESC,
      p.data_criacao DESC
  `;

  db.query(sql, [ong_id], (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar denúncias.' });
    return res.status(200).json(results);
  });
};