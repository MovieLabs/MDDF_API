const express = require('express');
const router = express.Router();
const mecController = require('../controllers/mec');

router.get('/:id', mecController.getResource);

module.exports = router;
