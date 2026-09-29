const express = require('express');
const { body, validationResult } = require('express-validator');
const verifyToken = require('../helpers/verifyToken');
const Registration = require('../models/Registration');
const User = require('../models/Users');
const router = express.Router();

// O verifyToken protege a rota, e o array seguinte faz a validação
router.post('/:id/register', verifyToken, [
  body('email').isEmail().normalizeEmail().withMessage('E-mail inválido'),
  body('quantity').isInt({ min: 1, max: 5 }).withMessage('Máximo de 5 ingressos por pessoa'),
  body('ticketType').notEmpty().trim().escape().withMessage('Tipo de ingresso obrigatório')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { quantity, ticketType, email } = req.body;
    const eventId = req.params.id;
    const userId = req.user.id;

    //Buscar o utilizador pelo ID do token e comparar os e-mails
    const utilizadorLogado = await User.findByPk(userId);
    
    if (utilizadorLogado.email !== email) {
      return res.status(403).json({ 
        error: 'Acesso negado: O e-mail fornecido não corresponde à sua conta.' 
      });
    }
    //Verificar se o utilizador já está inscrito neste evento
    const inscricaoExistente = await Registration.findOne({
      where: {
        userId: userId,
        eventId: eventId
      }
    });

    // Se já existir uma inscrição, bloqueia com erro 409 (Conflict)
    if (inscricaoExistente) {
      return res.status(409).json({ error: 'Acesso negado: Já possui uma inscrição ativa para este evento.' });
    }

    // Se não existir, cria a inscrição normalmente
    const inscricao = await Registration.create({
      ticketType,
      quantity,
      eventId: eventId,
      userId: userId
    });
   
    res.status(201).json({ message: 'Inscrição confirmada!', inscricao });
  } catch (err) {
    console.log("Erro na inscrição:", err);
    res.status(500).json({ error: 'Erro ao inscrever' });
  }
});

// Listar todas as inscrições
router.get('/minhas-inscricoes', verifyToken, async (req, res) => {
  try {
    const inscricoes = await Registration.findAll({ 
      where: { userId: req.user.id } 
    });
    res.status(200).json(inscricoes);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar inscrições' });
  }
});

// Atualizar os dados de uma inscrição
router.put('/inscricao/:id', verifyToken, async (req, res) => {
  try {
    // Busca a inscrição pelo ID da URL e garante que é do usuário logado
    const inscricao = await Registration.findOne({ 
      where: { id: req.params.id, userId: req.user.id } 
    });

    if (!inscricao) {
      return res.status(404).json({ error: 'Inscrição não encontrada ou acesso não autorizado.' });
    }

    const { quantity, ticketType } = req.body;
    
    // Atualiza os dados no banco
    await inscricao.update({ quantity, ticketType });
    
    res.status(200).json({ message: 'Inscrição atualizada com sucesso!', inscricao });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar inscrição.' });
  }
});

//Cancelar uma inscrição
router.delete('/inscricao/:id', verifyToken, async (req, res) => {
  try {
    const inscricao = await Registration.findOne({ 
      where: { id: req.params.id, userId: req.user.id } 
    });

    if (!inscricao) {
      return res.status(404).json({ error: 'Inscrição não encontrada.' });
    }

    // Remove do banco de dados
    await inscricao.destroy();
    
    res.status(200).json({ message: 'Inscrição cancelada com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cancelar inscrição.' });
  }
});

module.exports = router;