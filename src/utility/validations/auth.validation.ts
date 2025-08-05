import * as z from "zod";

export const emailString = z
  .email("Invalid email format. please enter in format -> abc@xyz.com")
  .trim()
  .min(1, "email id must contain atleast 1 character")
  .max(280, "Email must be at most 280 characters long");

// Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be at least 8 characters long
const passwordValidation = z
  .string()
  .regex(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_])(?!.*\s)[A-Za-z\d\W_]{8,}$/,
    "password criteria failed - Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be at least 8 characters long"
  );

export const VRegistration = z.object({
  email: emailString,
  pass: passwordValidation,
  name: z.string().trim().min(1, "Name must contain at least 1 character"),
});

export const VLogin = z.object({
  email: emailString,
  password: z.string().min(1, "Password must contain at least 1 character"),
});

// export const VRegistrationDr = z.object({
//   email: emailString,
//   pass: passwordValidation,
//   name: z.string().trim().min(1, "Name must contain at least 1 character"),
//   availability: z
//     .array(
//       z
//         .object({
//           availableFrom: z
//             .date()
//             .refine(
//               (date) => !isNaN(date.getTime()),
//               "Invalid date format for availableFrom"
//             ),
//           availableTo: z
//             .date()
//             .refine(
//               (date) => !isNaN(date.getTime()),
//               "Invalid date format for availableTo"
//             ),
//           capacity: z
//             .number()
//             .int()
//             .positive("Capacity must be a positive integer"),
//         })
//         .refine(
//           (data) => {
//             return data.availableFrom < data.availableTo;
//           },
//           {
//             message: "available to must be greater than available from",
//             path: ["availableTo"],
//           }
//         )
//     )
//     .min(1, "At least one availability slot is required"),
// });

export const VRegistrationDr = z.object({
  email: emailString,
  pass: passwordValidation,
  name: z.string().trim().min(1, "Name must contain at least 1 character"),
  availability: z
    .array(
      z
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
          capacity: z
            .number()
            .int()
            .positive("Capacity must be a positive integer"),
        })
        .refine((data) => data.availableFrom < data.availableTo, {
          message: "availableTo must be greater than availableFrom",
          path: ["availableTo"],
        })
    )
    .min(1, "At least one availability slot is required"),
});
