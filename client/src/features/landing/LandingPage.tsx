import { Button } from "@/components/ui/button";
import { useAccount } from "@/lib/hooks/useAccount";
import { useTheme } from "@/lib/hooks/useTheme";
import { Activity, FileText, MessageCircle, Moon, Sun, TrendingUp } from "lucide-react";
import { Link } from "react-router";

const features = [
   {
      icon: Activity,
      title: "Daily check-ins",
      description:
         "Log mood, pain, fatigue, and nausea in under a minute. Small habits build a clear picture.",
   },
   {
      icon: TrendingUp,
      title: "Spot your trends",
      description:
         "Simple charts show how your symptoms shift over days and weeks — at a glance.",
   },
   {
      icon: MessageCircle,
      title: "Question list",
      description:
         "Capture questions as they come to you between appointments. Never blank out in the exam room again.",
   },
   {
      icon: FileText,
      title: "Visit summary",
      description:
         "Export a clean snapshot of your recent symptoms and questions to share with your care team.",
   },
];

export default function LandingPage() {
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

         {/* Hero */}
         <section className="flex flex-col items-center justify-center text-center px-4 sm:px-6 py-28">
            <div className="max-w-2xl mx-auto space-y-6">
               <div className="inline-flex items-center gap-2 text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
                  <Activity className="h-3.5 w-3.5" />
                  Built for people in cancer treatment
               </div>
               <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
                  Your companion
                  <br />
                  through treatment
               </h1>
               <p className="text-lg text-muted-foreground leading-relaxed">
                  Willow helps you track daily symptoms, build a list of
                  questions for your care team, and see how you're doing over
                  time — so you feel more prepared and less alone.
               </p>
               <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  {!loadingUser &&
                     (currentUser ? (
                        <Button asChild size="lg">
                           <Link to="/checkin">Open app</Link>
                        </Button>
                     ) : (
                        <>
                           <Button asChild size="lg">
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
         <section className="py-20 px-4 sm:px-6 bg-muted/40">
            <div className="max-w-5xl mx-auto">
               <h2 className="text-2xl font-bold text-center mb-12">
                  Everything you need between appointments
               </h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {features.map(({ icon: Icon, title, description }) => (
                     <div
                        key={title}
                        className="bg-card rounded-xl p-6 border flex flex-col gap-3"
                     >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                           <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">{title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                           {description}
                        </p>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* Bottom CTA */}
         {!loadingUser && !currentUser && (
            <section className="py-24 px-4 sm:px-6 text-center">
               <div className="max-w-lg mx-auto space-y-4">
                  <h2 className="text-2xl font-bold">Ready to start tracking?</h2>
                  <p className="text-muted-foreground">
                     It takes less than a minute to set up.
                  </p>
                  <div className="pt-2">
                     <Button asChild size="lg">
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
               <span>Made for people who deserve better tools</span>
            </div>
         </footer>
      </div>
   );
}
