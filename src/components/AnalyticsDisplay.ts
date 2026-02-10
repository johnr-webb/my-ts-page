import type { EnhancedLocationItem } from "../types/ComparisonTypes";
import { AnalyticsEngine } from "../services/AnalyticsEngine";

export class AnalyticsDisplay {
  private element: HTMLElement;
  private state = {
    showScores: true,
    showInsights: true,
    showWeights: false
  };
  private currentResults: import('../services/AnalyticsEngine').CombinedAnalyticsResult | null = null;
  
  constructor(mount: HTMLElement) {
    this.element = mount;
    this.setupEventListeners();
  }
  
  async render(locations: EnhancedLocationItem[]): Promise<void> {
    if (locations.length === 0) {
      this.element.innerHTML = `
        <div class="analytics-empty">
          <h3>No locations to analyze</h3>
          <p>Add some locations to see analytics and comparison insights.</p>
        </div>
      `;
      return;
    }
    
    // Show loading state
    this.element.innerHTML = `
      <div class="analytics-loading">
        <h3>Calculating Analytics...</h3>
        <div class="loading-spinner"></div>
      </div>
    `;
    
    try {
      const analyticsEngine = AnalyticsEngine.getInstance();
      const results = await analyticsEngine.calculateAnalytics(locations);
      
      if (!results || Object.keys(results.overallScores).length === 0) {
        this.element.innerHTML = `
          <div class="analytics-error">
            <h3>Unable to calculate analytics</h3>
            <p>Please ensure locations have complete data for scoring.</p>
          </div>
        `;
        return;
      }
      
      this.currentResults = results;
      this.element.innerHTML = this.renderAnalyticsPanel(results, locations);
      
      // Update locations with scores for table display
      this.updateLocationsWithScores(locations, results);
      
    } catch (error) {
      console.error('Analytics calculation failed:', error);
      this.element.innerHTML = `
        <div class="analytics-error">
          <h3>Analytics calculation failed</h3>
          <p>${error instanceof Error ? error.message : 'Unknown error occurred'}</p>
        </div>
      `;
    }
  }
  
  private updateLocationsWithScores(locations: EnhancedLocationItem[], results: any): void {
    locations.forEach(location => {
      location.scores = {
        overall: results.overallScores[location.id] || 0,
        commute: results.pluginScores['commute-score']?.[location.id] || 0,
        cost: results.pluginScores['cost-score']?.[location.id] || 0,
        amenities: results.pluginScores['amenities-score']?.[location.id] || 0,
        size: results.pluginScores['size-score']?.[location.id] || 0
      };
    });
    
    // Dispatch event to update table with new scores
    window.dispatchEvent(new CustomEvent('analyticsScoresUpdated', {
      detail: { locations, results }
    }));
  }
  
  private renderAnalyticsPanel(results: import('../services/AnalyticsEngine').CombinedAnalyticsResult | null, locations: EnhancedLocationItem[]): string {
    return `
      <div class="analytics-panel">
        <div class="analytics-header">
          <h3>Location Analytics</h3>
          <div class="analytics-controls">
            <button id="toggle-scores" class="btn-toggle ${this.state.showScores ? 'active' : ''}">
              📊 Scores
            </button>
            <button id="toggle-insights" class="btn-toggle ${this.state.showInsights ? 'active' : ''}">
              💡 Insights
            </button>
            <button id="toggle-weights" class="btn-toggle ${this.state.showWeights ? 'active' : ''}">
              ⚖️ Weights
            </button>
          </div>
        </div>
        
        ${this.state.showScores ? this.renderScoresTable(locations, results) : ''}
        ${this.state.showInsights ? this.renderInsights(results) : ''}
        ${this.state.showWeights ? this.renderWeightControls() : ''}
        
        <div class="analytics-footer">
          <p>Analysis based on ${locations.length} locations</p>
        </div>
      </div>
    `;
  }
  
