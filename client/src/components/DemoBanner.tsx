import { useState } from "react";
import { FlaskConical, RotateCcw, X } from "lucide-react";
import { isDemoMode, resetDemoData } from "@/lib/demo";

/**
 * Floating notice shown only in demo mode.
 *
 * Renders nothing in a normal build, so it's safe to mount unconditionally at
 * the router level. Collapses to a small pill rather than dismissing outright —
 * a visitor should always be able to tell the data isn't real.
 */
export default function DemoBanner() {
   const [expanded, setExpanded] = useState(true);
   const [resetting, setResetting] = useState(false);

   if (!isDemoMode) return null;

   if (!expanded) {
      return (
         <button
            type="button"
            onClick={() => setExpanded(true)}
            className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full border bg-card/95 px-3 py-1.5 shadow-lg backdrop-blur text-xs font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground"
         >
            <FlaskConical className="size-3.5" />
            Demo
         </button>
      );
   }

   return (
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 sm:max-w-sm rounded-2xl border bg-card/95 shadow-lg backdrop-blur overflow-hidden">
         <div className="flex items-start gap-3 px-4 py-3">
            <FlaskConical className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
               <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                  Demo mode
               </p>
               <p className="text-sm text-muted-foreground mt-1">
                  Sample data only — nothing is sent to a server. Your changes are saved in this
                  browser and are visible only to you.
               </p>
               <button
                  type="button"
                  disabled={resetting}
                  onClick={() => {
                     setResetting(true);
                     void resetDemoData();
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground disabled:opacity-50"
               >
                  <RotateCcw className="size-3" />
                  {resetting ? "Resetting…" : "Reset demo data"}
               </button>
            </div>
            <button
               type="button"
               onClick={() => setExpanded(false)}
               aria-label="Collapse demo notice"
               className="shrink-0 text-muted-foreground hover:text-foreground"
            >
               <X className="size-4" />
            </button>
         </div>
      </div>
   );
}
