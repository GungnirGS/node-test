require("dotenv").config();
const dbModule = require("./database");
const scm = require('./dbschema');


dbModule.conn().then( async (db) => {

    await scm.userModel.collection.drop();
    await scm.subjectModel.collection.drop();
    await scm.courseModel.collection.drop();
    await db.disconnect();
});





