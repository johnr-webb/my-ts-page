// src/services/AuthService.ts

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

let currentUser: AuthUser | null = null;

const USERS_STORAGE_KEY = "housing_hunt_users";
const CURRENT_USER_STORAGE_KEY = "housing_hunt_current_user";

// Mock API delay for realistic feel
const mockDelay = (ms: number = 800) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const AuthService = {
  async signUp(
    name: string,
    email: string,
  ): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
    await mockDelay();

    // Sanitize inputs
    name = this.sanitizeName(name);
    email = this.sanitizeEmail(email);

    // Validate input
    if (!name || name.length < 2) {
      return {
        success: false,
        error: "Name must be at least 2 characters long",
      };
    }

    if (!this.isValidEmail(email)) {
      return { success: false, error: "Please enter a valid email address" };
    }

    // Check if user already exists
    const users = this.getAllUsers();
    const existingUser = users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }

    // Create new user
    const newUser: AuthUser = {
      id: this.generateId(),
      name: name,
      email: email,
      createdAt: new Date().toISOString(),
    };

    // Save user
    users.push(newUser);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error("Failed to save users to localStorage:", e);
      if (e instanceof Error && e.name === "QuotaExceededError") {
        return {
          success: false,
          error:
            "Storage is full. Please clear some browser data and try again.",
        };
      }
      return {
        success: false,
        error: "Failed to save account data. Please try again.",
      };
    }

    // Automatically sign in the new user
    currentUser = newUser;
    try {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(newUser));
    } catch (e) {
      console.error("Failed to save current user to localStorage:", e);
      // Still proceed with sign in even if localStorage fails
    }

    this.notifyAuthStateChange();

    return { success: true, user: newUser };
  },

  async signIn(
    email: string,
  ): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
    await mockDelay();

    // Sanitize input
    email = this.sanitizeEmail(email);

    if (!this.isValidEmail(email)) {
      return { success: false, error: "Please enter a valid email address" };
    }

    // Find user
    const users = this.getAllUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );

    if (!user) {
      return {
        success: false,
        error: "No account found with this email address",
      };
    }

    // Sign in user
    currentUser = user;
    try {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error("Failed to save current user to localStorage:", e);
      // Still proceed with sign in even if localStorage fails
    }

    this.notifyAuthStateChange();

    return { success: true, user };
  },

  signOut(): void {
    currentUser = null;
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    this.notifyAuthStateChange();
  },

  getCurrentUser(): AuthUser | null {
    if (!currentUser) {
      // Try to load from localStorage
      const saved = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (saved) {
        try {
          currentUser = JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse current user from localStorage", e);
          localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        }
      }
    }
    return currentUser;
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  getAllUsers(): AuthUser[] {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (!saved) return [];

    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse users from localStorage", e);
      return [];
    }
  },

  generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substring(2);
  },

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  sanitizeName(name: string): string {
    // Remove HTML tags and trim whitespace
    return name
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/[<>'"]/g, "") // Remove potentially dangerous characters
      .trim()
      .substring(0, 100); // Limit length
  },

  sanitizeEmail(email: string): string {
    // Normalize email address
    return email.toLowerCase().trim().substring(0, 254); // RFC maximum email length
  },

  notifyAuthStateChange(): void {
    window.dispatchEvent(
      new CustomEvent("authStateChanged", {
        detail: { user: currentUser, isAuthenticated: currentUser !== null },
      }),
    );
  },
};
