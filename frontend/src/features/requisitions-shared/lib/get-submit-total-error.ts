export const SUBMIT_SUBTOTAL_REQUIRED_MESSAGE =
    "A requisition must have a subtotal greater than zero before it can be submitted.";

export function getSubmitSubtotalError(subtotal: number): string | null {
    return subtotal > 0 ? null : SUBMIT_SUBTOTAL_REQUIRED_MESSAGE;
}