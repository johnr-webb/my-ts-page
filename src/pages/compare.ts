import { renderMap } from "../components/MapView";
import { renderTable } from "../components/LocationsTable";
import { renderForm } from "../components/AddLocationForm";
import { LocationService } from "../services/LocationsService";
import { renderUserSurvey } from "../components/NewUserForm";

export async function renderComparePage(appElement: HTMLElement) {
  const content = `
    <div class="page-container page-container--wide">
      <div class="page-content">
        <h1>Compare Apartments!</h1>
        <p>Please fill out the form below to get started.</p>
        
        <div class="new-user-form"></div>
        <div class="map"></div>
        <div class="add-location-card"></div>
        <div class="locations-table"></div>
      </div>
    </div>
  `;

  appElement.innerHTML = content;
  let hasVisited = localStorage.getItem("newUser");
  let newUser = hasVisited === null;

  if (newUser) {
    console.log("New User! Rendering new user survey.");
    renderUserSurvey(
      appElement.querySelector<HTMLDivElement>(".new-user-form")!,
    );
  } else {
    console.log("Old User! Rendering content directly.");
    renderMap(appElement.querySelector<HTMLDivElement>(".map")!);
    renderForm(appElement.querySelector<HTMLDivElement>(".add-location-card")!);
    renderTable(appElement.querySelector<HTMLDivElement>(".locations-table")!);
  }

  // 2. Trigger the initial load
  await LocationService.fetchAll();
}
