import HTTPError from "./error";
import z from "zod";

export class Helpers {
  static validateWithZod<T>(schema: z.ZodSchema<T>, inputData: unknown): T {
    const validationResponse = schema.safeParse(inputData);

    if (!validationResponse.success) {
      const errorObj = validationResponse.error.issues
        .map((issue) => `${String(issue.path[0])}:${issue.message}`)
        .join(" // ");
      throw new HTTPError(`${errorObj}`, 400);
    }

    return validationResponse.data;
  }
}
