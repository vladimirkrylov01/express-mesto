const router = require('express').Router();
const {
  validationIdUser,
  validationUpdateAvatar,
  validationUpdateUser,
} = require('../middlewares/validation');

const {
  getUsers,
  getUser,
  patchUser,
  patchAvatar,
  getUserMe,
} = require('../controllers/users');

router.get('/me', getUserMe);
router.get('/:userId', validationIdUser, getUser);
router.get('/', getUsers);
router.patch('/me', validationUpdateUser, patchUser);
router.patch('/me/avatar', validationUpdateAvatar, patchAvatar);

module.exports = router;
