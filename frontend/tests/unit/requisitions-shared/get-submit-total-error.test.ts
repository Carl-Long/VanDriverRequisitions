import { getSubmitSubtotalError, SUBMIT_SUBTOTAL_REQUIRED_MESSAGE } from "@/features/requisitions-shared/lib/get-submit-total-error";
import { describe, expect, it } from "vitest";

describe("getSubmitSubtotalError", () => {
    it("returns null when subtotal is greater than zero", () => {
        expect(getSubmitSubtotalError(0.01)).toBeNull();
        expect(getSubmitSubtotalError(1)).toBeNull();
        expect(getSubmitSubtotalError(100)).toBeNull();
    });

    it("returns an error when subtotal is zero", () => {
        expect(getSubmitSubtotalError(0)).toBe(SUBMIT_SUBTOTAL_REQUIRED_MESSAGE);
    });

    it("returns an error when subtotal is negative", () => {
        expect(getSubmitSubtotalError(-1)).toBe(SUBMIT_SUBTOTAL_REQUIRED_MESSAGE);
    });
});