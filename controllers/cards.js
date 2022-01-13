const Card = require('../models/card');
const HTTP_CODES = require('../utils/response.codes');

async function getAllCards(req, res) {
  const { _id } = req.user;
  try {
    const cards = await Card.find({ owner: _id });
    return res
      .status(HTTP_CODES.SUCCESS_CODE)
      .json(cards);
  } catch (e) {
    return res
      .status(HTTP_CODES.SERVER_ERROR_CODE)
      .send({ message: 'Ошибка сервера' });
  }
}

async function createNewCard(req, res) {
  const { _id } = req.user;
  const { name, link } = req.body;
  try {
    const newCard = await Card.create({ name, link, owner: _id });
    return res
      .status(HTTP_CODES.SUCCESS_CREATED_CODE)
      .json(newCard);
  } catch (e) {
    if (e.name === 'CastError' || e.name === 'ValidationError') {
      return res
        .status(HTTP_CODES.BAD_REQUEST_ERROR_CODE)
        .send({ message: 'Переданы некорректные данные.' });
    }
    return res
      .status(HTTP_CODES.SERVER_ERROR_CODE)
      .send({ message: 'Ошибка сервера' });
  }
}

async function deleteCardById(req, res) {
  const { cardId } = req.params;
  const { _id: userId } = req.user;
  try {
    const card = await Card.findById(cardId).orFail();
    if (!card.owner.equals(userId)) {
      return res
        .status(HTTP_CODES.FORBIDDEN)
        .send({ message: 'Можно удалять только свои карточки.' });
    }
    const result = await Card.deleteOne({ _id: cardId }).orFail();
    return res
      .status(HTTP_CODES.SUCCESS_CODE)
      .json(result);
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      return res
        .status(HTTP_CODES.NOT_FOUND_ERROR_CODE)
        .send({ message: 'Карточка не найдена.' });
    }
    if (e.name === 'CastError') {
      return res
        .status(HTTP_CODES.BAD_REQUEST_ERROR_CODE)
        .send({ message: 'Переданы некорректные данные.' });
    }
    return res
      .status(HTTP_CODES.SERVER_ERROR_CODE)
      .send({ message: 'Ошибка сервера' });
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
    return res
      .status(HTTP_CODES.SUCCESS_CODE)
      .json(updateCard);
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      return res
        .status(HTTP_CODES.NOT_FOUND_ERROR_CODE)
        .send({ message: 'Карточка не найдена.' });
    }
    if (e.name === 'CastError') {
      return res
        .status(HTTP_CODES.BAD_REQUEST_ERROR_CODE)
        .send({ message: 'Переданы некорректные данные.}' });
    }
    return res
      .status(HTTP_CODES.SERVER_ERROR_CODE)
      .send({ message: 'Ошибка сервера' });
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
    if (e.name === 'DocumentNotFoundError') {
      return res
        .status(HTTP_CODES.NOT_FOUND_ERROR_CODE)
        .send({ message: 'Карточка не найдена.' });
    }
    if (e.name === 'CastError') {
      return res
        .status(HTTP_CODES.BAD_REQUEST_ERROR_CODE)
        .send({ message: 'Переданы некорректные данные.' });
    }
    return res
      .status(HTTP_CODES.SERVER_ERROR_CODE)
      .send({ message: 'Ошибка сервера' });
  }
}

module.exports = {
  getAllCards, createNewCard, deleteCardById, likeCard, dislikeCard,
};
