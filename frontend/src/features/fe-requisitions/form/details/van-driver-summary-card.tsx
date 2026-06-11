import { VanDriverLookup } from "@/lib/api/van-drivers";

type Props = {
    vanDriver: VanDriverLookup | null;
};

export function VanDriverSummaryCard({ vanDriver }: Readonly<Props>) {
    if (!vanDriver) {
        return (
            <div className="rounded-2xl border border-border bg-surface-elevated p-6 card-shadow">
                <div>
                    <h3 className="font-semibold">Driver Information</h3>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Select a van driver to view trader details, VAT status and address
                        information.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-border bg-surface-elevated p-6 card-shadow">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="font-semibold">{vanDriver.tradersName}</h3>

                    <p className="mt-1 text-sm text-muted-foreground">{vanDriver.code}</p>
                </div>

                {!vanDriver.isActive && (
                    <span className="inline-flex rounded-full border border-warning-border bg-warning-surface px-2 py-0.5 text-xs font-medium text-warning">
                        Inactive
                    </span>
                )}
            </div>

            <div className="mt-6 space-y-4">
                <InfoRow label="Driver Code" value={vanDriver.code} />

                <InfoRow label="Phone" value={vanDriver.phone ?? "-"} />

                <div className="grid grid-cols-[110px_1fr] gap-3">
                    <span className="text-sm text-muted-foreground">VAT</span>

                    <div>
                        {vanDriver.hasVat ? (
                            <span className="inline-flex rounded-full border border-success-border bg-success-surface px-2 py-0.5 text-xs font-medium text-success">
                                VAT Registered
                            </span>
                        ) : (
                            <span className="inline-flex rounded-full border border-border bg-surface-subtle px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                Not Registered
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 border-t border-border pt-6">
                <div className="mb-3 text-sm font-medium">Address</div>

                <div className="space-y-1 text-sm text-muted-foreground">
                    <div>{vanDriver.address1}</div>

                    {vanDriver.address2 && <div>{vanDriver.address2}</div>}

                    {vanDriver.town && <div>{vanDriver.town}</div>}

                    {vanDriver.county && <div>{vanDriver.county}</div>}

                    <div>{vanDriver.postcode}</div>
                </div>
            </div>
        </div>
    );
}

type InfoRowProps = {
    label: string;
    value: string;
};

function InfoRow({ label, value }: Readonly<InfoRowProps>) {
    return (
        <div className="grid grid-cols-[110px_1fr] gap-3">
            <span className="text-sm text-muted-foreground">{label}</span>

            <span className="text-sm font-medium">{value}</span>
        </div>
    );
}
