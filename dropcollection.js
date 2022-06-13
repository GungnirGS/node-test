require("dotenv").config();
require("./database").conn();
const scm = require('./dbschema');

scm.userModel.collection.drop();
scm.subjectModel.collection.drop();
scm.courseModel.collection.drop();