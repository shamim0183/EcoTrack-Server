const express = require("express")
const router = express.Router()
const { getDB } = require("../db")

// Featured Challenges
router.get("/challenges/featured", async (req, res) => {
  try {
    const challenges = await getDB()
      .collection("challenges")
      .find({ featured: true })
      .limit(3)
      .toArray()
    res.json(challenges)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch featured challenges" })
  }
})

// Live Stats
router.get("/stats", async (req, res) => {
  try {
    const challenges = await getDB().collection("challenges").find().toArray()

    const totalCO2 = challenges.reduce(
      (sum, ch) =>
        ch.impactMetric === "kg CO2 saved" ? sum + ch.participants * 10 : sum,
      0
    )
    const totalPlastic = challenges.reduce(
      (sum, ch) =>
        ch.impactMetric === "kg plastic saved"
          ? sum + ch.participants * 5
          : sum,
      0
    )
    const totalEnergy = challenges.reduce(
      (sum, ch) =>
        ch.impactMetric === "kWh saved" ? sum + ch.participants * 3 : sum,
      0
    )

    res.json({
      co2Saved: totalCO2,
      plasticReduced: totalPlastic,
      energySaved: totalEnergy,
    })
  } catch (err) {
    res.status(500).json({ error: "Failed to calculate stats" })
  }
})

// Active Challenges
router.get("/challenges/active", async (req, res) => {
  try {
    const today = new Date()
    const challenges = await getDB()
      .collection("challenges")
      .find({
        startDate: { $lte: today },
        endDate: { $gte: today },
      })
      .limit(6)
      .toArray()
    res.json(challenges)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch active challenges" })
  }
})

// Recent Tips
router.get("/tips/recent", async (req, res) => {
  try {
    const tips = await getDB()
      .collection("tips")
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()
    res.json(tips)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recent tips" })
  }
})

// Upcoming Events
router.get("/events/upcoming", async (req, res) => {
  try {
    const today = new Date()
    const events = await getDB()
      .collection("events")
      .find({ date: { $gte: today } })
      .sort({ date: 1 })
      .limit(4)
      .toArray()
    res.json(events)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch upcoming events" })
  }
})

module.exports = router
