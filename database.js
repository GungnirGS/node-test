const mongoose = require("mongoose");

// Get URI from .env
const { MONGO_URI } = process.env

exports.conn = () => {

    // Conenct to db
    mongoose.connect(MONGO_URI, {

    }).then(() => {
        console.log("Connected to db!");
    }).catch((err) => {
        console.log("Failed to connect to db!");
        console.error(err);
        process.exit(1);
    });

};