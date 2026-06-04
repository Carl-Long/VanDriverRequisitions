import {
    HeartHandshake,
    CalendarClock,
    ListChecks,
    Tags,
    Sofa,
    Shirt,
    Gauge,
} from "lucide-react";

export const navigation = [
    {
        title: "Home Van Drivers",
        href: "/home-van-drivers",
        icon: Sofa,
    },
    {
        title: "Standard Van Drivers",
        href: "/standard-drivers",
        icon: Shirt,
    },
    {
        title: "Volunteer Van Drivers",
        href: "/volunteer-drivers",
        icon: HeartHandshake,
    },
];


export const adminNavigation = [
    {
        label: "Administration",
        items: [
            {
                title: "Submit Windows",
                href: "/admin/submit-windows",
                icon: CalendarClock,
            },
            {
                title: "FE Task Types",
                href: "/admin/fe-task-types",
                icon: ListChecks,
            },
            {
                title: "Reasons",
                href: "/admin/reasons",
                icon: Tags,
            },
            {
                title: "Limit Rules",
                href: "/admin/requisition-limit-rules",
                icon: Gauge,
            },
        ],
    },
];