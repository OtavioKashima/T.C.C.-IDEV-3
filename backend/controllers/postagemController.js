const db = require('../config/db');
const fs = require('fs');
const path = require('path');


exports.criarPostagem = (req, res) => {
  // 🟢 1. Adicionado o 'ong_id' aqui no req.body
  const { tipo_postagem, titulo, descricao, localizacao, raca, genero, idade, fixado, ong_id } = req.body;

  // 🚨 PEGANDO O ID DO USUÁRIO LOGADO
  const usuarios_id = req.usuarioId;

  // Trava de segurança: se não achar o usuário, cancela a postagem
  if (!usuarios_id) {
    return res.status(401).json({ erro: 'Usuário não autenticado ou ID não encontrado no token.' });
  }

  // 🟢 2. Tratando o campo fixado
  const campoFixado = (fixado === 'true' || fixado === '1' || fixado === 1) ? 1 : 0;

  // 🟢 3. Tratando o ong_id (se vier vazio ou undefined, salva como null no banco)
  const ongDestino = ong_id ? parseInt(ong_id) : null;

  // Lógica das fotos
  let nomesDasFotos = [];
  if (req.files && req.files.length > 0) {
    nomesDasFotos = req.files.map(file => file.filename);
  }
  const fotosJsonString = JSON.stringify(nomesDasFotos);

  // 🟢 4. Atualizando o SQL para incluir a nova coluna 'ong_destino_id' (agora são 11 interrogações)
  const sql = `
    INSERT INTO postagens 
    (tipo_postagem, titulo, descricao, localizacao, raca, genero, idade, foto, usuarios_id, fixado, ong_destino_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // 🟢 5. Adicionando a variável ongDestino na lista de valores
  const values = [
    tipo_postagem,
    titulo,
    descricao,
    localizacao || null,
    raca || null,
    genero || null,
    idade || null,
    fotosJsonString,
    usuarios_id, // O ID do usuário dono da postagem
    campoFixado, // O valor do destaque
    ongDestino   // 👈 O ID da ONG vai aqui no final!
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Erro ao inserir no banco:', err);
      return res.status(500).json({ erro: 'Erro ao salvar postagem no banco de dados' });
    }

    return res.status(201).json({
      mensagem: 'Postagem criada com sucesso!',
      id: result.insertId
    });
  });
};

exports.atualizarPostagem = (req, res) => {
  const postId = req.params.id;
  const usuarioId = req.usuarioId; // Pego pelo seu Middleware de Autenticação

  // 📥 Recebe os campos de texto + a lista de fotos mantidas do Ionic
  const { tipo_postagem, titulo, descricao, raca, genero, localizacao, idade, fotosMantidas } = req.body;

  // 🖼️ 1. PROCESSAR AS FOTOS MANTIDAS
  let fotosFinais = [];
  if (fotosMantidas) {
    try {
      // O Ionic mandou como string texto. Aqui transformamos de volta em um Array do JavaScript
      fotosFinais = JSON.parse(fotosMantidas);
    } catch (e) {
      fotosFinais = [];
    }
  }

  // 🖼️ 2. JUNTAR AS NOVAS FOTOS DO MULTER (req.files)
  // Como usamos upload.array(), os novos arquivos vêm mapeados dentro de req.files
  if (req.files && req.files.length > 0) {
    const nomesNovasFotos = req.files.map(file => file.filename);
    fotosFinais = [...fotosFinais, ...nomesNovasFotos]; // Une o array das antigas com o das novas
  }

  // 🖼️ 3. CONVERTER PARA TEXTO (Pronto para salvar no Banco de Dados)
  const fotoStringBanco = JSON.stringify(fotosFinais);

  // 🔴 QUERY ATUALIZADA: Agora alterando a coluna 'foto' também!
  const query = `
    UPDATE postagens 
    SET tipo_postagem = ?, titulo = ?, descricao = ?, raca = ?, genero = ?, localizacao = ?, idade = ?, foto = ?
    WHERE id = ? AND usuarios_id = ?
  `;

  db.query(
    query,
    [tipo_postagem, titulo, descricao, raca, genero, localizacao, idade, fotoStringBanco, postId, usuarioId],
    (err, result) => {
      if (err) {
        console.error("Erro ao atualizar postagem:", err);
        return res.status(500).json({ erro: 'Erro interno ao atualizar postagem.' });
      }

      if (result.affectedRows === 0) {
        return res.status(403).json({ erro: 'Postagem não encontrada ou você não tem permissão.' });
      }

      res.json({ mensagem: 'Postagem atualizada com sucesso!' });
    }
  );
};

exports.deletarPostagem = (req, res) => {
  const postId = req.params.id;
  const usuarioId = req.usuarioId;

  // 🟢 1. Pegando o nível de acesso que veio do middleware
  const nivelAdmin = req.usuarioAdmin;

  if (!usuarioId) {
    return res.status(403).json({ erro: 'Sem permissão. Usuário não autenticado.' });
  }

  // 🟢 2. PRIMEIRO: Buscar a postagem (Removido o "AND usuarios_id = ?" para permitir que o admin também encontre a postagem)
  // Adicionamos a coluna "usuarios_id" no SELECT para fazer a verificação no passo seguinte
  const sqlSelect = 'SELECT foto, usuarios_id FROM postagens WHERE id = ?';

  db.query(sqlSelect, [postId], (err, results) => {
    if (err) {
      console.error("Erro ao buscar postagem para deletar:", err);
      return res.status(500).json({ erro: 'Erro interno ao buscar a postagem.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ erro: 'Postagem não encontrada.' });
    }

    const postagem = results[0];

    // 🟢 3. TRAVA DE SEGURANÇA JAVASCRIPT: Só continua se for o dono DAQUELA postagem OU for Admin Geral (1)
    if (postagem.usuarios_id !== usuarioId && nivelAdmin !== 1) {
      return res.status(403).json({ erro: 'Sem permissão. Você não é o dono desta postagem nem administrador.' });
    }

    // 4. SEGUNDO: Apagar as fotos da pasta uploads fisicamente
    if (postagem.foto) {
      try {
        const fotosArray = JSON.parse(postagem.foto);

        fotosArray.forEach((nomeFoto) => {
          const caminhoFoto = path.join(__dirname, '..', 'uploads', nomeFoto);

          if (fs.existsSync(caminhoFoto)) {
            fs.unlinkSync(caminhoFoto);
          }
        });
      } catch (e) {
        console.error("Erro ao tentar ler ou apagar fotos da pasta:", e);
      }
    }

    // 5. TERCEIRO: Deletar do banco de dados 
    const sqlDelete = 'DELETE FROM postagens WHERE id = ?';

    db.query(sqlDelete, [postId], (errDelete, resultDelete) => {
      if (errDelete) {
        console.error("Erro ao deletar postagem no banco:", errDelete);
        return res.status(500).json({ erro: 'Erro interno ao deletar do banco de dados.' });
      }

      return res.status(200).json({ mensagem: 'Postagem e imagens deletadas com sucesso!' });
    });
  });
};

exports.listarPorTipo = (req, res) => {
  const tipo = req.params.tipo;

  // 🟢 AJUSTE: Mudamos para INNER JOIN para trazer os dados de quem criou a postagem junto com o pet
  const query = `
    SELECT p.*, u.nome AS usuario_nome, u.foto_perfil AS usuario_foto, u.admin AS usuario_admin
FROM postagens p 
    INNER JOIN usuarios u ON p.usuarios_id = u.id 
    WHERE p.tipo_postagem = ? 
    ORDER BY p.data_criacao DESC
  `;

  db.query(query, [tipo], (err, results) => {
    if (err) {
      console.error("Erro ao listar postagens por tipo:", err);
      return res.status(500).json({ erro: 'Erro interno ao buscar postagens.' });
    }
    res.json(results);
  });
};

exports.listarPorUsuario = (req, res) => {
  const usuarioId = req.params.id;
  const query = 'SELECT * FROM postagens WHERE usuarios_id = ? ORDER BY id DESC';

  db.query(query, [usuarioId], (err, results) => {
    if (err) {
      console.error("Erro ao buscar postagens do usuário:", err);
      return res.status(500).json({ erro: 'Erro interno ao buscar postagens.' });
    }
    res.status(200).json(results);
  });
};

exports.PostagensPerfil = (req, res) => {
  // Como a rota usa o middleware 'autenticar', o ID do usuário logado geralmente fica em req.usuario.id (ou req.user.id, dependendo do seu middleware)
  const usuarioId = req.usuarioId;

  const query = `
    SELECT p.*, u.nome AS usuario_nome, u.foto_perfil AS usuario_foto, u.admin AS usuario_admin
FROM postagens p 
    INNER JOIN usuarios u ON p.usuarios_id = u.id 
    WHERE p.usuarios_id = ? 
    ORDER BY p.data_criacao DESC
  `;

  db.query(query, [usuarioId], (err, results) => {
    if (err) {
      console.error("Erro ao buscar postagens do perfil logado:", err);
      return res.status(500).json({ erro: 'Erro interno ao buscar postagens.' });
    }
    res.status(200).json(results);
  });
};

exports.buscarPorId = (req, res) => {
  const postId = req.params.id;

  // Perceba que aqui buscamos por "id = ?" e não "usuarios_id = ?"
  const query = 'SELECT * FROM postagens WHERE id = ?';

  db.query(query, [postId], (err, results) => {
    if (err) {
      console.error("Erro ao buscar postagem por ID:", err);
      return res.status(500).json({ erro: 'Erro interno ao buscar postagem.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ erro: 'Postagem não encontrada.' });
    }

    // Retorna APENAS o objeto da postagem encontrada
    res.status(200).json(results[0]);
  });
};

exports.listarDenunciasDirecionadas = (req, res) => {
  const ong_id = req.params.ong_id;

  const sql = `
    SELECT p.*, u.nome as nome_autor, u.foto_perfil as foto_autor 
    FROM postagens p 
    JOIN usuarios u ON p.usuarios_id = u.id 
    WHERE p.tipo_postagem = 'denuncia' AND p.ong_destino_id = ?
    ORDER BY p.data_criacao DESC
  `;

  db.query(sql, [ong_id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar denúncias direcionadas:', err);
      return res.status(500).json({ erro: 'Erro ao buscar denúncias direcionadas' });
    }
    return res.status(200).json(results);
  });
};
