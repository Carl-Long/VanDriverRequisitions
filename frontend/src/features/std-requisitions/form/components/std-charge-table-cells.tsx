import { TableCell } from "@/components/ui/table/table";
import { formatCurrencyGB } from "@/lib/format/currency";
import { cn } from "@/lib/utils";

import {
    getStdChargeTypeLabel,
    STD_CHARGE_TYPE,
} from "../../constants/std-charge-type.constants";
import type { StdChargeFields } from "../types/std-charge-fields";

type ChargeCellProps = {
    row: StdChargeFields;
    className?: string;
};

export function StdChargeTypeCell({
    row,
    className,
}: Readonly<ChargeCellProps>) {
    return (
        <TableCell className={className}>
            {getStdChargeTypeLabel(row.chargeType)}
        </TableCell>
    );
}

export function StdMilesCell({ row, className }: Readonly<ChargeCellProps>) {
    return (
        <TableCell align="right" className={cn("tabular-nums", className)}>
            {row.chargeType === STD_CHARGE_TYPE.Mileage
                ? row.miles ?? "-"
                : "-"}
        </TableCell>
    );
}

export function StdRateChargeCell({
    row,
    className,
}: Readonly<ChargeCellProps>) {
    const value =
        row.chargeType === STD_CHARGE_TYPE.Mileage
            ? row.ratePerMile
            : row.flatCharge;

    return (
        <TableCell align="right" className={cn("tabular-nums", className)}>
            {formatCurrencyGB(value ?? 0)}
        </TableCell>
    );
}