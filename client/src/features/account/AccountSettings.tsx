import { PageHeader } from "@/components/PageHeader";
import TourGuide from "@/components/TourGuide";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAccount } from "@/lib/hooks/useAccount";

export default function AccountSettings() {
   const { currentUser, updateSettings, resetTours } = useAccount();

   const tourSteps = [
      {
         target: "body",
         placement: "center" as const,
         content: "Account Settings is where you manage your notification preferences.",
         disableBeacon: true,
      },
      {
         target: "#reminder-toggle",
         content: "Turn this on to receive a daily email reminder if you haven't logged a check-in by 6 PM UTC. You can turn it off any time.",
         disableBeacon: true,
      },
   ];

   return (
      <>
         <TourGuide pageName="account-settings" steps={tourSteps} />
         <div className="max-w-xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-5">
            <PageHeader title="Account settings" description="Manage your notification preferences" />

            <div className="rounded-2xl border bg-card overflow-hidden divide-y">
               <div className="px-5 py-3.5">
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                     Notifications
                  </p>
               </div>
               <div className="px-5 py-4 flex items-center justify-between gap-4" id="reminder-toggle">
                  <div className="flex flex-col gap-1">
                     <p className="text-sm font-medium">Daily check-in reminder</p>
                     <p className="text-xs text-muted-foreground">
                        Receive an email if you haven't checked in by 6 PM UTC.
                     </p>
                  </div>
                  <Switch
                     checked={currentUser?.reminderEnabled ?? false}
                     onCheckedChange={(checked) =>
                        updateSettings.mutate({ reminderEnabled: checked })
                     }
                     disabled={updateSettings.isPending}
                  />
               </div>
               {updateSettings.isError && (
                  <div className="px-5 py-3.5">
                     <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
                  </div>
               )}
            </div>

            <div className="rounded-2xl border bg-card overflow-hidden divide-y">
               <div className="px-5 py-3.5">
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                     App tour
                  </p>
               </div>
               <div className="px-5 py-4 flex items-center justify-between gap-4">
                  <p className="text-xs text-muted-foreground">
                     Replay the guided walkthrough on each page.
                  </p>
                  <Button
                     variant="outline"
                     size="sm"
                     onClick={() => resetTours.mutate()}
                     disabled={resetTours.isPending}
                  >
                     {resetTours.isPending ? "Resetting..." : "Retake tour"}
                  </Button>
               </div>
               {resetTours.isError && (
                  <div className="px-5 py-3.5">
                     <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
                  </div>
               )}
            </div>
         </div>
      </>
   );
}
