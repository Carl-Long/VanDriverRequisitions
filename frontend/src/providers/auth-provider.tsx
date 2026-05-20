"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { configureAuth } from "@/lib/api/client";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:50815";

export type AuthUser = {
    name: string;
    email: string;
    role: string;
    initial: string;
};

type AuthState = {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    login: (email: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

const TOKEN_KEY = "dev-auth-token";
const USER_KEY = "dev-auth-user";

function parseJwt(token: string): Record<string, string> {
    const base64 = token.split(".")[1];
    const json = atob(base64);
    return JSON.parse(json);
}

function userFromToken(token: string): AuthUser {
    const claims = parseJwt(token);
    const name = claims.name ?? "Unknown";
    return {
        name,
        email: claims.preferred_username ?? "",
        role:
            claims[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ] ?? "User",
        initial: name.charAt(0).toUpperCase(),
    };
}

export function AuthProvider({
    children,
}: Readonly<{ children: ReactNode }>) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const tokenRef = useRef<string | null>(null);

    // Restore session from storage on mount
    useEffect(() => {
        const savedToken = sessionStorage.getItem(TOKEN_KEY);
        const savedUser = sessionStorage.getItem(USER_KEY);
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
            tokenRef.current = savedToken;
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (email: string) => {
        const res = await fetch(`${API_BASE_URL}/dev/auth/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        if (!res.ok) {
            const body = await res.json().catch(() => null);
            throw new Error(
                body?.detail ?? "Invalid credentials. Please try again.",
            );
        }

        const data = await res.json();
        const accessToken: string = data.access_token;
        const authUser = userFromToken(accessToken);

        sessionStorage.setItem(TOKEN_KEY, accessToken);
        sessionStorage.setItem(USER_KEY, JSON.stringify(authUser));

        tokenRef.current = accessToken;
        setToken(accessToken);
        setUser(authUser);
    }, []);

    const logout = useCallback(() => {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
        tokenRef.current = null;
        setToken(null);
        setUser(null);
    }, []);

    // Wire auth into the API client (runs once)
    useEffect(() => {
        configureAuth(() => tokenRef.current, logout);
    }, [logout]);

    const value = useMemo(
        () => ({ user, token, loading, login, logout }),
        [user, token, loading, login, logout],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth(): AuthState {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
