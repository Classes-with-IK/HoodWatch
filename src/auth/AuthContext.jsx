import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { apiFetch, getStoredToken, storeToken, onUnauthorized } from "../lib/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [sessionExpired, setSessionExpired] = useState(false)

    const handleUnauthorized = useCallback(() => {
        setUser(null)
        setSessionExpired(true)
    }, [])

    useEffect(() => {
        onUnauthorized(handleUnauthorized)
    }, [handleUnauthorized])

    useEffect(() => {
        async function restoreSession() {
            const token = getStoredToken()

            if (!token) {
                setLoading(false)
                return
            }

            try {
                const response = await apiFetch("/auth/me")
                setUser(response.user ?? response.data?.user ?? response.data ?? null)
            } catch {
                // onUnauthorized already clears the token on a 401; this
                // catch just makes sure loading resolves either way.
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
        setSessionExpired(false)
        setUser(userData)
    }

    function clearSessionExpired() {
        setSessionExpired(false)
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
        sessionExpired,
        clearSessionExpired,
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
