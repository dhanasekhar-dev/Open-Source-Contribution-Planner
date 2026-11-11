const User = require('../models/User');

// @desc    Get logged-in user's profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update fields if provided in request body
    const { name, avatar, languages, skills, experienceLevel, interests, availableHours } = req.body;

    if (name !== undefined) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (languages !== undefined) user.languages = languages;
    if (skills !== undefined) user.skills = skills;
    if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
    if (interests !== undefined) user.interests = interests;
    if (availableHours !== undefined) user.availableHours = availableHours;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar || '',
        languages: updatedUser.languages,
        skills: updatedUser.skills,
        experienceLevel: updatedUser.experienceLevel,
        interests: updatedUser.interests,
        availableHours: updatedUser.availableHours
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile
};