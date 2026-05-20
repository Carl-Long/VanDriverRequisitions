"use client";

import React, { ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("Error boundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Something went wrong
            </h1>
            <p className="mt-2 text-muted-foreground">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 transition"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
