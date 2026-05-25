import { useAccount } from "@/lib/hooks/useAccount";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginSchema } from "@/lib/schemas/loginSchema";
import { useForm } from "react-hook-form";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

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
      <div className="flex items-center justify-center min-h-screen">
         <div className="w-full max-w-sm p-6 border rounded-lg">
            <h1 className="text-xl font-semibold mb-6">Sign in to Willow</h1>
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
               <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                     id="password"
                     type="password"
                     {...register("password")}
                  />
                  {errors.password && (
                     <p className="text-sm text-red-500">
                        {errors.password.message}
                     </p>
                  )}
               </Field>
               <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Sign in"}
               </Button>
               {loginUser.isError && (
                  <p className="text-sm text-red-500 text-center">
                     Invalid email or password
                  </p>
               )}
            </form>
            <p className="text-sm text-center text-muted-foreground mt-2">
               Don't have an account?{" "}
               <Link
                  to="/register"
                  className="text-foregorund underline underline-offset-4"
               >
                  Register
               </Link>
            </p>
            <p className="text-sm text-center text-muted-foreground mt-1">
               <Link
                  to="/forgot-password"
                  className="underline underline-offset-4"
               >
                  Forgot your password?
               </Link>
            </p>
         </div>
      </div>
   );
}
