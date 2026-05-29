import { checkInSchema } from "../checkInSchema";
import { loginSchema } from "../loginSchema";
import { registerSchema } from "../registerSchema";
import { questionSchema } from "../questionSchema";

describe("checkInSchema", () => {
   it("accepts valid data", () => {
      const result = checkInSchema.safeParse({
         date: "2025-01-01",
         mood: 7,
         pain: 3,
         fatigue: 4,
         nausea: 2,
      });
      expect(result.success).toBe(true);
   });

   it("accepts valid data with optional notes", () => {
      const result = checkInSchema.safeParse({
         date: "2025-01-01",
         mood: 5,
         pain: 5,
         fatigue: 5,
         nausea: 5,
         notes: "Feeling okay today",
      });
      expect(result.success).toBe(true);
   });

   it("rejects missing date", () => {
      const result = checkInSchema.safeParse({
         mood: 7,
         pain: 3,
         fatigue: 4,
         nausea: 2,
      });
      expect(result.success).toBe(false);
   });

   it("rejects metric values below 1", () => {
      const result = checkInSchema.safeParse({
         date: "2025-01-01",
         mood: 0,
         pain: 3,
         fatigue: 4,
         nausea: 2,
      });
      expect(result.success).toBe(false);
   });

   it("rejects metric values above 10", () => {
      const result = checkInSchema.safeParse({
         date: "2025-01-01",
         mood: 11,
         pain: 3,
         fatigue: 4,
         nausea: 2,
      });
      expect(result.success).toBe(false);
   });

   it("accepts a valid weight", () => {
      const result = checkInSchema.safeParse({
         date: "2025-01-01",
         mood: 5,
         pain: 5,
         fatigue: 5,
         nausea: 5,
         weight: 72.5,
      });
      expect(result.success).toBe(true);
   });

   it("accepts a check-in with no weight", () => {
      const result = checkInSchema.safeParse({
         date: "2025-01-01",
         mood: 5,
         pain: 5,
         fatigue: 5,
         nausea: 5,
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.weight).toBeUndefined();
   });

   it("rejects a weight below the allowed range", () => {
      const result = checkInSchema.safeParse({
         date: "2025-01-01",
         mood: 5,
         pain: 5,
         fatigue: 5,
         nausea: 5,
         weight: 5,
      });
      expect(result.success).toBe(false);
   });
});

describe("loginSchema", () => {
   it("accepts valid credentials", () => {
      const result = loginSchema.safeParse({
         email: "user@example.com",
         password: "secret",
      });
      expect(result.success).toBe(true);
   });

   it("rejects invalid email", () => {
      const result = loginSchema.safeParse({
         email: "not-an-email",
         password: "secret",
      });
      expect(result.success).toBe(false);
   });

   it("rejects empty password", () => {
      const result = loginSchema.safeParse({
         email: "user@example.com",
         password: "",
      });
      expect(result.success).toBe(false);
   });
});

describe("registerSchema", () => {
   it("accepts valid registration data", () => {
      const result = registerSchema.safeParse({
         username: "adam",
         email: "adam@example.com",
         password: "password123",
      });
      expect(result.success).toBe(true);
   });

   it("rejects username shorter than 3 characters", () => {
      const result = registerSchema.safeParse({
         username: "ab",
         email: "adam@example.com",
         password: "password123",
      });
      expect(result.success).toBe(false);
   });

   it("rejects invalid email", () => {
      const result = registerSchema.safeParse({
         username: "adam",
         email: "not-an-email",
         password: "password123",
      });
      expect(result.success).toBe(false);
   });

   it("rejects password shorter than 6 characters", () => {
      const result = registerSchema.safeParse({
         username: "adam",
         email: "adam@example.com",
         password: "abc",
      });
      expect(result.success).toBe(false);
   });
});

describe("questionSchema", () => {
   it("accepts non-empty text", () => {
      const result = questionSchema.safeParse({ text: "What are the side effects?" });
      expect(result.success).toBe(true);
   });

   it("rejects empty text", () => {
      const result = questionSchema.safeParse({ text: "" });
      expect(result.success).toBe(false);
   });

   it("rejects missing text", () => {
      const result = questionSchema.safeParse({});
      expect(result.success).toBe(false);
   });
});
