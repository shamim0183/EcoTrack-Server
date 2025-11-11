const express = require("express")
const router = express.Router()
const { ObjectId } = require("mongodb")
const { getDB } = require("../db")

// 🔹 GET featured challenges
router.get("/featured", async (req, res) => {
  const db = getDB()
  try {
    const challenges = await db
      .collection("challenges")
      .find({ featured: true })
      .limit(3)
      .toArray()
    res.json(challenges)
  } catch (err) {
    console.error("Featured fetch error:", err)
    res.status(500).json({ message: "Failed to fetch featured challenges" })
  }
})

// 🔹 GET active challenges
router.get("/active", async (req, res) => {
  const db = getDB()
  const today = new Date()
  try {
    const challenges = await db
      .collection("challenges")
      .find({
        startDate: { $lte: today },
        endDate: { $gte: today },
      })
      .limit(6)
      .toArray()
    res.json(challenges)
  } catch (err) {
    console.error("Active fetch error:", err)
    res.status(500).json({ message: "Failed to fetch active challenges" })
  }
})

// 🔹 GET filtered challenges
router.get("/filter", async (req, res) => {
  const db = getDB()
  const { categories, startDate, endDate, minParticipants, maxParticipants } =
    req.query

  const filter = {}

  if (categories) {
    filter.category = { $in: categories.split(",") }
  }

  if (startDate || endDate) {
    filter.startDate = {}
    if (startDate) filter.startDate.$gte = new Date(startDate)
    if (endDate) filter.startDate.$lte = new Date(endDate)
  }

  if (minParticipants || maxParticipants) {
    filter.$expr = {
      $and: [
        ...(minParticipants
          ? [{ $gte: ["$participants", parseInt(minParticipants)] }]
          : []),
        ...(maxParticipants
          ? [{ $lte: ["$participants", parseInt(maxParticipants)] }]
          : []),
      ],
    }
  }

  try {
    const challenges = await db.collection("challenges").find(filter).toArray()
    res.json(challenges)
  } catch (err) {
    console.error("Filter error:", err)
    res.status(500).json({ message: "Failed to filter challenges" })
  }
})

// 🔹 PATCH to join a challenge
router.patch("/join/:id", async (req, res) => {
  const db = getDB()
  const challengeId = req.params.id

  if (!ObjectId.isValid(challengeId)) {
    return res.status(400).json({ message: "Invalid challenge ID" })
  }

  try {
    const result = await db
      .collection("challenges")
      .findOneAndUpdate(
        { _id: new ObjectId(challengeId) },
        { $inc: { participants: 1 } },
        { returnDocument: "after" }
      )

    if (!result.value) {
      return res.status(404).json({ message: "Challenge not found" })
    }

    res.json({ message: "Joined challenge", challenge: result.value })
  } catch (err) {
    console.error("Join error:", err)
    res.status(500).json({ message: "Failed to join challenge" })
  }
})

// 🔹 GET all challenges
router.get("/", async (req, res) => {
  const db = getDB()
  try {
    const challenges = await db
      .collection("challenges")
      .find({})
      .sort({ createdAt: -1 })
      .toArray()
    res.json(challenges)
  } catch (err) {
    console.error("Fetch challenges error:", err)
    res.status(500).json({ message: "Failed to fetch challenges" })
  }
})

// 🔹 GET a single challenge by ID (must be last)
router.get("/:id", async (req, res) => {
  const db = getDB()
  const { id } = req.params

  try {
    const challenge = await db
      .collection("challenges")
      .findOne({ _id: new ObjectId(id) })

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" })
    }

    res.json(challenge)
  } catch (err) {
    console.error("Fetch challenge error:", err)
    res.status(500).json({ message: "Failed to fetch challenge" })
  }
})

module.exports = router
