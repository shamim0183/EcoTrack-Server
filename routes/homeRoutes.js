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
    const db = getDB()
    const challenges = await db.collection("challenges").find().toArray()

    console.log("📦 Total challenges received:", challenges.length)

    let co2Saved = 40
    let plasticReduced = 20
    let energySaved = 30

    challenges.forEach((ch, index) => {
      try {
        const raw = String(ch.impactMetric || "")
          .toLowerCase()
          .trim()
        const value = parseFloat(raw.replace(/[^0-9.]/g, ""))
        const unit = raw.replace(/[0-9.]/g, "").trim()
        const participants = ch.participants || 0
        const total = value * participants

        console.log(`🔍 Challenge ${index + 1}:`, {
          title: ch.title,
          impactMetric: ch.impactMetric,
          parsedValue: value,
          unit,
          participants,
          totalImpact: total,
        })

        if (!isNaN(total)) {
          if (unit.includes("l")) {
            co2Saved += total
          } else if (unit.includes("kg")) {
            plasticReduced += total
          } else if (unit.includes("kwh")) {
            energySaved += total
          }
        }
      } catch (err) {
        console.error(`❌ Error parsing challenge ${index + 1}:`, err)
      }
    })

    const stats = {
      co2Saved: Math.round(co2Saved), // in Liters
      plasticReduced: Math.round(plasticReduced), // in Kilograms
      energySaved: Math.round(energySaved), // in kWh
    }

    console.log("✅ Final aggregated stats:", stats)

    res.json(stats)
  } catch (err) {
    console.error("❌ Stats aggregation error:", err)
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
    console.error("❌ Tips/recent error:", err)
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
