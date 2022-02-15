const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');

const { JWT_SECRET, NODE_ENV } = process.env;

const getUsers = (request, response, next) => User
  .find({})
  .then((users) => response.status(200).send(users))
  .catch((err) => {
    if (err.name === 'CastError') {
      throw new BadRequestError('Переданы некорректные данные');
    }
  })
  .catch(next);

const getUser = (request, response, next) => {
  const { userId } = request.params;

  return User
    .findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      return response.status(200).send(user);
    })
    .catch((err) => {
      console.log(err.name);
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else next(err);
    });
};

const getUserMe = (request, response, next) => {
  const owner = request.user._id;

  return User
    .findById(owner)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      return response.status(200).send(user);
    })
    .catch((err) => {
      console.log(err.name);
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else next(err);
    });
  // return response.status(200).send(user);
};

const createUser = (request, response, next) => {
  const {
    name, about, avatar, email, password,
  } = request.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash, // записываем хеш в базу
    }))
    .then((user) => response.send({
      _id: user._id,
      name,
      about,
      avatar,
      email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(`${Object.values(err.errors).map((error) => error.message).join(', ')}`));
      } else if (err.code === 11000) {
        next(new ConflictError(`Пользователь с данным email уже существует`));
      }
    })
    .catch(next);
};

const patchUser = (request, response, next) => {
  const { name, about } = request.body;

  return User.findByIdAndUpdate(
    request.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      return response.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError(`${Object.values(err.errors).map((error) => error.message).join(', ')}`));
      } else if (err.message === 'NotFound') {
        next(new NotFoundError('Нет пользователя с таким id'));
      }
    })
    .catch(next);
};

const patchAvatar = (request, response, next) => {
  const { avatar } = request.body;

  return User.findByIdAndUpdate(request.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      return response.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError(`${Object.values(err.errors).map((error) => error.message).join(', ')}`));
      } else if (err.message === 'NotFound') {
        next(new NotFoundError('Нет пользователя с таким id'));
      }
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // создадим токен
      const token = jwt.sign(
        {
          _id: user._id,
          email: user.email,
          name: user.name,
          about: user.about,
          avatar: user.avatar,
        },
        NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key',
        { expiresIn: '7d' },
      );
      // вернём токен
      res
        // .cookie('jwt', token, {
        //   maxAge: 3600000 * 24 * 7,
        //   httpOnly: true,
        //   sameSite: true,
        // })
        // .send({message: 'Успешная авторизация'})
        .send({ token });
    })
    .catch(next);
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  patchUser,
  patchAvatar,
  login,
  getUserMe,
};
