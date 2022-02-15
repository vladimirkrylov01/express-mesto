const router = require('express').Router();
const usersController = require('../controllers/users.controller');
const { userIdValidation, updateUserProfileValidation, updateUserAvatarValidation } = require('../utils/validation-requests');

router.get('/', usersController.getAllUsers);

router.get('/me', usersController.getLoggedUser);
router.patch('/me', updateUserProfileValidation, usersController.updateProfile);

router.patch('/me/avatar', updateUserAvatarValidation, usersController.updateAvatar);

router.get('/:userId', userIdValidation, usersController.getUserById);

module.exports = router;
