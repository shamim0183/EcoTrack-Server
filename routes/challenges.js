const express = require("express")
const router = express.Router()
const { ObjectId } = require("mongodb")
const { getDB } = require("../db")

// POST a new challenge
router.post("/", async (req, res) => {
  const db = getDB()
  const newChallenge = { ...req.body, createdAt: new Date() }
  const result = await db.collection("challenges").insertOne(newChallenge)
  res.status(201).json(result.ops?.[0] || newChallenge)
})

// PATCH to join a challenge
router.patch("/join/:id", async (req, res) => {
  const db = getDB();
  const challengeId = req.params.id;
  const userEmail = req.body.userEmail;
  

  if (!userEmail) {
    return res.status(400).json({ message: "Missing userEmail in request body" });
  }

  try {
    const result = await db.collection("challenges").findOneAndUpdate(
      { _id: new ObjectId(challengeId) },
      { $addToSet: { participants: userEmail } }, // avoids duplicates
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    res.json(result.value);
  } catch (err) {
    console.error("Join error:", err);
    res.status(500).json({ message: "Failed to join challenge" });
  }
});




module.exports = router
