import LogUrl from "../assets/logo.png";
import { navigateTo } from "../router";
import { setupThemeToggle } from "./Theme";

const NavBar = (mount: HTMLElement) => {
  const navBarElement = mount;
  navBarElement.className = "navbar";

  navBarElement.innerHTML = `
    <div class="nav-title">
      <a href="#" id="home-link"><img src="${LogUrl}" alt="Housing Hunt Logo" class="logo"></a>
      <h2 class="nav-title">Housing Hunt</h2>
    </div>
    <ul class="nav-items">
      <li><p class="theme-btn">🌙</p></li>
      <li><a href="#" id="compare-link">Compare Apartments</a></li>
      <li><a href="#" id="find-link">Find</a></li>
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
    navBarElement.querySelector<HTMLParagraphElement>(".theme-btn");
  if (themeBtn) setupThemeToggle(themeBtn);
  return navBarElement;
};

export default NavBar;
