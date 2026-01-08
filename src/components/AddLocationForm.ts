import { LocationService } from "../services/LocationsService";

export function renderForm(mount: HTMLElement) {
  mount.className = "add-location-card";
  mount.innerHTML = `
    <form id="add-location-form" class="location-form">
      <h3>Add New Location</h3>
      <div class="field">
        <label>Location Type:</label>
        <select id="location-type">
          <option value="walkup">Walkup</option>
          <option value="highrise">Highrise</option>
          <option value="work">Work</option>
        </select>
      </div>
      <div class="field">
        <label>Location Name:</label>
        <input type="text" id="location-name" placeholder="e.g. Home, Workout, Groceries" />
      </div>
      <div class="field">
        <label>Location Address:</label>
        <input type="text" id="location-address" placeholder="Start typing address..." />
      </div>
      <button type="submit">Add to Map & Table</button>
    </form>
  `;

  const form = mount.querySelector<HTMLFormElement>(
    '[id="add-location-form"]'
  )!;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("Submitting form...");
    // Get form values
    const nameInput = mount.querySelector<HTMLInputElement>(
      '[id="location-name"]'
    )!;
    const addrInput = mount.querySelector<HTMLInputElement>(
      '[id="location-address"]'
    )!;
    const typeSelect = mount.querySelector<HTMLSelectElement>(
      '[id="location-type"]'
    )!;
    // Simple validation
    const name = nameInput.value.trim();
    const address = addrInput.value.trim();
    const type = typeSelect.value as "walkup" | "highrise" | "work";

    if (!name || !address || !type) {
      alert("Please enter both a name, address, and type.");
      return;
    }
    const submitBtn = form.querySelector("button")!;

    // Visual feedback
    submitBtn.innerText = "Finding location...";
    submitBtn.disabled = true;

    await new Promise((resolve) => setTimeout(resolve, 10000));
    await LocationService.addByAddress(nameInput.value, addrInput.value);

    // Reset Form
    nameInput.value = "";
    addrInput.value = "";
    submitBtn.innerText = "Add to Map & Table";
    submitBtn.disabled = false;
  });
}
