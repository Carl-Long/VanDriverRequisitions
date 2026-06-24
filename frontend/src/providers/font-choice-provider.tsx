"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode, } from "react";
import { DEFAULT_FONT_CHOICE, FONT_CHOICES, type FontChoiceValue, } from "@/lib/constants/constants";

const STORAGE_KEY = "font-choice";

interface ContextValue {
    fontChoice: FontChoiceValue;
    setFontChoice: (fontChoice: FontChoiceValue) => void;
}

const FontChoiceContext = createContext<ContextValue | null>(null);

function isFontChoice(value: string): value is FontChoiceValue {
    return FONT_CHOICES.some((choice) => choice.value === value);
}

function getInitialFontChoice(): FontChoiceValue {
    if (globalThis.window === undefined) {
        return DEFAULT_FONT_CHOICE;
    }

    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved && isFontChoice(saved)) {
        return saved;
    }

    return DEFAULT_FONT_CHOICE;
}

export function FontChoiceProvider({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    const [fontChoice, setFontChoice] =
        useState<FontChoiceValue>(getInitialFontChoice);

    useEffect(() => {
        document.documentElement.classList.remove(
            ...FONT_CHOICES.map((choice) => `font-choice-${choice.value}`),
        );

        document.documentElement.classList.add(`font-choice-${fontChoice}`);

        localStorage.setItem(STORAGE_KEY, fontChoice);
    }, [fontChoice]);

    const value = useMemo(
        () => ({
            fontChoice,
            setFontChoice,
        }),
        [fontChoice],
    );

    return (
        <FontChoiceContext.Provider value={value}>
            {children}
        </FontChoiceContext.Provider>
    );
}

export function useFontChoice() {
    const context = useContext(FontChoiceContext);

    if (!context) {
        throw new Error("useFontChoice must be used within FontChoiceProvider");
    }

    return context;
}