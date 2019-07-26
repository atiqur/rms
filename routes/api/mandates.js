const express = require('express');
const router = express.Router();

// @route       GET api/mandates
// @desc
// @access
router.get('/', (req, res) => res.send('Mandates route'));

module.exports = router;
