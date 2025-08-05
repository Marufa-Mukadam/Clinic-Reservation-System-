import { JsonObject } from "@prisma/client/runtime/library";

class HTTPError extends Error {
  code: number;
  formDetail?: JsonObject; // Stores field-specific errors

  constructor(message: string | JsonObject, code: number) {
    let errorMessage = "Invalid form data"; // Default message

    if (typeof message === "string") {
      errorMessage = message;
    } else if (message instanceof Error) {
      errorMessage = message.message;
    }

    super(errorMessage);
    this.code = code;
  }
}

export default HTTPError;
