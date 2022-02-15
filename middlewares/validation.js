const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const BadRequestError = require("../errors/BadRequestError");

const validationUrl = (value) => {
  if (!validator.isURL(value, { require_protocol: true })) {
    throw new BadRequestError('Невалидный URL');
  }
  return value;
};

const validationUpdateUser = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
});

const validationUpdateAvatar = celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom(validationUrl),
  }),
});

const validationIdUser = celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum().length(24),
  }),
});

const validationIdCard = celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().length(24),
  }),
});

const validationUser = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(20),
    avatar: Joi.string().custom(validationUrl),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
});

const validationLogin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
});

const validationCard = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().custom(validationUrl),
  }),
});

function validationLink(v) {
  return /^(https?:\/\/)?(www.)?[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,3}(\/\S*)?$/.test(v);
}

module.exports = {
  validationLogin,
  validationUser,
  validationIdUser,
  validationIdCard,
  validationUpdateAvatar,
  validationUpdateUser,
  validationCard,
  validationLink,
  validationUrl,
};
