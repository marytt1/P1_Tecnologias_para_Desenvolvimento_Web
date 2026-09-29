const { DataTypes } = require('sequelize');
const conn = require('../db/conn');
const User = require('./Users');


const Registration = conn.define('Registration', {
  ticketType: { type: DataTypes.STRING, required: true },
  quantity: { type: DataTypes.INTEGER, required: true },
  eventId: { type: DataTypes.INTEGER, required: true }
});


// Relacionamento (1 usuário tem várias inscrições)
User.hasMany(Registration, { foreignKey: 'userId' });
Registration.belongsTo(User, { foreignKey: 'userId' });


module.exports = Registration;
