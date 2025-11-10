// routes/user.js
const express = require("express")
const { getDB } = require("../db")

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

module.exports = router
