const Bootcamp = require('../models/Bootcamp.model');
const ErrorResponse = require('../utils/errorResponse');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

const logger = '[BootcampController]';

// @desc    GET All bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[GetBootcamps]';
  let query;

  // Save req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query String
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $lt, $in, etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Finding resource
  query = Bootcamp.find(JSON.parse(queryStr)).populate({
    path: 'courses',
    select: 'title description',
  });

  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt'); // '-' means Descending
  }

  // Pagination
  const page = parseInt(req.query.page || process.env.PAGE, 10);
  const pageLimit = parseInt(req.query.limit || process.env.PAGE_LIMIT, 10);
  const startIndex = (page - 1) * pageLimit; // skip
  const endIndex = page * pageLimit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(pageLimit);

  // Executing query
  const bootcamps = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit: pageLimit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit: pageLimit,
    };
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Retrieved All Bootcamps',
    count: bootcamps.length,
    pagination,
    data: bootcamps,
  });
});

// @desc    GET Single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[GetBootcamp]';
  const bootcamp = await Bootcamp.findById(req.params.id).populate({
    path: 'courses',
    select: 'title description',
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
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with id of ${req.params.id}`,
          StatusCodes.BAD_REQUEST
        )
      );
    }

    await bootcamp.remove();

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

// @desc    Get bootcamps within a radius
// @route   DELETE /api/v1/bootcamps/radius/:zipcode/:distance/:unit
// @access  Private
exports.getBootcampsInRadius = async (req, res, next) => {
  const methodName = logger + '[GetBootcampsInRadius]';
  try {
    const { zipcode, distance, unit } = req.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius using radians
    // Divide dist by radius of Earth
    // Earth Radius = 3,963 mi / 6,378 km
    let radius;
    if (unit === 'mi') radius = distance / 3963;
    else if (unit === 'km') radius = distance / 6378;
    else
      return next(
        new ErrorResponse('Invalid distance unit', StatusCodes.BAD_REQUEST)
      );

    const bootcamps = await Bootcamp.find({
      // https://docs.mongodb.com/manual/reference/operator/query/centerSphere/
      location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.status(StatusCodes.OK).json({
      success: true,
      count: bootcamps.length,
      message: 'Bootcamps retrieved successfully',
      data: bootcamps,
    });
  } catch (err) {
    console.log(methodName, err);
    next(err);
  }
};
