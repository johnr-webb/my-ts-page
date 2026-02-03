import { AuthService } from "../services/AuthService";
import { navigateTo } from "../router";

export function renderHomePage(contentElement: HTMLElement) {
  const isAuthenticated = AuthService.isAuthenticated();
  const currentUser = AuthService.getCurrentUser();

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
              <button class="primary-button" id="compare-btn">
                Compare Apartments
              </button>
              <button class="secondary-button" id="find-btn">
                Find New Apartments
              </button>
            </div>
          </div>
        `
            : `
          <div class="auth-prompt">
            <h2>Get Started</h2>
            <p>Sign up to save your favorite apartments and get personalized recommendations.</p>
            <div class="home-actions">
              <button class="primary-button" id="signup-btn">
                Create Account
              </button>
              <button class="secondary-button" id="signin-btn">
                Sign In
              </button>
            </div>
          </div>
        `
        }
        
        <div class="features">
          <h3>Features</h3>
          <ul>
            <li>📍 Interactive map with apartment locations</li>
            <li>🏠 Save and compare your favorite apartments</li>
            <li>🗺️ Calculate commute times to work</li>
            <li>💾 Your data saved locally and securely</li>
          </ul>
        </div>
      </div>
    </div>
  `;
  contentElement.innerHTML = content;
  setupHomeEventListeners();
}

function setupHomeEventListeners() {
  // Navigation buttons for authenticated users
  const compareBtn = document.getElementById("compare-btn");
  const findBtn = document.getElementById("find-btn");

  // Auth buttons for unauthenticated users
  const signupBtn = document.getElementById("signup-btn");
  const signinBtn = document.getElementById("signin-btn");

  compareBtn?.addEventListener("click", () => navigateTo("/compare"));
  findBtn?.addEventListener("click", () => navigateTo("/find"));
  signupBtn?.addEventListener("click", () => navigateTo("/signup"));
  signinBtn?.addEventListener("click", () => navigateTo("/signin"));
}
