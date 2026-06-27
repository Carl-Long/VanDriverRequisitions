"use client";

import { useState, type SubmitEvent } from "react";
import { LogIn } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button/button";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const DEV_ACCOUNTS = [
    {
        label: "Super User",
        email: "superuser@test.com",
        description: "Access all user, approver and admin functionality.",
    },
    {
        label: "Standard User",
        email: "user@test.com",
        description: "Create, edit, save and submit requisitions.",
    },
    {
        label: "Approver User",
        email: "approver@test.com",
        description: "Review submissions and approve or reject them.",
    },
    {
        label: "Admin User",
        email: "admin@test.com",
        description: "Manage configuration and limits.",
    },
] as const;

export function LoginPage() {
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function signIn(account: string) {
        setError(null);
        setLoading(true);

        try {
            await login(account);
        } catch (err) {
            setError(getApiErrorMessage(err, "Failed to reach API. Is it running?"));
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setError("Email is required.");
            return;
        }

        await signIn(trimmedEmail);
    }

    async function handleQuickLogin(account: string) {
        setEmail(account);
        await signIn(account);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                        V
                    </div>

                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Sign in
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Van Driver Requisitions
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-6 card-shadow">
                    <Alert tone="info">
                        This development version uses mock sign-in accounts. Production users will
                        be redirected to Microsoft Entra ID.
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
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="name@company.com"
                                autoComplete="email"
                                disabled={loading}
                                className={cn(
                                    "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground",
                                    "placeholder:text-muted-foreground",
                                    "focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-ring/20",
                                    "transition-colors",
                                    "disabled:cursor-not-allowed disabled:opacity-60",
                                )}
                            />
                        </div>

                        {error && <Alert>{error}</Alert>}

                        <Button type="submit" loading={loading} className="w-full">
                            <LogIn className="size-[1em]" />
                            Sign in
                        </Button>
                    </form>

                    <div className="mt-5 border-t border-border pt-4">
                        <p className="mb-3 text-xs font-medium text-muted-foreground">
                            Development accounts
                        </p>

                        <div className="flex flex-col gap-2">
                            {DEV_ACCOUNTS.map((account) => (
                                <button
                                    key={account.email}
                                    type="button"
                                    onClick={() => handleQuickLogin(account.email)}
                                    disabled={loading}
                                    className={cn(
                                        "cursor-pointer rounded-lg border border-border px-3 py-2.5 text-left transition",
                                        "hover:border-primary/30 hover:bg-muted",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        "disabled:cursor-not-allowed disabled:opacity-60",
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm font-medium text-foreground">
                                            {account.label}
                                        </span>

                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {account.email}
                                        </span>
                                    </div>

                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                        {account.description}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                    Development mode - simulating Entra ID login
                </p>
            </div>
        </div>
    );
}