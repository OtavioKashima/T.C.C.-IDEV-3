const express = require('express');
const router = express.Router();
const postagemController = require('../controllers/postagemController');
const autenticar = require('../middleware/authMiddleware');
const upload = require('../middleware/configMulter');

router.post('/postagens', autenticar, upload.array('fotos', 10), postagemController.criarPostagem);

router.put('/postperfil/:id', autenticar, upload.array('foto', 10), postagemController.atualizarPostagem);

router.delete('/postagensDelete/:id', autenticar, postagemController.deletarPostagem);

router.get('/postagens/tipo/:tipo', postagemController.listarPorTipo);

router.get('/postagens/usuario/:id', postagemController.listarPorUsuario);

router.get('/postperfil', autenticar, postagemController.PostagensPerfil);

router.get('/postagens/direcionadas/:ong_id', postagemController.listarDenunciasDirecionadas);

// Adicione essa linha junto com os outros router.get
router.get('/postagens/:id', postagemController.buscarPorId);

module.exports = router;