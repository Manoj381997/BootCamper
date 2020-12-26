const express = require('express');
const router = express.Router();
const bootcampsController = require('../controllers/bootcamps.controller');
const advancedResults = require('../middleware/advancedResults');
const Bootcamp = require('../models/Bootcamp.model');
const { protect, authorize } = require('../middleware/auth');

// Include other resource routers
const coursesRouter = require('./courses.router');

// Re-route into other resource routers
router.use('/:bootcampId/courses', coursesRouter);

router.get(
  '/',
  advancedResults(Bootcamp, {
    path: 'courses',
    select: 'title description',
  }),
  bootcampsController.getBootcamps
);
router.get('/:id', bootcampsController.getBootcamp);
router.post(
  '/',
  protect,
  authorize('publisher', 'admin'),
  bootcampsController.createBootcamp
);
router.put(
  '/:id',
  protect,
  authorize('publisher', 'admin'),
  bootcampsController.updateBootcamp
);
router.delete(
  '/:id',
  protect,
  authorize('publisher', 'admin'),
  bootcampsController.deleteBootcamp
);
router.get(
  '/radius/:zipcode/:distance/:unit',
  bootcampsController.getBootcampsInRadius
);
router.put(
  '/:id/photo',
  protect,
  authorize('publisher', 'admin'),
  bootcampsController.uploadBootcampPhoto
);
router.post('/upload', bootcampsController.uploadMethod);

module.exports = router;
