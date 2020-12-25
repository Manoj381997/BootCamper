const express = require('express');
const router = express.Router();
const bootcampsController = require('../controllers/bootcamps.controller');
const advancedResults = require('../middleware/advancedResults');
const Bootcamp = require('../models/Bootcamp.model');

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
router.post('/', bootcampsController.createBootcamp);
router.put('/:id', bootcampsController.updateBootcamp);
router.delete('/:id', bootcampsController.deleteBootcamp);
router.get(
  '/radius/:zipcode/:distance/:unit',
  bootcampsController.getBootcampsInRadius
);
router.put('/:id/photo', bootcampsController.uploadBootcampPhoto);
router.post('/upload', bootcampsController.uploadMethod);

module.exports = router;
