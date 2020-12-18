const express = require('express');
const router = express.Router();
const bootcampsController = require('../controllers/bootcamps.controller');

router.get('/', bootcampsController.getBootcamps);

module.exports = router;
