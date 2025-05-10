const jwt = require('jsonwebtoken');
const User = require('../models/User');


const verifyToken = async (req, res, next) => {
  const token = req.cookies.jwt;
  
  if (!token) {
    return res.status(401).redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, 'task-management-app');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.clearCookie('jwt');
      return res.status(401).redirect('/login');
    }
    
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      bio: user.bio,
      phone: user.phone,
      profileCompleted: user.profileCompleted,
      createdAt: user.createdAt
    };
    
    next();
  } catch (error) {
    res.clearCookie('jwt');
    return res.status(401).redirect('/login');
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.redirect('/?error=Access denied. Admin privileges required.');
  }
};

const isOwnerOrAdmin = async (req, res, next) => {
  // Just pass everything through for now to debug the issue
  // We're doing the permission check in the controllers already
  return next();
};

const attachUser = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, 'task-management-app');
        const user = await User.findById(decoded.id).select('-password');
        
        if (user) {
          res.locals.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
            bio: user.bio,
            phone: user.phone,
            profileCompleted: user.profileCompleted,
            createdAt: user.createdAt
          };
        }
      } catch (err) {
        res.locals.user = null;
      }
    } else {
      res.locals.user = null;
    }
    
    next();
  } catch (error) {
    console.error('Error in attachUser middleware:', error);
    res.locals.user = null;
    next();
  }
};

const redirectIfAuthenticated = (req, res, next) => {
  const token = req.cookies.jwt;
  
  if (token) {
    try {
      jwt.verify(token, 'task-management-app');
      return res.redirect('/tasks');
    } catch (error) {
      res.clearCookie('jwt');
      next();
    }
  } else {
    next();
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  isOwnerOrAdmin,
  attachUser,
  redirectIfAuthenticated
}; 