import { createAuthClient } from "better-auth/react"

// In Codespaces, we need to use relative URLs since the base URL changes
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  redirects: {
    afterSignIn: "/plan",
    afterSignOut: "/auth"
  },
  fetchOptions: {
    credentials: "include"
  }
})