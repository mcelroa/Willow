import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import AppRouter from "./app/AppRouter.tsx";

const queryClient = new QueryClient();

/**
 * In demo mode there's no backend — MSW intercepts /api/* in the browser.
 *
 * The dynamic import keeps MSW out of the normal production bundle entirely,
 * and the await matters: service worker activation is async, so rendering
 * before it resolves lets the first request escape to the network, 401, and
 * bounce the user to /login.
 */
async function enableDemoMode() {
   if (import.meta.env.VITE_DEMO_MODE !== "true") return;

   const { worker } = await import("./mocks/browser");
   await worker.start({
      serviceWorker: { url: "/mockServiceWorker.js" },
      onUnhandledRequest: "bypass", // fonts and static assets pass straight through
   });
}

enableDemoMode().then(() => {
   createRoot(document.getElementById("root")!).render(
      <StrictMode>
         <BrowserRouter>
            <QueryClientProvider client={queryClient}>
               <AppRouter />
            </QueryClientProvider>
         </BrowserRouter>
      </StrictMode>,
   );
});
