// api/index.js
const app = require("../app"); // <- use esta se app.js está em backend/
//// const app = require("../app");     // <- use esta se app.js está na raiz

module.exports = app; // exporta o app para o runtime serverless do Vercel
