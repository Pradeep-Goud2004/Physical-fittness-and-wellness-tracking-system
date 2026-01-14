const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
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
  workoutType: {
    type: String,
    required: true,
    enum: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Cardio', 'Full Body', 'Core', 'Other']
  },
  exercises: [{
    exerciseName: {
      type: String,
      required: false
    },
    sets: [{
      reps: { type: Number },
      weight: { type: Number }, // in kg
      duration: { type: Number }, // in seconds for time-based exercises
      restTime: { type: Number } // in seconds
    }],
    notes: { type: String }
  }],
  totalDuration: {
    type: Number, // in minutes
    required: true
  },
  caloriesBurned: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Workout', workoutSchema);

