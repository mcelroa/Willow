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
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageHeader } from "@/components/PageHeader";
import TourGuide from "@/components/TourGuide";
import { useCheckIn } from "@/lib/hooks/useCheckIn";
import { ClipboardList } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

const metrics = ["mood", "pain", "fatigue", "nausea"] as const;

const PAGE_SIZE = 5;

function formatDate(dateStr: string) {
   return new Date(dateStr + "T12:00:00").toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
   });
}


export default function History() {
   const { checkIns, loadingCheckIns, deleteCheckIn } = useCheckIn();
   const navigate = useNavigate();
   const [page, setPage] = useState(1);

   if (loadingCheckIns) return <LoadingSpinner />;

   if (checkIns.length === 0)
      return (
         <EmptyState
            icon={ClipboardList}
            title="No check-ins yet"
            description="Start tracking how you feel by logging your first daily check-in."
            action={
               <Button asChild size="sm">
                  <Link to="/checkin">Log today's check-in</Link>
               </Button>
            }
         />
      );

   const sorted = [...checkIns].sort((a, b) => b.date.localeCompare(a.date));

   const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
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
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-3">
         <div className="mb-1">
            <PageHeader title="History" description="Your past check-ins" />
         </div>

         {pageItems.map((checkIn) => (
            <div key={checkIn.id} className="rounded-2xl border bg-card overflow-hidden">
               <div className="flex items-center justify-between px-5 py-3.5 border-b">
                  <p className="font-semibold text-sm">{formatDate(checkIn.date)}</p>
                  <div className="flex gap-1 -mr-1.5">
                     <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => navigate(`/history/${checkIn.id}`)}
                     >
                        Edit
                     </Button>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive"
                           >
                              Delete
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                           <AlertDialogHeader>
                              <AlertDialogTitle>Delete this check-in?</AlertDialogTitle>
                              <AlertDialogDescription>
                                 This action cannot be undone.
                              </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                 onClick={() =>
                                    deleteCheckIn.mutate(checkIn.id, {
                                       onSuccess: () => toast.success("Check-in deleted."),
                                       onError: () => toast.error("Something went wrong."),
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

               <div className="grid grid-cols-4 px-5 py-4 gap-2">
                  {metrics.map((key) => (
                     <div key={key} className="text-center">
                        <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-1.5">
                           {key}
                        </p>
                        <p className="text-2xl font-bold tabular-nums">
                           {checkIn[key]}
                        </p>
                     </div>
                  ))}
               </div>

               {(checkIn.weight != null || checkIn.notes) && (
                  <div className="border-t px-5 py-3.5 flex flex-col gap-1.5">
                     {checkIn.weight != null && (
                        <p className="text-sm text-muted-foreground">
                           Weight:{" "}
                           <span className="font-semibold text-foreground">
                              {checkIn.weight} kg
                           </span>
                        </p>
                     )}
                     {checkIn.notes && (
                        <p className="text-sm text-muted-foreground">{checkIn.notes}</p>
                     )}
                  </div>
               )}
            </div>
         ))}

         {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 mt-2">
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
