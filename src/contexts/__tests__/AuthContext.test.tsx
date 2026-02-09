import { render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import { createClient } from "@/lib/supabase/client";

// Mock the supabase client
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(),
}));

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should provide auth context", () => {
    const mockSupabase = {
      auth: {
        onAuthStateChange: jest.fn(() => ({
          data: { subscription: { unsubscribe: jest.fn() } },
        })),
        getSession: jest.fn().mockResolvedValue({
          data: { session: null },
        }),
      },
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    const TestComponent = () => {
      const { user, loading } = useAuth();
      return (
        <div>
          {loading ? "Loading..." : user ? `User: ${user.email}` : "No user"}
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should handle auth state changes", () => {
    const mockUnsubscribe = jest.fn();
    const mockOnAuthStateChange = jest.fn((callback: (event: string, session: { user: { email: string } } | null) => void) => {
      // Simulate auth state change
      setTimeout(() => {
        callback("SIGNED_IN", { user: { email: "test@example.com" } });
      }, 0);
      return {
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      };
    });

    const mockSupabase = {
      auth: {
        onAuthStateChange: mockOnAuthStateChange,
        getSession: jest.fn().mockResolvedValue({
          data: { session: null },
        }),
      },
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    const TestComponent = () => {
      const { user } = useAuth();
      return <div>{user ? `User: ${user.email}` : "No user"}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
  });

  it("should throw error when useAuth is used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const TestComponent = () => {
      try {
        useAuth();
        return <div>No error</div>;
      } catch (error: unknown) {
        const err = error as Error;
        return <div>Error: {err.message}</div>;
      }
    };

    render(<TestComponent />);
    expect(screen.getByText(/Error:/)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
