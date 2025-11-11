const express = require("express")
const router = express.Router()
const { ObjectId } = require("mongodb")
const { getDB } = require("../db")

// GET all tips
router.get("/", async (req, res) => {
  const db = getDB()
  const tips = await db
    .collection("tips")
    .find()
    .sort({ createdAt: -1 })
    .toArray()
  res.json(tips)
})

// POST a new tip
router.post("/", async (req, res) => {
  const db = getDB()
  const { title, content, category, author, authorName, upvotes, createdAt } =
    req.body

  try {
    const result = await db.collection("tips").insertOne({
      title,
      content,
      category,
      author,
      authorName,
      upvotes,
      createdAt,
    })
    res.json({ message: "Tip created", id: result.insertedId })
  } catch (err) {
    console.error("Tip creation error:", err)
    res.status(500).json({ error: "Failed to create tip" })
  }
})


// PATCH to like a tip
router.patch("/like/:id", async (req, res) => {
  const db = getDB()
  const tipId = req.params.id
  const userEmail = req.body.userEmail

  if (!userEmail) {
    return res
      .status(400)
      .json({ message: "Missing userEmail in request body" })
  }

  try {
    const result = await db.collection("tips").findOneAndUpdate(
      { _id: new ObjectId(tipId) },
      { $addToSet: { likes: userEmail } }, // avoids duplicate likes
      { returnDocument: "after" }
    )

    if (!result.value) {
      return res.status(404).json({ message: "Tip not found" })
    }

    res.json(result.value)
  } catch (err) {
    console.error("Like error:", err)
    res.status(500).json({ message: "Failed to like tip" })
  }
})

module.exports = router
