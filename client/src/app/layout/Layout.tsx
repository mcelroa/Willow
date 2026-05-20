import { Outlet } from "react-router";
import NavBar from "./NavBar";
import { Toaster } from "@/components/ui/sonner";

export default function Layout() {
   return (
      <>
         <NavBar />
         <Outlet />
         <Toaster richColors />
      </>
   );
}
