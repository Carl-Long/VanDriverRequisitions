export function getSafeReturnTo(
    value: string | null,
    allowedPrefixes: readonly string[],
    fallback: string,
): string {
    if (!value) {
        return fallback;
    }

    try {
        const decoded = decodeURIComponent(value);

        if (decoded.startsWith("//")) {
            return fallback;
        }

        return allowedPrefixes.some((prefix) => decoded.startsWith(prefix))
            ? decoded
            : fallback;
    } catch {
        return fallback;
    }
}

export function getCurrentPathWithSearch(pathname: string, searchParams: URLSearchParams): string {
    const queryString = searchParams.toString();
    
    return queryString ? `${pathname}?${queryString}` : pathname;
}

export function withReturnTo(href: string, returnTo?: string | null): string {
    if (!returnTo) {
        return href;
    }

    const separator = href.includes("?") ? "&" : "?";

    return `${href}${separator}returnTo=${encodeURIComponent(returnTo)}`;
}