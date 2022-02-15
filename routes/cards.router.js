const router = require('express').Router();
const cardsController = require('../controllers/cards.controller');
const { newCardValidation, cardIdValidation } = require('../utils/validation-requests');

router.route('/')
  .get(cardsController.getAllCards)
  .post(newCardValidation, cardsController.createNewCard);

router.route('/:cardId/likes')
  .put(cardIdValidation, cardsController.likeCard)
  .delete(cardIdValidation, cardsController.dislikeCard);

router.delete('/:cardId', cardIdValidation, cardsController.deleteCardById);

module.exports = router;
