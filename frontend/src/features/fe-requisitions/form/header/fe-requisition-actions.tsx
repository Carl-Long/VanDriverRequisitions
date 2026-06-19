import { RequisitionActions } from "@/features/requisitions-shared/components/requisition-actions";
import { SaveAction } from "../components/fe-requisition-shell";

type Props = {
    activeAction: SaveAction;
    canSubmit: boolean;
    onSaveDraft: () => void;
    onSaveAndContinue: () => void;
    onSubmit: () => void;
};

export function FeRequisitionActions(props: Readonly<Props>) {
    return <RequisitionActions {...props} />;
}