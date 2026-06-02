import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { vi } from "vitest";
import { useAccount } from "../useAccount";
import agent from "@/lib/api/agent";

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));

vi.mock("react-router", async (importOriginal) => {
   const mod = await importOriginal<typeof import("react-router")>();
   return { ...mod, useNavigate: () => mockNavigate };
});

vi.mock("@/lib/api/agent", () => ({
   default: {
      Account: {
         current: vi.fn(),
         login: vi.fn(),
         deleteAccount: vi.fn(),
         updateSettings: vi.fn(),
      },
   },
}));

function createWrapper() {
   const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
   });
   return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
   );
}

const mockUser: UserDto = {
   username: "testuser",
   email: "test@example.com",
   token: "mock-jwt-token",
   reminderEnabled: false,
};

describe("useAccount", () => {
   beforeEach(() => {
      localStorage.clear();
      vi.clearAllMocks();
   });

   it("does not fetch current user when no jwt in localStorage", () => {
      vi.mocked(agent.Account.current).mockResolvedValue(mockUser);

      renderHook(() => useAccount(), { wrapper: createWrapper() });

      expect(agent.Account.current).not.toHaveBeenCalled();
   });

   it("fetches current user when jwt exists in localStorage", async () => {
      localStorage.setItem("jwt", "existing-token");
      vi.mocked(agent.Account.current).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAccount(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.loadingUser).toBe(false));
      expect(result.current.currentUser).toEqual(mockUser);
      expect(agent.Account.current).toHaveBeenCalled();
   });

   it("loginUser stores jwt and navigates to /checkin", async () => {
      vi.mocked(agent.Account.current).mockResolvedValue(mockUser);
      vi.mocked(agent.Account.login).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAccount(), { wrapper: createWrapper() });

      act(() => result.current.loginUser.mutate({ email: "test@example.com", password: "secret" }));

      await waitFor(() => expect(result.current.loginUser.isSuccess).toBe(true));
      expect(localStorage.getItem("jwt")).toBe("mock-jwt-token");
      expect(mockNavigate).toHaveBeenCalledWith("/checkin");
   });

   it("logoutUser clears jwt and navigates to /login", () => {
      localStorage.setItem("jwt", "existing-token");
      vi.mocked(agent.Account.current).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAccount(), { wrapper: createWrapper() });

      act(() => result.current.logoutUser());

      expect(localStorage.getItem("jwt")).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith("/login");
   });

   it("deleteAccount clears jwt and navigates to /login", async () => {
      localStorage.setItem("jwt", "existing-token");
      vi.mocked(agent.Account.current).mockResolvedValue(mockUser);
      vi.mocked(agent.Account.deleteAccount).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAccount(), { wrapper: createWrapper() });

      act(() => result.current.deleteAccount.mutate());

      await waitFor(() => expect(result.current.deleteAccount.isSuccess).toBe(true));
      expect(localStorage.getItem("jwt")).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith("/login");
   });
});
