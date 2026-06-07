"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/providers/auth-provider";

type Props = {
    user: AuthUser | null;
    loading: boolean;
    allowed: (user?: AuthUser | null) => boolean;
    redirectTo?: string;
};

export function useRequireCapability({
    user,
    loading,
    allowed,
    redirectTo = "/unauthorised",
}: Readonly<Props>) {
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!allowed(user)) {
            router.replace(redirectTo);
        }
    }, [user, loading, allowed, redirectTo, router]);
}