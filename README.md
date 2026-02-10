# 🏠 Housing Hunt

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Google Maps](https://img.shields.io/badge/Google_Maps-4285F4?style=flat&logo=googlemaps&logoColor=white)](https://developers.google.com/maps)

A TypeScript single-page application for exploring and comparing apartment locations on an interactive map. Built for apartment hunters who want to visualize and analyze potential housing options with custom markers, address geocoding, and local data persistence.

## ✨ Features

- **🗺️ Interactive Map Visualization** - Google Maps integration with custom markers for different location types
- **📍 Smart Geocoding** - Add locations by address with automatic coordinate resolution
- **🏠 Enhanced Property Details** - Comprehensive property information including rent, square footage, bedrooms, bathrooms, and amenities
- **⭐ Amenity Ratings** - Rate and compare gym, pool, and outdoor space quality with star ratings
- **🚗 Travel Time Calculations** - Automatic calculation of walking, driving, and transit times from work address
- **📊 Advanced Analytics & Scoring** - Intelligent scoring system with commute, cost, amenity, and size analysis
- **🔧 Flexible Table Views** - Customizable columns, sorting, filtering, and export capabilities
- **💾 Local Data Persistence** - Save and manage your location list across browser sessions with intelligent caching
- **🎨 Theme Support** - Light/dark mode with CSS custom properties
- **📱 Responsive Design** - Mobile-first design that works on all devices with touch-friendly controls
- **👤 User Profiles** - Track work addresses and personal preferences
- **🧭 Smart Routing** - Client-side navigation with history support

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- A Google Maps API key with Places and Geocoding APIs enabled

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/my-ts-page.git
   cd my-ts-page
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Google Maps API key:

   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to start using Housing Hunt!

### Building for Production

```bash
npm run build
npm run preview
```

## 💡 Usage

### Adding Your First Location

1. Navigate to the **Compare** page
2. Fill out the comprehensive "Add Location" form:
   - **Basic Info**: Name, Address, Type, Rent, Square Footage, Bedrooms, Bathrooms
   - **Amenities**: Rate gym, pool, and outdoor space (1-5 stars)
   - **Additional**: Parking, laundry options, pet policy, and description
3. Click "Add Location" to save and see it appear with automatic travel time calculations

### Managing Locations

- **View all locations** in the flexible, customizable comparison table
- **Customize columns** - show/hide specific data points, reorder as needed
- **Sort and filter** by any column (price, distance, amenities, etc.)
- **Export data** to CSV for external analysis
- **Delete locations** using the remove button in the table
- **Analyze scores** - view automated analytics with weighted scoring system
- **Location data persists** automatically with intelligent caching and travel time optimization

### Using Analytics & Scoring

- **View analytics panel** with comprehensive insights and recommendations
- **Adjust score weights** - customize importance of commute vs cost vs amenities
- **Compare locations** using color-coded scores (green/yellow/red)
- **See top recommendations** automatically highlighted based on your preferences

### Setting Up Your Profile

1. On first visit, complete the new user setup
2. Add your work address for commute calculations
3. Your preferences are saved locally for future sessions

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── EnhancedAddLocationForm.ts  # Comprehensive location input form
│   ├── FlexibleTable.ts            # Customizable comparison table
│   ├── ColumnManager.ts            # Column configuration and presets
│   ├── AnalyticsDisplay.ts         # Analytics panel and scoring display
│   ├── ColumnConfig.ts             # Column definitions and configurations
│   ├── LocationsTable.ts           # Legacy data table (backward compatibility)
│   ├── MapView.ts                  # Google Maps integration
│   ├── NavBar.ts                   # Navigation with theme toggle
│   ├── NewUserForm.ts              # User onboarding
│   ├── AddLocationForm.ts          # Basic location form (legacy)
│   └── Theme.ts                    # Theme management
├── pages/               # Route handlers
│   ├── home.ts              # Landing page
│   ├── compare.ts           # Enhanced comparison interface
│   └── find.ts              # Search functionality
├── services/            # Business logic
│   ├── AnalyticsEngine.ts         # Extensible analytics and scoring system
│   ├── TravelTimeService.ts       # Google Distance Matrix API integration
│   ├── TravelTimeCache.ts         # Travel time caching service
│   ├── TravelTimeIntegration.ts   # Travel time automation and events
│   ├── LocationValidator.ts       # Form validation and sanitization
│   ├── GoogleMapsService.ts       # Maps API integration
│   ├── LocationsService.ts        # Enhanced location management
│   ├── UserService.ts              # User profile handling
│   └── AuthService.ts              # Authentication service
├── types/               # TypeScript type definitions
│   └── ComparisonTypes.ts         # Enhanced location interfaces and types
├── utils/               # Utility functions
│   └── Calculators.ts              # Scoring algorithms and calculations
├── router.ts            # Client-side routing
├── main.ts             # Application entry point
└── style.css           # Global styles and CSS custom properties
```

## 🛠️ Development

### Architecture

Housing Hunt follows a **component-based architecture** with:

- **Services** for business logic and data management
- **Components** with render functions and event-driven communication
- **Pages** as route handlers
- **Event-driven updates** using CustomEvents for loose coupling

### Code Examples

**Creating a new component:**

```typescript
export function MyComponent(container: HTMLElement): void {
  function render(): void {
    container.innerHTML = `
      <div class="my-component">
        <!-- Component content -->
      </div>
    `;
    attachEventListeners();
  }

  function attachEventListeners(): void {
    // Event handling logic
  }

  render();
}
```

**Using services:**

```typescript
const locationService = LocationService.getInstance();
await locationService.addLocation({
  name: "My Apartment",
  address: "123 Main St",
  type: "apartment",
});
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Environment Variables

| Variable                   | Description                                      | Required |
| -------------------------- | ------------------------------------------------ | -------- |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key with Places, Geocoding, and Distance Matrix APIs | ✅       |

## 🤖 AI Development Support

This project includes comprehensive AI assistant configuration:

- **[AGENTS.md](AGENTS.md)** - Complete context for AI assistants
- **[.vscode/copilot-instructions.md](.vscode/copilot-instructions.md)** - GitHub Copilot configuration
- **Code snippets** - TypeScript snippets for consistent development patterns

## 📚 API Documentation

### Enhanced Services

**LocationsService** - Enhanced location management with comprehensive property data:

```typescript
// Add an enhanced location with full details
await locationService.addLocation({
  name: "Modern Apartment",
  address: "123 Main St",
  type: "apartment",
  rent: 250000, // in cents
  squareFootage: 850,
  bedrooms: 2,
  bathrooms: 2,
  amenities: {
    gym: { has: true, rating: 4 },
    pool: { has: true, rating: 3 },
    outdoorSpace: { has: false },
    parking: true,
    laundry: "in-unit",
    pets: true
  }
});

// Get enhanced locations with travel times
const locations = locationService.getCurrent() as EnhancedLocationItem[];
```

**AnalyticsEngine** - Extensible scoring and analysis system:

```typescript
// Calculate scores for locations
const analyticsEngine = AnalyticsEngine.getInstance();
const results = await analyticsEngine.calculateScores(locations, {
  commuteWeight: 0.4,
  costWeight: 0.3,
  amenityWeight: 0.2,
  sizeWeight: 0.1
});

// Get insights and recommendations
const insights = results.insights;
const recommendations = results.recommendations;
```

**TravelTimeService** - Automatic travel time calculations:

```typescript
// Calculate travel times from work to locations
const travelService = TravelTimeService.getInstance();
const travelTimes = await travelService.calculateTravelTimes(
  workCoordinates,
  locationCoordinates,
  ['walking', 'driving', 'transit']
);
```

### GoogleMapsService

Handles map rendering and geocoding:

```typescript
// Initialize map
const mapService = GoogleMapsService.getInstance();
await mapService.initializeMap(container, options);

// Geocode an address
const coordinates = await mapService.geocodeAddress(address);
```

## 🆘 Support

- **Documentation**: See [AGENTS.md](AGENTS.md) for development context
- **Contributing**: Check [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for contribution guidelines
- **Issues**: Report bugs and feature requests via GitHub Issues

## 👥 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details on:

- Code of conduct
- Development setup
- Pull request process
- Coding standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Deployment

This project is configured for deployment to GitHub Pages:

1. Push to the `main` branch
2. GitHub Actions automatically builds and deploys
3. Visit your site at `https://yourusername.github.io/my-ts-page/`

---

**Built with ❤️ using TypeScript, Vite, and Google Maps API**

- `src/main.ts` — bootstraps the app and router
- `src/pages/` — page-level views (e.g. `compare.ts`)
- `src/components/` — small UI components (`mapView.ts`, `addLocationCard.ts`, `locationsTable.ts`, `navBar.ts`)
- `src/map.ts` & `src/mapLoader.ts` — map and geocoding helpers

Persistence

- The app currently uses `localStorage` to persist user-added locations. You can seed or replace that with a `locations.json` file or a remote API if you need sharable or server-backed data.

Contributing

For contribution guidelines, see [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).
