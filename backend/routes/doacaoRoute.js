// =============================================================
// routes/doacaoRoute.js
// =============================================================

const express       = require('express');
const router        = express.Router();
const doacaoCtrl    = require('../controllers/doacaoController');
const autenticar    = require('../middleware/authMiddleware');

// Cria cobrança PIX — usuário logado
router.post('/doacoes/criar-pix', autenticar, doacaoCtrl.criarPix);

// Webhook do Mercado Pago — PÚBLICA (sem autenticar)
// ⚠️  Registre exatamente essa URL no painel do Mercado Pago
router.post('/doacoes/webhook', doacaoCtrl.webhook);

// Polling de status pelo app
router.get('/doacoes/status/:mp_payment_id', autenticar, doacaoCtrl.verificarStatus);

// Histórico de doações do usuário logado
router.get('/doacoes/historico', autenticar, doacaoCtrl.historico);

// Doações recebidas por uma ONG
router.get('/doacoes/ong/:ong_id', autenticar, doacaoCtrl.doacoesOng);

module.exports = router;