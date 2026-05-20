import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";

export const useQuestion = () => {
   const queryClient = useQueryClient();

   const { data: questions = [] as QuestionDto[], isLoading } = useQuery({
      queryKey: ["questions"],
      queryFn: () => agent.Questions.list(),
   });

   const createQuestion = useMutation({
      mutationFn: (dto: CreateQuestionDto) => agent.Questions.create(dto),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["questions"] });
      },
   });

   const deleteQuestion = useMutation({
      mutationFn: (id: string) => agent.Questions.delete(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["questions"] });
      },
   });

   const markAsked = useMutation({
      mutationFn: (id: string) => agent.Questions.markAsked(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["questions"] });
      },
   });

   return {
      questions,
      isLoading,
      createQuestion,
      deleteQuestion,
      markAsked,
   };
};
