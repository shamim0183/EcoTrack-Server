// scripts/migrate-user-roles.js
require("dotenv").config()
const { MongoClient, ServerApiVersion } = require("mongodb")

const MONGO_URI = process.env.MONGO_URI
const DB_NAME = "ecotrack"

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not found in environment variables")
  process.exit(1)
}

async function migrateUserRoles() {
  const client = new MongoClient(MONGO_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  })

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db(DB_NAME)
    const usersCollection = db.collection("users")

    // Find all users without a role field
    const usersWithoutRole = await usersCollection.countDocuments({
      role: { $exists: false },
    })

    console.log(`📊 Found ${usersWithoutRole} users without a role field`)

    if (usersWithoutRole === 0) {
      console.log("✨ All users already have a role field!")
      return
    }

    // Update all users without a role to have role: "user"
    const result = await usersCollection.updateMany(
      { role: { $exists: false } },
      { $set: { role: "user" } }
    )

    console.log(`✅ Updated ${result.modifiedCount} users with role: "user"`)

    // Verify the update
    const remainingWithoutRole = await usersCollection.countDocuments({
      role: { $exists: false },
    })

    if (remainingWithoutRole === 0) {
      console.log("✨ Migration completed successfully!")
    } else {
      console.warn(
        `⚠️  Warning: ${remainingWithoutRole} users still without role`
      )
    }
  } catch (error) {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  } finally {
    await client.close()
    console.log("👋 Database connection closed")
  }
}

// Run the migration
migrateUserRoles()
