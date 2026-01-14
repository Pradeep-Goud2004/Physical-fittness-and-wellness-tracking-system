const express = require('express');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile and fitness goals
// @access  Private
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { height, weight, age, activityLevel, dietPreference, fitnessGoals } = req.body;

    const updateData = {};
    if (height !== undefined) updateData['profile.height'] = height;
    if (weight !== undefined) updateData['profile.weight'] = weight;
    if (age !== undefined) updateData['profile.age'] = age;
    if (activityLevel) updateData['profile.activityLevel'] = activityLevel;
    if (dietPreference) updateData['profile.dietPreference'] = dietPreference;
    if (fitnessGoals) updateData['profile.fitnessGoals'] = fitnessGoals;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

