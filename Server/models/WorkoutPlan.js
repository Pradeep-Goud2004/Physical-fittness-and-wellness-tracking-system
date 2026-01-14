const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  duration: {
    type: Number, // in weeks
    default: 4
  },
  exercises: [{
    day: {
      type: Number,
      required: true
    },
    workoutType: {
      type: String,
      required: true
    },
    exercises: [{
      exerciseName: String,
      sets: Number,
      reps: Number,
      weight: Number,
      notes: String
    }]
  }],
  isTemplate: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);

