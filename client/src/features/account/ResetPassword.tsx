import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import agent from "@/lib/api/agent";
import {
   resetPasswordSchema,
   type ResetPasswordSchema,
} from "@/lib/schemas/resetPasswordSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router";

export default function ResetPassword() {
   const [searchParams] = useSearchParams();
   const [success, setSuccess] = useState(false);
   const [serverError, setServerError] = useState<string | null>(null);

   const email = searchParams.get("email") ?? "";
   const token = searchParams.get("token") ?? "";

   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm<ResetPasswordSchema>({
      resolver: zodResolver(resetPasswordSchema),
   });

   const onSubmit = async (data: ResetPasswordSchema) => {
      setServerError(null);
      try {
         await agent.Account.resetPassword({
            email,
            token,
            newPassword: data.newPassword,
         });
         setSuccess(true);
      } catch {
         setServerError("This reset link is invalid or has expired.");
      }
   };

   if (!email || !token) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-sm p-6 border rounded-lg text-center">
               <p className="text-sm text-muted-foreground">
                  Invalid reset link.{" "}
                  <Link to="/forgot-password" className="underline underline-offset-4">
                     Request a new one
                  </Link>
               </p>
            </div>
         </div>
      );
   }

   if (success) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-sm p-6 border rounded-lg text-center flex flex-col gap-4">
               <h1 className="text-xl font-semibold">Password reset</h1>
               <p className="text-sm text-muted-foreground">
                  Your password has been updated.
               </p>
               <Link
                  to="/login"
                  className="text-sm underline underline-offset-4 text-muted-foreground"
               >
                  Sign in
               </Link>
            </div>
         </div>
      );
   }

   return (
      <div className="flex items-center justify-center min-h-screen">
         <div className="w-full max-w-sm p-6 border rounded-lg">
            <h1 className="text-xl font-semibold mb-6">Set a new password</h1>
            <form
               onSubmit={handleSubmit(onSubmit)}
               className="flex flex-col gap-4"
               noValidate
            >
               <Field>
                  <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                  <Input
                     id="newPassword"
                     type="password"
                     {...register("newPassword")}
                  />
                  {errors.newPassword && (
                     <p className="text-sm text-red-500">
                        {errors.newPassword.message}
                     </p>
                  )}
               </Field>
               <Field>
                  <FieldLabel htmlFor="confirmPassword">
                     Confirm password
                  </FieldLabel>
                  <Input
                     id="confirmPassword"
                     type="password"
                     {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                     <p className="text-sm text-red-500">
                        {errors.confirmPassword.message}
                     </p>
                  )}
               </Field>
               <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Resetting..." : "Reset password"}
               </Button>
               {serverError && (
                  <p className="text-sm text-red-500 text-center">
                     {serverError}
                  </p>
               )}
            </form>
         </div>
      </div>
   );
}
