import { useMutation, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";

export const useCheckIn = () => {
   const queryClient = useQueryClient();

   const createCheckIn = useMutation({
      mutationFn: (data: SaveCheckInDto) => agent.CheckIns.create(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["checkIns"] });
      },
   });

   return { createCheckIn };
};
