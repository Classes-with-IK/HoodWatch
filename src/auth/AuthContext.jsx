import { createContext, useContext, useEffect, useState } from "react"
import { apiFetch } from "../lib/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function restoreSession() {
            try {
                const response = await apiFetch("/auth/me")

                setUser(response.user)
            } catch {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        restoreSession()
    }, [])
    
    async function logout() {
        try {
            await apiFetch("/auth/logout", {
                method: "POST",
            })
        } finally {
            setUser(null)
        }
    }

    const value = {
        user,
        setUser,
        loading,
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