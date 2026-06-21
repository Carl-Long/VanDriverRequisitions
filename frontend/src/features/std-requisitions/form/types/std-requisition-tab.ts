export type StdRequisitionTab =
    | {
        type: "details";
        key: "details";
        label: "Details";
    }
    | {
        type: "banks-and-bins";
        key: "collection-charges-banks-and-bins";
        label: "Banks & Bins Collections";
    }
    | {
        type: "van-packs";
        key: "collection-van-packs";
        label: "Van Pack Collections";
    }
    | {
        type: "pickups";
        key: "pickups";
        label: "Pickup Collections";
    }
    | {
        type: "transfers";
        key: "transfers";
        label: "Transfers";
    }
    | {
        type: "submission-history";
        key: "submission-history";
        label: string;
    };