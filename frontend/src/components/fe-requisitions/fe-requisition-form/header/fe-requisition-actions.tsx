export function FeRequisitionActions() {
    return (
        <div className="flex items-center gap-3">
            <button
                type="button"
                className="
                    rounded-xl border border-border
                    px-4 py-2 text-sm font-medium
                    hover:bg-muted
                "
            >
                Save Draft
            </button>

            <button
                type="button"
                className="
                    rounded-xl border border-border
                    px-4 py-2 text-sm font-medium
                    hover:bg-muted
                "
            >
                Save & Continue
            </button>

            <button
                type="button"
                className="
                    rounded-xl bg-primary
                    px-4 py-2 text-sm font-medium
                    text-primary-foreground
                    hover:opacity-90
                "
            >
                Submit
            </button>
        </div>
    );
}