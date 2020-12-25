const advancedResults = (model, populate) => async (req, res, next) => {
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
  // query = model.find(JSON.parse(queryStr)).populate({
  //   path: 'courses',
  //   select: 'title description',
  // });
  query = model.find(JSON.parse(queryStr));

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

  // If populate
  if (populate) {
    query = query.populate(populate);
  }

  // Pagination
  const page = parseInt(req.query.page || process.env.PAGE, 10);
  const pageLimit = parseInt(req.query.limit || process.env.PAGE_LIMIT, 10);
  const startIndex = (page - 1) * pageLimit; // skip
  const endIndex = page * pageLimit;

  const total = await model.countDocuments(); // we can add JSON.parse(queryStr) inside countDocuments, but not necessary

  query = query.skip(startIndex).limit(pageLimit);

  // Executing query
  const results = await query;

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

  res.advancedResults = {
    success: true,
    // message: 'Retrieved ' + model.toString(),
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
