const express = require('express');
const router = express.Router();

// @route       GET api/auth
// @desc
// @access
router.get('/', (req, res) => res.send('Auth route'));

module.exports = router;
