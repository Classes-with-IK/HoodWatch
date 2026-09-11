const BASE_URL = "https://1-community-watch-api.vercel.app/api/v1"

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
