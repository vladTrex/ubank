const express = require('express');
const router = express.Router();

// @route   GET api/profile/test
// @desc    Test route profile
// @access  Public route

router.get('/test', (req, res) => {
    return res.json({
        msg: 'Profile works'
    });
});

module.exports = router;