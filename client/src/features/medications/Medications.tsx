import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import TourGuide from "@/components/TourGuide";
import { cn } from "@/lib/utils";
import { useMedications } from "@/lib/hooks/useMedications";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SYMPTOM_OPTIONS = [
   { value: "mood", label: "Mood" },
   { value: "pain", label: "Pain" },
   { value: "fatigue", label: "Fatigue" },
   { value: "nausea", label: "Nausea" },
];

const scheduleSchema = z.object({
   dayOfWeek: z.number().min(0).max(6),
   time: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:mm"),
});

const medicationSchema = z.object({
   name: z.string().min(1, "Name is required").max(100),
   dosage: z.string().max(50).optional(),
   targetSymptom: z.string().optional(),
   isActive: z.boolean(),
   schedules: z.array(scheduleSchema),
});

type MedicationForm = z.infer<typeof medicationSchema>;

const defaultValues: MedicationForm = {
   name: "",
   dosage: "",
   targetSymptom: "",
   isActive: true,
   schedules: [],
};

function MedicationFormFields({
   form,
   onSubmit,
   onCancel,
   isPending,
   submitLabel,
}: {
   form: ReturnType<typeof useForm<MedicationForm>>;
   onSubmit: (data: MedicationForm) => void;
   onCancel: () => void;
   isPending: boolean;
   submitLabel: string;
}) {
   const {
      register,
      control,
      handleSubmit,
      formState: { errors },
   } = form;

   const { fields, append, remove } = useFieldArray({ control, name: "schedules" });

   const [bulkDays, setBulkDays] = useState<number[]>([]);
   const [bulkTimes, setBulkTimes] = useState<string[]>([]);
   const [bulkTimeInput, setBulkTimeInput] = useState("08:00");

   const toggleDay = (day: number) =>
      setBulkDays((prev) =>
         prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
      );

   const addBulkTime = () => {
      if (!bulkTimeInput || bulkTimes.includes(bulkTimeInput)) return;
      setBulkTimes((prev) => [...prev, bulkTimeInput].sort());
   };

   const addToSchedule = () => {
      for (const day of [...bulkDays].sort((a, b) => a - b)) {
         for (const time of bulkTimes) {
            if (!fields.some((f) => f.dayOfWeek === day && f.time === time)) {
               append({ dayOfWeek: day, time });
            }
         }
      }
      setBulkDays([]);
      setBulkTimes([]);
   };

   const sortedFields = fields
      .map((field, index) => ({ field, index }))
      .sort(
         (a, b) =>
            a.field.dayOfWeek - b.field.dayOfWeek ||
            a.field.time.localeCompare(b.field.time)
      );

   return (
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
         <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
               <Label htmlFor="name">Medication name</Label>
               <Input id="name" placeholder="e.g. Ondansetron" {...register("name")} />
               {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
               )}
            </div>

            <div className="flex flex-col gap-1.5">
               <Label htmlFor="dosage">Dosage (optional)</Label>
               <Input id="dosage" placeholder="e.g. 8mg" {...register("dosage")} />
            </div>
         </div>

         <div className="flex flex-col gap-1.5">
            <Label>Targets symptom (optional)</Label>
            <Controller
               control={control}
               name="targetSymptom"
               render={({ field }) => (
                  <Select
                     value={field.value ?? ""}
                     onValueChange={(v: string) => field.onChange(v === "none" ? "" : v)}
                  >
                     <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="None" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {SYMPTOM_OPTIONS.map((o) => (
                           <SelectItem key={o.value} value={o.value}>
                              {o.label}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               )}
            />
            <p className="text-xs text-muted-foreground">
               If set, you'll be reminded about this medication after logging a high symptom score.
            </p>
         </div>

         <div className="flex flex-col gap-3">
            <Label>Schedule</Label>

            <div className="rounded-md border p-3 flex flex-col gap-3">
               <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Days</p>
                  <div className="flex flex-wrap gap-1.5">
                     {DAY_LABELS.map((label, i) => (
                        <button
                           key={i}
                           type="button"
                           onClick={() => toggleDay(i)}
                           className={cn(
                              "h-7 px-2.5 rounded text-xs font-medium transition-colors",
                              bulkDays.includes(i)
                                 ? "bg-primary text-primary-foreground"
                                 : "bg-muted text-muted-foreground hover:bg-muted/70"
                           )}
                        >
                           {label}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Times</p>
                  <div className="flex items-center gap-2">
                     <Input
                        type="time"
                        className="w-32 h-8 text-sm"
                        value={bulkTimeInput}
                        onChange={(e) => setBulkTimeInput(e.target.value)}
                        onKeyDown={(e) => {
                           if (e.key === "Enter") {
                              e.preventDefault();
                              addBulkTime();
                           }
                        }}
                     />
                     <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={addBulkTime}
                     >
                        <Plus className="h-3 w-3" />
                        Add
                     </Button>
                  </div>
                  {bulkTimes.length > 0 && (
                     <div className="flex flex-wrap gap-1.5">
                        {bulkTimes.map((time) => (
                           <span
                              key={time}
                              className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded"
                           >
                              {time}
                              <button
                                 type="button"
                                 onClick={() =>
                                    setBulkTimes((prev) => prev.filter((t) => t !== time))
                                 }
                                 className="text-muted-foreground hover:text-foreground"
                              >
                                 <X className="h-3 w-3" />
                              </button>
                           </span>
                        ))}
                     </div>
                  )}
               </div>

               <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="self-start"
                  disabled={bulkDays.length === 0 || bulkTimes.length === 0}
                  onClick={addToSchedule}
               >
                  Add to schedule
               </Button>
            </div>

            {sortedFields.length > 0 ? (
               <div className="flex flex-wrap gap-1.5">
                  {sortedFields.map(({ field, index }) => (
                     <span
                        key={field.id}
                        className="inline-flex items-center gap-1 text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                     >
                        {DAY_LABELS[field.dayOfWeek]} {field.time}
                        <button
                           type="button"
                           onClick={() => remove(index)}
                           className="text-muted-foreground hover:text-destructive"
                        >
                           <X className="h-3 w-3" />
                        </button>
                     </span>
                  ))}
               </div>
            ) : (
               <p className="text-sm text-muted-foreground">
                  No schedule set. Select days and times above to add reminders.
               </p>
            )}
         </div>

         <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
               Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
               {isPending ? "Saving..." : submitLabel}
            </Button>
         </div>
      </form>
   );
}

export default function Medications() {
   const { medications, isLoading, createMedication, updateMedication, deleteMedication } =
      useMedications();
   const [showAddForm, setShowAddForm] = useState(false);
   const [editingId, setEditingId] = useState<string | null>(null);
   const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

   const addForm = useForm<MedicationForm>({
      resolver: zodResolver(medicationSchema),
      defaultValues,
   });

   const editForm = useForm<MedicationForm>({
      resolver: zodResolver(medicationSchema),
      defaultValues,
   });

   const handleAdd = (data: MedicationForm) => {
      createMedication.mutate(
         {
            name: data.name,
            dosage: data.dosage || undefined,
            targetSymptom: data.targetSymptom || undefined,
            isActive: data.isActive,
            schedules: data.schedules,
         },
         {
            onSuccess: () => {
               addForm.reset(defaultValues);
               setShowAddForm(false);
               toast.success("Medication added");
            },
            onError: () => toast.error("Something went wrong"),
         }
      );
   };

   const startEdit = (med: Medication) => {
      editForm.reset({
         name: med.name,
         dosage: med.dosage ?? "",
         targetSymptom: med.targetSymptom ?? "",
         isActive: med.isActive,
         schedules: med.schedules,
      });
      setEditingId(med.id);
   };

   const handleEdit = (data: MedicationForm) => {
      if (!editingId) return;
      updateMedication.mutate(
         {
            id: editingId,
            dto: {
               name: data.name,
               dosage: data.dosage || undefined,
               targetSymptom: data.targetSymptom || undefined,
               isActive: data.isActive,
               schedules: data.schedules,
            },
         },
         {
            onSuccess: () => {
               setEditingId(null);
               toast.success("Medication updated");
            },
            onError: () => toast.error("Something went wrong"),
         }
      );
   };

   const formatSchedule = (med: Medication) => {
      if (med.schedules.length === 0) return "No schedule";
      const grouped = med.schedules.reduce<Record<string, string[]>>((acc, s) => {
         const day = DAY_LABELS[s.dayOfWeek];
         if (!acc[day]) acc[day] = [];
         acc[day].push(s.time);
         return acc;
      }, {});
      return Object.entries(grouped)
         .map(([day, times]) => `${day} at ${times.sort().join(", ")}`)
         .join(" · ");
   };

   const tourSteps = [
      {
         target: "body",
         placement: "center" as const,
         content:
            "The Medications page lets you log your prescribed medications and set schedules. You'll see reminders on the check-in page and get suggestions after logging high symptom scores.",
         disableBeacon: true,
      },
      {
         target: "#medications-add",
         content:
            "Add a medication here — name, dosage, and optionally which symptom it targets. Set a schedule to see daily reminders.",
         disableBeacon: true,
      },
   ];

   return (
      <>
         <TourGuide pageName="medications" steps={tourSteps} />
         <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
            <PageHeader
               title="Medications"
               description="Log your prescribed medications and set daily reminders."
               action={
                  !showAddForm ? (
                     <Button
                        id="medications-add"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setShowAddForm(true)}
                     >
                        <Plus className="h-4 w-4" />
                        Add medication
                     </Button>
                  ) : undefined
               }
            />

            {showAddForm && (
               <Card id="medications-add">
                  <CardHeader>
                     <CardTitle className="text-base">Add medication</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <MedicationFormFields
                        form={addForm}
                        onSubmit={handleAdd}
                        onCancel={() => {
                           addForm.reset(defaultValues);
                           setShowAddForm(false);
                        }}
                        isPending={createMedication.isPending}
                        submitLabel="Add medication"
                     />
                  </CardContent>
               </Card>
            )}

            {isLoading ? (
               <p className="text-center text-muted-foreground">Loading...</p>
            ) : medications.length === 0 && !showAddForm ? (
               <p className="text-center text-muted-foreground py-8">
                  No medications yet. Add one above.
               </p>
            ) : (
               <div className="flex flex-col gap-3">
                  {medications.map((med) =>
                     editingId === med.id ? (
                        <Card key={med.id}>
                           <CardHeader>
                              <CardTitle className="text-base">Edit medication</CardTitle>
                           </CardHeader>
                           <CardContent>
                              <MedicationFormFields
                                 form={editForm}
                                 onSubmit={handleEdit}
                                 onCancel={() => setEditingId(null)}
                                 isPending={updateMedication.isPending}
                                 submitLabel="Save changes"
                              />
                           </CardContent>
                        </Card>
                     ) : (
                        <Card key={med.id} className={med.isActive ? "" : "opacity-60"}>
                           <CardContent className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
                              <div className="flex flex-col gap-0.5">
                                 <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm">{med.name}</p>
                                    {med.dosage && (
                                       <span className="text-xs text-muted-foreground">
                                          {med.dosage}
                                       </span>
                                    )}
                                    {!med.isActive && (
                                       <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                                          Inactive
                                       </span>
                                    )}
                                 </div>
                                 {med.targetSymptom && (
                                    <p className="text-xs text-muted-foreground capitalize">
                                       Targets {med.targetSymptom}
                                    </p>
                                 )}
                                 <p className="text-xs text-muted-foreground">
                                    {formatSchedule(med)}
                                 </p>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                 <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5"
                                    onClick={() => startEdit(med)}
                                 >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit
                                 </Button>
                                 <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive gap-1.5"
                                    onClick={() => setDeleteTargetId(med.id)}
                                 >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                 </Button>
                              </div>
                           </CardContent>
                        </Card>
                     )
                  )}
               </div>
            )}
         </div>

         <AlertDialog
            open={deleteTargetId !== null}
            onOpenChange={(open) => {
               if (!open) setDeleteTargetId(null);
            }}
         >
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Delete this medication?</AlertDialogTitle>
                  <AlertDialogDescription>
                     This will remove the medication and all its scheduled reminders. This cannot
                     be undone.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                     onClick={() => {
                        if (deleteTargetId) deleteMedication.mutate(deleteTargetId);
                        setDeleteTargetId(null);
                     }}
                  >
                     Delete
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </>
   );
}
