const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;

exports.perfil = (req, res) => {
  const usuarioId = req.usuarioId;

  // 🟢 CORREÇÃO: Adicionado a coluna 'admin' no SELECT para o seu próprio perfil
  const query = 'SELECT id, nome, telefone, foto_perfil, admin, bio, cidade, estado, chave_pix FROM usuarios WHERE id = ?';

  db.query(query, [usuarioId], (err, results) => {
    if (err) {
      console.error("Erro ao buscar perfil:", err);
      return res.status(500).json({ erro: 'Erro interno ao buscar dados do usuário.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    res.status(200).json(results[0]);
  });
};

exports.cadastrar = async (req, res) => {
  const { nome, cpf, email, telefone, senha } = req.body;

  if (!nome || !cpf || !senha) {
    return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
  }

  db.query(
    'SELECT id FROM usuarios WHERE cpf = ? OR email = ? OR telefone = ?',
    [cpf, email, telefone],
    async (err, rows) => {

      if (rows.length > 0) {
        return res.status(409).json({ erro: 'Usuário já cadastrado' });
      }

      const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

      // 💡 Nota: O cadastro padrão insere o usuário como '0' (comum) automaticamente pelo banco de dados.
      db.query(
        'INSERT INTO usuarios (nome,cpf,email,telefone,senha) VALUES (?,?,?,?,?)',
        [nome, cpf, email, telefone, senhaHash],
        (err, result) => {
          if (err) {
            return res.status(500).json({ erro: 'Erro ao cadastrar' });
          }

          res.status(201).json({
            mensagem: 'Usuário cadastrado',
            id: result.insertId
          });
        }
      );
    }
  );
};

exports.login = (req, res) => {
  const { identificador, senha } = req.body;

  console.log('--- NOVA TENTATIVA DE LOGIN ---');
  console.log('Identificador recebido do App:', identificador);

  const apenasNumeros = identificador.replace(/\D/g, '');
  let cpfFormatado = identificador;

  if (apenasNumeros.length === 11) {
    cpfFormatado = apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    console.log('Formato CPF Detectado! Buscando também por:', cpfFormatado);
  }

  db.query(
    'SELECT * FROM usuarios WHERE cpf = ? OR cpf = ? OR cpf = ? OR email = ? OR telefone = ?',
    [identificador, apenasNumeros, cpfFormatado, identificador, identificador],
    async (err, rows) => {
      if (err) {
        console.error('Erro no Banco de Dados:', err);
        return res.status(500).json({ erro: 'Erro interno no servidor' });
      }

      console.log('Usuários encontrados com esse identificador:', rows.length);

      if (rows.length === 0) {
        console.log('Resultado: 401 - Usuário não encontrado no banco.');
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      const usuario = rows[0];
      console.log('Usuário encontrado:', usuario.email, '| Nível de Acesso:', usuario.admin);

      const match = await bcrypt.compare(senha, usuario.senha);

      if (!match) {
        console.log('Resultado: 401 - Senha incorreta.');
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      // 🟢 CORREÇÃO: Removida a lógica antiga de tipo_usuario. 
      // Agora salvamos o nível (0, 1 ou 2) direto no token JWT!
      const token = jwt.sign(
        {
          id: usuario.id,
          admin: usuario.admin // Ajuda a identificar privilégios no frontend/backend mais tarde
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // 🟢 CORREÇÃO PRINCIPAL: Agora o backend devolve o token E o nível de admin
      // para que o seu frontend consiga salvar no LocalStorage!
      res.json({
        token: token,
        admin: usuario.admin
      });
    }
  );
};

exports.atualizar = (req, res) => {
  const usuarioId = req.usuarioId;

  // 1. Extraímos os novos campos do corpo da requisição
  const { nome, telefone, bio, cidade, estado, chave_pix } = req.body;

  // 2. Garantia de segurança: Se não for ONG, esses campos chegam como 'undefined'. 
  // O MySQL exige que sejam convertidos para 'null' para não travar a query.
  const safeBio = bio !== undefined ? bio : null;
  const safeCidade = cidade !== undefined ? cidade : null;
  const safeEstado = estado !== undefined ? estado : null;
  const safeChavePix = chave_pix !== undefined ? chave_pix : null;

  if (req.file) {
    const nomeArquivoNovo = req.file.filename;
    console.log("Nova foto detectada e salva como:", nomeArquivoNovo);

    // 3. Query atualizada com as novas colunas
    const query = `
      UPDATE usuarios 
      SET nome = ?, telefone = ?, bio = ?, cidade = ?, estado = ?, chave_pix = ?, foto_perfil = ? 
      WHERE id = ?
    `;

    db.query(query, [nome, telefone, safeBio, safeCidade, safeEstado, safeChavePix, nomeArquivoNovo, usuarioId], (err, results) => {
      if (err) {
        console.error("Erro SQL ao atualizar com foto:", err);
        return res.status(500).json({ erro: 'Erro interno ao atualizar perfil com foto.' });
      }

      console.log("Banco de dados atualizado com sucesso (Dados + Foto).");
      return res.status(200).json({
        message: "Banco de dados atualizado com sucesso (Dados + Foto).",
        foto_perfil: nomeArquivoNovo
      });
    });

  } else {
    console.log("Nenhuma foto nova enviada. Atualizando apenas textos...");

    // 4. Query atualizada com as novas colunas (sem a foto)
    const query = `
      UPDATE usuarios 
      SET nome = ?, telefone = ?, bio = ?, cidade = ?, estado = ?, chave_pix = ? 
      WHERE id = ?
    `;

    db.query(query, [nome, telefone, safeBio, safeCidade, safeEstado, safeChavePix, usuarioId], (err, results) => {
      if (err) {
        console.error("Erro SQL ao atualizar textos:", err);
        return res.status(500).json({ erro: 'Erro interno ao atualizar perfil.' });
      }

      console.log("Banco de dados atualizado com sucesso (Apenas textos).");
      res.status(200).json({ mensagem: 'Dados atualizados com sucesso!' });
    });
  }
};

exports.deletar = (req, res) => {
  const usuarioId = req.usuarioId;
  const query = 'DELETE FROM usuarios WHERE id = ?';

  db.query(query, [usuarioId], (err, result) => {
    if (err) {
      console.error("Erro ao deletar:", err);
      return res.status(500).json({ erro: 'Erro ao deletar a conta.' });
    }
    res.json({ mensagem: 'Conta deletada com sucesso!' });
  });
};

exports.buscarPorId = (req, res) => {
  const usuarioId = req.params.id;

  // 🟢 CORREÇÃO: Adicionado a coluna 'admin' no SELECT para a tela de Perfil Público
  const query = 'SELECT id, nome, foto_perfil, cidade, estado, bio, chave_pix, admin FROM usuarios WHERE id = ?';

  db.query(query, [usuarioId], (err, results) => {
    if (err) {
      console.error("Erro ao buscar usuário por ID:", err);
      return res.status(500).json({ erro: 'Erro interno ao buscar dados do usuário.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    res.status(200).json(results[0]);
  });
};

exports.listarOngs = (req, res) => {
  // admin = 2 é o padrão para ONGs no seu sistema
  const query = 'SELECT id, nome, foto_perfil, bio, cidade, estado, chave_pix FROM usuarios WHERE admin = 2';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar ONGs:", err);
      return res.status(500).json({ erro: 'Erro interno ao buscar ONGs.' });
    }
    res.status(200).json(results);
  });
};