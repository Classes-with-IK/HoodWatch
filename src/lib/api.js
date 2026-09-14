const BASE_URL = "https://1-community-watch-api.vercel.app/api/v1"

// Falls back to Authorization: Bearer when the browser won't retain the
// cross-site httpOnly cookie (third-party cookie blocking, webviews, Safari
// ITP). The API issues this token alongside the cookie on login/register for
// exactly this case. Persisted in sessionStorage so the fallback survives a
// page reload, not just in-session navigation.
const TOKEN_STORAGE_KEY = "hoodwatch_token"

let authToken = readStoredToken()

function readStoredToken() {
    try {
        return sessionStorage.getItem(TOKEN_STORAGE_KEY) || null
    } catch {
        return null
    }
}

export function setAuthToken(token) {
    authToken = token || null
    try {
        if (authToken) {
            sessionStorage.setItem(TOKEN_STORAGE_KEY, authToken)
        } else {
            sessionStorage.removeItem(TOKEN_STORAGE_KEY)
        }
    } catch {
        /* empty */
    }
}

export function clearAuthToken() {
    authToken = null
    try {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY)
    } catch {
        /* empty */
    }
}

export function extractUser(payload) {
    if (!payload || typeof payload !== "object") return null

    return payload.user ?? payload.data?.user ?? payload.data ?? null
}

export function extractToken(payload) {
    if (!payload || typeof payload !== "object") return null

    return payload.token ?? payload.data?.token ?? null
}

export async function apiFetch(path, options = {}) {
    const response = await fetch(BASE_URL + path, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            ...options.headers,
        },
    })

    const contentType = response.headers.get("content-type") || ""
    const hasJsonBody = contentType.includes("application/json")
    const body = hasJsonBody ? await response.json().catch(() => null) : null

    if (!response.ok) {
        const message =
            body?.message ||
            body?.error ||
            body?.detail ||
            `Request failed with status ${response.status}`

        const error = new Error(message)
        error.status = response.status
        throw error
    }

    return body ?? {}
}
