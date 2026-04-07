const Queue = require('../models/Queue');
const Service = require('../models/Service');
const User = require('../models/User');

/**
 * @desc    Join a queue for a service
 * @route   POST /api/queue/join
 * @access  Private (user)
 */
const joinQueue = async (req, res) => {
  try {
    const { serviceId } = req.body;
    const userId = req.user._id;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide serviceId.'
      });
    }

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.'
      });
    }

    // Check if user already has an active queue entry for this service
    const existingEntry = await Queue.findOne({
      userId,
      serviceId,
      status: { $in: ['waiting', 'called'] }
    });

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: 'You are already in the queue for this service.',
        data: existingEntry
      });
    }

    // Check queue limit
    const activeCount = await Queue.countDocuments({
      serviceId,
      status: { $in: ['waiting', 'called'] }
    });

    if (activeCount >= service.maxQueueLimit) {
      return res.status(400).json({
        success: false,
        message: 'Queue is full. Please try again later.'
      });
    }

    // Auto-increment token number per service
    const lastToken = await Queue.findOne({ serviceId })
      .sort({ tokenNumber: -1 })
      .select('tokenNumber');

    const tokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

    const queueEntry = await Queue.create({
      userId,
      serviceId,
      tokenNumber,
      status: 'waiting'
    });

    // Populate for response
    const populated = await Queue.findById(queueEntry._id)
      .populate('userId', 'name email')
      .populate('serviceId', 'serviceName');

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('queueUpdated', {
        serviceId,
        message: `New token #${tokenNumber} joined the queue`,
        queueEntry: populated
      });
    }

    res.status(201).json({
      success: true,
      message: `Successfully joined queue! Your token number is ${tokenNumber}.`,
      data: populated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error joining queue.',
      error: error.message
    });
  }
};

/**
 * @desc    Get current user's queue status
 * @route   GET /api/queue/status
 * @access  Private (user)
 */
const getQueueStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const queueEntries = await Queue.find({
      userId,
      status: { $in: ['waiting', 'called'] }
    })
      .populate('serviceId', 'serviceName description')
      .sort({ createdAt: -1 });

    // For each entry, calculate position in queue
    const entriesWithPosition = await Promise.all(
      queueEntries.map(async (entry) => {
        const position = await Queue.countDocuments({
          serviceId: entry.serviceId._id,
          status: 'waiting',
          tokenNumber: { $lt: entry.tokenNumber }
        });

        // Get current serving token
        const currentServing = await Queue.findOne({
          serviceId: entry.serviceId._id,
          status: 'called'
        }).sort({ tokenNumber: 1 });

        return {
          ...entry.toObject(),
          position: entry.status === 'called' ? 0 : position + 1,
          currentServingToken: currentServing ? currentServing.tokenNumber : null
        };
      })
    );

    res.status(200).json({
      success: true,
      data: entriesWithPosition
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching queue status.',
      error: error.message
    });
  }
};

/**
 * @desc    Get queue entries for a specific service (admin)
 * @route   GET /api/queue/:serviceId
 * @access  Admin only
 */
const getServiceQueue = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const queueEntries = await Queue.find({ serviceId })
      .populate('userId', 'name email')
      .populate('serviceId', 'serviceName')
      .sort({ tokenNumber: 1 });

    const waiting = queueEntries.filter(e => e.status === 'waiting');
    const called = queueEntries.filter(e => e.status === 'called');
    const completed = queueEntries.filter(e => e.status === 'completed');

    res.status(200).json({
      success: true,
      data: {
        all: queueEntries,
        waiting,
        called,
        completed,
        stats: {
          total: queueEntries.length,
          waitingCount: waiting.length,
          calledCount: called.length,
          completedCount: completed.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching service queue.',
      error: error.message
    });
  }
};

/**
 * @desc    Call next token in queue (admin)
 * @route   PUT /api/queue/next
 * @access  Admin only
 */
const callNextToken = async (req, res) => {
  try {
    const { serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide serviceId.'
      });
    }

    // Find the next waiting token (lowest token number)
    const nextInLine = await Queue.findOne({
      serviceId,
      status: 'waiting'
    })
      .sort({ tokenNumber: 1 })
      .populate('userId', 'name email')
      .populate('serviceId', 'serviceName');

    if (!nextInLine) {
      return res.status(404).json({
        success: false,
        message: 'No one is waiting in the queue.'
      });
    }

    // Update status to 'called'
    nextInLine.status = 'called';
    await nextInLine.save();

    // Emit socket events for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('nextTokenCalled', {
        serviceId,
        tokenNumber: nextInLine.tokenNumber,
        userId: nextInLine.userId._id,
        userName: nextInLine.userId.name,
        serviceName: nextInLine.serviceId.serviceName,
        message: `Token #${nextInLine.tokenNumber} has been called!`
      });

      io.emit('queueUpdated', {
        serviceId,
        message: `Token #${nextInLine.tokenNumber} called for ${nextInLine.serviceId.serviceName}`
      });
    }

    res.status(200).json({
      success: true,
      message: `Token #${nextInLine.tokenNumber} has been called!`,
      data: nextInLine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calling next token.',
      error: error.message
    });
  }
};

/**
 * @desc    Mark a queue entry as completed (admin)
 * @route   PUT /api/queue/complete
 * @access  Admin only
 */
const completeToken = async (req, res) => {
  try {
    const { serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide serviceId.'
      });
    }

    // Find the currently called token
    const calledToken = await Queue.findOne({
      serviceId,
      status: 'called'
    })
      .sort({ tokenNumber: 1 })
      .populate('userId', 'name email')
      .populate('serviceId', 'serviceName');

    if (!calledToken) {
      return res.status(404).json({
        success: false,
        message: 'No called token to complete.'
      });
    }

    // Update status to 'completed'
    calledToken.status = 'completed';
    await calledToken.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('queueUpdated', {
        serviceId,
        message: `Token #${calledToken.tokenNumber} completed for ${calledToken.serviceId.serviceName}`
      });
    }

    res.status(200).json({
      success: true,
      message: `Token #${calledToken.tokenNumber} marked as completed.`,
      data: calledToken
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing token.',
      error: error.message
    });
  }
};

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/queue/admin/stats
 * @access  Admin only
 */
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeQueues = await Queue.countDocuments({ status: { $in: ['waiting', 'called'] } });
    const completedAppointments = await Queue.countDocuments({ status: 'completed' });
    const totalServices = await Service.countDocuments();

    // Get per-service stats
    const services = await Service.find();
    const serviceStats = await Promise.all(
      services.map(async (service) => {
        const waiting = await Queue.countDocuments({ serviceId: service._id, status: 'waiting' });
        const called = await Queue.countDocuments({ serviceId: service._id, status: 'called' });
        const completed = await Queue.countDocuments({ serviceId: service._id, status: 'completed' });
        return {
          serviceId: service._id,
          serviceName: service.serviceName,
          waiting,
          called,
          completed,
          total: waiting + called + completed
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeQueues,
        completedAppointments,
        totalServices,
        serviceStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin stats.',
      error: error.message
    });
  }
};

module.exports = {
  joinQueue,
  getQueueStatus,
  getServiceQueue,
  callNextToken,
  completeToken,
  getAdminStats
};
