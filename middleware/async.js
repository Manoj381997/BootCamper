const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(() => {
    console.log(methodName, err);
    next;
  });

module.exports = asyncHandler;
