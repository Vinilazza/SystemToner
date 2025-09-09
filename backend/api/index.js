// backend/api/index.js
const app = require("../app");
const connectDB = require("../config/db");

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    await connectDB(); // garante conexão na primeira chamada
    isConnected = true;
  }
  return app(req, res); // delega para o Express
};
