const jwt = require('jsonwebtoken');
const TOKEN_SECRET = require('../utils/secret');
const HTTP_CODES = require('../utils/response.codes');

function authorize(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    return next(res
      .status(HTTP_CODES.UNAUTHORIZED)
      .send({ message: 'Необходима авторизация' }));
  }

  try {
    req.user = jwt.verify(token, TOKEN_SECRET);
  } catch (e) {
    return next(res
      .status(HTTP_CODES.UNAUTHORIZED)
      .send({ message: 'Необходима авторизация' }));
  }
  return next();
}

module.exports = { authorize };
