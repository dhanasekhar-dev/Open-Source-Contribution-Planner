console.log("authMiddleware loaded");
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
const protect = async (req, res, next) => {
  console.error("ENTERING PROTECT MIDDLEWARE");
  console.error("PROTECT MIDDLEWARE CALLED");
  console.log("Authorization header:", req.headers.authorization);
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log("Token received:", token);

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (excluding password)
      console.log("Token decoded:", decoded);
      req.user = await User.findById(decoded.userId).select('-password');

      return next();
    } catch (error) {
      console.log("Error in protect middleware:", error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

// Optional auth - attaches user if valid token exists, but does not block if unauthenticated
const optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (token && token !== 'null' && token !== 'undefined') {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId).select('-password');
      }
    } catch (error) {
      console.log('Optional auth token invalid, proceeding as unauthenticated visitor:', error.message);
      req.user = null;
    }
  } else {
    req.user = null;
  }
  return next();
};

module.exports = { protect, optionalAuth };