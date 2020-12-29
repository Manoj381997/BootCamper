const ErrorResponse = require('../utils/errorResponse');
const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const asyncHandler = require('../middleware/async');
const User = require('../models/User.model');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

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

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[Logout]';

  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Successfully Logged out',
    data: {},
  });
});

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[UpdateDetails]';

  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  if (
    !fieldsToUpdate.email ||
    fieldsToUpdate.email === null ||
    fieldsToUpdate.email === ''
  ) {
    return next(
      new ErrorResponse('Email cannot be empty', StatusCodes.BAD_REQUEST)
    );
  }

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Successfully updated user details',
    data: user,
  });
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[UpdatePassword]';

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(
      new ErrorResponse('Password is incorrect', StatusCodes.UNAUTHORIZED)
    );
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, StatusCodes.OK, 'Password updated successfully', res);
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[ForgotPassword]';

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ErrorResponse('User does not exist', StatusCodes.BAD_REQUEST)
    );
  }

  // Get Reset Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has 
  requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    sendEmail({
      email: user.email,
      subject: 'Password reset token',
      text: message,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (err) {
    console.error(methodName, err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.save({ validateBeforeSave: false });
    return next(
      new ErrorResponse(
        'Email could not be sent',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetpassword = asyncHandler(async (req, res, next) => {
  const methodName = logger + '[Resetpassword]';

  // Get Hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', StatusCodes.BAD_REQUEST));
  }

  // Set new password
  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendTokenResponse(user, StatusCodes.OK, 'Password changed successfully', res);
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
