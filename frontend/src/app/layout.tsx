import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { AppShell } from "@/components/layout/app-shell";
import { ErrorBoundary } from "@/components/layout/error-boundary";

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
    <html lang="en" suppressHydrationWarning>
      <body>
        <ErrorBoundary>
          <ThemeProvider>
            <AppShell>{children}</AppShell>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}