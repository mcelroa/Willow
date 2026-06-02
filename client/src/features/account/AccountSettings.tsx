import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAccount } from "@/lib/hooks/useAccount";

export default function AccountSettings() {
   const { currentUser, updateSettings } = useAccount();

   return (
      <div className="max-w-md mx-auto px-4 py-8">
         <h1 className="text-xl font-semibold mb-6">Account settings</h1>

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
      </div>
   );
}
