import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TourGuide from "@/components/TourGuide";
import { PageHeader } from "@/components/PageHeader";
import { useQuestion } from "@/lib/hooks/useQuestion";
import {
   questionSchema,
   type QuestionFormValues,
} from "@/lib/schemas/questionSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function Questions() {
   const { questions, isLoading, createQuestion, deleteQuestion, markAsked } =
      useQuestion();

   const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
   } = useForm<QuestionFormValues>({
      resolver: zodResolver(questionSchema),
   });

   const onSubmit = (data: QuestionFormValues) => {
      createQuestion.mutate(
         { text: data.text },
         {
            onSuccess: () => {
               reset();
               toast.success("Question added.");
            },
            onError: () => toast.error("Something went wrong."),
         },
      );
   };

   if (isLoading)
      return (
         <p className="text-center mt-12 text-muted-foreground">Loading...</p>
      );

   const pending = questions.filter((q) => !q.isAsked);
   const asked = questions.filter((q) => q.isAsked);

   const tourSteps = [
      {
         target: "body",
         placement: "center" as const,
         content: "Use this page to keep track of questions you want to ask your care team at your next appointment.",
         disableBeacon: true,
      },
      {
         target: "#questions-form",
         content: "Type a question here and tap Add — it'll appear in your Pending list below.",
         disableBeacon: true,
      },
      {
         target: "#questions-tabs",
         content: "Once you've asked a question at your appointment, mark it as asked and it moves to the Asked tab. Your pending questions also appear in the Summary page.",
         disableBeacon: true,
      },
   ];

   return (
      <>
      <TourGuide pageName="questions" steps={tourSteps} />
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-4">
         <PageHeader title="Questions" description="Questions to ask your care team" />

         <Tabs id="questions-tabs" defaultValue="pending">
            <TabsList>
               <TabsTrigger value="pending">
                  Pending ({pending.length})
               </TabsTrigger>
               <TabsTrigger value="asked">Asked ({asked.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="flex flex-col gap-4 mt-4">
               <form id="questions-form" onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
                  <div className="flex-1">
                     <Input
                        {...register("text")}
                        placeholder="Type a question to ask your care team..."
                     />
                     {errors.text && (
                        <p className="text-sm text-destructive mt-1">
                           {errors.text.message}
                        </p>
                     )}
                  </div>
                  <Button type="submit" disabled={createQuestion.isPending}>
                     Add
                  </Button>
               </form>

               {pending.length === 0 && (
                  <p className="text-center text-muted-foreground mt-6">
                     No pending questions
                  </p>
               )}
               {pending.map((q) => (
                  <Card key={q.id}>
                     <CardContent className="pt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                        <p className="text-sm flex-1">{q.text}</p>
                        <div className="flex gap-2 shrink-0 self-end sm:self-auto">
                           <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                 markAsked.mutate(q.id, {
                                    onSuccess: () =>
                                       toast.success("Marked as asked."),
                                    onError: () =>
                                       toast.error("Something went wrong."),
                                 })
                              }
                              disabled={markAsked.isPending}
                           >
                              Mark as asked
                           </Button>
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                 <Button variant="ghost" size="sm">
                                    Delete
                                 </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                 <AlertDialogHeader>
                                    <AlertDialogTitle>
                                       Delete this question?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                       This action cannot be undone.
                                    </AlertDialogDescription>
                                 </AlertDialogHeader>
                                 <AlertDialogFooter>
                                    <AlertDialogCancel>
                                       Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                       onClick={() =>
                                          deleteQuestion.mutate(q.id, {
                                             onSuccess: () =>
                                                toast.success(
                                                   "Question deleted.",
                                                ),
                                             onError: () =>
                                                toast.error(
                                                   "Something went wrong.",
                                                ),
                                          })
                                       }
                                    >
                                       Delete
                                    </AlertDialogAction>
                                 </AlertDialogFooter>
                              </AlertDialogContent>
                           </AlertDialog>
                        </div>
                     </CardContent>
                  </Card>
               ))}
            </TabsContent>

            <TabsContent value="asked" className="flex flex-col gap-3 mt-4">
               {asked.length === 0 && (
                  <p className="text-center text-muted-foreground mt-6">
                     No asked questions yet
                  </p>
               )}
               {asked.map((q) => (
                  <Card key={q.id}>
                     <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground line-through">
                           {q.text}
                        </p>
                     </CardContent>
                  </Card>
               ))}
            </TabsContent>
         </Tabs>
      </div>
      </>
   );
}
