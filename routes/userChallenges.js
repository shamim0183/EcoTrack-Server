const express = require("express")
const router = express.Router()
const { ObjectId } = require("mongodb")
const { getDB } = require("../db")

// POST: Join a challenge
router.post("/join", async (req, res) => {
  const db = getDB()
  const { challengeId } = req.body
  const userEmail = req.user.email

  if (!userEmail || !challengeId) {
    return res.status(400).json({ message: "Missing user or challengeId" })
  }

  try {
    const existing = await db.collection("userChallenges").findOne({
      userId: userEmail,
      challengeId: new ObjectId(challengeId),
    })

    if (existing) {
      return res.status(409).json({ message: "Already joined" })
    }

    const result = await db.collection("userChallenges").insertOne({
      userId: userEmail,
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

// PATCH: Update progress or status
router.patch("/update/:id", async (req, res) => {
  const db = getDB()
  const challengeEntryId = req.params.id
  const { status, progress } = req.body
  const userEmail = req.user.email

  try {
    const entry = await db.collection("userChallenges").findOne({
      _id: new ObjectId(challengeEntryId),
    })

    if (!entry || entry.userId !== userEmail) {
      return res.status(403).json({ message: "Forbidden: Not your challenge" })
    }

    const updateFields = {}
    if (status) updateFields.status = status
    if (typeof progress === "number") updateFields.progress = progress
    updateFields.updatedAt = new Date()

    const result = await db
      .collection("userChallenges")
      .findOneAndUpdate(
        { _id: new ObjectId(challengeEntryId) },
        { $set: updateFields },
        { returnDocument: "after" }
      )

    res.json(result.value)
  } catch (err) {
    console.error("Progress update error:", err)
    res.status(500).json({ message: "Failed to update progress" })
  }
})

// GET: All joined challenges for authenticated user
router.get("/", async (req, res) => {
  const db = getDB()
  const userEmail = req.user.email

  try {
    const entries = await db
      .collection("userChallenges")
      .aggregate([
        { $match: { userId: userEmail } },
        {
          $lookup: {
            from: "challenges",
            localField: "challengeId",
            foreignField: "_id",
            as: "challenge",
          },
        },
        { $unwind: "$challenge" },
        { $sort: { joinDate: -1 } },
      ])
      .toArray()

    res.json(entries)
  } catch (err) {
    console.error("Progress fetch error:", err)
    res.status(500).json({ message: "Failed to fetch progress" })
  }
})

module.exports = router
