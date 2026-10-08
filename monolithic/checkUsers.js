const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);

require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");
        console.log("Database:", mongoose.connection.name);

        const users = await User.find({}, "name email");

        console.log("Users:");
        console.log(users);

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error.message);
    }
}

checkUsers();
