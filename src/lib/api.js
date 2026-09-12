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
// and silently break auth if it's wrong, this checks common key names
// first, then any key whose name contains "token"/"jwt" anywhere in the
// payload, and finally falls back to scanning for a value shaped like a
// JWT (three dot-separated base64url segments).
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

    function scanByKeyName(value, depth = 0) {
        if (depth > 4 || !value || typeof value !== "object") return null

        for (const [key, nested] of Object.entries(value)) {
            const lowerKey = key.toLowerCase()

            if (
                typeof nested === "string" &&
                nested.length > 0 &&
                (lowerKey.includes("token") || lowerKey.includes("jwt"))
            ) {
                return nested
            }
        }

        for (const nested of Object.values(value)) {
            if (typeof nested === "object") {
                const found = scanByKeyName(nested, depth + 1)
                if (found) return found
            }
        }

        return null
    }

    const byKeyName = scanByKeyName(payload)
    if (byKeyName) return byKeyName

    const jwtPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/

    function scanByShape(value, depth = 0) {
        if (depth > 4 || value == null) return null

        if (typeof value === "string") {
            return jwtPattern.test(value) ? value : null
        }

        if (typeof value === "object") {
            for (const nested of Object.values(value)) {
                const found = scanByShape(nested, depth + 1)
                if (found) return found
            }
        }

        return null
    }

    return scanByShape(payload)
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

        // A 401 only means "your session has ended" if this request was
        // actually carrying a session (a stored bearer token) that the
        // server just rejected. A 401 on a request with no token attached
        // is almost always a login/register attempt with the wrong
        // credentials — that's a different problem, so leave the
        // backend's real message alone and don't touch any session state.
        if (response.status === 401 && token) {
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
