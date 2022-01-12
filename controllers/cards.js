const Card = require('../models/card');
const HTTP_CODES = require('../utils/response.codes');

async function getAllCards(req, res) {
  try {
    const cards = await Card.find({}).populate('owner');
    return res.status(HTTP_CODES.SUCCESS_CODE).json(cards);
  } catch (e) {
    return res.status(HTTP_CODES.SERVER_ERROR_CODE).json('Произошла ошибка на сервере');
  }
}

async function createNewCard(req, res) {
  const { _id } = req.user;
  const { name, link } = req.body;
  try {
    let newCard = await Card.create({ name, link, owner: _id });
    newCard = await newCard.populate('owner');
    return res.status(HTTP_CODES.SUCCESS_CREATED_CODE).json(newCard);
  } catch (e) {
    console.error(e.message);
    return res.status(HTTP_CODES.SERVER_ERROR_CODE).json('Произошла ошибка на сервере');
  }
}

async function deleteCardById(req, res) {
  const { cardId } = req.params;
  const { _id: userId } = req.user;
  try {
    const card = await Card.findById(cardId).orFail();
    if (!card.owner.equals(userId)) {
      return res.status(HTTP_CODES.FORBIDDEN).json('Можно удалять только свои карточки');
    }
    const result = await Card.deleteOne({ _id: cardId }).orFail();
    return res.status(HTTP_CODES.SUCCESS_CODE).json(result);
  } catch (e) {
    console.error(e.message);
    if (e.name === 'DocumentNotFoundError') {
      return res.status(HTTP_CODES.NOT_FOUND_ERROR_CODE).json('Карточка не найдена');
    }
    if (e.name === 'CastError') {
      return res.status(HTTP_CODES.BAD_REQUEST_ERROR_CODE).json('Переданы некорректные данные');
    }
    return res.status(HTTP_CODES.SERVER_ERROR_CODE).json('Произошла ошибка на сервере');
  }
}

async function likeCard(req, res) {
  const { cardId } = req.params;
  const { _id } = req.user;
  try {
    const updateCard = await Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: _id } },
      { new: true },
    ).orFail();
    return res.status(HTTP_CODES.SUCCESS_CODE).json(updateCard);
  } catch (e) {
    console.error(e.message);
    if (e.name === 'DocumentNotFoundError') {
      return res.status(HTTP_CODES.NOT_FOUND_ERROR_CODE).json('Карточка не найдена');
    }
    if (e.name === 'CastError') {
      return res.status(HTTP_CODES.BAD_REQUEST_ERROR_CODE).json('Переданы некорректные данные');
    }
    return res.status(HTTP_CODES.SERVER_ERROR_CODE).json('Произошла ошибка на сервере');
  }
}

async function dislikeCard(req, res) {
  const { cardId } = req.params;
  const { _id } = req.user;
  try {
    const updatedUser = await Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: _id } },
      { new: true },
    ).orFail();
    return res.status(HTTP_CODES.SUCCESS_CODE).json(updatedUser);
  } catch (e) {
    console.error(e.message);
    if (e.name === 'DocumentNotFoundError') {
      return res.status(HTTP_CODES.NOT_FOUND_ERROR_CODE).json('Карточка не найдена');
    }
    if (e.name === 'CastError') {
      return res.status(HTTP_CODES.BAD_REQUEST_ERROR_CODE).json('Переданы некорректные данные');
    }
    return res.status(HTTP_CODES.SERVER_ERROR_CODE).json('Произошла ошибка на сервере');
  }
}

module.exports = {
  getAllCards, createNewCard, deleteCardById, likeCard, dislikeCard,
};
