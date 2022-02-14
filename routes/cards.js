const router = require('express').Router();
const { validationCard, validationIdCard } = require('../middlewares/validation');

const {
  getCards,
  deleteCard,
  createCard,
  setLike,
  deleteLike,
} = require('../controllers/cards');

router.get('/', getCards);
router.post('/', validationCard, createCard);
router.delete('/:cardId', validationIdCard, deleteCard);
router.put('/:cardId/likes', validationIdCard, setLike);
router.delete('/:cardId/likes', validationIdCard, deleteLike);

module.exports = router;
