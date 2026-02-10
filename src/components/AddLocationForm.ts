import { BaseComponent } from '../base/BaseComponent';
import { LocationServiceInstance } from "../services/LocationsService";

export class AddLocationForm extends BaseComponent {
  protected render(): void {
    this.element.className = "add-location-card";
    this.element.innerHTML = `
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
  }

  protected setupEventListeners(): void {
    super.setupEventListeners();

    const form = this.element.querySelector<HTMLFormElement>('#add-location-form')!;
    
    this.addEventListener(form, 'submit', async (e) => {
      e.preventDefault();
      await this.handleFormSubmit();
    });
  }

  private async handleFormSubmit(): Promise<void> {
    console.log("Submitting form...");
    
    // Get form values
    const nameInput = this.element.querySelector<HTMLInputElement>('#location-name')!;
    const addrInput = this.element.querySelector<HTMLInputElement>('#location-address')!;
    const typeSelect = this.element.querySelector<HTMLSelectElement>('#location-type')!;
    const form = this.element.querySelector<HTMLFormElement>('#add-location-form')!;
    
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

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Reduced timeout
      await LocationServiceInstance.addByAddress(nameInput.value, addrInput.value);

      // Reset Form
      nameInput.value = "";
      addrInput.value = "";
      submitBtn.innerText = "Add to Map & Table";
      submitBtn.disabled = false;
    } catch (error) {
      submitBtn.innerText = "Add to Map & Table";
      submitBtn.disabled = false;
      console.error('Failed to add location:', error);
    }
  }
}

// Export factory function for backward compatibility
export function renderForm(mount: HTMLElement): void {
  const form = new AddLocationForm(mount);
  form.init();
  (mount as any).cleanup = () => form.destroy();
}