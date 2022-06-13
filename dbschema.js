const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    accname: { type: String, unique: true },
    password: { type: String },
    token: { type: String },
    type: { type: String },
});

const subjectSchema = new Schema({
    subject: { type: String, unique: true },
    stream: { type: String, default: null },
    created: { type: Date },
    updated: { type: Date },
    modified: { type: String }
});

const courseSchema = new Schema({
    name: { type: String, unique: true },
    subjects: { type: Array },
    type: { type: String },
    created: { type: Date },
    updated: { type: Date },
    modified: { type: String }
});

module.exports.userModel = mongoose.model("Users", userSchema);
module.exports.subjectModel = mongoose.model("Subjects", subjectSchema);
module.exports.courseModel = mongoose.model("Courses", courseSchema);