import { useAccount } from "@/lib/hooks/useAccount";
import { Navigate, Outlet } from "react-router";

export default function RequireAuth() {
   const { currentUser, loadingUser } = useAccount();

   if (loadingUser) return null;

   if (!currentUser) return <Navigate to="/login" replace />;

   return <Outlet />;
}
