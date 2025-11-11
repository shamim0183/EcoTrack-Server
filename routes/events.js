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


// PATCH  to an event
router.patch("/:id", async (req, res) => {
  const db = getDB()
  const eventId = req.params.id
  const userEmail = req.body.userEmail

  if (!userEmail) {
    return res
      .status(400)
      .json({ message: "Missing userEmail in request body" })
  }

  try {
    const result = await db.collection("events").findOneAndUpdate(
      { _id: new ObjectId(eventId) },
      { $addToSet: { attendees: userEmail } }, // avoids duplicate RSVPs
      { returnDocument: "after" }
    )

    if (!result.value) {
      return res.status(404).json({ message: "Event not found" })
    }

    res.json(result.value)
  } catch (err) {
    console.error("RSVP error:", err)
    res.status(500).json({ message: "Failed to RSVP to event" })
  }
})

module.exports = router
