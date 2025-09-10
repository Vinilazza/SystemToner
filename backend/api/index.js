// api/index.js
const app = require("../app");
const connectDB = require("../config/db");

module.exports = async (req, res) => {
  // garante conexão no ambiente serverless (com cache)
  await connectDB();
  return app(req, res); // delega para o Express
};
