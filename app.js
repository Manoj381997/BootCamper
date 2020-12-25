const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
// const logger = require('./middleware/logger');
const colors = require('colors');
const fileupload = require('express-fileupload');
const errorHandler = require('./middleware/error');
const connectDb = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();

// Body parser
app.use(express.json());

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDb();

// Import Routers
const bootcampsRouter = require('./routers/bootcamps.router');
const coursesRouter = require('./routers/courses.router');

const API = '/api/v1';

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // 'tiny', 'short', 'combined'
  // app.use(logger);
}

app.get('/', (req, res) => {
  res.status(200).json({
    MESSAGE: 'Welcome to DevCamper REST API. Use /api/v1/.... to proceed ',
  });
});

// File uploading
app.use(fileupload());

// Set static folder
// By making public folder as static we can access images like this "http://localhost:3000/uploads/photo_5d725a1b7b292f5f8ceff788.jpg"
app.use(express.static(path.join(__dirname, 'public')));

// Mount Routers
app.use(API + '/bootcamps', bootcampsRouter);
app.use(API + '/courses', coursesRouter);

// app.post(API + '/bootcamps/upload', (req, res, next) => {
//   console.log('Test File');
//   if (!req.files) {
//     return next(new Error('Please upload a file', 400));
//   }
//   res.status(200).json({
//     MESSAGE: 'Welcome to DevCamper REST API. Use /api/v1/.... to proceed ',
//   });
// });

// Load Swagger
app.use(
  API + '/swagger',
  swaggerUi.serve,
  swaggerUi.setup(YAML.load('./swagger.yml'), { explorer: true })
);

// Load Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red.bold);
  // close server and exit process
  server.close(() => process.exit(1)); // 1 -> close with failure
});
