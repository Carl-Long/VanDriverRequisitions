"use client";

import { useRequireRole } from "@/hooks/use-require-role";
import { isAdmin } from "@/lib/auth/roles";
import { useAuth } from "@/providers/auth-provider";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user, loading } = useAuth();

    useRequireRole({
        user,
        loading,
        role: "admin",
        redirectTo: "/unauthorised",
    });

    if (loading || !isAdmin(user)) {
        return null;
    }

    return <>{children}</>;
}