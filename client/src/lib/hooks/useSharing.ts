import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";

export const useSharing = () => {
   const queryClient = useQueryClient();

   const { data: shareLinks = [] as ShareLink[], isLoading } = useQuery({
      queryKey: ["shareLinks"],
      queryFn: () => agent.Sharing.list(),
   });

   const createShareLink = useMutation({
      mutationFn: (dto: CreateShareLinkDto) => agent.Sharing.create(dto),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["shareLinks"] });
      },
   });

   const revokeShareLink = useMutation({
      mutationFn: (id: string) => agent.Sharing.revoke(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["shareLinks"] });
      },
   });

   return {
      shareLinks,
      isLoading,
      createShareLink,
      revokeShareLink,
   };
};
