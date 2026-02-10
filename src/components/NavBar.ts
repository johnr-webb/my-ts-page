import { BaseComponent } from '../base/BaseComponent';
import LogUrl from "../assets/logo.png";
import { navigateTo } from "../router";
import { setupThemeToggle } from "./Theme";
import { AuthServiceInstance } from "../services/AuthService";


export class NavBar extends BaseComponent {
  private authStateController: AbortController | null = null;

  protected render(): void {
    const isAuthenticated = AuthServiceInstance.isAuthenticated();
    const currentUser = AuthServiceInstance.getCurrentUser();

    this.element.innerHTML = `
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
  }

  protected setupEventListeners(): void {
    super.setupEventListeners();

    // Logo click handler
    const logo = this.element.querySelector<HTMLAnchorElement>(".logo");
    if (logo) {
      this.addEventListener(
        logo,
        "click",
        (e) => {
          e.preventDefault();
          navigateTo("/");
        }
      );
    }

    // Nav items click handler
    const navItems = this.element.querySelector<HTMLUListElement>(".nav-items");
    if (navItems) {
      this.addEventListener(
        navItems,
        "click",
        (e) => {
          const target = (e.target as HTMLElement).closest<HTMLElement>(".nav-link");
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
              AuthServiceInstance.signOut();
              navigateTo("/");
              break;
          }
        }
      );
    }

    // Setup theme toggle button
    const themeBtn = this.element.querySelector<HTMLButtonElement>(".theme-toggle");
    if (themeBtn) setupThemeToggle(themeBtn);

    // Listen for authentication state changes
    this.authStateController = new AbortController();
    this.addEventListener(
      window,
      'authStateChanged',
      () => {
        this.render();
      },
      { signal: this.authStateController.signal }
    );
  }

  destroy(): void {
    if (this.authStateController) {
      this.authStateController.abort();
      this.authStateController = null;
    }
    super.destroy();
  }
}

// Export factory function for backward compatibility
export default function NavBarFactory(mount: HTMLElement): HTMLElement {
  const navBar = new NavBar(mount);
  navBar.init();
  (mount as any).cleanup = () => navBar.destroy();
  return mount;
}
