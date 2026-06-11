"use client";

import { useRequireCapability } from "@/hooks/use-require-capability";
import { canManageConfiguration } from "@/features/auth/roles";
import { useAuth } from "@/providers/auth-provider";

export default function AdminLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
    const { user, loading } = useAuth();

    useRequireCapability({ user, loading, allowed: canManageConfiguration, redirectTo: "/unauthorised" });

    if (loading || !canManageConfiguration(user)) {
        return null;
    }

    return <>{children}</>;
}