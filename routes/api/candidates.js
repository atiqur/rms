const express = require('express');
const router = express.Router();

// @route       GET api/candidates
// @desc
// @access
router.get('/', (req, res) => res.send('Candidates route'));

module.exports = router;
