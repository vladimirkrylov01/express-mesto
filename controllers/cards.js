const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');

const getCards = (request, response, next) => Card
  .find({})
  .populate('owner')
  .then((cards) => response.status(200).send(cards))
  .catch((err) => {
    if (err.name === 'CastError') {
      next(new BadRequestError(`${Object.values(err.errors).map((error) => error.message).join(', ')}`));
    } else next(err);
  });

const deleteCard = (request, response, next) => {
  Card.findById(request.params.cardId)
    .orFail(new NotFoundError(`Карточки не существует`))
    .then((card) => {
      if (card.owner.toString() !== request.user._id) {
        next(new ForbiddenError('Недостаточно прав для выполнения операции'));
      }
      Card.findByIdAndDelete(request.params.cardId)
        .then(() => response.status(200).send(card))
        .catch(next);
    })
    .catch(next);
};

const createCard = (request, response, next) => {
  const { name, link } = request.body;
  Card
    .create({ name, link, owner: request.user._id })
    .then((card) => {
      card.populate('owner').execPopulate()
        .then((populatedCard) => {
          response.send(populatedCard);
        });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(`${Object.values(err.errors).map((error) => error.message).join(', ')}`));
      } else next(err);
    });
};

const setLike = (request, response, next) => {
  Card.findByIdAndUpdate(
    request.params.cardId,
    { $addToSet: { likes: request.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((card) => {
      if (!card) {
        next(new NotFoundError('Карточка не найдена'));
      }
      card.populate('owner').execPopulate()
        .then((populatedCard) => {
          response.send(populatedCard);
        });
      // return response.status(200).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(`${Object.values(err.errors).map((error) => error.message).join(', ')}`));
      } else if (err.message === 'NotFound') {
        next(new NotFoundError('Передан несуществующий _id карточки.'));
      } else next(err);
    });
};

const deleteLike = (request, response, next) => {
  console.log(request.user);

  Card.findByIdAndUpdate(
    request.params.cardId,
    { $pull: { likes: request.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(() => new NotFoundError('Карточка не найдена'))
    .then((card) => card.populate('owner').execPopulate()
      .then((populatedCard) => {
        response.send(populatedCard);
      }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(`${Object.values(err.errors).map((error) => error.message).join(', ')}`));
      } else next(err);
    });
};

module.exports = {
  getCards,
  deleteCard,
  createCard,
  setLike,
  deleteLike,
};
