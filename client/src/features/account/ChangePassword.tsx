import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import agent from "@/lib/api/agent";
import {
   changePasswordSchema,
   type ChangePasswordSchema,
} from "@/lib/schemas/changePasswordSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";

export default function ChangePassword() {
   const [success, setSuccess] = useState(false);
   const [serverError, setServerError] = useState<string | null>(null);

   const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isSubmitting },
   } = useForm<ChangePasswordSchema>({
      resolver: zodResolver(changePasswordSchema),
   });

   const onSubmit = async (data: ChangePasswordSchema) => {
      setServerError(null);
      try {
         await agent.Account.changePassword({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
         });
         setSuccess(true);
         reset();
      } catch {
         setServerError("Current password is incorrect.");
      }
   };

   return (
      <div className="max-w-md mx-auto px-4 py-8">
         <h1 className="text-xl font-semibold mb-6">Change password</h1>
         {success && (
            <p className="text-sm text-green-600 mb-4">
               Password updated successfully.
            </p>
         )}
         <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
         >
            <Field>
               <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
               <Input
                  id="currentPassword"
                  type="password"
                  {...register("currentPassword")}
               />
               {errors.currentPassword && (
                  <p className="text-sm text-red-500">
                     {errors.currentPassword.message}
                  </p>
               )}
            </Field>
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
               <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
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
            <div className="flex items-center justify-between pt-1">
               <Link
                  to="/"
                  className="text-sm text-muted-foreground underline underline-offset-4"
               >
                  Cancel
               </Link>
               <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Update password"}
               </Button>
            </div>
            {serverError && (
               <p className="text-sm text-red-500 text-center">{serverError}</p>
            )}
         </form>
      </div>
   );
}
