"use client";

import { SearchX } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button/button";

export default function NotFoundPage() {
    const router = useRouter();

    return (
        <div className="flex h-full items-center justify-center p-6">
            <div className="max-w-md text-center">
                <div className="mb-6 flex justify-center">
                    <SearchX size={56} className="text-muted-foreground" />
                </div>

                <h1 className="text-2xl font-semibold">Page not found</h1>

                <p className="text-muted-foreground mt-3">
                    The page or resource you are looking for does not exist or may have been removed.
                </p>

                <div className="mt-6">
                    <Button onClick={() => router.push("/")}>Return to home</Button>
                </div>
            </div>
        </div>
    );
}
