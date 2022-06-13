require("dotenv").config(); //For reading .env
require("./database").conn(); //Connect to db
const express = require("express"); //Express js
const bcrypt = require('bcrypt'); //Password encrytion
const scm = require('./dbschema'); //Db Schemas: userModel, subjectModel, courseModel
const jwt = require('jsonwebtoken'); //JWT for token generation
const auth = require("./auth"); // middleware to check for token
const chkAdmin = require("./checkAdmin"); // middleware to check if token is an admin

const app = express();

app.use(express.json());

/** 
 * For registering users, provides new token
 * Accepted JSON fields:
 * {
    "accname": { type: String, unique: true }, (account name, must be unique)
    "password": { type: String }, (password name)
    "type": { type: String } (account type, must be "admin" or "basic")
   }
 */
app.post("/register", async (req, res) => {

    try {
        // Get fields from request body JSON
        const { accname, password, type } = req.body;
        // Check if required fields are empty
        if (!(accname && password && type)) {
            return res.status(400).send("All fields are required");
        }

        // Check if user exists
        const checkUser = await scm.userModel.findOne({ accname: accname });

        if (checkUser) {
            return res.status(409).send("User already exist.");
        }

        // Check if type field is valid
        if ((type != "admin") && (type != "basic")){
            return res.status(400).send("User type must be 'admin' or 'basic'!");
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10)

        // Store user in db
        const user = await scm.userModel.create({
            accname,
            password: passwordHash,
            type: type
        });

        // Create JWT, sign with db generated ID, account name and user type
        const jwtoken = jwt.sign(
            { user_id: user._id, accname, type: user.type },
            process.env.TOKEN_SECRET,
            {
                expiresIn: "2h",
            }
        );

        // let pojoUser = user.toObject();
        user.token = jwtoken;

        console.log(user.accname, "has registered!");

        // Respond with user detail JSON
        return res.status(201).json(user);

    } catch (err) {
        console.log(err);
        return res.status(400).send("Failed to register!");
    }

});

/**
 * For user login, provides new token
 * Accepted JSON fields:
 * {
   "accname": { type: String }, (account name)
   "password": { type: String } (password)
   }
 */
app.post("/login", async (req, res) => {

    try {
        // Get account name and password from request body JSON
        const { accname, password } = req.body;
        // Check if required fields are empty
        if (!(accname && password)) {
            return res.status(400).send("All fields are required");
        }

        // Check if user is in database
        const user = await scm.userModel.findOne({ accname: accname });
        if (!user){
            return res.status(400).send("Please register first");
        }
        // Check if password match
        const checkPassword = await bcrypt.compare(password, user.password)
        // If both match, create new JWT
        if (user && checkPassword) {
            const jwtoken = jwt.sign(
                { user: user._id, accname, type: user.type },
                process.env.TOKEN_SECRET,
                {
                    expiresIn: "2h",
                }
            );

            // let pojoUser = user.toObject();
            user.token = jwtoken;

            console.log(user.accname, "has logged in!");
            // Respond with user detail JSON
            return res.status(201).json(user);
        }
        // If username doesn't exist or password doesn't match
        return res.status(400).send("Wrong username or password!");

    } catch (err) {
        console.log(err);
    }
});

/**
 * For updating password
 * Requires valid JWT
 * Accepted JSON fields:
 * {
   "accname": { type: String }, (account name)
   "password": { type: String }, (old password)
   "newPassword": { type: String } (new password)
   }
 */
app.post("/updatePassword", auth, async (req, res) => {

    try {
        // Get old and new password from request body JSON
        const { password, newPassword } = req.body;
        // Check if both passwords are emtpy
        if (!(password && newPassword)) {
            return res.status(400).send("All fields are required!");
        }

        // Find user in database
        const user = await scm.userModel.findOne({ accname: req.user.accname });
        // Check if old and new password are the same
        const checkPassword = await bcrypt.compare(password, user.password)

        if (!checkPassword) {
            return res.status(409).send("Old password does not match.");
        }

        // Check if old and new password are the same
        if (password == newPassword) {
            return res.status(409).send("Old password cannot be the same as new password.");
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 10)
        // Update db with new password
        const user2 = await scm.userModel.updateOne({ accname: req.user.accname }, {
            password: passwordHash
        });

        const response = "Password changed for " + req.user.accname;
        console.log(response)
        // Reply to user that password has been changed
        return res.status(201).send(response);

    } catch (err) {
        console.log(err);
        return res.status(400).send("Failed to change password!");
    }

});

