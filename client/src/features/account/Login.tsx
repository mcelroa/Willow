import { useAccount } from "@/lib/hooks/useAccount";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginSchema } from "@/lib/schemas/loginSchema";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { WillowMark } from "@/components/WillowMark";

export default function Login() {
   const { loginUser } = useAccount();

   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm<LoginSchema>({ resolver: zodResolver(loginSchema) });

   const onSubmit = (data: LoginSchema) => {
      loginUser.mutate(data);
   };

   return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
         <div className="w-full max-w-sm flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3 text-center">
               <WillowMark size={44} className="text-foreground" />
               <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Willow</p>
                  <h1 className="text-xl font-bold tracking-tight mt-0.5">Sign in to your account</h1>
               </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
               <div className="rounded-2xl border bg-card overflow-hidden divide-y">
                  <div className="px-6 py-5">
                     <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">Email</p>
                     <Input id="email" type="email" autoComplete="email" {...register("email")} />
                     {errors.email && (
                        <p className="text-sm text-destructive mt-1.5">{errors.email.message}</p>
                     )}
                  </div>
                  <div className="px-6 py-5">
                     <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Password</p>
                        <Link
                           to="/forgot-password"
                           className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                        >
                           Forgot password?
                        </Link>
                     </div>
                     <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        {...register("password")}
                     />
                     {errors.password && (
                        <p className="text-sm text-destructive mt-1.5">{errors.password.message}</p>
                     )}
                  </div>
               </div>

               {loginUser.isError && (
                  <p className="text-sm text-destructive text-center">Invalid email or password</p>
               )}

               <Button type="submit" className="w-full h-11 font-semibold" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Sign in"}
               </Button>
            </form>

            <p className="text-sm text-center text-muted-foreground">
               Don't have an account?{" "}
               <Link to="/register" className="text-foreground font-medium underline underline-offset-4">
                  Create account
               </Link>
            </p>
         </div>
      </div>
   );
}
