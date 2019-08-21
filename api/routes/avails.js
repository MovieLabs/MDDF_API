/**
 * Definitions for the routes under MEC
*/

const express = require('express');
const mecController = require('../controllers/mec');

const router = express.Router();

router.get('/:id', mecController.getResource);

module.exports = router;
