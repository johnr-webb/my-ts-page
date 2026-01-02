import "./style.css";
import { setupThemeToggle, savedTheme } from "./theme.ts";
import { setupBackground } from "./background.ts";
import { setupLoad } from "./on_load.ts";

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
      <select id="bg-select">
        <option value="#000000">Black</option>
        <option value="#1a1a2e">Dark Blue</option>
        <option value="#16213e">Navy</option>
        <option value="#0f3460">Deep Blue</option>
        <option value="#533483">Purple</option>
      </select>
      <button id="bg-submit" type="button">Set BG</button>
    </div>
    <div id="map" style="width: 100%; height: 400px; border-radius: 8px;"></div>
    <div class="footer">
      <p>This website is written and maintained by John Webb</p>
    </div>
  </div>
`;

setupThemeToggle(document.querySelector<HTMLButtonElement>("#theme-toggle")!);
setupBackground(
  document.querySelector<HTMLSelectElement>("#bg-select")!,
  document.querySelector<HTMLButtonElement>("#bg-submit")!
);
setupLoad(document.getElementById("maps-script") as HTMLScriptElement);
