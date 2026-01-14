const express = require('express');
const User = require('../models/User');
const Workout = require('../models/Workout');
const Nutrition = require('../models/Nutrition');
const Wellness = require('../models/Wellness');
const Progress = require('../models/Progress');
const WorkoutPlan = require('../models/WorkoutPlan');
const { authenticate, isAdmin } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get single user details
// @access  Private (Admin only)
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user || user.role !== 'user') {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get aggregated analytics for all users
// @access  Private (Admin only)
router.get('/analytics', async (req, res) => {
  try {
    const thirtyDaysAgo = moment().subtract(30, 'days').toDate();

    // Total users
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Active users (worked out in last 30 days)
    const activeUserIds = await Workout.distinct('userId', {
      date: { $gte: thirtyDaysAgo }
    });
    const activeUsers = activeUserIds.length;

    // Total workouts
    const totalWorkouts = await Workout.countDocuments({
      date: { $gte: thirtyDaysAgo }
    });

    // Total calories burned
    const workouts = await Workout.find({ date: { $gte: thirtyDaysAgo } });
    const totalCaloriesBurned = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

    // Average workouts per user
    const avgWorkoutsPerUser = activeUsers > 0 ? totalWorkouts / activeUsers : 0;

    // Inactive users
    const allUserIds = await User.find({ role: 'user' }).distinct('_id');
    const inactiveUserIds = allUserIds.filter(id => !activeUserIds.includes(id.toString()));
    const inactiveUsers = inactiveUserIds.length;

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalWorkouts,
      totalCaloriesBurned,
      avgWorkoutsPerUser: Math.round(avgWorkoutsPerUser * 10) / 10
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/users/:id/performance
// @desc    Get user performance data
// @access  Private (Admin only)
router.get('/users/:id/performance', async (req, res) => {
  try {
    const userId = req.params.id;
    const thirtyDaysAgo = moment().subtract(30, 'days').toDate();

    const workouts = await Workout.find({
      userId,
      date: { $gte: thirtyDaysAgo }
    });

    const nutrition = await Nutrition.find({
      userId,
      date: { $gte: thirtyDaysAgo }
    });

    const progress = await Progress.find({
      userId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });

    res.json({
      workouts: workouts.length,
      totalCaloriesBurned: workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
      avgDailyCalories: nutrition.length > 0
        ? nutrition.reduce((sum, n) => sum + (n.totalCalories || 0), 0) / nutrition.length
        : 0,
      weightProgress: progress.map(p => ({
        date: p.date,
        weight: p.weight
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/workout-plans
// @desc    Create workout plan template
// @access  Private (Admin only)
router.post('/workout-plans', async (req, res) => {
  try {
    const { name, description, duration, exercises, isTemplate, assignedTo } = req.body;

    const workoutPlan = new WorkoutPlan({
      createdBy: req.user._id,
      assignedTo: assignedTo || null,
      name,
      description,
      duration,
      exercises,
      isTemplate: isTemplate !== undefined ? isTemplate : true
    });

    await workoutPlan.save();
    res.status(201).json(workoutPlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/workout-plans
// @desc    Get all workout plans
// @access  Private (Admin only)
router.get('/workout-plans', async (req, res) => {
  try {
    const workoutPlans = await WorkoutPlan.find()
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(workoutPlans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/workout-plans/:id/assign
// @desc    Assign workout plan to user
// @access  Private (Admin only)
router.put('/workout-plans/:id/assign', async (req, res) => {
  try {
    const { userId } = req.body;

    const workoutPlan = await WorkoutPlan.findByIdAndUpdate(
      req.params.id,
      { assignedTo: userId, isActive: true },
      { new: true }
    );

    if (!workoutPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    res.json(workoutPlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/inactive-users
// @desc    Get inactive users
// @access  Private (Admin only)
router.get('/inactive-users', async (req, res) => {
  try {
    const daysInactive = parseInt(req.query.days) || 7;
    const cutoffDate = moment().subtract(daysInactive, 'days').toDate();

    const activeUserIds = await Workout.distinct('userId', {
      date: { $gte: cutoffDate }
    });

    const inactiveUsers = await User.find({
      role: 'user',
      _id: { $nin: activeUserIds }
    }).select('-password');

    res.json(inactiveUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

