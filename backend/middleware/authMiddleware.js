const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }

  const token = header.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ erro: 'Token inválido.' });
    }

    // Passamos o ID do usuário para as próximas funções
    req.usuarioId = decoded.id;

    // 🟢 CORREÇÃO: Passamos também o nível de admin para as próximas funções
    req.usuarioAdmin = decoded.admin;

    next();
  });
}

module.exports = autenticar;