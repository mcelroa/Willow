import App from "@/App";
import { Route, Routes } from "react-router";

export default function AppRouter() {
   return (
      <Routes>
         <Route index element={<App />} />
      </Routes>
   );
}
