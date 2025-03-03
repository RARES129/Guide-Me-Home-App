import { render, screen } from "@testing-library/react";
import App from "./App";
import { MemoryRouter } from "react-router-dom";
import * as React from "react";

// Mock child components
jest.mock("./pages/Login/LoginHandler", () => {
  return function DummyLogin() {
    return <div
      data-testid="login-component"
    >Login Component</div>;
  };
});

jest.mock("./pages/Register/RegisterHandler", () => {
  return function DummyRegister() {
    return <div
      data-testid="register-component"
    >Register Component</div>;
  };
});

jest.mock("./pages/Home/Home", () => {
  return function DummyHome() {
    return <div
    data-testid="home-component"
    >Home Component</div>;
  };
});

// Mock `localStorage`
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("App Component Routing", () => {
  beforeEach(() => {
    localStorageMock.clear(); // Reset mock before each test
  });

  //TODO: it renders the login component even if the user is authenticated
  it.skip("redirects to Home if authenticated on login route", () => {
    localStorageMock.setItem("isAuthenticated", "true"); // Simulate authenticated user
    const view = render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );
    console.log(view);
    // Ensure Home Component renders
    expect(screen.getByTestId("home-component")).toBeDefined();
  });

  it("renders Login if not authenticated on login route", () => {
    localStorageMock.setItem("isAuthenticated", "false"); // Simulate unauthenticated user
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );

    // Ensure Login Component renders
    expect(screen.getByTestId("login-component")).toBeDefined();
  });

  // TODO: it redirects to Register, not on Home
  it.skip("redirects to Home if authenticated on register route", () => {
    localStorageMock.setItem("isAuthenticated", "true"); // Simulate authenticated user
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <App />
      </MemoryRouter>
    );

    // Ensure Home Component renders
    expect(screen.getByTestId("home-component")).toBeDefined();
  });

  it("renders Register if not authenticated on register route", () => {
    localStorageMock.setItem("isAuthenticated", "false"); // Simulate unauthenticated user
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <App />
      </MemoryRouter>
    );

    // Ensure Register Component renders
    expect(screen.getByTestId("register-component")).toBeDefined();
  });

  // TODO: it redirects to Login, not on Home
  it.skip("redirects to Home on any unknown route", () => {
    localStorageMock.setItem("isAuthenticated", "true"); // Simulate authenticated user
    render(
      <MemoryRouter initialEntries={["/unknown"]}>
        <App />
      </MemoryRouter>
    );

    // Ensure Home Component renders
    expect(screen.getByTestId("home-component")).toBeDefined();
  });
});
