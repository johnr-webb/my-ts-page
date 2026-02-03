// src/pages/signin.ts

import { AuthService } from "../services/AuthService";
import {
  navigateTo,
  getIntendedDestination,
  clearIntendedDestination,
} from "../router";

export function renderSignInPage(contentElement: HTMLElement) {
  const content = `
    <div class="page-container">
      <div class="auth-container">
        <div class="auth-card">
          <h1>Sign In</h1>
          <p class="auth-subtitle">Welcome back to Housing Hunt</p>
          
          <form id="signin-form" class="auth-form">
            <div class="form-group">
              <label for="signin-email">Email Address</label>
              <input 
                type="email" 
                id="signin-email" 
                name="email" 
                required
                placeholder="Enter your email address"
                autocomplete="email"
                aria-describedby="email-error"
                aria-invalid="false"
              >
              <span class="form-error" id="email-error" role="alert"></span>
            </div>
            
            <button type="submit" class="auth-button" id="signin-button">
              <span class="button-text">Sign In</span>
              <span class="button-spinner" style="display: none;">Signing in...</span>
            </button>
            
            <div class="form-error" id="form-error" role="alert"></div>
            <div class="form-success" id="form-success" role="alert"></div>
          </form>
          
          <div class="auth-switch">
            <p>Don't have an account? <button class="link-button" id="switch-to-signup">Create one here</button></p>
          </div>
        </div>
      </div>
    </div>
  `;

  contentElement.innerHTML = content;
  setupSignInEventListeners();
}

function setupSignInEventListeners() {
  const form = document.getElementById("signin-form") as HTMLFormElement;
  const emailInput = document.getElementById(
    "signin-email",
  ) as HTMLInputElement;
  const switchButton = document.getElementById(
    "switch-to-signup",
  ) as HTMLButtonElement;

  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Clear previous errors
    clearErrors();

    const email = emailInput.value.trim();

    // Client-side validation
    if (!email || !isValidEmail(email)) {
      showFieldError("email", "Please enter a valid email address");
      return;
    }

    // Show loading state
    setLoadingState(true);

    try {
      const result = await AuthService.signIn(email);

      if (result.success) {
        showSuccess(`Welcome back, ${result.user?.name}! Redirecting...`);
        // Redirect to intended destination or default to compare page
        const destination = getIntendedDestination() || "/compare";
        clearIntendedDestination();
        setTimeout(() => {
          navigateTo(destination as keyof typeof import("../router").routes);
        }, 1500);
      } else {
        showFormError(result.error || "Failed to sign in");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      showFormError("An unexpected error occurred. Please try again.");
    } finally {
      setLoadingState(false);
    }
  });

  // Switch to sign up
  switchButton.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("/signup");
  });

  // Real-time validation
  emailInput.addEventListener("blur", () => {
    const email = emailInput.value.trim();
    if (email && !isValidEmail(email)) {
      showFieldError("email", "Please enter a valid email address");
    } else {
      clearFieldError("email");
    }
  });
}

function setLoadingState(loading: boolean) {
  const button = document.getElementById("signin-button") as HTMLButtonElement;
  const buttonText = button.querySelector(".button-text") as HTMLElement;
  const buttonSpinner = button.querySelector(".button-spinner") as HTMLElement;
  const form = document.getElementById("signin-form") as HTMLFormElement;

  button.disabled = loading;
  buttonText.style.display = loading ? "none" : "inline";
  buttonSpinner.style.display = loading ? "inline" : "none";

  // Disable form inputs during loading
  const inputs = form.querySelectorAll("input");
  inputs.forEach((input) => {
    (input as HTMLInputElement).disabled = loading;
  });
}

function showFieldError(fieldName: string, message: string) {
  const errorElement = document.getElementById(
    `${fieldName}-error`,
  ) as HTMLElement;
  const inputElement = document.getElementById(
    `signin-${fieldName}`,
  ) as HTMLInputElement;

  errorElement.textContent = message;
  errorElement.style.display = "block";
  inputElement.classList.add("error");
  inputElement.setAttribute("aria-invalid", "true");
}

function clearFieldError(fieldName: string) {
  const errorElement = document.getElementById(
    `${fieldName}-error`,
  ) as HTMLElement;
  const inputElement = document.getElementById(
    `signin-${fieldName}`,
  ) as HTMLInputElement;

  errorElement.textContent = "";
  errorElement.style.display = "none";
  inputElement.classList.remove("error");
  inputElement.setAttribute("aria-invalid", "false");
}

function showFormError(message: string) {
  const errorElement = document.getElementById("form-error") as HTMLElement;
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

function showSuccess(message: string) {
  const successElement = document.getElementById("form-success") as HTMLElement;
  successElement.textContent = message;
  successElement.style.display = "block";
}

function clearErrors() {
  clearFieldError("email");

  const formError = document.getElementById("form-error") as HTMLElement;
  const formSuccess = document.getElementById("form-success") as HTMLElement;

  formError.style.display = "none";
  formSuccess.style.display = "none";
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
