"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { Check, X, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type Toast = {
    id: number;
    message: string;
    variant: ToastVariant;
};

type ToastContextValue = {
    show: (message: string, variant?: ToastVariant) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4000;

const variantConfig: Record<ToastVariant, { icon: typeof Check; className: string }> = {
    success: {
        icon: Check,
        className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    },
    error: {
        icon: AlertCircle,
        className: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
    },
    info: {
        icon: Info,
        className: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    },
};

export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const idRef = useRef(0);

    const dismiss = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const show = useCallback(
        (message: string, variant: ToastVariant = "info") => {
            const id = ++idRef.current;
            setToasts((prev) => [...prev, { id, message, variant }]);
            setTimeout(() => dismiss(id), TOAST_DURATION_MS);
        },
        [dismiss],
    );

    const value = useMemo<ToastContextValue>(
        () => ({
            show,
            success: (m) => show(m, "success"),
            error: (m) => show(m, "error"),
            info: (m) => show(m, "info"),
        }),
        [show],
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div
                className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
                aria-live="polite"
            >
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({
    toast,
    onDismiss,
}: Readonly<{ toast: Toast; onDismiss: () => void }>) {
    const [visible, setVisible] = useState(false);
    const { icon: Icon, className } = variantConfig[toast.variant];

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10);
        return () => clearTimeout(t);
    }, []);

    return (
        <div
            className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur",
                "transition-all duration-200",
                visible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
                className,
            )}
            role="status"
        >
            <Icon size={18} className="mt-0.5 shrink-0" />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
                type="button"
                onClick={onDismiss}
                className="rounded p-0.5 opacity-70 transition hover:opacity-100"
                aria-label="Dismiss"
            >
                <X size={14} />
            </button>
        </div>
    );
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx;
}
