const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const commonMid = require('../middlewares/middleware');

router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/user/:userId/profile', commonMid.auth, userController.getProfile);

module.exports = router