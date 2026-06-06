import { AuthUser } from "@/providers/auth-provider";

export const Roles = {
    Admin: "admin",
    User: "user",
    Approver: "approver",
} as const;

export function hasRole(
    user: AuthUser | null | undefined,
    role: string,
): boolean {
    return (
        user?.roles
            ?.map((x) => x.toLowerCase())
            .includes(role.toLowerCase()) ?? false
    );
}

export function isAdmin(user?: AuthUser | null): boolean {
    return hasRole(user, Roles.Admin);
}

export function isUser(user?: AuthUser | null): boolean {
    return hasRole(user, Roles.User);
}

export function isApprover(user?: AuthUser | null): boolean {
    return hasRole(user, Roles.Approver);
}