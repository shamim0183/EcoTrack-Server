// db.js
require("dotenv").config()
const { MongoClient, ServerApiVersion } = require("mongodb")

const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

let db

async function connectDB() {
  try {
    await client.connect()
    db = client.db("ecotrack")
    console.log("MongoDB connected")
  } catch (err) {
    console.error("MongoDB error:", err)
  }
}

function getDB() {
  return db
}

module.exports = { connectDB, getDB }
