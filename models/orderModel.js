const connection = require("../config/db");

exports.createOrder = (userId, total) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "INSERT INTO orders (userId, total, status, createdAt) VALUES (?, ?, 'pending', NOW())",
      [userId, total],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

// Insert multiple items into order_items table
exports.insertOrderItems = (items) => {
  return new Promise((resolve, reject) => {
    const values = items.map((item) => [
      item.orderId,
      item.productId,
      item.quantity,
      item.priceAtPurchase,
    ]);
    connection.query(
      "INSERT INTO order_items (orderId, productId, quantity, priceAtPurchase) VALUES ?",
      [values],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

exports.updateOrderStatus = (id, status) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "UPDATE orders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [status, id],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

exports.getOrderById = (id) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM orders WHERE id = ?",
      [id],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0]); // Return the first result if exists
      }
    );
  });
};

// models/orderModel.js
exports.getOrdersByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT o.id AS orderId, o.total, o.status, o.createdAt,
               oi.productId, oi.quantity, oi.priceAtPurchase
        FROM orders o
        JOIN order_items oi ON o.id = oi.orderId
        WHERE o.userId = ?
        ORDER BY o.createdAt DESC
      `;
    connection.query(sql, [userId], (err, results) => {
      if (err) return reject(err);

      // Group by orderId
      const grouped = {};
      results.forEach((row) => {
        if (!grouped[row.orderId]) {
          grouped[row.orderId] = {
            orderId: row.orderId,
            total: row.total,
            status: row.status,
            createdAt: row.createdAt,
            items: [],
          };
        }
        grouped[row.orderId].items.push({
          productId: row.productId,
          quantity: row.quantity,
          priceAtPurchase: row.priceAtPurchase,
        });
      });

      resolve(Object.values(grouped));
    });
  });
};

exports.getOrderByIdAndUser = (orderId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT o.id AS orderId, o.total, o.status, o.createdAt,
               oi.productId, oi.quantity, oi.priceAtPurchase
        FROM orders o
        JOIN order_items oi ON o.id = oi.orderId
        WHERE o.id = ? AND o.userId = ?
      `;
    connection.query(sql, [orderId, userId], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return resolve(null);

      const order = {
        orderId: results[0].orderId,
        total: results[0].total,
        status: results[0].status,
        createdAt: results[0].createdAt,
        items: results.map((row) => ({
          productId: row.productId,
          quantity: row.quantity,
          priceAtPurchase: row.priceAtPurchase,
        })),
      };

      resolve(order);
    });
  });
};

exports.getAllOrdersWithItems = () => {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT 
          o.id AS orderId, o.userId, o.total, o.status, o.createdAt,
          oi.productId, oi.quantity, oi.priceAtPurchase
        FROM orders o
        JOIN order_items oi ON o.id = oi.orderId
        ORDER BY o.createdAt DESC
      `;

    connection.query(sql, (err, results) => {
      if (err) return reject(err);

      // Group by orderId
      const grouped = {};
      results.forEach((row) => {
        if (!grouped[row.orderId]) {
          grouped[row.orderId] = {
            orderId: row.orderId,
            userId: row.userId,
            total: row.total,
            status: row.status,
            createdAt: row.createdAt,
            items: [],
          };
        }

        grouped[row.orderId].items.push({
          productId: row.productId,
          quantity: row.quantity,
          priceAtPurchase: row.priceAtPurchase,
        });
      });

      resolve(Object.values(grouped));
    });
  });
};
