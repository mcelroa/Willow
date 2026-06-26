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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TourGuide from "@/components/TourGuide";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageHeader } from "@/components/PageHeader";
import { useQuestion } from "@/lib/hooks/useQuestion";
import { CheckCircle2, MessageCircle, Plus, Sparkles } from "lucide-react";
import {
   questionSchema,
   type QuestionFormValues,
} from "@/lib/schemas/questionSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";

export default function Questions() {
   const {
      questions,
      isLoading,
      suggestions,
      isFetchingSuggestions,
      fetchSuggestions,
      createQuestion,
      deleteQuestion,
      markAsked,
   } = useQuestion();

   const [showSuggestions, setShowSuggestions] = useState(false);
   const [addedSuggestions, setAddedSuggestions] = useState<Set<string>>(new Set());

   const handleSuggest = () => {
      setShowSuggestions(true);
      setAddedSuggestions(new Set());
      fetchSuggestions();
   };

   const handleAddSuggestion = (text: string) => {
      createQuestion.mutate(
         { text },
         {
            onSuccess: () => {
               setAddedSuggestions((prev) => new Set(prev).add(text));
               toast.success("Question added.");
            },
            onError: () => toast.error("Something went wrong."),
         },
      );
   };

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

   if (isLoading) return <LoadingSpinner />;

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
         <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-5">
            <PageHeader title="Questions" description="Questions to ask your care team" />

            <Tabs id="questions-tabs" defaultValue="pending">
               <TabsList>
                  <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
                  <TabsTrigger value="asked">Asked ({asked.length})</TabsTrigger>
               </TabsList>

               <TabsContent value="pending" className="flex flex-col gap-4 mt-5">
                  <div id="questions-form" className="rounded-2xl border bg-card overflow-hidden">
                     <div className="px-5 py-4">
                        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
                           New question
                        </p>
                        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2" noValidate>
                           <div className="flex-1">
                              <Input
                                 {...register("text")}
                                 placeholder="What would you like to ask your care team?"
                              />
                              {errors.text && (
                                 <p className="text-sm text-destructive mt-1.5">
                                    {errors.text.message}
                                 </p>
                              )}
                           </div>
                           <Button type="submit" disabled={createQuestion.isPending}>
                              Add
                           </Button>
                        </form>
                     </div>
                  </div>

                  <div className="rounded-2xl border bg-card overflow-hidden">
                     <div className="px-5 py-3.5 border-b flex items-center justify-between">
                        <div>
                           <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                              AI suggestions
                           </p>
                           <p className="text-xs text-muted-foreground mt-0.5">
                              Based on your recent symptoms and medications
                           </p>
                        </div>
                        <Button
                           variant="outline"
                           size="sm"
                           className="shrink-0 ml-4 gap-1.5"
                           onClick={handleSuggest}
                           disabled={isFetchingSuggestions}
                        >
                           <Sparkles className="h-3.5 w-3.5" />
                           {showSuggestions ? "Refresh" : "Suggest"}
                        </Button>
                     </div>

                     {!showSuggestions && (
                        <p className="px-5 py-4 text-sm text-muted-foreground">
                           Click Suggest to get AI-powered question ideas tailored to your recent check-ins.
                        </p>
                     )}

                     {showSuggestions && isFetchingSuggestions && (
                        <p className="px-5 py-4 text-sm text-muted-foreground animate-pulse">
                           Analysing your symptoms and medications…
                        </p>
                     )}

                     {showSuggestions && !isFetchingSuggestions && suggestions && (
                        suggestions.filter((s) => !addedSuggestions.has(s)).length === 0 ? (
                           <p className="px-5 py-4 text-sm text-muted-foreground">
                              All suggestions have been added to your list.
                           </p>
                        ) : (
                           <div className="divide-y">
                              {suggestions
                                 .filter((s) => !addedSuggestions.has(s))
                                 .map((suggestion) => (
                                    <div key={suggestion} className="px-5 py-3.5 flex items-start gap-3">
                                       <p className="flex-1 text-sm leading-relaxed">{suggestion}</p>
                                       <Button
                                          variant="ghost"
                                          size="sm"
                                          className="shrink-0 gap-1 text-primary hover:text-primary"
                                          onClick={() => handleAddSuggestion(suggestion)}
                                          disabled={createQuestion.isPending}
                                       >
                                          <Plus className="h-3.5 w-3.5" />
                                          Add
                                       </Button>
                                    </div>
                                 ))}
                           </div>
                        )
                     )}
                  </div>

                  {pending.length === 0 && (
                     <EmptyState
                        icon={MessageCircle}
                        title="No pending questions"
                        description="Type a question above to add it to your list."
                     />
                  )}

                  <div className="flex flex-col gap-3">
                     {pending.map((q) => (
                        <div key={q.id} className="rounded-2xl border bg-card overflow-hidden">
                           <div className="px-5 py-4">
                              <p className="text-sm leading-relaxed">{q.text}</p>
                           </div>
                           <div className="border-t px-5 py-3 flex justify-end gap-2">
                              <Button
                                 variant="outline"
                                 size="sm"
                                 className="gap-1.5"
                                 onClick={() =>
                                    markAsked.mutate(q.id, {
                                       onSuccess: () => toast.success("Marked as asked."),
                                       onError: () => toast.error("Something went wrong."),
                                    })
                                 }
                                 disabled={markAsked.isPending}
                              >
                                 <CheckCircle2 className="h-3.5 w-3.5" />
                                 Mark as asked
                              </Button>
                              <AlertDialog>
                                 <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                       Delete
                                    </Button>
                                 </AlertDialogTrigger>
                                 <AlertDialogContent>
                                    <AlertDialogHeader>
                                       <AlertDialogTitle>Delete this question?</AlertDialogTitle>
                                       <AlertDialogDescription>
                                          This action cannot be undone.
                                       </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                       <AlertDialogCancel>Cancel</AlertDialogCancel>
                                       <AlertDialogAction
                                          onClick={() =>
                                             deleteQuestion.mutate(q.id, {
                                                onSuccess: () => toast.success("Question deleted."),
                                                onError: () => toast.error("Something went wrong."),
                                             })
                                          }
                                       >
                                          Delete
                                       </AlertDialogAction>
                                    </AlertDialogFooter>
                                 </AlertDialogContent>
                              </AlertDialog>
                           </div>
                        </div>
                     ))}
                  </div>
               </TabsContent>

               <TabsContent value="asked" className="flex flex-col gap-3 mt-5">
                  {asked.length === 0 && (
                     <EmptyState
                        icon={CheckCircle2}
                        title="No asked questions yet"
                        description="Questions you mark as asked at your appointment will appear here."
                     />
                  )}
                  {asked.map((q) => (
                     <div key={q.id} className="rounded-2xl border bg-card overflow-hidden opacity-60">
                        <div className="px-5 py-4">
                           <p className="text-sm text-muted-foreground line-through leading-relaxed">
                              {q.text}
                           </p>
                        </div>
                     </div>
                  ))}
               </TabsContent>
            </Tabs>
         </div>
      </>
   );
}
