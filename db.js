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
let connecting = false

// Initialize connection eagerly (will reuse in serverless)
async function connectDB() {
  if (db) return db

  if (connecting) {
    // Wait for existing connection attempt
    while (connecting) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    return db
  }

  try {
    connecting = true
    await client.connect()
    db = client.db("ecotrack")
    console.log("✅ MongoDB connected")
    return db
  } catch (err) {
    console.error("❌ MongoDB error:", err)
    throw err
  } finally {
    connecting = false
  }
}

// Get DB synchronously - connection must be established first
function getDB() {
  if (!db) {
    throw new Error("❌ DB not initialized. Call connectDB() first.")
  }
  return db
}

// Auto-connect on module load for serverless
if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  connectDB().catch((err) => console.error("Failed to connect:", err))
}

module.exports = { connectDB, getDB }
