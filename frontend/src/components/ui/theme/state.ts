export type FieldState = "default" | "error" | "success";

export const fieldStateMap: Record<FieldState, string> = {
    default: "focus-visible:ring-primary/20",

    error: "border-danger focus-visible:ring-danger/20",

    success: "border-success focus-visible:ring-success/20",
};
