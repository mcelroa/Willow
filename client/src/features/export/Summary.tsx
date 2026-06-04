import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageHeader } from "@/components/PageHeader";
import TourGuide from "@/components/TourGuide";
import agent from "@/lib/api/agent";
import { useCheckIn } from "@/lib/hooks/useCheckIn";
import { useQuestion } from "@/lib/hooks/useQuestion";
import { Activity, FileDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

const metricKeys = ["mood", "pain", "fatigue", "nausea"] as const;

function average(checkIns: CheckIn[], key: (typeof metricKeys)[number]) {
   if (checkIns.length === 0) return null;
   return checkIns.reduce((sum, c) => sum + c[key], 0) / checkIns.length;
}

function weightAverage(checkIns: CheckIn[]) {
   const withWeight = checkIns.filter((c) => c.weight != null);
   if (withWeight.length === 0) return null;
   return withWeight.reduce((sum, c) => sum + c.weight!, 0) / withWeight.length;
}

function formatDate(dateStr: string) {
   return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
   });
}

export default function Summary() {
   const [isExporting, setIsExporting] = useState(false);
   const { checkIns, loadingCheckIns } = useCheckIn();
   const { questions } = useQuestion();

   const handleDownload = async () => {
      setIsExporting(true);
      try {
         const blob = await agent.Export.pdf();
         const url = URL.createObjectURL(blob);
         const a = document.createElement("a");
         a.href = url;
         a.download = "willow-export.pdf";
         a.click();
         URL.revokeObjectURL(url);
      } finally {
         setIsExporting(false);
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
         <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-5">
            <PageHeader
               title="Summary"
               description="All-time overview of your health data"
               action={
                  <Button
                     id="summary-pdf"
                     onClick={handleDownload}
                     disabled={isExporting || checkIns.length === 0}
                     className="gap-1.5"
                  >
                     <FileDown className="h-4 w-4" />
                     {isExporting ? "Generating..." : "Export PDF"}
                  </Button>
               }
            />

            {loadingCheckIns ? (
               <LoadingSpinner />
            ) : checkIns.length === 0 ? (
               <EmptyState
                  icon={Activity}
                  title="No check-ins recorded yet"
                  description="Log your first daily check-in to see your health summary here."
                  action={
                     <Button asChild size="sm">
                        <Link to="/checkin">Log today's check-in</Link>
                     </Button>
                  }
               />
            ) : (
               <>
                  {/* Overview stats */}
                  <div className="rounded-2xl border bg-card overflow-hidden divide-y">
                     <div className="px-5 py-3.5">
                        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                           Overview
                        </p>
                     </div>
                     <div className="grid grid-cols-3 divide-x">
                        <div className="px-5 py-5 flex flex-col gap-1">
                           <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                              Total
                           </p>
                           <p className="text-3xl font-bold tabular-nums">{checkIns.length}</p>
                           <p className="text-xs text-muted-foreground">check-ins</p>
                        </div>
                        <div className="px-5 py-5 flex flex-col gap-1">
                           <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                              First
                           </p>
                           <p className="text-lg font-bold leading-tight">{formatDate(earliest.date)}</p>
                        </div>
                        <div className="px-5 py-5 flex flex-col gap-1">
                           <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                              Latest
                           </p>
                           <p className="text-lg font-bold leading-tight">{formatDate(latest.date)}</p>
                        </div>
                     </div>
                  </div>

                  {/* All-time averages */}
                  <div className="rounded-2xl border bg-card overflow-hidden divide-y">
                     <div className="px-5 py-3.5">
                        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                           All-time averages
                        </p>
                     </div>
                     <div className="px-5 py-5">
                        <div className="grid grid-cols-4 gap-4">
                           {metricKeys.map((key) => {
                              const avg = average(checkIns, key);
                              return (
                                 <div key={key} className="flex flex-col items-center gap-1.5 text-center">
                                    <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                                       {key}
                                    </p>
                                    <p className="text-2xl font-bold tabular-nums">
                                       {avg !== null ? avg.toFixed(1) : "–"}
                                    </p>
                                    <div className="w-full h-1 rounded-full bg-border">
                                       <div
                                          className="h-1 rounded-full bg-primary/50"
                                          style={{ width: avg !== null ? `${(avg / 10) * 100}%` : "0%" }}
                                       />
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                        {avgWeight !== null && (
                           <div className="mt-5 pt-4 border-t flex items-center justify-between">
                              <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                                 Weight
                              </p>
                              <div className="flex items-baseline gap-1.5">
                                 <span className="text-2xl font-bold tabular-nums">
                                    {avgWeight.toFixed(1)}
                                 </span>
                                 <span className="text-sm text-muted-foreground">avg kg</span>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Pending questions */}
                  <div className="rounded-2xl border bg-card overflow-hidden divide-y">
                     <div className="px-5 py-3.5 flex items-center justify-between">
                        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                           Questions for care team
                        </p>
                        <span className="text-xs text-muted-foreground tabular-nums">
                           {pendingQuestions.length} pending
                        </span>
                     </div>
                     <div className="px-5 py-4">
                        {pendingQuestions.length === 0 ? (
                           <p className="text-sm text-muted-foreground">No pending questions.</p>
                        ) : (
                           <ul className="flex flex-col gap-2.5">
                              {pendingQuestions.map((q, i) => (
                                 <li key={q.id} className="flex items-start gap-3">
                                    <span className="text-xs font-medium text-muted-foreground tabular-nums mt-0.5 w-4 shrink-0">
                                       {i + 1}.
                                    </span>
                                    <span className="text-sm leading-relaxed">{q.text}</span>
                                 </li>
                              ))}
                           </ul>
                        )}
                     </div>
                  </div>
               </>
            )}
         </div>
      </>
   );
}
