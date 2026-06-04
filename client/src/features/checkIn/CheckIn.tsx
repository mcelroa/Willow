import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import TourGuide from "@/components/TourGuide";
import { useCheckIn } from "@/lib/hooks/useCheckIn";
import { useMedications } from "@/lib/hooks/useMedications";
import { checkInSchema, type CheckInSchema } from "@/lib/schemas/checkInSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Pill } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link } from "react-router";
import { toast } from "sonner";

const symptomFields = [
   { name: "mood", label: "Mood" },
   { name: "pain", label: "Pain" },
   { name: "fatigue", label: "Fatigue" },
   { name: "nausea", label: "Nausea" },
] as const;

const SYMPTOM_LABELS: Record<string, string> = {
   mood: "Mood",
   pain: "Pain",
   fatigue: "Fatigue",
   nausea: "Nausea",
};


export default function CheckIn() {
   const today = new Date().toISOString().split("T")[0];
   const todayDow = new Date().getDay();

   const { createCheckIn, checkIns } = useCheckIn();
   const { medications } = useMedications();

   const [suggestions, setSuggestions] = useState<{ symptom: string; meds: string[] }[]>([]);

   const todaysMedications = medications
      .filter((m) => m.isActive && m.schedules.some((s) => s.dayOfWeek === todayDow))
      .map((m) => ({
         name: m.name,
         dosage: m.dosage,
         times: m.schedules
            .filter((s) => s.dayOfWeek === todayDow)
            .map((s) => s.time)
            .sort(),
      }))
      .sort((a, b) => a.times[0].localeCompare(b.times[0]));

   const {
      register,
      handleSubmit,
      control,
      reset,
      formState: { errors, isSubmitting },
   } = useForm<CheckInSchema>({
      resolver: zodResolver(checkInSchema),
      defaultValues: {
         date: today,
         mood: 5,
         pain: 5,
         fatigue: 5,
         nausea: 5,
      },
   });

   const watchedValues = useWatch({
      control,
      name: ["mood", "pain", "fatigue", "nausea"],
   });
   const sliderValues = {
      mood: watchedValues[0],
      pain: watchedValues[1],
      fatigue: watchedValues[2],
      nausea: watchedValues[3],
   };

   const watchedDate = useWatch({ control, name: "date" });
   const existingEntry = checkIns.find((c) => c.date === watchedDate);

   const onSubmit = (data: CheckInSchema) => {
      createCheckIn.mutate(data, {
         onSuccess: () => {
            reset({
               date: today,
               mood: 5,
               pain: 5,
               fatigue: 5,
               nausea: 5,
               weight: undefined,
               notes: "",
            });
            toast.success("Check-in saved!");

            const highSymptoms: { symptom: string; meds: string[] }[] = [];
            const scores: [string, number][] = [
               ["mood", data.mood],
               ["pain", data.pain],
               ["fatigue", data.fatigue],
               ["nausea", data.nausea],
            ];
            for (const [symptom, score] of scores) {
               if (score >= 7) {
                  const relevant = medications
                     .filter((m) => m.isActive && m.targetSymptom === symptom)
                     .map((m) => (m.dosage ? `${m.name} ${m.dosage}` : m.name));
                  if (relevant.length > 0) highSymptoms.push({ symptom, meds: relevant });
               }
            }
            if (highSymptoms.length > 0) setSuggestions(highSymptoms);
         },
         onError: () => toast.error("Something went wrong"),
      });
   };

   const tourSteps = [
      {
         target: "body",
         placement: "center" as const,
         content: "Welcome to Willow! Each day, log how you're feeling on this page. Your entries help your care team understand your symptoms over time.",
         disableBeacon: true,
      },
      {
         target: "#checkin-sliders",
         content: "Rate your mood, pain, fatigue, and nausea on a scale of 1–10 by dragging each slider. Higher numbers mean more intense symptoms.",
         disableBeacon: true,
      },
      {
         target: "#checkin-weight",
         content: "Optionally record your weight in kg. This is tracked separately with its own trend graph.",
         disableBeacon: true,
      },
      {
         target: "#notes",
         content: "Add any extra notes — side effects, how you slept, anything on your mind. This is just for you.",
         disableBeacon: true,
      },
      {
         target: "#checkin-submit",
         content: "When you're ready, tap Save Entry. You can only submit one entry per date, but you can always edit it later from History.",
         disableBeacon: true,
      },
   ];

   return (
      <>
      <TourGuide pageName="checkin" steps={tourSteps} />

      <div className="max-w-xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-5">
         <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1">
               {format(new Date(), "EEEE, MMMM d")}
            </p>
            <h1 className="text-2xl font-bold tracking-tight">Daily check-in</h1>
         </div>

         {todaysMedications.length > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3.5 text-sm">
               <Pill className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
               <div>
                  <p className="font-semibold text-primary mb-1">Medications today</p>
                  <ul className="flex flex-col gap-0.5 text-muted-foreground">
                     {todaysMedications.map((m, i) => (
                        <li key={i}>
                           {m.dosage ? `${m.name} ${m.dosage}` : m.name}
                           {" · "}
                           {m.times.join(", ")}
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         )}

         <form onSubmit={handleSubmit(onSubmit)}>
            <div className="rounded-2xl border bg-card overflow-hidden divide-y">
               <div className="px-6 py-5">
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
                     Date
                  </p>
                  <Controller
                     control={control}
                     name="date"
                     render={({ field }) => (
                        <Popover>
                           <PopoverTrigger asChild>
                              <Button
                                 variant="outline"
                                 className="w-full justify-start text-left font-normal"
                              >
                                 <CalendarIcon className="mr-2 h-4 w-4" />
                                 {field.value
                                    ? format(parseISO(field.value), "PPP")
                                    : "Pick a date"}
                              </Button>
                           </PopoverTrigger>
                           <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                 mode="single"
                                 selected={
                                    field.value ? parseISO(field.value) : undefined
                                 }
                                 onSelect={(date) =>
                                    field.onChange(
                                       date ? format(date, "yyyy-MM-dd") : "",
                                    )
                                 }
                              />
                           </PopoverContent>
                        </Popover>
                     )}
                  />
                  {errors.date && (
                     <p className="text-sm text-destructive mt-2">{errors.date.message}</p>
                  )}
               </div>

               <div id="checkin-sliders" className="px-6 py-5">
                  <div className="flex items-center justify-between mb-4">
                     <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                        Symptoms
                     </p>
                     <span className="text-xs text-muted-foreground">Scale: 1 – 10</span>
                  </div>
                  <div className="flex flex-col gap-4">
                     {symptomFields.map(({ name, label }) => (
                        <div key={name} className="flex items-center gap-4">
                           <span className="w-16 shrink-0 text-sm font-medium">{label}</span>
                           <div className="flex-1">
                              <Input
                                 id={name}
                                 type="range"
                                 min={1}
                                 max={10}
                                 step={1}
                                 style={{
                                    "--range-fill": `${((sliderValues[name] ?? 5) - 1) / 9 * 100}%`,
                                 } as React.CSSProperties}
                                 {...register(name, { valueAsNumber: true })}
                              />
                           </div>
                           <span className="w-6 shrink-0 text-right text-base font-bold tabular-nums">
                              {sliderValues[name]}
                           </span>
                        </div>
                     ))}
                  </div>
               </div>

               <div id="checkin-weight" className="px-6 py-5">
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
                     Weight{" "}
                     <span className="normal-case font-normal tracking-normal">(optional, kg)</span>
                  </p>
                  <Controller
                     control={control}
                     name="weight"
                     render={({ field }) => (
                        <Input
                           id="weight"
                           type="number"
                           step="0.1"
                           min={20}
                           max={400}
                           placeholder="e.g. 68.5"
                           className="max-w-40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                           value={field.value ?? ""}
                           onChange={(e) =>
                              field.onChange(
                                 e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value),
                              )
                           }
                           onBlur={field.onBlur}
                           ref={field.ref}
                        />
                     )}
                  />
                  {errors.weight && (
                     <p className="text-sm text-destructive mt-2">{errors.weight.message}</p>
                  )}
               </div>

               <div className="px-6 py-5">
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
                     Notes{" "}
                     <span className="normal-case font-normal tracking-normal">(optional)</span>
                  </p>
                  <Textarea
                     id="notes"
                     placeholder="Anything notable today?"
                     className="resize-none"
                     rows={3}
                     {...register("notes")}
                  />
               </div>
            </div>

            <div id="checkin-submit" className="mt-4 flex flex-col gap-2.5">
               {existingEntry && (
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-400 text-center">
                     You already have an entry for this date.{" "}
                     <Link
                        to={`/history/${existingEntry.id}`}
                        className="underline underline-offset-4 font-medium"
                     >
                        Edit it instead
                     </Link>
                  </div>
               )}
               <Button
                  type="submit"
                  className="w-full h-11 font-semibold"
                  disabled={isSubmitting || !!existingEntry}
               >
                  {isSubmitting ? "Saving..." : "Save Entry"}
               </Button>
            </div>
         </form>
      </div>

      <Dialog
         open={suggestions.length > 0}
         onOpenChange={(open: boolean) => {
            if (!open) setSuggestions([]);
         }}
      >
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Medication reminder</DialogTitle>
               <DialogDescription>
                  You logged a high score for the following symptoms. Your prescribed medications
                  may help — speak to your care team if you're unsure.
               </DialogDescription>
            </DialogHeader>
            <ul className="flex flex-col gap-2 text-sm">
               {suggestions.map(({ symptom, meds }) => (
                  <li key={symptom}>
                     <span className="font-medium">{SYMPTOM_LABELS[symptom]}:</span>{" "}
                     {meds.join(", ")}
                  </li>
               ))}
            </ul>
            <DialogFooter>
               <Button onClick={() => setSuggestions([])}>Dismiss</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
      </>
   );
}
