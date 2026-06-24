import { Alert } from "@/components/ui/alert";

type Props = {
    message?: string | null;
};

export function RequisitionFormErrorAlert({ message }: Readonly<Props>) {
    if (!message) {
        return null;
    }

    const messages = [...new Set(message.split("\n").map((x) => x.trim()).filter(Boolean))];

    if (messages.length === 0) {
        return null;
    }

    return (
        <Alert tone="danger">
            <ul className="list-disc space-y-1 pl-5">
                {messages.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </Alert>
    );
}