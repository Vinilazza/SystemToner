const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoURI =
    process.env.MONGO_URI || "mongodb://localhost:27017/tonersDB";

  // Opções de conexão que ajudam na estabilidade e controle do pool
  const options = {
    autoIndex: false, // Desabilita criação automática de índices (melhora performance)
    maxPoolSize: 10, // Limita o pool de conexões
    serverSelectionTimeoutMS: 5000, // Tempo máximo para selecionar um servidor
    socketTimeoutMS: 45000, // Tempo de inatividade antes de fechar uma conexão
  };

  try {
    await mongoose.connect(mongoURI, options);
    console.log("Conectado ao MongoDB");
  } catch (err) {
    console.error("Erro na conexão com o MongoDB:", err);
    console.log("Tentando reconectar em 5 segundos...");
    // Aguarda 5 segundos e tenta conectar novamente
    setTimeout(connectDB, 5000);
  }
};

// Monitorar eventos de desconexão para tentar reconectar
mongoose.connection.on("disconnected", () => {
  console.error("MongoDB desconectado! Tentando reconectar...");
  connectDB();
});

mongoose.connection.on("error", (err) => {
  console.error("Erro na conexão com o MongoDB:", err);
});

module.exports = connectDB;
