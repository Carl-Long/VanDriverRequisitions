// lib/api/client.ts

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:50815";

let tokenAccessor: (() => string | null) | null = null;
let unauthorizedHandler: (() => void) | null = null;

/**
 * Configure auth integration without circular dependencies.
 */
export function configureAuth(
    getToken: () => string | null,
    onUnauthorized: () => void,
) {
    tokenAccessor = getToken;
    unauthorizedHandler = onUnauthorized;
}

/**
 * Strongly typed API error.
 */
export class ApiError extends Error {
    status: number;
    detail?: string;
    errors?: Record<string, string[]>;

    constructor({
        title,
        status,
        detail,
        errors,
    }: {
        title: string;
        status: number;
        detail?: string;
        errors?: Record<string, string[]>;
    }) {
        super(title);

        this.name = "ApiError";
        this.status = status;
        this.detail = detail;
        this.errors = errors;
    }
}

/**
 * Override RequestInit.body so callers can pass plain objects.
 */
type ApiFetchOptions = Omit<RequestInit, "body"> & {
    body?: unknown;
    json?: boolean;
};

function buildUrl(path: string): string {
    if (path.startsWith("http")) {
        return path;
    }

    return `${API_BASE_URL}${path}`;
}

async function parseResponseBody(response: Response): Promise<any> {
    // No Content
    if (response.status === 204) {
        return undefined;
    }

    const contentType = response.headers.get("content-type");

    // No response body
    if (!contentType) {
        return undefined;
    }

    // JSON response
    if (contentType.includes("application/json")) {
        const text = await response.text();

        if (!text) {
            return undefined;
        }

        return JSON.parse(text);
    }

    // Fallback to plain text
    return response.text();
}

async function buildApiError(response: Response): Promise<ApiError> {
    let body: any = null;

    try {
        body = await parseResponseBody(response);
    } catch {
        body = null;
    }

    return new ApiError({
        title:
            body?.title ||
            body?.message ||
            `Request failed with status ${response.status}`,
        status: response.status,
        detail: body?.detail,
        errors: body?.errors,
    });
}

export function getApiErrorMessage(
    error: unknown,
    fallback: string,
): string {
    if (error instanceof ApiError) {
        const validationMessages = error.errors
            ? Object.values(error.errors)
                .flat()
                .filter(Boolean)
            : [];

        if (validationMessages.length > 0) {
            return validationMessages.join("\n");
        }

        return error.detail || error.message || fallback;
    }

    return fallback;
}

/**
 * Centralized API client.
 */
export async function apiFetch<T>(
    path: string,
    options: ApiFetchOptions = {},
): Promise<T> {
    const {
        json = true,
        headers: incomingHeaders,
        body,
        ...rest
    } = options;

    const headers = new Headers(incomingHeaders);

    // Attach bearer token
    const token = tokenAccessor?.();

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    // Transform body
    let finalBody: BodyInit | undefined;

    if (body != null) {
        const isFormData = body instanceof FormData;
        const isBlob = body instanceof Blob;
        const isString = typeof body === "string";

        if (json && !isFormData && !isBlob && !isString) {
            headers.set("Content-Type", "application/json");
            finalBody = JSON.stringify(body);
        } else {
            finalBody = body as BodyInit;
        }
    }

    const response = await fetch(buildUrl(path), {
        ...rest,
        headers,
        body: finalBody,

        /**
         * Prevent stale authenticated requests
         * in Next.js App Router.
         */
        cache: "no-store",
    });

    // Handle unauthorized globally
    if (response.status === 401) {
        unauthorizedHandler?.();

        throw new ApiError({
            title: "Unauthorized",
            status: 401,
            detail: "Your session has expired. Please sign in again.",
        });
    }

    // Handle failed responses
    if (!response.ok) {
        const error = await buildApiError(response);
        console.log(error);
        throw error;
        //throw await buildApiError(response);
    }

    return (await parseResponseBody(response)) as T;
}