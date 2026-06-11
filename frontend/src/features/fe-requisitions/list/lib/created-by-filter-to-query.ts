import { FeRequisitionQuery } from "@/features/fe-requisitions/types/fe-requisition.types";
import { CreatedByFilter } from "@/features/fe-requisitions/types/fe-requisiton-filters.types";

export function mapCreatedByFilterToQuery(
    filter: CreatedByFilter,
    currentUserId: string,
): Pick<FeRequisitionQuery, "createdByUserId"> {
    if (filter.type === "me") {
        return {
            createdByUserId: currentUserId,
        };
    }

    if (filter.type === "user") {
        return {
            createdByUserId: filter.userId,
        };
    }

    return {};
}
