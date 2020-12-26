const ErrorResponse = require('../utils/errorResponse');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const asyncHandler = require('../middleware/async');
const User = require('../models/User.model');

const logger = '[AuthController]';

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[Register]';

  const { name, email, password, role } = req.body;

  // Create User
  const user = await User.create({ name, email, password, role });

  sendTokenResponse(user, StatusCodes.OK, 'Registered successfully', res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[Login]';

  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return next(
      new ErrorResponse(
        'Please provide an email and password',
        StatusCodes.BAD_REQUEST
      )
    );
  }

  // Check user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(
      new ErrorResponse('Invalid credentials', StatusCodes.UNAUTHORIZED)
    );
  }

  // Check password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(
      new ErrorResponse('Invalid credentials', StatusCodes.UNAUTHORIZED)
    );
  }

  sendTokenResponse(user, StatusCodes.OK, 'Logged In successfully', res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, msg, res) => {
  // create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // We want the cookie to be accessed through client side script
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, message: msg, token });
};

// @desc    Get current logged in user
// @route   POST /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[Login]';

  const user = req.user;

  if (!user) {
    return next(
      new ErrorResponse('Something went wrong', StatusCodes.UNAUTHORIZED)
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Successfully retrieved logged in user details',
    data: user,
  });
});
