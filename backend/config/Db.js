const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // mongodb+srv://bdeshop21_db_user:NDp5tXGNbGFqVWpm@cluster0.y8cndus.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
    const conn = await mongoose.connect(
      "mongodb+srv://bdeshop21_db_user:NDp5tXGNbGFqVWpm@cluster0.y8cndus.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
