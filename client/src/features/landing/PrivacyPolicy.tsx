import { Button } from "@/components/ui/button";
import { useAccount } from "@/lib/hooks/useAccount";
import { useTheme } from "@/lib/hooks/useTheme";
import { Moon, Sun } from "lucide-react";
import { Link } from "react-router";

export default function PrivacyPolicy() {
   const { currentUser, loadingUser } = useAccount();
   const { isDark, toggleTheme } = useTheme();

   return (
      <div className="min-h-screen flex flex-col">
         {/* Nav */}
         <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
               <Link to="/" className="font-semibold text-primary text-lg">
                  Willow
               </Link>
               <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={toggleTheme}>
                     {isDark ? (
                        <Sun className="h-4 w-4" />
                     ) : (
                        <Moon className="h-4 w-4" />
                     )}
                  </Button>
                  {!loadingUser &&
                     (currentUser ? (
                        <Button asChild size="sm">
                           <Link to="/checkin">Open app</Link>
                        </Button>
                     ) : (
                        <>
                           <Button asChild variant="ghost" size="sm">
                              <Link to="/login">Log in</Link>
                           </Button>
                           <Button asChild size="sm">
                              <Link to="/register">Get started</Link>
                           </Button>
                        </>
                     ))}
               </div>
            </div>
         </header>

         {/* Content */}
         <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-16">
            <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground mb-10">
               Last updated: June 2025
            </p>

            <div className="space-y-10 text-sm leading-relaxed">
               <section className="space-y-3">
                  <h2 className="text-base font-semibold">What Willow is</h2>
                  <p className="text-muted-foreground">
                     Willow is a personal health tracking tool for people in
                     cancer treatment. It helps you log daily symptoms, keep a
                     list of questions for your care team, and see how you're
                     doing over time. It is not a medical device and does not
                     provide medical advice.
                  </p>
               </section>

               <section className="space-y-3">
                  <h2 className="text-base font-semibold">What we collect</h2>
                  <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
                     <li>Your username and email address</li>
                     <li>
                        Daily check-in data: mood, pain, fatigue, and nausea
                        scores (1–10) with optional notes
                     </li>
                     <li>Questions you add to your questions list</li>
                  </ul>
                  <p className="text-muted-foreground">
                     We do not collect any other personal information. We do not
                     use cookies, analytics, or tracking scripts.
                  </p>
               </section>

               <section className="space-y-3">
                  <h2 className="text-base font-semibold">How we use it</h2>
                  <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
                     <li>To display your data back to you</li>
                     <li>
                        To send account emails (email verification, password
                        reset)
                     </li>
                  </ul>
                  <p className="text-muted-foreground">
                     We do not sell your data, share it with third parties, or
                     use it for advertising. Your health data is never used for
                     any purpose other than showing it to you.
                  </p>
               </section>

               <section className="space-y-3">
                  <h2 className="text-base font-semibold">
                     Where your data is stored
                  </h2>
                  <p className="text-muted-foreground">
                     Your data is stored in a PostgreSQL database hosted on{" "}
                     <a
                        href="https://azure.microsoft.com"
                        className="underline underline-offset-4"
                        target="_blank"
                        rel="noopener noreferrer"
                     >
                        Microsoft Azure
                     </a>
                     . Account emails are sent via{" "}
                     <a
                        href="https://resend.com"
                        className="underline underline-offset-4"
                        target="_blank"
                        rel="noopener noreferrer"
                     >
                        Resend
                     </a>
                     . No other third-party services have access to your data.
                  </p>
               </section>

               <section className="space-y-3">
                  <h2 className="text-base font-semibold">
                     Deleting your data
                  </h2>
                  <p className="text-muted-foreground">
                     You can delete your account and all associated data at any
                     time from the account menu inside the app. Deletion is
                     immediate and permanent — we do not retain your data after
                     deletion.
                  </p>
               </section>

               <section className="space-y-3">
                  <h2 className="text-base font-semibold">Contact</h2>
                  <p className="text-muted-foreground">
                     If you have any questions about this policy or your data,
                     email us at{" "}
                     <a
                        href="mailto:adam.mcelroy15@gmail.com"
                        className="underline underline-offset-4"
                     >
                        adam.mcelroy15@gmail.com
                     </a>
                     .
                  </p>
               </section>
            </div>
         </main>

         {/* Footer */}
         <footer className="border-t py-6 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
               <span>© {new Date().getFullYear()} Willow</span>
               <Link
                  to="/privacy"
                  className="underline underline-offset-4"
               >
                  Privacy Policy
               </Link>
            </div>
         </footer>
      </div>
   );
}
