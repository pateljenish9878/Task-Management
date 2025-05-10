const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOTPEmail } = require('../config/mail');

exports.getLogin = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.getRegister = (req, res) => {
  res.render('register', { title: 'Register' });
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    
    if (password !== confirmPassword) {
      return res.status(400).render('register', { 
        title: 'Register',
        error: 'Passwords do not match',
        username,
        email
      });
    }
    
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).render('register', { 
        title: 'Register',
        error: 'User with this email or username already exists',
        username: existingUser.username !== username ? username : '',
        email: existingUser.email !== email ? email : ''
      });
    }
    
    const user = new User({
      username,
      email,
      password
    });
    
    await user.save();
    
    res.redirect('/login');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).render('register', { 
      title: 'Register',
      error: 'An error occurred during registration',
      username: req.body.username,
      email: req.body.email
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).render('login', { 
        title: 'Login',
        error: 'Invalid email or password',
        email
      });
    }
    
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).render('login', { 
        title: 'Login',
        error: 'Invalid email or password',
        email
      });
    }
    
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        role: user.role,
        email: user.email
      },
      'task-management-app',
      { expiresIn: '1d' }
    );
    
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 24 * 60 * 60 * 1000
    });
    
    
    res.redirect('/tasks');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).render('login', { 
      title: 'Login',
      error: 'An error occurred during login',
      email: req.body.email
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/login');
};

exports.getForgotPassword = (req, res) => {
  res.render('forgot-password', { title: 'Forgot Password' });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).render('forgot-password', {
        title: 'Forgot Password',
        error: 'No account found with that email address',
        email
      });
    }
    
    const otp = crypto.randomInt(100000, 999999).toString();
    
    await OTP.findOneAndDelete({ email }); // Delete any existing OTP
    const otpDoc = await new OTP({ email, otp }).save();
    
    let emailSent = false;
    try {
      emailSent = await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }
    res.render('verify-otp', {
      title: 'Verify OTP',
      email,
      success: emailSent 
        ? 'An OTP has been sent to your email address.' 
        : 'Email sending failed'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).render('forgot-password', {
      title: 'Forgot Password',
      error: 'An error occurred. Please try again.',
      email: req.body.email
    });
  }
};

exports.getVerifyOTP = (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.redirect('/forgot-password');
  }
  res.render('verify-otp', { title: 'Verify OTP', email });
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const otpRecord = await OTP.findOne({ email, otp });
    
    if (!otpRecord) {
      return res.status(400).render('verify-otp', {
        title: 'Verify OTP',
        error: 'Invalid or expired OTP',
        email
      });
    }
    
    res.render('reset-password', {
      title: 'Reset Password',
      email,
      otp
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).render('verify-otp', {
      title: 'Verify OTP',
      error: 'An error occurred. Please try again.',
      email: req.body.email
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;
    
    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).render('reset-password', {
        title: 'Reset Password',
        error: 'Passwords do not match',
        email,
        otp
      });
    }
    
    const otpRecord = await OTP.findOne({ email, otp });
    
    if (!otpRecord) {
      return res.status(400).render('verify-otp', {
        title: 'Verify OTP',
        error: 'Invalid or expired OTP',
        email
      });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).render('reset-password', {
        title: 'Reset Password',
        error: 'User not found',
        email,
        otp
      });
    }
    
    user.password = password;
    await user.save();
    
    await OTP.findOneAndDelete({ email });
    
    res.render('login', {
      title: 'Login',
      success: 'Password reset successful. Please log in with your new password.',
      email
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).render('reset-password', {
      title: 'Reset Password',
      error: 'An error occurred. Please try again.',
      email: req.body.email,
      otp: req.body.otp
    });
  }
}; 