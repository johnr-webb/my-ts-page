import LogUrl from "../assets/logo.png";
import { navigateTo } from "../router";
import { setupThemeToggle } from "./Theme";
import { AuthService } from "../services/AuthService";

const NavBar = (mount: HTMLElement) => {
  const navBarElement = mount;
  let currentEventController: AbortController | null = null;
  let authStateController: AbortController | null = null;

  const renderNavBar = () => {
    const isAuthenticated = AuthService.isAuthenticated();
    const currentUser = AuthService.getCurrentUser();

    navBarElement.innerHTML = `
      <div class="nav-title">
        <a href="/" class="logo"><img src="${LogUrl}" alt="Apartment Aid Logo" class="logo"></a>
        <h3>Apartment Aid</h3>
      </div>
      <ul class="nav-items">
        <li><button class="nav-link" data-action="compare">Compare Apartments</button></li>
        <li><button class="nav-link" data-action="find">Find New (Soon)</button></li>
        ${
          isAuthenticated
            ? `
          <li class="nav-user">
            <span class="user-greeting">Hi, ${currentUser?.name}!</span>
            <button class="nav-link" data-action="signout">Sign Out</button>
          </li>
        `
            : `
          <li><button class="nav-link" data-action="signin">Sign In</button></li>
          <li><button class="nav-link" data-action="signup">Sign Up</button></li>
        `
        }
        <li><button class="theme-toggle" aria-label="Toggle dark mode">🌙</button></li>  
      </ul>
    `;

    setupEventListeners();
  };

  const setupEventListeners = () => {
    // Clean up previous event listeners
    if (currentEventController) {
      currentEventController.abort();
    }
    currentEventController = new AbortController();

    navBarElement.querySelector<HTMLAnchorElement>(".logo")!.addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        navigateTo("/");
      },
      { signal: currentEventController.signal },
    );

    document.querySelector<HTMLUListElement>(".nav-items")?.addEventListener(
      "click",
      (e) => {
        const target = (e.target as HTMLElement).closest<HTMLElement>(
          ".nav-link",
        )!;
        if (!target) return;

        const action = target.dataset.action;

        switch (action) {
          case "compare":
            navigateTo("/compare");
            break;
          case "find":
            navigateTo("/find");
            break;
          case "signin":
            navigateTo("/signin");
            break;
          case "signup":
            navigateTo("/signup");
            break;
          case "signout":
            AuthService.signOut();
            navigateTo("/");
            break;
        }
      },
      { signal: currentEventController.signal },
    );

    // Setup theme toggle button
    const themeBtn =
      navBarElement.querySelector<HTMLButtonElement>(".theme-toggle");
    if (themeBtn) setupThemeToggle(themeBtn);
  };

  // Clean up auth state listener when component is destroyed
  const cleanup = () => {
    if (currentEventController) {
      currentEventController.abort();
    }
    if (authStateController) {
      authStateController.abort();
    }
  };

  // Listen for authentication state changes
  authStateController = new AbortController();

  window.addEventListener(
    "authStateChanged",
    () => {
      renderNavBar();
    },
    { signal: authStateController.signal },
  );

  // Initial render
  renderNavBar();

  // Return cleanup function along with the element
  (navBarElement as any).cleanup = cleanup;
  return navBarElement;
};

export default NavBar;
