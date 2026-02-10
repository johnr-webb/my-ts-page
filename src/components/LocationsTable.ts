import {
  type LocationItem,
  LocationServiceInstance,
} from "../services/LocationsService";

export function renderTable(mount: HTMLElement) {
  mount.innerHTML = `
        <table class="locations-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Price</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="table-body">
                </tbody>
        </table>
    `;

  const tableBody =
    mount.querySelector<HTMLTableSectionElement>('[id="table-body"]')!;

  const updateRows = (locations: LocationItem[]) => {
    if (locations.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5">No locations added yet.</td></tr>`;
      return;
    }

    tableBody.innerHTML = locations
      .map(
        (loc) => `
            <tr>
                <td>${loc.id}</td>
                <td>${loc.position.lat.toFixed(4)}</td>
                <td>${loc.position.lng.toFixed(4)}</td>
                <td>$${loc.name?.toLocaleString() ?? "N/A"}</td>
                <td>
                    <button class="delete-btn" data-id="${
                      loc.id
                    }">Delete</button>
                </td>
            </tr>
        `
      )
      .join("");

    tableBody.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = (e.target as HTMLButtonElement).dataset.id;
        if (id) {
          LocationServiceInstance.remove(id);
        }
      });
    });
  };

  const handleUpdate = (e: Event) => {
    const locations = (e as CustomEvent<LocationItem[]>).detail;
    updateRows(locations);
  };

  window.addEventListener("locationsUpdated", handleUpdate);

  const currentData = LocationServiceInstance.getCurrent();
  updateRows(currentData);
}
