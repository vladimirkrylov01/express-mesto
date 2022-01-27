const router = require('express').Router();
const userRouter = require('./users.router');
const cardRouter = require('./cards.router');

router.use('/users', userRouter);
router.use('/cards', cardRouter);

module.exports = router;
