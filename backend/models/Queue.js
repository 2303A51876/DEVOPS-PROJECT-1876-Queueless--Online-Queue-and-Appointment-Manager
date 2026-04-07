const mongoose = require('mongoose');

/**
 * Queue Schema
 * Tracks user positions in service queues
 * Status flow: waiting -> called -> completed
 */
const queueSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service ID is required']
  },
  tokenNumber: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'called', 'completed'],
    default: 'waiting'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
queueSchema.index({ serviceId: 1, status: 1, tokenNumber: 1 });
queueSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Queue', queueSchema);
