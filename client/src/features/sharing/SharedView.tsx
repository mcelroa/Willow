import {
   ChartContainer,
   ChartLegend,
   ChartLegendContent,
   ChartTooltip,
   ChartTooltipContent,
   type ChartConfig,
} from "@/components/ui/chart";
import { WillowMark } from "@/components/WillowMark";
import agent from "@/lib/api/agent";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useParams } from "react-router";
import {
   Area,
   AreaChart,
   CartesianGrid,
   XAxis,
   YAxis,
} from "recharts";

const chartConfig = {
   mood: { label: "Mood", color: "#3b82f6" },
   pain: { label: "Pain", color: "#ef4444" },
   fatigue: { label: "Fatigue", color: "#22c55e" },
   nausea: { label: "Nausea", color: "#8b5cf6" },
} satisfies ChartConfig;

const weightChartConfig = {
   weight: { label: "Weight (kg)", color: "#f59e0b" },
} satisfies ChartConfig;

const metricKeys = ["mood", "pain", "fatigue", "nausea"] as const;

function formatDate(iso: string) {
   return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
   });
}

export default function SharedView() {
   const { token } = useParams<{ token: string }>();

   useEffect(() => {
      const meta = document.createElement("meta");
      meta.name = "robots";
      meta.content = "noindex";
      document.head.appendChild(meta);
      return () => {
         document.head.removeChild(meta);
      };
   }, []);

   const { data, isLoading, isError } = useQuery({
      queryKey: ["sharedView", token],
      queryFn: () => agent.Sharing.getSharedView(token!),
      retry: false,
   });

   if (isLoading) {
      return (
         <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <WillowMark size={36} className="text-muted-foreground animate-pulse" />
            <p className="text-sm text-muted-foreground">Loading health data…</p>
         </div>
      );
   }

   if (isError || !data) {
      return (
         <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
            <WillowMark size={44} className="text-muted-foreground/40" />
            <div>
               <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">
                  Unavailable
               </p>
               <h1 className="text-xl font-bold tracking-tight">Link not found</h1>
               <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                  This share link has expired, been revoked, or doesn't exist.
               </p>
            </div>
         </div>
      );
   }

   const sorted = [...data.checkIns].sort((a, b) => a.date.localeCompare(b.date));

   const chartData = sorted.map((c) => ({
      date: new Date(c.date).toLocaleDateString("en-GB", {
         day: "numeric",
         month: "short",
      }),
      mood: c.mood,
      pain: c.pain,
      fatigue: c.fatigue,
      nausea: c.nausea,
   }));

   const weightData = sorted
      .filter((c) => c.weight != null)
      .map((c) => ({
         date: new Date(c.date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
         }),
         weight: c.weight,
      }));

   return (
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-5">
         {/* Header */}
         <div className="flex items-start justify-between gap-4">
            <div>
               <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1">
                  Health data · Read-only
               </p>
               <h1 className="text-2xl font-bold tracking-tight">{data.ownerName}</h1>
               {data.earliestDate && data.latestDate && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                     {formatDate(data.earliestDate)} – {formatDate(data.latestDate)}
                  </p>
               )}
            </div>
            <WillowMark size={36} className="text-muted-foreground/30 shrink-0 mt-1" />
         </div>

         {/* Metric averages */}
         {data.averages && (
            <div className="rounded-2xl border bg-card overflow-hidden divide-y">
               <div className="px-5 py-3.5">
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                     Average scores
                  </p>
               </div>
               <div className="px-5 py-5">
                  <div className="grid grid-cols-4 gap-4">
                     {metricKeys.map((key) => {
                        const avg = data.averages![key];
                        return (
                           <div key={key} className="flex flex-col items-center gap-1.5 text-center">
                              <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                                 {key}
                              </p>
                              <p className="text-2xl font-bold tabular-nums">{avg.toFixed(1)}</p>
                              <div className="w-full h-1 rounded-full bg-border">
                                 <div
                                    className="h-1 rounded-full bg-primary/50"
                                    style={{ width: `${(avg / 10) * 100}%` }}
                                 />
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>
            </div>
         )}

         {/* Symptoms chart */}
         {chartData.length >= 2 && (
            <div className="rounded-2xl border bg-card overflow-hidden">
               <div className="border-b px-5 py-3.5">
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                     Symptoms over time
                  </p>
               </div>
               <div className="px-5 py-5">
                  <ChartContainer config={chartConfig} className="h-64 w-full">
                     <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                           dataKey="date"
                           tickLine={false}
                           axisLine={false}
                           tick={{ fontSize: 11 }}
                        />
                        <YAxis
                           domain={[1, 10]}
                           tickLine={false}
                           axisLine={false}
                           tick={{ fontSize: 11 }}
                           width={24}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        {metricKeys.map((key) => (
                           <Area
                              key={key}
                              type="monotone"
                              dataKey={key}
                              stroke={`var(--color-${key})`}
                              strokeWidth={2}
                              fill={`var(--color-${key})`}
                              fillOpacity={0.08}
                              dot={false}
                           />
                        ))}
                     </AreaChart>
                  </ChartContainer>
               </div>
            </div>
         )}

         {/* Weight chart */}
         {weightData.length >= 2 && (
            <div className="rounded-2xl border bg-card overflow-hidden">
               <div className="border-b px-5 py-3.5">
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                     Weight (kg)
                  </p>
               </div>
               <div className="px-5 py-5">
                  <ChartContainer config={weightChartConfig} className="h-48 w-full">
                     <AreaChart data={weightData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                           dataKey="date"
                           tickLine={false}
                           axisLine={false}
                           tick={{ fontSize: 11 }}
                        />
                        <YAxis
                           domain={["dataMin - 1", "dataMax + 1"]}
                           tickLine={false}
                           axisLine={false}
                           tick={{ fontSize: 11 }}
                           width={36}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                           type="monotone"
                           dataKey="weight"
                           stroke="var(--color-weight)"
                           strokeWidth={2}
                           fill="var(--color-weight)"
                           fillOpacity={0.08}
                           dot={false}
                        />
                     </AreaChart>
                  </ChartContainer>
               </div>
            </div>
         )}

         {/* Pending questions */}
         {data.pendingQuestions.length > 0 && (
            <div className="rounded-2xl border bg-card overflow-hidden divide-y">
               <div className="px-5 py-3.5">
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                     Questions for care team
                  </p>
               </div>
               <div className="px-5 py-4 flex flex-col gap-2.5">
                  {data.pendingQuestions.map((q, i) => (
                     <div key={q.id} className="flex items-start gap-3">
                        <span className="text-xs font-medium text-muted-foreground tabular-nums mt-0.5 w-4 shrink-0">
                           {i + 1}.
                        </span>
                        <p className="text-sm leading-relaxed">{q.text}</p>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {data.checkIns.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No check-ins recorded yet.</p>
         )}

         <p className="text-xs text-center text-muted-foreground pt-2">
            Shared via Willow · Read-only view
         </p>
      </div>
   );
}
