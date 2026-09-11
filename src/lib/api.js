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
