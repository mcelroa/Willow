import agent from "@/lib/api/agent";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

export default function VerifyEmail() {
   const [searchParams] = useSearchParams();
   const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

   const email = searchParams.get("email") ?? "";
   const token = searchParams.get("token") ?? "";

   useEffect(() => {
      if (!email || !token) {
         setStatus("error");
         return;
      }
      agent.Account.verifyEmail(email, token)
         .then(() => setStatus("success"))
         .catch(() => setStatus("error"));
   }, [email, token]);

   return (
      <div className="flex items-center justify-center min-h-screen">
         <div className="w-full max-w-sm p-6 border rounded-lg text-center flex flex-col gap-4">
            {status === "loading" && (
               <p className="text-sm text-muted-foreground">Verifying your email...</p>
            )}
            {status === "success" && (
               <>
                  <h1 className="text-xl font-semibold">Email verified</h1>
                  <p className="text-sm text-muted-foreground">
                     Your account is now active.
                  </p>
                  <Link
                     to="/login"
                     className="text-sm underline underline-offset-4 text-muted-foreground"
                  >
                     Sign in
                  </Link>
               </>
            )}
            {status === "error" && (
               <>
                  <h1 className="text-xl font-semibold">Verification failed</h1>
                  <p className="text-sm text-muted-foreground">
                     This link is invalid or has already been used.
                  </p>
                  <Link
                     to="/login"
                     className="text-sm underline underline-offset-4 text-muted-foreground"
                  >
                     Back to sign in
                  </Link>
               </>
            )}
         </div>
      </div>
   );
}
