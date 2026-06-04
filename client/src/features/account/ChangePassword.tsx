import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
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
      <div className="max-w-xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-5">
         <PageHeader title="Change password" description="Update your account password" />

         <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="rounded-2xl border bg-card overflow-hidden divide-y">
               <div className="px-6 py-5">
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
                     Current password
                  </p>
                  <Input
                     id="currentPassword"
                     type="password"
                     autoComplete="current-password"
                     {...register("currentPassword")}
                  />
                  {errors.currentPassword && (
                     <p className="text-sm text-destructive mt-1.5">{errors.currentPassword.message}</p>
                  )}
               </div>
               <div className="px-6 py-5">
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
                     New password
                  </p>
                  <Input
                     id="newPassword"
                     type="password"
                     autoComplete="new-password"
                     {...register("newPassword")}
                  />
                  {errors.newPassword && (
                     <p className="text-sm text-destructive mt-1.5">{errors.newPassword.message}</p>
                  )}
               </div>
               <div className="px-6 py-5">
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
                     Confirm new password
                  </p>
                  <Input
                     id="confirmPassword"
                     type="password"
                     autoComplete="new-password"
                     {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                     <p className="text-sm text-destructive mt-1.5">{errors.confirmPassword.message}</p>
                  )}
               </div>
            </div>

            {success && (
               <div className="mt-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-800 dark:text-green-400 text-center">
                  Password updated successfully.
               </div>
            )}

            {serverError && (
               <p className="mt-4 text-sm text-destructive text-center">{serverError}</p>
            )}

            <div className="mt-4 flex items-center justify-between">
               <Link
                  to="/"
                  className="text-xs font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground"
               >
                  Cancel
               </Link>
               <Button type="submit" className="h-11 px-6 font-semibold" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Update password"}
               </Button>
            </div>
         </form>
      </div>
   );
}
