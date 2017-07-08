var nconf = require('nconf');

var config = (process.env.ENV_IN === 'docker') ?
    '/docker.config.json' :
    '/config.json';

nconf.argv()
	.env()
	.file({
		file: process.cwd() + config
	});

module.exports = nconf;