"use client";

import { useState } from "react";
import { FeRequisitionPageMode } from "../types/fe-requisition-page-mode";

type Tab =
    | "details"
    | "generalTasks"
    | "mileage"
    | "transfers"
    | "additionalCosts";

type Props = {
    mode: FeRequisitionPageMode
    details: React.ReactNode;

    generalTasks: React.ReactNode;
};

export function FeRequisitionTabs({
    details,

    generalTasks,
}: Readonly<Props>) {
    const [active, setActive] =
        useState<Tab>("details");

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b border-border">
                <TabButton
                    active={
                        active === "details"
                    }
                    onClick={() =>
                        setActive("details")
                    }
                >
                    Details
                </TabButton>

                <TabButton
                    active={
                        active ===
                        "generalTasks"
                    }
                    onClick={() =>
                        setActive(
                            "generalTasks",
                        )
                    }
                >
                    General Tasks
                </TabButton>

                <TabButton
                    active={
                        active === "mileage"
                    }
                    onClick={() =>
                        setActive("mileage")
                    }
                >
                    Mileage
                </TabButton>

                <TabButton
                    active={
                        active ===
                        "transfers"
                    }
                    onClick={() =>
                        setActive(
                            "transfers",
                        )
                    }
                >
                    Transfers
                </TabButton>

                <TabButton
                    active={
                        active ===
                        "additionalCosts"
                    }
                    onClick={() =>
                        setActive(
                            "additionalCosts",
                        )
                    }
                >
                    Additional Costs
                </TabButton>
            </div>

            {active === "details" &&
                details}

            {active ===
                "generalTasks" &&
                generalTasks}

            {active !== "details" &&
                active !==
                "generalTasks" && (
                    <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                        <div className="text-sm text-muted-foreground">
                            This section
                            will be
                            implemented
                            later
                        </div>
                    </div>
                )}
        </div>
    );
}

type TabButtonProps = {
    active: boolean;

    onClick: () => void;

    children: React.ReactNode;
};

function TabButton({
    active,
    onClick,
    children,
}: Readonly<TabButtonProps>) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
            ].join(" ")}
        >
            {children}
        </button>
    );
}