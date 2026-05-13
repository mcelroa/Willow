import Login from "@/features/account/Login";
import Register from "@/features/account/Register";
import { Navigate, Route, Routes } from "react-router";
import RequireAuth from "./layout/RequireAuth";
import Layout from "./layout/Layout";
import CheckIn from "@/features/checkIn/CheckIn";

export default function AppRouter() {
   return (
      <Routes>
         <Route path="/login" element={<Login />} />
         <Route path="/register" element={<Register />} />

         <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
               <Route index element={<Navigate to="/checkin" replace />} />
               <Route path="/checkin" element={<CheckIn />} />
            </Route>
         </Route>
      </Routes>
   );
}
