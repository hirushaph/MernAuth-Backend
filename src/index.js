const mongoose = require("mongoose");
const app = require("./app");
const dbConnect = require("./db/conn");

require("dotenv").config();

// Start Server if datbase connected
async function initializeApp() {
  try {
    await dbConnect();
    app.listen(process.env.PORT, () => {
      console.log("Server Started");
    });
  } catch (err) {
    console.log(err);
  }
}

// start mongodb and express
initializeApp();

// Handle MongoDB connection close on application termination
process.on("SIGINT", async () => {
  console.log("Received SIGINT. Closing MongoDB connection...");

  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed due to application termination");
    process.exit(0);
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    process.exit(1);
  }
});
