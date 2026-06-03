import { Button } from "@/components/ui/button";
import { useAccount } from "@/lib/hooks/useAccount";
import { useTheme } from "@/lib/hooks/useTheme";
import { Activity, FileText, MessageCircle, Moon, Pill, Share2, Sun, TrendingUp } from "lucide-react";
import { Link } from "react-router";

const features = [
   {
      icon: Activity,
      title: "Daily check-ins",
      description: "Log mood, pain, fatigue, and nausea in under a minute. Small habits build a clear picture.",
   },
   {
      icon: TrendingUp,
      title: "Spot your trends",
      description: "Simple charts show how your symptoms shift over days and weeks — at a glance.",
   },
   {
      icon: MessageCircle,
      title: "Question list",
      description: "Capture questions as they come to you between appointments. Never blank out in the exam room again.",
   },
   {
      icon: FileText,
      title: "Visit summary",
      description: "Export a clean snapshot of your recent symptoms and questions to share with your care team.",
   },
   {
      icon: Pill,
      title: "Medication tracker",
      description: "Log your treatment schedule and get reminders on check-in days so nothing slips through.",
   },
   {
      icon: Share2,
      title: "Caregiver sharing",
      description: "Generate a private link so family or your care team can see your data — no account needed.",
   },
];

export default function LandingPage() {
   const { currentUser, loadingUser } = useAccount();
   const { isDark, toggleTheme } = useTheme();

   return (
      <div className="relative min-h-screen flex flex-col">
         {/* Full-page dot grid */}
         <div
            className="absolute inset-0 -z-10 dot-grid pointer-events-none"
            style={{ backgroundSize: "32px 32px" }}
         />

         {/* Nav */}
         <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
               <Link to="/" className="font-semibold text-primary text-lg tracking-tight">
                  Willow
               </Link>
               <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={toggleTheme}>
                     {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
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

         {/* Hero */}
         <section className="relative flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-32 pb-28">
            {/* Soft primary glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-72 w-[520px] rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
            <div className="max-w-2xl mx-auto space-y-6">
               <div className="inline-flex items-center gap-2 text-sm text-primary font-medium bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                  <Activity className="h-3.5 w-3.5" />
                  Built for people in cancer treatment
               </div>
               <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1]">
                  Your companion
                  <br />
                  through treatment
               </h1>
               <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
                  Willow helps you track daily symptoms, build a list of questions for your care
                  team, and see how you're doing over time — so you feel more prepared and less alone.
               </p>
               <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  {!loadingUser &&
                     (currentUser ? (
                        <Button asChild size="lg">
                           <Link to="/checkin">Open app</Link>
                        </Button>
                     ) : (
                        <>
                           <Button asChild size="lg" className="px-8">
                              <Link to="/register">Get started free</Link>
                           </Button>
                           <Button asChild variant="outline" size="lg">
                              <Link to="/login">Log in</Link>
                           </Button>
                        </>
                     ))}
               </div>
            </div>
         </section>

         {/* Features */}
         <section className="py-20 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
               <div className="text-center mb-12 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                     What's inside
                  </p>
                  <h2 className="text-2xl font-bold">Everything you need between appointments</h2>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {features.map(({ icon: Icon, title, description }) => (
                     <div
                        key={title}
                        className="bg-card/80 backdrop-blur-sm rounded-xl p-6 border border-border/80 flex flex-col gap-3 shadow-sm"
                     >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                           <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">{title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* CTA */}
         {!loadingUser && !currentUser && (
            <section className="py-16 px-4 sm:px-6">
               <div className="max-w-lg mx-auto text-center bg-card/80 backdrop-blur-sm border border-border rounded-2xl px-8 py-12 shadow-sm space-y-4">
                  <h2 className="text-2xl font-bold">Ready to start tracking?</h2>
                  <p className="text-muted-foreground">Free. Takes less than a minute to set up.</p>
                  <div className="pt-2">
                     <Button asChild size="lg" className="px-8">
                        <Link to="/register">Get started free</Link>
                     </Button>
                  </div>
               </div>
            </section>
         )}

         {/* Footer */}
         <footer className="border-t py-6 px-4 sm:px-6 mt-auto">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
               <span>© {new Date().getFullYear()} Willow</span>
               <Link
                  to="/privacy"
                  className="underline underline-offset-4 hover:text-foreground transition-colors"
               >
                  Privacy Policy
               </Link>
            </div>
         </footer>
      </div>
   );
}
