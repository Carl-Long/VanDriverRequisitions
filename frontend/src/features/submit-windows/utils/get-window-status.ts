import { SubmitWindow } from "../types/submit-window.types";

export type WindowStatus = "upcoming" | "open" | "closed" | "deleted";

export function getWindowStatus(window: SubmitWindow): WindowStatus {
    if (window.isDeleted) return "deleted";

    const now = new Date();
    const from = new Date(window.openFrom);
    const to = new Date(window.openTo);

    if (now < from) return "upcoming";
    if (now >= from && now <= to) return "open";

    return "closed";
}
