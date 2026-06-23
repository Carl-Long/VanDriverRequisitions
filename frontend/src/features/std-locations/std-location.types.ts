export type StdLocation = {
    id: string;

    shopId: string;
    shopCode: string;
    shopName: string;

    collectionTypeId: string;
    collectionTypeCode: string;
    collectionTypeName: string;

    locationName: string;
    postCode: string;

    isActive: boolean;

    createdAtUtc: string;
    createdByNameSnapshot: string;
    updatedAtUtc: string | null;
    updatedByNameSnapshot: string | null;
};

export type StdLocationLookup = {
    id: string;

    shopId: string;
    collectionTypeId: string;

    locationName: string;
    postCode: string;
};

export type StdLocationLookupQuery = {
    shopId: string;
    collectionTypeId: string;
};

export type StdLocationAdminQuery = {
    page?: number;
    pageSize?: number;
    search?: string | null;
    shopId?: string | null;
    collectionTypeId?: string | null;
    includeInactive?: boolean;
};

export type CreateStdLocation = {
    shopId: string;
    collectionTypeId: string;
    locationName: string;
    postCode: string;
};

export type UpdateStdLocation = CreateStdLocation;