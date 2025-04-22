const db = require("../models/userModel");
const Helper = require("../utils/helper");
const productDb = require("../models/productModel");
const cartModel = require("../models/cartModel");
const orderModel = require("../models/orderModel");

// ================== user api ===================================================

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        status: 400,
        message: "User already exists",
        result: null,
      });
    }

    const hashed = await Helper.hashPassword(password);
    const result = await db.createUser(name, email, hashed, role);

    const user = {
      id: result.insertId,
      name,
      email,
      role,
    };

    res.status(200).json({
      status: 200,
      message: "User registered successfully",
      result: user,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
      result: null,
    });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "Invalid email or password",
        result: null,
      });
    }

    const isMatch = await Helper.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 401,
        message: "Invalid email or password",
        result: null,
      });
    }

    const token = Helper.generateToken(user);

    let roleSpecificMessage = "";
    if (user.role === "admin") {
      roleSpecificMessage = "Admin dashboard access granted";
    } else if (user.role === "user") {
      roleSpecificMessage = "User access granted";
    } else {
      roleSpecificMessage = "Role-based access granted";
    }

    res.status(200).json({
      status: 200,
      message: `Login successful. ${roleSpecificMessage}`,
      result: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
      result: null,
    });
  }
};
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await db.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        result: null,
      });
    }

    res.status(200).json({
      status: 200,
      message: "Profile fetched successfully",
      result: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
      result: null,
    });
  }
};

// ============== product api =======================================================
exports.getAllProducts = async (req, res) => {
  try {
    const products = await productDb.getAllProducts();
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
    const product = await productDb.getProductById(productId);

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

// ============== Cart api =========================================================
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const { productId, quantity } = req.body;

    if (!userId || !productId || !quantity) {
      return res.status(400).json({
        status: 400,
        message: "All fields (userId, productId, quantity) are required",
        result: null,
      });
    }

    const userExists = await cartModel.checkUserExists(userId);
    if (!userExists) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        result: null,
      });
    }

    const product = await cartModel.checkProductExists(productId);
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "Product not found",
        result: null,
      });
    }

    const totalPrice = product.price * quantity;

    const result = await cartModel.addToCart(
      userId,
      productId,
      quantity,
      totalPrice
    );

    res.status(200).json({
      status: 200,
      message: "Item added to cart successfully",
      result: {
        cartId: result.insertId,
        userId,
        productId,
        quantity,
        totalPrice,
      },
    });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
      result: null,
    });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartId, quantity } = req.body;

    if (!cartId || !quantity) {
      return res.status(400).json({
        status: 400,
        message: "cartId and quantity are required",
        result: null,
      });
    }

    const cartItem = await cartModel.checkCartItemExists(cartId);
    if (!cartItem) {
      return res.status(404).json({
        status: 404,
        message: "Cart item not found",
        result: null,
      });
    }

    if (cartItem.userId !== userId) {
      return res.status(403).json({
        status: 403,
        message: "Unauthorized to update this cart item",
        result: null,
      });
    }

    const product = await cartModel.checkProductExists(cartItem.productId);
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "Product associated with cart item not found",
        result: null,
      });
    }

    const totalPrice = product.price * quantity;

    await cartModel.updateCartItem(cartId, quantity, totalPrice);

    res.status(200).json({
      status: 200,
      message: "Cart item updated successfully",
      result: {
        cartId,
        productId: cartItem.productId,
        quantity,
        totalPrice,
      },
    });
  } catch (error) {
    console.error("Update Cart Error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
      result: null,
    });
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const userExists = await cartModel.checkUserExists(userId);
    if (!userExists) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        result: null,
      });
    }
    const cartItems = await cartModel.getCartByUserId(userId);

    res.status(200).json({
      status: 200,
      message: "Cart fetched successfully",
      result: cartItems,
    });
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
      result: null,
    });
  }
};

exports.deleteCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartId = req.params.id;

    const cartItem = await cartModel.checkCartItemExists(cartId);
    if (!cartItem) {
      return res.status(404).json({
        status: 404,
        message: "Cart item not found",
        result: null,
      });
    }

    if (cartItem.userId !== userId) {
      return res.status(403).json({
        status: 403,
        message: "You are not authorized to delete this cart item",
        result: null,
      });
    }

    await cartModel.deleteCartItem(cartId);

    res.status(200).json({
      status: 200,
      message: "Cart item deleted successfully",
      result: { cartId },
    });
  } catch (error) {
    console.error("Delete Cart Error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
      result: null,
    });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await cartModel.clearUserCart(userId);

    res.status(200).json({
      status: 200,
      message: "All cart items cleared successfully",
      result: { affectedRows: result.affectedRows },
    });
  } catch (error) {
    console.error("Clear Cart Error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
      result: null,
    });
  }
};

