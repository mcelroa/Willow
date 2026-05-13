import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function CheckIn() {
   return (
      <>
         <Card className="mx-auto m-4 p-4">
            <CardHeader>
               <CardTitle>Daily Check In</CardTitle>
               <CardDescription>Log how you are feeling today</CardDescription>
            </CardHeader>
            <CardContent>
               {/* Holds Date & Symptoms */}
               <div className="grid grid-cols-2 gap-4 mb-4">
                  <Card className="p-4">
                     <Field>
                        <FieldLabel htmlFor="inputDate">Date</FieldLabel>
                        <Input id="inputDate" type="date" />
                     </Field>
                  </Card>
                  <Card className="p-4">
                     <FieldGroup>
                        <Field>
                           <FieldLabel htmlFor="inputMood">Mood</FieldLabel>
                           <Input id="inputMood" type="range" />
                        </Field>
                        <Field>
                           <FieldLabel htmlFor="inputPain">Pain</FieldLabel>
                           <Input id="inputPain" type="range" />
                        </Field>
                        <Field>
                           <FieldLabel htmlFor="inputFatigue">
                              Fatigue
                           </FieldLabel>
                           <Input id="inputFatigue" type="range" />
                        </Field>
                        <Field>
                           <FieldLabel htmlFor="inputNausea">Nausea</FieldLabel>
                           <Input id="inputNausea" type="range" />
                        </Field>
                     </FieldGroup>
                  </Card>
               </div>
               {/* Holds notes */}
               <div className="mb-4">
                  <Field>
                     <FieldLabel htmlFor="inputNotes">Notes</FieldLabel>
                     <Input
                        id="inputNotes"
                        type="textarea"
                        placeholder="Anything notable today?"
                     />
                  </Field>
               </div>
               {/* Holds Button */}
               <div className="flex justify-end">
                  <Button>Save Entry</Button>
               </div>
            </CardContent>
         </Card>
      </>
   );
}
