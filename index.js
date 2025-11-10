require("dotenv").config()
const express = require("express")
const cors = require("cors")
const { connectDB } = require("./db")

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Routes
const challengeRoutes = require("./routes/challenges")

app.use("/api/challenges", challengeRoutes)

connectDB()

app.get("/", (req, res) => {
  res.send("EcoTrack API is running")
})

app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`)
})
