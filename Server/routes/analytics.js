const express = require('express');
const Workout = require('../models/Workout');
const Nutrition = require('../models/Nutrition');
const Wellness = require('../models/Wellness');
const Progress = require('../models/Progress');
const Gamification = require('../models/Gamification');
const { authenticate } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const thirtyDaysAgo = moment().subtract(30, 'days').toDate();

    // Workout analytics
    const recentWorkouts = await Workout.find({
      userId,
      date: { $gte: thirtyDaysAgo }
    });

    const totalWorkouts = recentWorkouts.length;
    const totalCaloriesBurned = recentWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    const totalDuration = recentWorkouts.reduce((sum, w) => sum + (w.totalDuration || 0), 0);
    const avgWorkoutsPerWeek = totalWorkouts / 4.3;

    // Workout streak
    const gamification = await Gamification.findOne({ userId });
    const currentStreak = gamification?.currentStreak || 0;

    // Nutrition analytics
    const recentNutrition = await Nutrition.find({
      userId,
      date: { $gte: thirtyDaysAgo }
    });

    const avgDailyCalories = recentNutrition.length > 0
      ? recentNutrition.reduce((sum, n) => sum + (n.totalCalories || 0), 0) / recentNutrition.length
      : 0;

    // Wellness analytics
    const recentWellness = await Wellness.find({
      userId,
      date: { $gte: thirtyDaysAgo }
    });

    const avgSleepHours = recentWellness.length > 0
      ? recentWellness.reduce((sum, w) => sum + (w.sleepHours || 0), 0) / recentWellness.length
      : 0;

    const avgWaterIntake = recentWellness.length > 0
      ? recentWellness.reduce((sum, w) => sum + (w.waterIntake || 0), 0) / recentWellness.length
      : 0;

    // Progress analytics
    const recentProgress = await Progress.find({
      userId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });

    let weightChange = 0;
    if (recentProgress.length >= 2) {
      const firstWeight = recentProgress[0].weight;
      const lastWeight = recentProgress[recentProgress.length - 1].weight;
      if (firstWeight && lastWeight) {
        weightChange = lastWeight - firstWeight;
      }
    }

    // Consistency score (0-100)
    const expectedWorkouts = Math.floor(moment().diff(moment(thirtyDaysAgo), 'days') / 2); // Assuming workout every 2 days
    const consistencyScore = Math.min(100, Math.round((totalWorkouts / expectedWorkouts) * 100));

    // Fatigue detection (simplified)
    const lastWeekWorkouts = recentWorkouts.filter(w => 
      moment(w.date).isAfter(moment().subtract(7, 'days'))
    );
    const fatigueLevel = lastWeekWorkouts.length > 6 ? 'high' : lastWeekWorkouts.length > 4 ? 'medium' : 'low';

    res.json({
      workouts: {
        total: totalWorkouts,
        totalCaloriesBurned,
        totalDuration,
        avgPerWeek: Math.round(avgWorkoutsPerWeek * 10) / 10,
        currentStreak
      },
      nutrition: {
        avgDailyCalories: Math.round(avgDailyCalories)
      },
      wellness: {
        avgSleepHours: Math.round(avgSleepHours * 10) / 10,
        avgWaterIntake: Math.round(avgWaterIntake * 10) / 10
      },
      progress: {
        weightChange: Math.round(weightChange * 10) / 10
      },
      metrics: {
        consistencyScore,
        fatigueLevel
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/analytics/workout-heatmap
// @desc    Get workout consistency heatmap data
// @access  Private
router.get('/workout-heatmap', authenticate, async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const startDate = moment().subtract(parseInt(days), 'days').toDate();

    const workouts = await Workout.find({
      userId: req.user._id,
      date: { $gte: startDate }
    }).select('date');

    // Create heatmap data
    const heatmapData = {};
    workouts.forEach(workout => {
      const dateKey = moment(workout.date).format('YYYY-MM-DD');
      heatmapData[dateKey] = (heatmapData[dateKey] || 0) + 1;
    });

    res.json(heatmapData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/analytics/overtraining-alert
// @desc    Check for overtraining alerts
// @access  Private
router.get('/overtraining-alert', authenticate, async (req, res) => {
  try {
    const lastWeek = moment().subtract(7, 'days').toDate();
    const workouts = await Workout.find({
      userId: req.user._id,
      date: { $gte: lastWeek }
    });

    const totalDuration = workouts.reduce((sum, w) => sum + (w.totalDuration || 0), 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

    const alerts = [];
    if (workouts.length > 7) {
      alerts.push({
        type: 'overtraining',
        message: 'You\'ve worked out more than 7 times this week. Consider taking a rest day.',
        severity: 'high'
      });
    }

    if (totalDuration > 600) { // More than 10 hours
      alerts.push({
        type: 'excessive_duration',
        message: 'You\'ve logged over 10 hours of workouts this week. Make sure to rest!',
        severity: 'medium'
      });
    }

    res.json({ alerts, hasAlerts: alerts.length > 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

