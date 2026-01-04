// routes/user.js
const express = require("express")
const { getDB } = require("../db")
const { ObjectId } = require("mongodb")

const router = express.Router()

router.post("/sync", async (req, res) => {
  console.log("SYNC route hit with body:", req.body)
  const { email, name, photoURL, provider } = req.body
  const db = getDB()

  try {
    // Check if user exists
    const existingUser = await db.collection("users").findOne({ email })

    // Prepare update data
    const updateData = {
      name,
      photoURL,
      provider,
    }

    // Ensure role is set for all users (existing and new)
    if (existingUser && !existingUser.role) {
      updateData.role = "user"
    }

    await db.collection("users").updateOne(
      { email },
      {
        $set: updateData,
        // Set default role and createdAt on insert only
        $setOnInsert: { role: "user", createdAt: new Date() },
      },
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

    const challengeIds = userChallenges.map(
      (uc) => new ObjectId(uc.challengeId)
    )
    const challenges = await db
      .collection("challenges")
      .find({ _id: { $in: challengeIds } })
      .toArray()

    const merged = userChallenges.map((uc) => {
      const challenge = challenges.find(
        (c) => c._id.toString() === uc.challengeId
      )
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

    const challengeIds = userChallenges.map(
      (uc) => new ObjectId(uc.challengeId)
    )
    const challenges = await db
      .collection("challenges")
      .find({ _id: { $in: challengeIds } })
      .toArray()

    const mergedChallenges = userChallenges.map((uc) => {
      const challenge = challenges.find(
        (c) => c._id.toString() === uc.challengeId
      )
      return {
        ...uc,
        challenge,
      }
    })

    const tips = await db.collection("tips").find({ likedBy: uid }).toArray()

    const events = await db.collection("events").find({ rsvps: uid }).toArray()

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

// GET user profile (including role)
router.get("/profile/:email", async (req, res) => {
  const db = getDB()
  const email = req.params.email

  try {
    const user = await db.collection("users").findOne({ email })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      email: user.email,
      name: user.name,
      photoURL: user.photoURL,
      role: user.role || "user", // Default to "user" if not set
      provider: user.provider,
      createdAt: user.createdAt,
    })
  } catch (err) {
    console.error("Profile fetch error:", err)
    res.status(500).json({ message: "Failed to fetch user profile" })
  }
})

// PATCH user profile (update name and photoURL)
router.patch("/profile/:email", async (req, res) => {
  console.log("🔧 Profile PATCH route hit!")
  console.log("📧 Email param:", req.params.email)
  console.log("📦 Request body:", req.body)

  const db = getDB()
  const email = req.params.email
  const { name, photoURL } = req.body

  try {
    // Validate input
    if (!name || name.trim().length < 3) {
      console.log("❌ Validation failed: name too short")
      return res
        .status(400)
        .json({ message: "Name must be at least 3 characters" })
    }

    console.log("✅ Validation passed, updating user...")

    // Update user in database
    const result = await db.collection("users").updateOne(
      { email },
      {
        $set: {
          name: name.trim(),
          photoURL: photoURL || null,
          updatedAt: new Date(),
        },
      }
    )

    console.log("📊 Update result:", result)

    if (result.matchedCount === 0) {
      console.log("❌ User not found with email:", email)
      return res.status(404).json({ message: "User not found" })
    }

    // Fetch and return updated user
    const updatedUser = await db.collection("users").findOne({ email })
    console.log("✅ User updated successfully:", updatedUser?.name)

    res.json({
      email: updatedUser.email,
      name: updatedUser.name,
      photoURL: updatedUser.photoURL,
      role: updatedUser.role || "user",
      provider: updatedUser.provider,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    })
  } catch (err) {
    console.error("Profile update error:", err)
    res.status(500).json({ message: "Failed to update user profile" })
  }
})

module.exports = router
