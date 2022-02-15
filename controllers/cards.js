const Card = require('../models/card');
const IncorrectDataError = require('../errors/incorrectDataErr');
const ForbiddenDataError = require('../errors/forbiddenDataErr');
const NotFoundError = require('../errors/notFoundErr');

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card
    .create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new IncorrectDataError('Переданы некорректные данные при создании карточки'));
      }
      next(err);
    });
};

module.exports.getCards = (req, res, next) => {
  Card
    .find({})
    .then((card) => res.send({ data: card }))
    .catch(next);
};

module.exports.deleteCards = (req, res, next) => {
  const { cardId } = req.params;
  const userId = req.user._id;

  Card
    .findById(cardId)
    .then((card) => {
      if (card.owner._id.toString() === userId) {
        Card
          .findByIdAndRemove(cardId)
          .orFail(() => {
            throw new NotFoundError('Карточка с указанным id не найдена');
          })
          .then((deletedCard) => {
            res.send({ data: deletedCard });
          })
          .catch((err) => {
            if (err.name === 'CastError') {
              next(new IncorrectDataError('Передан некорректный id при удалении карточки'));
            }
            next(err);
          });
      } else {
        next(new ForbiddenDataError('У Вас нет прав на удаление этой карточки'));
      }
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card
    .findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    )
    .then((card) => {
      if (card) {
        return res.send({ data: card });
      }
      throw new NotFoundError('Передан несуществующий id карточки');
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new IncorrectDataError('Переданы некорректные данные для постановки/снятии лайка'));
      }
      next(err);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card
    .findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true, runValidators: true },
    )
    .then((card) => {
      if (card) {
        return res.send({ data: card });
      }
      throw new NotFoundError('Передан несуществующий _id карточки');
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new IncorrectDataError('Переданы некорректные данные для постановки/снятии лайка'));
      }
      next(err);
    });
};
