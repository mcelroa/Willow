import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Leaf, Menu, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router";

const navLinks = [
   { label: "Check In", path: "/checkin" },
   { label: "History", path: "/history" },
   { label: "Trends", path: "/trends" },
   { label: "Questions", path: "/questions" },
   { label: "Summary", path: "/summary" },
   { label: "Sharing", path: "/sharing" },
   { label: "Medications", path: "/medications" },
];

export default function NavBar() {
   const { currentUser, logoutUser, deleteAccount } = useAccount();
   const { isDark, toggleTheme } = useTheme();
   const [showDeleteDialog, setShowDeleteDialog] = useState(false);

   const themeToggle = (
      <Button variant="ghost" size="icon" onClick={toggleTheme}>
         {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
   );

   return (
      <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
         {/* Desktop */}
         <div className="hidden lg:grid grid-cols-[auto_1fr_auto] w-full px-6 h-14 items-center gap-6">
            <Link to="/" className="flex items-center gap-1.5 font-semibold tracking-tight">
               <Leaf className="h-4 w-4 text-primary" />
               Willow
            </Link>

            <nav className="flex justify-center gap-0.5">
               {navLinks.map(({ label, path }) => (
                  <NavLink
                     key={path}
                     to={path}
                     className={({ isActive }) =>
                        `px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap ${
                           isActive
                              ? "bg-primary/15 dark:bg-primary/30 text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                        }`
                     }
                  >
                     {label}
                  </NavLink>
               ))}
            </nav>

            <div className="flex justify-end items-center gap-2">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="icon" className="rounded-full">
                        <span className="h-7 w-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold">
                           {currentUser?.username?.[0]?.toUpperCase()}
                        </span>
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                     <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                        {currentUser?.username}
                     </DropdownMenuLabel>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem asChild>
                        <Link to="/account/settings">Account settings</Link>
                     </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                        <Link to="/change-password">Change password</Link>
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={logoutUser}>
                        Log out
                     </DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setShowDeleteDialog(true)}
                     >
                        Delete account
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
               {themeToggle}
            </div>
         </div>

         {/* Mobile/tablet */}
         <div className="flex lg:hidden items-center justify-between px-4 h-14">
            <Link to="/" className="flex items-center gap-1.5 font-semibold tracking-tight">
               <Leaf className="h-4 w-4 text-primary" />
               Willow
            </Link>
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
                     <DropdownMenuItem asChild>
                        <Link to="/account/settings">Account settings</Link>
                     </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                        <Link to="/change-password">Change password</Link>
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={logoutUser}>
                        Log out
                     </DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setShowDeleteDialog(true)}
                     >
                        Delete account
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
         </div>
      </header>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>Delete your account?</AlertDialogTitle>
               <AlertDialogDescription>
                  This permanently deletes your account and all your check-ins
                  and questions. This cannot be undone.
               </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
               <AlertDialogCancel>Cancel</AlertDialogCancel>
               <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => deleteAccount.mutate()}
               >
                  Delete account
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
      </>
   );
}
