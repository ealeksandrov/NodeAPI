var nconf = require('nconf');

nconf.argv()
	.env()
	.file({
		file: process.cwd() + '/config.json'
	});

module.exports = nconf;