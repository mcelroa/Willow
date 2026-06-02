import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import agent from "@/lib/api/agent";

export const useAccount = () => {
   const queryClient = useQueryClient();
   const navigate = useNavigate();

   const { data: currentUser, isLoading: loadingUser } = useQuery({
      queryKey: ["user"],
      queryFn: () => agent.Account.current(),
      enabled: !!localStorage.getItem("jwt"),
   });

   const loginUser = useMutation({
      mutationFn: (creds: LoginDto) => agent.Account.login(creds),
      onSuccess: async (user) => {
         localStorage.setItem("jwt", user.token);
         await queryClient.invalidateQueries({ queryKey: ["user"] });
         navigate("/checkin");
      },
   });

   const logoutUser = () => {
      localStorage.removeItem("jwt");
      queryClient.clear();
      navigate("/login");
   };

   const deleteAccount = useMutation({
      mutationFn: () => agent.Account.deleteAccount(),
      onSuccess: () => {
         localStorage.removeItem("jwt");
         queryClient.clear();
         navigate("/login");
      },
   });

   const updateSettings = useMutation({
      mutationFn: (dto: { reminderEnabled: boolean }) => agent.Account.updateSettings(dto),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
   });

   return { currentUser, loadingUser, loginUser, logoutUser, deleteAccount, updateSettings };
};
