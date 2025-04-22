const jwt = require('jsonwebtoken');
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: 'Token missing',
      result: null
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = decoded;
    next(); 
  } catch (error) {
    res.status(401).json({
      status: 401,
      message: 'Invalid or expired token',
      result: null
    });
  }
};

module.exports = verifyToken;
