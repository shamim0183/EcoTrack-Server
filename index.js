require("dotenv").config()
const express = require("express")
const cors = require("cors")
const { verifyFirebaseToken } = require("./firebaseAuth")

const app = express()
const port = process.env.PORT || 3000

// CORS Configuration - Allow both local and production
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CORS_ORIGIN, // Add your Netlify URL in Vercel env vars
].filter(Boolean) // Remove undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
  })
)
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

// For Vercel serverless - export the app
module.exports = app

// Start server
const { connectDB } = require("./db")
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server listening on port ${port}`)
    })
  })
  .catch((err) => {
    console.error("❌ Failed to connect to DB:", err)
    process.exit(1)
  })
