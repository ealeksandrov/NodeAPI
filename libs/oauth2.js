/*jshint node:true, strict:false, indent:4, onevar:false, maxlen:4000*/
var oauth2orize         = require('oauth2orize');
var passport            = require('passport');
var crypto              = require('crypto');
var config              = require('./config');
var UserModel           = require('./mongoose').UserModel;
var AccessTokenModel    = require('./mongoose').AccessTokenModel;
var RefreshTokenModel   = require('./mongoose').RefreshTokenModel;

// create OAuth 2.0 server
var server = oauth2orize.createServer();

var errFn = function (cb, err) {
    if (err) { return cb(err); }
};
// Exchange username & password for access token.

server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {
    var errorHandler = errFn.bind(undefined, done);
    UserModel.findOne({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user || !user.checkPassword(password)) {
            return done(null, false);
        }

        RefreshTokenModel.remove({ userId: user.userId, clientId: client.clientId }, errorHandler);
        AccessTokenModel.remove({ userId: user.userId, clientId: client.clientId }, errorHandler);

        var tokenValue = crypto.randomBytes(32).toString('base64');
        var refreshTokenValue = crypto.randomBytes(32).toString('base64');
        var token = new AccessTokenModel({ token: tokenValue, clientId: client.clientId, userId: user.userId });
        var refreshToken = new RefreshTokenModel({ token: refreshTokenValue, clientId: client.clientId, userId: user.userId });
        refreshToken.save(errorHandler);
        token.save(function (err) {
            if (err) { return done(err); }
            done(null, tokenValue, refreshTokenValue, { 'expires_in': config.get('security:tokenLife') });
        });
    });
}));

// Exchange refreshToken for access token.

server.exchange(oauth2orize.exchange.refreshToken(function(client, refreshToken, scope, done) {
    var errorHandler = errFn.bind(undefined, done);
    RefreshTokenModel.findOne({ token: refreshToken, clientId: client.clientId }, function(err, token) {
        if (err) { return done(err); }
        if (!token) { return done(null, false); }

        UserModel.findById(token.userId, function(err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }

            RefreshTokenModel.remove({ userId: user.userId, clientId: client.clientId }, errorHandler);
            AccessTokenModel.remove({ userId: user.userId, clientId: client.clientId }, errorHandler);

            var tokenValue = crypto.randomBytes(32).toString('base64');
            var refreshTokenValue = crypto.randomBytes(32).toString('base64');
            var token = new AccessTokenModel({ token: tokenValue, clientId: client.clientId, userId: user.userId });
            var refreshToken = new RefreshTokenModel({ token: refreshTokenValue, clientId: client.clientId, userId: user.userId });
            refreshToken.save(errorHandler);
            token.save(function (err) {
                if (err) { return done(err); }
                done(null, tokenValue, refreshTokenValue, { 'expires_in': config.get('security:tokenLife') });
            });
        });
    });
}));


// token endpoint
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens.  Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request.  Clients must
// authenticate when making requests to this endpoint.

exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
    server.token(),
    server.errorHandler()
];
