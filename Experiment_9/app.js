const { MongoClient } = require("mongodb");

const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);

const dbName = "studentDB";
const collectionName = "students";

async function main() {
    try {
        // Connect to MongoDB
        await client.connect();

        console.log("\nConnected to MongoDB!");
        console.log("Database:", dbName);
        console.log("Collection:", collectionName);

        // Select database & collection
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // ---------------------------------------------
        // READ CURRENT DATA FROM MONGODB
        // ---------------------------------------------
        const students = await collection.find({}).toArray();

        console.log("\n====================================");
        console.log("CURRENT DATA FROM MONGODB");
        console.log("====================================");

        students.forEach(student => {
            console.log("\nStudent ID:", student.studentId);
            console.log("Name:", student.name);
            console.log("Department:", student.department);
            console.log("Subjects:");

            student.subjects.forEach(subject => {
                console.log(
                    "  ",
                    subject.subject,
                    "Marks:",
                    subject.marks,
                    "Grade:",
                    subject.grade
                );
            });
        });

        // ---------------------------------------------
        // AGGREGATION (FIXED SYNTAX)
        // ---------------------------------------------
        console.log("\n====================================");
        console.log("UPDATED GRADE SUMMARY");
        console.log("====================================");

        const result = await collection.aggregate([
            {
                // Deconstructs the array field to output a document for each element
                $unwind: "$subjects"
            },
            {
                // Groups documents by studentId and calculates summary metrics
                $group: {
                    _id: "$studentId",
                    name: {
                        $first: "$name"
                    },
                    department: {
                        $first: "$department"
                    },
                    totalMarks: {
                        $sum: "$subjects.marks"
                    },
                    averageMarks: {
                        $avg: "$subjects.marks"
                    },
                    highestMarks: {
                        $max: "$subjects.marks"
                    },
                    lowestMarks: {
                        $min: "$subjects.marks"
                    }
                }
            },
            {
                // Reshapes each document, formats fields, and rounds averages
                $project: {
                    _id: 0,
                    studentId: "$_id",
                    name: 1,
                    department: 1,
                    totalMarks: 1,
                    averageMarks: {
                        $round: ["$averageMarks", 2]
                    },
                    highestMarks: 1,
                    lowestMarks: 1
                }
            },
            {
                // Sorts the final summaries by average marks descending
                $sort: {
                    averageMarks: -1
                }
            }
        ]).toArray();

        // Print the beautiful formatted summary table
        console.table(result);

    } catch (error) {
        console.error("\nMongoDB Error:");
        console.error(error);
    } finally {
        // Safely close connection
        await client.close();
    }
}

main();
