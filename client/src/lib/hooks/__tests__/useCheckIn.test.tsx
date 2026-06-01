import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { vi } from "vitest";
import { useCheckIn } from "../useCheckIn";
import agent from "@/lib/api/agent";

vi.mock("@/lib/api/agent", () => ({
   default: {
      CheckIns: {
         list: vi.fn(),
         details: vi.fn(),
         create: vi.fn(),
         update: vi.fn(),
         delete: vi.fn(),
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

const mockCheckIns: CheckIn[] = [
   { id: "1", mood: 7, pain: 3, fatigue: 5, nausea: 2, date: "2026-06-01" },
   { id: "2", mood: 8, pain: 2, fatigue: 4, nausea: 1, date: "2026-06-02" },
];

describe("useCheckIn", () => {
   beforeEach(() => vi.clearAllMocks());

   it("returns check-ins from the list query", async () => {
      vi.mocked(agent.CheckIns.list).mockResolvedValue(mockCheckIns);

      const { result } = renderHook(() => useCheckIn(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.loadingCheckIns).toBe(false));
      expect(result.current.checkIns).toEqual(mockCheckIns);
   });

   it("defaults to empty array while loading", () => {
      vi.mocked(agent.CheckIns.list).mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useCheckIn(), { wrapper: createWrapper() });

      expect(result.current.checkIns).toEqual([]);
      expect(result.current.loadingCheckIns).toBe(true);
   });

   it("does not fetch details when no id is provided", async () => {
      vi.mocked(agent.CheckIns.list).mockResolvedValue([]);

      renderHook(() => useCheckIn(), { wrapper: createWrapper() });

      await waitFor(() => expect(agent.CheckIns.list).toHaveBeenCalled());
      expect(agent.CheckIns.details).not.toHaveBeenCalled();
   });

   it("fetches check-in details when id is provided", async () => {
      vi.mocked(agent.CheckIns.list).mockResolvedValue([]);
      vi.mocked(agent.CheckIns.details).mockResolvedValue(mockCheckIns[0]);

      const { result } = renderHook(() => useCheckIn("1"), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.loadingCheckIn).toBe(false));
      expect(result.current.checkIn).toEqual(mockCheckIns[0]);
      expect(agent.CheckIns.details).toHaveBeenCalledWith("1");
   });

   it("createCheckIn calls agent with the dto", async () => {
      const dto: SaveCheckInDto = { mood: 7, pain: 3, fatigue: 5, nausea: 2, date: "2026-06-01" };
      vi.mocked(agent.CheckIns.list).mockResolvedValue([]);
      vi.mocked(agent.CheckIns.create).mockResolvedValue(mockCheckIns[0]);

      const { result } = renderHook(() => useCheckIn(), { wrapper: createWrapper() });

      act(() => result.current.createCheckIn.mutate(dto));

      await waitFor(() => expect(result.current.createCheckIn.isSuccess).toBe(true));
      expect(agent.CheckIns.create).toHaveBeenCalledWith(dto);
   });

   it("updateCheckIn calls agent with the id and dto", async () => {
      const dto: SaveCheckInDto = { mood: 8, pain: 2, fatigue: 4, nausea: 1, date: "2026-06-01" };
      vi.mocked(agent.CheckIns.list).mockResolvedValue([]);
      vi.mocked(agent.CheckIns.update).mockResolvedValue(mockCheckIns[0]);

      const { result } = renderHook(() => useCheckIn("1"), { wrapper: createWrapper() });

      act(() => result.current.updateCheckIn.mutate(dto));

      await waitFor(() => expect(result.current.updateCheckIn.isSuccess).toBe(true));
      expect(agent.CheckIns.update).toHaveBeenCalledWith("1", dto);
   });

   it("deleteCheckIn calls agent with the check-in id", async () => {
      vi.mocked(agent.CheckIns.list).mockResolvedValue([]);
      vi.mocked(agent.CheckIns.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useCheckIn(), { wrapper: createWrapper() });

      act(() => result.current.deleteCheckIn.mutate("1"));

      await waitFor(() => expect(result.current.deleteCheckIn.isSuccess).toBe(true));
      expect(agent.CheckIns.delete).toHaveBeenCalledWith("1");
   });
});
