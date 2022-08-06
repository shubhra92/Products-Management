const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const commonMid = require('../middlewares/middleware');


// ==> User apis : 

router.post('/register', userController.createUser);  // --> POST api to create a user 
router.post('/login', userController.loginUser);  // --> POST api to login for a user
router.get('/user/:userId/profile', commonMid.auth, userController.getProfile);  // --> GET api to get a user's profile
router.put('/user/:userId/profile', commonMid.auth, userController.updateProfile);  // --> PUT api to update a user's profile


// ==> Product apis :

router.post('/products', productController.createProduct);  // --> POST api to create a product
router.get('/products', productController.getByFilters);  // --> GET api to get the products
router.get('/products/:productId', productController.getProductById);  // --> GET api to get a particular product by id
router.put('/products/:productId', productController.updateProductById);  // --> PUT api to update a product
router.delete('/products/:productId', productController.delProductById);  // --> DELETE api to delete a product


// ==> Cart apis :

router.post('/users/:userId/cart',commonMid.auth, cartController.createCart);  // --> POST api to create a cart
router.put('/users/:userId/cart',commonMid.auth, cartController.updateCart);  // --> PUT api to update a cart
router.get('/users/:userId/cart',commonMid.auth, cartController.getCart);  // --> GET api to get a cart
router.delete('/users/:userId/cart', commonMid.auth, cartController.delCart);  // --> DELETE api to empty a cart


// ==> Order apis :

router.post('/users/:userId/orders', commonMid.auth, orderController.createOrder);  // --> POST api to place an order
router.put('/users/:userId/orders', commonMid.auth, orderController.updateOrder);  // --> PUT api to update an order's status


module.exports = router;