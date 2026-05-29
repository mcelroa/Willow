import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCheckIn } from "@/lib/hooks/useCheckIn";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const metrics = [
   { key: "mood", color: "#3b82f6" },
   { key: "pain", color: "#ef4444" },
   { key: "fatigue", color: "#22c55e" },
   { key: "nausea", color: "#8b5cf6" },
] as const;

function formatDate(dateStr: string) {
   return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
   });
}

export default function History() {
   const { checkIns, loadingCheckIns, deleteCheckIn } = useCheckIn();
   const navigate = useNavigate();

   if (loadingCheckIns)
      return (
         <p className="text-center mt-12 text-muted-foreground">Loading...</p>
      );

   if (checkIns.length === 0)
      return (
         <p className="text-center mt-12 text-muted-foreground">
            No check-ins yet
         </p>
      );

   const sorted = [...checkIns].sort((a, b) => b.date.localeCompare(a.date));

   return (
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-3">
         <h1 className="text-xl font-semibold">History</h1>
         {sorted.map((checkIn) => (
            <Card key={checkIn.id}>
               <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                     <p className="font-medium">{formatDate(checkIn.date)}</p>
                     <div className="flex gap-2">
                        <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => navigate(`/history/${checkIn.id}`)}
                        >
                           Edit
                        </Button>
                        <AlertDialog>
                           <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                 Delete
                              </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                              <AlertDialogHeader>
                                 <AlertDialogTitle>
                                    Delete this check-in?
                                 </AlertDialogTitle>
                                 <AlertDialogDescription>
                                    This action cannot be undone.
                                 </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                 <AlertDialogCancel>Cancel</AlertDialogCancel>
                                 <AlertDialogAction
                                    onClick={() =>
                                       deleteCheckIn.mutate(checkIn.id, {
                                          onSuccess: () =>
                                             toast.success("Check-in deleted."),
                                          onError: () =>
                                             toast.error(
                                                "Something went wrong.",
                                             ),
                                       })
                                    }
                                 >
                                    Delete
                                 </AlertDialogAction>
                              </AlertDialogFooter>
                           </AlertDialogContent>
                        </AlertDialog>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                     {metrics.map(({ key, color }) => (
                        <div
                           key={key}
                           className="flex flex-col items-center"
                        >
                           <span className="flex items-center gap-1 text-xs text-muted-foreground capitalize">
                              <span
                                 className="inline-block w-2 h-2 rounded-full shrink-0"
                                 style={{ backgroundColor: color }}
                              />
                              {key}
                           </span>
                           <span className="text-lg font-semibold">
                              {checkIn[key]}
                           </span>
                        </div>
                     ))}
                  </div>
                  {checkIn.weight != null && (
                     <p className="text-sm text-muted-foreground mt-3">
                        Weight:{" "}
                        <span className="font-semibold text-foreground">
                           {checkIn.weight} kg
                        </span>
                     </p>
                  )}
                  {checkIn.notes && (
                     <p className="text-sm text-muted-foreground mt-3 border-t pt-3">
                        {checkIn.notes}
                     </p>
                  )}
               </CardContent>
            </Card>
         ))}
      </div>
   );
}
