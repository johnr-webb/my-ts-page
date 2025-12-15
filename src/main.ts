import "./style.css";
import { setupCounter } from "./counter.ts";
import { setupThemeToggle, savedTheme } from "./theme.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="app-wrap">
    <div class="navbar">
      <ul>
        <li>
          <img class="logo" src="/favicon.png" alt="JW website logo" />
        </li>
        <li>Home</li>
        <li>About</li>
        <li>Contact</li>
        <li>
          <button id="theme-toggle" type="button" aria-label="Toggle Theme">
            ${savedTheme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </li>
      </ul>
    </div>
    <div class="header">
      <img src="/headshot.jpg" alt="John Webb's handsome headshot" />
      <div>
        <h1>John Webb's GitHub Pages Site</h1>
        <a href="https://github.com/johnr-webb">Link to GitHub</a>
      </div>
    </div>
    <div class="card">
      <button id="counter" type="button" aria-label="Counter"></button>
    </div>
    <div class="footer">
      <p>This website is written and maintained by John Webb</p>
    </div>
  </div>
`;

setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);
setupThemeToggle(document.querySelector<HTMLButtonElement>("#theme-toggle")!);
