import { WillowMark } from "@/components/WillowMark";
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

   const content = {
      loading: {
         dateline: "Please wait",
         title: "Verifying your email",
         body: "Just a moment while we confirm your address…",
      },
      success: {
         dateline: "Verified",
         title: "Email confirmed",
         body: "Your account is now active. You can sign in and start tracking.",
      },
      error: {
         dateline: "Error",
         title: "Verification failed",
         body: "This link is invalid or has already been used.",
      },
   }[status];

   return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
         <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
            <WillowMark size={44} className="text-foreground" />
            <div className="rounded-2xl border bg-card overflow-hidden w-full">
               <div className="px-6 py-8 flex flex-col gap-3">
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                     {content.dateline}
                  </p>
                  <h1 className="text-xl font-bold tracking-tight">{content.title}</h1>
                  <p className="text-sm text-muted-foreground">{content.body}</p>
               </div>
            </div>
            {status !== "loading" && (
               <Link
                  to="/login"
                  className="text-xs font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground underline underline-offset-4"
               >
                  {status === "success" ? "Sign in" : "Back to sign in"}
               </Link>
            )}
         </div>
      </div>
   );
}
