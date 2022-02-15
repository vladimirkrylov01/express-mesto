// const jwt = require('jsonwebtoken');
// const UnauthorizedError = require("../errors/UnauthorizedError");
//
// module.exports = (req, res, next) => {
//   const token = req.cookies.jwt;
//   let payload;
//   try {
//     payload = jwt.verify(token, 'some-secret-key');
//   } catch (err) {
//     next(new UnauthorizedError(`Необходима авторизация`));
//   }
//   req.user = payload;
//   next();
// };

const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/UnauthorizedError');

const { JWT_SECRET, NODE_ENV } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError('Необходима авторизация');
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key');
  } catch (err) {
    throw new UnauthorizedError('Необходима авторизация');
  }
  req.user = payload;

  next();
};
