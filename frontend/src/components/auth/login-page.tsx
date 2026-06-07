"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { LogIn } from "lucide-react";
import { Alert } from "../ui/alert";
import { getApiErrorMessage } from "@/lib/api/client";
import { Button } from "../ui/button/button";

const DEV_ACCOUNTS = [
    { label: "Admin User", email: "admin@test.com" },
    { label: "Standard User", email: "user@test.com" },
    { label: "Approver User", email: "approver@test.com" },
    { label: "Super User (All Roles)", email: "superuser@test.com" },
] as const;

export function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!email.trim()) {
            setError("Email is required.");
            return;
        }
        setError(null);
        setLoading(true);
        try {
            await login(email.trim());
        } catch (err) {
            setError(
                getApiErrorMessage(
                    err,
                    "Failed to reach API. Is it running?",
                ),
            );
        } finally {
            setLoading(false);
        }
    }

    function handleQuickLogin(account: string) {
        setEmail(account);
        setError(null);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-sm">
                {/* Brand header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
                        V
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Sign in
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Van Driver Requisitions
                    </p>
                </div>

                {/* Login card */}
                <div className="rounded-2xl border border-border bg-surface p-6 card-shadow">
                    <Alert tone="info">
                        This development version uses mock sign-in accounts.
                        Production users will be redirected to Microsoft Entra ID.
                    </Alert>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1.5 block text-sm font-medium text-foreground"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                autoComplete="email"
                                className={cn(
                                    "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground",
                                    "placeholder:text-muted-foreground",
                                    "focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-ring/20",
                                    "transition-colors",
                                )}
                            />
                        </div>

                        {error && (
                            <Alert>
                                {error}
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full"
                        >
                            <LogIn size={16} />
                            Sign in
                        </Button>
                    </form>

                    {/* Dev quick-login buttons */}
                    <div className="mt-5 border-t border-border pt-4">
                        <p className="mb-3 text-xs font-medium text-muted-foreground">
                            Development accounts
                        </p>
                        <div className="flex flex-col gap-2">
                            {DEV_ACCOUNTS.map((account) => (
                                <button
                                    key={account.email}
                                    type="button"
                                    onClick={() =>
                                        handleQuickLogin(account.email)
                                    }
                                    className={cn(
                                        "flex items-center justify-between rounded-lg border border-border px-3 py-2",
                                        "text-sm text-foreground transition hover:bg-muted cursor-pointer",
                                    )}
                                >
                                    <span>{account.label}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {account.email}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                    Development mode &mdash; simulating Entra ID login
                </p>
            </div>
        </div>
    );
}
