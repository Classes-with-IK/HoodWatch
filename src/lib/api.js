const BASE_URL = "https://1-community-watch-api.vercel.app/api/v1"

// The API sets an httpOnly session cookie automatically on register/login
// (cookie name: community_watch_token). That cookie is invisible to
// JavaScript by design, and the browser attaches it to every request on
// its own as long as `credentials: "include"` is set — so there is no
// token to read, store, or guess the shape of. This is deliberately the
// entire auth mechanism: no localStorage, no Authorization header.
export function extractUser(payload) {
    if (!payload || typeof payload !== "object") return null

    return payload.user ?? payload.data?.user ?? payload.data ?? null
}

export async function apiFetch(path, options = {}) {
    const response = await fetch(BASE_URL + path, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    })

    // Some endpoints (e.g. logout) may return no body at all.
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
