const Bootcamp = require('../models/Bootcamp.model');
const ErrorResponse = require('../utils/errorResponse');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const asyncHandler = require('../middleware/async');

const logger = '[BootcampController]';

// @desc    GET All bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[GetBootcamps]';
  const bootcamps = await Bootcamp.find();
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Retrieved All Bootcamps',
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @desc    GET Single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[GetBootcamp]';
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with id of ${req.params.id}`,
        StatusCodes.BAD_REQUEST
      )
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Retrieved Bootcamp',
    data: bootcamp,
  });
});

// @desc    POST Create bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = async (req, res, next) => {
  const methodName = logger + '[CreateBootcamp]';
  try {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Bootcamp created successfully',
      data: bootcamp,
    });
  } catch (err) {
    console.log(methodName, err);
    next(err);
  }
};

// @desc    PUT Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = async (req, res, next) => {
  const methodName = logger + '[UpdateBootcamp]';
  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with id of ${req.params.id}`,
          StatusCodes.BAD_REQUEST
        )
      );
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Bootcamp updated successfully',
      data: bootcamp,
    });
  } catch (err) {
    console.log(methodName, err);
    next(err);
  }
};

// @desc    DELETE Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = async (req, res, next) => {
  const methodName = logger + '[DeleteBootcamp]';
  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with id of ${req.params.id}`,
          StatusCodes.BAD_REQUEST
        )
      );
    }

    res.status(StatusCodes.NO_CONTENT).json({
      success: true,
      message: 'Bootcamp deleted successfully',
      data: {},
    });
  } catch (err) {
    console.log(methodName, err);
    next(err);
  }
};
