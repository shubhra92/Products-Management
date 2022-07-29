const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const commonMid = require('../middlewares/middleware');

router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/user/:userId/profile', commonMid.auth, userController.getProfile);
router.put('/user/:userId/profile', commonMid.auth, userController.updateProfile);


router.post('/products', productController.createProduct);
router.get('/products', productController.getByFilters);
router.get('/products/:productId', productController.getProductById);
router.put('/products/:productId', productController.updateProductById);
router.delete('/products/:productId', productController.delProductById);

module.exports = router;