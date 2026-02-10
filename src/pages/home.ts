import { AuthServiceInstance } from "../services/AuthService";
import { navigateTo } from "../router";

export class HomePage {
  private element: HTMLElement;
  private isDestroyed = false;

  constructor(contentElement: HTMLElement) {
    this.element = contentElement;
  }

  private handleError(error: Error | unknown, context: string): void {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[HomePage] ${context}:`, error);
    
    // Show user-friendly error message
    if (context.includes('navigation')) {
      const errorElement = document.createElement('div');
      errorElement.className = 'error-toast';
      errorElement.textContent = `Navigation failed: ${errorMessage}`;
      document.body.appendChild(errorElement);
      setTimeout(() => document.body.removeChild(errorElement), 3000);
    }
  }

  render(): void {
    const isAuthenticated = AuthServiceInstance.isAuthenticated();
    const currentUser = AuthServiceInstance.getCurrentUser();

    const content = `
      <div class="page-container">
        <div class="page-content">
          <h1>Welcome to Housing Hunt</h1>
          <p>Your one-stop solution for finding and comparing apartments.</p>
          
          ${
            isAuthenticated
              ? `
            <div class="welcome-back">
              <h2>Welcome back, ${currentUser?.name}!</h2>
              <p>Ready to continue your apartment hunt?</p>
              <div class="home-actions">
                <button class="btn-primary" data-action="compare">
                  🏠 Compare Apartments
                </button>
                <button class="btn-secondary" data-action="find">
                  🔍 Find New Places
                </button>
              </div>
            </div>
          `
              : `
            <div class="welcome-section">
              <h2>Start Your Apartment Hunt</h2>
              <p>Sign up to save and compare your favorite places.</p>
              <div class="home-actions">
                <button class="btn-primary" data-action="compare">
                  🏠 Browse Listings
                </button>
                <button class="btn-secondary" data-action="signup">
                  📝 Create Account
                </button>
              </div>
            </div>
          `
          }
        </div>
      </div>
    `;

    this.element.innerHTML = content;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.element.addEventListener('click', this.handleActionClick.bind(this));
  }

  private handleActionClick(event: Event): void {
    if (this.isDestroyed) return;
    
    try {
      const target = event.target as HTMLElement;
      const action = target.dataset.action;

      switch (action) {
        case 'compare':
          navigateTo("/compare");
          break;
        case 'find':
          navigateTo("/find");
          break;
        case 'signup':
          navigateTo("/signup");
          break;
      }
    } catch (error) {
      this.handleError(error, 'navigation');
    }
  }

  public destroy(): void {
    this.isDestroyed = true;
  }
}

// Export factory function for backward compatibility
export function renderHomePage(contentElement: HTMLElement): HomePage {
  const homePage = new HomePage(contentElement);
  homePage.render();
  return homePage;
}