import { LocationServiceInstance } from "../services/LocationsService";
import type { EnhancedLocationItem } from "../types/ComparisonTypes";
import { AVAILABLE_COLUMNS, COLUMN_PRESETS, DEFAULT_COLUMN_CONFIG } from "./ColumnConfig";

// Define ColumnConfig interface locally since it's not exported properly
interface ColumnConfig {
  id: string;
  label: string;
  group: string;
  sortable: boolean;
  visible: boolean;
  width?: string;
  formatter?: (value: unknown) => string;
  order: number;
}

export interface TableState {
  columns: ColumnConfig[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filterText: string;
  activePreset: string;
}

export class FlexibleTable {
  private element: HTMLElement;
  private state: TableState;
  private currentLocations: EnhancedLocationItem[] = [];
  private sortField: string = 'name';
  private sortOrder: 'asc' | 'desc' = 'asc';
  
  constructor(mount: HTMLElement) {
    this.element = mount;
    this.state = {
      columns: DEFAULT_COLUMN_CONFIG,
      sortBy: 'name',
      filterText: '',
      activePreset: 'DEFAULT'
    } as TableState;
    this.loadUserPreferences();
    this.setupEventListeners();
  }
  
  render(locations: EnhancedLocationItem[]): void {
    this.currentLocations = locations;
    this.element.innerHTML = this.renderTable();
    this.attachTableEventListeners();
  }
  
  updateColumns(columns: ColumnConfig[]): void {
    this.state.columns = columns;
    this.saveUserPreferences();
  }
  
