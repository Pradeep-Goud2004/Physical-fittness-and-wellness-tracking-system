const express = require('express');
const Feedback = require('../models/Feedback');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/feedback
// @desc    Submit feedback or question
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const { type, subject, message, rating } = req.body;

    const feedback = new Feedback({
      userId: req.user._id,
      type,
      subject,
      message,
      rating
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/feedback
// @desc    Get user's feedback
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user._id })
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/feedback/all
// @desc    Get all feedback (Admin only)
// @access  Private (Admin only)
router.get('/all', authenticate, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const feedbacks = await Feedback.find(query)
      .populate('userId', 'name email')
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/feedback/:id/respond
// @desc    Respond to feedback (Admin only)
// @access  Private (Admin only)
router.put('/:id/respond', authenticate, isAdmin, async (req, res) => {
  try {
    const { response } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        response,
        adminId: req.user._id,
        respondedAt: new Date(),
        status: 'responded'
      },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

