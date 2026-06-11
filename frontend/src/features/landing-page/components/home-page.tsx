"use client";

import { PageContainer } from "@/components/layout/page-container";
import { canApproveRequisitions, canCreateRequisitions } from "@/features/auth/roles";
import { useAuth } from "@/providers/auth-provider";
import { HeartHandshake, Sofa, Shirt, ClipboardCheck } from "lucide-react";
import { LaunchCard, type LaunchCardProps } from "./launch-card";
import { WelcomeHeading } from "./welcome-heading";
import { SubmitWindowHeroCompact } from "@/features/submit-windows/components/submit-window-hero-compact";

const cards: LaunchCardProps[] = [
    {
        title: "Home Van Drivers",
        description: "Raise home van driver requisitions for FE stores",
        href: "/home-van-drivers",
        icon: Sofa,
    },
    {
        title: "Standard Van Drivers",
        description: "Raise and view requisitions for home and fashion stores",
        href: "/standard-drivers",
        icon: Shirt,
    },
    {
        title: "Volunteer Van Drivers",
        description: "Raise and view requisitions for volunteer drivers",
        href: "/volunteer-drivers",
        icon: HeartHandshake,
    },
];

export function HomePage() {
    const { user } = useAuth();

    const visibleCards: LaunchCardProps[] = [
        ...(canCreateRequisitions(user) ? cards : []),
        ...(canApproveRequisitions(user)
            ? [
                  {
                      title: "Home Van Driver Approvals",
                      description: "Review submitted FE requisitions awaiting approval",
                      href: "/home-van-drivers/approvals",
                      icon: ClipboardCheck,
                  },
              ]
            : []),
    ];

    return (
        <PageContainer>
            <section className="mx-auto mb-10 max-w-2xl text-center">
                <WelcomeHeading userName={user?.name} />

                <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                    Manage van driver requisitions, across Home (FE) stores, Standard stores and
                    volunteer claims.
                </p>

                <div className="mx-auto mt-6 max-w-xl">
                    <SubmitWindowHeroCompact />
                </div>
            </section>

            <div className="mb-8 h-px bg-border" />

            <section className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {visibleCards.map((card) => (
                    <LaunchCard key={card.href} {...card} />
                ))}
            </section>
        </PageContainer>
    );
}
