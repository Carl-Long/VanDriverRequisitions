import { FeRequisitionQuery } from "@/features/fe-requisitions/types/fe-requisition.types";
import { CreatedByFilter } from "@/features/requisitions-shared/components/filter-fields/created-by-user-filter-field";

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
