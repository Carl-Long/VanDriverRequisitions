import { LaunchCard } from "@/components/landing-page/launch-card";
import { WelcomeHeading } from "@/components/landing-page/welcome-heading";
import { PageContainer } from "@/components/layout/page-container";

import {
    HeartHandshake,
    Sofa,
    Shirt,
} from "lucide-react";

const cards = [
    {
        title: "Home Van Drivers",
        description:
            "Raise home van driver requisitions for FE stores",
        href: "/home-drivers",
        icon: Sofa,
    },
    {
        title: "Standard Van Drivers",
        description:
            "Raise and view requisitions for home and fashion stores",
        href: "/standard-drivers",
        icon: Shirt,
    },
    {
        title: "Volunteer Van Drivers",
        description:
            "Raise and view requisitions for volunteer drivers",
        href: "/volunteer-drivers",
        icon: HeartHandshake,
    },
];

export default function HomePage() {
    return (
        <PageContainer>
            {/* HERO */}
            <section className="mx-auto mb-10 max-w-2xl text-center">
                {/* Eyebrow badge */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Van Driver Portal</span>
                </div>

                <WelcomeHeading />

                <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                    Manage van driver requisitions, volunteer claims, and
                    operational payments from a single workspace.
                </p>
            </section>

            <div className="mb-8 h-px bg-border" />

            {/* CARDS GRID */}
            <section className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                    <LaunchCard key={card.href} {...card} />
                ))}
            </section>
        </PageContainer>
    );
}