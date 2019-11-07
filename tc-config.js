/* Tin Can configuration */

// ActivityID that is sent for the statement's object
TC_COURSE_ID = "https://crosstrainerlearning.com/intro";

// CourseName for the activity
TC_COURSE_NAME = {
    "en-US": "Intro Course"
};

// CourseDesc for the activity
TC_COURSE_DESC = {
    "en-US": "Introduction to Intro"
};

// Pre-configured LRSs that should receive data, added to what is included
// in the URL and/or passed to the constructor function.
//
// An array of objects where each object may have the following properties:
//    endpoint: (including trailing slash '/')
//    auth:
//    allowFail: (boolean, default true)
//    version: (string, defaults to high version supported by TinCanJS)
TC_RECORD_STORES = [
   /* {
        endpoint: "https://cloud.scorm.com/lrs/8A7BD794LF/sandbox/",
        user: "IYAB9Sb1f4okO98c4ac",
        password: "rY9Ul55hq7c3ziz1qQM",
        version:  "1.0.2"
    } */
];
