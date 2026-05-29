import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import agent from "@/lib/api/agent";
import {
   forgotPasswordSchema,
   type ForgotPasswordSchema,
} from "@/lib/schemas/forgotPasswordSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";

export default function ForgotPassword() {
   const [submitted, setSubmitted] = useState(false);
   const [serverError, setServerError] = useState<string | null>(null);

   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm<ForgotPasswordSchema>({
      resolver: zodResolver(forgotPasswordSchema),
   });

   const onSubmit = async (data: ForgotPasswordSchema) => {
      try {
         setServerError(null);
         await agent.Account.forgotPassword(data);
         setSubmitted(true);
      } catch {
         setServerError("Something went wrong. Please try again.");
      }
   };

   if (submitted) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-sm p-6 border rounded-lg text-center flex flex-col gap-4">
               <h1 className="text-xl font-semibold">Check your email</h1>
               <p className="text-sm text-muted-foreground">
                  If an account exists for that address, we've sent a password
                  reset link.
               </p>
               <Link
                  to="/login"
                  className="text-sm underline underline-offset-4 text-muted-foreground"
               >
                  Back to sign in
               </Link>
            </div>
         </div>
      );
   }

   return (
      <div className="flex items-center justify-center min-h-screen">
         <div className="w-full max-w-sm p-6 border rounded-lg">
            <h1 className="text-xl font-semibold mb-2">Forgot your password?</h1>
            <p className="text-sm text-muted-foreground mb-6">
               Enter your email and we'll send you a reset link.
            </p>
            <form
               onSubmit={handleSubmit(onSubmit)}
               className="flex flex-col gap-4"
               noValidate
            >
               <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email && (
                     <p className="text-sm text-red-500">
                        {errors.email.message}
                     </p>
                  )}
               </Field>
               <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send reset link"}
               </Button>
               {serverError && (
                  <p className="text-sm text-red-500 text-center">{serverError}</p>
               )}
            </form>
            <p className="text-sm text-center text-muted-foreground mt-4">
               <Link
                  to="/login"
                  className="underline underline-offset-4"
               >
                  Back to sign in
               </Link>
            </p>
         </div>
      </div>
   );
}
