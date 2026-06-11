"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";

import { ToastHost } from "@/components/ui/toast/toast";
import { ToastContextValue, Toast, ToastVariant } from "@/components/ui/toast/toast-types";

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4000;
const MAX_TOASTS = 3;

export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const idRef = useRef(0);

    const dismiss = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const show = useCallback(
        (message: string, variant: ToastVariant = "info") => {
            const id = ++idRef.current;

            setToasts((prev) => {
                const next = [...prev, { id, message, variant }];
                return next.slice(-MAX_TOASTS);
            });

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
            <ToastHost toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx;
}
