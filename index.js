require("dotenv").config()
const express = require("express")
const cors = require("cors")
const { connectDB } = require("./db")
const { verifyFirebaseToken } = require("./firebaseAuth")

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Routes
const challengeRoutes = require("./routes/challenges")
const tipRoutes = require("./routes/tips")
const eventRoutes = require("./routes/events")
const dashboardRoutes = require("./routes/dashboard")
const userRoutes = require("./routes/user")
const userChallengeRoutes = require("./routes/userChallenges")
const homeRoutes = require("./routes/homeRoutes")

// Public
app.use("/api/challenges", challengeRoutes)
app.use("/api/tips", tipRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/users", userRoutes)
app.use("/api", homeRoutes)

// Protected
app.use("/api/dashboard", verifyFirebaseToken, dashboardRoutes)
app.use("/api/user-challenges", verifyFirebaseToken, userChallengeRoutes)

app.get("/", (req, res) => {
  res.send("EcoTrack API is running")
})

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server listening on port ${port}`)
    })
  })
  .catch((err) => {
    console.error("❌ Failed to connect to DB:", err)
  })
