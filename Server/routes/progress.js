const express = require('express');
const Progress = require('../models/Progress');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/progress
// @desc    Log progress data
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const { date, weight, bodyMeasurements, bodyFatPercentage, muscleMass, notes } = req.body;

    // Convert string numbers to actual numbers and clean bodyMeasurements
    const cleanBodyMeasurements = bodyMeasurements ? {
      chest: bodyMeasurements.chest ? Number(bodyMeasurements.chest) : undefined,
      waist: bodyMeasurements.waist ? Number(bodyMeasurements.waist) : undefined,
      hips: bodyMeasurements.hips ? Number(bodyMeasurements.hips) : undefined,
      biceps: bodyMeasurements.biceps ? Number(bodyMeasurements.biceps) : undefined,
      thighs: bodyMeasurements.thighs ? Number(bodyMeasurements.thighs) : undefined
    } : undefined;

    const progress = new Progress({
      userId: req.user._id,
      date: date || new Date(),
      weight: weight ? Number(weight) : undefined,
      bodyMeasurements: cleanBodyMeasurements,
      bodyFatPercentage: bodyFatPercentage ? Number(bodyFatPercentage) : undefined,
      muscleMass: muscleMass ? Number(muscleMass) : undefined,
      notes: notes || ''
    });

    await progress.save();
    res.status(201).json(progress);
  } catch (error) {
    console.error('Progress creation error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/progress
// @desc    Get progress data
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

    const progressData = await Progress.find(query).sort({ date: -1 });
    res.json(progressData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/progress/weight
// @desc    Get weight progress chart data
// @access  Private
router.get('/weight', authenticate, async (req, res) => {
  try {
    const progressData = await Progress.find({
      userId: req.user._id,
      weight: { $exists: true, $ne: null }
    })
    .sort({ date: 1 })
    .select('date weight');

    res.json(progressData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/progress/measurements
// @desc    Get body measurements trend
// @access  Private
router.get('/measurements', authenticate, async (req, res) => {
  try {
    const progressData = await Progress.find({
      userId: req.user._id,
      bodyMeasurements: { $exists: true }
    })
    .sort({ date: 1 })
    .select('date bodyMeasurements');

    res.json(progressData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/progress/:id
// @desc    Update progress entry
// @access  Private
router.put('/:id', authenticate, async (req, res) => {
  try {
    const progress = await Progress.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!progress) {
      return res.status(404).json({ message: 'Progress entry not found' });
    }

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