// ============= place order api =====================================================
exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await cartModel.getCartItemsForOrder(userId);
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Cart is empty",
        result: null,
      });
    }
    let total = 0;
    const items = cartItems.map((item) => {
      const priceAtPurchase = parseFloat(item.price);
      const quantity = parseInt(item.quantity);
      const itemTotal = priceAtPurchase * quantity;
      total += itemTotal;

      return {
        orderId: null,
        productId: item.productId,
        quantity,
        priceAtPurchase,
      };
    });

    const orderResult = await orderModel.createOrder(userId, total);
    const orderId = orderResult.insertId;

    const orderItems = items.map((item) => ({
      ...item,
      orderId,
    }));

    await orderModel.insertOrderItems(orderItems);
    await cartModel.clearUserCart(userId);
    res.status(200).json({
      status: 200,
      message: "Order placed successfully",
      result: {
        orderId,
        userId,
        total: parseFloat(total.toFixed(2)),
        status: "pending",
        items: orderItems,
      },
    });
  } catch (error) {
    console.error("Place Order Error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
      result: null,
    });
  }
};

exports.placeOrderCartRRRRRR = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartIds } = req.body;

    if (!Array.isArray(cartIds) || cartIds.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "cartIds array is required",
        result: null,
      });
    }

    const cartItems = await cartModel.getCartItemsByIds(userId, cartIds);

    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No valid cart items found for this user",
        result: null,
      });
    }

    let total = 0;
    const items = cartItems.map((item) => {
      const priceAtPurchase = parseFloat(item.price);
      const quantity = parseInt(item.quantity);
      const itemTotal = priceAtPurchase * quantity;
      total += itemTotal;

      return {
        productId: item.productId,
        quantity,
        priceAtPurchase,
      };
    });

    const orderResult = await orderModel.createOrder(userId, total);
    const orderId = orderResult.insertId;

    const orderItems = items.map((item) => ({
      ...item,
      orderId,
    }));

    await orderModel.insertOrderItems(orderItems);
    await cartModel.deleteCartItemsByIds(userId, cartIds);

    res.status(200).json({
      status: 200,
      message: "Order placed successfully",
      result: {
        orderId,
        userId,
        total: parseFloat(total.toFixed(2)),
        status: "pending",
        items: orderItems,
      },
    });
  } catch (error) {
    console.error("Place Order Error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
      result: null,
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await orderModel.getOrdersByUserId(userId);
    res.status(200).json({
      status: 200,
      message: "User orders fetched successfully",
      result: orders,
    });
  } catch (error) {
    console.error("Get User Orders Error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
      result: null,
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const order = await orderModel.getOrderByIdAndUser(orderId, userId);
    if (!order) {
      return res.status(404).json({
        status: 404,
        message: "Order not found",
        result: null,
      });
    }

    res.status(200).json({
      status: 200,
      message: "Order fetched successfully",
      result: order,
    });
  } catch (error) {
    console.error("Get Order By ID Error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
      result: null,
    });
  }
};

// ============== Search  filter product api == ======================================

exports.searchAndFilterProducts = async (req, res) => {
  try {
    const { search, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const filters = [];
    const values = [];

    if (search) {
      filters.push("title LIKE ?");
      values.push(`%${search}%`);
    }

    if (minPrice) {
      filters.push("price >= ?");
      values.push(Number(minPrice));
    }

    if (maxPrice) {
      filters.push("price <= ?");
      values.push(Number(maxPrice));
    }

    const whereClause =
      filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    const products = await productDb.searchProducts(
      whereClause,
      values,
      limit,
      offset
    );

    res.status(200).json({
      status: 200,
      message: "Products fetched successfully",
      result: products,
    });
  } catch (error) {
    console.error("Search Products Error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
      result: null,
    });
  }
};

////////////////////////////////////////////////////////////////////////////////
// console.log("productDb:", productDb);

exports.placeOrderCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartIds } = req.body;

    let cartItems;
    if (cartIds && cartIds.length > 0) {
      cartItems = await cartModel.getCartItemsByIds(userId, cartIds);
    } else {
      cartItems = await cartModel.getCartItemsForOrder(userId);
    }

    if (cartItems.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Cart is empty or cart items not found",
        result: null,
      });
    }

    for (const item of cartItems) {
      const product = await productDb.getProductById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          status: 400,
          message: `Insufficient stock for product ID ${item.productId}`,
          result: null,
        });
      }
    }

    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const orderResult = await orderModel.createOrder(userId, total);
    const orderId = orderResult.insertId;

    const items = cartItems.map((item) => ({
      orderId,
      productId: item.productId,
      quantity: item.quantity,
      priceAtPurchase: item.price,
    }));
    await orderModel.insertOrderItems(items);

    for (const item of cartItems) {
      await productDb.reduceStock(item.productId, item.quantity);
    }

    if (cartIds && cartIds.length > 0) {
      await cartModel.deleteCartItemsByIds(userId, cartIds);
    } else {
      await cartModel.clearUserCart(userId);
    }

    res.status(200).json({
      status: 200,
      message: "Order placed successfully",
      result: {
        orderId,
        userId,
        total,
        status: "pending",
        items,
      },
    });
  } catch (error) {
    console.error("Place Order Error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
      result: null,
    });
  }
};
