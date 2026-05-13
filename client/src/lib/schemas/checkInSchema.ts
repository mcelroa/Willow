import { z } from "zod";

export const checkInSchema = z.object({
   date: z.string().min(1, "Date is required"),
   mood: z.number().min(1).max(10),
   pain: z.number().min(1).max(10),
   fatigue: z.number().min(1).max(10),
   nausea: z.number().min(1).max(10),
   notes: z.string().optional(),
});

export type CheckInSchema = z.infer<typeof checkInSchema>;
