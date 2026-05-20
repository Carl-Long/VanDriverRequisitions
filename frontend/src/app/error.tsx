"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/layout/error-display";

export default function ErrorPage({
    error,
    reset,
}: Readonly<{
    error: Error & { digest?: string };
    reset: () => void;
}>) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <ErrorDisplay
            title="Oops! Something went wrong"
            message={error.message || "An unexpected error occurred"}
            onReset={reset}
        />
    );
}

