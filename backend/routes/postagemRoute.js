// =============================================================
// routes/postagemRoute.js
// =============================================================

const express            = require('express');
const router             = express.Router();
const postagemController = require('../controllers/postagemController');
const autenticar         = require('../middleware/authMiddleware');
const upload             = require('../middleware/configMulter');

// Cria postagem
router.post('/postagens', autenticar, upload.array('fotos', 10), postagemController.criarPostagem);

// Recalcula prioridades de TODAS as postagens (rode uma vez)
router.post('/postagens/recalcular-prioridades', autenticar, postagemController.recalcularPrioridades);

// Atualiza postagem
router.put('/postperfil/:id', autenticar, upload.array('foto', 10), postagemController.atualizarPostagem);

// Deleta postagem
router.delete('/postagensDelete/:id', autenticar, postagemController.deletarPostagem);

// Lista por tipo (denuncia, adocao, comunicado, doacao)
router.get('/postagens/tipo/:tipo', postagemController.listarPorTipo);

// Lista por usuário
router.get('/postagens/usuario/:id', postagemController.listarPorUsuario);

// Postagens do perfil logado
router.get('/postperfil', autenticar, postagemController.PostagensPerfil);

// Denúncias direcionadas para uma ONG
router.get('/postagens/direcionadas/:ong_id', postagemController.listarDenunciasDirecionadas);

// Busca por ID (deve ficar por último para não conflitar com as rotas acima)
router.get('/postagens/:id', autenticar, postagemController.buscarPorId);

module.exports = router;