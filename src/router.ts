import { renderHomePage } from "./pages/home.ts";
import { renderComparePage } from "./pages/compare.ts";
import { renderFindPage } from "./pages/find.ts";
import { renderSignUpPage } from "./pages/signup.ts";
import { renderSignInPage } from "./pages/signin.ts";
import { AuthService } from "./services/AuthService.ts";

export const routes = {
  "/": renderHomePage,
  "/compare": renderComparePage,
  "/find": renderFindPage,
  "/signup": renderSignUpPage,
  "/signin": renderSignInPage,
};

// Define protected routes that require authentication
const protectedRoutes = ["/compare"];

// Store intended destination for post-login redirect
let intendedDestination: string | null = null;

export function navigateTo(path: keyof typeof routes = "/") {
  console.log(`Navigating to ${path}`);

  // Check if route requires authentication
  if (protectedRoutes.includes(path) && !AuthService.isAuthenticated()) {
    // Store intended destination and redirect to signin
    intendedDestination = path;
    const renderPage = routes["/signin"];
    const mainContent = document.querySelector<HTMLDivElement>(
      '[class="main-content"]',
    );
    mainContent!.innerHTML = ""; // Clear existing content
    renderPage(mainContent!);
    return;
  }

  // If user is authenticated and tries to access auth pages, redirect to compare
  if (
    (path === "/signin" || path === "/signup") &&
    AuthService.isAuthenticated()
  ) {
    path = "/compare";
  }

  const renderPage = routes[path] ?? routes["/"];
  const mainContent = document.querySelector<HTMLDivElement>(
    '[class="main-content"]',
  );
  mainContent!.innerHTML = ""; // Clear existing content
  renderPage(mainContent!); // Render the new page
}

export function getIntendedDestination(): string | null {
  return intendedDestination;
}

export function clearIntendedDestination(): void {
  intendedDestination = null;
}

export function setupRouting() {
  window.onpopstate = () => {
    navigateTo(window.location.pathname as keyof typeof routes);
  };

  document.querySelectorAll<HTMLElement>("a[data-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const path = link.getAttribute("href")! as keyof typeof routes;
      window.history.pushState({}, "", path);
      navigateTo(path in routes ? path : "/");
    });
  });
}
