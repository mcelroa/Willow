import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAccount } from "@/lib/hooks/useAccount";
import {
   registerSchema,
   type RegisterSchema,
} from "@/lib/schemas/registerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function Register() {
   const { registerUser } = useAccount();

   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm<RegisterSchema>({ resolver: zodResolver(registerSchema) });

   const onSubmit = (data: RegisterSchema) => {
      registerUser.mutate(data);
   };

   return (
      <div className="flex items-center justify-center min-h-screen">
         <div className="w-full max-w-sm p-6 border rounded-lg">
            <h1 className="text-xl font-semibold mb-6">Create an account</h1>
            <form
               onSubmit={handleSubmit(onSubmit)}
               className="flex flex-col gap-4"
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
               {registerUser.isError && (
                  <p className="text-sm text-red-500 text-center">
                     Registration failed. Please try again.
                  </p>
               )}
            </form>
         </div>
      </div>
   );
}
