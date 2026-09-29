const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, senha } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedSenha = await bcrypt.hash(senha, salt);

    const newUser = await User.create({ name, email, senha: hashedSenha });
    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Usuário não encontrado' });


    const validPass = await bcrypt.compare(senha, user.senha);
    if (!validPass) return res.status(400).json({ error: 'Senha inválida' });


    const token = jwt.sign({ id: user.id }, process.env.CHAVETOKEN);
    res.header('Authorization', token).json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Erro no login' });
  }
});

module.exports = router;
