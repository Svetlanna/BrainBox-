const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
const express = require("express");
const cors = require("cors");
const connectDB = require("./database/mongo");
const knowledgeRouter = require("./server");
const assistantRouter = require("./routes/assistant.routes");
const authRouter = require("./routes/auth.routes");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

global.db = null;
app.use("/auth", authRouter);
app.use("/knowledge", knowledgeRouter);
app.use("/assistant", assistantRouter);


connectDB()
  .then((dbb) => {
    global.db = dbb;

  })
  .catch((err) => {
    console.error("Échec de connexion à MongoDB :", err);
    process.exit(1);
  });

app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });