import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { vi } from "vitest";
import { useSharing } from "../useSharing";
import agent from "@/lib/api/agent";

vi.mock("@/lib/api/agent", () => ({
   default: {
      Sharing: {
         list: vi.fn(),
         create: vi.fn(),
         revoke: vi.fn(),
         deleteRevoked: vi.fn(),
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

const mockShareLinks: ShareLink[] = [
   {
      id: "1",
      token: "abc123",
      label: "For Dr. Smith",
      createdAt: "2026-06-01T10:00:00Z",
      isRevoked: false,
   },
   {
      id: "2",
      token: "def456",
      createdAt: "2026-06-01T09:00:00Z",
      isRevoked: true,
   },
];

describe("useSharing", () => {
   beforeEach(() => vi.clearAllMocks());

   it("returns share links from the list query", async () => {
      vi.mocked(agent.Sharing.list).mockResolvedValue(mockShareLinks);

      const { result } = renderHook(() => useSharing(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.shareLinks).toEqual(mockShareLinks);
   });

   it("defaults to empty array while loading", () => {
      vi.mocked(agent.Sharing.list).mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useSharing(), { wrapper: createWrapper() });

      expect(result.current.shareLinks).toEqual([]);
      expect(result.current.isLoading).toBe(true);
   });

   it("createShareLink calls agent with the dto", async () => {
      const dto: CreateShareLinkDto = { label: "For Dr. Smith" };
      vi.mocked(agent.Sharing.list).mockResolvedValue([]);
      vi.mocked(agent.Sharing.create).mockResolvedValue(mockShareLinks[0]);

      const { result } = renderHook(() => useSharing(), { wrapper: createWrapper() });

      act(() => result.current.createShareLink.mutate(dto));

      await waitFor(() => expect(result.current.createShareLink.isSuccess).toBe(true));
      expect(agent.Sharing.create).toHaveBeenCalledWith(dto);
   });

   it("revokeShareLink calls agent with the link id", async () => {
      vi.mocked(agent.Sharing.list).mockResolvedValue([]);
      vi.mocked(agent.Sharing.revoke).mockResolvedValue(undefined);

      const { result } = renderHook(() => useSharing(), { wrapper: createWrapper() });

      act(() => result.current.revokeShareLink.mutate("1"));

      await waitFor(() => expect(result.current.revokeShareLink.isSuccess).toBe(true));
      expect(agent.Sharing.revoke).toHaveBeenCalledWith("1");
   });

   it("deleteRevokedLinks calls agent", async () => {
      vi.mocked(agent.Sharing.list).mockResolvedValue([]);
      vi.mocked(agent.Sharing.deleteRevoked).mockResolvedValue(undefined);

      const { result } = renderHook(() => useSharing(), { wrapper: createWrapper() });

      act(() => result.current.deleteRevokedLinks.mutate());

      await waitFor(() => expect(result.current.deleteRevokedLinks.isSuccess).toBe(true));
      expect(agent.Sharing.deleteRevoked).toHaveBeenCalled();
   });
});
