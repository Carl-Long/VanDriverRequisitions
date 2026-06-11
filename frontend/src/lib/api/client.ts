const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:50815";

let tokenAccessor: (() => string | null) | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function configureAuth(getToken: () => string | null, onUnauthorized: () => void) {
    tokenAccessor = getToken;
    unauthorizedHandler = onUnauthorized;
}

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

type ApiFetchOptions = Omit<RequestInit, "body"> & {
    body?: unknown;
    json?: boolean;
};

type ProblemDetailsBody = {
    title?: string;
    message?: string;
    detail?: string;
    errors?: Record<string, string[]>;
};

function buildUrl(path: string): string {
    if (path.startsWith("http")) {
        return path;
    }

    return `${API_BASE_URL}${path}`;
}

function isProblemDetailsBody(body: unknown): body is ProblemDetailsBody {
    return typeof body === "object" && body !== null;
}

async function parseResponseBody(response: Response): Promise<unknown> {
    if (response.status === 204) {
        return undefined;
    }

    const contentType = response.headers.get("content-type");

    if (!contentType) {
        return undefined;
    }

    const text = await response.text();

    if (!text) {
        return undefined;
    }

    if (contentType.includes("application/json")) {
        return JSON.parse(text);
    }

    return text;
}

async function buildApiError(response: Response): Promise<ApiError> {
    let body: unknown;

    try {
        body = await parseResponseBody(response);
    } catch {
        body = undefined;
    }

    const problem = isProblemDetailsBody(body) ? body : undefined;

    return new ApiError({
        title:
            problem?.title || problem?.message || `Request failed with status ${response.status}`,
        status: response.status,
        detail: problem?.detail,
        errors: problem?.errors,
    });
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof ApiError) {
        const validationMessages = error.errors
            ? Object.values(error.errors).flat().filter(Boolean)
            : [];

        if (validationMessages.length > 0) {
            return validationMessages.join("\n");
        }

        return error.detail || error.message || fallback;
    }

    return fallback;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
    const { json = true, headers: incomingHeaders, body, ...rest } = options;

    const headers = new Headers(incomingHeaders);

    const token = tokenAccessor?.();

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

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
        cache: "no-store",
    });

    if (response.status === 401) {
        unauthorizedHandler?.();

        throw new ApiError({
            title: "Unauthorized",
            status: 401,
            detail: "Your session has expired. Please sign in again.",
        });
    }

    if (!response.ok) {
        throw await buildApiError(response);
    }

    return (await parseResponseBody(response)) as T;
}
