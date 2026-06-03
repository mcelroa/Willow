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
import { PageHeader } from "@/components/PageHeader";
import TourGuide from "@/components/TourGuide";
import { useCheckIn } from "@/lib/hooks/useCheckIn";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const metrics = [
   { key: "mood", color: "#3b82f6" },
   { key: "pain", color: "#ef4444" },
   { key: "fatigue", color: "#22c55e" },
   { key: "nausea", color: "#8b5cf6" },
] as const;

const PAGE_SIZE = 5;

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
   const [page, setPage] = useState(1);

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

   const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
   // Clamp in case a deletion removed the last item on the final page.
   const currentPage = Math.min(page, totalPages);
   const pageItems = sorted.slice(
      (currentPage - 1) * PAGE_SIZE,
      currentPage * PAGE_SIZE,
   );

   const tourSteps = [
      {
         target: "body",
         placement: "center" as const,
         content: "The History page shows all your past check-ins, newest first.",
         disableBeacon: true,
      },
      {
         target: "body",
         placement: "center" as const,
         content: "Each entry shows your symptom scores for that day. You can tap Edit to change an entry, or Delete to remove it. Use the Previous and Next buttons to browse older records.",
         disableBeacon: true,
      },
   ];

   return (
      <>
      <TourGuide pageName="history" steps={tourSteps} />
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-3">
         <PageHeader title="History" description="Your past check-ins" />
         {pageItems.map((checkIn) => (
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
                        <div key={key} className="flex flex-col items-center">
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
         {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 mt-3">
               <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage <= 1}
               >
                  Previous
               </Button>
               <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
               </span>
               <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
               >
                  Next
               </Button>
            </div>
         )}
      </div>
      </>
   );
}
