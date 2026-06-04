export type ToastVariant = "success" | "error" | "info";

export type Toast = {
    id: number;
    message: string;
    variant: ToastVariant;
};

export type ToastContextValue = {
    show: (message: string, variant?: ToastVariant) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
};