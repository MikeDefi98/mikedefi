"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ref, get, set, update } from "firebase/database"
import { db } from "@/lib/firebase"
import { hashPassword, verifyPassword, generateToken } from "@/lib/auth"

type AuthMode = "signin" | "signup"

export default function PortalLoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>("signin")
  
  // Sign In state
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  
  // Sign Up state
  const [signupUsername, setSignupUsername] = useState("")
  const [signupDisplayName, setSignupDisplayName] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("")
  
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const trimmed = username.trim().toLowerCase()
    if (!trimmed) {
      setError("Please enter your Discord username.")
      setLoading(false)
      return
    }
    if (!password) {
      setError("Please enter your password.")
      setLoading(false)
      return
    }

    try {
      const workerRef = ref(db, `workers/${trimmed}`)
      const snapshot = await get(workerRef)

      if (!snapshot.exists()) {
        setError("Username not found. Please sign up first.")
        setLoading(false)
        return
      }

      const workerData = snapshot.val()
      
      // Check if user is approved
      if (workerData.status === "pending") {
        setError("Your account is pending approval. Please wait for admin verification.")
        setLoading(false)
        return
      }

      // Check password
      if (!workerData.passwordHash) {
        setError("Please set up your password in your settings.")
        setLoading(false)
        return
      }

      const isValid = await verifyPassword(password, workerData.passwordHash)
      if (!isValid) {
        setError("Incorrect password.")
        setLoading(false)
        return
      }

      // Generate a session token, write it to Firebase, store in localStorage
      const token = generateToken()
      await update(ref(db, `workers/${trimmed}`), { sessionToken: token })
      localStorage.setItem("portal_user", trimmed)
      localStorage.setItem("portal_token", token)

      router.push("/portal/dashboard")
    } catch {
      setError("Connection error. Please try again.")
      setLoading(false)
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const trimmedUsername = signupUsername.trim().toLowerCase()
    const trimmedDisplayName = signupDisplayName.trim()

    if (!trimmedUsername) {
      setError("Please enter your Discord username.")
      setLoading(false)
      return
    }
    if (!trimmedDisplayName) {
      setError("Please enter your display name.")
      setLoading(false)
      return
    }
    if (!signupPassword) {
      setError("Please enter a password.")
      setLoading(false)
      return
    }
    if (signupPassword.length < 6) {
      setError("Password must be at least 6 characters.")
      setLoading(false)
      return
    }
    if (signupPassword !== signupConfirmPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }

    try {
      const workerRef = ref(db, `workers/${trimmedUsername}`)
      const snapshot = await get(workerRef)

      if (snapshot.exists()) {
        setError("This username is already registered. Please sign in instead.")
        setLoading(false)
        return
      }

      const passwordHash = await hashPassword(signupPassword)

      // Create new user with pending status (needs admin approval)
      await set(workerRef, {
        displayName: trimmedDisplayName,
        discordUsername: trimmedUsername,
        passwordHash,
        baseSalary: 200,
        approvedBonuses: 0,
        status: "pending",
        createdAt: Date.now(),
      })

      setSuccess("Account created! Please wait for admin approval before signing in.")
      setSignupUsername("")
      setSignupDisplayName("")
      setSignupPassword("")
      setSignupConfirmPassword("")
      setLoading(false)
    } catch {
      setError("Connection error. Please try again.")
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050508] flex items-center justify-center px-4">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0c0c14] border border-[#1a1a2e] mb-4 shadow-[0_0_30px_rgba(0,229,255,0.1)]">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="#00e5ff" strokeWidth="1.5" fill="none" />
              <path d="M16 10L22 13V19L16 22L10 19V13L16 10Z" fill="#00e5ff" fillOpacity="0.15" stroke="#00e5ff" strokeWidth="1" />
              <circle cx="16" cy="16" r="2.5" fill="#00e5ff" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#e8e8ef] tracking-tight font-sans">
            Mike<span className="text-[#00e5ff]">Web</span> Portal
          </h1>
          <p className="text-[#7a7a8e] text-sm mt-1 font-sans">Employee Payment Dashboard</p>
        </div>

        <div className="bg-[#0c0c14] border border-[#1a1a2e] rounded-2xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          {/* Tab Switcher */}
          <div className="flex mb-6 bg-[#12121c] rounded-xl p-1">
            <button
              onClick={() => { setMode("signin"); setError(""); setSuccess("") }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                mode === "signin"
                  ? "bg-[#0c0c14] text-[#e8e8ef] shadow-sm"
                  : "text-[#7a7a8e] hover:text-[#e8e8ef]"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); setSuccess("") }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-[#0c0c14] text-[#e8e8ef] shadow-sm"
                  : "text-[#7a7a8e] hover:text-[#e8e8ef]"
              }`}
            >
              Sign Up
            </button>
          </div>

          {mode === "signin" ? (
            <>
              <h2 className="text-[#e8e8ef] font-medium text-lg mb-1 font-sans">Welcome Back</h2>
              <p className="text-[#7a7a8e] text-sm mb-6 font-sans">Sign in to access your dashboard</p>

              <form onSubmit={handleSignIn} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="username" className="text-[#e8e8ef] text-sm font-medium font-sans">
                    Discord Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7a8e] text-sm font-sans">@</span>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="yourusername"
                      autoComplete="username"
                      className="w-full bg-[#12121c] border border-[#1a1a2e] rounded-xl pl-7 pr-4 py-3 text-[#e8e8ef] text-sm placeholder:text-[#3a3a5e] outline-none focus:border-[#00e5ff] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.1)] transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="password" className="text-[#e8e8ef] text-sm font-medium font-sans">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full bg-[#12121c] border border-[#1a1a2e] rounded-xl px-4 py-3 text-[#e8e8ef] text-sm placeholder:text-[#3a3a5e] outline-none focus:border-[#00e5ff] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.1)] transition-all font-sans"
                  />
                </div>

                {error && (
                  <div className="bg-[#e63946]/10 border border-[#e63946]/30 rounded-xl px-4 py-3 text-[#e63946] text-sm font-sans">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-xl px-4 py-3 text-[#00e5ff] text-sm font-sans">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00e5ff] hover:bg-[#00c8e0] text-[#050508] font-semibold rounded-xl py-3 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sans shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-[#e8e8ef] font-medium text-lg mb-1 font-sans">Create Account</h2>
              <p className="text-[#7a7a8e] text-sm mb-6 font-sans">Sign up to join the team</p>

              <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="signup-name" className="text-[#e8e8ef] text-sm font-medium font-sans">
                    Full Name
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    value={signupDisplayName}
                    onChange={(e) => setSignupDisplayName(e.target.value)}
                    placeholder="John Doe"
                    autoComplete="name"
                    className="w-full bg-[#12121c] border border-[#1a1a2e] rounded-xl px-4 py-3 text-[#e8e8ef] text-sm placeholder:text-[#3a3a5e] outline-none focus:border-[#00e5ff] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.1)] transition-all font-sans"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="signup-username" className="text-[#e8e8ef] text-sm font-medium font-sans">
                    Discord Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7a8e] text-sm font-sans">@</span>
                    <input
                      id="signup-username"
                      type="text"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      placeholder="yourusername"
                      autoComplete="username"
                      className="w-full bg-[#12121c] border border-[#1a1a2e] rounded-xl pl-7 pr-4 py-3 text-[#e8e8ef] text-sm placeholder:text-[#3a3a5e] outline-none focus:border-[#00e5ff] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.1)] transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="signup-password" className="text-[#e8e8ef] text-sm font-medium font-sans">
                    Password
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    className="w-full bg-[#12121c] border border-[#1a1a2e] rounded-xl px-4 py-3 text-[#e8e8ef] text-sm placeholder:text-[#3a3a5e] outline-none focus:border-[#00e5ff] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.1)] transition-all font-sans"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="signup-confirm" className="text-[#e8e8ef] text-sm font-medium font-sans">
                    Confirm Password
                  </label>
                  <input
                    id="signup-confirm"
                    type="password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    className="w-full bg-[#12121c] border border-[#1a1a2e] rounded-xl px-4 py-3 text-[#e8e8ef] text-sm placeholder:text-[#3a3a5e] outline-none focus:border-[#00e5ff] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.1)] transition-all font-sans"
                  />
                </div>

                {error && (
                  <div className="bg-[#e63946]/10 border border-[#e63946]/30 rounded-xl px-4 py-3 text-[#e63946] text-sm font-sans">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-xl px-4 py-3 text-[#00e5ff] text-sm font-sans">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00e5ff] hover:bg-[#00c8e0] text-[#050508] font-semibold rounded-xl py-3 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sans shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>

              <p className="text-center text-[#7a7a8e] text-xs mt-4 font-sans">
                New accounts require admin approval before access is granted.
              </p>
            </>
          )}
        </div>

        <p className="text-center text-[#3a3a5e] text-xs mt-6 font-sans">
          mike3web.com &copy; {new Date().getFullYear()} — Internal use only
        </p>
      </div>
    </main>
  )
}
