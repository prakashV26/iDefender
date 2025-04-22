const connection = require("../config/db");

exports.checkUserExists = (userId) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM users WHERE id = ?",
      [userId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0);
      }
    );
  });
};

exports.checkProductExists = (productId) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM products WHERE id = ?",
      [productId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0 ? results[0] : null);
      }
    );
  });
};

exports.addToCart = (userId, productId, quantity, totalPrice) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "INSERT INTO cart (userId, productId, quantity, totalPrice) VALUES (?, ?, ?, ?)",
      [userId, productId, quantity, totalPrice],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

exports.checkCartItemExists = (cartId) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM cart WHERE id = ?",
      [cartId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0 ? results[0] : null);
      }
    );
  });
};

exports.updateCartItem = (cartId, quantity, totalPrice) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "UPDATE cart SET quantity = ?, totalPrice = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [quantity, totalPrice, cartId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

exports.getCartByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT 
          c.id AS cartId,
          c.productId,
          p.title,
          p.price,
          c.quantity,
          c.totalPrice,
          c.created_at,
          c.updated_at
         FROM cart c
         JOIN products p ON c.productId = p.id
         WHERE c.userId = ?`,
      [userId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

exports.deleteCartItem = (cartId) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "DELETE FROM cart WHERE id = ?",
      [cartId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

exports.clearUserCart = (userId) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "DELETE FROM cart WHERE userId = ?",
      [userId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

// for order
// Get cart items with product price
exports.getCartItemsForOrder = (userId) => {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT c.productId, c.quantity, p.price, c.totalPrice
         FROM cart c
         JOIN products p ON c.productId = p.id
         WHERE c.userId = ?`,
      [userId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

// Get specific cart items by userId and cartIds
exports.getCartItemsByIds = (userId, cartIds) => {
  return new Promise((resolve, reject) => {
    const placeholders = cartIds.map(() => "?").join(",");
    const sql = `
        SELECT c.id as cartId, c.productId, c.quantity, p.price
        FROM cart c
        JOIN products p ON c.productId = p.id
        WHERE c.userId = ? AND c.id IN (${placeholders})
      `;
    connection.query(sql, [userId, ...cartIds], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Delete specific cart items by userId and cartIds
exports.deleteCartItemsByIds = (userId, cartIds) => {
  return new Promise((resolve, reject) => {
    const placeholders = cartIds.map(() => "?").join(",");
    const sql = `DELETE FROM cart WHERE userId = ? AND id IN (${placeholders})`;
    connection.query(sql, [userId, ...cartIds], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};
