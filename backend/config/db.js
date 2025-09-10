// config/db.js
const mongoose = require("mongoose");

let cached = global.mongooseConn;
if (!cached) {
  cached = global.mongooseConn = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI; // defina na Vercel
    const dbName = process.env.MONGODB_DB; // opcional
    cached.promise = mongoose
      .connect(uri, { dbName, bufferCommands: false })
      .then((m) => m.connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
