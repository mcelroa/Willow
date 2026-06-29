import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WillowMark } from "@/components/WillowMark";
import agent from "@/lib/api/agent";
import {
   resetPasswordSchema,
   type ResetPasswordSchema,
} from "@/lib/schemas/resetPasswordSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router";
import { Loader2 } from "lucide-react";

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
         <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
            <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
               <WillowMark size={44} className="text-foreground" />
               <div className="rounded-2xl border bg-card overflow-hidden w-full">
                  <div className="px-6 py-8 flex flex-col gap-3">
                     <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Error</p>
                     <h1 className="text-xl font-bold tracking-tight">Invalid link</h1>
                     <p className="text-sm text-muted-foreground">
                        This reset link is missing required information.{" "}
                        <Link to="/forgot-password" className="underline underline-offset-4">
                           Request a new one
                        </Link>
                        .
                     </p>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   if (success) {
      return (
         <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
            <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
               <WillowMark size={44} className="text-foreground" />
               <div className="rounded-2xl border bg-card overflow-hidden w-full">
                  <div className="px-6 py-8 flex flex-col gap-3">
                     <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Done</p>
                     <h1 className="text-xl font-bold tracking-tight">Password updated</h1>
                     <p className="text-sm text-muted-foreground">
                        Your password has been reset. You can now sign in.
                     </p>
                  </div>
               </div>
               <Link
                  to="/login"
                  className="text-xs font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground underline underline-offset-4"
               >
                  Sign in
               </Link>
            </div>
         </div>
      );
   }

   return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
         <div className="w-full max-w-sm flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3 text-center">
               <WillowMark size={44} className="text-foreground" />
               <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Account security</p>
                  <h1 className="text-xl font-bold tracking-tight mt-0.5">Set a new password</h1>
               </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
               <div className="rounded-2xl border bg-card overflow-hidden divide-y">
                  <div className="px-6 py-5">
                     <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">New password</p>
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
                     <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">Confirm password</p>
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

               {serverError && (
                  <p className="text-sm text-destructive text-center">{serverError}</p>
               )}

               <Button type="submit" className="w-full h-11 font-semibold" disabled={isSubmitting}>
                  {isSubmitting ? (
                     <>
                        <Loader2 className="animate-spin" />
                        Resetting...
                     </>
                  ) : (
                     "Reset password"
                  )}
               </Button>
            </form>
         </div>
      </div>
   );
}
