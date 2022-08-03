const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
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


router.post('/users/:userId/cart',/* commonMid.auth, */cartController.createCart);
router.put('/users/:userId/cart',/* commonMid.auth, */cartController.updateCart);
router.get('/users/:userId/cart',/* commonMid.auth, */cartController.getCart);
router.delete('/users/:userId/cart',/* commonMid.auth, */cartController.delCart);


router.post('/users/:userId/orders',/* commonMid.auth, */orderController.createOrder);
router.post('/users/:userId/orders',/* commonMid.auth, */orderController.updateOrder);


module.exports = router;