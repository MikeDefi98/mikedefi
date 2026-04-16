"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ref, set, onValue, update, remove, get } from "firebase/database"
import { db, reportsDb } from "@/lib/firebase"

const ADMIN_PASSWORD = "Pungabunga98"

interface Claim {
  id: string
  workerUsername: string
  platform: string
  profileUsername: string
  milestone: string
  milestoneLabel: string
  reward: number
  description: string
  screenshots?: string[]
  status: "pending" | "approved" | "rejected"
  submittedAt: number
}

interface WorkerData {
  displayName: string
  baseSalary: number
  approvedBonuses: number
  sessionToken?: string
  passwordHash?: string
  status?: string
  createdAt?: number
}

interface Worker {
  username: string
  data: WorkerData
  claims: Claim[]
}

// Reports types (employee-reports-3607c database)
interface PlatformAccount {
  followBacks?: string | number
  leads?: string | number
}

interface PlatformData {
  leads?: string | number
  account1?: PlatformAccount
  account2?: PlatformAccount
  account3?: PlatformAccount
}

interface ReportPlatforms {
  discord?: PlatformData
  instagram?: PlatformData
  tiktok?: PlatformData
  x?: PlatformData
  reddit?: PlatformData
  [key: string]: PlatformData | undefined
}

interface DailyReport {
  discordUsername: string
  reportDate: string
  submittedAt: string
  platforms: ReportPlatforms
}

interface WorkerReports {
  [date: string]: DailyReport
}

interface AllReports {
  [workerUsername: string]: WorkerReports
}

interface ContactData {
  createdAt: string
  details: string
  platform: string
  updatedAt: string
  username: string
}

interface WorkerContacts {
  [contactUsername: string]: ContactData
}

interface AllContacts {
  [workerUsername: string]: WorkerContacts
}

