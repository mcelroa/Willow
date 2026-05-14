import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import { useNavigate } from "react-router";

export const useCheckIn = (id?: string) => {
   const queryClient = useQueryClient();
   const navigate = useNavigate();

   const { data: checkIns = [], isLoading: loadingCheckIns } = useQuery({
      queryKey: ["checkIns"],
      queryFn: () => agent.CheckIns.list(),
   });

   const { data: checkIn, isLoading: loadingCheckIn } = useQuery({
      queryKey: ["checkIns", id],
      queryFn: () => agent.CheckIns.details(id!),
      enabled: !!id,
   });

   const createCheckIn = useMutation({
      mutationFn: (data: SaveCheckInDto) => agent.CheckIns.create(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["checkIns"] });
      },
   });

   const updateCheckIn = useMutation({
      mutationFn: (data: SaveCheckInDto) => agent.CheckIns.update(id!, data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["checkIns"] });
         navigate("/history");
      },
   });

   const deleteCheckIn = useMutation({
      mutationFn: (checkInId: string) => agent.CheckIns.delete(checkInId),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["checkIns"] });
      },
   });

   return {
      createCheckIn,
      checkIn,
      checkIns,
      updateCheckIn,
      deleteCheckIn,
      loadingCheckIns,
      loadingCheckIn,
   };
};
