const BASE_URL = "https://1-community-watch-api.vercel.app/api/v1"

// In-memory only (never persisted): falls back to Authorization: Bearer when
// the browser won't retain the cross-site httpOnly cookie (third-party
// cookie blocking, webviews, Safari ITP). The API issues this token
// alongside the cookie on login/register for exactly this case.
let authToken = null

export function setAuthToken(token) {
    authToken = token || null
}

export function clearAuthToken() {
    authToken = null
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
