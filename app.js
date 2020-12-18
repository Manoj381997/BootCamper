const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
// const logger = require('./middleware/logger');

// Import Routers
const bootcampsRouter = require('./routers/bootcamps.router');

// Load env vars
dotenv.config({ path: './config/config.env' });

const app = express();
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

// Mount Routers
app.use(API + '/bootcamps', bootcampsRouter);

const PORT = process.env.PORT || 3000;
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
