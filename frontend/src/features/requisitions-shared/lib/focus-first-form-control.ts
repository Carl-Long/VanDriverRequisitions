const focusableFormControlSelector = [
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "button:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
].join(",");

export function focusFirstFormControl(form: HTMLFormElement | null) {
    if (!form) {
        return;
    }

    globalThis.requestAnimationFrame(() => {
        const firstControl = form.querySelector<HTMLElement>(focusableFormControlSelector);

        firstControl?.focus();

        if (firstControl instanceof HTMLInputElement) {
            firstControl.select();
        }
    });
}