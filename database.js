const mongoose = require("mongoose");

// Get URI from .env
const { MONGO_URI } = process.env

module.exports.conn = () => {

    // Conenct to db
    return mongoose.connect(MONGO_URI, {

    }).then((db) => {
        console.log("Connected to db!");
        return db;
    }).catch((err) => {
        console.log("Failed to connect to db!");
        console.error(err);
        process.exit(1);
    });

};