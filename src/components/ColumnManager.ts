/**
 * Column Manager Component - Technical Spec 3.2
 * 
 * Provides UI for managing table column configurations including:
 * - Show/hide column toggles
 * - Drag-and-drop reordering
 * - Preset configurations
 * - User preference persistence
 * - Responsive design
 */

import { AVAILABLE_COLUMNS, COLUMN_PRESETS, DEFAULT_COLUMN_CONFIG } from './ColumnConfig';
import type { ColumnConfig } from '../types/ComparisonTypes';

interface ColumnManagerState {
  columns: ColumnConfig[];
  activePreset: string | null;
  hasUnsavedChanges: boolean;
  isDirty: boolean;
}

export class ColumnManager {
  private container: HTMLElement;
  private state: ColumnManagerState;
  private originalState: ColumnConfig[];
  private onConfigurationChange?: (columns: ColumnConfig[]) => void;
  private draggedElement: HTMLElement | null = null;

  constructor(
    container: HTMLElement,
    initialColumns?: ColumnConfig[],
    onConfigurationChange?: (columns: ColumnConfig[]) => void
  ) {
    this.container = container;
    const columns = initialColumns || DEFAULT_COLUMN_CONFIG as ColumnConfig[];
    this.originalState = JSON.parse(JSON.stringify(columns));
    this.state = {
      columns: JSON.parse(JSON.stringify(columns)),
      activePreset: this.detectActivePreset(columns),
      hasUnsavedChanges: false,
      isDirty: false
    };
    this.onConfigurationChange = onConfigurationChange;
    
    this.loadUserPreferences();
    this.render();
  }

  private detectActivePreset(columns: ColumnConfig[]): string | null {
    const visibleColumnIds = columns
      .filter(col => col.visible)
      .sort((a, b) => a.order - b.order)
      .map(col => col.id);

    for (const [presetId, preset] of Object.entries(COLUMN_PRESETS)) {
      if (JSON.stringify(visibleColumnIds) === JSON.stringify(preset.columns)) {
        return presetId;
      }
    }
    
    return null;
  }

