const connection = require('../config/db'); // Your DB connection

const createProduct = ({ title, description, price, images, stock }) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO products (title, description, price, images, stock)
      VALUES (?, ?, ?, ?, ?)
    `;
    connection.query(query, [title, description, price, images, stock], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const updateProduct = (id, { title, description, price, images, stock }) => {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE products 
        SET title = ?, description = ?, price = ?, images = ?, stock = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      connection.query(query, [title, description, price, images, stock, id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  };

  // Get all products
const getAllProducts = () => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM products ORDER BY created_at DESC';
      connection.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  };
  
  // Get product by ID
  const getProductById = (id) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM products WHERE id = ?';
      connection.query(query, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]); // return first match
      });
    });
  };

  const deleteProductById = (id) => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM products WHERE id = ?';
      connection.query(query, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  };
  
  const searchProducts = (whereClause, values, limit, offset) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT id, title, description, price, stock
        FROM products
        ${whereClause}
        LIMIT ? OFFSET ?
      `;
      connection.query(sql, [...values, parseInt(limit), parseInt(offset)], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  };
  
  const reduceStock = (productId, quantity) => {
    return new Promise((resolve, reject) => {
      connection.query(
        "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
        [quantity, productId, quantity], // Prevent negative stock
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  };
  
  
  

  module.exports = {
    createProduct,
    updateProduct,
    getAllProducts,
    getProductById,
    deleteProductById,
    searchProducts,
    reduceStock,
  };
  
