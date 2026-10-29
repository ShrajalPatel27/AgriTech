const mongoose = require('mongoose');

const MONGO_URI =
  process.env.MONGO_URI ||
  (process.env.NODE_ENV !== 'production'
    ? 'mongodb://127.0.0.1:27017/agritech'
    : null);

// Reuse database connection across serverless invocations
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

module.exports = async function connectDB() {
  // Return existing connection if already connected
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Production must use MongoDB Atlas
  if (!MONGO_URI) {
    throw new Error(
      'MONGO_URI is missing. Configure MongoDB Atlas connection string.'
    );
  }

  // Create connection only once
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
      })
      .then((mongooseInstance) => {
        console.log('MongoDB connected successfully');
        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;

  return cached.conn;
};