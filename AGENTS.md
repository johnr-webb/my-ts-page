# AI Agents Configuration for Housing Hunt

This document provides context and instructions for AI assistants working with the Housing Hunt codebase.

## Project Overview

Housing Hunt is a TypeScript single-page application for exploring and comparing apartment locations on a map. It features:

- **Map visualization** using Google Maps API with custom markers
- **Location management** with geocoding and local storage
- **User preferences** and work address tracking
- **Responsive design** with light/dark theme support
- **Component-based architecture** with TypeScript

## Architecture

### Core Services

- [`LocationService`](src/services/LocationsService.ts) - Manages apartment locations and geocoding
- [`UserService`](src/services/UserService.ts) - Handles user profiles and work addresses
- [`GoogleMapsService`](src/services/GoogleMapsService.ts) - Google Maps API integration

### Key Components

- [`MapView`](src/components/MapView.ts) - Interactive map with custom markers
- [`AddLocationForm`](src/components/AddLocationForm.ts) - Form for adding new locations
- [`LocationsTable`](src/components/LocationsTable.ts) - Tabular view of saved locations
- [`NavBar`](src/components/NavBar.ts) - Navigation with theme toggle
- [`NewUserForm`](src/components/NewUserForm.ts) - Multi-step user onboarding

### Pages & Routing

- [`home.ts`](src/pages/home.ts) - Landing page
- [`compare.ts`](src/pages/compare.ts) - Main comparison interface
- [`find.ts`](src/pages/find.ts) - Search functionality (in development)
- [`router.ts`](src/router.ts) - Client-side routing system

## Development Guidelines

### Code Style

- Use TypeScript with strict mode enabled
- Follow the existing component pattern with render functions
- Prefer CSS custom properties for theming
- Use event-driven architecture for component communication
- Implement proper error handling for async operations

### Data Flow

1. User interactions trigger service methods
2. Services update internal state and notify via custom events
3. Components listen for events and re-render accordingly
4. LocalStorage provides persistence between sessions

### Adding New Features

1. Create services in [`src/services/`](src/services/) for business logic
2. Build UI components in [`src/components/`](src/components/)
3. Add pages to [`src/pages/`](src/pages/) and update [`router.ts`](src/router.ts)
4. Use the existing CSS custom properties for consistent styling

### Environment Setup

- Requires `VITE_GOOGLE_MAPS_API_KEY` environment variable
- Uses Vite for development and building
- Deployed to GitHub Pages with base path `/my-ts-page/`

## Common Tasks

### Adding a New Location Type

1. Update `MARKERCONS` in [`LocationsService`](src/services/LocationsService.ts)
2. Add CSS styles for the new marker type in [`style.css`](src/style.css)
3. Update the select options in [`AddLocationForm`](src/components/AddLocationForm.ts)

### Implementing New Pages

1. Create page function in [`src/pages/`](src/pages/)
2. Add route to [`routes`](src/router.ts) object
3. Add navigation link in [`NavBar`](src/components/NavBar.ts)

### Adding User Preferences

1. Extend [`UserProfile`](src/services/UserService.ts) interface
2. Update [`NewUserForm`](src/components/NewUserForm.ts) questions
3. Modify localStorage persistence logic

## Testing & Debugging

- Use browser developer tools for debugging
- Check console for geocoding and API errors
- Verify localStorage data for persistence issues
- Test theme switching and responsive design

## Deployment

- Builds to `dist/` directory via Vite
- Automatically deployed to GitHub Pages on main branch push
- Requires Google Maps API key secret in GitHub repository settings
