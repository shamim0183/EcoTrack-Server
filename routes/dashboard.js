const express = require("express")
const router = express.Router()
const { getDB } = require("../db")

router.get("/", async (req, res) => {
  const db = getDB()
  const userEmail = req.query.userEmail

  if (!db) {
    return res.status(500).json({ message: "Database not initialized" })
  }

  try {
    const [challenges, tips, events] = await Promise.all([
      db
        .collection("challenges")
        .find({ participants: userEmail })
        .sort({ createdAt: -1 })
        .toArray(),
      db
        .collection("tips")
        .find({ likes: userEmail })
        .sort({ createdAt: -1 })
        .toArray(),
      db
        .collection("events")
        .find({ attendees: userEmail })
        .sort({ date: 1 })
        .toArray(),
    ])

    res.json({ challenges, tips, events })
  } catch (err) {
    console.error("Filtered dashboard error:", err)
    res.status(500).json({ message: "Failed to load personalized dashboard" })
  }
})
module.exports = router