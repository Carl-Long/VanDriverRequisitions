import type { CreatedByFilter } from "@/features/requisitions-shared/components/filter-fields/created-by-user-filter-field";

export function createdByFromSearchParams(
    searchParams: URLSearchParams,
): CreatedByFilter {
    const createdBy = searchParams.get("createdBy");

    if (createdBy === "any") {
        return {
            type: "any",
        };
    }

    if (createdBy === "user") {
        const userId = searchParams.get("createdByUserId");
        const label = searchParams.get("createdByLabel") ?? "";

        if (userId) {
            return {
                type: "user",
                userId,
                label,
            };
        }
    }

    return {
        type: "me",
    };
}

export function appendCreatedBySearchParams(
    params: URLSearchParams,
    createdBy: CreatedByFilter,
) {
    switch (createdBy.type) {
        case "any":
            params.set("createdBy", "any");
            break;

        case "user":
            params.set("createdBy", "user");
            params.set("createdByUserId", createdBy.userId);
            params.set("createdByLabel", createdBy.label);
            break;

        case "me":
        default:
            break;
    }
}

export function createdByUserIdFromFilter(
    createdBy: CreatedByFilter,
    currentUserId: string,
): string | undefined {
    if (createdBy.type === "me") {
        return currentUserId;
    }

    if (createdBy.type === "user") {
        return createdBy.userId;
    }

    return undefined;
}