const ErrorResponse = require('../utils/errorResponse');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course.model');
const Bootcamp = require('../models/Bootcamp.model');

const logger = '[CoursesController]';

// @desc    GET courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[GetCourses]';

  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    res.status(StatusCodes.OK).json({
      success: true,
      count: courses.length,
      message: 'Retrieved Courses',
      data: courses,
    });
  } else {
    // query = Course.find().populate('bootcamp');  // For displaying all fields of bootcamp
    res.status(StatusCodes.OK).json(res.advancedResults);
  }
});

// @desc    GET single course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[GetCourse]';

  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!course) {
    return next(
      new ErrorResponse(
        `No course with the id of ${req.params.id} is available`,
        StatusCodes.BAD_REQUEST
      )
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Retrieved course',
    data: course,
  });
});

// @desc    Add a course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[AddCourse]';

  req.body.bootcamp = req.params.bootcampId;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp with the id of ${req.params.bootcampId} is available`,
        StatusCodes.BAD_REQUEST
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Added course',
    data: course,
  });
});

// @desc    Update a course
// @route   PUT /api/v1/courses/:id
// @access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[updateCourse]';

  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(
        `No course with the id of ${req.params.id} is available`,
        StatusCodes.BAD_REQUEST
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  course.save(); // This will trigger middleware for averageCost while updating tuition

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Updated course',
    data: course,
  });
});

// @desc    Delete a course
// @route   DELETE /api/v1/courses/:id
// @access  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[deleteCourse]';

  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(
        `No course with the id of ${req.params.id} is available`,
        StatusCodes.BAD_REQUEST
      )
    );
  }

  await course.remove();

  res.status(StatusCodes.NO_CONTENT).json({
    success: true,
    message: 'Removed course',
    data: {},
  });
});
