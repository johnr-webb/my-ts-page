import { LocationServiceInstance } from "../services/LocationsService";
import { FlexibleTable } from "../components/FlexibleTable";
import { ColumnManager } from "../components/ColumnManager";
import { AnalyticsDisplay } from "../components/AnalyticsDisplay";
import { renderEnhancedForm } from "../components/EnhancedAddLocationForm";
import type { EnhancedLocationItem } from "../types/ComparisonTypes";
import { TravelTimeIntegration } from "../services/TravelTimeIntegration";

export async function renderEnhancedComparePage(appElement: HTMLElement): Promise<void> {
  // Initialize services
  const travelTimeIntegration = TravelTimeIntegration.getInstance();
  travelTimeIntegration.initialize();

  const content = `
    <div class="page-container page-container--wide">
      <div class="page-content enhanced-compare-page">
        <div class="compare-header">
          <h1>Compare Apartments</h1>
          <p class="page-description">
            Enhanced comparison with travel times, analytics, and flexible views
          </p>
        </div>

        <div class="compare-layout">
          <div class="control-panel">
            <div class="control-section">
              <h3>Columns</h3>
              <div id="column-manager-container"></div>
            </div>
            
            <div class="control-section">
              <h3>Analytics</h3>
              <div id="analytics-display-container"></div>
            </div>
          </div>
          
          <div class="main-content-area">
            <div class="enhanced-form-section">
              <h3>Add New Location</h3>
              <div id="enhanced-form-container"></div>
            </div>
            
            <div class="table-section">
              <h3>Location Comparison</h3>
              <div id="flexible-table-container"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  appElement.innerHTML = content;

  // Initialize components
  const formContainer = appElement.querySelector<HTMLDivElement>("#enhanced-form-container");
  if (formContainer) {
    renderEnhancedForm(formContainer);
  }

  const columnManagerContainer = appElement.querySelector<HTMLDivElement>("#column-manager-container");
  if (columnManagerContainer) {
    new ColumnManager(columnManagerContainer, undefined, (columns) => {
      // Update table when column configuration changes
      const locations = LocationServiceInstance.getCurrent() as EnhancedLocationItem[];
      const tableContainer = document.querySelector("#flexible-table-container") as HTMLElement;
      if (tableContainer) {
        const flexibleTable = new FlexibleTable(tableContainer);
        flexibleTable.updateColumns(columns);
        flexibleTable.render(locations);
      }
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('columnConfigurationChanged', { detail: columns }));
    });
  }

  // Load current locations and render table
  await LocationServiceInstance.fetchAll();
  const locations = LocationServiceInstance.getCurrent() as EnhancedLocationItem[];
  
  const tableContainer = appElement.querySelector<HTMLDivElement>("#flexible-table-container");
  if (tableContainer) {
    const flexibleTable = new FlexibleTable(tableContainer);
    flexibleTable.render(locations);
  }

  const analyticsContainer = appElement.querySelector<HTMLDivElement>("#analytics-display-container");
  if (analyticsContainer) {
    const analyticsDisplay = new AnalyticsDisplay(analyticsContainer);
    await analyticsDisplay.render(locations);
  }

  // Setup event listeners for cross-component communication
  setupEventListeners();
}

function setupEventListeners(): void {
  // Listen for location updates and refresh table/analytics
  window.addEventListener('locationsUpdated', async (event) => {
    const locations = (event as CustomEvent).detail as EnhancedLocationItem[];
    
    // Update table
    const tableContainer = document.querySelector("#flexible-table-container") as HTMLElement;
    if (tableContainer) {
      const flexibleTable = new FlexibleTable(tableContainer);
      flexibleTable.render(locations);
    }
    
    // Update analytics
    const analyticsContainer = document.querySelector("#analytics-display-container") as HTMLElement;
    if (analyticsContainer) {
      const analyticsDisplay = new AnalyticsDisplay(analyticsContainer);
      await analyticsDisplay.render(locations);
    }
  });

  // Listen for column configuration changes
  window.addEventListener('columnConfigurationChanged', () => {
    const locations = LocationServiceInstance.getCurrent() as EnhancedLocationItem[];
    const tableContainer = document.querySelector("#flexible-table-container") as HTMLElement;
    if (tableContainer) {
      const flexibleTable = new FlexibleTable(tableContainer);
      flexibleTable.render(locations);
    }
  });
  
  // Listen for analytics scores update
  window.addEventListener('analyticsScoresUpdated', () => {
    const locations = LocationServiceInstance.getCurrent() as EnhancedLocationItem[];
    const tableContainer = document.querySelector("#flexible-table-container") as HTMLElement;
    if (tableContainer) {
      const flexibleTable = new FlexibleTable(tableContainer);
      flexibleTable.render(locations);
    }
  });
  
  // Listen for location requests from analytics
  window.addEventListener('requestCurrentLocations', (event) => {
    const locations = LocationServiceInstance.getCurrent() as EnhancedLocationItem[];
    const callback = (event as CustomEvent).detail?.callback;
    if (callback) {
      callback(locations);
    }
  });
}