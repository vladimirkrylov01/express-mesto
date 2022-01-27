const router = require('express').Router();
const usersController = require('../controllers/users.conroller');
const {
  userIdValidation,
  updateUserProfileValidation,
  updateUserAvatarValidation,
} = require('../utils/validation-requests');

router.get('/', usersController.getAllUsers);
router.get('/me', usersController.getCurrentUser);
router.get('/:userId', userIdValidation, usersController.getUserById);

router.patch('/me', updateUserProfileValidation, usersController.updateProfile);
router.patch('/me/avatar', updateUserAvatarValidation, usersController.updateAvatar);

module.exports = router;
