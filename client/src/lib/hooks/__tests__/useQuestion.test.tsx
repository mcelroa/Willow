import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { vi } from "vitest";
import { useQuestion } from "../useQuestion";
import agent from "@/lib/api/agent";

vi.mock("@/lib/api/agent", () => ({
   default: {
      Questions: {
         list: vi.fn(),
         create: vi.fn(),
         delete: vi.fn(),
         markAsked: vi.fn(),
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

const mockQuestions: QuestionDto[] = [
   { id: "1", text: "How is your appetite?", isAsked: false, createdAt: "2026-06-01T10:00:00Z" },
   { id: "2", text: "Any new symptoms?", isAsked: true, createdAt: "2026-06-01T09:00:00Z" },
];

describe("useQuestion", () => {
   beforeEach(() => vi.clearAllMocks());

   it("returns questions from the list query", async () => {
      vi.mocked(agent.Questions.list).mockResolvedValue(mockQuestions);

      const { result } = renderHook(() => useQuestion(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.questions).toEqual(mockQuestions);
   });

   it("defaults to empty array while loading", () => {
      vi.mocked(agent.Questions.list).mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useQuestion(), { wrapper: createWrapper() });

      expect(result.current.questions).toEqual([]);
      expect(result.current.isLoading).toBe(true);
   });

   it("createQuestion calls agent with the dto", async () => {
      const dto: CreateQuestionDto = { text: "How is your appetite?" };
      vi.mocked(agent.Questions.list).mockResolvedValue([]);
      vi.mocked(agent.Questions.create).mockResolvedValue("1");

      const { result } = renderHook(() => useQuestion(), { wrapper: createWrapper() });

      act(() => result.current.createQuestion.mutate(dto));

      await waitFor(() => expect(result.current.createQuestion.isSuccess).toBe(true));
      expect(agent.Questions.create).toHaveBeenCalledWith(dto);
   });

   it("deleteQuestion calls agent with the question id", async () => {
      vi.mocked(agent.Questions.list).mockResolvedValue([]);
      vi.mocked(agent.Questions.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useQuestion(), { wrapper: createWrapper() });

      act(() => result.current.deleteQuestion.mutate("1"));

      await waitFor(() => expect(result.current.deleteQuestion.isSuccess).toBe(true));
      expect(agent.Questions.delete).toHaveBeenCalledWith("1");
   });

   it("markAsked calls agent with the question id", async () => {
      vi.mocked(agent.Questions.list).mockResolvedValue([]);
      vi.mocked(agent.Questions.markAsked).mockResolvedValue(undefined);

      const { result } = renderHook(() => useQuestion(), { wrapper: createWrapper() });

      act(() => result.current.markAsked.mutate("1"));

      await waitFor(() => expect(result.current.markAsked.isSuccess).toBe(true));
      expect(agent.Questions.markAsked).toHaveBeenCalledWith("1");
   });
});
