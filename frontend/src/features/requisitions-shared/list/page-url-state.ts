export function pageFromSearchParams(searchParams: URLSearchParams): number {
    const page = Number(searchParams.get("page"));

    if (!Number.isInteger(page) || page < 1) {
        return 1;
    }

    return page;
}

export function pageSizeFromSearchParams(
    searchParams: URLSearchParams,
    defaultPageSize: number,
    allowedPageSizes: readonly number[],
): number {
    const pageSize = Number(searchParams.get("pageSize"));

    if (
        !Number.isInteger(pageSize) ||
        !allowedPageSizes.includes(pageSize)
    ) {
        return defaultPageSize;
    }

    return pageSize;
}

export function appendPageSearchParam(params: URLSearchParams, page: number) {
    if (page > 1) {
        params.set("page", String(page));
    }
}

export function appendPageSizeSearchParam(
    params: URLSearchParams,
    pageSize: number,
    defaultPageSize: number,
) {
    if (pageSize !== defaultPageSize) {
        params.set("pageSize", String(pageSize));
    }
}