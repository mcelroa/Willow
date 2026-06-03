import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import TourGuide from "@/components/TourGuide";
import agent from "@/lib/api/agent";
import { useCheckIn } from "@/lib/hooks/useCheckIn";
import { useQuestion } from "@/lib/hooks/useQuestion";
import { useState } from "react";

const metricKeys = ["mood", "pain", "fatigue", "nausea"] as const;

function average(checkIns: CheckIn[], key: (typeof metricKeys)[number]) {
   if (checkIns.length === 0) return "-";
   const avg = checkIns.reduce((sum, c) => sum + c[key], 0) / checkIns.length;
   return avg.toFixed(1);
}

function weightAverage(checkIns: CheckIn[]) {
   const withWeight = checkIns.filter((c) => c.weight != null);
   if (withWeight.length === 0) return null;
   const avg = withWeight.reduce((sum, c) => sum + c.weight!, 0) / withWeight.length;
   return avg.toFixed(1);
}

function formatDate(dateStr: string) {
   return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
   });
}

export default function Summary() {
   const [isLoading, setIsLoading] = useState(false);
   const { checkIns, loadingCheckIns } = useCheckIn();
   const { questions } = useQuestion();

   const handleDownload = async () => {
      setIsLoading(true);
      try {
         const blob = await agent.Export.pdf();
         const url = URL.createObjectURL(blob);
         const a = document.createElement("a");
         a.href = url;
         a.download = "willow-export.pdf";
         a.click();
         URL.revokeObjectURL(url);
      } finally {
         setIsLoading(false);
      }
   };

   const sorted = [...checkIns].sort((a, b) => a.date.localeCompare(b.date));
   const pendingQuestions = questions.filter((q) => !q.isAsked);
   const earliest = sorted[0];
   const latest = sorted[sorted.length - 1];
   const avgWeight = weightAverage(checkIns);

   const tourSteps = [
      {
         target: "body",
         placement: "center" as const,
         content: "The Summary page gives you an overview of all your recorded data in one place — total check-ins, first and latest dates, and all-time averages for each symptom.",
         disableBeacon: true,
      },
      {
         target: "#summary-pdf",
         content: "Use Export as PDF to download a full report you can print or bring to your next appointment.",
         disableBeacon: true,
      },
   ];

   return (
      <>
      <TourGuide pageName="summary" steps={tourSteps} />
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
         <PageHeader
            title="Summary"
            description="All-time overview of your health data"
            action={
               <Button id="summary-pdf" onClick={handleDownload} disabled={isLoading}>
                  {isLoading ? "Generating..." : "Export as PDF"}
               </Button>
            }
         />

         {loadingCheckIns ? (
            <p className="text-center text-muted-foreground">Loading...</p>
         ) : checkIns.length === 0 ? (
            <p className="text-muted-foreground">No check-ins recorded yet.</p>
         ) : (
            <>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Card>
                     <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                           Total check-ins
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-2xl font-bold">{checkIns.length}</p>
                     </CardContent>
                  </Card>
                  <Card>
                     <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                           First check-in
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-lg font-bold">{formatDate(earliest.date)}</p>
                     </CardContent>
                  </Card>
                  <Card>
                     <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                           Latest check-in
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-lg font-bold">{formatDate(latest.date)}</p>
                     </CardContent>
                  </Card>
               </div>

               <div>
                  <h2 className="text-sm font-medium text-muted-foreground mb-3">
                     All-time averages
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                     {metricKeys.map((key) => (
                        <Card key={key}>
                           <CardHeader className="pb-1">
                              <CardTitle className="text-sm font-medium text-muted-foreground capitalize">
                                 {key}
                              </CardTitle>
                           </CardHeader>
                           <CardContent>
                              <p className="text-2xl font-bold">{average(checkIns, key)}</p>
                              <p className="text-xs text-muted-foreground">avg / 10</p>
                           </CardContent>
                        </Card>
                     ))}
                     {avgWeight != null && (
                        <Card>
                           <CardHeader className="pb-1">
                              <CardTitle className="text-sm font-medium text-muted-foreground">
                                 Weight
                              </CardTitle>
                           </CardHeader>
                           <CardContent>
                              <p className="text-2xl font-bold">{avgWeight}</p>
                              <p className="text-xs text-muted-foreground">avg kg</p>
                           </CardContent>
                        </Card>
                     )}
                  </div>
               </div>

               <Card>
                  <CardHeader className="pb-1">
                     <CardTitle className="text-sm font-medium text-muted-foreground">
                        Pending questions ({pendingQuestions.length})
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     {pendingQuestions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No pending questions.</p>
                     ) : (
                        <ul className="flex flex-col gap-2">
                           {pendingQuestions.map((q, i) => (
                              <li key={q.id} className="flex items-start gap-3 rounded-md bg-muted px-3 py-2">
                                 <span className="text-xs font-medium text-muted-foreground mt-0.5 w-4 shrink-0">
                                    {i + 1}.
                                 </span>
                                 <span className="text-sm">{q.text}</span>
                              </li>
                           ))}
                        </ul>
                     )}
                  </CardContent>
               </Card>
            </>
         )}
      </div>
      </>
   );
}
