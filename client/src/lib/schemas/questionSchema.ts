import z from "zod";

export const questionSchema = z.object({
   text: z.string().min(1, "Question text is required"),
});

export type QuestionFormValues = z.infer<typeof questionSchema>;
