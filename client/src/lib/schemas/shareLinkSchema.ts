import { z } from "zod";

export const shareLinkSchema = z.object({
   label: z.string().max(100).optional().or(z.literal("")),
   expiresAt: z.string().optional(),
});

export type ShareLinkFormValues = z.infer<typeof shareLinkSchema>;
