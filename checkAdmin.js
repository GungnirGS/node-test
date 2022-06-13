const jwt = require("jsonwebtoken");

const config = process.env;

const checkAdmin = (req, res, next) => {

    try {
        // Check if user is admin
        if (req.user.type != "admin") {
            return res.status(401).send("Unauthorized access!");
        }
    } catch (err) {
        console.log(err);
    }
    return next();
};

module.exports = checkAdmin;