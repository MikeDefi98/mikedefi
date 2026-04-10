import { initializeApp, getApps } from "firebase/app"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  databaseURL: "https://portal-22bc5-default-rtdb.firebaseio.com",
  projectId: "portal-22bc5",
  appId: "portal-22bc5",
}

const reportsFirebaseConfig = {
  databaseURL: "https://employee-reports-3607c-default-rtdb.firebaseio.com",
  projectId: "employee-reports-3607c",
  appId: "employee-reports-3607c",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getDatabase(app)

// Second Firebase app for employee reports database
const reportsApp =
  getApps().find((a) => a.name === "reports") ??
  initializeApp(reportsFirebaseConfig, "reports")
const reportsDb = getDatabase(reportsApp)

export { db, reportsDb }
