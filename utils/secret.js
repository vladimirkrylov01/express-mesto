const { JWT_SECRET, NODE_ENV } = process.env;

const TOKEN_SECRET = NODE_ENV === 'production'
  ? JWT_SECRET
  : 'dev';

module.exports = TOKEN_SECRET;
