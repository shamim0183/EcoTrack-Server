// middleware/firebaseAuth.js
const admin = require("./firebaseAdmin")

async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decodedToken = await admin.auth().verifyIdToken(token)
    req.user = decodedToken // contains uid, email, etc.
    next()
  } catch (err) {
    console.error("Token verification failed:", err)
    return res.status(403).json({ message: "Unauthorized" })
  }
}

module.exports = { verifyFirebaseToken }
