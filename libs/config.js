var nconf = require('nconf');

nconf.argv().env();

if (process.env.ENV_IN === 'docker') {
    nconf.file('docker', {
        file: process.cwd() + '/docker.config.json'
    });
}

nconf.file('defaults', {
    file: process.cwd() + '/config.json'
});

module.exports = nconf;
