const router = require('express').Router();
const cardController = require('../controllers/cards.controller');
const { newCardValidation, cardIdValidation } = require('../utils/validation-requests');

router.route('/')
  .get(cardController.getAllCards)
  .post(newCardValidation, cardController.createNewCard);

router.route('/:cardId/likes')
  .put(cardIdValidation, cardController.likeCard)
  .delete(cardIdValidation, cardController.dislikeCard);

router.delete('/:cardId', cardIdValidation, cardController.deleteCardById);

module.exports = router;
