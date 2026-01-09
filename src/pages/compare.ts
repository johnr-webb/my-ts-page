import { renderMap } from "../components/MapView";
import { renderTable } from "../components/LocationsTable";
import { renderForm } from "../components/AddLocationForm";
import { LocationService } from "../services/LocationsService";

export async function renderComparePage(appElement: HTMLElement) {
  const content = `
    <div class="compare-page">
      <h1>Compare Apartments</h1>
      <p>
        Use this page to compare different apartments based on your preferences.
      </p>
      <div id="map"></div>
      <div id="add-location-card"></div>
      <div id="locations-table"></div>
    </div>
  `;

  appElement.innerHTML = content;

  // 1. Initialize Components (Pass them their specific "homes")
  renderMap(appElement.querySelector<HTMLDivElement>('[id="map"]')!);
  renderForm(
    appElement.querySelector<HTMLDivElement>('[id="add-location-card"]')!
  );
  renderTable(
    appElement.querySelector<HTMLDivElement>('[id="locations-table"]')!
  );

  // 2. Trigger the initial load
  await LocationService.fetchAll();
}
