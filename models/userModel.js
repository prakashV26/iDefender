const connection = require('../config/db');

// Get a user by email
const getUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};


// Create a new user
const createUser = (name, email, password, role) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    connection.query(query, [name, email, password, role], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Get a user by ID
const getUserById = (id) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE id = ?';
      connection.query(query, [id], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results[0]); // Return the first result (if any)
      });
    });
  };
  

module.exports = {
  getUserByEmail,
  createUser,
  getUserById
};
