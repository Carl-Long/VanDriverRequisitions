import { FeTaskType } from "@/lib/api/fe-task-types";
import { Pencil } from "lucide-react";

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
        <div className="overflow-x-auto rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] shadow-sm">
            <table className="w-full text-left text-sm">
                {/* HEADER */}
                <thead className="sticky top-0 z-10 bg-[rgb(var(--surface-elevated))]">
                    <tr className="border-b border-[rgb(var(--border))]">
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted-foreground))]">
                            Name
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted-foreground))]">
                            Code
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted-foreground))]">
                            Active
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted-foreground))]">
                            Last modified
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted-foreground))]">
                            Actions
                        </th>
                    </tr>
                </thead>

                {/* BODY */}
                <tbody className="divide-y divide-[rgb(var(--border-subtle))]">
                    {items.map((item) => {
                        const lastDate = item.updatedAtUtc ?? item.createdAtUtc;
                        const lastUser =
                            item.updatedByNameSnapshot ?? item.createdByNameSnapshot ?? "System";

                        return (
                            <tr
                                key={item.id}
                                className="
                  transition-all duration-150
                  hover:bg-[rgb(var(--surface-hover))]
                  hover:shadow-sm
                "
                            >
                                {/* Name */}
                                <td className="px-4 py-3 align-middle">
                                    <div className="font-medium text-[rgb(var(--foreground))]">
                                        {item.name}
                                    </div>
                                </td>

                                {/* Code */}
                                <td className="px-4 py-3 align-middle text-[rgb(var(--muted-foreground))]">
                                    {item.code}
                                </td>

                                {/* Active toggle */}
                                <td className="px-4 py-3 align-middle">
                                    <button
                                        onClick={() => onToggleActive(item)}
                                        className={`
                      relative inline-flex h-6 w-11 items-center rounded-full
                      transition-colors cursor-pointer
                      ${item.isActive ? "bg-[rgb(var(--success))]" : "bg-[rgb(var(--muted))]"}
                    `}
                                        aria-label={`Toggle active for ${item.name}`}
                                    >
                                        <span
                                            className={`
                        inline-block h-4 w-4 transform rounded-full bg-white
                        transition-transform
                        ${item.isActive ? "translate-x-6" : "translate-x-1"}
                      `}
                                        />
                                    </button>
                                </td>

                                {/* Last modified */}
                                <td className="px-4 py-3 align-middle">
                                    <div className="flex flex-col leading-tight">
                                        {lastDate ? (
                                            <span className="text-sm text-[rgb(var(--foreground))]">
                                                {new Date(lastDate).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-[rgb(var(--muted-foreground))]">
                                                —
                                            </span>
                                        )}

                                        <span className="text-xs text-[rgb(var(--muted-foreground))]">
                                            {lastUser}
                                        </span>
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-3 align-middle text-right">
                                    <button
                                        onClick={() => onEdit(item)}
                                        className="
                      inline-flex items-center gap-1 rounded-md
                      px-3 py-1.5 text-sm font-medium
                      text-[rgb(var(--foreground))]
                      hover:bg-[rgb(var(--surface-hover))]
                      transition-colors cursor-pointer
                    "
                                    >
                                        <Pencil size={14} />
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}