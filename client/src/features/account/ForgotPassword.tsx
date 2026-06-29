import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WillowMark } from "@/components/WillowMark";
import agent from "@/lib/api/agent";
import {
   forgotPasswordSchema,
   type ForgotPasswordSchema,
} from "@/lib/schemas/forgotPasswordSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { Loader2 } from "lucide-react";

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
         <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
            <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
               <WillowMark size={44} className="text-foreground" />
               <div className="rounded-2xl border bg-card overflow-hidden w-full">
                  <div className="px-6 py-8 flex flex-col gap-3">
                     <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Email sent</p>
                     <h1 className="text-xl font-bold tracking-tight">Check your inbox</h1>
                     <p className="text-sm text-muted-foreground">
                        If an account exists for that address, we've sent a password reset link.
                     </p>
                  </div>
               </div>
               <Link
                  to="/login"
                  className="text-xs font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground underline underline-offset-4"
               >
                  Back to sign in
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
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Account recovery</p>
                  <h1 className="text-xl font-bold tracking-tight mt-0.5">Forgot your password?</h1>
                  <p className="text-sm text-muted-foreground mt-1.5">Enter your email and we'll send a reset link.</p>
               </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
               <div className="rounded-2xl border bg-card overflow-hidden">
                  <div className="px-6 py-5">
                     <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">Email</p>
                     <Input id="email" type="email" autoComplete="email" {...register("email")} />
                     {errors.email && (
                        <p className="text-sm text-destructive mt-1.5">{errors.email.message}</p>
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
                        Sending...
                     </>
                  ) : (
                     "Send reset link"
                  )}
               </Button>
            </form>

            <p className="text-sm text-center text-muted-foreground">
               Remember your password?{" "}
               <Link to="/login" className="text-foreground font-medium underline underline-offset-4">
                  Sign in
               </Link>
            </p>
         </div>
      </div>
   );
}
