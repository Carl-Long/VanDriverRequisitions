import { CreatedByFilter } from "@/components/fe-requisitions/types";
import { FeRequisitionQuery } from "./api/fe-requisitions";

export function mapCreatedByFilterToQuery(
    filter: CreatedByFilter,
    currentUserId: string
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