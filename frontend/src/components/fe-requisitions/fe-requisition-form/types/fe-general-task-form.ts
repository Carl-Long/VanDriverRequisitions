import { z } from "zod";

import { feGeneralTaskFormSchema } from "../schemas/fe-general-task-form-schema";

export type FeGeneralTaskForm =
    z.infer<
        typeof feGeneralTaskFormSchema
    >;