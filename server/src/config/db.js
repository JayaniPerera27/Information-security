const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/secure_exam_distribution";
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });

    const connection = mongoose.connection;
    console.log(`MongoDB connected: ${connection.host}/${connection.name}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    if (error.message.includes("querySrv")) {
      console.error(
        "Atlas SRV DNS lookup failed. Check your internet connection, DNS settings, firewall, or use a local MongoDB URI."
      );
    }

    process.exit(1);
  }
};

module.exports = connectDatabase;
