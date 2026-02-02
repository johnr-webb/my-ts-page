# GitHub Copilot Instructions for Housing Hunt

## Project Context

Housing Hunt is a TypeScript SPA for apartment hunting with Google Maps integration. Follow the established patterns and architecture outlined in AGENTS.md.

## Code Style Guidelines

- Use TypeScript with strict mode enabled
- Follow existing component pattern with render functions returning HTMLElement
- Use CSS custom properties for theming (--primary-color, --background-color, etc.)
- Implement event-driven architecture with CustomEvents for component communication
- Use proper error handling for async operations, especially geocoding

## Component Pattern

```typescript
export function ComponentName(container: HTMLElement): void {
  function render(): void {
    container.innerHTML = `<div>...</div>`;
    attachEventListeners();
  }

  function attachEventListeners(): void {
    // Event handling logic
  }

  render();
}
```

## Service Pattern

```typescript
class ServiceName {
  private static instance: ServiceName;

  public static getInstance(): ServiceName {
    if (!ServiceName.instance) {
      ServiceName.instance = new ServiceName();
    }
    return ServiceName.instance;
  }

  // Emit events for state changes
  private notifyChange(): void {
    document.dispatchEvent(new CustomEvent("service-updated"));
  }
}
```

## File Organization Preferences

- Services: `src/services/` - Business logic, data management
- Components: `src/components/` - UI components with render functions
- Pages: `src/pages/` - Route handlers
- Types: Define interfaces inline or in service files
- Constants: Define in relevant service files

## When Suggesting Code

- Reference existing LocationService, UserService, GoogleMapsService patterns
- Use established CSS custom properties from style.css
- Follow the router.ts pattern for new routes
- Implement proper TypeScript types and error handling
- Use querySelector with type assertions for DOM access
- Persist important data to localStorage with try/catch blocks
