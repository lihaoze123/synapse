import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// Mock modules - vi.mock is hoisted, so no variables allowed inside
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    login: vi.fn(),
    register: vi.fn(),
    loginWithGitHub: vi.fn(),
    loginWithGoogle: vi.fn(),
    isLoggingIn: false,
    isRegistering: false,
  }),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div>{children}</div>,
  CardDescription: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/tabs", () => {
  const { useState } = require("react");

  return {
    Tabs: ({ children, defaultValue }: any) => {
      const [activeTab, setActiveTab] = useState(defaultValue);
      return (
        <div data-testid="tabs" data-active-tab={activeTab}>
          {React.Children.map(children, (child) => {
            if (child.type?.name === "TabsList" || child.type?.displayName === "TabsList") {
              return React.cloneElement(child, { activeTab, setActiveTab });
            }
            if (child.type?.name === "TabsContent" || child.type?.displayName === "TabsContent") {
              const { value } = child.props;
              if (value === activeTab) {
                return child;
              }
              return null;
            }
            return child;
          })}
        </div>
      );
    },
    TabsList: ({ children, activeTab, setActiveTab }: any) => (
      <div data-testid="tabs-list">
        {React.Children.map(children, (child) => {
          if (child.type?.name === "TabsTrigger" || child.type?.displayName === "TabsTrigger") {
            return React.cloneElement(child, { activeTab, setActiveTab });
          }
          return child;
        })}
      </div>
    ),
    TabsTrigger: ({ children, value, activeTab, setActiveTab }: any) => (
      <button
        role="tab"
        data-value={value}
        data-state={activeTab === value ? "active" : "inactive"}
        onClick={() => setActiveTab(value)}
      >
        {children}
      </button>
    ),
    TabsContent: ({ children, value }: any) => (
      <div data-testid={`tabs-content-${value}`}>{children}</div>
    ),
  };
});

vi.mock("@/components/auth/LoginForm", () => ({
  LoginForm: ({ onSubmit, onOAuthLogin }: any) => (
    <div data-testid="login-form">
      <button onClick={() => onSubmit({ username: "test", password: "test" })}>Login</button>
      <button onClick={onOAuthLogin.github}>GitHub</button>
      <button onClick={onOAuthLogin.google}>Google</button>
    </div>
  ),
}));

vi.mock("@/components/auth/RegisterForm", () => ({
  RegisterForm: ({ onSubmit, onOAuthLogin }: any) => (
    <div data-testid="register-form">
      <button onClick={() => onSubmit({ username: "test", email: "test@test.com", password: "test" })}>Register</button>
      <button onClick={onOAuthLogin.github}>GitHub</button>
      <button onClick={onOAuthLogin.google}>Google</button>
    </div>
  ),
}));

// Import LoginPage after mocks are set up
import { LoginPage } from "@/components/auth/LoginPage";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render login form by default", () => {
    render(<LoginPage />);
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });

  it("should switch to register form when clicking tab", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("tab", { name: /sign up/i }));
    expect(screen.getByTestId("register-form")).toBeInTheDocument();
  });

  it("should display both GitHub and Google OAuth options", () => {
    render(<LoginPage />);
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
    // GitHub and Google buttons are inside the login form
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("Google")).toBeInTheDocument();
  });
});
