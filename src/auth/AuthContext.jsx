import { createContext, useContext, useEffect, useState } from "react"
import { apiFetch, extractUser, setAuthToken, clearAuthToken } from "../lib/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        try {
            localStorage.removeItem("hoodwatch_token")
        } catch {
            /* empty */
        }

        async function restoreSession() {
            try {
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

    function login(userData, token) {
        setAuthToken(token)
        setUser(userData)
    }

    async function logout() {
        try {
            await apiFetch("/auth/logout", { method: "POST" })
        } finally {
            clearAuthToken()
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
