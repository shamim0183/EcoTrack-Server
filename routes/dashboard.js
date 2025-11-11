const express = require("express")
const router = express.Router()
const { ObjectId } = require("mongodb")
const { getDB } = require("../db")

router.get("/", async (req, res) => {
  const db = getDB()
  const userEmail = req.user?.email // ✅ Extract from Firebase token

  if (!userEmail) {
    return res.status(400).json({ message: "Missing userEmail from token" })
  }

  try {
    const userChallenges = await db
      .collection("userChallenges")
      .find({ userId: userEmail })
      .toArray()

    const challengeIds = userChallenges.map(
      (uc) => new ObjectId(uc.challengeId)
    )

    const challenges = await db
      .collection("challenges")
      .find({ _id: { $in: challengeIds } })
      .toArray()

    const enrichedChallenges = userChallenges
      .map((uc) => {
        const challenge = challenges.find(
          (c) => c._id.toString() === uc.challengeId.toString()
        )
        if (!challenge) return null

        return {
          userChallengeId: uc._id,
          status: uc.status,
          progress: uc.progress,
          joinDate: uc.joinDate,
          updatedAt: uc.updatedAt,
          challenge,
        }
      })
      .filter(Boolean)

    const [tips, events] = await Promise.all([
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

    res.json({ challenges: enrichedChallenges, tips, events })
  } catch (err) {
    console.error("Dashboard error:", err)
    res.status(500).json({ message: "Failed to load personalized dashboard" })
  }
})

module.exports = router
