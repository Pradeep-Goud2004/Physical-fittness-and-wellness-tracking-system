const express = require('express');
const Workout = require('../models/Workout');
const { authenticate } = require('../middleware/auth');
const Gamification = require('../models/Gamification');
const moment = require('moment');

const router = express.Router();

// @route   POST /api/workouts
// @desc    Create a new workout
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const { date, workoutType, exercises, totalDuration, caloriesBurned, notes } = req.body;

    // Filter out empty exercises and ensure exercises array is valid
    const validExercises = exercises && Array.isArray(exercises) 
      ? exercises.filter(ex => ex && ex.exerciseName && ex.exerciseName.trim() !== '')
      : [];

    const workout = new Workout({
      userId: req.user._id,
      date: date || new Date(),
      workoutType,
      exercises: validExercises.length > 0 ? validExercises : [],
      totalDuration: Number(totalDuration),
      caloriesBurned: caloriesBurned ? Number(caloriesBurned) : 0,
      notes: notes || ''
    });

    await workout.save();

    // Update gamification
    await updateGamification(req.user._id, caloriesBurned || 0);

    res.status(201).json(workout);
  } catch (error) {
    console.error('Workout creation error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/workouts
// @desc    Get all workouts for user
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { startDate, endDate, workoutType } = req.query;
    const query = { userId: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (workoutType) {
      query.workoutType = workoutType;
    }

    const workouts = await Workout.find(query).sort({ date: -1 });
    res.json(workouts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/workouts/:id
// @desc    Get single workout
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json(workout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/workouts/:id
// @desc    Update workout
// @access  Private
router.put('/:id', authenticate, async (req, res) => {
  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json(workout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/workouts/:id
// @desc    Delete workout
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/workouts/summary/weekly
// @desc    Get weekly workout summary
// @access  Private
router.get('/summary/weekly', authenticate, async (req, res) => {
  try {
    const startOfWeek = moment().startOf('week').toDate();
    const endOfWeek = moment().endOf('week').toDate();

    const workouts = await Workout.find({
      userId: req.user._id,
      date: { $gte: startOfWeek, $lte: endOfWeek }
    });

    const summary = {
      totalWorkouts: workouts.length,
      totalDuration: workouts.reduce((sum, w) => sum + (w.totalDuration || 0), 0),
      totalCaloriesBurned: workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
      workoutsByType: {}
    };

    workouts.forEach(workout => {
      const type = workout.workoutType;
      summary.workoutsByType[type] = (summary.workoutsByType[type] || 0) + 1;
    });

    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to update gamification
async function updateGamification(userId, caloriesBurned) {
  let gamification = await Gamification.findOne({ userId });
  
  if (!gamification) {
    gamification = new Gamification({ userId });
  }

  gamification.totalWorkouts += 1;
  gamification.totalCaloriesBurned += caloriesBurned;
  gamification.experiencePoints += Math.floor(caloriesBurned / 10);
  
  // Check for streak
  const today = moment().startOf('day');
  const yesterday = moment().subtract(1, 'day').startOf('day');
  
  // This is simplified - in production, you'd track last workout date
  gamification.currentStreak += 1;
  if (gamification.currentStreak > gamification.longestStreak) {
    gamification.longestStreak = gamification.currentStreak;
  }

  // Level up calculation (every 1000 XP = 1 level)
  const newLevel = Math.floor(gamification.experiencePoints / 1000) + 1;
  if (newLevel > gamification.level) {
    gamification.level = newLevel;
  }

  await gamification.save();
}

module.exports = router;

