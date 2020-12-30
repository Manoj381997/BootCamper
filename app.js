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
const cookieParser = require('cookie-parser');

// Security packages
const mongoSanitize = require('express-mongo-sanitize');
// const helmet = require('helmet');
// const xss = require('xss-clean');
// const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Sanitize data - To prevent NoSql Injection
// https://blog.websecurify.com/2014/08/hacking-nodejs-and-mongodb.html
app.use(mongoSanitize());

// Set security headers like XSS-Protection, DNS-Prefetch-Control
// app.use(helmet({ contentSecurityPolicy: false })); // For Docgen
// app.use(helmet());

// Middleware use to sanitize user input
// Prevent XSS attacks like adding html script tags in text,name,etc...
// app.use(xss());

// Prevent Http Parameter Pollution
// app.use(hpp());

// Enable CORS, Cross-Origin Resource sharing
app.use(cors());

// Global rate limiter
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 0,
});
app.use(limiter);

// Rate limiter for specific URL's
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // limit each IP to 100 requests per windowMs
});

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDb();

// File uploading
app.use(fileupload());

// Set static folder
// By making public folder as static we can access images like this "http://localhost:3000/uploads/photo_5d725a1b7b292f5f8ceff788.jpg"
app.use(express.static(path.join(__dirname, 'public')));

// Import Routers
const bootcampsRouter = require('./routers/bootcamps.router');
const coursesRouter = require('./routers/courses.router');
const authRouter = require('./routers/auth.router');
const userRouter = require('./routers/user.router');
const reviewRouter = require('./routers/review.router');

const API = '/api/v1';

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // 'tiny', 'short', 'combined'
  // app.use(logger);
}

app.get('/', (req, res) => {
  res.status(200).json({
    MESSAGE: 'Welcome to BootCamper REST API. Use /api/v1/.... to proceed ',
    SWAGGER:
      'http://bootcamper-env.eba-awephpyv.ap-south-1.elasticbeanstalk.com/api/v1/swagger',
  });
});

// Mount Routers
app.use(API + '/bootcamps', bootcampsRouter);
app.use(API + '/courses', coursesRouter);
app.use(API + '/auth', authLimiter, authRouter);
app.use(API + '/users', authLimiter, userRouter);
app.use(API + '/reviews', reviewRouter);

// Load Swagger
app.use(
  API + '/swagger',
  swaggerUi.serve,
  swaggerUi.setup(YAML.load('./swagger.yml'), { explorer: false })
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
