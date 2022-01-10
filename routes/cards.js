const router = require('express').Router();
const cardController = require('../controllers/cards')

router.route('/')
.get(cardController.getAllCards)
.post(cardController.createNewCard)

router.route('/:cardId/likes')
.put(cardController.likeCard)
.delete(cardController.dislikeCard)

router.delete('/:cardId', cardController.deleteCardById);

module.exports = router;
