const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:50815";

let tokenAccessor: (() => string | null) | null = null;
let logoutHandler: (() => void) | null = null;

/**
 * Called once by AuthProvider to wire token access into the API client
 * without creating a circular dependency.
 */
export function configureAuth(
    getToken: () => string | null,
    onUnauthorized: () => void,
) {
    tokenAccessor = getToken;
    logoutHandler = onUnauthorized;
}

export type ApiError = {
    title: string;
    status: number;
    detail?: string;
    errors?: Record<string, string[]>;
};

export async function apiFetch<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const token = tokenAccessor?.();

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        logoutHandler?.();
        const error: ApiError = {
            title: "Unauthorized",
            status: 401,
            detail: "Your session has expired. Please sign in again.",
        };
        throw error;
    }

    if (!res.ok) {
        const body = await res.json().catch(() => null);
        const error: ApiError = {
            title: body?.title ?? "Request failed",
            status: res.status,
            detail: body?.detail,
            errors: body?.errors,
        };
        throw error;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    if (res.status === 204) return undefined!;

    return res.json();
}
