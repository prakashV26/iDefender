const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/profile', verifyToken, userController.getProfile);

// =============================  Product route===================================
router.get('/getAllProducts',verifyToken, userController.getAllProducts);
router.get('/getProductById/:id', verifyToken,userController.getProductById);

// ======================== cart route ===========================================
router.post('/addToCart',verifyToken, userController.addToCart);
router.put('/updateCart', verifyToken, userController.updateCart);
router.get('/getCart', verifyToken, userController.getCart);
router.delete('/deleteCartItemId/:id', verifyToken, userController.deleteCartItem);
router.delete('/clearCart', verifyToken, userController.clearCart);

// ====================== Place order route =======================================
router.post('/placeOrder', verifyToken, userController.placeOrder);
router.post('/placeOrderCart', verifyToken, userController.placeOrderCart);
router.get('/getUserOrders', verifyToken, userController.getUserOrders);
router.get('/getOrderById/:id', verifyToken, userController.getOrderById);

// ============== Search  filter product route ======================================
router.get('/searchAndFilterProducts', userController.searchAndFilterProducts);



module.exports = router;
