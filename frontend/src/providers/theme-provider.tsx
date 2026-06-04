"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";
import { THEME_OPTIONS, DEFAULT_THEME } from "@/lib/constants";

export function ThemeProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <NextThemesProvider
      {...THEME_OPTIONS}
      defaultTheme={DEFAULT_THEME}
    >
      {children}
    </NextThemesProvider>
  );
}