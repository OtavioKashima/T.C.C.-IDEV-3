const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const autenticar = require('../middleware/authMiddleware');
const upload = require('../middleware/configMulter');

router.post('/usuarios', upload.single('foto_perfil'), usuarioController.cadastrar);

router.post('/login', usuarioController.login);

router.put('/perfiledit', autenticar, upload.single('foto'), usuarioController.atualizar);

router.delete('/perfildelete', autenticar, usuarioController.deletar);

router.get('/perfil', autenticar, usuarioController.perfil);

router.get('/usuarios/:id', usuarioController.buscarPorId);

router.get('/ongs', usuarioController.listarOngs);

router.get('/perfil', autenticar, (req, res) => {
  res.json({
    mensagem: "Rota protegida funcionando",
    usuario: req.usuarioId
  })
});

module.exports = router;