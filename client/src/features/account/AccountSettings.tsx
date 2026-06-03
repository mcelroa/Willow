import { PageHeader } from "@/components/PageHeader";
import TourGuide from "@/components/TourGuide";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
      <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-6">
         <PageHeader title="Account settings" description="Manage your notification preferences" />

         <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
               <Label htmlFor="reminder-toggle" className="text-base">
                  Daily check-in reminder
               </Label>
               <p className="text-sm text-muted-foreground">
                  Receive an email if you haven't checked in by 6 PM UTC.
               </p>
            </div>
            <Switch
               id="reminder-toggle"
               checked={currentUser?.reminderEnabled ?? false}
               onCheckedChange={(checked) =>
                  updateSettings.mutate({ reminderEnabled: checked })
               }
               disabled={updateSettings.isPending}
            />
         </div>

         {updateSettings.isError && (
            <p className="mt-4 text-sm text-destructive">
               Something went wrong. Please try again.
            </p>
         )}

         <div className="mt-8 pt-6 border-t flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
               <p className="text-base font-medium">App tour</p>
               <p className="text-sm text-muted-foreground">
                  Replay the guided walkthrough on each page.
               </p>
            </div>
            <Button
               variant="outline"
               onClick={() => resetTours.mutate()}
               disabled={resetTours.isPending}
            >
               {resetTours.isPending ? "Resetting..." : "Retake tour"}
            </Button>
         </div>

         {resetTours.isError && (
            <p className="mt-2 text-sm text-destructive">
               Something went wrong. Please try again.
            </p>
         )}
      </div>
      </>
   );
}
