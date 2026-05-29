import { ZodError } from "zod";

export function mapZodErrors(
    error: ZodError,
) {
    const fieldErrors:
        Record<
            string,
            string
        > = {};

    for (const issue of error.issues) {
        const path =
            issue.path.join(".");

        if (
            !fieldErrors[path]
        ) {
            fieldErrors[path] =
                issue.message;
        }
    }

    return fieldErrors;
}