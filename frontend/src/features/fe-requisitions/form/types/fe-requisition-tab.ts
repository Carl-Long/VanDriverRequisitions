export type FeRequisitionTab =
  | {
    type: "details";
    key: "details";
    label: "Details";
  }

  | {
    type: "general-task";
    key: string;
    taskTypeId: string;
    label: string;
  }

  | {
    type: "mileage";
    key: "mileage";
    label: "Mileage";
  }

  | {
    type: "transfers";
    key: "transfers";
    label: "Transfers";
  }

  | {
    type: "additional-costs";
    key: "additional-costs";
    label: "Additional Costs";
  }
  | {
    type: "submission-history";
    key: "submission-history"
    label: string;
  }
