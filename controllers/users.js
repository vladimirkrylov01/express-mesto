const User = require('../models/user');
const HTTP_CODES = require('../utils/response.codes')
const ConflictError = require('../utils/conflict-error')
const NotFoundError = require('../utils/not-found-error')
const ValidationError = require('../utils/validation-error')

async function getAllUsers(req, res) {
	try {
		const users = await User.find({})
		return res.status(HTTP_CODES.SUCCESS_CODE).json(users)
	} catch (e) {
		console.error(e.message)
		return res.status(HTTP_CODES.SERVER_ERROR_CODE).json('Произошла ошибка на сервере')
	}
}

async function getUserById(req, res, next) {
	const {userId} = req.params

	try {
		const user = await User.findById(userId).orFail()
		return res.status(HTTP_CODES.SUCCESS_CODE).json(user)
	} catch (e) {
		console.error(e.message)
		if (e.name === 'DocumentNotFound') {
			return next(new NotFoundError('Пользователь не найден'))
		}
		if (e.name === 'CastError') {
			return next(new ValidationError(('Переданы некорректные данные')))
		}
		return res.status(HTTP_CODES.SERVER_ERROR_CODE).json('Произошла ошибка на сервере')
	}
}

async function createNewUser(req, res, next) {
	const {name, about} = req.body

	try {
		const newUser = await User.create({name, about})

		return res.status(HTTP_CODES.SUCCESS_CREATED_CODE).json({
			name: newUser.name,
			about: newUser.about,
		})
	} catch (e) {
		if (e.name === 'CastError') {
			return next(new ValidationError(('Переданы некорректные данные')))
		}
		if (e.name === 'MongoServerError' && e.code === 11000) {
			return next(new ConflictError('Пользователь с таким email уже существует'))
		}
		return res.status(HTTP_CODES.SERVER_ERROR_CODE).json('Произошла ошибка на сервере')
	}
}

async function updateProfile(req, res, next) {
	const {_id} = req.user
	const {name, about} = req.body

	try {
		const updatedProfile = await User.findByIdAndUpdate(
			_id,
			{name, about},
			{
				runValidators: true,
				new: true,
			}).orFail()
		return res.status(HTTP_CODES.SUCCESS_CODE).json(updatedProfile)
	} catch (e) {
		console.error(e.message)
		if (e.name === 'DocumentNotFound') {
			return next(new NotFoundError('Пользователь не найден'))
		}
		if (e.name === 'CastError' || e.name === 'ValidationError') {
			return next(new ValidationError(('Переданы некорректные данные')))
		}
		return res.status(HTTP_CODES.SERVER_ERROR_CODE).json('Произошла ошибка на сервере')
	}
}

async function updateAvatar(req, res, next) {
	const {_id} = req.user
	const {avatar} = req.body

	try {
		const updatedAvatar = await User.findByIdAndUpdate(
			_id,
			{avatar},
			{
				runValidators: true,
				new: true,
			}
		).orFail()
		return res.status(HTTP_CODES.SUCCESS_CODE).json(updatedAvatar)
	} catch (e) {
		console.error(e.message)
		if (e.name === 'DocumentNotFound') {
			return next(new NotFoundError('Пользователь не найден'))
		}
		if (e.name === 'CastError' || e.name === 'ValidationError') {
			return next(new ValidationError(('Переданы некорректные данные')))
		}
		return res.status(HTTP_CODES.SERVER_ERROR_CODE).json('Произошла ошибка на сервере')
	}
}

module.exports = {
	getAllUsers, getUserById, createNewUser, updateProfile, updateAvatar,
};
