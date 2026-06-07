const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;

// =============================================================
// GET /api/perfil
// =============================================================
exports.perfil = (req, res) => {
  const usuarioId = req.usuarioId;

  db.query(
    'SELECT id, nome, telefone, foto_perfil, admin, bio, cidade, estado, chave_pix, email FROM usuarios WHERE id = ?',
    [usuarioId],
    (err, results) => {
      if (err) return res.status(500).json({ erro: 'Erro ao buscar perfil.' });
      if (results.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });
      res.status(200).json(results[0]);
    }
  );
};

// =============================================================
// POST /api/usuarios  (cadastro)
// =============================================================
exports.cadastrar = async (req, res) => {
  const { nome, cpf, email, telefone, senha } = req.body;

  if (!nome || !cpf || !senha) {
    return res.status(400).json({ erro: 'Campos obrigatórios faltando.' });
  }

  db.query(
    'SELECT id FROM usuarios WHERE cpf = ? OR email = ? OR telefone = ?',
    [cpf, email, telefone],
    async (err, rows) => {
      if (err) return res.status(500).json({ erro: 'Erro ao verificar cadastro.' });

      if (rows.length > 0) {
        return res.status(409).json({ erro: 'Usuário já cadastrado.' });
      }

      const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

      db.query(
        'INSERT INTO usuarios (nome, cpf, email, telefone, senha) VALUES (?, ?, ?, ?, ?)',
        [nome, cpf, email, telefone, senhaHash],
        (err, result) => {
          if (err) return res.status(500).json({ erro: 'Erro ao cadastrar.' });
          res.status(201).json({ mensagem: 'Usuário cadastrado', id: result.insertId });
        }
      );
    }
  );
};

// =============================================================
// POST /api/login
// =============================================================
exports.login = (req, res) => {
  const { identificador, senha } = req.body;

  console.log('--- NOVA TENTATIVA DE LOGIN ---');
  console.log('Identificador:', identificador);

  const apenasNumeros = identificador.replace(/\D/g, '');
  let cpfFormatado = identificador;

  if (apenasNumeros.length === 11) {
    cpfFormatado = apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  db.query(
    'SELECT * FROM usuarios WHERE cpf = ? OR cpf = ? OR cpf = ? OR email = ? OR telefone = ?',
    [identificador, apenasNumeros, cpfFormatado, identificador, identificador],
    async (err, rows) => {
      if (err) return res.status(500).json({ erro: 'Erro interno no servidor.' });

      if (rows.length === 0) {
        return res.status(401).json({ erro: 'Credenciais inválidas.' });
      }

      const usuario = rows[0];
      console.log('Usuário encontrado:', usuario.email, '| Admin:', usuario.admin);

      const match = await bcrypt.compare(senha, usuario.senha);
      if (!match) {
        return res.status(401).json({ erro: 'Credenciais inválidas.' });
      }

      const token = jwt.sign(
        { id: usuario.id, admin: usuario.admin },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // ← Devolve token, admin, email e id para o frontend salvar no localStorage
      res.json({
        token:  token,
        admin:  usuario.admin,
        email:  usuario.email,
        id:     usuario.id,
        nome:   usuario.nome,
      });
    }
  );
};

// =============================================================
// PUT /api/perfiledit
// =============================================================
exports.atualizar = (req, res) => {
  const usuarioId = req.usuarioId;
  const { nome, telefone, bio, cidade, estado, chave_pix } = req.body;

  const safeBio      = bio       !== undefined ? bio       : null;
  const safeCidade   = cidade    !== undefined ? cidade    : null;
  const safeEstado   = estado    !== undefined ? estado    : null;
  const safeChavePix = chave_pix !== undefined ? chave_pix : null;

  if (req.file) {
    const nomeArquivoNovo = req.file.filename;

    db.query(
      'UPDATE usuarios SET nome=?, telefone=?, bio=?, cidade=?, estado=?, chave_pix=?, foto_perfil=? WHERE id=?',
      [nome, telefone, safeBio, safeCidade, safeEstado, safeChavePix, nomeArquivoNovo, usuarioId],
      (err) => {
        if (err) return res.status(500).json({ erro: 'Erro ao atualizar perfil.' });
        res.status(200).json({ message: 'Perfil atualizado com sucesso.', foto_perfil: nomeArquivoNovo });
      }
    );
  } else {
    db.query(
      'UPDATE usuarios SET nome=?, telefone=?, bio=?, cidade=?, estado=?, chave_pix=? WHERE id=?',
      [nome, telefone, safeBio, safeCidade, safeEstado, safeChavePix, usuarioId],
      (err) => {
        if (err) return res.status(500).json({ erro: 'Erro ao atualizar perfil.' });
        res.status(200).json({ mensagem: 'Dados atualizados com sucesso!' });
      }
    );
  }
};

// =============================================================
// DELETE /api/perfildelete
// =============================================================
exports.deletar = (req, res) => {
  db.query('DELETE FROM usuarios WHERE id = ?', [req.usuarioId], (err) => {
    if (err) return res.status(500).json({ erro: 'Erro ao deletar a conta.' });
    res.json({ mensagem: 'Conta deletada com sucesso!' });
  });
};

// =============================================================
// GET /api/usuarios/:id
// =============================================================
exports.buscarPorId = (req, res) => {
  db.query(
    'SELECT id, nome, foto_perfil, cidade, estado, bio, chave_pix, admin FROM usuarios WHERE id = ?',
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ erro: 'Erro ao buscar usuário.' });
      if (results.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });
      res.status(200).json(results[0]);
    }
  );
};

// =============================================================
// GET /api/ongs
// =============================================================
exports.listarOngs = (req, res) => {
  db.query(
    'SELECT id, nome, foto_perfil, bio, cidade, estado, chave_pix FROM usuarios WHERE admin = 2',
    (err, results) => {
      if (err) return res.status(500).json({ erro: 'Erro ao buscar ONGs.' });
      res.status(200).json(results);
    }
  );
};