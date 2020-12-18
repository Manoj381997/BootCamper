// @desc    GET All bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = (req, res, next) => {
  res.status(200).json({ MESSAGE: 'All bootcamps' });
};

// @desc    GET Single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = (req, res, next) => {
  res.status(200).json({ MESSAGE: 'Single  bootcamp' });
};

// @desc    POST Create bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = (req, res, next) => {
  res.status(201).json({ MESSAGE: 'Create bootcamp' });
};

// @desc    PUT Update bootcamp
// @route   PUT /api/v1/bootcamps:id
// @access  Private
exports.updateBootcamp = (req, res, next) => {
  res.status(204).json({ MESSAGE: 'Update bootcamp' });
};

// @desc    DELETE Delete bootcamp
// @route   DELETE /api/v1/bootcamps:id
// @access  Private
exports.deleteBootcamp = (req, res, next) => {
  res.status(200).json({ MESSAGE: 'Delete bootcamp' });
};
