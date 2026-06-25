import { Alert } from "@/components/ui/alert";

type Props = {
    message?: string | null;
};

export function AdminFormServerError({ message }: Readonly<Props>) {
    if (!message) {
        return null;
    }

    return <Alert tone="danger">{message}</Alert>;
}