import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuestion } from "@/lib/hooks/useQuestion";
import {
   questionSchema,
   type QuestionFormValues,
} from "@/lib/schemas/questionSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function Questions() {
   const {
      questions,
      isLoadingQuestions,
      createQuestion,
      deleteQuestion,
      markAsked,
   } = useQuestion();

   const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
   } = useForm<QuestionFormValues>({
      resolver: zodResolver(questionSchema),
   });

   const onSubmit = (data: QuestionFormValues) => {
      createQuestion.mutate({ text: data.text }, { onSuccess: () => reset() });
   };

   if (isLoadingQuestions)
      return (
         <p className="text-center mt-12 text-muted-foreground">Loading...</p>
      );

   const pending = questions.filter((q) => !q.isAsked);
   const asked = questions.filter((q) => q.isAsked);

   return (
      <div className="max-w-2xl mx-auto m-6 flex flex-col gap-4">
         <h1 className="text-xl font-semibold">Questions</h1>

         <Tabs defaultValue="pending">
            <TabsList>
               <TabsTrigger value="pending">
                  Pending ({pending.length})
               </TabsTrigger>
               <TabsTrigger value="asked">Asked ({asked.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="flex flex-col gap-4 mt-4">
               <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
                  <div className="flex-1">
                     <Input
                        {...register("text")}
                        placeholder="Type a question to ask your care team..."
                     />
                     {errors && (
                        <p className="text-sm text-destructive mt-1">
                           {errors.text?.message}
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
                     <CardContent className="pt-4 flex justify-between items-center gpa-4">
                        <p className="text-sm flex-1">{q.text}</p>
                        <div className="flex gap-2 shrink-0">
                           <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsked.mutate(q.id)}
                              disabled={markAsked.isPending}
                           >
                              Mark as asked
                           </Button>
                           <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                 if (window.confirm("Delete this question?"))
                                    deleteQuestion.mutate(q.id);
                              }}
                              disabled={deleteQuestion.isPending}
                           >
                              Delete
                           </Button>
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
   );
}
