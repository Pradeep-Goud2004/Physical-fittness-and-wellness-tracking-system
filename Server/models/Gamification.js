const mongoose = require('mongoose');

const gamificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  totalWorkouts: {
    type: Number,
    default: 0
  },
  totalCaloriesBurned: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  experiencePoints: {
    type: Number,
    default: 0
  },
  badges: [{
    badgeName: String,
    earnedDate: Date,
    description: String
  }],
  achievements: [{
    achievementName: String,
    earnedDate: Date,
    description: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Gamification', gamificationSchema);

