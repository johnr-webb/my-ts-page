// src/services/UserService.ts

import { AuthService } from "./AuthService";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  workAddress: string;
  workCoords?: { lat: number; lng: number };
}

let userProfile: UserProfile = {
  id: "",
  name: "",
  email: "",
  workAddress: "",
};

export const UserService = {
  async updateProfile(
    id: string,
    name: string,
    email: string,
    address: string,
  ) {
    const geocoder = new google.maps.Geocoder();

    try {
      const result = await geocoder.geocode({ address });
      const coords = result.results[0]?.geometry.location;

      userProfile = {
        id: id,
        name: name,
        email: email,
        workAddress: address,
        workCoords: coords
          ? { lat: coords.lat(), lng: coords.lng() }
          : undefined,
      };

      // Save to localStorage with user-specific key
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        localStorage.setItem(
          `house_hunter_user_${currentUser.id}`,
          JSON.stringify(userProfile),
        );
      }

      this.notify();
    } catch (e) {
      console.error("Failed to geocode work address", e);
    }
  },

  getProfile() {
    // Get the current authenticated user
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      return {
        id: "",
        name: "",
        email: "",
        workAddress: "",
      };
    }

    // Try to load user-specific profile from localStorage
    if (!userProfile.name || userProfile.email !== currentUser.email) {
      const saved = localStorage.getItem(`house_hunter_user_${currentUser.id}`);
      if (saved) {
        userProfile = JSON.parse(saved);
      } else {
        // Initialize profile with auth user data
        userProfile = {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          workAddress: "",
        };
      }
    }

    return userProfile;
  },

  notify() {
    window.dispatchEvent(
      new CustomEvent("userUpdated", { detail: userProfile }),
    );
  },
};
