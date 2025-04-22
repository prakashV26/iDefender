const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyAdmin = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');

// ================= product route  ==============================================
router.post('/addProduct', verifyAdmin, isAdmin, adminController.addProduct);
router.put('/editProduct/:id',verifyAdmin, isAdmin, adminController.editProduct);
router.get('/getAllProducts', adminController.getAllProducts);
router.get('/getProductById/:id', adminController.getProductById);
router.delete('/deleteProduct/:id',verifyAdmin, isAdmin, adminController.deleteProduct);

// ============== update order status ============================================
router.put('/updateOrderStatus/:id', verifyAdmin, isAdmin,adminController.updateOrderStatus);
router.get('/getAllOrders', verifyAdmin, isAdmin, adminController.getAllOrders);






module.exports = router;
