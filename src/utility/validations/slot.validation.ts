import * as z from "zod";

export const VCreateSlot = z
  .object({
    availableFrom: z
      .string()
      .transform((val) => new Date(val))
      .refine((date) => !isNaN(date.getTime()), {
        message: "Invalid date format for availableFrom",
      }),
    availableTo: z
      .string()
      .transform((val) => new Date(val))
      .refine((date) => !isNaN(date.getTime()), {
        message: "Invalid date format for availableTo",
      }),
    capacity: z.number().int().positive("Capacity must be a positive integer"),
  })
  .refine((data) => data.availableFrom < data.availableTo, {
    message: "available to must be greater than available from",
    path: ["availableTo"],
  });
