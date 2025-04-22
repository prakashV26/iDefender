const db = require("../models/productModel");
const { orderStatusOptions } = require("../utils/constants");
const orderModel = require("../models/orderModel");

// ================= product api ==============================================

exports.addProduct = async (req, res) => {
  try {
    const { title, description, price, images, stock } = req.body;

    if (!title || !price) {
      return res.status(400).json({
        status: 400,
        message: "Title and price are required",
        result: null,
      });
    }

    const result = await db.createProduct({
      title,
      description,
      price,
      images,
      stock,
    });

    res.status(200).json({
      status: 200,
      message: "Product added successfully",
      result: {
        id: result.insertId,
        title,
        description,
        price,
        images,
        stock,
      },
    });
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
      result: null,
    });
  }
};

exports.editProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { title, description, price, images, stock } = req.body;

    const updated = await db.updateProduct(productId, {
      title,
      description,
      price,
      images,
      stock,
    });

    if (updated.affectedRows === 0) {
      return res.status(404).json({
        status: 404,
        message: "Product not found or not updated",
        result: null,
      });
    }

    res.status(200).json({
      status: 200,
      message: "Product updated successfully",
      result: {
        id: parseInt(productId),
        title,
        description,
        price,
        images,
        stock,
      },
    });
  } catch (error) {
    console.error("Edit Product Error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
      result: null,
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await db.getAllProducts();
    res.status(200).json({
      status: 200,
      message: "Products fetched successfully",
      result: products,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
      result: null,
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await db.getProductById(productId);

    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "Product not found",
        result: null,
      });
    }

    res.status(200).json({
      status: 200,
      message: "Product fetched successfully",
      result: product,
    });
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
      result: null,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const result = await db.deleteProductById(productId);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 404,
        message: "Product not found or already deleted",
        result: null,
      });
    }

    res.status(200).json({
      status: 200,
      message: "Product deleted successfully",
      result: null,
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
      result: null,
    });
  }
};

// ============== update order status api  ============================================

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!orderStatusOptions.includes(status)) {
      return res.status(400).json({
        status: 400,
        message:
          "Invalid order status. Valid statuses: " +
          orderStatusOptions.join(", "),
        result: null,
      });
    }
    const order = await orderModel.getOrderById(id);
    if (!order) {
      return res.status(404).json({
        status: 404,
        message: "Order not found",
        result: null,
      });
    }
    await orderModel.updateOrderStatus(id, status);
    res.status(200).json({
      status: 200,
      message: "Order status updated successfully",
      result: {
        id: order.id,
        userId: order.userId,
        previousStatus: order.status,
        updatedStatus: status,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
      result: null,
    });
  }
};

exports.getAllOrders = async (req, res) => {
    try {
      const orders = await orderModel.getAllOrdersWithItems();
      res.status(200).json({
        status: 200,
        message: "All orders fetched successfully",
        result: orders,
      });
    } catch (error) {
      console.error("Get All Orders Error:", error);
      res.status(500).json({
        status: 500,
        message: "Server error",
        result: null,
      });
    }
  };
  