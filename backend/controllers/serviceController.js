const Service = require('../models/Service');
const Queue = require('../models/Queue');

/**
 * @desc    Get all services
 * @route   GET /api/services
 * @access  Public
 */
const getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });

    // Attach active queue count for each service
    const servicesWithCount = await Promise.all(
      services.map(async (service) => {
        const activeCount = await Queue.countDocuments({
          serviceId: service._id,
          status: { $in: ['waiting', 'called'] }
        });
        return {
          ...service.toObject(),
          activeQueueCount: activeCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: servicesWithCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching services.',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new service
 * @route   POST /api/services
 * @access  Admin only
 */
const createService = async (req, res) => {
  try {
    const { serviceName, description, maxQueueLimit } = req.body;

    if (!serviceName || !description || !maxQueueLimit) {
      return res.status(400).json({
        success: false,
        message: 'Please provide serviceName, description, and maxQueueLimit.'
      });
    }

    const service = await Service.create({
      serviceName,
      description,
      maxQueueLimit
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully!',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating service.',
      error: error.message
    });
  }
};

/**
 * @desc    Update a service
 * @route   PUT /api/services/:id
 * @access  Admin only
 */
const updateService = async (req, res) => {
  try {
    const { serviceName, description, maxQueueLimit } = req.body;

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { serviceName, description, maxQueueLimit },
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service updated successfully!',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating service.',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a service
 * @route   DELETE /api/services/:id
 * @access  Admin only
 */
const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.'
      });
    }

    // Also remove all queue entries for this service
    await Queue.deleteMany({ serviceId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Service and associated queue entries deleted.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting service.',
      error: error.message
    });
  }
};

module.exports = { getServices, createService, updateService, deleteService };
