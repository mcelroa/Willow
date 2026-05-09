import { Button } from "@/components/ui/button";
import {
   NavigationMenu,
   NavigationMenuItem,
   NavigationMenuLink,
   NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router";

export default function NavBar() {
   const menuItems = ["Dashboard", "History", "Trends", "Questions", "Export"];

   return (
      <header className="sticky top-0 w-full border-b bg-background">
         <div className="w-full px-6 grid grid-cols-3 h-14 items-center">
            <Link to="/">Willow</Link>

            <div className="flex justify-center">
               <NavigationMenu>
                  <NavigationMenuList>
                     {menuItems.map((item) => (
                        <NavigationMenuItem key={item}>
                           <NavigationMenuLink asChild>
                              <Link to={`${item.toLowerCase()}`}>{item}</Link>
                           </NavigationMenuLink>
                        </NavigationMenuItem>
                     ))}
                  </NavigationMenuList>
               </NavigationMenu>
            </div>

            <div className="flex justify-end">
               <Button variant="ghost">Log in</Button>
            </div>
         </div>
      </header>
   );
}
