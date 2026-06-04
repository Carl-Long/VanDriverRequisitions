
import { AuthUser } from "@/providers/auth-provider";

export const Roles = {
    Admin: "admin",
    User: "user",
} as const;

export function getRole(user?: AuthUser | null): string | null {
    return user?.role?.toLowerCase() ?? null;
}

export function isAdmin(user?: AuthUser | null): boolean {
    return getRole(user) === Roles.Admin;
}

export function hasRole(user: AuthUser | null | undefined, role: string) {
    return getRole(user) === role.toLowerCase();
}