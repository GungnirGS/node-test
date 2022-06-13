require("dotenv").config(); 
const dbModule = require("./database");
const scm = require('./dbschema');

dbModule.conn().then( async (db) => {
    const newSubject1 = await scm.subjectModel.create({
        subject: "Maths",
        stream: "Science",
        created: new Date()
    });

    const newSubject2 = await scm.subjectModel.create({
        subject: "English",
        stream: "Arts",
        created: new Date()
    });

    const newSubject3 = await scm.subjectModel.create({
        subject: "Physics",
        stream: "Science",
        created: new Date()
    });

    const newSubject4 = await scm.subjectModel.create({
        subject: "Economics",
        stream: "Commerce",
        created: new Date()
    });

    const newSubject5 = await scm.subjectModel.create({
        subject: "Social Science",
        stream: "Arts",
        created: new Date()
    });

    const newSubject6 = await scm.subjectModel.create({
        subject: "Finance",
        stream: "Commerce",
        created: new Date()
    });

    const newCourse1 = await scm.courseModel.create({
        name: "Basics of Eng",
        subjects: [
            {subject: "Maths"},
            {subject: "Physics"},
            {subject: "English"}
        ],
        type: "Basic",
        created: new Date()
    });
    const newCourse2 = await scm.courseModel.create({
        name: "CA Fundamentals",
        subjects: [
            {subject: "English"},
            {subject: "Economics"},
            {subject: "Finance"}
        ],
        type: "Basic",
        created: new Date()
    });
    const newCourse3 = await scm.courseModel.create({
        name: "Internaltional arts",
        subjects: [
            {subject: "English"},
            {subject: "Social Science"} ,
            {subject: "Finance"}
        ],
        type: "Detailed",
        created: new Date()
    });

    await db.disconnect();
});
