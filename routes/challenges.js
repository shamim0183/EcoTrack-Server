const express = require("express")
const router = express.Router()
const { ObjectId } = require("mongodb")
const { getDB } = require("../db")
const { verifyFirebaseToken } = require("../firebaseAuth")

// 🔹 POST: Create a new challenge (protected)
router.post("/", verifyFirebaseToken, async (req, res) => {
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
  } = req.body

  const userEmail = req.user?.email
  if (!userEmail) {
    return res.status(401).json({ message: "Unauthorized: Please log in" })
  }

  if (
    !title ||
    !category ||
    !description ||
    !duration ||
    !target ||
    !impactMetric ||
    !startDate ||
    !endDate ||
    !imageUrl
  ) {
    return res.status(400).json({ message: "Missing required fields" })
  }

  const newChallenge = {
    title,
    category,
    description,
    duration: parseInt(duration),
    target,
    impactMetric,
    participants: 0,
    createdBy: userEmail,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    imageUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  try {
    const result = await db.collection("challenges").insertOne(newChallenge)
    res
      .status(201)
      .json({ message: "Challenge created", challenge: newChallenge })
  } catch (err) {
    console.error("Create error:", err)
    res.status(500).json({ message: "Failed to create challenge" })
  }
})

// 🔹 PATCH: Update challenge (protected)
router.patch("/:id", verifyFirebaseToken, async (req, res) => {
  const db = getDB()
  const challengeId = req.params.id
  const updates = req.body
  const userEmail = req.user?.email

  if (!ObjectId.isValid(challengeId)) {
    return res.status(400).json({ message: "Invalid challenge ID" })
  }

  try {
    const challenge = await db
      .collection("challenges")
      .findOne({ _id: new ObjectId(challengeId) })

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" })
    }

    if (
      challenge.createdBy !== userEmail &&
      userEmail !== "admin@ecotrack.com"
    ) {
      return res.status(403).json({ message: "Forbidden: Not your challenge" })
    }

    updates.updatedAt = new Date().toISOString()

    const result = await db
      .collection("challenges")
      .findOneAndUpdate(
        { _id: new ObjectId(challengeId) },
        { $set: updates },
        { returnDocument: "after" }
      )

    res.json(result.value)
  } catch (err) {
    console.error("Update error:", err)
    res.status(500).json({ message: "Failed to update challenge" })
  }
})

// 🔹 DELETE: Remove challenge (protected)
router.delete("/:id", verifyFirebaseToken, async (req, res) => {
  const db = getDB()
  const challengeId = req.params.id
  const userEmail = req.user?.email

  if (!ObjectId.isValid(challengeId)) {
    return res.status(400).json({ message: "Invalid challenge ID" })
  }

  try {
    const challenge = await db
      .collection("challenges")
      .findOne({ _id: new ObjectId(challengeId) })

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" })
    }

    if (
      challenge.createdBy !== userEmail &&
      userEmail !== "admin@ecotrack.com"
    ) {
      return res.status(403).json({ message: "Forbidden: Not your challenge" })
    }

    await db
      .collection("challenges")
      .deleteOne({ _id: new ObjectId(challengeId) })
    res.json({ message: "Challenge deleted successfully" })
  } catch (err) {
    console.error("Delete error:", err)
    res.status(500).json({ message: "Failed to delete challenge" })
  }
})

// 🔹 Public GET routes
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

router.get("/", async (req, res) => {
  const db = getDB()
  const { limit } = req.query

  try {
    let query = db.collection("challenges").find({}).sort({ createdAt: -1 })

    // Apply limit if provided
    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const challenges = await query.toArray()
    res.json(challenges)
  } catch (err) {
    console.error("Fetch challenges error:", err)
    res.status(500).json({ message: "Failed to fetch challenges" })
  }
})

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
