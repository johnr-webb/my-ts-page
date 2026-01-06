import "./style.css";
import { setupThemeToggle, savedTheme } from "./theme.ts";
import { initMap, addMarkerFromAddress } from "./map.ts";

// Assets
import logoUrl from "./assets/logo.png";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="navbar">
    <div class="nav-title">
      <img class="logo" src="${logoUrl}" alt="JW website logo" />
      <h2 class="nav-title">Chicago Apartment Hunter</h2>
    </div>
    <ul class="nav-items">
      <li>Contact</li>
      <li>
        <button id="theme-toggle" type="button" aria-label="Toggle Theme">
          ${savedTheme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </li>
    </ul>
  </div>  
  <div class="app-wrap">
    <h1>My TypeScript Map Page</h1>
    <p>
      This is a simple TypeScript web page that integrates Google Maps and allows you to add markers based on addresses.
    </p>
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
      <p>This website is written and maintained by John Webb <a href="https://github.com/johnr-webb">Link to GitHub</a></p>
    </div>
  </div>
`;

setupThemeToggle(document.querySelector<HTMLButtonElement>("#theme-toggle")!);

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
