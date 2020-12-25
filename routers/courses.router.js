const express = require('express');
const router = express.Router({ mergeParams: true });
const coursesController = require('../controllers/courses.controller');
const advancedResults = require('../middleware/advancedResults');
const Course = require('../models/Course.model');

router.get(
  '/',
  advancedResults(Course, {
    path: 'bootcamp',
    select: 'name description',
  }),
  coursesController.getCourses
);
router.get('/:id', coursesController.getCourse);
router.post('/', coursesController.addCourse);
router.put('/:id', coursesController.updateCourse);
router.delete('/:id', coursesController.deleteCourse);

module.exports = router;
