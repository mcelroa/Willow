import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import agent from "@/lib/api/agent";
import {
   registerSchema,
   type RegisterSchema,
} from "@/lib/schemas/registerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";

export default function Register() {
   const [submitted, setSubmitted] = useState(false);
   const [serverError, setServerError] = useState<string | null>(null);

   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm<RegisterSchema>({ resolver: zodResolver(registerSchema) });

   const onSubmit = async (data: RegisterSchema) => {
      setServerError(null);
      try {
         await agent.Account.register(data);
         setSubmitted(true);
      } catch {
         setServerError("Registration failed. Please try again.");
      }
   };

   if (submitted) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-sm p-6 border rounded-lg text-center flex flex-col gap-4">
               <h1 className="text-xl font-semibold">Check your email</h1>
               <p className="text-sm text-muted-foreground">
                  We've sent a verification link to your email address. Click
                  it to activate your account.
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
            <h1 className="text-xl font-semibold mb-6">Create an account</h1>
            <form
               onSubmit={handleSubmit(onSubmit)}
               className="flex flex-col gap-4"
               noValidate
            >
               <Field>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <Input id="username" type="text" {...register("username")} />
                  {errors.username && (
                     <p className="text-sm text-red-500">
                        {errors.username.message}
                     </p>
                  )}
               </Field>
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
                  {isSubmitting ? "Creating account..." : "Create account"}
               </Button>
               {serverError && (
                  <p className="text-sm text-red-500 text-center">
                     {serverError}
                  </p>
               )}
            </form>
            <p className="text-sm text-center text-muted-foreground mt-2">
               Already have an account?{" "}
               <Link
                  to="/login"
                  className="text-foreground underline underline-offset-4"
               >
                  Sign in
               </Link>
            </p>
         </div>
      </div>
   );
}
