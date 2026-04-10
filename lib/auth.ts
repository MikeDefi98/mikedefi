// Plain text password storage for Firebase Realtime Database
// Also supports legacy hashed passwords for backward compatibility

export async function hashPassword(password: string): Promise<string> {
  // Now returns plain text password instead of hash
  return password
}

export async function verifyPassword(password: string, storedPassword: string): Promise<boolean> {
  // First check plain text match
  if (password === storedPassword) {
    return true
  }
  // Backward compatibility: check if storedPassword is a SHA-256 hash (64 hex chars)
  if (storedPassword.length === 64 && /^[a-f0-9]+$/.test(storedPassword)) {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const inputHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    return inputHash === storedPassword
  }
  return false
}

export function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}
