import { createContext, useContext, useEffect, useState } from "react"
import { apiFetch, extractUser } from "../lib/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Clean up the token key from the earlier bearer/localStorage
        // approach — it's dead data now and no longer read anywhere.
        try {
            localStorage.removeItem("hoodwatch_token")
        } catch {
            // localStorage unavailable — nothing to clean up.
        }

        async function restoreSession() {
            try {
                // If the browser is holding a valid session cookie, this
                // succeeds and the person is restored automatically. If
                // not (no cookie, or an expired one), it 401s and we just
                // treat this like an ordinary logged-out visit.
                const response = await apiFetch("/auth/me")
                setUser(extractUser(response))
            } catch {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        restoreSession()
    }, [])

    // Called after a successful login/register response. The session
    // cookie is already set by the server at this point — this just
    // updates the in-memory user so the UI reflects it immediately.
    function login(userData) {
        setUser(userData)
    }

    async function logout() {
        try {
            await apiFetch("/auth/logout", { method: "POST" })
        } finally {
            setUser(null)
        }
    }

    const value = {
        user,
        setUser,
        loading,
        login,
        logout,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext)
}

export default AuthContext
