"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ref, get, push, set, onValue, update } from "firebase/database"
import { db } from "@/lib/firebase"
import { hashPassword, verifyPassword, generateToken } from "@/lib/auth"

const PLATFORMS = ["Instagram", "TikTok", "X (Twitter)", "Discord", "Facebook"]

const WITHDRAW_METHODS = ["PayPal", "Wise", "Skrill", "Bank Transfer"]

interface Claim {
  id: string
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
  milestone1?: number
  milestone2?: number
  approvedBonuses: number
  sessionToken?: string
  passwordHash?: string
  status?: string
}

export default function PortalDashboard() {
  const router = useRouter()
  const [username, setUsername] = useState<string | null>(null)
  // Decode Firebase key (commas) back to display form (dots)
  const displayUsername = username ? username.replace(/,/g, ".") : null
  const [worker, setWorker] = useState<WorkerData | null>(null)

  const MILESTONES = [
    { id: "m1", label: "Milestone 1: The Foundation", reward: worker?.milestone1 ?? 10 },
    { id: "m2", label: "Milestone 2: Lead Transfer", reward: worker?.milestone2 ?? 20 },
    { id: "m3", label: "Milestone 3: The Demo Test", reward: 50 },
    { id: "m4", label: "Milestone 4: The Conversion", reward: 100 },
  ]

  const [claims, setClaims] = useState<Claim[]>([])
  const [authChecked, setAuthChecked] = useState(false)
  const [loading, setLoading] = useState(true)

  // Claim form state
  const [platform, setPlatform] = useState("")
  const [profileUsername, setProfileUsername] = useState("")
  const [milestone, setMilestone] = useState("")
  const [description, setDescription] = useState("")
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [uploadingScreenshots, setUploadingScreenshots] = useState(false)
  const [claimSubmitting, setClaimSubmitting] = useState(false)
  const [claimSuccess, setClaimSuccess] = useState(false)
  const [claimError, setClaimError] = useState("")

  // Withdraw modal state
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawMethod, setWithdrawMethod] = useState("")
  const [withdrawField1, setWithdrawField1] = useState("")
  const [withdrawField2, setWithdrawField2] = useState("")
  const [withdrawSubmitted, setWithdrawSubmitted] = useState(false)

  // Settings modal state
  const [showSettings, setShowSettings] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [settingsError, setSettingsError] = useState("")
  const [settingsSuccess, setSettingsSuccess] = useState("")
  const [settingsLoading, setSettingsLoading] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("portal_user")
    const storedToken = localStorage.getItem("portal_token")

    if (!storedUser || !storedToken) {
      router.replace("/portal")
      return
    }

    // Validate token against Firebase before rendering anything
    get(ref(db, `workers/${storedUser}`)).then((snapshot) => {
      if (!snapshot.exists()) {
        localStorage.removeItem("portal_user")
        localStorage.removeItem("portal_token")
        router.replace("/portal")
        return
      }

      const data: WorkerData = snapshot.val()
      // Token mismatch means a newer login happened on another device — redirect to login
      if (data.sessionToken !== storedToken) {
        localStorage.removeItem("portal_user")
        localStorage.removeItem("portal_token")
        router.replace("/portal")
        return
      }

      setUsername(storedUser)
      setAuthChecked(true)
    }).catch(() => {
      router.replace("/portal")
    })
  }, [router])

  // Once auth is confirmed, subscribe to live worker data and claims
  useEffect(() => {
    if (!authChecked || !username) return

    const workerRef = ref(db, `workers/${username}`)
    const unsubWorker = onValue(workerRef, (snapshot) => {
      if (snapshot.exists()) {
        setWorker(snapshot.val() as WorkerData)
      }
      setLoading(false)
    })

    const claimsRef = ref(db, `claims/${username}`)
    const unsubClaims = onValue(claimsRef, (snapshot) => {
      const list: Claim[] = []
      if (snapshot.exists()) {
        Object.entries(snapshot.val() as Record<string, Omit<Claim, "id">>).forEach(([id, claim]) => {
          list.push({ id, ...claim })
        })
        list.sort((a, b) => b.submittedAt - a.submittedAt)
      }
      setClaims(list)
    })

    return () => {
      unsubWorker()
      unsubClaims()
    }
  }, [authChecked, username])

  function logout() {
    // Clear the session token from Firebase so the session is truly invalidated
    if (username) {
      update(ref(db, `workers/${username}`), { sessionToken: null })
    }
    localStorage.removeItem("portal_user")
    localStorage.removeItem("portal_token")
    router.push("/portal")
  }

  async function handleClaimSubmit(e: React.FormEvent) {
    e.preventDefault()
    setClaimError("")
    if (!platform) { setClaimError("Please select a platform."); return }
    if (!profileUsername.trim()) { setClaimError("Please enter a profile username."); return }
    if (!milestone) { setClaimError("Please select a milestone."); return }
    if (!description.trim()) { setClaimError("Please add a short description."); return }

    setClaimSubmitting(true)
    const selected = MILESTONES.find((m) => m.id === milestone)!

    try {
      // Upload screenshots first
      const screenshotPathnames: string[] = []
      if (screenshots.length > 0) {
        setUploadingScreenshots(true)
        for (const file of screenshots) {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('workerUsername', username!)
          const res = await fetch('/api/upload-screenshot', {
            method: 'POST',
            body: formData,
          })
          if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to upload screenshot')
          }
          const { pathname } = await res.json()
          screenshotPathnames.push(pathname)
        }
        setUploadingScreenshots(false)
      }

      // Claims stored under claims/{workerUsername}/{claimId}
      const claimsRef = ref(db, `claims/${username}`)
      const newClaimRef = push(claimsRef)
      await set(newClaimRef, {
        workerUsername: username,
        platform,
        profileUsername: profileUsername.trim(),
        milestone: selected.id,
        milestoneLabel: selected.label,
        reward: selected.reward,
        description: description.trim(),
        screenshots: screenshotPathnames,
        status: "pending",
        submittedAt: Date.now(),
      })
      setPlatform("")
      setProfileUsername("")
      setMilestone("")
      setDescription("")
      setScreenshots([])
      setClaimSuccess(true)
      setTimeout(() => setClaimSuccess(false), 5000)
    } catch (err) {
      setClaimError(err instanceof Error ? err.message : "Failed to submit. Please try again.")
      setUploadingScreenshots(false)
    } finally {
      setClaimSubmitting(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setSettingsError("")
    setSettingsSuccess("")
    setSettingsLoading(true)

    if (!newPassword) {
      setSettingsError("Please enter a new password.")
      setSettingsLoading(false)
      return
    }
    if (newPassword.length < 6) {
      setSettingsError("Password must be at least 6 characters.")
      setSettingsLoading(false)
      return
    }
    if (newPassword !== confirmNewPassword) {
      setSettingsError("Passwords do not match.")
      setSettingsLoading(false)
      return
    }

    try {
      // If user has existing password, verify current password
      if (worker?.passwordHash) {
        if (!currentPassword) {
          setSettingsError("Please enter your current password.")
          setSettingsLoading(false)
          return
        }
        const isValid = await verifyPassword(currentPassword, worker.passwordHash)
        if (!isValid) {
          setSettingsError("Current password is incorrect.")
          setSettingsLoading(false)
          return
        }
      }

      const newHash = await hashPassword(newPassword)
      await update(ref(db, `workers/${username}`), { passwordHash: newHash })

      setSettingsSuccess("Password updated successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
      setTimeout(() => {
        setShowSettings(false)
        setSettingsSuccess("")
      }, 2000)
    } catch {
      setSettingsError("Failed to update password. Please try again.")
    } finally {
      setSettingsLoading(false)
    }
  }

  const approvedBonuses = worker?.approvedBonuses ?? 0
  const baseSalary = worker?.baseSalary ?? 200
  const totalEarnings = baseSalary + approvedBonuses
  const pendingBonuses = claims.filter((c) => c.status === "pending").reduce((s, c) => s + c.reward, 0)
  const hasPassword = !!worker?.passwordHash

  const withdrawLabels: Record<string, [string, string]> = {
    PayPal: ["PayPal Email", "Full Name"],
    Wise: ["Wise Email", "Full Name"],
    Skrill: ["Skrill Email", "Full Name"],
    "Bank Transfer": ["Account / IBAN", "Account Holder Name"],
  }

  if (!authChecked || loading) {
    return (
      <main className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#00e5ff] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#7a7a8e] text-sm font-sans">Loading dashboard...</p>
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

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#1a1a2e] bg-[#050508]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0c0c14] border border-[#1a1a2e] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="#00e5ff" strokeWidth="1.5" fill="none" />
                <circle cx="16" cy="16" r="2.5" fill="#00e5ff" />
              </svg>
            </div>
            <span className="text-[#e8e8ef] font-semibold text-sm">
              Mike<span className="text-[#00e5ff]">Web</span> Portal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#7a7a8e] text-sm hidden sm:block">@{displayUsername}</span>
            <button
              onClick={() => {
                setShowSettings(true)
                setSettingsError("")
                setSettingsSuccess("")
                setCurrentPassword("")
                setNewPassword("")
                setConfirmNewPassword("")
              }}
              className="text-[#7a7a8e] hover:text-[#e8e8ef] text-sm border border-[#1a1a2e] rounded-lg p-1.5 transition-colors"
              title="Settings"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
            <button
              onClick={logout}
              className="text-[#7a7a8e] hover:text-[#e8e8ef] text-sm border border-[#1a1a2e] rounded-lg px-3 py-1.5 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="relative max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">

        {/* Password Setup Alert for Legacy Users */}
        {!hasPassword && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <p className="text-yellow-400 text-sm font-medium">Password Required</p>
                <p className="text-[#7a7a8e] text-xs mt-0.5">Please set up a password to secure your account.</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="shrink-0 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 font-medium rounded-xl px-4 py-2 text-sm transition-all"
            >
              Set Password
            </button>
          </div>
        )}

        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-semibold text-[#e8e8ef] text-balance">
            Welcome back, <span className="text-[#00e5ff]">{worker?.displayName || displayUsername}</span>
          </h1>
          <p className="text-[#7a7a8e] text-sm mt-1">Here is your earnings overview and bonus submission panel.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Base Monthly Salary" value={`$${baseSalary}.00`} sub="Fixed monthly" />
          <StatCard label="Approved Bonuses" value={`$${approvedBonuses}.00`} sub="Reviewed and approved" accent />
          <StatCard label="Pending Review" value={`$${pendingBonuses}.00`} sub="Awaiting supervisor" dim />
        </div>

        {/* Total earnings banner */}
        <div className="bg-[#0c0c14] border border-[#00e5ff]/20 rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_40px_rgba(0,229,255,0.05)]">
          <div>
            <p className="text-[#7a7a8e] text-xs uppercase tracking-widest mb-1">Total Confirmed Earnings</p>
            <p className="text-3xl font-bold text-[#00e5ff]">${totalEarnings.toFixed(2)}</p>
            <p className="text-[#7a7a8e] text-xs mt-1">Base salary + approved bonuses</p>
          </div>
          <button
            onClick={() => {
              setShowWithdraw(true)
              setWithdrawSubmitted(false)
              setWithdrawMethod("")
              setWithdrawField1("")
              setWithdrawField2("")
            }}
            className="shrink-0 bg-[#00e5ff] hover:bg-[#00c8e0] text-[#050508] font-semibold rounded-xl px-6 py-3 text-sm transition-all shadow-[0_0_20px_rgba(0,229,255,0.2)]"
          >
            Request Withdrawal
          </button>
        </div>

        {/* Claim form */}
        <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-6 flex flex-col gap-6">
          <div>
            <h2 className="text-[#e8e8ef] font-semibold text-lg">Submit Bonus Claim</h2>
            <p className="text-[#7a7a8e] text-sm mt-1">Fill in the details below to claim a milestone bonus.</p>
          </div>

          <form onSubmit={handleClaimSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[#e8e8ef] text-sm font-medium">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="bg-[#12121c] border border-[#1a1a2e] rounded-xl px-4 py-3 text-sm text-[#e8e8ef] outline-none focus:border-[#00e5ff] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.1)] transition-all appearance-none"
                >
                  <option value="" disabled>Select platform...</option>
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#e8e8ef] text-sm font-medium">Profile Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7a8e] text-sm">@</span>
                  <input
                    type="text"
                    value={profileUsername}
                    onChange={(e) => setProfileUsername(e.target.value)}
                    placeholder="username"
                    className="w-full bg-[#12121c] border border-[#1a1a2e] rounded-xl pl-7 pr-4 py-3 text-[#e8e8ef] text-sm placeholder:text-[#3a3a5e] outline-none focus:border-[#00e5ff] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.1)] transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#e8e8ef] text-sm font-medium">Milestone</label>
              <select
                value={milestone}
                onChange={(e) => setMilestone(e.target.value)}
                className="bg-[#12121c] border border-[#1a1a2e] rounded-xl px-4 py-3 text-sm text-[#e8e8ef] outline-none focus:border-[#00e5ff] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.1)] transition-all appearance-none"
              >
                <option value="" disabled>Select milestone...</option>
                {MILESTONES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label} — ${m.reward}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#e8e8ef] text-sm font-medium">Note / Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short note about this person — background, profession, location, etc."
                rows={3}
                className="bg-[#12121c] border border-[#1a1a2e] rounded-xl px-4 py-3 text-[#e8e8ef] text-sm placeholder:text-[#3a3a5e] outline-none focus:border-[#00e5ff] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.1)] transition-all resize-none"
              />
            </div>

            {/* Screenshot Upload */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-[#e8e8ef] text-sm font-medium">
                  Proof Screenshots
                </label>
                <span className="text-[#7a7a8e] text-xs">{screenshots.length}/5 uploaded</span>
              </div>

              {/* Drop zone — always visible */}
              {screenshots.length < 5 && (
                <label className="relative flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-[#1a1a2e] hover:border-[#00e5ff]/40 bg-[#12121c] hover:bg-[#00e5ff]/5 py-7 cursor-pointer transition-all group">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3a3a5e" strokeWidth="1.5" strokeLinecap="round" className="group-hover:stroke-[#00e5ff]/60 transition-colors">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <div className="text-center">
                    <p className="text-[#7a7a8e] text-sm group-hover:text-[#e8e8ef] transition-colors">Click to upload screenshot</p>
                    <p className="text-[#3a3a5e] text-xs mt-0.5">PNG, JPG, WEBP — max 5MB each, up to 5 total</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file && screenshots.length < 5) {
                        setScreenshots([...screenshots, file])
                      }
                      e.target.value = ''
                    }}
                  />
                </label>
              )}

              {/* Thumbnails */}
              {screenshots.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {screenshots.map((file, idx) => (
                    <div key={idx} className="relative group">
                      <div className="w-24 h-24 rounded-xl overflow-hidden border border-[#1a1a2e] bg-[#12121c]">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Screenshot ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setScreenshots(screenshots.filter((_, i) => i !== idx))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-[#e63946] rounded-full flex items-center justify-center text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                      <p className="text-[#3a3a5e] text-xs mt-1 max-w-[96px] truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {claimError && (
              <div className="bg-[#e63946]/10 border border-[#e63946]/30 rounded-xl px-4 py-3 text-[#e63946] text-sm">
                {claimError}
              </div>
            )}
            {claimSuccess && (
              <div className="bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-xl px-4 py-3 text-[#00e5ff] text-sm">
                Bonus claim submitted successfully. It will be reviewed by your supervisor.
              </div>
            )}

            <button
              type="submit"
              disabled={claimSubmitting}
              className="self-start bg-[#00e5ff] hover:bg-[#00c8e0] text-[#050508] font-semibold rounded-xl px-8 py-3 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,229,255,0.15)]"
            >
              {uploadingScreenshots ? "Uploading screenshots..." : claimSubmitting ? "Submitting..." : "Submit Claim"}
            </button>
          </form>
        </div>

        {/* Milestone reference */}
        <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-6">
          <h2 className="text-[#e8e8ef] font-semibold text-base mb-4">Milestone Reference</h2>
          <div className="flex flex-col gap-3">
            {MILESTONES.map((m) => (
              <div key={m.id} className="flex items-start gap-4 border border-[#1a1a2e] rounded-xl p-4 bg-[#12121c]">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-[#00e5ff]/10 border border-[#00e5ff]/20 flex items-center justify-center">
                  <span className="text-[#00e5ff] font-bold text-sm">${m.reward}</span>
                </div>
                <div>
                  <p className="text-[#e8e8ef] text-sm font-medium">{m.label}</p>
                  <p className="text-[#7a7a8e] text-xs mt-0.5">
                    {m.id === "m1" && "Build genuine friendship over 9+ days. Proof: profile username + background note."}
                    {m.id === "m2" && "Move an interested user (from Milestone 1) to continue the conversation on WhatsApp or Discord. Proof: Screenshot + detailed background note about the lead."}
                    {m.id === "m3" && "Transition to your professional sphere, company services/software topics and build interest in the demo. Proof: username + note on their interest."}
                    {m.id === "m4" && "Successfully assist with setting up their testing account. Proof: conversion confirmation."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Claims history */}
        {claims.length > 0 && (
          <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-6">
            <h2 className="text-[#e8e8ef] font-semibold text-base mb-4">Submission History</h2>
            <div className="flex flex-col gap-3">
              {claims.map((claim) => (
                <div key={claim.id} className="border border-[#1a1a2e] rounded-xl p-4 bg-[#12121c] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[#e8e8ef] text-sm font-medium">@{claim.profileUsername}</span>
                      <span className="text-[#7a7a8e] text-xs border border-[#1a1a2e] rounded-full px-2 py-0.5">{claim.platform}</span>
                      <StatusBadge status={claim.status} />
                    </div>
                    <p className="text-[#7a7a8e] text-xs">{claim.milestoneLabel}</p>
                    {claim.description && (
                      <p className="text-[#7a7a8e] text-xs italic mt-0.5">&ldquo;{claim.description}&rdquo;</p>
                    )}
                    <p className="text-[#3a3a5e] text-xs">{new Date(claim.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`text-lg font-bold ${claim.status === "approved" ? "text-[#00e5ff]" : "text-[#7a7a8e]"}`}>
                      ${claim.reward}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => setShowWithdraw(false)}
        >
          <div
            className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-6 w-full max-w-md shadow-[0_0_60px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            {!withdrawSubmitted ? (
              <>
                <h2 className="text-[#e8e8ef] font-semibold text-lg mb-1">Request Withdrawal</h2>
                <p className="text-[#7a7a8e] text-sm mb-5">Select your preferred payout method.</p>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[#e8e8ef] text-sm font-medium">Payout Method</label>
                    <select
                      value={withdrawMethod}
                      onChange={(e) => { setWithdrawMethod(e.target.value); setWithdrawField1(""); setWithdrawField2("") }}
                      className="bg-[#12121c] border border-[#1a1a2e] rounded-xl px-4 py-3 text-sm text-[#e8e8ef] outline-none focus:border-[#00e5ff] transition-all appearance-none"
                    >
                      <option value="" disabled>Select method...</option>
                      {WITHDRAW_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  {withdrawMethod && (
                    <>
                      <div className="flex flex-col gap-2">
                        <label className="text-[#e8e8ef] text-sm font-medium">{withdrawLabels[withdrawMethod][0]}</label>
                        <input
                          type="text"
                          value={withdrawField1}
                          onChange={(e) => setWithdrawField1(e.target.value)}
                          className="bg-[#12121c] border border-[#1a1a2e] rounded-xl px-4 py-3 text-[#e8e8ef] text-sm placeholder:text-[#3a3a5e] outline-none focus:border-[#00e5ff] transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[#e8e8ef] text-sm font-medium">{withdrawLabels[withdrawMethod][1]}</label>
                        <input
                          type="text"
                          value={withdrawField2}
                          onChange={(e) => setWithdrawField2(e.target.value)}
                          className="bg-[#12121c] border border-[#1a1a2e] rounded-xl px-4 py-3 text-[#e8e8ef] text-sm placeholder:text-[#3a3a5e] outline-none focus:border-[#00e5ff] transition-all"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-3 mt-1">
                    <button
                      onClick={() => setShowWithdraw(false)}
                      className="flex-1 border border-[#1a1a2e] text-[#7a7a8e] hover:text-[#e8e8ef] rounded-xl py-3 text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { if (withdrawMethod && withdrawField1) setWithdrawSubmitted(true) }}
                      disabled={!withdrawMethod || !withdrawField1}
                      className="flex-1 bg-[#00e5ff] hover:bg-[#00c8e0] text-[#050508] font-semibold rounded-xl py-3 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Request
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[#e8e8ef] font-semibold text-base">Withdrawal Request Received</h3>
                  <p className="text-[#7a7a8e] text-sm mt-2 leading-relaxed">
                    Withdrawal is possible after your bonuses are thoroughly reviewed by a supervisor. You will be contacted once your balance is cleared.
                  </p>
                </div>
                <button
                  onClick={() => setShowWithdraw(false)}
                  className="w-full border border-[#1a1a2e] text-[#7a7a8e] hover:text-[#e8e8ef] rounded-xl py-3 text-sm transition-colors mt-2"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-6 w-full max-w-md shadow-[0_0_60px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[#e8e8ef] font-semibold text-lg mb-1">Account Settings</h2>
            <p className="text-[#7a7a8e] text-sm mb-5">
              {hasPassword ? "Update your password" : "Set up your account password"}
            </p>

            <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
              {hasPassword && (
                <div className="flex flex-col gap-2">
                  <label className="text-[#e8e8ef] text-sm font-medium">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="bg-[#12121c] border border-[#1a1a2e] rounded-xl px-4 py-3 text-[#e8e8ef] text-sm placeholder:text-[#3a3a5e] outline-none focus:border-[#00e5ff] transition-all"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-[#e8e8ef] text-sm font-medium">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="bg-[#12121c] border border-[#1a1a2e] rounded-xl px-4 py-3 text-[#e8e8ef] text-sm placeholder:text-[#3a3a5e] outline-none focus:border-[#00e5ff] transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#e8e8ef] text-sm font-medium">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="bg-[#12121c] border border-[#1a1a2e] rounded-xl px-4 py-3 text-[#e8e8ef] text-sm placeholder:text-[#3a3a5e] outline-none focus:border-[#00e5ff] transition-all"
                />
              </div>

              {settingsError && (
                <div className="bg-[#e63946]/10 border border-[#e63946]/30 rounded-xl px-4 py-3 text-[#e63946] text-sm">
                  {settingsError}
                </div>
              )}

              {settingsSuccess && (
                <div className="bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-xl px-4 py-3 text-[#00e5ff] text-sm">
                  {settingsSuccess}
                </div>
              )}

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="flex-1 border border-[#1a1a2e] text-[#7a7a8e] hover:text-[#e8e8ef] rounded-xl py-3 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="flex-1 bg-[#00e5ff] hover:bg-[#00c8e0] text-[#050508] font-semibold rounded-xl py-3 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {settingsLoading ? "Saving..." : "Save Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

function StatCard({
  label,
  value,
  sub,
  accent,
  dim,
}: {
  label: string
  value: string
  sub: string
  accent?: boolean
  dim?: boolean
}) {
  return (
    <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-5">
      <p className="text-[#7a7a8e] text-xs uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-[#00e5ff]" : dim ? "text-[#7a7a8e]" : "text-[#e8e8ef]"}`}>{value}</p>
      <p className="text-[#3a3a5e] text-xs mt-1">{sub}</p>
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
