import LogUrl from "../assets/logo.png";
import { navigateTo } from "../router";
import { setupThemeToggle } from "./Theme";

const NavBar = (mount: HTMLElement) => {
  const navBarElement = mount;

  navBarElement.innerHTML = `
    <div class="nav-title">
      <a href="/" class="logo"><img src="${LogUrl}" alt="Apartment Aid Logo" class="logo"></a>
      <h3>Apartment Aid</h3>
    </div>
    <ul class="nav-items">
      <li><button class="nav-link" data-action="compare">Compare Apartments</button></li>
      <li><button class="nav-link" data-action="find">Find New</button></li>
      <li><button class="theme-toggle" aria-label="Toggle dark mode">🌙</button></li>  
    </ul>
  `;

  navBarElement
    .querySelector<HTMLAnchorElement>(".logo")!
    .addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo("/");
    });

  document
    .querySelector<HTMLUListElement>(".nav-items")
    ?.addEventListener("click", (e) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>(
        ".nav-link",
      )!;
      if (!target) return;
      const action = target.dataset.action;
      if (action === "compare") {
        navigateTo("/compare");
      }
      if (action === "find") {
        navigateTo("/find");
      }
    });

  // Setup theme toggle button
  const themeBtn =
    navBarElement.querySelector<HTMLButtonElement>(".theme-toggle");
  if (themeBtn) setupThemeToggle(themeBtn);
  return navBarElement;
};

export default NavBar;
