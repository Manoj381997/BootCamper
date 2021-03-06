const express = require('express');
const router = express.Router({ mergeParams: true });
const coursesController = require('../controllers/courses.controller');
const Course = require('../models/Course.model');

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');

router.get(
  '/',
  advancedResults(Course, {
    path: 'bootcamp',
    select: 'name description',
  }),
  coursesController.getCourses
);
router.get('/:id', coursesController.getCourse);
router.post(
  '/',
  protect,
  authorize('publisher', 'admin'),
  coursesController.addCourse
);
router.put(
  '/:id',
  protect,
  authorize('publisher', 'admin'),
  coursesController.updateCourse
);
router.delete(
  '/:id',
  protect,
  authorize('publisher', 'admin'),
  coursesController.deleteCourse
);

module.exports = router;
