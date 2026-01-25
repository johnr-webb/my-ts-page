# Data Models and Entity Relationships

This document describes the data structures and relationships in the Housing Hunt application.

## Entity Relationship Diagram

```mermaid
erDiagram
    USER {
        string id PK
        string name
        string workAddress
        number workLat "nullable"
        number workLng "nullable"
    }

    LOCATION {
        string id PK
        string userId FK
        string name
        string type
        number lat
        number lng
    }

    LOCATION_TYPE {
        string type PK
        string icon
        string description
    }

    USER ||--o{ LOCATION : owns
    LOCATION }o--|| LOCATION_TYPE : categorized_by
```

## Data Models

### LocationItem

Represents a saved apartment or location of interest.

```typescript
interface LocationItem {
  id: string; // Unique identifier (UUID)
  userId: string; // References user who created it
  name: string; // Display name (e.g., "Downtown Apartment")
  type: string; // Category: walkup, highrise, work
  position: {
    lat: number; // Latitude coordinate
    lng: number; // Longitude coordinate
  };
}
```

**Constraints:**

- `id` must be unique across all locations
- `userId` links to current user session
- `position` coordinates must be valid lat/lng values
- `type` must match available marker types

### UserProfile

Stores user information and preferences.

```typescript
interface UserProfile {
  id: string; // Unique user identifier
  name: string; // User's display name
  workAddress: string; // Work location for commute calculations
  workCoords?: {
    // Geocoded work coordinates (optional)
    lat: number;
    lng: number;
  };
}
```

**Constraints:**

- `id` must be unique per browser/session
- `workCoords` populated after successful geocoding
- All fields persisted to localStorage

### LocationType

Defines available location categories.

```typescript
type LocationType = "walkup" | "highrise" | "work";

const MARKERCONS: Record<LocationType, string> = {
  walkup: "🏠", // Single-family homes, small buildings
  highrise: "🏢", // Large apartment complexes, towers
  work: "💼", // Work/office locations
};
```

## Data Storage

### localStorage Schema

```typescript
// User profile storage
"house_hunter_user": string // JSON.stringify(UserProfile)

// First-time user flag
"hasVisited": "yes" | null

// Theme preference
"theme": "light" | "dark"
"theme-timestamp": string // Date.now().toString()
```

### Seed Data

Initial locations loaded from `public/data/locations.json`:

```json
[
  {
    "id": 1,
    "type": "highrise",
    "name": "1 Superior Place",
    "position": { "lat": 41.895293, "lng": -87.628716 }
  },
  {
    "id": 2,
    "type": "work",
    "name": "Work",
    "position": { "lat": 41.894513, "lng": -87.622876 }
  }
]
```

## Data Flow

### Location Management

```mermaid
flowchart LR
    A[User Input] --> B[AddLocationForm]
    B --> C[LocationService.addByAddress]
    C --> D[Google Geocoding API]
    D --> E[Create LocationItem]
    E --> F[Add to Collection]
    F --> G[localStorage Persistence]
    G --> H[Dispatch Event]
    H --> I[Update UI Components]
```

### User Profile Flow

```mermaid
flowchart LR
    A[NewUserForm] --> B[Collect Profile Data]
    B --> C[UserService.updateProfile]
    C --> D[Geocode Work Address]
    D --> E[Save to localStorage]
    E --> F[Mark as Returning User]
    F --> G[Navigate to Compare Page]
```

## Data Validation

### Input Validation

- Location names must be non-empty strings
- Addresses validated through geocoding API
- Coordinates must be valid lat/lng ranges
- User names required for profile creation

### Error Handling

- Invalid addresses show user-friendly error messages
- Geocoding failures provide alternative suggestions
- Storage errors fallback to in-memory state
- Missing data handled with sensible defaults

## Future Enhancements

Potential data model extensions:

- Location ratings and reviews
- Commute time calculations
- Favorite locations
- Location sharing between users
- Price and amenity data
- Search filters and preferences
