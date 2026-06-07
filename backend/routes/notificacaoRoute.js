// =============================================================
// routes/notificacaoRoute.js
// Rotas de notificações automáticas para ONGs
// =============================================================

const express = require('express');
const router  = express.Router();
const notificacaoController = require('../controllers/notificacaoController');
const autenticar = require('../middleware/authMiddleware');

// Todas as rotas abaixo exigem que o usuário esteja autenticado
// e, na prática, só fazem sentido para usuários com admin = 2 (ONG).
// A validação de nível pode ser adicionada via middleware extra se desejar.

// Lista notificações da ONG logada
// GET /api/notificacoes
// GET /api/notificacoes?apenas_nao_lidas=true
router.get('/notificacoes', autenticar, notificacaoController.listarNotificacoes);

// Retorna o total de notificações não lidas (badge no app)
// GET /api/notificacoes/contagem
router.get('/notificacoes/contagem', autenticar, notificacaoController.contarNaoLidas);

// Marca uma notificação específica como lida
// PATCH /api/notificacoes/:id/lida
router.patch('/notificacoes/:id/lida', autenticar, notificacaoController.marcarComoLida);

// Marca TODAS as notificações da ONG como lidas
// PATCH /api/notificacoes/marcar-todas-lidas
router.patch('/notificacoes/marcar-todas-lidas', autenticar, notificacaoController.marcarTodasComoLidas);

module.exports = router;