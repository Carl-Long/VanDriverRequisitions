"use client";

import { useAuth } from "@/providers/auth-provider";

export function WelcomeHeading() {
    const { user } = useAuth();
    const firstName = user?.name.split(" ")[0] ?? "User";

    return (
        <h1 className="font-semibold tracking-tight text-foreground sm:text-4xl">
            Welcome back,{" "}
            <span className="text-primary">{firstName}</span>
        </h1>
    );
}
