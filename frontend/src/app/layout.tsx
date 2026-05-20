import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { AuthGate } from "@/components/auth/auth-gate";
import { AppShell } from "@/components/layout/app-shell";
import { ErrorBoundary } from "@/components/layout/error-boundary";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Van Driver Requisitions",
    description: "Manage van driver requisitions and process payments",
    keywords: ["van drivers", "requisitions", "payments", "management"],
    authors: [{ name: "Van Driver Team" }],
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className={inter.variable}>
            <body>
                <ErrorBoundary>
                    <ThemeProvider>
                        <AuthProvider>
                            <AuthGate>
                                <AppShell>{children}</AppShell>
                            </AuthGate>
                        </AuthProvider>
                    </ThemeProvider>
                </ErrorBoundary>
            </body>
        </html>
    );
}