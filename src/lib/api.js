const BASE_URL = "https://1-community-watch-api.vercel.app/api/v1"
const TOKEN_KEY = "hoodwatch_token"

export function getStoredToken() {
    try {
        return localStorage.getItem(TOKEN_KEY)
    } catch {
        return null
    }
}

export function storeToken(token) {
    try {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token)
        } else {
            localStorage.removeItem(TOKEN_KEY)
        }
    } catch {
        // localStorage unavailable (private browsing, storage full, etc.)
    }
}

let unauthorizedHandler = null

// Lets AuthContext register a callback that fires whenever any request
// comes back unauthorized, so an expired/invalid session is handled in
// exactly one place instead of in every page that calls apiFetch.
export function onUnauthorized(handler) {
    unauthorizedHandler = handler
}

export function extractUser(payload) {
    if (!payload || typeof payload !== "object") return null

    return payload.user ?? payload.data?.user ?? payload.data ?? null
}

// The API's docs promise a JWT comes back on register/login, but don't
// specify the exact key it's returned under. Rather than guess one name
// and silently break auth if it's wrong, check the common key names first
// and fall back to scanning the payload for anything shaped like a JWT
// (three dot-separated base64url segments).
export function extractToken(payload) {
    if (!payload || typeof payload !== "object") return null

    const candidateKeys = [
        "token",
        "accessToken",
        "access_token",
        "jwt",
        "authToken",
        "auth_token",
        "sessionToken",
        "session_token",
    ]

    const sources = [payload, payload.data, payload.session, payload.auth]

    for (const source of sources) {
        if (!source || typeof source !== "object") continue

        for (const key of candidateKeys) {
            if (typeof source[key] === "string" && source[key].length > 0) {
                return source[key]
            }
        }
    }

    const jwtPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/

    function scan(value, depth = 0) {
        if (depth > 3 || value == null) return null

        if (typeof value === "string") {
            return jwtPattern.test(value) ? value : null
        }

        if (typeof value === "object") {
            for (const nested of Object.values(value)) {
                const found = scan(nested, depth + 1)
                if (found) return found
            }
        }

        return null
    }

    return scan(payload)
}

export async function apiFetch(path, options = {}) {
    const token = getStoredToken()

    const response = await fetch(BASE_URL + path, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    })

    // Some endpoints (e.g. logout) may return no body at all.
    const contentType = response.headers.get("content-type") || ""
    const hasJsonBody = contentType.includes("application/json")
    const body = hasJsonBody ? await response.json().catch(() => null) : null

    if (!response.ok) {
        let message =
            body?.message ||
            body?.error ||
            body?.detail ||
            `Request failed with status ${response.status}`

        if (response.status === 401) {
            // Whatever the backend's exact wording is ("invalid session",
            // "user no longer exists", "jwt expired"...), the person just
            // needs to sign in again — show one clear, friendly message.
            message = "Your session has ended. Please sign in again."
            storeToken(null)
            unauthorizedHandler?.()
        }

        const error = new Error(message)
        error.status = response.status
        throw error
    }

    return body ?? {}
}
