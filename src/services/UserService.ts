// src/services/UserService.ts

export interface UserProfile {
  id: string;
  name: string;
  workAddress: string;
  workCoords?: { lat: number; lng: number };
}

let userProfile: UserProfile = {
  id: "",
  name: "",
  workAddress: "",
};

export const UserService = {
  async updateProfile(id: string, name: string, address: string) {
    const geocoder = new google.maps.Geocoder();

    try {
      const result = await geocoder.geocode({ address });
      const coords = result.results[0]?.geometry.location;

      userProfile = {
        id: id,
        name: name,
        workAddress: address,
        workCoords: coords
          ? { lat: coords.lat(), lng: coords.lng() }
          : undefined,
      };

      // Save to localStorage so they don't have to type it again on refresh
      localStorage.setItem("house_hunter_user", JSON.stringify(userProfile));

      this.notify();
    } catch (e) {
      console.error("Failed to geocode work address", e);
    }
  },

  getProfile() {
    // Try to load from localStorage if the variable is empty
    if (!userProfile.name) {
      const saved = localStorage.getItem("house_hunter_user");
      if (saved) userProfile = JSON.parse(saved);
    }
    return userProfile;
  },

  notify() {
    window.dispatchEvent(
      new CustomEvent("userUpdated", { detail: userProfile })
    );
  },
};
