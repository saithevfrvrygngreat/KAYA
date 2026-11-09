const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'kaya_luxury_super_secret_jwt_key_2026_modern_secure';

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated. Please log in.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
};

const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user) req.user = user;
  } catch (err) {
    // silently ignore invalid optional token
  }
  next();
};

const adminOnly = (req, res, next) => {
  const isAdmin = req.user && (req.user.is_admin === true || req.user.role === 'admin' || req.user.role === 'administrator');
  if (!isAdmin) {
    return res.status(403).json({ message: 'Access denied: administrator privileges required.' });
  }
  next();
};

module.exports = { protect, optionalAuth, adminOnly };

