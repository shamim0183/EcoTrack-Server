require("dotenv").config()
const express = require("express")
const cors = require("cors")
const { MongoClient, ServerApiVersion } = require("mongodb")

const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Atlas setup
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
    db = client.db("ecotrack") // your database name
    console.log("MongoDB connected")
  } catch (err) {
    console.error("MongoDB error:", err)
  }
}
connectDB()

// Export DB accessor for routes
function getDB() {
  return db
}
module.exports = getDB

// Root route
app.get("/", (req, res) => {
  res.send("EcoTrack API is running")
})

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
