import { Outlet, useLocation } from "react-router";
import CheckIn from "./features/checkIn/CheckIn";
import NavBar from "./app/layout/NavBar";

export default function App() {
   const location = useLocation();

   return (
      <>
         {location.pathname === "/" ? (
            <CheckIn />
         ) : (
            <>
               <NavBar />
               <Outlet />
            </>
         )}
      </>
   );
}
