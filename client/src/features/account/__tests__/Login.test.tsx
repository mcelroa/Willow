import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";
import Login from "../Login";

const mockMutate = vi.fn();

vi.mock("@/lib/hooks/useAccount", () => ({
   useAccount: () => ({
      loginUser: { mutate: mockMutate, isPending: false, isError: false },
      currentUser: null,
      logoutUser: vi.fn(),
   }),
}));

function renderLogin() {
   return render(
      <MemoryRouter>
         <Login />
      </MemoryRouter>
   );
}

describe("Login", () => {
   beforeEach(() => {
      mockMutate.mockClear();
   });

   it("renders the sign in form", () => {
      renderLogin();
      expect(screen.getByRole("heading", { name: /sign in to your account/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
   });

   it("shows validation error for invalid email", async () => {
      const user = userEvent.setup();
      renderLogin();

      await user.type(screen.getByLabelText(/email/i), "not-an-email");
      await user.type(screen.getByLabelText(/password/i), "secret");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
      expect(mockMutate).not.toHaveBeenCalled();
   });

   it("shows validation error for empty password", async () => {
      const user = userEvent.setup();
      renderLogin();

      await user.type(screen.getByLabelText(/email/i), "user@example.com");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
      expect(mockMutate).not.toHaveBeenCalled();
   });

   it("calls loginUser.mutate with form data on valid submit", async () => {
      const user = userEvent.setup();
      renderLogin();

      await user.type(screen.getByLabelText(/email/i), "user@example.com");
      await user.type(screen.getByLabelText(/password/i), "secret");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      expect(mockMutate).toHaveBeenCalledWith({
         email: "user@example.com",
         password: "secret",
      });
   });
});
