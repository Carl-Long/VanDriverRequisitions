"use client";

import React, { ReactNode } from "react";
import { ErrorDisplay } from "./error-display";

type ErrorBoundaryProps = {
    children: ReactNode;
};

type ErrorBoundaryState = {
    hasError: boolean;
    error?: Error;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
                <ErrorDisplay
                    message={this.state.error?.message}
                    onReset={() => this.setState({ hasError: false })}
                />
            );
        }

        return this.props.children;
    }
}
