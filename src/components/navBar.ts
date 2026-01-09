import LogUrl from "../assets/logo.png";
import { navigateTo } from "../router";
import { setupThemeToggle } from "./Theme";

const NavBar = (mount: HTMLElement) => {
  const navBarElement = mount;
  navBarElement.className = "navbar";

  navBarElement.innerHTML = `
    <div class="nav-title">
      <img src="${LogUrl}" alt="Housing Hunt Logo" class="logo" />
      <h2 class="nav-title">Housing Hunt</h2>
    </div>
    <ul class="nav-items">
      <li><a href="#" id="home-link">Home</a></li>
      <li><a href="#" id="compare-link">Compare Apartments</a></li>
      <li><a href="#" id="find-link">Find</a></li>
      <li>
        <button id="theme-toggle" type="button" aria-label="Toggle Theme">
          Toggle Theme
        </button>
      </li>
    </ul>
  `;

  navBarElement
    .querySelector<HTMLAnchorElement>("#home-link")!
    .addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo("/");
    });

  navBarElement
    .querySelector<HTMLAnchorElement>("#compare-link")!
    .addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo("/compare");
    });

  navBarElement
    .querySelector<HTMLAnchorElement>("#find-link")!
    .addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo("/find");
    });

  // Setup theme toggle button
  const themeBtn =
    navBarElement.querySelector<HTMLButtonElement>("#theme-toggle");
  if (themeBtn) setupThemeToggle(themeBtn);

  return navBarElement;
};

export default NavBar;
