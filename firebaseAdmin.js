const admin = require("firebase-admin")

// Parse Firebase private key with robust handling
let privateKey = process.env.FIREBASE_PRIVATE_KEY

if (!privateKey) {
  console.error("❌ FIREBASE_PRIVATE_KEY is missing")
  throw new Error("FIREBASE_PRIVATE_KEY environment variable is required")
}

// Remove quotes if accidentally pasted with them
privateKey = privateKey.replace(/^["']|["']$/g, "")

// Replace literal \n with actual newlines (handles copy-paste from .env files)
if (privateKey.includes("\\n")) {
  privateKey = privateKey.replace(/\\n/g, "\n")
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
})

module.exports = admin
