import Login from "@/features/account/Login";
import Register from "@/features/account/Register";
import ForgotPassword from "@/features/account/ForgotPassword";
import ResetPassword from "@/features/account/ResetPassword";
import VerifyEmail from "@/features/account/VerifyEmail";
import { Navigate, Route, Routes } from "react-router";
import RequireAuth from "@/app/layout/RequireAuth";
import Layout from "@/app/layout/Layout";
import CheckIn from "@/features/checkIn/CheckIn";
import History from "@/features/checkIn/History";
import EditCheckIn from "@/features/checkIn/EditCheckIn";
import Trends from "@/features/checkIn/Trends";
import Questions from "@/features/question/Questions";
import Summary from "@/features/export/Summary";

export default function AppRouter() {
   return (
      <Routes>
         <Route path="/login" element={<Login />} />
         <Route path="/register" element={<Register />} />
         <Route path="/forgot-password" element={<ForgotPassword />} />
         <Route path="/reset-password" element={<ResetPassword />} />
         <Route path="/verify-email" element={<VerifyEmail />} />

         <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
               <Route index element={<Navigate to="/checkin" replace />} />
               <Route path="/checkin" element={<CheckIn />} />
               <Route path="/history" element={<History />} />
               <Route path="/history/:id" element={<EditCheckIn />} />
               <Route path="/trends" element={<Trends />} />
               <Route path="/questions" element={<Questions />} />
               <Route path="/summary" element={<Summary />} />
            </Route>
         </Route>
      </Routes>
   );
}
