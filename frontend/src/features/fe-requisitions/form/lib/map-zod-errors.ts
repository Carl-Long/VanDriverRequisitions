import { ZodError } from "zod";

export function mapZodErrors(error: ZodError) {
    const result: Record<string, string> = {};

    for (const issue of error.issues) {
        const path = issue.path.join(".");

        if (!path) {
            result.form = issue.message;
            continue;
        }

        result[path] = issue.message;
    }

    return result;
}
