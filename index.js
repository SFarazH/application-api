const express = require("express");
const connectDB = require("./db/dbConnect");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const serverless = require("serverless-http");

const app = express();
const PORT = process.env.PORT || 8257;

connectDB();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
app.use(express.json());

app.use("/auth", authRoutes);

app.use("/user", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
module.exports.handler = serverless(app);
