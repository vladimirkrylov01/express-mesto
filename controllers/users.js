const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const HTTP_CODES = require('../utils/response.codes');
const TOKEN_SECRET = require('../utils/secret');

async function getAllUsers(req, res) {
  try {
    const users = await User.find({});
    return res
      .status(HTTP_CODES.SUCCESS_CODE)
      .json(users);
  } catch (e) {
    return res
      .status(HTTP_CODES.SERVER_ERROR_CODE)
      .send({ message: 'Ошибка сервера' });
  }
}

async function getUserById(req, res) {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).orFail();
    return res
      .status(HTTP_CODES.SUCCESS_CODE)
      .json(user);
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      return res
        .status(HTTP_CODES.NOT_FOUND_ERROR_CODE)
        .send({ message: 'Пользователь не найден' });
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

async function createNewUser(req, res) {
  const {
    name, about, avatar, password, email,
  } = req.body;

  try {
    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name, about, password: hashPassword, email, avatar,
    });

    return res
      .status(HTTP_CODES.SUCCESS_CREATED_CODE)
      .json({
        name: newUser.name,
        about: newUser.about,
        email: newUser.email,
        avatar: newUser.avatar,
      });
  } catch (e) {
    if (e.name === 'MongoServerError' && e.code === 11000) {
      return res
        .status(HTTP_CODES.CONFLICT_ERROR_CODE)
        .send({ message: 'Пользователь с таким email уже существует.' });
    }
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

async function updateProfile(req, res) {
  const { _id } = req.user;
  const { name, about } = req.body;

  try {
    const updatedProfile = await User.findByIdAndUpdate(
      _id,
      { name, about },
      {
        runValidators: true,
        new: true,
      },
    ).orFail();
    return res.status(HTTP_CODES.SUCCESS_CODE).json(updatedProfile);
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      return res
        .status(HTTP_CODES.NOT_FOUND_ERROR_CODE)
        .send({ message: 'Переданы некорректные данные при обновлении профиля.' });
    }
    if (e.name === 'CastError' || e.name === 'ValidationError') {
      return res
        .status(HTTP_CODES.BAD_REQUEST_ERROR_CODE)
        .send({ message: 'Запрашиваемый пользователь не найден.' });
    }
    return res
      .status(HTTP_CODES.SERVER_ERROR_CODE)
      .send({ message: 'Ошибка сервера' });
  }
}

async function updateAvatar(req, res) {
  const { _id } = req.user;
  const { avatar } = req.body;

  try {
    const updatedAvatar = await User.findByIdAndUpdate(
      _id,
      { avatar },
      {
        runValidators: true,
        new: true,
      },
    ).orFail();
    return res
      .status(HTTP_CODES.SUCCESS_CODE)
      .json(updatedAvatar);
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      return res
        .status(HTTP_CODES.NOT_FOUND_ERROR_CODE)
        .send({ message: 'Переданы некорректные данные при обновлении аватара профиля.' });
    }
    if (e.name === 'CastError' || e.name === 'ValidationError') {
      return res
        .status(HTTP_CODES.BAD_REQUEST_ERROR_CODE)
        .send({ message: 'Запрашиваемый пользователь не найден.}' });
    }
    return res
      .status(HTTP_CODES.SERVER_ERROR_CODE)
      .send({ message: 'Ошибка сервера' });
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;
  try {
    const matchingUser = await User.findOne({ email }).select('+password');
    if (!matchingUser) {
      return res
        .status(HTTP_CODES.UNAUTHORIZED)
        .send({ mesage: 'Неправильны почта или пароль' });
    }

    const isSame = await bcrypt.compare(password, matchingUser.password);

    if (!isSame) {
      return res
        .status(HTTP_CODES.UNAUTHORIZED)
        .send({ mesage: 'Неправильны почта или пароль' });
    }

    const token = jwt.sign(
      { _id: matchingUser._id },
      TOKEN_SECRET,
      { expiresIn: '7d' },
    );

    return res
      .cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        secure: true,
        sameSite: 'None',
      })
      .json({
        _id: matchingUser._id,
        name: matchingUser.name,
        about: matchingUser.about,
        avatar: matchingUser.avatar,
        email: matchingUser.email,
      });
  } catch (e) {
    if (e.name === 'ValidationError') {
      return res
        .status(HTTP_CODES.BAD_REQUEST_ERROR_CODE)
        .send({ mesage: 'Переданы некорректные данные' });
    }

    return next(e);
  }
}

module.exports = {
  getAllUsers, getUserById, createNewUser, updateProfile, updateAvatar, login,
};
