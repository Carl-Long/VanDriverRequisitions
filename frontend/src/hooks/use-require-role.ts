"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AuthUser } from "@/providers/auth-provider";
import { hasRole } from "@/lib/auth/roles";

type Options = {
    user: AuthUser | null;
    loading: boolean;
    role: string;
    redirectTo?: string;
};

export function useRequireRole({
    user,
    loading,
    role,
    redirectTo = "/unauthorised",
}: Options) {
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!hasRole(user, role)) {
            router.replace(redirectTo);
        }
    }, [user, loading, role, redirectTo, router]);
}