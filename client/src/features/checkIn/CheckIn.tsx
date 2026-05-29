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
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useCheckIn } from "@/lib/hooks/useCheckIn";
import { checkInSchema, type CheckInSchema } from "@/lib/schemas/checkInSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link } from "react-router";
import { toast } from "sonner";

const symptomFields = [
   { name: "mood", label: "Mood" },
   { name: "pain", label: "Pain" },
   { name: "fatigue", label: "Fatigue" },
   { name: "nausea", label: "Nausea" },
] as const;

export default function CheckIn() {
   const today = new Date().toISOString().split("T")[0];

   const { createCheckIn, checkIns } = useCheckIn();

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
         },
         onError: () => toast.error("Something went wrong"),
      });
   };

   return (
      <Card className="max-w-xl mx-4 sm:mx-auto my-6">
         <CardHeader>
            <CardTitle>Daily Check In</CardTitle>
            <CardDescription>Log how you are feeling today</CardDescription>
         </CardHeader>
         <CardContent>
            <form
               onSubmit={handleSubmit(onSubmit)}
               className="flex flex-col gap-6"
            >
               <Field>
                  <FieldLabel htmlFor="date">Date</FieldLabel>
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
                                    field.value
                                       ? parseISO(field.value)
                                       : undefined
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
                  <FieldLabel htmlFor="weight">Weight (kg)</FieldLabel>
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
                           placeholder="Optional"
                           className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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

               <div className="flex justify-end items-center gap-3">
                  {existingEntry && (
                     <p className="text-sm text-amber-600">
                        You already have an entry for this date.{" "}
                        <Link
                           to={`/history/${existingEntry.id}`}
                           className="underline underline-offset-4"
                        >
                           Edit it instead
                        </Link>
                     </p>
                  )}
                  <Button
                     type="submit"
                     disabled={isSubmitting || !!existingEntry}
                  >
                     {isSubmitting ? "Saving..." : "Save Entry"}
                  </Button>
               </div>
            </form>
         </CardContent>
      </Card>
   );
}
