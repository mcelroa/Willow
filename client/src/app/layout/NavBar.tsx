import { Button } from "@/components/ui/button";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccount } from "@/lib/hooks/useAccount";
import { useTheme } from "@/lib/hooks/useTheme";
import { Menu, Moon, Sun } from "lucide-react";
import { Link, NavLink } from "react-router";

const navLinks = [
   { label: "Check In", path: "/checkin" },
   { label: "History", path: "/history" },
   { label: "Trends", path: "/trends" },
   { label: "Questions", path: "/questions" },
   { label: "Summary", path: "/summary" },
];

export default function NavBar() {
   const { currentUser, logoutUser } = useAccount();
   const { isDark, toggleTheme } = useTheme();

   const themeToggle = (
      <Button variant="ghost" size="icon" onClick={toggleTheme}>
         {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
   );

   return (
      <header className="sticky top-0 z-50 w-full border-b bg-background">
         {/* Desktop */}
         <div className="hidden lg:grid grid-cols-3 w-full px-6 h-14 items-center">
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
               {themeToggle}
            </div>
         </div>

         {/* Mobile/tablet */}
         <div className="flex lg:hidden items-center justify-between px-4 h-14">
            <Link to="/">Willow</Link>
            <div className="flex items-center gap-1">
               {themeToggle}
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                     {navLinks.map(({ label, path }) => (
                        <DropdownMenuItem key={path} asChild>
                           <Link to={path}>{label}</Link>
                        </DropdownMenuItem>
                     ))}
                     <DropdownMenuSeparator />
                     <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                        {currentUser?.username}
                     </DropdownMenuLabel>
                     <DropdownMenuItem onClick={logoutUser}>
                        Log out
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
         </div>
      </header>
   );
}
