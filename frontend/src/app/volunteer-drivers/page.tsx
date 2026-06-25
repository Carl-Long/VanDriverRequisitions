import Link from "next/link";
import { ArrowLeft, HeartHandshake } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { cn } from "@/lib/utils";

export default function VolunteerDriversPage() {
    return (
        <PageContainer>
            <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-2xl items-center justify-center">
                <section
                    className={cn(
                        "w-full rounded-2xl border border-border bg-surface p-8 text-center",
                        "card-shadow",
                    )}
                >
                    <div
                        className={cn(
                            "mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl",
                            "border border-primary-border bg-primary-surface text-primary",
                        )}
                    >
                        <HeartHandshake size={26} strokeWidth={1.75} />
                    </div>

                    <h1 className="text-xl font-semibold tracking-tight text-foreground">
                        Volunteer Van Drivers
                    </h1>

                    <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                        This workspace has not been implemented yet. Home and Standard van driver
                        requisitions are available from the main dashboard.
                    </p>

                    <Link
                        href="/"
                        className={cn(
                            "mt-6 inline-flex items-center gap-2 rounded-lg",
                            "border border-border bg-surface-elevated px-4 py-2",
                            "text-sm font-medium text-foreground",
                            "transition hover:bg-surface-hover",
                        )}
                    >
                        <ArrowLeft size={15} />
                        Back to dashboard
                    </Link>
                </section>
            </div>
        </PageContainer>
    );
}