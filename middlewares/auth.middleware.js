const jwt = require('jsonwebtoken');
const TOKEN_SECRET = require('../utils/secret');
const UnauthorizedError = require('../errors/unauthorized-error');

function authorize(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  try {
    req.user = jwt.verify(token, TOKEN_SECRET);
  } catch (e) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }
  return next();
}

module.exports = { authorize };
