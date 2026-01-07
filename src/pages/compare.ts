import { MapView } from "../components/mapView";

export function renderComparePage(appElement: HTMLElement) {
  const content = `
    <div class="compare-page">
      <div id="map"></div>
      <h1>Compare Apartments</h1>
      <p>
        Use this page to compare different apartments based on your preferences.
      </p>
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
    </div>
  `;
  appElement.innerHTML = content;
  MapView();
}
