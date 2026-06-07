"use client";

import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

const STORAGE_KEY = "text-size";

export const TEXT_SIZES = [
    "default",
    "large",
    "extra-large",
    "largest",
] as const;

export type TextSize = (typeof TEXT_SIZES)[number];

interface ContextValue {
    textSize: TextSize;
    setTextSize: (size: TextSize) => void;
}

const TextSizeContext = createContext<ContextValue | null>(null);

function isTextSize(value: string): value is TextSize {
    return TEXT_SIZES.includes(value as TextSize);
}

function getInitialTextSize(): TextSize {
    if (globalThis.window === undefined) {
        return "default";
    }

    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved && isTextSize(saved)) {
        return saved;
    }

    return "default";
}

export function TextSizeProvider({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    const [textSize, setTextSize] =
        useState<TextSize>(getInitialTextSize);

    useEffect(() => {
        document.documentElement.classList.remove(
            "text-size-default",
            "text-size-large",
            "text-size-extra-large",
            "text-size-largest"
        );

        document.documentElement.classList.add(
            `text-size-${textSize}`
        );

        localStorage.setItem(
            STORAGE_KEY,
            textSize
        );
    }, [textSize]);

    const value = useMemo(
        () => ({
            textSize,
            setTextSize,
        }),
        [textSize]
    );

    return (
        <TextSizeContext.Provider value={value}>
            {children}
        </TextSizeContext.Provider>
    );
}

export function useTextSize() {
    const context = useContext(TextSizeContext);

    if (!context) {
        throw new Error(
            "useTextSize must be used within TextSizeProvider"
        );
    }

    return context;
}