# API Documentation

This document describes the public APIs and interfaces for the Housing Hunt application services.

## LocationsService

Manages apartment locations with geocoding and persistence.

### Interface

```typescript
interface LocationItem {
  id: string;
  userId: string;
  name: string;
  type: string;
  position: {
    lat: number;
    lng: number;
  };
}
```

### Methods

#### `fetchAll(): Promise<LocationItem[]>`

Fetches all locations from the data source (JSON file or API).

**Returns:** Promise resolving to array of LocationItem objects

**Example:**

```typescript
const locations = await LocationService.fetchAll();
```

#### `addByAddress(name: string, address: string, type: string): Promise<void>`

Geocodes an address and adds a new location.

**Parameters:**

- `name` - Display name for the location
- `address` - Street address to geocode
- `type` - Location type (walkup, highrise, work)

**Example:**

```typescript
await LocationService.addByAddress(
  "My Apartment",
  "123 Main St, Chicago, IL",
  "walkup",
);
```

#### `add(location: LocationItem): void`

Adds a pre-formed location object to the collection.

#### `patch(id: string, updates: Partial<LocationItem>): void`

Updates specific fields of an existing location.

#### `remove(id: string): void`

Removes a location by ID.

#### `getCurrent(): LocationItem[]`

Returns locations for the current user.

#### `notify(): void`

Dispaches 'locationsUpdated' CustomEvent with current data.

### Events

**locationsUpdated**

- Fired when location data changes
- Detail contains current LocationItem array
- Components can listen for UI updates

## UserService

Handles user profiles and work address management.

### Interface

```typescript
interface UserProfile {
  id: string;
  name: string;
  workAddress: string;
  workCoords?: {
    lat: number;
    lng: number;
  };
}
```

### Methods

#### `updateProfile(id: string, name: string, address: string): Promise<void>`

Updates user profile with geocoded work address.

**Parameters:**

- `id` - Unique user identifier
- `name` - User's display name
- `address` - Work address to geocode

**Example:**

```typescript
await UserService.updateProfile(
  "user123",
  "John Doe",
  "100 N State St, Chicago, IL",
);
```

#### `getProfile(): UserProfile`

Retrieves current user profile from memory or localStorage.

#### `notify(): void`

Dispaches 'userUpdated' CustomEvent.

### Events

**userUpdated**

- Fired when user profile changes
- Detail contains current UserProfile

## GoogleMapsService

Handles Google Maps API loading and initialization.

### Methods

#### `loadGoogleMaps(): Promise<void>`

Dynamically loads Google Maps JavaScript API.

**Returns:** Promise resolving when API is ready

**Features:**

- Prevents duplicate script loading
- Uses callback-based initialization
- Error handling for failed loads
- API key from environment variables

**Example:**

```typescript
await loadGoogleMaps();
const { Map } = await google.maps.importLibrary("maps");
```

## Component APIs

### MapView

#### `renderMap(container: HTMLElement): Promise<void>`

Initializes Google Maps in the provided container.

### AddLocationForm

#### `renderForm(container: HTMLElement): void`

Renders location input form with validation.

### LocationsTable

#### `renderTable(container: HTMLElement): void`

Renders data table with location information.

### NavBar

#### `NavBar(container: HTMLElement): HTMLElement`

Mounts navigation bar with routing and theme toggle.

## Constants

### MARKERCONS

Map of location types to emoji markers:

```typescript
const MARKERCONS = {
  walkup: "🏠",
  highrise: "🏢",
  work: "💼",
};
```

## Error Handling

- **Geocoding failures** - Alert user with helpful message
- **API load failures** - Console error with API key guidance
- **Storage errors** - Graceful fallback to default values
- **Network errors** - User-friendly error messages