  private loadUserPreferences(): void {
    try {
      const saved = localStorage.getItem('columnManagerPreferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        if (preferences.columns && Array.isArray(preferences.columns)) {
          this.state.columns = preferences.columns;
          this.originalState = JSON.parse(JSON.stringify(preferences.columns));
          this.state.activePreset = this.detectActivePreset(preferences.columns);
        }
      }
    } catch (error) {
      console.warn('Failed to load column manager preferences:', error);
    }
  }

  private saveUserPreferences(): void {
    try {
      const preferences = {
        columns: this.state.columns,
        activePreset: this.state.activePreset,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('columnManagerPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save column manager preferences:', error);
    }
  }

  private render(): void {
    const content = `
      <div class="column-manager">
        <div class="column-manager__header">
          <h3>Column Configuration</h3>
          <div class="column-manager__actions">
            <button class="btn btn--secondary" data-action="reset">
              Reset to Defaults
            </button>
            <button class="btn btn--secondary" data-action="cancel">
              Cancel
            </button>
            <button class="btn btn--primary" data-action="apply" ${!this.state.isDirty ? 'disabled' : ''}>
              Apply Changes
            </button>
          </div>
        </div>

        <div class="column-manager__presets">
          <h4>Quick Presets</h4>
          <div class="preset-buttons">
            ${Object.entries(COLUMN_PRESETS).map(([id, preset]) => `
              <button 
                class="preset-btn ${this.state.activePreset === id ? 'preset-btn--active' : ''}"
                data-preset="${id}"
                title="${preset.description}"
              >
                ${preset.name}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="column-manager__content">
          <div class="column-groups">
            ${this.renderColumnGroups()}
          </div>
          
          <div class="column-preview">
            <h4>Preview</h4>
            <div class="preview-table">
              ${this.renderPreviewTable()}
            </div>
          </div>
        </div>

        <div class="column-manager__footer">
          <div class="column-stats">
            <span>${this.state.columns.filter(col => col.visible).length} of ${this.state.columns.length} columns visible</span>
            ${this.state.hasUnsavedChanges ? '<span class="unsaved-indicator">• Unsaved changes</span>' : ''}
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = content;
    this.attachEventListeners();
  }

  private renderColumnGroups(): string {
    const groups = {
      basic: 'Basic Information',
      travel: 'Travel Times', 
      amenities: 'Amenities',
      costs: 'Costs'
    };

    return Object.entries(groups).map(([groupId, groupLabel]) => {
      const groupColumns = this.state.columns
        .filter(col => col.group === groupId)
        .sort((a, b) => a.order - b.order);

      if (groupColumns.length === 0) return '';

      return `
        <div class="column-group">
          <h5>${groupLabel}</h5>
          <div class="column-list" data-group="${groupId}">
            ${groupColumns.map((column, index) => this.renderColumnItem(column, index)).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  private renderColumnItem(column: ColumnConfig, index: number): string {
    return `
      <div class="column-item ${column.visible ? 'column-item--visible' : 'column-item--hidden'}" 
           data-column-id="${column.id}"
           draggable="true">
        <div class="column-item__drag-handle">⋮⋮</div>
        <div class="column-item__content">
          <label class="checkbox">
            <input 
              type="checkbox" 
              ${column.visible ? 'checked' : ''}
              data-column-id="${column.id}"
              data-action="toggle-visibility"
            >
            <span class="checkbox__checkmark"></span>
            <span class="column-label">${column.label}</span>
          </label>
          ${column.sortable ? '<span class="column-sortable" title="Sortable">↕</span>' : ''}
        </div>
        <div class="column-item__actions">
          <button 
            class="btn btn--icon" 
            data-action="move-up" 
            data-column-id="${column.id}"
            title="Move up"
            ${index === 0 ? 'disabled' : ''}
          >↑</button>
          <button 
            class="btn btn--icon" 
            data-action="move-down" 
            data-column-id="${column.id}"
            title="Move down"
            ${index === this.state.columns.length - 1 ? 'disabled' : ''}
          >↓</button>
        </div>
      </div>
    `;
  }

  private renderPreviewTable(): string {
    const visibleColumns = this.state.columns
      .filter(col => col.visible)
      .sort((a, b) => a.order - b.order);

    if (visibleColumns.length === 0) {
      return '<div class="preview-empty">No columns selected</div>';
    }

    const sampleData: Record<string, any> = {
      name: 'Sample Apartment',
      address: '123 Main St',
      type: 'apartment',
      rent: 150000,
      squareFootage: 850,
      bedrooms: 2,
      bathrooms: 2,
      walkingTime: { walking: { duration: 15 } },
      drivingTime: { driving: { duration: 8 } },
      transitTime: { transit: { duration: 25 } },
      distance: { walking: { distance: 804 } },
      gym: { gym: { has: true, rating: 4 } },
      pool: { pool: { has: false } },
      outdoorSpace: { outdoorSpace: { has: true, rating: 3 } },
      parking: true,
      laundry: 'in-unit',
      petsAllowed: true,
      estimatedUtilities: { squareFootage: 850, bedrooms: 2 },
      totalMonthlyCost: { rent: 150000, estimatedUtilities: '$150' }
    };

    return `
      <table class="preview-table__table">
        <thead>
          <tr>
            ${visibleColumns.map(col => `<th>${col.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          <tr>
            ${visibleColumns.map(col => {
              const columnDef = AVAILABLE_COLUMNS.find(c => c.id === col.id);
              const formatter = columnDef?.formatter as ((value: any) => string) | undefined;
              const value = sampleData[col.id];
              if (formatter && value !== undefined) {
                return `<td>${formatter(value)}</td>`;
              }
              return `<td>${value || ''}</td>`;
            }).join('')}
          </tr>
        </tbody>
      </table>
    `;
  }

  private attachEventListeners(): void {
    // Action buttons
    this.container.querySelectorAll('[data-action]').forEach(button => {
      button.addEventListener('click', this.handleAction.bind(this));
    });

    // Preset buttons
    this.container.querySelectorAll('[data-preset]').forEach(button => {
      button.addEventListener('click', this.handlePresetSelect.bind(this));
    });

    // Visibility toggles
    this.container.querySelectorAll('[data-action="toggle-visibility"]').forEach(checkbox => {
      checkbox.addEventListener('change', this.handleVisibilityToggle.bind(this));
    });

    // Drag and drop
    this.attachDragAndDropListeners();
  }

  private handleAction(event: Event): void {
    const target = event.target as HTMLElement;
    const action = target.dataset.action;

    switch (action) {
      case 'apply':
        this.applyChanges();
        break;
      case 'cancel':
        this.cancelChanges();
        break;
      case 'reset':
        this.resetToDefaults();
        break;
      case 'move-up':
        this.moveColumn(target.dataset.columnId!, 'up');
        break;
      case 'move-down':
        this.moveColumn(target.dataset.columnId!, 'down');
        break;
    }
  }

  private handlePresetSelect(event: Event): void {
    const target = event.target as HTMLElement;
    const presetId = target.dataset.preset;
    
    if (!presetId || !(presetId in COLUMN_PRESETS)) return;

    const preset = COLUMN_PRESETS[presetId as keyof typeof COLUMN_PRESETS];
    this.applyPreset(presetId, preset);
  }

  private applyPreset(presetId: string, preset: { columns: string[] }): void {
    const newColumns = this.state.columns.map(column => ({
      ...column,
      visible: preset.columns.includes(column.id),
      order: preset.columns.indexOf(column.id) + 1
    })).sort((a, b) => a.order - b.order);

    this.state.columns = newColumns;
    this.state.activePreset = presetId;
    this.state.isDirty = true;
    this.state.hasUnsavedChanges = true;

    this.render();
  }

  private handleVisibilityToggle(event: Event): void {
    const target = event.target as HTMLInputElement;
    const columnId = target.dataset.columnId;
    
    if (!columnId) return;

    const column = this.state.columns.find(col => col.id === columnId);
    if (column) {
      column.visible = target.checked;
      this.state.isDirty = true;
      this.state.hasUnsavedChanges = true;
      this.state.activePreset = null; // Clear active preset when manually changed
      this.render();
    }
  }

  private moveColumn(columnId: string, direction: 'up' | 'down'): void {
    const currentIndex = this.state.columns.findIndex(col => col.id === columnId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Check bounds
    if (newIndex < 0 || newIndex >= this.state.columns.length) return;

    // Swap columns
    [this.state.columns[currentIndex], this.state.columns[newIndex]] = 
    [this.state.columns[newIndex], this.state.columns[currentIndex]];

    // Update order values
    this.state.columns.forEach((col, index) => {
      col.order = index + 1;
    });

    this.state.isDirty = true;
    this.state.hasUnsavedChanges = true;
    this.state.activePreset = null;
    this.render();
  }

  private attachDragAndDropListeners(): void {
    const columnItems = this.container.querySelectorAll('.column-item');
    
    columnItems.forEach(item => {
      item.addEventListener('dragstart', this.handleDragStart.bind(this) as EventListener);
      item.addEventListener('dragover', this.handleDragOver.bind(this) as EventListener);
      item.addEventListener('drop', this.handleDrop.bind(this) as EventListener);
      item.addEventListener('dragend', this.handleDragEnd.bind(this) as EventListener);
    });
  }

  private handleDragStart(event: Event): void {
    const dragEvent = event as DragEvent;
    const target = dragEvent.target as HTMLElement;
    if (!target.classList.contains('column-item')) return;

    this.draggedElement = target;
    
    target.classList.add('dragging');
    dragEvent.dataTransfer!.effectAllowed = 'move';
  }

  private handleDragOver(event: Event): void {
    const dragEvent = event as DragEvent;
    dragEvent.preventDefault();
    dragEvent.dataTransfer!.dropEffect = 'move';

    const target = dragEvent.target as HTMLElement;
    const columnItem = target.closest('.column-item');
    
    if (columnItem && columnItem !== this.draggedElement) {
      const htmlItem = columnItem as HTMLElement;
      const rect = htmlItem.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      
      if (dragEvent.clientY < midpoint) {
        htmlItem.style.borderTop = '2px solid var(--color-primary)';
        htmlItem.style.borderBottom = '';
      } else {
        htmlItem.style.borderBottom = '2px solid var(--color-primary)';
        htmlItem.style.borderTop = '';
      }
    }
  }

  private handleDrop(event: Event): void {
    const dragEvent = event as DragEvent;
    dragEvent.preventDefault();
    
    const target = dragEvent.target as HTMLElement;
    const dropTarget = target.closest('.column-item');
    
    if (!dropTarget || !this.draggedElement || dropTarget === this.draggedElement) return;

    const htmlDropTarget = dropTarget as HTMLElement;
    const draggedId = this.draggedElement.dataset.columnId;
    const targetId = htmlDropTarget.dataset.columnId;
    
    if (!draggedId || !targetId) return;

    const draggedIndex = this.state.columns.findIndex(col => col.id === draggedId);
    const targetIndex = this.state.columns.findIndex(col => col.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    // Remove drag indicators
    this.container.querySelectorAll('.column-item').forEach(item => {
      const htmlItem = item as HTMLElement;
      htmlItem.style.borderTop = '';
      htmlItem.style.borderBottom = '';
    });

    // Move column
    const [draggedColumn] = this.state.columns.splice(draggedIndex, 1);
    const rect = htmlDropTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    
    const insertIndex = dragEvent.clientY < midpoint ? targetIndex : targetIndex + 1;
    this.state.columns.splice(insertIndex, 0, draggedColumn);

    // Update order values
    this.state.columns.forEach((col, index) => {
      col.order = index + 1;
    });

    this.state.isDirty = true;
    this.state.hasUnsavedChanges = true;
    this.state.activePreset = null;
    this.render();
  }

  private handleDragEnd(event: Event): void {
    const dragEvent = event as DragEvent;
    const target = dragEvent.target as HTMLElement;
    target.classList.remove('dragging');
    
    // Clean up drag indicators
    this.container.querySelectorAll('.column-item').forEach(item => {
      const htmlItem = item as HTMLElement;
      htmlItem.style.borderTop = '';
      htmlItem.style.borderBottom = '';
    });

    this.draggedElement = null;
  }

  private applyChanges(): void {
    this.originalState = JSON.parse(JSON.stringify(this.state.columns));
    this.state.isDirty = false;
    this.state.hasUnsavedChanges = false;
    this.saveUserPreferences();
    
    if (this.onConfigurationChange) {
      this.onConfigurationChange(this.state.columns);
    }
    
    this.render();
  }

  private cancelChanges(): void {
    this.state.columns = JSON.parse(JSON.stringify(this.originalState));
    this.state.isDirty = false;
    this.state.hasUnsavedChanges = false;
    this.state.activePreset = this.detectActivePreset(this.originalState);
    this.render();
  }

  private resetToDefaults(): void {
    if (confirm('Reset all columns to default configuration? This will clear your custom settings.')) {
      this.state.columns = JSON.parse(JSON.stringify(DEFAULT_COLUMN_CONFIG));
      this.state.activePreset = null;
      this.state.isDirty = true;
      this.state.hasUnsavedChanges = true;
      this.render();
    }
  }

  // Public API
  public getCurrentConfiguration(): ColumnConfig[] {
    return JSON.parse(JSON.stringify(this.state.columns));
  }

  public setConfiguration(columns: ColumnConfig[]): void {
    this.state.columns = JSON.parse(JSON.stringify(columns));
    this.originalState = JSON.parse(JSON.stringify(columns));
    this.state.activePreset = this.detectActivePreset(columns);
    this.state.isDirty = false;
    this.state.hasUnsavedChanges = false;
    this.saveUserPreferences();
    this.render();
  }

  public destroy(): void {
    this.container.innerHTML = '';
  }
}

// Utility function for creating a column manager instance
export function createColumnManager(
  container: HTMLElement,
  onConfigurationChange?: (columns: ColumnConfig[]) => void
): ColumnManager {
  return new ColumnManager(container, undefined, onConfigurationChange);
}