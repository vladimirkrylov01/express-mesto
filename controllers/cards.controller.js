const Card = require('../models/card');
const HTTP_CODES = require('../utils/response.codes');

const ForbiddenError = require('../errors/forbidden-error');
const NotFoundError = require('../errors/not-found-error');
const ValidationError = require('../errors/validation-error');

async function getAllCards(req, res, next) {
  try {
    const cards = await Card.find();
    return res
      .status(HTTP_CODES.SUCCESS_CODE)
      .json(cards);
  } catch (e) {
    return next(e);
  }
}

async function createNewCard(req, res, next) {
  const { _id } = req.user;
  const { name, link } = req.body;
  try {
    const newCard = await Card.create({ name, link, owner: _id });
    return res
      .status(HTTP_CODES.SUCCESS_CREATED_CODE)
      .json(newCard);
  } catch (e) {
    if (e.name === 'CastError' || e.name === 'ValidationError') {
      return next(new ValidationError('Переданы некорректные данные'));
    }
    return next(e);
  }
}

async function deleteCardById(req, res, next) {
  const { cardId } = req.params;
  const { _id: userId } = req.user;
  try {
    const card = await Card.findById(cardId).orFail();
    if (!card.owner.equals(userId)) {
      return next(new ForbiddenError('Можно удалять только свои карточки'));
    }
    const result = await Card.deleteOne({ _id: cardId }).orFail();
    return res
      .status(HTTP_CODES.SUCCESS_CODE)
      .json(result);
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      return next(new NotFoundError('Карточка не найдена'));
    }
    if (e.name === 'CastError') {
      return next(new ValidationError('Переданы некорректные данные'));
    }
    return next(e);
  }
}

async function likeCard(req, res, next) {
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
      return next(new NotFoundError('Карточка не найдена'));
    }
    if (e.name === 'CastError') {
      return next(new ValidationError('Переданы некорректные данные'));
    }
    return next(e);
  }
}

async function dislikeCard(req, res, next) {
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
      return next(new NotFoundError('Карточка не найдена'));
    }
    if (e.name === 'CastError') {
      return next(new ValidationError('Переданы некорректные данные'));
    }
    return next(e);
  }
}

module.exports = {
  getAllCards, createNewCard, deleteCardById, likeCard, dislikeCard,
};
