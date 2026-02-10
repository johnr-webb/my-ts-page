// src/services/AuthService.ts

import { BaseService } from '../base/BaseService';


export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export class AuthService extends BaseService {
  private static instance: AuthService;
  private currentUser: AuthUser | null = null;
  private readonly USERS_STORAGE_KEY = "housing_hunt_users";
  private readonly CURRENT_USER_STORAGE_KEY = "housing_hunt_current_user";

  private constructor() {
    super();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async mockDelay(ms: number = 800): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async signUp(
    name: string,
    email: string,
  ): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
    try {
      await this.mockDelay();

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
        localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(users));
      } catch (error) {
        this.handleError(error, 'signUp');
        if (error instanceof Error && error.name === "QuotaExceededError") {
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
      this.currentUser = newUser;
      try {
        localStorage.setItem(this.CURRENT_USER_STORAGE_KEY, JSON.stringify(newUser));
      } catch (error) {
        this.handleError(error, 'signUp - save current');
        // Still proceed with sign in even if localStorage fails
      }

      this.notifyAuthStateChange();

      return { success: true, user: newUser };
    } catch (error) {
      this.handleError(error, 'signUp');
      return { success: false, error: "An unexpected error occurred during sign up" };
    }
  }

  async signIn(
    email: string,
  ): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
    try {
      await this.mockDelay();

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
      this.currentUser = user;
      try {
        localStorage.setItem(this.CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
      } catch (error) {
        this.handleError(error, 'signIn - save current');
        // Still proceed with sign in even if localStorage fails
      }

      this.notifyAuthStateChange();

      return { success: true, user };
    } catch (error) {
      this.handleError(error, 'signIn');
      return { success: false, error: "An unexpected error occurred during sign in" };
    }
  }

  signOut(): void {
    this.currentUser = null;
    try {
      localStorage.removeItem(this.CURRENT_USER_STORAGE_KEY);
    } catch (error) {
      this.handleError(error, 'signOut');
    }
    this.notifyAuthStateChange();
  }

  getCurrentUser(): AuthUser | null {
    if (!this.currentUser) {
      // Try to load from localStorage
      const saved = localStorage.getItem(this.CURRENT_USER_STORAGE_KEY);
      if (saved) {
        try {
          this.currentUser = JSON.parse(saved);
        } catch (error) {
          this.handleError(error, 'getCurrentUser - parse');
          localStorage.removeItem(this.CURRENT_USER_STORAGE_KEY);
        }
      }
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  getAllUsers(): AuthUser[] {
    const saved = localStorage.getItem(this.USERS_STORAGE_KEY);
    if (!saved) return [];

    try {
      return JSON.parse(saved);
    } catch (error) {
      this.handleError(error, 'getAllUsers - parse');
      return [];
    }
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substring(2);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private sanitizeName(name: string): string {
    // Remove HTML tags and trim whitespace
    return name
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/[<>'"]/g, "") // Remove potentially dangerous characters
      .trim()
      .substring(0, 100); // Limit length
  }

  private sanitizeEmail(email: string): string {
    // Normalize email address
    return email.toLowerCase().trim().substring(0, 254); // RFC maximum email length
  }

  private notifyAuthStateChange(): void {
    this.dispatchEvent('authStateChanged', {
      user: this.currentUser,
      isAuthenticated: this.currentUser !== null,
    });
  }
}

// Export singleton instance for backward compatibility
export const AuthServiceInstance = AuthService.getInstance();