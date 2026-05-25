export type Tone =
    | "default"
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "info"
    | "warning"
    | "danger";

export type Variant = "solid" | "outline" | "ghost";


export const toneMap: Record<
    Tone,
    Record<Variant, string>
> = {
    primary: {
        solid: "bg-primary text-primary-foreground hover:opacity-90",
        outline: "border border-primary text-primary hover:bg-primary-surface-hover",
        ghost: "text-primary hover:bg-primary-surface-hover",
    },

    secondary: {
        solid: "bg-secondary text-secondary-foreground hover:opacity-90",
        outline: "border border-secondary text-secondary hover:bg-secondary-surface-hover",
        ghost: "text-secondary hover:bg-secondary-surface-hover",
    },

    accent: {
        solid: "bg-accent text-accent-foreground hover:opacity-90",
        outline: "border border-accent text-accent hover:bg-accent-surface-hover",
        ghost: "text-accent hover:bg-accent-surface-hover",
    },

    success: {
        solid: "bg-success text-success-foreground hover:opacity-90",
        outline: "border border-success text-success hover:bg-success-surface-hover",
        ghost: "text-success hover:bg-success-surface-hover",
    },

    info: {
        solid: "bg-info text-info-foreground hover:opacity-90",
        outline: "border border-info text-info hover:bg-info-surface-hover",
        ghost: "text-info hover:bg-info-surface-hover",
    },

    warning: {
        solid: "bg-warning text-warning-foreground hover:opacity-90",
        outline: "border border-warning text-warning hover:bg-warning-surface-hover",
        ghost: "text-warning hover:bg-warning-surface-hover",
    },

    danger: {
        solid: "bg-danger text-danger-foreground hover:opacity-90",
        outline: "border border-danger text-danger hover:bg-danger-surface-hover",
        ghost: "text-danger hover:bg-danger-surface-hover",
    },

    default: {
        solid: "bg-surface text-foreground hover:bg-surface-hover",
        outline: "border border-border text-foreground hover:bg-surface-hover",
        ghost: "text-foreground hover:bg-surface-hover",
    },
};