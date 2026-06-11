"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button/button";

export default function UnauthorisedPage() {
    return (
        <div className="flex h-full items-center justify-center p-6">
            <div className="max-w-md text-center">
                <div className="mb-6 flex justify-center">
                    <ShieldAlert size={56} className="text-muted-foreground" />
                </div>

                <h1 className="text-2xl font-semibold">Access denied</h1>

                <p className="text-muted-foreground mt-3">
                    You don't have permission to view this page.
                </p>

                <div className="mt-6">
                    <Button>
                        <Link href="/">Return to home</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
