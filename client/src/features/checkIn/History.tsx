import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCheckIn } from "@/lib/hooks/useCheckIn";
import { useNavigate } from "react-router";

const metrics = ["mood", "pain", "fatigue", "nausea"] as const;

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
      <div className="max-w-2xl mx-auto m-6 flex flex-col gap-3">
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
                        <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => deleteCheckIn.mutate(checkIn.id)}
                           disabled={deleteCheckIn.isPending}
                        >
                           Delete
                        </Button>
                     </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-3">
                     {metrics.map((metric) => (
                        <div
                           key={metric}
                           className="flex flex-col items-center"
                        >
                           <span className="text-xs text-muted-foreground capitalize">
                              {metric}
                           </span>
                           <span className="text-lg font-semibold">
                              {checkIn[metric]}
                           </span>
                        </div>
                     ))}
                  </div>
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
