// routes/user.js
const express = require("express")
const { getDB } = require("../db");
const { ObjectId } = require("mongodb");

const router = express.Router()

router.post("/sync", async (req, res) => {
  console.log("SYNC route hit with body:", req.body)
  const { email, name, photoURL, provider } = req.body
  const db = getDB()

  try {
    await db
      .collection("users")
      .updateOne(
        { email },
        { $set: { name, photoURL, provider } },
        { upsert: true }
      )
    res.json({ message: "User synced" })
  } catch (err) {
    console.error("User sync failed:", err)
    res.status(500).json({ error: "Failed to sync user" })
  }
})

// GET user profile
//  GET all joined challenges for a user
router.get("/user-challenges/:uid", async (req, res) => {
  const db = getDB()
  const uid = req.params.uid

  try {
    const userChallenges = await db
      .collection("userChallenges")
      .find({ userId: uid })
      .toArray()

    const challengeIds = userChallenges.map((uc) => new ObjectId(uc.challengeId))
    const challenges = await db
      .collection("challenges")
      .find({ _id: { $in: challengeIds } })
      .toArray()

    const merged = userChallenges.map((uc) => {
      const challenge = challenges.find((c) => c._id.toString() === uc.challengeId)
      return {
        ...uc,
        challenge,
      }
    })

    res.json(merged)
  } catch (err) {
    console.error("User challenge fetch error:", err)
    res.status(500).json({ message: "Failed to fetch user challenges" })
  }
})

// GET dashboard data for a user
router.get("/dashboard/:uid", async (req, res) => {
  const db = getDB()
  const uid = req.params.uid

  try {
    const userChallenges = await db
      .collection("userChallenges")
      .find({ userId: uid })
      .toArray()

    const challengeIds = userChallenges.map((uc) => new ObjectId(uc.challengeId))
    const challenges = await db
      .collection("challenges")
      .find({ _id: { $in: challengeIds } })
      .toArray()

    const mergedChallenges = userChallenges.map((uc) => {
      const challenge = challenges.find((c) => c._id.toString() === uc.challengeId)
      return {
        ...uc,
        challenge,
      }
    })

    const tips = await db
      .collection("tips")
      .find({ likedBy: uid })
      .toArray()

    const events = await db
      .collection("events")
      .find({ rsvps: uid })
      .toArray()

    res.json({
      challenges: mergedChallenges,
      tips,
      events,
    })
  } catch (err) {
    console.error("Dashboard fetch error:", err)
    res.status(500).json({ message: "Failed to fetch dashboard data" })
  }
})

module.exports = router
