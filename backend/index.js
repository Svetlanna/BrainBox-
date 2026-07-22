const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const connectDB = require("./database/mongo");
const knowledgeRouter = require("./server");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

app.use("/knowledge", knowledgeRouter);

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});