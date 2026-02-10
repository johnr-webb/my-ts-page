import "./style.css";
import NavBarFactory from "./components/NavBar";
import { navigateTo, setupRouting, routes } from "./router";
import { AuthServiceInstance } from "./services/AuthService";

document.querySelector<HTMLDivElement>('[id="app"]')!.innerHTML = `
  <header class="site-header">
    <nav class="navbar"></nav>
  </header>
  <main class="site-main">
    <div class="main-content"></div>
  </main>
  <footer class="site-footer">
    <p>This website is written and maintained by John Webb <a href="https://github.com/johnr-webb">Link to GitHub</a></p>
  </footer>
`;

// Initialize authentication state
AuthServiceInstance.getCurrentUser();

// Mount NavBar
const navBarMount = document.querySelector<HTMLDivElement>('[class="navbar"]')!;
NavBarFactory(navBarMount);

// Setup routing and render initial page (uses current pathname, falls back to "/")
setupRouting();

const path = window.location.pathname.replace("my-ts-page/", "");
navigateTo((path as keyof typeof routes) || "/");
