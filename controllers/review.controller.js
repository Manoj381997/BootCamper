const ErrorResponse = require('../utils/errorResponse');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review.model');
const Bootcamp = require('../models/Bootcamp.model');

const logger = '[ReviewController]';

// @desc    GET Reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[GetReviews]';
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });

    res.status(StatusCodes.OK).json({
      success: true,
      count: reviews.length,
      message: 'Retrieved Reviews',
      data: reviews,
    });
  } else {
    res.status(StatusCodes.OK).json(res.advancedResults);
  }
});

// @desc    Get Single review
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[GetReview]';

  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!review) {
    return next(
      new ErrorResponse(
        `Review not found with id of ${req.params.id}`,
        StatusCodes.NOT_FOUND
      )
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Retrieved Review',
    data: review,
  });
});

// @desc    Add review
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[AddReview]';

  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with id of ${req.params.bootcampId}`,
        StatusCodes.NOT_FOUND
      )
    );
  }

  const review = await Review.create(req.body);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Review created',
    data: review,
  });
});

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[UpdateReview]';

  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(
        `Review not found with id of ${req.params.id}`,
        StatusCodes.NOT_FOUND
      )
    );
  }

  // Make sure user is review owner or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update the review`,
        StatusCodes.FORBIDDEN
      )
    );
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  review.save(); // This will trigger middleware for averageRating while updating rating

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Review Updated',
    data: review,
  });
});

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[deleteReview]';

  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(
        `Review not found with id of ${req.params.id}`,
        StatusCodes.NOT_FOUND
      )
    );
  }

  // Make sure user is review owner or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update the review`,
        StatusCodes.FORBIDDEN
      )
    );
  }

  review.remove(); // This will trigger middleware for averageRating while removing the rating

  res.status(StatusCodes.NO_CONTENT).json({
    success: true,
    message: 'Review Deleted',
    data: {},
  });
});
