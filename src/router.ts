import { renderHomePage } from "./pages/home.ts";
import { renderComparePage } from "./pages/compare.ts";
import { renderFindPage } from "./pages/find.ts";

export const routes = {
  "/": renderHomePage,
  "/compare": renderComparePage,
  "/find": renderFindPage,
};

export function navigateTo(path: keyof typeof routes = "/") {
  console.log(`Navigating to ${path}`);
  const renderPage = routes[path] ?? routes["/"];
  const mainContent = document.querySelector<HTMLDivElement>(
    '[class="main-content"]',
  );
  mainContent!.innerHTML = ""; // Clear existing content
  renderPage(mainContent!); // Render the new page
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
