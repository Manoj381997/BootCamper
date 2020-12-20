const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
// const logger = require('./middleware/logger');
const colors = require('colors');
const connectDb = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDb();

// Import Routers
const bootcampsRouter = require('./routers/bootcamps.router');

const app = express();
const API = '/api/v1';

// Body parser
app.use(express.json());

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

// Load Swagger
app.use(
  API + '/swagger',
  swaggerUi.serve,
  swaggerUi.setup(YAML.load('./swagger.yml'), { explorer: true })
);

// Mount Routers
app.use(API + '/bootcamps', bootcampsRouter);

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
