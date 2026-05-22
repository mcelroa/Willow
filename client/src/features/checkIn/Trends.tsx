import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
   ChartContainer,
   ChartLegend,
   ChartLegendContent,
   ChartTooltip,
   ChartTooltipContent,
   type ChartConfig,
} from "@/components/ui/chart";
import { useCheckIn } from "@/lib/hooks/useCheckIn";
import { useState } from "react";
import { CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts";

type Filter = "week" | "month" | "all";

const chartConfig = {
   mood: { label: "Mood", color: "#3b82f6" },
   pain: { label: "Pain", color: "#ef4444" },
   fatigue: { label: "Fatigue", color: "#22c55e" },
   nausea: { label: "Nausea", color: "#8b5cf6" },
} satisfies ChartConfig;

const metricKeys = ["mood", "pain", "fatigue", "nausea"] as const;

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

export default function Trends() {
   const { checkIns, loadingCheckIns } = useCheckIn();
   const [filter, setFilter] = useState<Filter>("month");

   if (loadingCheckIns)
      return (
         <p className="text-center mt-12 text-muted-foreground">Loading...</p>
      );

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

   return (
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
         <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Trends</h1>
            <div className="flex gap-1">
               {(["week", "month", "all"] as Filter[]).map((f) => (
                  <Button
                     key={f}
                     variant={filter === f ? "default" : "ghost"}
                     size="sm"
                     onClick={() => setFilter(f)}
                  >
                     {f === "week"
                        ? "7 days"
                        : f === "month"
                          ? "30 days"
                          : "All time"}
                  </Button>
               ))}
            </div>
         </div>

         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {metricKeys.map((key) => (
               <Card key={key}>
                  <CardHeader className="pb-1">
                     <CardTitle className="text-sm font-medium text-muted-foreground capitalize">
                        {key}
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="text-2xl font-bold">
                        {average(filtered, key)}
                     </p>
                     <p className="text-xs text-muted-foreground">avg / 10</p>
                  </CardContent>
               </Card>
            ))}
         </div>

         {chartData.length < 2 ? (
            <p className="text-center text-muted-foreground py-12">
               Not enough data for this period.
            </p>
         ) : (
            <Card>
               <CardHeader>
                  <CardTitle className="text-base">Over time</CardTitle>
               </CardHeader>
               <CardContent>
                  <ChartContainer config={chartConfig} className="h-72 w-full">
                     <LineChart data={chartData}>
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
                           <Line
                              key={key}
                              type="monotone"
                              dataKey={key}
                              stroke={`var(--color-${key})`}
                              strokeWidth={2}
                              dot={false}
                           />
                        ))}
                     </LineChart>
                  </ChartContainer>
               </CardContent>
            </Card>
         )}
      </div>
   );
}
