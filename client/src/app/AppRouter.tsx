import Login from "@/features/account/Login";
import Register from "@/features/account/Register";
import ForgotPassword from "@/features/account/ForgotPassword";
import ResetPassword from "@/features/account/ResetPassword";
import VerifyEmail from "@/features/account/VerifyEmail";
import ChangePassword from "@/features/account/ChangePassword";
import { Route, Routes } from "react-router";
import RequireAuth from "@/app/layout/RequireAuth";
import Layout from "@/app/layout/Layout";
import CheckIn from "@/features/checkIn/CheckIn";
import History from "@/features/checkIn/History";
import EditCheckIn from "@/features/checkIn/EditCheckIn";
import Trends from "@/features/checkIn/Trends";
import Questions from "@/features/question/Questions";
import Summary from "@/features/export/Summary";
import Sharing from "@/features/sharing/Sharing";
import SharedView from "@/features/sharing/SharedView";
import LandingPage from "@/features/landing/LandingPage";
import PrivacyPolicy from "@/features/landing/PrivacyPolicy";
import NotFound from "@/features/errors/NotFound";

export default function AppRouter() {
   return (
      <Routes>
         <Route path="/" element={<LandingPage />} />
         <Route path="/privacy" element={<PrivacyPolicy />} />
         <Route path="/login" element={<Login />} />
         <Route path="/register" element={<Register />} />
         <Route path="/forgot-password" element={<ForgotPassword />} />
         <Route path="/reset-password" element={<ResetPassword />} />
         <Route path="/verify-email" element={<VerifyEmail />} />
         <Route path="/share/:token" element={<SharedView />} />

         <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
               <Route path="/checkin" element={<CheckIn />} />
               <Route path="/history" element={<History />} />
               <Route path="/history/:id" element={<EditCheckIn />} />
               <Route path="/trends" element={<Trends />} />
               <Route path="/questions" element={<Questions />} />
               <Route path="/summary" element={<Summary />} />
               <Route path="/sharing" element={<Sharing />} />
               <Route path="/change-password" element={<ChangePassword />} />
            </Route>
         </Route>

         <Route path="*" element={<NotFound />} />
      </Routes>
   );
}
