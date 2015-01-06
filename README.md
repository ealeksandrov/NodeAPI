# Node REST API

REST API for mobile applications using Node.js and Express.js framework with Mongoose.js for working with MongoDB. For access control this project use OAuth 2.0, with the help of OAuth2orize and Passport.js.

Tutorials based on this example:

* [aleksandrov.ws](http://aleksandrov.ws/2013/09/12/restful-api-with-nodejs-plus-mongodb/)

## Modules

Some of not standard modules used:
* express
* mongoose
* nconf
* winston
* faker
* oauth2orize
* passport
* underscore
* winston

## Author

This example was created by Evgeny Aleksandrov ([@EAleksandrov](http://twitter.com/EAleksandrov)).


License: MIT.

--------------------------------------------

http POST http://localhost:1337/oauth/token grant_type=password client_id=android client_secret=SomeRandomCharsAndNumbers username=myapi password=abc1234

http POST http://localhost:1337/oauth/token grant_type=refresh_token client_id=android client_secret=SomeRandomCharsAndNumbers refresh_token=[TOKEN]

http http://localhost:1337/api/userinfo Authorization:'Bearer [TOKEN]'



---------------------Updated-----------------------
http POST http://localhost:1338/api/oauth/token grant_type=password client_id=android client_secret=SomeRandomCharsAndNumbers username=myapi password=abc1234

http http://localhost:1338/api/users/info Authorization:'Bearer PUT_YOUR_TOKEN_HERE'

http http://localhost:1338/api/articles Authorization:'Bearer grQHWmerkbSHaE69caTU5WTOubpNmvPZGhXGMRCpkzU='




http PUT http://localhost:1338/api/articles/54ac05636d9c660e2e0b981f title=NewTestArticle author='Jane Done' description='lorem ipsum dolar sit amet' images:='[{"kind":"thumbnail", "url":"http://habrahabr.ru/images/write-topic.png"}, {"kind":"detail", "url":"http://habrahabr.ru/images/write-topic.png"}]' Authorization:'Bearer grQHWmerkbSHaE69caTU5WTOubpNmvPZGhXGMRCpkzU='




http PUT http://localhost:1337/api/articles/52306b6a0df1064e9d000003 title=TestArticle2 author='John Doe' description='lorem ipsum dolar sit amet' images:='[{"kind":"thumbnail", "url":"http://habrahabr.ru/images/write-topic.png"}, {"kind":"detail", "url":"http://habrahabr.ru/images/write-topic.png"}]'



	
