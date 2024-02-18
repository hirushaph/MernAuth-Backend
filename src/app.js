const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dbConnect = require("./db/conn");
const mongoose = require("mongoose");
const router = require("./router/route");
const cookieParser = require("cookie-parser");
const { default: rateLimit } = require("express-rate-limit");
const helmet = require("helmet");

require("dotenv").config();

const app = express();

// Use Helmet!
app.use(helmet());

// Rate limit
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, //1 min
  max: process.env.MAX_API_REQUEST_PER_IP_FOR_MINUTE || 100,
});

// Middlewares
app.use(express.json());
app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL }));
app.use(cookieParser());
app.use(morgan("tiny"));
app.use(limiter);

const PORT = process.env.PORT || "3000";

// API Router

app.get("/", (req, res) => {
  res.send({ helo: "hello" });
});

app.use("/api/v1", router);

app.all("*", (req, res, next) => {
  const error = new Error(`can't find ${req.originalUrl} on the server`);
  error.status = "fail";
  error.statusCode = 404;
  next(error);
});

// Error Handle Middleware

app.use((error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
});

// Start Server if datbase connected
async function initializeApp() {
  try {
    await dbConnect();
    app.listen(PORT, () => {
      console.log("Server Started");
    });
  } catch (err) {
    console.log(err);
  }
}

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
