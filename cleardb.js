require("dotenv").config();
require("./database").conn();
const scm = require('./dbschema');

scm.subjectModel.deleteMany({
    subject: /.*/,
}).then(
    console.log("Cleared Subjects!")
);

scm.courseModel.deleteMany({
    name: /.*/,
}).then(
    console.log("Cleared Courses!")
);

scm.userModel.deleteMany({
    accname: /.*/,
}).then(
    console.log("Cleared Users!")
);