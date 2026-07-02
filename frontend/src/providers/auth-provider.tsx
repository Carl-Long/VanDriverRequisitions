"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useSyncExternalStore,
    type ReactNode,
} from "react";

import { configureAuth } from "@/lib/api/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:50815";

export type AuthUser = {
    id: string;
    name: string;
    email: string;
    roles: string[];
    initial: string;
};

type AuthState = {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    login: (email: string) => Promise<void>;
    logout: () => void;
};

type AuthSessionState = {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
};

type LoginResponse = {
    access_token: string;
};

const AuthContext = createContext<AuthState | null>(null);

const TOKEN_KEY = "dev-auth-token";
const USER_KEY = "dev-auth-user";

const SERVER_AUTH_SESSION: AuthSessionState = {
    user: null,
    token: null,
    loading: true,
};

const EMPTY_AUTH_SESSION: AuthSessionState = {
    user: null,
    token: null,
    loading: false,
};

const authSessionListeners = new Set<() => void>();

let authSessionSnapshot: AuthSessionState | null = null;

function clearStoredAuthSession() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
}

function readStoredAuthSession(): AuthSessionState {
    if (globalThis.window === undefined) {
        return SERVER_AUTH_SESSION;
    }

    try {
        const savedToken = sessionStorage.getItem(TOKEN_KEY);
        const savedUser = sessionStorage.getItem(USER_KEY);

        if (!savedToken || !savedUser) {
            return EMPTY_AUTH_SESSION;
        }

        return {
            token: savedToken,
            user: JSON.parse(savedUser) as AuthUser,
            loading: false,
        };
    } catch {
        clearStoredAuthSession();

        return EMPTY_AUTH_SESSION;
    }
}

function getAuthSessionSnapshot(): AuthSessionState {
    authSessionSnapshot ??= readStoredAuthSession();

    return authSessionSnapshot;
}

function getServerAuthSessionSnapshot(): AuthSessionState {
    return SERVER_AUTH_SESSION;
}

function subscribeToAuthSession(listener: () => void) {
    authSessionListeners.add(listener);

    return () => {
        authSessionListeners.delete(listener);
    };
}

function emitAuthSessionChanged() {
    authSessionListeners.forEach((listener) => listener());
}

function saveAuthSession(token: string, user: AuthUser) {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));

    authSessionSnapshot = {
        token,
        user,
        loading: false,
    };

    emitAuthSessionChanged();
}

function removeAuthSession() {
    clearStoredAuthSession();

    authSessionSnapshot = EMPTY_AUTH_SESSION;

    emitAuthSessionChanged();
}

function parseJwt(token: string): Record<string, unknown> {
    const payload = token.split(".")[1];

    if (!payload) {
        return {};
    }

    const base64 = payload.replaceAll('-', "+").replaceAll('_', "/");
    const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        "=",
    );

    return JSON.parse(atob(padded));
}

function toStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === "string");
    }

    if (typeof value === "string") {
        return [value];
    }

    return [];
}

function userFromToken(token: string): AuthUser {
    const claims = parseJwt(token);

    const name = typeof claims.name === "string" ? claims.name : "Unknown";
    const roleClaim =
        claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    return {
        id: typeof claims.oid === "string" ? claims.oid : "",
        name,
        email:
            typeof claims.preferred_username === "string"
                ? claims.preferred_username
                : "",
        roles: toStringArray(roleClaim),
        initial: name.charAt(0).toUpperCase(),
    };
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
    const authSession = useSyncExternalStore(
        subscribeToAuthSession,
        getAuthSessionSnapshot,
        getServerAuthSessionSnapshot,
    );

    const { token, user, loading } = authSession;
    const tokenRef = useRef<string | null>(token);

    useEffect(() => {
        tokenRef.current = token;
    }, [token]);

    const logout = useCallback(() => {
        tokenRef.current = null;
        removeAuthSession();
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

        const data = (await res.json()) as LoginResponse;
        const accessToken = data.access_token;
        const authUser = userFromToken(accessToken);

        tokenRef.current = accessToken;
        saveAuthSession(accessToken, authUser);
    }, []);

    useEffect(() => {
        configureAuth(() => tokenRef.current, logout);
    }, [logout]);

    const value = useMemo(
        () => ({
            user,
            token,
            loading,
            login,
            logout,
        }),
        [user, token, loading, login, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
    const ctx = useContext(AuthContext);

    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return ctx;
}