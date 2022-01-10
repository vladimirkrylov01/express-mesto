const router = require('express').Router();
const userController = require('../controllers/users')

router.route('/')
.get(userController.getAllUsers)
.post(userController.createNewUser)

router.route('/me').patch(userController.updateProfile)
router.route('/me/avatar').patch(userController.updateAvatar)

router.route('/:userId').get(userController.getUserById)

module.exports = router;
