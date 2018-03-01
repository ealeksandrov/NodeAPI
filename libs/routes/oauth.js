var express = require('express');

var libs = process.cwd() + '/libs/';

var oauth2 = require(libs + 'auth/oauth2');
var log = require(libs + 'log')(module);
var	router = express.Router();

router.post('/token', oauth2.token);

module.exports = router;
