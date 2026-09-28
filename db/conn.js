const  Sequelize  = require('sequelize');
require('dotenv').config();

const conn = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_SENHA, {
  host: process.env.DB_HOST,
  dialect: 'mysql'
});

try {
    conn.authenticate()
    console.info('Banco de Dados conectado com sucesso!')
} catch (error) {
    console.info(`Não foi possivel conectar ao banco:,${error}`)
}

module.exports = conn;