const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
].join(",");

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => {
            const style = globalThis.getComputedStyle(element);

            return (
                style.display !== "none" &&
                style.visibility !== "hidden" &&
                element.getClientRects().length > 0
            );
        },
    );
}