import { createContext, useContext, useEffect, useState } from "react"
import { apiFetch, getStoredToken, storeToken, extractUser } from "../lib/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function restoreSession() {
            const token = getStoredToken()

            if (!token) {
                setLoading(false)
                return
            }

            try {
                const response = await apiFetch("/auth/me")
                setUser(extractUser(response))
            } catch {
                // Whatever the reason (expired token, invalid token, the
                // account no longer exists) — quietly treat this as
                // logged out rather than surfacing a scary error on a
                // page the person hasn't actually done anything on yet.
                storeToken(null)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        restoreSession()
    }, [])

    // Called after a successful login/register response.
    function login(userData, token) {
        storeToken(token)
        setUser(userData)
    }

    async function logout() {
        try {
            await apiFetch("/auth/logout", { method: "POST" })
        } finally {
            storeToken(null)
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
