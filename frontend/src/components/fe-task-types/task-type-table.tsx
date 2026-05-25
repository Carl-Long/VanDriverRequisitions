import { Pencil } from "lucide-react";
import { FeTaskType } from "@/lib/api/fe-task-types";
import { IconButton } from "@/components/ui/button/icon-button";
import { Surface } from "../ui/surface";
import { Toggle } from "../ui/toggle";

import { formatDateGB } from "@/lib/format/date";

type Props = {
    items: FeTaskType[];
    onEdit: (item: FeTaskType) => void;
    onToggleActive: (item: FeTaskType) => void;
};

export function TaskTypeTable({
    items,
    onEdit,
    onToggleActive,
}: Readonly<Props>) {
    return (
        <Surface className="overflow-x-auto">
            <table className="w-full text-left text-sm">

                {/* HEADER */}
                <thead className="sticky top-0 z-10 bg-surface-elevated border-b border-border">
                    <tr className="text-xs font-semibold uppercase tracking-wide text-foreground bg-accent/10">
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Active</th>
                        <th className="px-4 py-3">Last modified</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                </thead>

                {/* BODY */}
                <tbody className="divide-y divide-border-subtle">
                    {items.map((item) => {
                        const lastDate =
                            item.updatedAtUtc ?? item.createdAtUtc;

                        const lastUser =
                            item.updatedByNameSnapshot ??
                            item.createdByNameSnapshot ??
                            "System";

                        return (
                            <tr
                                key={item.id}
                                className="group transition-colors duration-150 hover:bg-surface-hover"
                            >
                                {/* Name */}
                                <td className="px-4 py-3 align-middle">
                                    <div className="font-medium text-foreground">
                                        {item.name}
                                    </div>
                                </td>

                                {/* Code */}
                                <td className="px-4 py-3 align-middle text-foreground-subtle">
                                    {item.code}
                                </td>

                                {/* Active */}
                                <td className="px-4 py-3 align-middle">
                                    <Toggle
                                        checked={item.isActive}
                                        onChange={() => onToggleActive(item)}
                                        ariaLabel={`Toggle active for ${item.name}`}
                                    />
                                </td>

                                {/* Last Modified */}
                                <td className="px-4 py-3 align-middle">
                                    <div className="flex flex-col leading-tight">
                                        <span className="text-sm text-foreground">
                                            {formatDateGB(lastDate) ?? "—"}
                                        </span>

                                        <span className="text-xs text-muted-foreground">
                                            {lastUser}
                                        </span>
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-3 align-middle text-right">
                                    <IconButton
                                        style="ghost"
                                        tone="default"
                                        size="sm"
                                        onClick={() => onEdit(item)}
                                        aria-label="Edit"
                                    >
                                        <Pencil size={14} />
                                    </IconButton>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </Surface>
    );
}