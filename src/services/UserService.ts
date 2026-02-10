// src/services/UserService.ts

import { BaseService } from '../base/BaseService';
import { AuthServiceInstance } from "./AuthService";


export interface UserProfile {
  id: string;
  name: string;
  email: string;
  workAddress: string;
  workCoords?: { lat: number; lng: number };
}

export class UserService extends BaseService {
  private static instance: UserService;
  private userProfile: UserProfile = {
    id: "",
    name: "",
    email: "",
    workAddress: "",
  };

  private constructor() {
    super();
  }

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async updateProfile(
    id: string,
    name: string,
    email: string,
    address: string,
  ): Promise<void> {
    const geocoder = new google.maps.Geocoder();

    try {
      const result = await geocoder.geocode({ address });
      const coords = result.results[0]?.geometry.location;

      this.userProfile = {
        id: id,
        name: name,
        email: email,
        workAddress: address,
        workCoords: coords
          ? { lat: coords.lat(), lng: coords.lng() }
          : undefined,
      };

      // Save to localStorage with user-specific key
      const currentUser = AuthServiceInstance.getCurrentUser();
      if (currentUser) {
        localStorage.setItem(
          `house_hunter_user_${currentUser.id}`,
          JSON.stringify(this.userProfile),
        );
      }

      this.notify();
    } catch (error) {
      this.handleError(error, 'updateProfile');
    }
  }

  getProfile(): UserProfile {
    // Get the current authenticated user
    const currentUser = AuthServiceInstance.getCurrentUser();
    if (!currentUser) {
      return {
        id: "",
        name: "",
        email: "",
        workAddress: "",
      };
    }

    // Try to load user-specific profile from localStorage
    if (!this.userProfile.name || this.userProfile.email !== currentUser.email) {
      const saved = localStorage.getItem(`house_hunter_user_${currentUser.id}`);
      if (saved) {
        try {
          this.userProfile = JSON.parse(saved);
        } catch (error) {
          this.handleError(error, 'getProfile');
          this.userProfile = {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            workAddress: "",
          };
        }
      } else {
        // Initialize profile with auth user data
        this.userProfile = {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          workAddress: "",
        };
      }
    }

    return this.userProfile;
  }

  private notify(): void {
    this.dispatchEvent('authStateChanged', {
      user: this.userProfile,
      isAuthenticated: true
    });
  }
}

// Export singleton instance for backward compatibility
export const UserServiceInstance = UserService.getInstance();
