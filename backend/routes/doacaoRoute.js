// =============================================================
// routes/doacaoRoute.js
// =============================================================

const express    = require('express');
const router     = express.Router();
const doacaoCtrl = require('../controllers/doacaoController');
const autenticar = require('../middleware/authMiddleware');

// Registra doação + retorna chave PIX da ONG
router.post('/doacoes/registrar', autenticar, doacaoCtrl.registrar);

// Retorna apenas a chave PIX de uma ONG
router.get('/doacoes/ong/:ong_id/chave-pix', autenticar, doacaoCtrl.chavePix);

// Histórico de doações do usuário logado
router.get('/doacoes/historico', autenticar, doacaoCtrl.historico);

// Doações recebidas por uma ONG (só a própria ONG acessa)
router.get('/doacoes/ong/:ong_id', autenticar, doacaoCtrl.doacoesOng);

module.exports = router;