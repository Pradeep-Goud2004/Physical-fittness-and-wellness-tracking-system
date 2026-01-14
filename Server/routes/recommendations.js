const express = require('express');
const Workout = require('../models/Workout');
const Wellness = require('../models/Wellness');
const Nutrition = require('../models/Nutrition');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();

// @route   GET /api/recommendations
// @desc    Get personalized recommendations
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const recommendations = [];

    // Get user profile
    const user = await User.findById(userId);
    const fitnessGoals = user.profile?.fitnessGoals || [];

    // Check last workout
    const lastWorkout = await Workout.findOne({ userId })
      .sort({ date: -1 });

    const daysSinceLastWorkout = lastWorkout
      ? moment().diff(moment(lastWorkout.date), 'days')
      : 999;

    // Rest day recommendation
    if (daysSinceLastWorkout > 3) {
      recommendations.push({
        type: 'workout_reminder',
        priority: 'high',
        message: `It's been ${daysSinceLastWorkout} days since your last workout. Time to get back in the gym!`,
        action: 'Start a workout'
      });
    } else if (daysSinceLastWorkout === 0) {
      recommendations.push({
        type: 'rest_day',
        priority: 'medium',
        message: 'You worked out today. Make sure to get adequate rest and recovery!',
        action: 'Log rest day'
      });
    }

    // Hydration recommendation
    const todayWellness = await Wellness.findOne({
      userId,
      date: {
        $gte: moment().startOf('day').toDate(),
        $lt: moment().endOf('day').toDate()
      }
    });

    if (!todayWellness || (todayWellness.waterIntake || 0) < 2) {
      recommendations.push({
        type: 'hydration',
        priority: 'medium',
        message: 'Remember to stay hydrated! Aim for 2-3 liters of water per day.',
        action: 'Log water intake'
      });
    }

    // Nutrition recommendations based on goals
    if (fitnessGoals.includes('muscle_gain')) {
      const todayNutrition = await Nutrition.findOne({
        userId,
        date: {
          $gte: moment().startOf('day').toDate(),
          $lt: moment().endOf('day').toDate()
        }
      });

      const proteinIntake = todayNutrition?.totalProtein || 0;
      const targetProtein = (user.profile?.weight || 70) * 2; // 2g per kg body weight

      if (proteinIntake < targetProtein * 0.8) {
        recommendations.push({
          type: 'nutrition',
          priority: 'high',
          message: `You need more protein! Target: ${Math.round(targetProtein)}g. Current: ${Math.round(proteinIntake)}g`,
          action: 'Log protein meal'
        });
      }
    }

    if (fitnessGoals.includes('weight_loss')) {
      recommendations.push({
        type: 'nutrition',
        priority: 'medium',
        message: 'Focus on a calorie deficit while maintaining protein intake for muscle preservation.',
        action: 'Track calories'
      });
    }

    // Workout suggestions based on last workout type
    if (lastWorkout) {
      const workoutTypes = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms'];
      const lastType = lastWorkout.workoutType;
      const suggestedTypes = workoutTypes.filter(type => type !== lastType);
      
      if (suggestedTypes.length > 0) {
        recommendations.push({
          type: 'workout_suggestion',
          priority: 'low',
          message: `Next workout suggestion: ${suggestedTypes[0]}`,
          action: 'Start workout'
        });
      }
    }

    // Sleep recommendation
    if (todayWellness && todayWellness.sleepHours && todayWellness.sleepHours < 7) {
      recommendations.push({
        type: 'wellness',
        priority: 'high',
        message: 'You got less than 7 hours of sleep. Recovery is crucial for progress!',
        action: 'Improve sleep schedule'
      });
    }

    res.json({ recommendations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

