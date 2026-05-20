"use client";

import { LaunchCard } from "@/components/landing-page/launch-card";
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
      <section
        className="
          mx-auto mb-16 max-w-3xl
          text-center
        "
      >
        <h1
          className="
            text-5xl font-semibold tracking-tight
            text-foreground
            sm:text-6xl
          "
        >
          Welcome back, User
        </h1>

        <p
          className="
            mx-auto mt-6 max-w-2xl
            text-lg leading-relaxed
            text-muted-foreground
          "
        >
          Manage van driver requisitions, volunteer claims,
          and operational payments from a single workspace.
        </p>
      </section>

      {/* CARDS GRID */}
      <section className="grid w-full gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <LaunchCard key={card.href} {...card} />
        ))}
      </section>
    </PageContainer>
  );
}