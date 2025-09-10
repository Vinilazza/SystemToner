require("dotenv").config(); // Carrega variáveis de ambiente (ex: MONGO_URI, PORT)
const app = require("./app");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao conectar ao banco de dados", err);
  });
