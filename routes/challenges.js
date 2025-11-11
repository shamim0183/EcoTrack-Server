const express = require("express")
const router = express.Router()
const { ObjectId } = require("mongodb")
const { getDB } = require("../db")

// GET all challenges
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

// POST a new challenge
router.post("/", async (req, res) => {
  const db = getDB()
  const {
    title,
    category,
    description,
    duration,
    target,
    impactMetric,
    startDate,
    endDate,
    imageUrl,
    createdBy,
  } = req.body

  try {
    const result = await db.collection("challenges").insertOne({
      title,
      category,
      description,
      duration,
      target,
      impactMetric,
      startDate,
      endDate,
      imageUrl,
      createdBy,
      participants: [],
      createdAt: new Date(),
    })
    res.json({ message: "Challenge created", id: result.insertedId })
  } catch (err) {
    console.error("Challenge creation error:", err)
    res.status(500).json({ message: "Failed to create challenge" })
  }
})

// PATCH to join a challenge
router.patch("/join/:id", async (req, res) => {
  const db = getDB()
  const challengeId = req.params.id
  const userEmail = req.body.userEmail

  if (!userEmail) {
    return res
      .status(400)
      .json({ message: "Missing userEmail in request body" })
  }

  try {
    const result = await db
      .collection("challenges")
      .findOneAndUpdate(
        { _id: new ObjectId(challengeId) },
        { $addToSet: { participants: userEmail } },
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

// GET filtered challenges
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
    filter["participants.0"] = { $exists: true } // ensure it's an array
    filter.$expr = {
      $and: [
        ...(minParticipants
          ? [{ $gte: [{ $size: "$participants" }, parseInt(minParticipants)] }]
          : []),
        ...(maxParticipants
          ? [{ $lte: [{ $size: "$participants" }, parseInt(maxParticipants)] }]
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

module.exports = router
