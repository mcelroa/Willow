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
         navigate("/");
      },
   });

   const registerUser = useMutation({
      mutationFn: (creds: RegisterDto) => agent.Account.register(creds),
      onSuccess: () => navigate("/login"),
   });

   const logoutUser = () => {
      localStorage.removeItem("jwt");
      queryClient.removeQueries({ queryKey: ["user"] });
      navigate("/login");
   };

   return { currentUser, loadingUser, loginUser, registerUser, logoutUser };
};
