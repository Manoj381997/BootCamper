const express = require('express');
const router = express.Router({ mergeParams: true });
const coursesController = require('../controllers/courses.controller');

router.get('/', coursesController.getCourses);
router.get('/:id', coursesController.getCourse);
router.post('/', coursesController.addCourse);
router.put('/:id', coursesController.updateCourse);
router.delete('/:id', coursesController.deleteCourse);

module.exports = router;
