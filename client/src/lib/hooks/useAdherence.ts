import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";

export const useDailyAdherence = (date: string) =>
   useQuery({
      queryKey: ["adherence", "daily", date],
      queryFn: () => agent.Adherence.getDaily(date),
      enabled: !!date,
   });

export const useAdherenceSummary = () =>
   useQuery({
      queryKey: ["adherence", "summary"],
      queryFn: () => agent.Adherence.getSummary(),
   });

export const useMarkTaken = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({ medicationId, date }: { medicationId: string; date: string }) =>
         agent.Adherence.markTaken(medicationId, date),
      onSuccess: (_, { date }) => {
         queryClient.invalidateQueries({ queryKey: ["adherence", "daily", date] });
         queryClient.invalidateQueries({ queryKey: ["adherence", "summary"] });
      },
   });
};

export const useUnmarkTaken = () => {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({ medicationId, date }: { medicationId: string; date: string }) =>
         agent.Adherence.unmarkTaken(medicationId, date),
      onSuccess: (_, { date }) => {
         queryClient.invalidateQueries({ queryKey: ["adherence", "daily", date] });
         queryClient.invalidateQueries({ queryKey: ["adherence", "summary"] });
      },
   });
};
