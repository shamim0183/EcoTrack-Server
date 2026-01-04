const express = require("express")
const router = express.Router()
const { ObjectId } = require("mongodb")
const { getDB } = require("../db")

// GET all events (sorted by date)
router.get("/", async (req, res) => {
  const db = getDB()
  const events = await db
    .collection("events")
    .find()
    .sort({ date: 1 })
    .toArray()
  res.json(events)
})

// POST a new event
router.post("/", async (req, res) => {
  const db = getDB()
  const {
    title,
    description,
    date,
    location,
    organizer,
    maxParticipants,
    currentParticipants,
  } = req.body

  try {
    const result = await db.collection("events").insertOne({
      title,
      description,
      date,
      location,
      organizer,
      maxParticipants,
      currentParticipants,
    })
    res.json({ message: "Event created", id: result.insertedId })
  } catch (err) {
    console.error("Event creation error:", err)
    res.status(500).json({ error: "Failed to create event" })
  }
})

// Get single event by ID
router.get("/:id", async (req, res) => {
  const db = getDB()
  try {
    const event = await db
      .collection("events")
      .findOne({ _id: new ObjectId(req.params.id) })
    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }
    res.json(event)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update event
router.patch("/:id", async (req, res) => {
  const db = getDB()
  try {
    const { title, description, date, location, maxParticipants } = req.body
    const result = await db.collection("events").findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          title,
          description,
          date,
          location,
          maxParticipants,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    )
    if (!result.value) {
      return res.status(404).json({ message: "Event not found" })
    }
    res.json(result.value)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Register for event
router.post("/register", async (req, res) => {
  const db = getDB()
  const { eventId, userEmail } = req.body

  if (!eventId || !userEmail) {
    return res.status(400).json({ message: "Missing eventId or userEmail" })
  }

  try {
    const result = await db
      .collection("events")
      .findOneAndUpdate(
        { _id: new ObjectId(eventId) },
        { $inc: { currentParticipants: 1 } },
        { returnDocument: "after" }
      )

    if (!result.value) {
      return res.status(404).json({ message: "Event not found" })
    }

    res.json({ message: "Registered successfully", event: result.value })
  } catch (error) {
    console.error("Event registration error:", error)
    res.status(500).json({ message: "Failed to register for event" })
  }
})

// Delete event
router.delete("/:id", async (req, res) => {
  const db = getDB()
  try {
    const result = await db
      .collection("events")
      .deleteOne({ _id: new ObjectId(req.params.id) })
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Event not found" })
    }
    res.json({ message: "Event deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
