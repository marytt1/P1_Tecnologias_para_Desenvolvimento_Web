require('dotenv').config();
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Acesso negado!' });

  try {
    const verified = jwt.verify(token.replace('Bearer ', ''), process.env.CHAVETOKEN);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Token inválido' });
  }
};
module.exports = verifyToken;