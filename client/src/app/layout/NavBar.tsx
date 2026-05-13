import { Button } from "@/components/ui/button";

import { useAccount } from "@/lib/hooks/useAccount";
import { Link, NavLink } from "react-router";

const navLinks = [
   { label: "Check In", path: "/checkin" },
   { label: "History", path: "/history" },
   { label: "Trends", path: "/trends" },
   { label: "Export", path: "/export" },
];

export default function NavBar() {
   const { currentUser, logoutUser } = useAccount();

   return (
      <header className="sticky top-0 w-full border-b bg-background">
         <div className="w-full px-6 grid grid-cols-3 h-14 items-center">
            <Link to="/">Willow</Link>

            <nav className="flex justify-center gap-1">
               {navLinks.map(({ label, path }) => (
                  <NavLink
                     key={path}
                     to={path}
                     className={({ isActive }) =>
                        `px-3 py-1.5 rounded-md text-sm transition-colors ${
                           isActive
                              ? "bg-accent text-accent-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        }`
                     }
                  >
                     {label}
                  </NavLink>
               ))}
            </nav>

            <div className="flex justify-end items-center gap-3">
               <span className="text-sm text-muted-foreground">
                  {currentUser?.username}
               </span>
               <Button variant="ghost" onClick={logoutUser}>
                  Log out
               </Button>
            </div>
         </div>
      </header>
   );
}
