require('dotenv').config();
const express = require('express');
const cors = require('cors');
const usuarioRoutes = require('./routes/usuarioRoute');
const postagemRoutes = require('./routes/postagemRoute');
const errorHandler = require('./middleware/errorMiddleware');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', usuarioRoutes);
app.use('/api', postagemRoutes);
app.use('/uploads', express.static('uploads'));
app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});