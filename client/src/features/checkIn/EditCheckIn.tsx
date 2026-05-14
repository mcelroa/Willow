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
            navigate("/history");
         },
      });
   };

   if (loadingCheckIn)
      return (
         <p className="text-center mt-12 text-muted-foreground">Loading...</p>
      );

   return (
      <Card className="max-w-xl mx-auto m-6">
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
                           {...register(name, { valueAsNumber: true })}
                        />
                     </Field>
                  ))}
               </div>

               <Field>
                  <FieldLabel htmlFor="notes">Notes</FieldLabel>
                  <Textarea
                     id="notes"
                     placeholder="Anything notable today?"
                     {...register("notes")}
                  />
               </Field>

               <div className="flex justify-end items-center gap-3">
                  {updateCheckIn.isError && (
                     <p className="text-sm text-red-500">
                        Something went wrong.
                     </p>
                  )}
                  <Button type="submit" disabled={isSubmitting}>
                     {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
               </div>
            </form>
         </CardContent>
      </Card>
   );
}
