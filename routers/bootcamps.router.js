const express = require('express');
const router = express.Router();
const bootcampsController = require('../controllers/bootcamps.controller');

router.get('/', bootcampsController.getBootcamps);
router.get('/:id', bootcampsController.getBootcamp);
router.post('/', bootcampsController.createBootcamp);
router.put('/:id', bootcampsController.updateBootcamp);
router.delete('/:id', bootcampsController.deleteBootcamp);

module.exports = router;
