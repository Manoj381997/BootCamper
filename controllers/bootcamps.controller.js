const Bootcamp = require('../models/Bootcamp.model');
const ErrorResponse = require('../utils/errorResponse');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const path = require('path');

const logger = '[BootcampController]';

// @desc    GET All bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[GetBootcamps]';

  res.status(StatusCodes.OK).json(res.advancedResults);
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

// @desc    Upload photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.uploadBootcampPhoto = async (req, res, next) => {
  const methodName = logger + '[UploadBootcampPhoto]';
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
    console.log('[File]' + req.files);
    if (!req.files) {
      return next(
        new ErrorResponse('Please upload a file', StatusCodes.BAD_REQUEST)
      );
    }

    const file = req.files.file;

    // Make sure the file is an image
    if (!file.mimetype.startsWith('image')) {
      // 'mimetype' will be like this : "image/jpg" or png etc
      return next(
        new ErrorResponse(
          'Please upload an image file',
          StatusCodes.BAD_REQUEST
        )
      );
    }

    // Check file size
    if (file.size > process.env.MAX_FILE_UPLOAD_SIZE) {
      return next(
        new ErrorResponse(
          `Please upload an image file of size atmost ${process.env.MAX_FILE_UPLOAD_SIZE_IN_MB} MB`,
          StatusCodes.BAD_REQUEST
        )
      );
    }

    // Create custom file name
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
      if (err) {
        console.error(err);
        return next(
          new ErrorResponse(
            'Problem with uploading the file',
            StatusCodes.INTERNAL_SERVER_ERROR
          )
        );
      }
      await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: file.name,
    });
  } catch (err) {
    console.log(methodName, err);
    next(err);
  }
};

// Need to be removed
exports.uploadMethod = async (req, res, next) => {
  const methodName = logger + '[UploadMethod]';
  try {
    if (!req.files) {
      return next(
        new ErrorResponse('Please upload a file', StatusCodes.BAD_REQUEST)
      );
    }

    const file = req.files.imageFile;

    // Make sure the file is an image
    if (!file.mimetype.startsWith('image')) {
      // 'mimetype' will be like this : "image/jpg" or png etc
      return next(
        new ErrorResponse(
          'Please upload an image file',
          StatusCodes.BAD_REQUEST
        )
      );
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: file.name,
    });
  } catch (err) {
    console.error(err.message);
  }
};
