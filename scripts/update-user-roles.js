// Script to update specific user roles
require("dotenv").config()
const { MongoClient, ServerApiVersion } = require("mongodb")

const uri = process.env.MONGO_URI
const dbName = "ecotrack"

async function updateUserRoles() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  })

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(dbName)
    const usersCollection = db.collection("users")

    // Update sa@sa.com to admin
    const adminUpdate = await usersCollection.updateOne(
      { email: "sa@sa.com" },
      { $set: { role: "admin" } }
    )
    console.log(
      `Updated sa@sa.com to admin: ${adminUpdate.modifiedCount} document(s) modified`
    )

    // Update as@as.com to user
    const userUpdate = await usersCollection.updateOne(
      { email: "as@as.com" },
      { $set: { role: "user" } }
    )
    console.log(
      `Updated as@as.com to user: ${userUpdate.modifiedCount} document(s) modified`
    )

    // Update any users with missing roles to "user"
    const missingRolesUpdate = await usersCollection.updateMany(
      { role: { $exists: false } },
      { $set: { role: "user" } }
    )
    console.log(
      `Updated ${missingRolesUpdate.modifiedCount} user(s) with missing roles to "user"`
    )

    // Display all users with their roles
    console.log("\n--- All Users ---")
    const allUsers = await usersCollection.find({}).toArray()
    allUsers.forEach((user) => {
      console.log(`${user.email}: ${user.role || "(no role)"}`)
    })

    console.log("\nUser roles updated successfully!")
  } catch (err) {
    console.error("Error updating user roles:", err)
  } finally {
    await client.close()
  }
}

updateUserRoles()