/**
 * For updating profile type
 * Requires valid JWT
 * Requires admin access
 * Accepted JSON fields:
 * {
   "accname": { type: String }, (account name)
   "type": { type: String } (account type to change into, must be "admin" or "basic")
   }
 */
app.post("/updateProfile", auth, async (req, res) => {

    try {

        // Get accname and type from request body JSON
        const { accname, type } = req.body;
        // Check if required fields are emtpy
        if (!(accname && type)) {
            return res.status(400).send("All fields are required!");
        }
        // Check if type field is valid
        if ((type != "admin") && (type != "basic")){
            return res.status(400).send("User type must be 'admin' or 'basic'!");
        }

        // Update user type in db
        const user = await scm.userModel.updateOne({ accname: accname }, {
            type: req.body.type
        });

        const response = "Profile updated for " + req.user.accname +" !";
        console.log(response)
        // Reply to user that user type has been changed
        return res.status(201).send(response);

    } catch (err) {
        console.log(err);
        return res.status(400).send("Failed to update profile!");
    }

});

/**
 * Welcome page, lets user check their user type/role
 * Requires valid JWT
 */
app.post("/welcome", auth, (req, res) => {

    try {
        const response = "Welcome " + req.user.accname + " 🙌 " + "\nYour role is " + req.user.type + " !";
        return res.status(200).send(response);
    } catch (err) {
        console.log(err);
    }
});

/**
 * Adds new subject to db
 * Requires valid JWT
 * Requires admin access
 * Accepted JSON fields:
 * {
    "subject": { type: String }, (name of subject)
    "stream": { type: String } (stream of subject)
    }
 */
app.put('/newSubject', auth, chkAdmin, async (req, res) => {

    try {
        // Get JSON from request body
        const dataJson = req.body;
        // Add new subject to db
        const newSubject = await scm.subjectModel.create({
            subject: dataJson.subject,
            stream: dataJson.stream,
            created: new Date(),
            modified: req.user.accname
        });

        const response = "Subject " + newSubject.subject + " has been created!";

        console.log(response);
        // Reply to user that new subject has been added
        return res.status(201).send(response);
    } catch (err) {
        console.log(err);
        return res.status(400).send("Failed to create new subject!");
    }
});

/**
 * Adds new training to db
 * Requires valid JWT
 * Requires admin access
 * Accepted JSON fields:
 * {
    "name": { type: String }, (name of training course)
    "subjects": [
        {"subject": { type: String }}... (subjects offered, can be one or more)
        ],
    "type": { type: String } (type of training course)
   }
 */
app.put('/newTraining', auth, chkAdmin, async (req, res) => {

    try {
        // Get JSON from request body
        const dataJson = req.body;
        // Add new subject to db
        const newCourse = await scm.courseModel.create({
            name: dataJson.name,
            subjects: dataJson.subjects,
            type: dataJson.type,
            created: new Date(),
            modified: req.user.accname
        });

        const response = "Training " + newCourse.name + " has been created!";

        console.log(response);
        // Reply to user that new course has been added
        return res.status(201).send(response);
    } catch (err) {
        console.log(err);
        return res.status(400).send("Failed to create new training!");
    }
});

/**
 * Allows user to query for all subjects in db
 * Requires valid JWT
 * Default sorting:
 * Accepted JSON fields:
 * {
    "sort" : { type: String }, (sorting sequence, must be "asc" or "dsc")
    "page" : { type: int }, (page number)
    "pageSize" : { type: int } (page size defaults to 10)

   }
 */
