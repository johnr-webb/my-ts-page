# 🏠 Housing Hunt

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Google Maps](https://img.shields.io/badge/Google_Maps-4285F4?style=flat&logo=googlemaps&logoColor=white)](https://developers.google.com/maps)

A TypeScript single-page application for exploring and comparing apartment locations on an interactive map. Built for apartment hunters who want to visualize and analyze potential housing options with custom markers, address geocoding, and local data persistence.

## ✨ Features

- **🗺️ Interactive Map Visualization** - Google Maps integration with custom markers for different location types
- **📍 Smart Geocoding** - Add locations by address with automatic coordinate resolution
- **💾 Local Data Persistence** - Save and manage your location list across browser sessions
- **🎨 Theme Support** - Light/dark mode with CSS custom properties
- **📱 Responsive Design** - Mobile-first design that works on all devices
- **👤 User Profiles** - Track work addresses and personal preferences
- **📊 Location Comparison** - Tabular view for easy location comparison
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
2. Fill out the "Add Location" form:
   - **Name**: Give your location a memorable name
   - **Address**: Enter the full address (will be geocoded automatically)
   - **Type**: Choose from Apartment, House, Condo, etc.
3. Click "Add Location" to save and see it appear on the map

### Managing Locations

- **View all locations** in the interactive table below the map
- **Delete locations** using the remove button in the table
- **Location data persists** automatically in your browser's local storage

### Setting Up Your Profile

1. On first visit, complete the new user setup
2. Add your work address for commute calculations
3. Your preferences are saved locally for future sessions

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AddLocationForm.ts    # Location input form
│   ├── LocationsTable.ts     # Data table for locations
│   ├── MapView.ts           # Google Maps integration
│   ├── NavBar.ts            # Navigation with theme toggle
│   ├── NewUserForm.ts       # User onboarding
│   └── Theme.ts             # Theme management
├── pages/               # Route handlers
│   ├── home.ts              # Landing page
│   ├── compare.ts           # Main application view
│   └── find.ts              # Search functionality
├── services/            # Business logic
│   ├── GoogleMapsService.ts  # Maps API integration
│   ├── LocationsService.ts   # Location management
│   └── UserService.ts        # User profile handling
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
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key with Places & Geocoding APIs | ✅       |

## 🤖 AI Development Support

This project includes comprehensive AI assistant configuration:

- **[AGENTS.md](AGENTS.md)** - Complete context for AI assistants
- **[.vscode/copilot-instructions.md](.vscode/copilot-instructions.md)** - GitHub Copilot configuration
- **Code snippets** - TypeScript snippets for consistent development patterns

## 📚 API Documentation

### LocationsService

Main service for managing apartment locations:

```typescript
// Add a new location
await locationService.addLocation(locationData);

// Get all saved locations
const locations = locationService.getAllLocations();

// Remove a location
locationService.removeLocation(locationId);
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
