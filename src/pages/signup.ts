// src/pages/signup.ts

import { AuthServiceInstance } from "../services/AuthService";
import {
  navigateTo,
  getIntendedDestination,
  clearIntendedDestination,
} from "../router";

export function renderSignUpPage(contentElement: HTMLElement) {
  const content = `
    <div class="page-container">
      <div class="auth-container">
        <div class="auth-card">
          <h1>Create Account</h1>
          <p class="auth-subtitle">Join Housing Hunt to save and compare your favorite apartments</p>
          
          <form id="signup-form" class="auth-form">
            <div class="form-group">
              <label for="signup-name">Full Name</label>
              <input 
                type="text" 
                id="signup-name" 
                name="name" 
                required 
                minlength="2"
                placeholder="Enter your full name"
                autocomplete="name"
                aria-describedby="name-error"
                aria-invalid="false"
              >
              <span class="form-error" id="name-error" role="alert"></span>
            </div>
            
            <div class="form-group">
              <label for="signup-email">Email Address</label>
              <input 
                type="email" 
                id="signup-email" 
                name="email" 
                required
                placeholder="Enter your email address"
                autocomplete="email"
                aria-describedby="email-error"
                aria-invalid="false"
              >
              <span class="form-error" id="email-error" role="alert"></span>
            </div>
            
            <button type="submit" class="auth-button" id="signup-button">
              <span class="button-text">Create Account</span>
              <span class="button-spinner" style="display: none;">Creating...</span>
            </button>
            
            <div class="form-error" id="form-error" role="alert"></div>
            <div class="form-success" id="form-success" role="alert"></div>
          </form>
          
          <div class="auth-switch">
            <p>Already have an account? <button class="link-button" id="switch-to-signin">Sign in here</button></p>
          </div>
        </div>
      </div>
    </div>
  `;

  contentElement.innerHTML = content;
  setupSignUpEventListeners();
}

function setupSignUpEventListeners() {
  const form = document.getElementById("signup-form") as HTMLFormElement;
  const nameInput = document.getElementById("signup-name") as HTMLInputElement;
  const emailInput = document.getElementById(
    "signup-email",
  ) as HTMLInputElement;
  const switchButton = document.getElementById(
    "switch-to-signin",
  ) as HTMLButtonElement;

  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Clear previous errors
    clearErrors();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    // Client-side validation
    let hasErrors = false;

    if (!name || name.length < 2) {
      showFieldError("name", "Name must be at least 2 characters long");
      hasErrors = true;
    }

    if (!email || !isValidEmail(email)) {
      showFieldError("email", "Please enter a valid email address");
      hasErrors = true;
    }

    if (hasErrors) return;

    // Show loading state
    setLoadingState(true);

    try {
      const result = await AuthServiceInstance.signUp(name, email);

      if (result.success) {
        showSuccess("Account created successfully! Redirecting...");
        // Redirect to intended destination or default to compare page
        const destination = getIntendedDestination() || "/compare";
        clearIntendedDestination();
        setTimeout(() => {
          navigateTo(destination as keyof typeof import("../router").routes);
        }, 1500);
      } else {
        showFormError(result.error || "Failed to create account");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      showFormError("An unexpected error occurred. Please try again.");
    } finally {
      setLoadingState(false);
    }
  });

  // Switch to sign in
  switchButton.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("/signin");
  });

  // Real-time validation
  nameInput.addEventListener("blur", () => {
    const name = nameInput.value.trim();
    if (name && name.length < 2) {
      showFieldError("name", "Name must be at least 2 characters long");
    } else {
      clearFieldError("name");
    }
  });

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
  const button = document.getElementById("signup-button") as HTMLButtonElement;
  const buttonText = button.querySelector(".button-text") as HTMLElement;
  const buttonSpinner = button.querySelector(".button-spinner") as HTMLElement;
  const form = document.getElementById("signup-form") as HTMLFormElement;

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
    `signup-${fieldName}`,
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
    `signup-${fieldName}`,
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
  clearFieldError("name");
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
