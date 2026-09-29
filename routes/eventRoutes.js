const express = require('express');
const { body, validationResult } = require('express-validator');
const verifyToken = require('../helpers/verifyToken');
const Registration = require('../models/Registration');
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
    const { quantity, ticketType } = req.body;
    const eventId = req.params.id;
    const userId = req.user.id;

    // 1. REGRA ADICIONADA: Verificar se o utilizador já está inscrito neste evento
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
    console.log("Erro na inscrição:", err); // Ajuda a debugar caso algo falhe
    res.status(500).json({ error: 'Erro ao inscrever' });
  }
});

module.exports = router;
