require('dotenv').config();
const express = require('express');
const sequelize = require('./db/conn');
const authRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');


const api = express();
api.use(express.json());


// rotas
api.use('/api/auth', authRoutes);
api.use('/api/events', eventRoutes);


// Sincronizar o banco de dados e iniciar o servidor
sequelize.sync({ force: false })
  .then(() => {
    console.log('Banco de dados conectado e sincronizado!');
    api.listen(5000, () => console.log('Servidor rodando na porta 5000'));
  })
  .catch(err => console.log('Erro ao conectar ao banco:', err));