  private renderScoresTable(locations: EnhancedLocationItem[], results: import('../services/AnalyticsEngine').CombinedAnalyticsResult | null): string {
    if (!results) return '';
    
    const scoreColumns = [
      { id: 'overall', label: 'Overall Score' },
      { id: 'commute', label: 'Commute Score' },
      { id: 'cost', label: 'Cost Score' },
      { id: 'amenities', label: 'Amenity Score' },
      { id: 'size', label: 'Size Score' }
    ];
    
    // Find top location for highlighting
    const topLocationId = results.topLocations?.[0]?.id;
    
    const headerRow = `
      <tr class="scores-header">
        <th class="location-name">Location</th>
        ${scoreColumns.map(col => `
          <th class="score-header" data-score="${col.id}">${col.label}</th>
        `).join('')}
      </tr>
    `;
    
    const bodyRows = locations.map(location => {
      const isTopLocation = location.id === topLocationId;
      const locationScores = location.scores || {};
      
      return `
        <tr class="scores-row ${isTopLocation ? 'best-overall' : ''}" data-location-id="${location.id}">
          <td class="location-name">
            <div class="location-info">
              ${isTopLocation ? '<span class="trophy">🏆</span>' : ''}
              <strong>${location.name}</strong>
              <div class="location-type">${location.propertyType || location.type}</div>
            </div>
          </td>
          ${scoreColumns.map(col => {
            const score = (locationScores as any)[col.id] || 0;
            return `
              <td class="score-cell" data-score="${col.id}">
                <div class="score-display ${this.getScoreClass(score)}">
                  <div class="score-number">${score.toFixed(0)}</div>
                  <div class="score-bar">
                    <div class="score-fill" style="width: ${Math.round(score)}%"></div>
                  </div>
                </div>
              </td>
            `;
          }).join('')}
        </tr>
      `;
    }).join('');
    
    return `
      <div class="scores-table-container">
        <table class="scores-table">
          <thead>
            ${headerRow}
          </thead>
          <tbody>
            ${bodyRows}
          </tbody>
        </table>
      </div>
    `;
  }
  
  private renderInsights(results: import('../services/AnalyticsEngine').CombinedAnalyticsResult | null): string {
    if (!results || !results.insights || results.insights.length === 0) {
      return `
        <div class="insights-empty">
          <h4>No Insights Available</h4>
          <p>Add more locations with complete data to generate insights.</p>
        </div>
      `;
    }
    
    return `
      <div class="insights-container">
        <h4>Key Insights</h4>
        <div class="insights-list">
          ${results!.insights.map((insight: string, index: number) => `
            <div class="insight-item">
              <div class="insight-number">${index + 1}</div>
              <div class="insight-content">${insight}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  private renderWeightControls(): string {
    const config = AnalyticsEngine.getInstance().getConfig();
    const weights = config.weights;
    
    return `
      <div class="weight-controls">
        <h4>Score Weights</h4>
        <div class="weight-sliders">
          <div class="weight-slider">
            <label>
              <span>Commute (${(weights.commute * 100).toFixed(0)}%)</span>
              <input type="range" id="weight-commute" min="0" max="100" value="${weights.commute * 100}">
            </label>
          </div>
          <div class="weight-slider">
            <label>
              <span>Cost (${(weights.cost * 100).toFixed(0)}%)</span>
              <input type="range" id="weight-cost" min="0" max="100" value="${weights.cost * 100}">
            </label>
          </div>
          <div class="weight-slider">
            <label>
              <span>Amenities (${(weights.amenities * 100).toFixed(0)}%)</span>
              <input type="range" id="weight-amenities" min="0" max="100" value="${weights.amenities * 100}">
            </label>
          </div>
          <div class="weight-slider">
            <label>
              <span>Size (${(weights.size * 100).toFixed(0)}%)</span>
              <input type="range" id="weight-size" min="0" max="100" value="${weights.size * 100}">
            </label>
          </div>
        </div>
        <div class="weight-actions">
          <button id="reset-weights" class="btn-secondary">Reset to Defaults</button>
          <button id="apply-weights" class="btn-primary">Apply Changes</button>
        </div>
      </div>
    `;
  }
  
  private getScoreClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    if (score >= 20) return 'fair';
    return 'poor';
  }
  
  private setupEventListeners(): void {
    // Toggle button listeners
    this.element.addEventListener('click', this.handlePanelClick.bind(this));
    
    // Listen for location updates
    window.addEventListener('locationsUpdated', () => {
      if (this.currentResults) {
        this.renderCurrentData();
      }
    });
    
    // Listen for weight control inputs
    this.element.addEventListener('input', this.handleWeightInput.bind(this));
  }
  
