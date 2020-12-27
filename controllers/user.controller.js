const ErrorResponse = require('../utils/errorResponse');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const asyncHandler = require('../middleware/async');
const User = require('../models/User.model');

const logger = '[UserController]';

// @desc    Get All users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[GetUsers]';

  res.status(StatusCodes.OK).json(res.advancedResults);
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[GetUser]';
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(
        `User not found with id of ${req.params.id}`,
        StatusCodes.BAD_REQUEST
      )
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User retrieved',
    data: user,
  });
});

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[CreateUser]';
  const user = await User.create(req.body);
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'User created',
    data: user,
  });
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[UpdateUser]';
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User updated',
    data: user,
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[DeleteUser]';
  await User.findByIdAndDelete(req.params.id);
  res.status(StatusCodes.NO_CONTENT).json({
    success: true,
    message: 'User deleted',
    data: {},
  });
});