export default function AdminPanel() {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const [workers, setWorkers] = useState<Worker[]>([])
  const [allClaims, setAllClaims] = useState<Record<string, Claim[]>>({})
  const [loading, setLoading] = useState(false)

  // Add worker form
  const [newUsername, setNewUsername] = useState("")
  const [newDisplayName, setNewDisplayName] = useState("")
  const [addError, setAddError] = useState("")
  const [addSuccess, setAddSuccess] = useState(false)

  // Selected worker for detail view
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null)

  // Main admin panel tab
  const [adminTab, setAdminTab] = useState<"workers" | "reports" | "contacts">("workers")

  // Tab state for workers view
  const [workerTab, setWorkerTab] = useState<"approved" | "pending">("approved")

  // Milestone overview filter
  const [milestoneFilter, setMilestoneFilter] = useState<string | null>(null)

  // Reports state
  const [allReports, setAllReports] = useState<AllReports>({})
  // Contacts state
  const [allContacts, setAllContacts] = useState<AllContacts>({})
  const [contactsLoading, setContactsLoading] = useState(false)
  const [contactsSearch, setContactsSearch] = useState("")

  const [reportsLoading, setReportsLoading] = useState(false)
  const [reportsSearch, setReportsSearch] = useState("")
  const [reportsSelectedWorker, setReportsSelectedWorker] = useState<string | null>(null)
  const [reportsPlatformFilter, setReportsPlatformFilter] = useState<string>("all")
  const [reportsDateFilter, setReportsDateFilter] = useState<string>("")
  const [reportsSortBy, setReportsSortBy] = useState<"name" | "count" | "newest">("newest")

  // Pending user salary adjustments
  const [pendingSalaries, setPendingSalaries] = useState<Record<string, number>>({})

  // Screenshot viewer modal
  const [viewingScreenshots, setViewingScreenshots] = useState<string[] | null>(null)
  const [currentScreenshotIdx, setCurrentScreenshotIdx] = useState(0)

  // Subscribe to workers
  useEffect(() => {
    if (!authed) return
    setLoading(true)

    const workersRef = ref(db, "workers")
    const unsubWorkers = onValue(workersRef, (snapshot) => {
      const list: Worker[] = []
      if (snapshot.exists()) {
        const data = snapshot.val() as Record<string, WorkerData>
        Object.entries(data).forEach(([username, workerData]) => {
          list.push({ username, data: workerData, claims: [] })
        })
      }
      setWorkers(list)
      setLoading(false)
    })

    // Subscribe to all claims (flat structure: claims/{workerUsername}/{claimId})
    const claimsRef = ref(db, "claims")
    const unsubClaims = onValue(claimsRef, (snapshot) => {
      const claimsMap: Record<string, Claim[]> = {}
      if (snapshot.exists()) {
        const data = snapshot.val() as Record<string, Record<string, Omit<Claim, "id">>>
        Object.entries(data).forEach(([workerUsername, workerClaims]) => {
          const list: Claim[] = []
          Object.entries(workerClaims).forEach(([id, claim]) => {
            list.push({ id, ...claim })
          })
          list.sort((a, b) => b.submittedAt - a.submittedAt)
          claimsMap[workerUsername] = list
        })
      }
      setAllClaims(claimsMap)
    })

    return () => {
      unsubWorkers()
      unsubClaims()
    }
  }, [authed])

  // Subscribe to reports from second Firebase database
  useEffect(() => {
    if (!authed) return
    setReportsLoading(true)
    const reportsRef = ref(reportsDb, "reports")
    const unsub = onValue(reportsRef, (snapshot) => {
      if (snapshot.exists()) {
        const rawData = snapshot.val() as any;
        if (rawData && typeof rawData === 'object') {
          Object.values(rawData).forEach((workerReports: any) => {
            if (workerReports && typeof workerReports === 'object') {
              Object.values(workerReports).forEach((report: any) => {
                if (report && report.platforms) {
                  Object.values(report.platforms).forEach((platform: any) => {
                    if (platform) {
                      if (platform.dms !== undefined && platform.leads === undefined) {
                        platform.leads = platform.dms;
                      }
                      ["account1", "account2", "account3"].forEach((acc) => {
                        const acct = platform[acc];
                        if (acct && acct.dms !== undefined && acct.leads === undefined) {
                          acct.leads = acct.dms;
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
        setAllReports(rawData as AllReports)
      } else {
        setAllReports({})
      }
      setReportsLoading(false)
    })
    return () => unsub()
  }, [authed])

  // Subscribe to contacts from second Firebase database
  useEffect(() => {
    if (!authed) return
    setContactsLoading(true)
    const contactsRef = ref(reportsDb, "contacts")
    const unsub = onValue(contactsRef, (snapshot) => {
      if (snapshot.exists()) {
        setAllContacts(snapshot.val() as AllContacts)
      } else {
        setAllContacts({})
      }
      setContactsLoading(false)
    })
    return () => unsub()
  }, [authed])

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setAuthed(true)
    } else {
      setPasswordError("Incorrect password.")
    }
  }

  async function addWorker(e: React.FormEvent) {
    e.preventDefault()
    setAddError("")
    const uname = newUsername.trim().toLowerCase()
    if (!uname) { setAddError("Username required."); return }
    if (!newDisplayName.trim()) { setAddError("Display name required."); return }

    const exists = workers.find((w) => w.username === uname)
    if (exists) { setAddError("Worker already exists."); return }

    await set(ref(db, `workers/${uname}`), {
      displayName: newDisplayName.trim(),
      baseSalary: 200,
      approvedBonuses: 0,
      status: "approved", // Admin-created workers are auto-approved
      createdAt: Date.now(),
    })
    setNewUsername("")
    setNewDisplayName("")
    setAddSuccess(true)
    setTimeout(() => setAddSuccess(false), 3000)
  }

  async function removeWorker(username: string) {
    if (!confirm(`Remove worker @${username}? This will also delete all their claims and cannot be undone.`)) return
    await remove(ref(db, `workers/${username}`))
    await remove(ref(db, `claims/${username}`))
    if (selectedWorker === username) setSelectedWorker(null)
  }

  async function approveWorker(username: string, baseSalary: number) {
    await update(ref(db, `workers/${username}`), { status: "approved", baseSalary })
    // Clear the pending salary state for this user
    setPendingSalaries((prev) => {
      const next = { ...prev }
      delete next[username]
      return next
    })
  }

  async function rejectWorker(username: string) {
    if (!confirm(`Reject and remove @${username}'s registration request?`)) return
    await remove(ref(db, `workers/${username}`))
  }

  async function updateClaimStatus(
    workerUsername: string,
    claimId: string,
    newStatus: "approved" | "rejected",
    reward: number,
    prevStatus: string
  ) {
    // Get latest approvedBonuses from Firebase to avoid race conditions
    const workerSnap = await get(ref(db, `workers/${workerUsername}/approvedBonuses`))
    let currentApproved: number = workerSnap.exists() ? (workerSnap.val() as number) : 0

    let newApproved = currentApproved
    if (prevStatus === "approved" && newStatus !== "approved") {
      newApproved = Math.max(0, newApproved - reward)
    } else if (prevStatus !== "approved" && newStatus === "approved") {
      newApproved += reward
    }

    await update(ref(db), {
      [`claims/${workerUsername}/${claimId}/status`]: newStatus,
      [`workers/${workerUsername}/approvedBonuses`]: newApproved,
    })
  }

  // Merge claims into workers list for display
  const workersWithClaims: Worker[] = workers.map((w) => ({
    ...w,
    claims: allClaims[w.username] ?? [],
  }))

  // Separate approved and pending workers — workers with pending claims first, then newest accounts
  const approvedWorkers = workersWithClaims
    .filter((w) => w.data.status !== "pending")
    .sort((a, b) => {
      const aPending = a.claims.some((c) => c.status === "pending")
      const bPending = b.claims.some((c) => c.status === "pending")
      if (aPending && !bPending) return -1
      if (!aPending && bPending) return 1
      return (b.data.createdAt ?? 0) - (a.data.createdAt ?? 0)
    })
  const pendingWorkers = workersWithClaims
    .filter((w) => w.data.status === "pending")
    .sort((a, b) => (b.data.createdAt ?? 0) - (a.data.createdAt ?? 0))

  const totalPending = workersWithClaims.reduce((s, w) => s + w.claims.filter((c) => c.status === "pending").length, 0)
  const totalApproved = workersWithClaims.reduce((s, w) => s + w.claims.filter((c) => c.status === "approved").length, 0)
  const totalBonusesPaid = workersWithClaims.reduce((s, w) => s + (w.data.approvedBonuses ?? 0), 0)

  // Flatten all reports into a list for display
  const flatReports = useMemo(() => {
    const list: Array<{ workerUsername: string; date: string; report: DailyReport }> = []
    Object.entries(allReports).forEach(([workerUsername, workerReports]) => {
      Object.entries(workerReports).forEach(([date, report]) => {
        list.push({ workerUsername, date, report })
      })
    })
    list.sort((a, b) => new Date(b.report.submittedAt).getTime() - new Date(a.report.submittedAt).getTime())
    return list
  }, [allReports])

  // Group reports by worker, with dates sorted newest first, filtered by active filters
  const groupedReports = useMemo(() => {
    const groups: Array<{
      workerUsername: string
      dates: Array<{ date: string; report: DailyReport }>
      workerTotals: { followBacks: number; leads: number }
      workerPlatformTotals: Record<string, { followBacks: number; leads: number }>
    }> = []

    Object.entries(allReports).forEach(([workerUsername, workerReports]) => {
      const matchesSearch =
        reportsSearch === "" ||
        workerUsername.toLowerCase().includes(reportsSearch.toLowerCase())
      const matchesWorker = reportsSelectedWorker === null || workerUsername === reportsSelectedWorker
      if (!matchesSearch || !matchesWorker) return

      const dates = Object.entries(workerReports)
        .filter(([date]) => reportsDateFilter === "" || date === reportsDateFilter)
        .map(([date, report]) => ({ date, report }))
        .sort((a, b) => b.date.localeCompare(a.date))

      if (dates.length === 0) return

      let followBacks = 0
      let leads = 0
      const workerPlatformTotals: Record<string, { followBacks: number; leads: number }> = {}

      dates.forEach(({ report }) => {
        Object.entries(report.platforms ?? {}).forEach(([platformKey, platform]) => {
          if (!platform) return
          if (!workerPlatformTotals[platformKey]) workerPlatformTotals[platformKey] = { followBacks: 0, leads: 0 }
          const pLeads = Number(platform.leads) || 0
          leads += pLeads
          workerPlatformTotals[platformKey].leads += pLeads
            ;["account1", "account2", "account3"].forEach((acc) => {
              const acct = (platform as Record<string, PlatformAccount>)[acc]
              if (acct) {
                const fb = Number(acct.followBacks) || 0
                const l = Number(acct.leads) || 0
                followBacks += fb
                leads += l
                workerPlatformTotals[platformKey].followBacks += fb
                workerPlatformTotals[platformKey].leads += l
              }
            })
        })
      })

      groups.push({ workerUsername, dates, workerTotals: { followBacks, leads }, workerPlatformTotals })
    })

    if (reportsSortBy === "newest") {
      // Sort by the most recent report submittedAt timestamp across all of a worker's reports
      const latestSubmission = (g: typeof groups[number]) =>
        g.dates.reduce((max, { report }) => {
          const t = report.submittedAt ? new Date(report.submittedAt).getTime() : 0
          return t > max ? t : max
        }, 0)
      groups.sort((a, b) => latestSubmission(b) - latestSubmission(a) || a.workerUsername.localeCompare(b.workerUsername))
    } else if (reportsSortBy === "count") {
      groups.sort((a, b) => b.dates.length - a.dates.length || a.workerUsername.localeCompare(b.workerUsername))
    } else {
      groups.sort((a, b) => a.workerUsername.localeCompare(b.workerUsername))
    }
    return groups
  }, [allReports, reportsSearch, reportsSelectedWorker, reportsDateFilter, reportsSortBy])

  // Total stats across all reports
  const reportStats = useMemo(() => {
    let totalFollowBacks = 0
    let totalLeads = 0
    flatReports.forEach(({ report }) => {
      Object.values(report.platforms ?? {}).forEach((platform) => {
        if (!platform) return
        const topLevelLeads = Number(platform.leads) || 0
        totalLeads += topLevelLeads
          ;["account1", "account2", "account3"].forEach((acc) => {
            const acct = (platform as Record<string, PlatformAccount>)[acc]
            if (acct) {
              totalFollowBacks += Number(acct.followBacks) || 0
              totalLeads += Number(acct.leads) || 0
            }
          })
      })
    })
    return { totalFollowBacks, totalLeads }
  }, [flatReports])

  const reportWorkers = useMemo(() => Object.keys(allReports).sort(), [allReports])

  if (!authed) {
    return (
      <main className="min-h-screen bg-[#050508] flex items-center justify-center px-4 font-sans">
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0c0c14] border border-[#1a1a2e] mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-[#e8e8ef]">Admin Access</h1>
            <p className="text-[#7a7a8e] text-sm mt-1">MikeWeb Portal — Supervisor Panel</p>
          </div>
          <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-6">
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[#e8e8ef] text-sm font-medium">Admin Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#12121c] border border-[#1a1a2e] rounded-xl px-4 py-3 text-[#e8e8ef] text-sm outline-none focus:border-[#e63946] focus:shadow-[0_0_0_3px_rgba(230,57,70,0.1)] transition-all"
                  placeholder="Enter password"
                />
              </div>
              {passwordError && (
                <p className="text-[#e63946] text-sm">{passwordError}</p>
              )}
              <button
                type="submit"
                className="bg-[#e63946] hover:bg-[#cc2f3b] text-white font-semibold rounded-xl py-3 text-sm transition-all"
              >
                Access Admin Panel
              </button>
            </form>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050508] font-sans">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,229,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <header className="sticky top-0 z-50 border-b border-[#1a1a2e] bg-[#050508]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#e63946]/10 border border-[#e63946]/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span className="text-[#e8e8ef] font-semibold text-sm">
              Mike<span className="text-[#e63946]">Web</span> Admin
            </span>
          </div>
          <button
            onClick={() => router.push("/portal")}
            className="text-[#7a7a8e] hover:text-[#e8e8ef] text-sm border border-[#1a1a2e] rounded-lg px-3 py-1.5 transition-colors"
          >
            Back to Portal
          </button>
        </div>
      </header>

      <div className="relative max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#e8e8ef]">Supervisor Dashboard</h1>
            <p className="text-[#7a7a8e] text-sm mt-1">Manage workers, approve registrations ,submissions, and review them   </p>
          </div>
          {/* Main tab switcher */}
          <div className="flex bg-[#0c0c14] border border-[#1a1a2e] rounded-xl p-1 self-start sm:self-auto">
            <button
              onClick={() => setAdminTab("workers")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${adminTab === "workers" ? "bg-[#1a1a2e] text-[#e8e8ef]" : "text-[#7a7a8e] hover:text-[#e8e8ef]"
                }`}
            >
              Workers
            </button>
            <button
              onClick={() => setAdminTab("reports")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${adminTab === "reports" ? "bg-[#1a1a2e] text-[#e8e8ef]" : "text-[#7a7a8e] hover:text-[#e8e8ef]"
                }`}
            >
              Reports
              {flatReports.length > 0 && (
                <span className="bg-[#00e5ff]/15 text-[#00e5ff] text-xs rounded-full px-1.5 py-0.5 leading-none">
                  {flatReports.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setAdminTab("contacts")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                adminTab === "contacts" ? "bg-[#1a1a2e] text-[#e8e8ef]" : "text-[#7a7a8e] hover:text-[#e8e8ef]"
              }`}
            >
              Contacts
              {Object.keys(allContacts).length > 0 && (
                <span className="bg-[#00e5ff]/15 text-[#00e5ff] text-xs rounded-full px-1.5 py-0.5 leading-none">
                  {Object.keys(allContacts).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {adminTab === "workers" && (<>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-4">
              <p className="text-[#7a7a8e] text-xs uppercase tracking-widest mb-1">Workers</p>
              <p className="text-2xl font-bold text-[#e8e8ef]">{approvedWorkers.length}</p>
            </div>
            <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-4">
              <p className="text-[#7a7a8e] text-xs uppercase tracking-widest mb-1">Pending Users</p>
              <p className="text-2xl font-bold text-orange-400">{pendingWorkers.length}</p>
            </div>
            <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-4">
              <p className="text-[#7a7a8e] text-xs uppercase tracking-widest mb-1">Pending Claims</p>
              <p className="text-2xl font-bold text-yellow-400">{totalPending}</p>
            </div>
            <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-4">
              <p className="text-[#7a7a8e] text-xs uppercase tracking-widest mb-1">Approved</p>
              <p className="text-2xl font-bold text-[#00e5ff]">{totalApproved}</p>
            </div>
            <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-4">
              <p className="text-[#7a7a8e] text-xs uppercase tracking-widest mb-1">Total Bonuses Paid</p>
              <p className="text-2xl font-bold text-[#00e5ff]">${totalBonusesPaid}</p>
            </div>
          </div>

          {/* Pending User Approvals Alert */}
          {pendingWorkers.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl px-6 py-4">
              <div className="flex items-start gap-3 mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div>
                  <p className="text-orange-400 text-sm font-medium">Pending User Registrations</p>
                  <p className="text-[#7a7a8e] text-xs mt-0.5">{pendingWorkers.length} user(s) waiting for approval</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {pendingWorkers.map((worker) => {
                  const salary = pendingSalaries[worker.username] ?? worker.data.baseSalary ?? 200
                  return (
                    <div
                      key={worker.username}
                      className="bg-[#0c0c14] border border-[#1a1a2e] rounded-xl p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 text-sm font-bold">
                            {(worker.data.displayName || worker.username)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[#e8e8ef] text-sm font-medium">{worker.data.displayName}</p>
                            <p className="text-[#7a7a8e] text-xs">@{worker.username}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-[#7a7a8e] text-xs">
                            {worker.data.createdAt ? new Date(worker.data.createdAt).toLocaleDateString() : ""}
                          </span>
                          <div className="flex items-center gap-2">
                            <label className="text-[#7a7a8e] text-xs whitespace-nowrap">Base Salary:</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7a7a8e] text-xs">$</span>
                              <input
                                type="number"
                                value={salary}
                                onChange={(e) => setPendingSalaries((prev) => ({ ...prev, [worker.username]: Number(e.target.value) }))}
                                onClick={(e) => e.stopPropagation()}
                                className="w-20 bg-[#12121c] border border-[#1a1a2e] rounded-lg pl-6 pr-2 py-1.5 text-[#e8e8ef] text-xs outline-none focus:border-[#00e5ff] transition-all"
                                min={0}
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => approveWorker(worker.username, salary)}
                            className="bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/30 rounded-lg px-4 py-1.5 text-xs font-medium transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectWorker(worker.username)}
                            className="bg-[#e63946]/10 hover:bg-[#e63946]/20 text-[#e63946] border border-[#e63946]/30 rounded-lg px-4 py-1.5 text-xs font-medium transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Add Worker */}
          <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-6">
            <h2 className="text-[#e8e8ef] font-semibold text-base mb-4">Register New Worker (Admin)</h2>
            <p className="text-[#7a7a8e] text-xs mb-4">Workers added here are auto-approved. They will need to set their password on first login.</p>
            <form onSubmit={addWorker} className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[#7a7a8e] text-xs">Discord Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7a8e] text-sm">@</span>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="discordusername"
                    className="w-full bg-[#12121c] border border-[#1a1a2e] rounded-xl pl-7 pr-4 py-3 text-[#e8e8ef] text-sm placeholder:text-[#3a3a5e] outline-none focus:border-[#00e5ff] transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[#7a7a8e] text-xs">Display Name</label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="Full Name"
                  className="bg-[#12121c] border border-[#1a1a2e] rounded-xl px-4 py-3 text-[#e8e8ef] text-sm placeholder:text-[#3a3a5e] outline-none focus:border-[#00e5ff] transition-all"
                />
              </div>
              <div className="flex flex-col gap-1 justify-end">
                <label className="text-[#7a7a8e] text-xs opacity-0 select-none">Add</label>
                <button
                  type="submit"
                  className="bg-[#00e5ff] hover:bg-[#00c8e0] text-[#050508] font-semibold rounded-xl px-6 py-3 text-sm transition-all whitespace-nowrap"
                >
                  Add Worker
                </button>
              </div>
            </form>
            {addError && <p className="text-[#e63946] text-sm mt-3">{addError}</p>}
            {addSuccess && <p className="text-[#00e5ff] text-sm mt-3">Worker registered successfully.</p>}
          </div>

          {/* Workers list */}
          <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#e8e8ef] font-semibold text-base">Workers</h2>
              <div className="flex bg-[#12121c] rounded-lg p-1">
                <button
                  onClick={() => setWorkerTab("approved")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${workerTab === "approved"
                    ? "bg-[#0c0c14] text-[#e8e8ef]"
                    : "text-[#7a7a8e] hover:text-[#e8e8ef]"
                    }`}
                >
                  Approved ({approvedWorkers.length})
                </button>
                <button
                  onClick={() => setWorkerTab("pending")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${workerTab === "pending"
                    ? "bg-[#0c0c14] text-[#e8e8ef]"
                    : "text-[#7a7a8e] hover:text-[#e8e8ef]"
                    }`}
                >
                  Pending ({pendingWorkers.length})
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 py-4">
                <div className="w-5 h-5 border-2 border-[#00e5ff] border-t-transparent rounded-full animate-spin" />
                <p className="text-[#7a7a8e] text-sm">Loading...</p>
              </div>
            ) : (workerTab === "approved" ? approvedWorkers : pendingWorkers).length === 0 ? (
              <p className="text-[#7a7a8e] text-sm py-4">
                {workerTab === "approved" ? "No approved workers yet." : "No pending registrations."}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {(workerTab === "approved" ? approvedWorkers : pendingWorkers).map((worker) => {
                  const pendingCount = worker.claims.filter((c) => c.status === "pending").length
                  const isSelected = selectedWorker === worker.username
                  const isPendingUser = worker.data.status === "pending"
                  return (
                    <div
                      key={worker.username}
                      className={`border rounded-xl p-4 cursor-pointer transition-all ${isSelected ? "border-[#00e5ff]/40 bg-[#00e5ff]/5" : "border-[#1a1a2e] bg-[#12121c] hover:border-[#2a2a3e]"}`}
                      onClick={() => setSelectedWorker(isSelected ? null : worker.username)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${isPendingUser
                            ? "bg-orange-500/10 border border-orange-500/20 text-orange-400"
                            : "bg-[#1a1a2e] text-[#00e5ff]"
                            }`}>
                            {(worker.data.displayName || worker.username)[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-[#e8e8ef] text-sm font-medium">{worker.data.displayName}</p>
                              {isPendingUser && (
                                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs rounded-full px-2 py-0.5">
                                  Pending
                                </span>
                              )}
                              {!worker.data.passwordHash && !isPendingUser && (
                                <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-xs rounded-full px-2 py-0.5">
                                  No Password
                                </span>
                              )}
                            </div>
                            <p className="text-[#7a7a8e] text-xs">@{worker.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {pendingCount > 0 && (
                            <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-xs rounded-full px-2 py-0.5">
                              {pendingCount} pending
                            </span>
                          )}
                          {!isPendingUser && (
                            <span className="text-[#00e5ff] text-sm font-bold">
                              ${(worker.data.baseSalary ?? 200) + (worker.data.approvedBonuses ?? 0)}
                            </span>
                          )}
                          {isPendingUser ? (
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); approveWorker(worker.username, worker.data.baseSalary ?? 200) }}
                                className="bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/30 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                              >
                                Approve
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); rejectWorker(worker.username) }}
                                className="text-[#e63946] hover:text-red-400 border border-[#e63946]/20 rounded-lg p-1.5 transition-colors"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); removeWorker(worker.username) }}
                              className="text-[#e63946] hover:text-red-400 border border-[#e63946]/20 rounded-lg p-1.5 transition-colors"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14H6L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4h6v2" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Claims detail — shown when worker is selected */}
                      {isSelected && !isPendingUser && (
                        <div className="mt-4 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                          <div className="border-t border-[#1a1a2e] pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-[#7a7a8e] text-xs uppercase tracking-widest">Bonus Claims</p>
                              <p className="text-[#7a7a8e] text-xs">
                                {worker.claims.length} total &middot; {worker.claims.filter(c => c.status === "approved").length} approved
                              </p>
                            </div>
                            {worker.claims.length === 0 ? (
                              <p className="text-[#7a7a8e] text-sm">No claims submitted yet.</p>
                            ) : (
                              <div className="flex flex-col gap-2">
                                {worker.claims.map((claim) => (
                                  <div
                                    key={claim.id}
                                    className="bg-[#0c0c14] border border-[#1a1a2e] rounded-xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                                  >
                                    <div className="flex flex-col gap-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[#e8e8ef] text-sm font-medium">@{claim.profileUsername}</span>
                                        <span className="text-[#7a7a8e] text-xs border border-[#1a1a2e] rounded-full px-2 py-0.5">{claim.platform}</span>
                                        <StatusBadge status={claim.status} />
                                      </div>
                                      <p className="text-[#7a7a8e] text-xs">
                                        {claim.milestoneLabel} — <span className="text-[#00e5ff]">${claim.reward}</span>
                                      </p>
                                      {claim.description && (
                                        <ExpandableNote text={claim.description} />
                                      )}
                                      <p className="text-[#3a3a5e] text-xs">{new Date(claim.submittedAt).toLocaleString()}</p>
                                      {/* Screenshots */}
                                      {claim.screenshots && claim.screenshots.length > 0 && (
                                        <div className="flex items-center gap-2 mt-2">
                                          <button
                                            onClick={() => {
                                              setViewingScreenshots(claim.screenshots!)
                                              setCurrentScreenshotIdx(0)
                                            }}
                                            className="flex items-center gap-1.5 bg-[#12121c] hover:bg-[#1a1a2e] border border-[#1a1a2e] rounded-lg px-2.5 py-1.5 text-xs text-[#7a7a8e] hover:text-[#e8e8ef] transition-all"
                                          >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                              <rect x="3" y="3" width="18" height="18" rx="2" />
                                              <circle cx="8.5" cy="8.5" r="1.5" />
                                              <polyline points="21 15 16 10 5 21" />
                                            </svg>
                                            {claim.screenshots.length} screenshot{claim.screenshots.length > 1 ? 's' : ''}
                                          </button>
                                          <div className="flex -space-x-2">
                                            {claim.screenshots.slice(0, 5).map((pathname, idx) => (
                                              <div
                                                key={idx}
                                                className="w-8 h-8 rounded-md overflow-hidden border-2 border-[#0c0c14] cursor-pointer hover:z-10 transition-transform hover:scale-110"
                                                onClick={() => {
                                                  setViewingScreenshots(claim.screenshots!)
                                                  setCurrentScreenshotIdx(idx)
                                                }}
                                              >
                                                <img src={`/api/view-screenshot?pathname=${encodeURIComponent(pathname)}`} alt="" className="w-full h-full object-cover" />
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                      {claim.status === "pending" && (
                                        <>
                                          <button
                                            onClick={() => updateClaimStatus(worker.username, claim.id, "approved", claim.reward, claim.status)}
                                            className="bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/30 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                                          >
                                            Approve
                                          </button>
                                          <button
                                            onClick={() => updateClaimStatus(worker.username, claim.id, "rejected", claim.reward, claim.status)}
                                            className="bg-[#e63946]/10 hover:bg-[#e63946]/20 text-[#e63946] border border-[#e63946]/30 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                                          >
                                            Reject
                                          </button>
                                        </>
                                      )}
                                      {claim.status !== "pending" && (
                                        <button
                                          onClick={() => updateClaimStatus(
                                            worker.username,
                                            claim.id,
                                            claim.status === "approved" ? "rejected" : "approved",
                                            claim.reward,
                                            claim.status
                                          )}
                                          className="text-[#7a7a8e] hover:text-[#e8e8ef] border border-[#1a1a2e] rounded-lg px-3 py-1.5 text-xs transition-all"
                                        >
                                          Undo
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ============ MILESTONE OVERVIEW ============ */}
          <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[#e8e8ef] font-semibold text-base">Milestone Overview</h2>
                <p className="text-[#7a7a8e] text-xs mt-0.5">View all approved claims grouped by milestone across all workers</p>
              </div>
            </div>

            {/* Milestone selector buttons */}
            <div className="flex flex-wrap gap-2 mb-5">
              {[
                { key: "milestone1", label: "Milestone 1", color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.3)" },
                { key: "milestone2", label: "Milestone 2", color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.3)" },
                { key: "milestone3", label: "Milestone 3", color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.3)" },
                { key: "milestone4", label: "Milestone 4", color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.3)" },
              ].map(({ key, label, color, bg, border }) => {
                const count = workersWithClaims.reduce(
                  (acc, w) => acc + w.claims.filter((c) => c.milestone === key && c.status === "approved").length,
                  0
                )
                const isActive = milestoneFilter === key
                return (
                  <button
                    key={key}
                    onClick={() => setMilestoneFilter(isActive ? null : key)}
                    style={isActive ? { backgroundColor: bg, borderColor: border, color } : {}}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      isActive
                        ? "shadow-sm"
                        : "bg-[#12121c] border-[#1a1a2e] text-[#7a7a8e] hover:text-[#e8e8ef] hover:border-[#2a2a3e]"
                    }`}
                  >
                    {label}
                    <span
                      style={isActive ? { backgroundColor: border, color } : {}}
                      className={`text-xs rounded-full px-1.5 py-0.5 leading-none font-semibold ${
                        isActive ? "" : "bg-[#1a1a2e] text-[#7a7a8e]"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
              {milestoneFilter && (
                <button
                  onClick={() => setMilestoneFilter(null)}
                  className="px-4 py-2 rounded-xl border border-[#1a1a2e] text-[#7a7a8e] hover:text-[#e8e8ef] text-sm transition-all bg-[#12121c]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Milestone results */}
            {milestoneFilter ? (() => {
              const rows: Array<{ workerUsername: string; displayName: string; claim: Claim }> = []
              workersWithClaims.forEach((w) => {
                w.claims
                  .filter((c) => c.milestone === milestoneFilter && c.status === "approved")
                  .forEach((c) => rows.push({ workerUsername: w.username, displayName: w.data.displayName, claim: c }))
              })
              rows.sort((a, b) => b.claim.submittedAt - a.claim.submittedAt)

              if (rows.length === 0) {
                return (
                  <div className="py-8 text-center">
                    <p className="text-[#7a7a8e] text-sm">No approved claims for this milestone yet.</p>
                  </div>
                )
              }

              return (
                <div className="flex flex-col gap-2">
                  <p className="text-[#7a7a8e] text-xs mb-1">{rows.length} approved claim{rows.length !== 1 ? "s" : ""}</p>
                  {rows.map(({ workerUsername, displayName, claim }) => (
                    <div
                      key={claim.id}
                      className="bg-[#12121c] border border-[#1a1a2e] rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#1a1a2e] flex items-center justify-center text-[#00e5ff] text-sm font-bold shrink-0">
                          {(displayName || workerUsername)[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#e8e8ef] text-sm font-medium">
                            {displayName} <span className="text-[#7a7a8e] font-normal">@{workerUsername}</span>
                          </p>
                          <p className="text-[#7a7a8e] text-xs">
                            @{claim.profileUsername}
                            <span className="mx-1 text-[#3a3a5e]">·</span>
                            {claim.platform}
                            <span className="mx-1 text-[#3a3a5e]">·</span>
                            {claim.milestoneLabel}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[#00e5ff] font-bold text-sm">${claim.reward}</span>
                        <span className="text-[#3a3a5e] text-xs">{new Date(claim.submittedAt).toLocaleDateString()}</span>
                        <span className="bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30 text-xs rounded-full px-2 py-0.5">Approved</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })() : (
              <div className="py-6 text-center">
                <p className="text-[#7a7a8e] text-sm">Select a milestone above to see all approved claims for it.</p>
              </div>
            )}
          </div>

        </>)}

        {/* ============ REPORTS TAB ============ */}
        {adminTab === "reports" && (
          <>
            {/* Reports Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-4">
                <p className="text-[#7a7a8e] text-xs uppercase tracking-widest mb-1">Workers Reporting</p>
                <p className="text-2xl font-bold text-[#e8e8ef]">{reportWorkers.length}</p>
              </div>
              <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-4">
                <p className="text-[#7a7a8e] text-xs uppercase tracking-widest mb-1">Total Reports</p>
                <p className="text-2xl font-bold text-[#00e5ff]">{flatReports.length}</p>
              </div>

              <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-4">
                <p className="text-[#7a7a8e] text-xs uppercase tracking-widest mb-1">Total Follow-Backs</p>
                <p className="text-2xl font-bold text-[#00e5ff]">{reportStats.totalFollowBacks.toLocaleString()}</p>
              </div>
              <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-4">
                <p className="text-[#7a7a8e] text-xs uppercase tracking-widest mb-1">Total DMs</p>
                <p className="text-2xl font-bold text-green-400">{reportStats.totalLeads.toLocaleString()}</p>
              </div>
            </div>


            {/* Filters */}
            <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7a8e]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={reportsSearch}
                  onChange={(e) => setReportsSearch(e.target.value)}
                  placeholder="Search by worker username..."
                  className="w-full bg-[#12121c] border border-[#1a1a2e] rounded-xl pl-8 pr-4 py-2.5 text-[#e8e8ef] text-sm placeholder:text-[#3a3a5e] outline-none focus:border-[#00e5ff] transition-all"
                />
              </div>
              {/* Worker filter */}
              <select
                value={reportsSelectedWorker ?? ""}
                onChange={(e) => setReportsSelectedWorker(e.target.value || null)}
                className="bg-[#12121c] border border-[#1a1a2e] rounded-xl px-3 py-2.5 text-sm text-[#e8e8ef] outline-none focus:border-[#00e5ff] transition-all"
              >
                <option value="">All Workers</option>
                {reportWorkers.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
              {/* Date filter */}
              <input
                type="date"
                value={reportsDateFilter}
                onChange={(e) => setReportsDateFilter(e.target.value)}
                className="bg-[#12121c] border border-[#1a1a2e] rounded-xl px-3 py-2.5 text-sm text-[#e8e8ef] outline-none focus:border-[#00e5ff] transition-all"
              />
              {/* Sort by */}
              <div className="flex bg-[#12121c] border border-[#1a1a2e] rounded-xl p-1 shrink-0">
                <button
                  onClick={() => setReportsSortBy("newest")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${reportsSortBy === "newest" ? "bg-[#1a1a2e] text-[#e8e8ef]" : "text-[#7a7a8e] hover:text-[#e8e8ef]"
                    }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => setReportsSortBy("count")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${reportsSortBy === "count" ? "bg-[#1a1a2e] text-[#e8e8ef]" : "text-[#7a7a8e] hover:text-[#e8e8ef]"
                    }`}
                >
                  Most Reports
                </button>
                <button
                  onClick={() => setReportsSortBy("name")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${reportsSortBy === "name" ? "bg-[#1a1a2e] text-[#e8e8ef]" : "text-[#7a7a8e] hover:text-[#e8e8ef]"
                    }`}
                >
                  A – Z
                </button>
              </div>
              {(reportsSearch || reportsSelectedWorker || reportsDateFilter) && (
                <button
                  onClick={() => { setReportsSearch(""); setReportsSelectedWorker(null); setReportsDateFilter("") }}
                  className="text-[#7a7a8e] hover:text-[#e8e8ef] text-sm border border-[#1a1a2e] rounded-xl px-3 py-2.5 transition-colors whitespace-nowrap"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Reports List — grouped by worker */}
            <div className="flex flex-col gap-3">
              {reportsLoading ? (
                <div className="flex items-center gap-2 py-8 justify-center">
                  <div className="w-5 h-5 border-2 border-[#00e5ff] border-t-transparent rounded-full animate-spin" />
                  <p className="text-[#7a7a8e] text-sm">Loading live reports...</p>
                </div>
              ) : groupedReports.length === 0 ? (
                <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-8 text-center">
                  <p className="text-[#7a7a8e] text-sm">No reports found.</p>
                </div>
              ) : (
                groupedReports.map(({ workerUsername, dates, workerTotals, workerPlatformTotals }) => (
                  <WorkerTree
                    key={workerUsername}
                    workerUsername={workerUsername}
                    dates={dates}
                    workerTotals={workerTotals}
                    workerPlatformTotals={workerPlatformTotals}
                  />
                ))
              )}
            </div>
          </>
        )}

        {/* ============ CONTACTS TAB ============ */}
        {adminTab === "contacts" && (
          <>
            {/* Contacts Filters */}
            <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7a8e]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={contactsSearch}
                  onChange={(e) => setContactsSearch(e.target.value)}
                  placeholder="Search by worker username..."
                  className="w-full bg-[#12121c] border border-[#1a1a2e] rounded-xl pl-8 pr-4 py-2.5 text-[#e8e8ef] text-sm placeholder:text-[#3a3a5e] outline-none focus:border-[#00e5ff] transition-all"
                />
              </div>
            </div>

            {/* Contacts List */}
            <div className="flex flex-col gap-3">
              {contactsLoading ? (
                <div className="flex items-center gap-2 py-8 justify-center">
                  <div className="w-5 h-5 border-2 border-[#00e5ff] border-t-transparent rounded-full animate-spin" />
                  <p className="text-[#7a7a8e] text-sm">Loading contacts...</p>
                </div>
              ) : Object.keys(allContacts).length === 0 ? (
                <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-8 text-center">
                  <p className="text-[#7a7a8e] text-sm">No contacts found.</p>
                </div>
              ) : (
                Object.entries(allContacts)
                  .filter(([workerUsername]) => contactsSearch === "" || workerUsername.toLowerCase().includes(contactsSearch.toLowerCase()))
                  .map(([workerUsername, workerContacts]) => (
                    <ContactWorkerTree
                      key={workerUsername}
                      workerUsername={workerUsername}
                      workerContacts={workerContacts}
                    />
                  ))
              )}
            </div>
          </>
        )}

      </div>

      {/* Screenshot Viewer Modal */}
      {viewingScreenshots && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setViewingScreenshots(null)}
        >
          <button
            onClick={() => setViewingScreenshots(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {viewingScreenshots.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentScreenshotIdx((prev) => (prev === 0 ? viewingScreenshots.length - 1 : prev - 1))
                }}
                className="absolute left-4 text-white/70 hover:text-white p-2 bg-black/50 rounded-full"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentScreenshotIdx((prev) => (prev === viewingScreenshots.length - 1 ? 0 : prev + 1))
                }}
                className="absolute right-4 text-white/70 hover:text-white p-2 bg-black/50 rounded-full"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          <div className="max-w-4xl max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={`/api/view-screenshot?pathname=${encodeURIComponent(viewingScreenshots[currentScreenshotIdx])}`}
              alt={`Screenshot ${currentScreenshotIdx + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            {viewingScreenshots.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full">
                {currentScreenshotIdx + 1} / {viewingScreenshots.length}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

function ExpandableNote({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const CHAR_LIMIT = 120
  const isLong = text.length > CHAR_LIMIT

  return (
    <div className="text-[#7a7a8e] text-xs italic">
      <span>
        &ldquo;{expanded || !isLong ? text : text.slice(0, CHAR_LIMIT).trimEnd() + "…"}&rdquo;
      </span>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="ml-1.5 text-[#00e5ff]/70 hover:text-[#00e5ff] transition-colors not-italic font-medium"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const styles = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    approved: "bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/30",
    rejected: "bg-[#e63946]/10 text-[#e63946] border-[#e63946]/30",
  }
  return (
    <span className={`text-xs border rounded-full px-2 py-0.5 ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// ========== WORKER TREE — top-level expandable row per worker ==========
function WorkerTree({
  workerUsername,
  dates,
  workerTotals,
  workerPlatformTotals,
}: {
  workerUsername: string
  dates: Array<{ date: string; report: DailyReport }>
  workerTotals: { followBacks: number; leads: number }
  workerPlatformTotals: Record<string, { followBacks: number; leads: number }>
}) {
  const [open, setOpen] = useState(false)
  const platformKeys = Object.keys(workerPlatformTotals).sort()

  return (
    <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl overflow-hidden transition-all hover:border-[#2a2a3e]">
      {/* Worker header row */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between px-5 py-4 text-left gap-4 group"
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Expand chevron */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={`text-[#7a7a8e] shrink-0 mt-0.5 transition-transform ${open ? "rotate-90" : ""}`}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-[#1a1a2e] flex items-center justify-center text-[#00e5ff] text-sm font-bold shrink-0">
            {(workerUsername[0] ?? "?").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[#e8e8ef] font-semibold text-sm">{workerUsername}</p>
            <p className="text-[#7a7a8e] text-xs mb-2">{dates.length} {dates.length === 1 ? "report" : "reports"}</p>
            {/* Per-platform breakdown pills */}
            <div className="flex flex-wrap gap-2">
              {platformKeys.map((p) => {
                const pt = workerPlatformTotals[p]
                return (
                  <div key={p} className="flex items-center gap-1.5 bg-[#12121c] border border-[#1a1a2e] rounded-lg px-2 py-1">
                    <PlatformIcon platform={p} />
                    <span className="text-[#9a9aae] text-xs capitalize">{p}</span>
                    {pt.followBacks > 0 && (
                      <span className="text-[#00e5ff] text-xs font-medium ml-1">{pt.followBacks} <span className="text-[#7a7a8e] font-normal">FB</span></span>
                    )}
                    {pt.leads > 0 && (
                      <span className="text-green-400 text-xs font-medium ml-1">{pt.leads} <span className="text-[#7a7a8e] font-normal">DMs</span></span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        {/* Worker aggregate totals */}
        <div className="flex items-center gap-5 shrink-0 pt-0.5">
          <div className="text-right">
            <p className="text-[#7a7a8e] text-xs leading-none mb-0.5">Follow-Backs</p>
            <p className="text-[#00e5ff] font-bold text-base">{workerTotals.followBacks}</p>
          </div>
          <div className="text-right">
            <p className="text-[#7a7a8e] text-xs leading-none mb-0.5">DMs</p>
            <p className="text-green-400 font-bold text-base">{workerTotals.leads}</p>
          </div>
        </div>
      </button>

      {/* Date rows — shown when worker is expanded */}
      {open && (
        <div className="border-t border-[#1a1a2e] flex flex-col divide-y divide-[#1a1a2e]">
          {dates.map(({ date, report }) => (
            <DateReportRow key={date} date={date} report={report} />
          ))}
        </div>
      )}
    </div>
  )
}

// ========== DATE REPORT ROW — second level, one row per date ==========
function DateReportRow({ date, report }: { date: string; report: DailyReport }) {
  const [open, setOpen] = useState(false)

  const { totals, platformTotals, platformKeys } = useMemo(() => {
    let followBacks = 0
    let leads = 0
    const platformTotals: Record<string, { followBacks: number; leads: number }> = {}
    const platformKeys = Object.keys(report.platforms ?? {}).filter((k) => report.platforms[k]).sort()

    platformKeys.forEach((platformKey) => {
      const platform = report.platforms[platformKey]
      if (!platform) return
      if (!platformTotals[platformKey]) platformTotals[platformKey] = { followBacks: 0, leads: 0 }
      const pLeads = Number(platform.leads) || 0
      leads += pLeads
      platformTotals[platformKey].leads += pLeads
        ;["account1", "account2", "account3"].forEach((acc) => {
          const acct = (platform as Record<string, PlatformAccount>)[acc]
          if (acct) {
            const fb = Number(acct.followBacks) || 0
            const l = Number(acct.leads) || 0
            followBacks += fb
            leads += l
            platformTotals[platformKey].followBacks += fb
            platformTotals[platformKey].leads += l
          }
        })
    })
    return { totals: { followBacks, leads }, platformTotals, platformKeys }
  }, [report])

  return (
    <div className="bg-[#0a0a12]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between pl-12 pr-5 py-3 text-left gap-4 hover:bg-[#0c0c14] transition-colors group"
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Expand chevron */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={`text-[#7a7a8e] shrink-0 mt-0.5 transition-transform ${open ? "rotate-90" : ""}`}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <div className="min-w-0 flex-1">
            {/* Date label */}
            <div className="flex items-center gap-1.5 mb-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[#7a7a8e]">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="text-sm font-medium text-[#c8c8d8]">{date}</span>
            </div>
            {/* Per-platform stat pills */}
            <div className="flex flex-wrap gap-1.5">
              {platformKeys.map((p) => {
                const pt = platformTotals[p]
                return (
                  <div key={p} className="flex items-center gap-1 bg-[#0c0c14] border border-[#1a1a2e] rounded-md px-2 py-0.5">
                    <PlatformIcon platform={p} />
                    <span className="text-[#9a9aae] text-xs capitalize">{p}</span>
                    {pt.followBacks > 0 && (
                      <span className="text-[#00e5ff] text-xs font-medium ml-1">{pt.followBacks}<span className="text-[#7a7a8e] font-normal"> FB</span></span>
                    )}
                    {pt.leads > 0 && (
                      <span className="text-green-400 text-xs font-medium ml-1">{pt.leads}<span className="text-[#7a7a8e] font-normal"> DMs</span></span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        {/* Day totals */}
        <div className="flex items-center gap-4 shrink-0 pt-0.5">
          <div className="text-right">
            <p className="text-[#00e5ff] font-semibold text-sm">{totals.followBacks} <span className="text-[#7a7a8e] font-normal text-xs">FB</span></p>
          </div>
          <div className="text-right">
            <p className="text-green-400 font-semibold text-sm">{totals.leads} <span className="text-[#7a7a8e] font-normal text-xs">DMs</span></p>
          </div>
        </div>
      </button>

      {/* Per-account detail — third level */}
      {open && (
        <div className="pl-16 pr-5 pb-4 flex flex-col gap-2">
          {platformKeys.map((platformKey) => {
            const platform = report.platforms[platformKey]
            if (!platform) return null
            const accounts = ["account1", "account2", "account3"]
              .map((acc) => ({ name: acc, data: (platform as Record<string, PlatformAccount>)[acc] }))
              .filter((a) => a.data)
            const topLevelLeads = Number(platform.leads) || 0

            return (
              <div key={platformKey} className="bg-[#12121c] border border-[#1a1a2e] rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[#e8e8ef] text-xs font-medium capitalize flex items-center gap-1.5">
                    <PlatformIcon platform={platformKey} />
                    {platformKey}
                  </p>
                  {topLevelLeads > 0 && (
                    <span className="text-xs text-green-400">{topLevelLeads} {topLevelLeads === 1 ? "DM" : "DMs"}</span>
                  )}
                </div>
                {accounts.length === 0 && topLevelLeads === 0 && (
                  <p className="text-[#7a7a8e] text-xs">No data</p>
                )}
                {accounts.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {accounts.map(({ name, data }) => (
                      <div key={name} className="flex items-center justify-between text-xs">
                        <span className="text-[#7a7a8e]">{name.replace("account", "Account ")}</span>
                        <div className="flex items-center gap-3">
                          {data.followBacks && <span className="text-[#00e5ff]">{data.followBacks} FB</span>}
                          {data.leads && <span className="text-green-400">{data.leads} {Number(data.leads) === 1 ? "DM" : "DMs"}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PlatformIcon({ platform }: { platform: string }) {
  const icons: Record<string, React.ReactElement> = {
    instagram: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
    tiktok: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ),
    x: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
        <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
      </svg>
    ),
    reddit: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="9" cy="10" r="1" />
        <circle cx="15" cy="10" r="1" />
        <path d="M9 15c.5 1 2 2 3 2s2.5 -1 3 -2" />
      </svg>
    ),
    discord: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M8 12a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
        <path d="M14 12a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
        <path d="M15.5 17c0 1 1.5 3 2 3c1.5 0 2.833 -1.667 3.5 -3c.667 -1.667 .5 -5.833 -1.5 -11.5c-1.457 -1.015 -3 -1.34 -4.5 -1.5l-.972 1.923a11.913 11.913 0 0 0 -4.053 0l-.975 -1.923c-1.5 .16 -3.043 .485 -4.5 1.5c-2 5.667 -2.167 9.833 -1.5 11.5c.667 1.333 2 3 3.5 3c.5 0 2 -2 2 -3" />
        <path d="M7 16.5c3.5 1 6.5 1 10 0" />
      </svg>
    ),
  }
  return icons[platform] || <span>•</span>
}

// ========== CONTACT WORKER TREE ==========
function ContactWorkerTree({
  workerUsername,
  workerContacts,
}: {
  workerUsername: string
  workerContacts: WorkerContacts
}) {
  const [open, setOpen] = useState(false)
  const contactEntries = Object.entries(workerContacts)

  return (
    <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl overflow-hidden transition-all hover:border-[#2a2a3e]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 group hover:bg-[#12121c]/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={`text-[#7a7a8e] shrink-0 mt-0.5 transition-transform ${open ? "rotate-90" : ""}`}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <div className="w-9 h-9 rounded-full bg-[#1a1a2e] flex items-center justify-center text-[#00e5ff] text-sm font-bold shrink-0">
            {(workerUsername[0] ?? "?").toUpperCase()}
          </div>
          <div>
            <p className="text-[#e8e8ef] font-semibold text-sm">{workerUsername}</p>
            <p className="text-[#7a7a8e] text-xs mt-0.5 flex items-center gap-1.5">
              <span>{contactEntries.length} {contactEntries.length === 1 ? "contact" : "contacts"}</span>
            </p>
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-[#1a1a2e] p-5 bg-[#0a0a12]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contactEntries.map(([contactUsername, contact]) => (
              <div key={contactUsername} className="bg-[#12121c] border border-[#1a1a2e] hover:border-[#2a2a3e] transition-colors rounded-xl p-4 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-[#e8e8ef] font-medium text-sm">@{contact.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] uppercase tracking-wider font-semibold border border-[#1a1a2e] bg-[#0c0c14] px-2 py-0.5 rounded-md text-[#00e5ff]">{contact.platform}</span>
                    </div>
                  </div>
                </div>
                <div className="text-[#7a7a8e] text-xs flex-1">
                  {contact.details ? (
                    <p className="mt-2 bg-[#0c0c14] p-3 rounded-lg border border-[#1a1a2e] text-[#b4b4c8] break-words whitespace-pre-wrap">{contact.details}</p>
                  ) : (
                    <p className="mt-2 italic">No details provided.</p>
                  )}
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#1a1a2e]">
                  <span className="text-[#5a5a6e] text-[10px]">
                    Added: {new Date(contact.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-[#5a5a6e] text-[10px]">
                    Updated: {new Date(contact.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
