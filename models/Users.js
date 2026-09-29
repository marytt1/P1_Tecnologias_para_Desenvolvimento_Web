const { DataTypes } = require('sequelize');
const conn = require('../db/conn');


const User = conn.define('User', {
  name:  { type: DataTypes.STRING, required: true },
  email: { type: DataTypes.STRING, required: true, unique: true },
  senha: { type: DataTypes.STRING, required: true }
});


module.exports = User;
