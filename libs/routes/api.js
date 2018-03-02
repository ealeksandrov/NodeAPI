var express = require('express');
var passport = require('passport');
var router = express.Router();

router.get('/', passport.authenticate('bearer', { session: false }), function (req, res) {
    res.json({
        msg: 'API is running'
    });
});

module.exports = router;
