const express = require("express")
const router = express.Router()
const { ObjectId } = require("mongodb")
const { getDB } = require("../db")

// Join a challenge
router.post("/join", async (req, res) => {
  const db = getDB()
  const { userId, challengeId } = req.body

  if (!userId || !challengeId) {
    return res.status(400).json({ message: "Missing userId or challengeId" })
  }

  try {
    const existing = await db.collection("userChallenges").findOne({
      userId,
      challengeId: new ObjectId(challengeId),
    })

    if (existing) {
      return res.status(409).json({ message: "Already joined" })
    }

    const result = await db.collection("userChallenges").insertOne({
      userId,
      challengeId: new ObjectId(challengeId),
      status: "Not Started",
      progress: 0,
      joinDate: new Date(),
    })

    res.json({ message: "Challenge joined", id: result.insertedId })
  } catch (err) {
    console.error("Join error:", err)
    res.status(500).json({ message: "Failed to join challenge" })
  }
})

module.exports = router
