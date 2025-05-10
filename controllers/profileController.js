const User = require('../models/User');
const Task = require('../models/Task');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = 'public/uploads/profiles';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
}).single('profileImage');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/tasks');
    }

    const totalTasks = await Task.countDocuments({ user: req.user.id });
    const completedTasks = await Task.countDocuments({ user: req.user.id, status: 'completed' });
    const inProgressTasks = await Task.countDocuments({ user: req.user.id, status: 'in-progress' });
    const pendingTasks = await Task.countDocuments({ user: req.user.id, status: 'pending' });

    res.render('profile', {
      title: 'My Profile',
      user: req.user,
      profileUser: user,
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    req.flash('error', 'An error occurred while fetching profile');
    res.redirect('/tasks');
  }
};

exports.getEditProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/tasks');
    }

    res.render('editProfile', {
      title: 'Edit Profile',
      user: req.user,
      profileUser: user,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Error getting edit profile page:', error);
    req.flash('error', 'An error occurred while fetching profile data');
    res.redirect('/profile');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    upload(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        req.flash('error', `File upload error: ${err.message}`);
        return res.redirect('/profile/edit');
      } else if (err) {
        req.flash('error', err.message || 'Error uploading file');
        return res.redirect('/profile/edit');
      }
      
      const { username, email, bio, phone } = req.body;
      
      if (username !== req.user.username) {
        const usernameExists = await User.findOne({ username, _id: { $ne: req.user.id } });
        if (usernameExists) {
          req.flash('error', 'Username already in use');
          return res.redirect('/profile/edit');
        }
      }
      
      if (email !== req.user.email) {
        const emailExists = await User.findOne({ email, _id: { $ne: req.user.id } });
        if (emailExists) {
          req.flash('error', 'Email already in use');
          return res.redirect('/profile/edit');
        }
      }
      
      const updateData = {
        username,
        email,
        bio,
        phone,
        profileCompleted: true
      };
      
      if (req.file) {
        const currentUser = await User.findById(req.user.id);
        if (currentUser.profileImage && 
            currentUser.profileImage !== '/images/default-avatar.png' && 
            fs.existsSync(path.join('public', currentUser.profileImage))) {
          fs.unlinkSync(path.join('public', currentUser.profileImage));
        }
        
        updateData.profileImage = `/uploads/profiles/${req.file.filename}`;
      }
      
      await User.findByIdAndUpdate(req.user.id, updateData, { new: true });
      
      req.flash('success', 'Profile updated successfully');
      res.redirect('/profile');
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    req.flash('error', 'An error occurred while updating profile');
    res.redirect('/profile/edit');
  }
};

exports.getChangePassword = (req, res) => {
  res.render('changePassword', {
    title: 'Change Password',
    user: req.user,
    success: req.flash('success'),
    error: req.flash('error')
  });
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    if (newPassword !== confirmPassword) {
      req.flash('error', 'New passwords do not match');
      return res.redirect('/profile/change-password');
    }
    
    const user = await User.findById(req.user.id);
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      req.flash('error', 'Current password is incorrect');
      return res.redirect('/profile/change-password');
    }
    
    user.password = newPassword;
    await user.save();
    
    req.flash('success', 'Password updated successfully');
    res.redirect('/profile');
  } catch (error) {
    console.error('Error updating password:', error);
    req.flash('error', 'An error occurred while updating password');
    res.redirect('/profile/change-password');
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    upload(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      
      const currentUser = await User.findById(req.user.id);
      if (currentUser.profileImage && 
          currentUser.profileImage !== '/images/default-avatar.png' && 
          fs.existsSync(path.join('public', currentUser.profileImage))) {
        fs.unlinkSync(path.join('public', currentUser.profileImage));
      }
      
      const profileImage = `/uploads/profiles/${req.file.filename}`;
      
      const updatedUser = await User.findByIdAndUpdate(req.user.id, { profileImage }, { new: true });
      
      req.user.profileImage = profileImage;
      
      res.json({ 
        success: true, 
        message: 'Profile image updated successfully',
        profileImage,
        reload: true
      });
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}; 