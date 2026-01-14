const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
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
  weight: {
    type: Number // in kg
  },
  bodyMeasurements: {
    chest: { type: Number }, // in cm
    waist: { type: Number },
    hips: { type: Number },
    biceps: { type: Number },
    thighs: { type: Number }
  },
  bodyFatPercentage: {
    type: Number
  },
  muscleMass: {
    type: Number // in kg
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Progress', progressSchema);

