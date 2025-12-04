import "./style.css";
import { setupCounter } from "./counter.ts";
import { setupThemeToggle, savedTheme } from "./theme.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="app-wrap">
    <div class="sticky-element">
      I will stick to the top!
    </div>
    <p>Lots of content...</p>
    <p>More content...</p>
    <div class="header">
      <div>
        <h1>John Webb's GitHub Pages Site</h1>
        <p class="lead">I am going to make this page really cool.</p>
      </div>
    </div>
    <div>
        <button id="theme-toggle" class="theme-btn" aria-pressed="${
          savedTheme === "light"
        }" title="Toggle theme">Toggle theme</button>
    </div>
    <div class="card">
      <button id="counter" type="button" aria-label="Counter"></button>
    </div>
  </div>
`;

setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);
setupThemeToggle(document.querySelector<HTMLButtonElement>("#theme-toggle")!);
