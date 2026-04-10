/**
 * Sets the default password hash for all existing workers who don't have one.
 * Password: "password123"
 * Hash is SHA-256 computed via Node's built-in crypto module.
 */

import { createHash } from "crypto"
import { initializeApp } from "firebase/app"
import { getDatabase, ref, get, update } from "firebase/database"

const firebaseConfig = {
  databaseURL: "https://portal-22bc5-default-rtdb.firebaseio.com",
  projectId: "portal-22bc5",
  appId: "portal-22bc5",
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex")
}

async function run() {
  const DEFAULT_PASSWORD = "password123"
  const hash = hashPassword(DEFAULT_PASSWORD)
  console.log(`[v0] SHA-256 hash of "${DEFAULT_PASSWORD}": ${hash}`)

  const workersSnap = await get(ref(db, "workers"))
  if (!workersSnap.exists()) {
    console.log("[v0] No workers found in database.")
    process.exit(0)
  }

  const workers = workersSnap.val()
  const updates = {}
  let count = 0

  for (const [username, data] of Object.entries(workers)) {
    if (!data.passwordHash) {
      updates[`workers/${username}/passwordHash`] = hash
      // Also ensure they are approved so they can log in
      if (!data.status || data.status !== "approved") {
        updates[`workers/${username}/status`] = "approved"
      }
      count++
      console.log(`[v0] Queuing password update for: @${username}`)
    } else {
      console.log(`[v0] Skipping @${username} — already has a password hash`)
    }
  }

  if (count === 0) {
    console.log("[v0] All workers already have passwords. Nothing to update.")
    process.exit(0)
  }

  await update(ref(db), updates)
  console.log(`[v0] Done. Updated ${count} worker(s) with default password "${DEFAULT_PASSWORD}".`)
  process.exit(0)
}

run().catch((err) => {
  console.error("[v0] Error:", err)
  process.exit(1)
})
