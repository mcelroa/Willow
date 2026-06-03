import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCheckIn } from "@/lib/hooks/useCheckIn";
import { checkInSchema, type CheckInSchema } from "@/lib/schemas/checkInSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
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

   if (loadingCheckIn)
      return (
         <p className="text-center mt-12 text-muted-foreground">Loading...</p>
      );

   return (
      <Card className="max-w-xl mx-4 sm:mx-auto my-6">
         <CardHeader>
            <CardTitle>Edit Check In</CardTitle>
            <CardDescription>Update how you were feeling</CardDescription>
         </CardHeader>
         <CardContent>
            <form
               onSubmit={handleSubmit(onSubmit)}
               className="flex flex-col gap-6"
            >
               <Field>
                  <FieldLabel htmlFor="date">Date</FieldLabel>
                  <Input id="date" type="date" {...register("date")} />
                  {errors.date && (
                     <p className="text-sm text-red-500">
                        {errors.date.message}
                     </p>
                  )}
               </Field>

               <div className="grid grid-cols-2 gap-4">
                  {symptomFields.map(({ name, label }) => (
                     <Field key={name}>
                        <div className="flex justify-between">
                           <FieldLabel htmlFor={name}>{label}</FieldLabel>
                           <span className="text-sm font-medium">
                              {sliderValues[name]}
                           </span>
                        </div>
                        <Input
                           id={name}
                           type="range"
                           min={1}
                           max={10}
                           step={1}
                           style={{ "--range-fill": `${((sliderValues[name] ?? 5) - 1) / 9 * 100}%` } as React.CSSProperties}
                           {...register(name, { valueAsNumber: true })}
                        />
                     </Field>
                  ))}
               </div>

               <Field>
                  <FieldLabel htmlFor="weight">Weight (kg)</FieldLabel>
                  <Input
                     id="weight"
                     type="number"
                     step="0.1"
                     min={20}
                     max={400}
                     placeholder="Optional"
                     className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                     {...register("weight", {
                        setValueAs: (v) => (v === "" ? undefined : Number(v)),
                     })}
                  />
                  {errors.weight && (
                     <p className="text-sm text-red-500">
                        {errors.weight.message}
                     </p>
                  )}
               </Field>

               <Field>
                  <FieldLabel htmlFor="notes">Notes</FieldLabel>
                  <Textarea
                     id="notes"
                     placeholder="Anything notable today?"
                     {...register("notes")}
                  />
               </Field>

               <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                     {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
               </div>
            </form>
         </CardContent>
      </Card>
   );
}
