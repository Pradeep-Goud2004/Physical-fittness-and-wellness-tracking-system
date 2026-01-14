const express = require('express');
const Gamification = require('../models/Gamification');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/gamification
// @desc    Get user's gamification data
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    let gamification = await Gamification.findOne({ userId: req.user._id });

    if (!gamification) {
      gamification = new Gamification({ userId: req.user._id });
      await gamification.save();
    }

    res.json(gamification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/gamification/leaderboard
// @desc    Get leaderboard
// @access  Private
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const { type = 'experiencePoints' } = req.query;

    const leaderboard = await Gamification.find()
      .populate('userId', 'name email')
      .sort({ [type]: -1 })
      .limit(100)
      .select('userId currentStreak longestStreak totalWorkouts totalCaloriesBurned level experiencePoints badges achievements');

    res.json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/gamification/badges
// @desc    Award badge (Admin only, but accessible for testing)
// @access  Private
router.post('/badges', authenticate, async (req, res) => {
  try {
    const { userId, badgeName, description } = req.body;
    const targetUserId = userId || req.user._id;

    let gamification = await Gamification.findOne({ userId: targetUserId });

    if (!gamification) {
      gamification = new Gamification({ userId: targetUserId });
    }

    // Check if badge already exists
    const badgeExists = gamification.badges.some(b => b.badgeName === badgeName);
    if (!badgeExists) {
      gamification.badges.push({
        badgeName,
        description: description || '',
        earnedDate: new Date()
      });
      await gamification.save();
    }

    res.json(gamification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

