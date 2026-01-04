const admin = require("firebase-admin")

// Parse Firebase private key - handle both formats
let privateKey = process.env.FIREBASE_PRIVATE_KEY

if (!privateKey) {
  console.error("❌ FIREBASE_PRIVATE_KEY is missing")
  process.exit(1)
}

// Remove quotes if accidentally pasted with them
privateKey = privateKey.replace(/^["']|["']$/g, "")

// If it has literal \n, convert to real newlines
if (privateKey.includes("\\n")) {
  privateKey = privateKey.replace(/\\n/g, "\n")
}

// Validate it's a proper PEM key
if (!privateKey.includes("BEGIN PRIVATE KEY")) {
  console.error(
    "❌ FIREBASE_PRIVATE_KEY must include '-----BEGIN PRIVATE KEY-----'"
  )
  console.error("Current value starts with:", privateKey.substring(0, 50))
  process.exit(1)
}

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  })
  console.log("✅ Firebase Admin initialized")
} catch (error) {
  console.error("❌ Firebase initialization error:", error.message)
  console.error("Key length:", privateKey.length)
  console.error("Key starts with:", privateKey.substring(0, 50))
  console.error("Key ends with:", privateKey.substring(privateKey.length - 50))
  process.exit(1)
}

module.exports = admin
