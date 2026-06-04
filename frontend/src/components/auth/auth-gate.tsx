"use client";

import { type ReactNode } from "react";
import { useAuth } from "@/providers/auth-provider";
import { LoginPage } from "@/components/auth/login-page";

export function AuthGate({
    children,
}: Readonly<{ children: ReactNode }>) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-2 border-border border-t-primary animate-spin" />
                    <p className="text-muted-foreground font-medium text-sm">
                        Checking session...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }

    return <>{children}</>;
}
