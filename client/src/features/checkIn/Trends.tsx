import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageHeader } from "@/components/PageHeader";
import {
   ChartContainer,
   ChartLegend,
   ChartLegendContent,
   ChartTooltip,
   ChartTooltipContent,
   type ChartConfig,
} from "@/components/ui/chart";
import TourGuide from "@/components/TourGuide";
import { useCheckIn } from "@/lib/hooks/useCheckIn";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

type Filter = "week" | "month" | "all";

const chartConfig = {
   mood: { label: "Mood", color: "#3b82f6" },
   pain: { label: "Pain", color: "#ef4444" },
   fatigue: { label: "Fatigue", color: "#22c55e" },
   nausea: { label: "Nausea", color: "#8b5cf6" },
} satisfies ChartConfig;

const metricKeys = ["mood", "pain", "fatigue", "nausea"] as const;

const weightChartConfig = {
   weight: { label: "Weight (kg)", color: "#f59e0b" },
} satisfies ChartConfig;

function getFilteredCheckIns(checkIns: CheckIn[], filter: Filter) {
   if (filter === "all") return checkIns;
   const now = new Date();
   const cutoff = new Date(now);
   if (filter === "week") cutoff.setDate(now.getDate() - 7);
   if (filter === "month") cutoff.setDate(now.getDate() - 30);
   return checkIns.filter((c) => new Date(c.date) >= cutoff);
}

function average(checkIns: CheckIn[], key: (typeof metricKeys)[number]) {
   if (checkIns.length === 0) return "-";
   const avg = checkIns.reduce((sum, c) => sum + c[key], 0) / checkIns.length;
   return avg.toFixed(1);
}

function getTrend(data: number[]): "up" | "down" | "flat" {
   if (data.length < 3) return "flat";
   const half = Math.floor(data.length / 2);
   const firstAvg = data.slice(0, half).reduce((a, b) => a + b, 0) / half;
   const secondAvg = data.slice(half).reduce((a, b) => a + b, 0) / (data.length - half);
   const delta = secondAvg - firstAvg;
   if (Math.abs(delta) < 0.5) return "flat";
   return delta > 0 ? "up" : "down";
}

function Sparkline({ data }: { data: number[] }) {
   if (data.length < 2) return null;
   const W = 56;
   const H = 20;
   const min = Math.min(...data);
   const max = Math.max(...data);
   const range = max - min || 1;
   const pts = data
      .map((v, i) => {
         const x = (i / (data.length - 1)) * W;
         const y = H - ((v - min) / range) * H * 0.8 - H * 0.1;
         return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
   return (
      <svg width={W} height={H} className="text-muted-foreground/40 shrink-0">
         <polyline
            points={pts}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   );
}

function TrendIcon({ direction }: { direction: "up" | "down" | "flat" }) {
   if (direction === "up") return <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />;
   if (direction === "down") return <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />;
   return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

export default function Trends() {
   const { checkIns, loadingCheckIns } = useCheckIn();
   const [filter, setFilter] = useState<Filter>("month");

   if (loadingCheckIns) return <LoadingSpinner />;

   const filtered = getFilteredCheckIns(checkIns, filter);
   const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date));

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

   const tourSteps = [
      {
         target: "body",
         placement: "center" as const,
         content: "Trends shows how your symptoms have changed over time, so you and your care team can spot patterns.",
         disableBeacon: true,
      },
      {
         target: "#trends-filter",
         content: "Switch between the last 7 days, 30 days, or all time to focus on different periods.",
         disableBeacon: true,
      },
      {
         target: "#trends-stats",
         content: "These cards show your average score for each symptom in the selected period.",
         disableBeacon: true,
      },
   ];

   return (
      <>
         <TourGuide pageName="trends" steps={tourSteps} />
         <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-6">
            <PageHeader
               title="Trends"
               description="How your symptoms change over time"
               action={
                  <div id="trends-filter" className="flex gap-1">
                     {(["week", "month", "all"] as Filter[]).map((f) => (
                        <Button
                           key={f}
                           variant={filter === f ? "default" : "ghost"}
                           size="sm"
                           onClick={() => setFilter(f)}
                        >
                           {f === "week" ? "7 days" : f === "month" ? "30 days" : "All time"}
                        </Button>
                     ))}
                  </div>
               }
            />

            <div id="trends-stats" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
               {metricKeys.map((key) => {
                  const metricData = sorted.map((c) => c[key]);
                  const trend = getTrend(metricData);
                  return (
                     <div key={key} className="rounded-2xl border bg-card px-5 py-4">
                        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2 capitalize">
                           {key}
                        </p>
                        <div className="flex items-baseline gap-1.5 mb-3">
                           <p className="text-3xl font-bold tabular-nums leading-none">
                              {average(filtered, key)}
                           </p>
                           {filtered.length > 0 && (
                              <span className="text-xs text-muted-foreground">/ 10</span>
                           )}
                        </div>
                        <div className="flex items-end justify-between">
                           <Sparkline data={metricData} />
                           <TrendIcon direction={trend} />
                        </div>
                     </div>
                  );
               })}
            </div>

            {chartData.length < 2 ? (
               <EmptyState
                  icon={TrendingUp}
                  title="Not enough data"
                  description="Log at least two check-ins in this period to see your trend chart."
               />
            ) : (
               <div className="rounded-2xl border bg-card overflow-hidden">
                  <div className="px-6 py-4 border-b">
                     <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                        Over time
                     </p>
                  </div>
                  <div className="px-2 py-4">
                     <ChartContainer config={chartConfig} className="h-72 w-full">
                        <AreaChart data={chartData}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} />
                           <XAxis
                              dataKey="date"
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 12 }}
                           />
                           <YAxis
                              domain={[1, 10]}
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 12 }}
                           />
                           <ChartTooltip content={<ChartTooltipContent />} />
                           <ChartLegend content={<ChartLegendContent />} />
                           {metricKeys.map((key) => (
                              <Area
                                 key={key}
                                 type="monotone"
                                 dataKey={key}
                                 stroke={`var(--color-${key})`}
                                 fill={`var(--color-${key})`}
                                 fillOpacity={0.08}
                                 strokeWidth={2}
                                 dot={false}
                              />
                           ))}
                        </AreaChart>
                     </ChartContainer>
                  </div>
               </div>
            )}

            {weightData.length >= 2 && (
               <div className="rounded-2xl border bg-card overflow-hidden">
                  <div className="px-6 py-4 border-b">
                     <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                        Weight{" "}
                        <span className="normal-case font-normal tracking-normal">(kg)</span>
                     </p>
                  </div>
                  <div className="px-2 py-4">
                     <ChartContainer config={weightChartConfig} className="h-72 w-full">
                        <LineChart data={weightData}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} />
                           <XAxis
                              dataKey="date"
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 12 }}
                           />
                           <YAxis
                              domain={["dataMin - 1", "dataMax + 1"]}
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 12 }}
                              width={40}
                           />
                           <ChartTooltip content={<ChartTooltipContent />} />
                           <Line
                              type="monotone"
                              dataKey="weight"
                              stroke="var(--color-weight)"
                              strokeWidth={2}
                              dot={false}
                           />
                        </LineChart>
                     </ChartContainer>
                  </div>
               </div>
            )}
         </div>
      </>
   );
}
