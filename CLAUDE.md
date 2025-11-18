# CLAUDE.md - NodeAPI Project Guide

This document provides comprehensive information about the NodeAPI codebase for AI assistants working on this project.

## Project Overview

NodeAPI is a RESTful API built with Node.js and Express.js for mobile applications. It uses MongoDB (via Mongoose) for data persistence and implements OAuth 2.0 authentication using Passport.js and OAuth2orize.

**Key Technologies:**
- Node.js with Express.js framework
- MongoDB with Mongoose ODM
- OAuth 2.0 authentication (oauth2orize + passport)
- Winston for logging
- nconf for configuration management

## Directory Structure

```
NodeAPI/
├── bin/
│   └── www                 # Application entry point
├── libs/
│   ├── app.js              # Express application setup
│   ├── config.js           # Configuration loader (nconf)
│   ├── log.js              # Winston logger factory
│   ├── auth/
│   │   ├── auth.js         # Passport strategies (Basic, ClientPassword, Bearer)
│   │   └── oauth2.js       # OAuth2 server and token generation
│   ├── db/
│   │   └── mongoose.js     # MongoDB connection
│   ├── model/
│   │   ├── user.js         # User model with password hashing
│   │   ├── client.js       # OAuth client model
│   │   ├── article.js      # Article model (main resource)
│   │   ├── accessToken.js  # OAuth access token model
│   │   └── refreshToken.js # OAuth refresh token model
│   └── routes/
│       ├── api.js          # Base API route
│       ├── users.js        # User info endpoint
│       ├── articles.js     # Article CRUD endpoints
│       └── oauth.js        # OAuth token endpoint
├── logs/                   # Log files directory (created at runtime)
├── config.json             # Application configuration
├── generateData.js         # Demo data generator
├── package.json            # Dependencies and scripts
└── README.md               # Project documentation
```

## Architecture Overview

### Request Flow

1. Request enters via `bin/www` (server entry point)
2. Passes through Express middleware in `libs/app.js`
3. Routes to appropriate handler in `libs/routes/`
4. Protected routes authenticate via Passport Bearer strategy
5. Business logic interacts with Mongoose models in `libs/model/`

### Authentication Flow

1. Client obtains token via POST `/api/oauth/token` with grant_type, client credentials, and user credentials
2. Server validates credentials using Passport strategies
3. OAuth2orize generates access and refresh tokens (32-byte random hex)
4. Tokens stored in MongoDB with userId and clientId
5. Subsequent requests include Bearer token in Authorization header
6. BearerStrategy validates token and checks expiration (configurable tokenLife)

## Development Commands

```bash
# Install dependencies
npm install

# Generate demo data (requires MongoDB running)
node generateData.js

# Start the server
npm start
# or
node bin/www

# Run JSHint linting
jshint libs/**/*.js generateData.js
```

## Configuration

Configuration is managed via `nconf` in `libs/config.js`, which loads from:
1. Command line arguments
2. Environment variables
3. `config.json` file

### Key Configuration Options

```json
{
    "port": 1337,
    "security": {
        "tokenLife": 3600  // Token expiration in seconds
    },
    "mongoose": {
        "uri": "mongodb://localhost/apiDB"
    },
    "default": {
        "user": {
            "username": "myapi",
            "password": "abc1234"
        },
        "client": {
            "name": "Android API v1",
            "clientId": "android",
            "clientSecret": "SomeRandomCharsAndNumbers"
        }
    }
}
```

## API Endpoints

### OAuth Token
- `POST /api/oauth/token` - Obtain or refresh access token
  - grant_type: `password` or `refresh_token`
  - Requires client_id and client_secret

### Users
- `GET /api/users/info` - Get current user info (requires Bearer token)

### Articles (all require Bearer token)
- `GET /api/articles` - List all articles
- `POST /api/articles` - Create new article
- `GET /api/articles/:id` - Get article by ID
- `PUT /api/articles/:id` - Update article by ID

### Health Check
- `GET /api` - Returns `{ msg: 'API is running' }` (requires Bearer token)

## Code Conventions

### Module Resolution Pattern
All modules use a consistent pattern for resolving paths:
```javascript
var libs = process.cwd() + '/libs/';
var config = require(libs + 'config');
var log = require(libs + 'log')(module);
```

### Logging
Use the Winston logger factory, passing the module for context:
```javascript
var log = require(libs + 'log')(module);
log.info("Message");
log.error("Error: %s", err.message);
```

### Error Handling
Routes follow a consistent error response pattern:
```javascript
if (!err) {
    return res.json(data);
} else {
    if (err.name === 'ValidationError') {
        res.statusCode = 400;
        return res.json({ error: 'Validation error' });
    } else {
        res.statusCode = 500;
        log.error('Internal error(%d): %s', res.statusCode, err.message);
        return res.json({ error: 'Server error' });
    }
}
```

### Mongoose Models
- Define schema with required fields
- Use virtuals for computed properties (e.g., userId)
- Implement validation using path validators
- Password hashing uses HMAC-SHA1 with random salt

### Authentication
- All protected routes use: `passport.authenticate('bearer', { session: false })`
- OAuth2 client authentication supports both Basic and client-password strategies

## JSHint Configuration

The project uses JSHint for linting with configuration in `package.json`:
- `curly: true` - Require curly braces
- `eqeqeq: true` - Require === and !==
- `undef: true` - Warn on undefined variables
- `node: true` - Node.js globals enabled

## Important Notes for Development

### Security Considerations
- Passwords are hashed using HMAC-SHA1 (comments suggest pbkdf2 for production)
- Tokens are generated using `crypto.randomBytes(32)`
- Token expiration is enforced in BearerStrategy
- Client secrets should be changed in production

### Database Dependencies
- Requires MongoDB running locally on default port
- Default database: `apiDB`
- Run `generateData.js` to populate initial user and client

### Common Patterns to Follow
1. Always use the `libs` path pattern for imports
2. Pass `module` to logger factory for file context
3. Use Passport authentication middleware on protected routes
4. Return JSON responses with consistent structure
5. Log errors with status code and message
6. Handle Mongoose validation errors separately (400 vs 500)

### Testing API
Use httpie or curl for testing:
```bash
# Get token
http POST http://localhost:1337/api/oauth/token \
    grant_type=password \
    client_id=android \
    client_secret=SomeRandomCharsAndNumbers \
    username=myapi \
    password=abc1234

# Use token
http http://localhost:1337/api/articles \
    Authorization:'Bearer YOUR_TOKEN_HERE'
```

## Extending the API

### Adding a New Model
1. Create file in `libs/model/`
2. Define Mongoose schema with required fields
3. Add validation if needed
4. Export using `mongoose.model()`

### Adding a New Route
1. Create file in `libs/routes/`
2. Import required dependencies (express, passport, models)
3. Define routes with appropriate authentication
4. Register in `libs/app.js` with `app.use()`

### Example Route Pattern
```javascript
var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var Model = require(libs + 'model/modelname');

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    Model.find(function(err, items) {
        if (!err) {
            return res.json(items);
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s', res.statusCode, err.message);
            return res.json({ error: 'Server error' });
        }
    });
});

module.exports = router;
```
