import { z } from "zod";

export const changePasswordSchema = z
   .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword: z.string(),
   })
   .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
   });

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