  private exportToCSV(): void {
    try {
      const visibleColumns = this.state.columns.filter(col => col.visible);
      const filteredLocations = this.currentLocations
        .filter(location => this.matchesFilter(location))
        .sort((a, b) => this.sortLocations(a, b));
      
      const headers = visibleColumns.map(col => col.label).join(',');
      
      const rows = filteredLocations.map(location => {
        return visibleColumns.map(col => {
          const value = this.getValueForColumn(location, col.id);
          const formattedValue = col.formatter ? col.formatter(value) : value;
          const cleanValue = String(formattedValue || '')
            .replace(/<[^>]*>/g, '')
            .replace(/"/g, '""')
            .trim();
          return cleanValue.includes(',') ? `"${cleanValue}"` : cleanValue;
        }).join(',');
      });
      
      const csvContent = [headers, ...rows].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `apartment-comparison-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('[FlexibleTable] Exported', filteredLocations.length, 'locations to CSV');
    } catch (error) {
      console.error('[FlexibleTable] Error exporting to CSV:', error);
      alert('Failed to export data. Please try again.');
    }
  }
  
  private renderTable(): string {
    if (this.currentLocations.length === 0) {
      return `
        <div class="table-empty">
          <h3>No locations added yet</h3>
          <p>Add your first location to start comparing apartments!</p>
        </div>
      `;
    }
    
    const visibleColumns = this.state.columns.filter(col => col.visible);
    const headerRow = this.renderHeader(visibleColumns);
    const bodyRows = this.currentLocations
      .filter(location => this.matchesFilter(location))
      .sort((a, b) => this.sortLocations(a, b))
      .map(location => this.renderLocationRow(location, visibleColumns));
    
    return `
      <div class="table-controls">
        ${this.renderControls()}
      </div>
      
      <div class="table-wrapper">
        <table class="flexible-table">
          ${headerRow}
          <tbody class="table-body">
            ${bodyRows.join('')}
          </tbody>
        </table>
      </div>
      
      <div class="table-footer">
        <p>Showing ${this.currentLocations.length} locations</p>
      </div>
    `;
  }
  
  private renderHeader(columns: ColumnConfig[]): string {
    return `
      <thead class="table-header">
        <tr class="header-row">
          ${columns.map(column => `
            <th class="header-cell" data-column="${column.id}">
              <div class="header-content">
                <span class="column-label">${column.label}</span>
                ${column.sortable ? `
                  <button class="sort-button" data-column="${column.id}" data-order="asc">
                    ▲
                  </button>
                ` : ''}
              </div>
            </th>
          `).join('')}
        </tr>
      </thead>
    `;
  }
  
  private renderLocationRow(location: EnhancedLocationItem, columns: ColumnConfig[]): string {
    return `
      <tr class="location-row" data-id="${location.id}">
        ${columns.map(column => `
          <td class="table-cell" data-column="${column.id}">
            ${column.formatter ? column.formatter(this.getValueForColumn(location, column.id)) : this.getValueForColumn(location, column.id)}
          </td>
        `).join('')}
        <td class="table-cell actions-cell">
          <button class="btn-icon btn-edit" data-id="${location.id}" title="Edit">
            ✏️
          </button>
          <button class="btn-icon btn-delete" data-id="${location.id}" title="Delete">
            🗑️
          </button>
        </td>
      </tr>
    `;
  }
  
  private renderControls(): string {
    return `
      <div class="controls-section">
        <div class="search-container">
          <input 
            type="text" 
            class="search-input" 
            placeholder="Search locations..." 
            value="${this.state.filterText}"
          >
        </div>
        
        <div class="preset-buttons">
          ${Object.entries(COLUMN_PRESETS).map(([key, preset]) => `
            <button class="btn-preset ${this.state.activePreset === key ? 'active' : ''}" data-preset="${key}">
              ${preset.name}
            </button>
          `).join('')}
        </div>
        
        <div class="export-buttons">
          <button class="btn-export" id="export-csv" title="Export to CSV">
            📄 Export CSV
          </button>
        </div>
        
        <button class="btn-cog" id="column-settings">
          ⚙️ Columns
        </button>
      </div>
    `;
  }
  
  private getValueForColumn(location: EnhancedLocationItem, columnId: string): unknown {
    switch (columnId) {
      case 'name': return location.name;
      case 'address': return location.position;
      case 'type': return location.propertyType || location.type;
      case 'rent': return location.rent;
      case 'squareFootage': return location.squareFootage;
      case 'bedrooms': return location.bedrooms;
      case 'bathrooms': return location.bathrooms;
      case 'walkingTime': return location.travelTimes?.walking;
      case 'drivingTime': return location.travelTimes?.driving;
      case 'transitTime': return location.travelTimes?.transit;
      case 'gym': return location.amenities?.gym;
      case 'pool': return location.amenities?.pool;
      case 'outdoorSpace': return location.amenities?.outdoorSpace;
      case 'parking': return location.amenities?.parking;
      case 'laundry': return location.amenities?.laundry;
      case 'petsAllowed': return location.amenities?.pets;
      case 'estimatedUtilities': return this.estimateUtilities(location);
      case 'totalMonthlyCost': return (location.rent || 0) + (this.estimateUtilities(location) * 100);
      case 'overallScore': return location;
      case 'commuteScore': return location;
      case 'costScore': return location;
      case 'amenitiesScore': return location;
      case 'sizeScore': return location;
      default: return null;
    }
  }
  
  private estimateUtilities(location: EnhancedLocationItem): number {
    const baseUtility = 50;
    const sqftFactor = location.squareFootage * 0.08;
    const bedroomFactor = location.bedrooms * 15;
    return Math.round(baseUtility + sqftFactor + bedroomFactor) * 100;
  }
  
  private matchesFilter(location: EnhancedLocationItem): boolean {
    if (!this.state.filterText) {
      return true;
    }
    
    const searchText = this.state.filterText.toLowerCase();
    return Object.values(location).some(value => 
      String(value).toLowerCase().includes(searchText)
    );
  }
  
  private sortLocations(a: EnhancedLocationItem, b: EnhancedLocationItem): number {
    const aValue = this.getValueForColumn(a, this.sortField);
    const bValue = this.getValueForColumn(b, this.sortField);
    
    if (aValue == null || aValue === undefined) return 1;
    if (bValue == null || bValue === undefined) return -1;
    
    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else {
      comparison = Number(aValue) - Number(bValue);
    }
    
    return this.sortOrder === 'asc' ? comparison : -comparison;
  }
  
  private loadUserPreferences(): void {
    try {
      const saved = localStorage.getItem('table_preferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        if (preferences.columns) {
          this.state.columns = preferences.columns;
        }
        if (preferences.activePreset) {
          this.state.activePreset = preferences.activePreset;
        }
      }
    } catch (error) {
      console.error('[FlexibleTable] Failed to load user preferences:', error);
    }
  }
  
  private saveUserPreferences(): void {
    try {
      const preferences = {
        columns: this.state.columns,
        activePreset: this.state.activePreset
      };
      localStorage.setItem('table_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('[FlexibleTable] Failed to save user preferences:', error);
    }
  }
  
  private setupEventListeners(): void {
    this.element.addEventListener('click', this.handleTableClick.bind(this));
    this.element.addEventListener('input', this.handleSearchInput.bind(this));
    
    window.addEventListener('columnConfigurationChanged', this.handleColumnConfigChange.bind(this));
    window.addEventListener('travelTimeCalculationCompleted', this.handleTravelTimeUpdate.bind(this));
  }
  
  private handleTableClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    if (target.classList.contains('sort-button')) {
      const columnId = target.dataset.column;
      const currentOrder = target.dataset.order as 'asc' | 'desc';
      
      if (this.sortField === columnId) {
        this.sortOrder = currentOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = columnId || 'name';
        this.sortOrder = 'asc';
      }
      
      const sortSymbol = this.sortOrder === 'asc' ? '▲' : '▼';
      target.textContent = sortSymbol;
      target.dataset.order = this.sortOrder;
      
      this.render(this.currentLocations);
      return;
    }
    
    if (target.classList.contains('btn-delete')) {
      const id = target.dataset.id;
      if (id && confirm('Are you sure you want to delete this location?')) {
        LocationServiceInstance.remove(id);
      }
      return;
    }
    
    if (target.classList.contains('btn-edit')) {
      const id = target.dataset.id;
      if (id) {
        this.editLocation(id);
      }
      return;
    }
    
    if (target.classList.contains('btn-preset')) {
      const presetKey = target.dataset.preset;
      if (presetKey) {
        this.applyPreset(presetKey);
      }
      return;
    }
    
    if (target.classList.contains('btn-cog')) {
      this.openColumnSettings();
      return;
    }
    
    if (target.classList.contains('btn-export')) {
      this.exportToCSV();
      return;
    }
  }
  
  private handleSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.state.filterText = input.value;
    this.render(this.currentLocations);
  }
  
  private handleColumnConfigChange(event: Event): void {
    const customEvent = event as CustomEvent;
    if (customEvent.detail) {
      this.state.columns = customEvent.detail.columns;
      this.saveUserPreferences();
      this.render(this.currentLocations);
    }
  }
  
  private handleTravelTimeUpdate(event: Event): void {
    const customEvent = event as CustomEvent;
    if (customEvent.detail?.results) {
      customEvent.detail.results.forEach((result: any) => {
        const location = this.currentLocations.find(loc => loc.id === result.locationId);
        if (location) {
          location.travelTimes = {
            walking: result.walking,
            driving: result.driving,
            transit: result.transit
          };
        }
      });
      
      this.render(this.currentLocations);
    }
  }
  
  private applyPreset(presetKey: string): void {
    const preset = COLUMN_PRESETS[presetKey as keyof typeof COLUMN_PRESETS];
    if (!preset) return;
    
    this.state.activePreset = presetKey;
    this.state.columns = AVAILABLE_COLUMNS.map(column => ({
      ...column,
      visible: preset.columns.includes(column.id)
    })) as ColumnConfig[];
    
    this.saveUserPreferences();
    this.render(this.currentLocations);
  }
  
  private editLocation(id: string): void {
    window.dispatchEvent(new CustomEvent('editLocation', {
      detail: { id }
    }));
  }
  
  private openColumnSettings(): void {
    window.dispatchEvent(new CustomEvent('openColumnManager'));
  }
  
  private attachTableEventListeners(): void {
    // Additional listeners can be added here for specific cell interactions
  }
  
  public destroy(): void {
    this.saveUserPreferences();
  }
}