  private handleWeightInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.type === 'range' && target.id?.startsWith('weight-')) {
      const weightType = target.id.replace('weight-', '');
      const value = parseInt(target.value);
      
      // Update display
      const label = target.parentElement?.querySelector('span');
      if (label) {
        label.textContent = `${weightType.charAt(0).toUpperCase() + weightType.slice(1)} (${value}%)`;
      }
    }
  }
  
  private handlePanelClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    if (target.id === 'toggle-scores') {
      this.state.showScores = !this.state.showScores;
      this.renderCurrentData();
    } else if (target.id === 'toggle-insights') {
      this.state.showInsights = !this.state.showInsights;
      this.renderCurrentData();
    } else if (target.id === 'toggle-weights') {
      this.state.showWeights = !this.state.showWeights;
      this.renderCurrentData();
    } else if (target.id === 'apply-weights') {
      this.applyWeightChanges();
    } else if (target.id === 'reset-weights') {
      this.resetWeights();
    }
  }
  
  private renderCurrentData(): void {
    // Re-render with current results if available
    if (this.currentResults) {
      // Need to get current locations - dispatch event to request them
      window.dispatchEvent(new CustomEvent('requestCurrentLocations', {
        detail: { callback: (locations: EnhancedLocationItem[]) => {
          this.element.innerHTML = this.renderAnalyticsPanel(this.currentResults, locations);
        }}
      }));
    }
  }
  
  private applyWeightChanges(): void {
    const weightInputs = {
      commute: this.element.querySelector('#weight-commute') as HTMLInputElement,
      cost: this.element.querySelector('#weight-cost') as HTMLInputElement,
      amenities: this.element.querySelector('#weight-amenities') as HTMLInputElement,
      size: this.element.querySelector('#weight-size') as HTMLInputElement
    };
    
    if (Object.values(weightInputs).every(input => input)) {
      const total = Object.values(weightInputs).reduce((sum, input) => sum + parseInt(input.value), 0);
      
      if (total !== 100) {
        alert(`Weights must sum to 100%. Current total: ${total}%`);
        return;
      }
      
      const analyticsEngine = AnalyticsEngine.getInstance();
      const newWeights = {
        commute: parseInt(weightInputs.commute.value) / 100,
        cost: parseInt(weightInputs.cost.value) / 100,
        amenities: parseInt(weightInputs.amenities.value) / 100,
        size: parseInt(weightInputs.size.value) / 100
      };
      
      analyticsEngine.updateConfig({ weights: newWeights });
      
      // Recalculate analytics with new weights
      this.recalculateAnalytics();
    }
  }
  
  private resetWeights(): void {
    const analyticsEngine = AnalyticsEngine.getInstance();
    analyticsEngine.updateConfig({
      weights: {
        commute: 0.4,
        cost: 0.3,
        amenities: 0.2,
        size: 0.1
      }
    });
    
    // Update slider displays
    const weightInputs = {
      commute: this.element.querySelector('#weight-commute') as HTMLInputElement,
      cost: this.element.querySelector('#weight-cost') as HTMLInputElement,
      amenities: this.element.querySelector('#weight-amenities') as HTMLInputElement,
      size: this.element.querySelector('#weight-size') as HTMLInputElement
    };
    
    if (weightInputs.commute) weightInputs.commute.value = '40';
    if (weightInputs.cost) weightInputs.cost.value = '30';
    if (weightInputs.amenities) weightInputs.amenities.value = '20';
    if (weightInputs.size) weightInputs.size.value = '10';
    
    // Update percentage displays
    Object.entries(weightInputs).forEach(([type, input]) => {
      if (input) {
        const label = input.parentElement?.querySelector('span');
        if (label) {
          const value = parseInt(input.value);
          label.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} (${value}%)`;
        }
      }
    });
    
    // Recalculate analytics
    this.recalculateAnalytics();
  }
  
  private async recalculateAnalytics(): Promise<void> {
    // Request current locations and recalculate
    window.dispatchEvent(new CustomEvent('requestCurrentLocations', {
      detail: { callback: async (locations: EnhancedLocationItem[]) => {
        if (locations.length > 0) {
          await this.render(locations);
        }
      }}
    }));
  }
  
  public destroy(): void {
    // Clean up event listeners if needed
  }
}