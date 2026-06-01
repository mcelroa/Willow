import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
   ChartContainer,
   ChartLegend,
   ChartLegendContent,
   ChartTooltip,
   ChartTooltipContent,
   type ChartConfig,
} from "@/components/ui/chart";
import agent from "@/lib/api/agent";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useParams } from "react-router";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

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
      return () => { document.head.removeChild(meta); };
   }, []);

   const { data, isLoading, isError } = useQuery({
      queryKey: ["sharedView", token],
      queryFn: () => agent.Sharing.getSharedView(token!),
      retry: false,
   });

   if (isLoading) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
         </div>
      );
   }

   if (isError || !data) {
      return (
         <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4 text-center">
            <h1 className="text-xl font-semibold">Link not available</h1>
            <p className="text-muted-foreground max-w-sm">
               This share link has expired, been revoked, or doesn't exist.
            </p>
         </div>
      );
   }

   const sorted = [...data.checkIns].sort((a, b) => a.date.localeCompare(b.date));

   const chartData = sorted.map((c) => ({
      date: new Date(c.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      mood: c.mood,
      pain: c.pain,
      fatigue: c.fatigue,
      nausea: c.nausea,
   }));

   const weightData = sorted
      .filter((c) => c.weight != null)
      .map((c) => ({
         date: new Date(c.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
         weight: c.weight,
      }));

   return (
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-6">
         <div>
            <h1 className="text-xl font-semibold">{data.ownerName}'s health data</h1>
            {data.earliestDate && data.latestDate && (
               <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(data.earliestDate)} – {formatDate(data.latestDate)}
               </p>
            )}
         </div>

         {data.averages && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
               {metricKeys.map((key) => (
                  <Card key={key}>
                     <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-medium text-muted-foreground capitalize">
                           {key}
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-2xl font-bold">{data.averages![key].toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">avg / 10</p>
                     </CardContent>
                  </Card>
               ))}
            </div>
         )}

         {chartData.length >= 2 && (
            <Card>
               <CardHeader>
                  <CardTitle className="text-base">Symptoms over time</CardTitle>
               </CardHeader>
               <CardContent>
                  <ChartContainer config={chartConfig} className="h-72 w-full">
                     <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                        <YAxis domain={[1, 10]} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
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

         {weightData.length >= 2 && (
            <Card>
               <CardHeader>
                  <CardTitle className="text-base">Weight (kg)</CardTitle>
               </CardHeader>
               <CardContent>
                  <ChartContainer config={weightChartConfig} className="h-72 w-full">
                     <LineChart data={weightData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
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
               </CardContent>
            </Card>
         )}

         {data.checkIns.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No check-ins recorded yet.</p>
         )}

         {data.pendingQuestions.length > 0 && (
            <Card>
               <CardHeader>
                  <CardTitle className="text-base">Questions for care team</CardTitle>
               </CardHeader>
               <CardContent className="flex flex-col gap-2">
                  {data.pendingQuestions.map((q) => (
                     <p key={q.id} className="text-sm border-l-2 border-muted pl-3 py-0.5">
                        {q.text}
                     </p>
                  ))}
               </CardContent>
            </Card>
         )}

         <p className="text-xs text-center text-muted-foreground pt-2">
            Shared via Willow · Read-only view
         </p>
      </div>
   );
}
