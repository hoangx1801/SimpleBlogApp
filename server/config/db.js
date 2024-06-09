const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connect successfully!");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = connectDB;
