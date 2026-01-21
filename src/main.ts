import "./style.css";
import NavBar from "./components/NavBar";
import { navigateTo, setupRouting, routes } from "./router";

document.querySelector<HTMLDivElement>('[id="app"]')!.innerHTML = `
  <div class="navbar"></div>
  <div class="main-content"></div>
  <div class="footer">
    <p>This website is written and maintained by John Webb <a href="https://github.com/johnr-webb">Link to GitHub</a></p>
  </div>
`;

// Mount NavBar
const navBarMount = document.querySelector<HTMLDivElement>('[class="navbar"]')!;
NavBar(navBarMount);

// Setup routing and render initial page (uses current pathname, falls back to "/")
setupRouting();

const path = window.location.pathname.replace("my-ts-page/", "");
navigateTo((path as keyof typeof routes) || "/");
