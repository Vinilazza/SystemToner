const express = require("express");
const routes = require("./routes");
const brotliCompressionMiddleware = require("./middlewares/brotliCompression");
const corsMiddleware = require("./middlewares/corsMiddleware");
const path = require("path");
const cookieParser = require("cookie-parser");
const app = express();
app.set("trust proxy", true);

const connectDB = require("./config/db");
connectDB().catch((err) => console.error("DB connect error:", err));
// Middlewares
app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rotas centralizadas: todas as rotas da API ficam agrupadas sob /api
app.use("/api", routes);
app.use(brotliCompressionMiddleware);

// Rota padrão para verificação
app.get("/", (req, res) => {
  res.send("API do Controle de Toners");
});

module.exports = app;
