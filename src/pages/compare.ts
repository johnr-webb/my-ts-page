import { renderMap } from "../components/MapView";
import { renderTable } from "../components/LocationsTable";
import { renderForm } from "../components/AddLocationForm";
import { LocationService } from "../services/LocationsService";
import { renderUserSurvey } from "../components/NewUserForm";

export async function renderComparePage(appElement: HTMLElement) {
  const content = `
    <div class="compare-page">
      <h1>Compare Apartments!</h1>
      <p>
        Please fill out the form below to get started.
      </p>
      <div id="new-user-form"></div>
      <div id="map"></div>
      <div id="add-location-card"></div>
      <div id="locations-table"></div>
    </div>
  `;

  appElement.innerHTML = content;
  let hasVisited = localStorage.getItem("newUser");
  let newUser = true;
  if (hasVisited === null) {
    let newUser = false;
  }
  console.log(newUser);
  if (newUser) {
    renderUserSurvey(
      appElement.querySelector<HTMLDivElement>('[id="new-user-form"]')!
    );
  } else {
    renderMap(appElement.querySelector<HTMLDivElement>('[id="map"]')!);
    renderForm(
      appElement.querySelector<HTMLDivElement>('[id="add-location-card"]')!
    );
    renderTable(
      appElement.querySelector<HTMLDivElement>('[id="locations-table"]')!
    );
  }

  // 2. Trigger the initial load
  await LocationService.fetchAll();
}
