const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URI);

async function connectDB() {
  await client.connect();
  console.log("Connecté à MongoDB Atlas");
  return client.db(process.env.DB_NAME);
}

module.exports = connectDB;