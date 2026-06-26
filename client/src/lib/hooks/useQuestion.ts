import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";

export const useQuestion = () => {
   const queryClient = useQueryClient();

   const { data: questions = [] as QuestionDto[], isLoading } = useQuery({
      queryKey: ["questions"],
      queryFn: () => agent.Questions.list(),
   });

   const {
      data: suggestions,
      isFetching: isFetchingSuggestions,
      refetch: fetchSuggestions,
   } = useQuery({
      queryKey: ["question-suggestions"],
      queryFn: () => agent.Questions.getSuggestions(),
      enabled: false,
      staleTime: 5 * 60 * 1000,
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
      suggestions,
      isFetchingSuggestions,
      fetchSuggestions,
      createQuestion,
      deleteQuestion,
      markAsked,
   };
};
