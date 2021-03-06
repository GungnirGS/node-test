# node-test
Test for NodeJS, ExpressJS and Mongoose


## Versioning
- NodeJS v16.15.0
- MongoDB v5.0.9


## Dependencies
- "bcrypt": "^5.0.1",
- "dotenv": "^16.0.1",
- "express": "^4.18.1",
- "jsonwebtoken": "^8.5.1",
- "mongoose": "^6.3.6"

## Assumptions
1. A user collection is needed to store the user information when they register, login and update their account details.
2. Get Training API is implemented using the same routing but category to be filtered is differentiated using a `filter` field.
3. There are no limitation or control (for now) for a basic user to update their user type to admin using the update profile API.
4. No login (JWT access token) is required when registering and logging in. Login is required for updating profile and password, querying for subjects and querying for training. Admin Login is required to add new subjects and add new training.

## How to run
1. Download or clone the repository.
2. Open up a terminal/cmd in the directory extracted to.
3. Change MongoDB URI in .env file.
4. Create a TOKEN_SECRET for JWT if needed in .env file.
5. Specify PORT if needed in .env file.
6. (Optional) Populate database by running 
```
node .\populate.js
```
7. Start the application by running 
```
node .\app.js
```
8. (Optional) Drop database collection by running
```
node .\dropcollection.js
```

## Sending Request with Postman
1. Import `testapp.postman_collection.json` into Postman.

### Register & Login
- Set Body to raw JSON.
- Send `register Admin` request to register an admin.
- Send `register User` request to register a basic user.
- Send `login Admin` request to login as an admin.
- Send `login User` reuqest to login as a basic user.

Record down the **token** returned to access the application as the user.

### Welcome Page
- Set KEY = x-access-token and VALUE =  **token** in headers.
- Send `welcome` request with header to get a welcome message with your account name and role.

### Update Password
- Set Body to raw JSON.
- Set KEY = x-access-token and VALUE =  **token** in headers.
- Send `updatePassword` request with header to update current password with a new one.
- Send `updateProfile` request with header to change the role for another account.

### New Subject and Training
- Set Body to raw JSON.
- Set KEY = x-access-token and VALUE =  **token** in headers.
- Send `newSubject` request with header of *ADMIN* token to add a new subject.
- Send `newTraining` request with header of *ADMIN* token to add a new course/training.

### Query Subject and Training
- Set Body to raw JSON.
- Set KEY = x-access-token and VALUE =  **token** in headers.
- Send `findSubject` request with header to add a new subject.
    - `sort` can be "asc" for ascending or "dsc" descending.
    - `page` is the page number.
    - `pageSize` is the size of each page.
- Send `findTraining` request with header to add a new course/training.
    - `sort` can be "asc" for ascending or "dsc" descending.
    - `page` is the page number.
    - `pageSize` is the size of each page.
    - `filter` can be "subjects" to filter by a subject, "stream" to filter by all subjects of a stream or "type" to filter by a course/training type.
    - `filterValue` is the value of stream, subject or type to be filtered.

## Script Descriptions
- **app.js** - the main application script with all application functionalities.
- **auth.js** - middleware for authenticating tokens.
- **checkAdmin.js** - middleware for authenticating admin tokens.
- **database.js** - connects to MongoDB.
- **.env** - stores MongoDB URI, token secret for JWT and port to host the application.
- **dbschema.js** - defines the schema of collection using Mongoose.
- **dropcollection.js** - utility script to drop all collection.
- **populate.js** - utiltiy script to populate database with some data.


## Additional Notes
1. `modified` field in subjects and courses collection is used to store the admin user that added the subject or course. It is automatically logged by the application. Entries populated by `populate.js` will leave that field empty.
2. `created` field in subjects and courses collection is used to store the timestamp when the entry is added. The time used will be the current time and logged by the application.

## Resources Used
1. [How to Build an Authentication API with JWT Token in Node.js](https://www.section.io/engineering-education/how-to-build-authentication-api-with-jwt-token-in-nodejs/)
2. [Mongoose](https://mongoosejs.com/) 
3. [HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) 
4. [Node.js Tutorial](https://www.tutorialspoint.com/nodejs/index.htm)
