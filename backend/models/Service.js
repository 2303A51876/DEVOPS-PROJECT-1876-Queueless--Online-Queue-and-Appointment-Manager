const mongoose = require('mongoose');

/**
 * Service Schema
 * Represents a service that users can queue for (e.g., Bank Counter, Doctor Visit)
 */
const serviceSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  maxQueueLimit: {
    type: Number,
    required: [true, 'Max queue limit is required'],
    min: [1, 'Queue limit must be at least 1'],
    max: [1000, 'Queue limit cannot exceed 1000']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Service', serviceSchema);
