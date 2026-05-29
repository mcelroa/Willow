import { z } from "zod";

export const checkInSchema = z.object({
   date: z.string().min(1, "Date is required"),
   mood: z.number().min(1).max(10),
   pain: z.number().min(1).max(10),
   fatigue: z.number().min(1).max(10),
   nausea: z.number().min(1).max(10),
   // Optional. The form's setValueAs maps an empty field to undefined, so the
   // schema only ever sees a real number here or nothing at all.
   weight: z
      .number()
      .min(20, "Weight must be between 20 and 400 kg")
      .max(400, "Weight must be between 20 and 400 kg")
      .optional(),
   notes: z.string().optional(),
});

export type CheckInSchema = z.infer<typeof checkInSchema>;
