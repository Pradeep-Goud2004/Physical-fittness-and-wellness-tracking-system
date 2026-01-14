const express = require('express');
const Wellness = require('../models/Wellness');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/wellness
// @desc    Create wellness check-in
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const { date, sleepHours, waterIntake, stressLevel, isRestDay, mood, notes } = req.body;

    // Convert string numbers to actual numbers
    const wellnessData = {
      sleepHours: sleepHours ? Number(sleepHours) : undefined,
      waterIntake: waterIntake ? Number(waterIntake) : undefined,
      stressLevel: stressLevel ? Number(stressLevel) : 5,
      isRestDay: isRestDay || false,
      mood: mood || 'good',
      notes: notes || ''
    };

    // Check if entry exists for this date
    const entryDate = date ? new Date(date) : new Date();
    entryDate.setHours(0, 0, 0, 0);
    const existingWellness = await Wellness.findOne({
      userId: req.user._id,
      date: { $gte: entryDate, $lt: new Date(entryDate.getTime() + 24 * 60 * 60 * 1000) }
    });

    let wellness;
    if (existingWellness) {
      // Update existing entry
      if (wellnessData.sleepHours !== undefined) existingWellness.sleepHours = wellnessData.sleepHours;
      if (wellnessData.waterIntake !== undefined) existingWellness.waterIntake = wellnessData.waterIntake;
      if (wellnessData.stressLevel !== undefined) existingWellness.stressLevel = wellnessData.stressLevel;
      if (wellnessData.isRestDay !== undefined) existingWellness.isRestDay = wellnessData.isRestDay;
      if (wellnessData.mood) existingWellness.mood = wellnessData.mood;
      if (wellnessData.notes) existingWellness.notes = wellnessData.notes;
      wellness = await existingWellness.save();
    } else {
      // Create new entry
      wellness = new Wellness({
        userId: req.user._id,
        date: entryDate,
        ...wellnessData
      });
      await wellness.save();
    }

    res.status(201).json(wellness);
  } catch (error) {
    console.error('Wellness creation error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/wellness
// @desc    Get wellness logs
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const wellnessLogs = await Wellness.find(query).sort({ date: -1 });
    res.json(wellnessLogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/wellness/today
// @desc    Get today's wellness entry
// @access  Private
router.get('/today', authenticate, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const wellness = await Wellness.findOne({
      userId: req.user._id,
      date: { $gte: today, $lt: tomorrow }
    });

    if (!wellness) {
      return res.json(null);
    }

    res.json(wellness);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/wellness/:id
// @desc    Update wellness entry
// @access  Private
router.put('/:id', authenticate, async (req, res) => {
  try {
    const wellness = await Wellness.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!wellness) {
      return res.status(404).json({ message: 'Wellness entry not found' });
    }

    res.json(wellness);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

