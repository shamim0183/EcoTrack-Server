require("dotenv").config()
const { MongoClient, ServerApiVersion } = require("mongodb")

const uri = process.env.MONGO_URI

if (!uri) {
  throw new Error("❌ MONGO_URI is not defined in environment variables")
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

let db
let clientPromise

// For Vercel serverless - connect lazily
async function connectDB() {
  if (db) {
    return db // Reuse existing connection
  }

  try {
    if (!clientPromise) {
      clientPromise = client.connect()
    }
    await clientPromise
    db = client.db("ecotrack")
    console.log("✅ MongoDB connected")
    return db
  } catch (err) {
    console.error("❌ MongoDB error:", err)
    throw err
  }
}

// Get DB - connect if not already connected (for serverless)
async function getDB() {
  if (!db) {
    await connectDB()
  }
  return db
}

module.exports = { connectDB, getDB }
