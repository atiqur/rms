const express = require('express');
const router = express.Router();

// @route       GET api/interviews
// @desc
// @access
router.get('/', (req, res) => res.send('Interviews route'));

module.exports = router;
