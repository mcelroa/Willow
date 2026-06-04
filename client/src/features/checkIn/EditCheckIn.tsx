import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Textarea } from "@/components/ui/textarea";
import { useCheckIn } from "@/lib/hooks/useCheckIn";
import { checkInSchema, type CheckInSchema } from "@/lib/schemas/checkInSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

const symptomFields = [
   { name: "mood", label: "Mood" },
   { name: "pain", label: "Pain" },
   { name: "fatigue", label: "Fatigue" },
   { name: "nausea", label: "Nausea" },
] as const;


export default function EditCheckIn() {
   const { id } = useParams<{ id: string }>();
   const { checkIn, loadingCheckIn, updateCheckIn } = useCheckIn(id);
   const navigate = useNavigate();

   const {
      register,
      handleSubmit,
      control,
      formState: { errors, isSubmitting },
   } = useForm<CheckInSchema>({
      resolver: zodResolver(checkInSchema),
      values: checkIn
         ? {
              date: checkIn.date,
              mood: checkIn.mood,
              pain: checkIn.pain,
              fatigue: checkIn.fatigue,
              nausea: checkIn.nausea,
              weight: checkIn.weight ?? undefined,
              notes: checkIn.notes ?? "",
           }
         : undefined,
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

   const onSubmit = (data: CheckInSchema) => {
      updateCheckIn.mutate(data, {
         onSuccess: () => {
            toast.success("Check-in updated!");
            navigate("/history");
         },
         onError: () => toast.error("Something went wrong."),
      });
   };

   if (loadingCheckIn) return <LoadingSpinner />;

   return (
      <div className="max-w-xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-5">
         <div>
            <Link
               to="/history"
               className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
               <ArrowLeft className="h-3 w-3" />
               History
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Edit check-in</h1>
         </div>

         <form onSubmit={handleSubmit(onSubmit)}>
            <div className="rounded-2xl border bg-card overflow-hidden divide-y">
               <div className="px-6 py-5">
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
                     Date
                  </p>
                  <Input
                     id="date"
                     type="date"
                     className="max-w-52"
                     {...register("date")}
                  />
                  {errors.date && (
                     <p className="text-sm text-destructive mt-2">{errors.date.message}</p>
                  )}
               </div>

               <div className="px-6 py-5">
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

               <div className="px-6 py-5">
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
                     Weight{" "}
                     <span className="normal-case font-normal tracking-normal">(optional, kg)</span>
                  </p>
                  <Input
                     id="weight"
                     type="number"
                     step="0.1"
                     min={20}
                     max={400}
                     placeholder="e.g. 68.5"
                     className="max-w-40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                     {...register("weight", {
                        setValueAs: (v) => (v === "" ? undefined : Number(v)),
                     })}
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

            <div className="mt-4">
               <Button
                  type="submit"
                  className="w-full h-11 font-semibold"
                  disabled={isSubmitting}
               >
                  {isSubmitting ? "Saving..." : "Save Changes"}
               </Button>
            </div>
         </form>
      </div>
   );
}
