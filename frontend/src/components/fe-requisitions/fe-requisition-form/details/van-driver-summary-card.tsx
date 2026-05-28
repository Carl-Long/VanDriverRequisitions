import { VanDriverLookup } from "@/lib/api/van-drivers";

type Props = {
    vanDriver: VanDriverLookup;
};

export function VanDriverSummaryCard({
    vanDriver,
}: Readonly<Props>) {
    return (
        <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Info
                    label="Driver Code"
                    value={vanDriver.code}
                />

                <Info
                    label="Trader Name"
                    value={vanDriver.tradersName}
                />

                <Info
                    label="Phone"
                    value={
                        vanDriver.phone ?? "-"
                    }
                />

                <Info
                    label="VAT"
                    value={
                        vanDriver.hasVat
                            ? vanDriver.vatNumber ??
                            "Registered"
                            : "Not VAT Registered"
                    }
                />
            </div>

            <div className="mt-4 border-t border-border pt-4">
                <div className="text-sm font-medium">
                    Address
                </div>

                <div className="mt-1 text-sm text-muted-foreground">
                    <div>
                        {vanDriver.address1}
                    </div>

                    {vanDriver.address2 && (
                        <div>
                            {vanDriver.address2}
                        </div>
                    )}

                    <div>
                        {[
                            vanDriver.town,
                            vanDriver.county,
                            vanDriver.postcode,
                        ]
                            .filter(Boolean)
                            .join(", ")}
                    </div>
                </div>
            </div>
        </div>
    );
}

type InfoProps = {
    label: string;
    value: string;
};

function Info({
    label,
    value,
}: Readonly<InfoProps>) {
    return (
        <div>
            <div className="text-xs text-muted-foreground">
                {label}
            </div>

            <div className="text-sm font-medium">
                {value}
            </div>
        </div>
    );
}