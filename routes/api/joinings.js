const express = require('express');
const router = express.Router();

// @route       GET api/joinings
// @desc
// @access
router.get('/', (req, res) => res.send('Joinings route'));

module.exports = router;
