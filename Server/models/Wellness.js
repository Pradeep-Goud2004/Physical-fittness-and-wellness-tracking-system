const mongoose = require('mongoose');

const wellnessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  sleepHours: {
    type: Number,
    min: 0,
    max: 24
  },
  waterIntake: {
    type: Number, // in liters
    min: 0,
    default: 0
  },
  stressLevel: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  isRestDay: {
    type: Boolean,
    default: false
  },
  mood: {
    type: String,
    enum: ['excellent', 'good', 'okay', 'poor', 'terrible']
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Wellness', wellnessSchema);

