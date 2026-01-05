import "./style.css";
import { setupThemeToggle, savedTheme } from "./theme.ts";
import { setupBackground } from "./background.ts";
import { initMap, addMarkerFromAddress } from "./map.ts";

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
    <div class="card">
      <select id="bg-select">
        <option value="#FFFFFF">White</option>
        <option value="#004d00">Dark Green</option>
        <option value="#533483">Purple</option>
      </select>
      <button id="bg-submit" type="button">Set BG</button>
    </div>
    <div id="map" style="width: 100%; height: 400px; border-radius: 8px;"></div>
    <div class="add-location-card">
      <h3>Add New Location</h3>
      <form id="add-location-form">
        <div class="form-group">
          <label for="location-type">Location Type:</label>
          <select id="location-type">
            <option value="walkup">Walkup</option>
            <option value="highrise">Highrise</option>
            <option value="work">Work</option>
          </select>
        </div>
        <div class="form-group">
          <label for="location-name">Location Name:</label>
          <input 
            type="text" 
            id="location-name" 
            placeholder="e.g. Home, Workout, Groceries" 
          />
        </div>
        <div class="form-group">
          <label for="location-address">Location Address:</label>
          <input 
            type="text" 
            id="location-address" 
            placeholder="Start typing address..." 
          />
        </div>
        <button id="add-location-btn" type="button">Add Marker</button>
      </form>
    </div>
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

const addLocationBtn =
  document.querySelector<HTMLButtonElement>("#add-location-btn")!;
const locationNameInput =
  document.querySelector<HTMLInputElement>("#location-name")!;
const locationAddressInput =
  document.querySelector<HTMLInputElement>("#location-address")!;
const locationTypeSelect =
  document.querySelector<HTMLSelectElement>("#location-type")!;

addLocationBtn.addEventListener("click", async () => {
  if (locationNameInput.value && locationAddressInput.value) {
    await addMarkerFromAddress(
      locationNameInput.value,
      locationAddressInput.value,
      locationTypeSelect.value as "walkup" | "highrise" | "work"
    );
    locationNameInput.value = "";
    locationAddressInput.value = "";
  }
});

initMap("map");