app.get('/findSubject', auth, async (req, res) => {

    try {
        
        // Get query from request body JSON
        const query = req.body;

        // Default sorting to ascending
        let sorting = 1;
        // Check if sorting for descending
        if (query.sort == "dsc") {
            sorting = -1;
        }

        // Defaults page size to 10 per page
        if (!query.pageSize) {
            query.pageSize = 10;
        }

        // Query db for subjects
        const resultSubject = await scm.subjectModel.find({}).
            limit(query.pageSize).
            sort({ subject: sorting }).
            skip(query.pageSize * query.page);

        const response = "findSubject query returned " + String(resultSubject.length) + " item(s)."
        console.log(response);
        // Reply to user with subject JSON
        return res.status(201).json(resultSubject);
    } catch (err) {
        console.log(err);
    }
});

/**
 * Allows user to query for all subjects in db
 * Requires valid JWT
 * Default sorting:
 * Accepted JSON fields:
 * {
    "sort" : { type: String }, (sorting sequence, must be "asc" or "dsc")
    "page" : { type: int }, (page number)
    "pageSize" : { type: int } (page size defaults to 10)
    "filter": { type: String }, (filter by category, must be "subjects", "stream" or "type")
    "filterValue" : { type: String } (filter value for filter category)

   }
 */
app.get('/findTraining', auth, async (req, res) => {

    try {
        // Get query from request body json
        const query = req.body;

        // Defaults sorting to ascending
        let sorting = 1;
        // Check if sorting is descending
        if (query.sort == "dsc") {
            sorting = -1;
        }

        // Defaults page size to 10 per page
        if (!query.pageSize) {
            query.pageSize = 10;
        }

        // If filter by subjects
        if (query.filter == "subjects" && query.filterValue) {
            // Query db using subject recieved
            const resultCourse = await scm.courseModel.find({ "subjects.subject": query.filterValue }).
                limit(query.pageSize).
                sort({ name: sorting }).
                skip(query.pageSize * query.page);

            const response = "findTraining query by subjects returned " + String(resultCourse.length) + " item(s)."
            console.log(response);
            // Reply to user with training found
            return res.status(201).json(resultCourse);
        }

        // If filter by stream
        if (query.filter == "stream" && query.filterValue) {

            let resultsSub = [];
            // Query db for subjects in stream recieved
            const resultSubject = await scm.subjectModel.find({ stream: query.filterValue }, { "subject": 1 });
            // Parse result to array
            for (let i in resultSubject) {
                resultsSub.push(resultSubject[i].subject)
            }
            // Query db using subject found
            const resultCourse = await scm.courseModel.find({ "subjects.subject": { $in: resultsSub } }).
                limit(query.pageSize).
                sort({ name: sorting }).
                skip(query.pageSize * query.page);

            const response = "findTraining query by stream returned " + String(resultCourse.length) + " item(s)."
            console.log(response);
            // Reply to user with training found
            return res.status(201).json(resultCourse);
        }

        // If filter by type
        if (query.filter == "type" && query.filterValue) {
            // Query db using type recieved
            const resultCourse = await scm.courseModel.find({ type: query.filterValue }).
                limit(query.pageSize).
                sort({ name: sorting }).
                skip(query.pageSize * query.page);

            const response = "findTraining query by type returned " + String(resultCourse.length) + " item(s)."
            console.log(response);
            // Reply to user with training found
            return res.status(201).json(resultCourse);
        }

        // If no filter provided
        if (!query.filter) {
            // Query db for all training
            const resultCourse = await scm.courseModel.find({}).
                limit(query.pageSize).
                sort({ name: sorting }).
                skip(query.pageSize * query.page);

            const response = "findTraining query by all returned " + String(resultCourse.length) + " item(s)."
            console.log(response);
            // Reply to user with training found
            return res.status(201).send(resultCourse);
        }

        // If no statements for query hit
        const response = "Invalid query."
        console.log(response);
        return res.status(400).send(response);

    } catch (err) {
        console.log(err);
        return res.status(400).send("Bad request!");
    }
});

// Host the app on port
var server = app.listen(process.env.PORT, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Listening at http://%s:%s", host, port)
});