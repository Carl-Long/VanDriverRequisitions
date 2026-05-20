"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Oops! Something went wrong
        </h1>
        <p className="mt-2 text-muted-foreground">
          {error.message || "An unexpected error occurred"}
        </p>
        <button
          onClick={() => reset()}
          className="mt-4 rounded-lg bg-primary px-6 py-2 text-primary-foreground hover:opacity-90 transition font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
