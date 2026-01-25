# Architecture Documentation

This document provides an overview of the Housing Hunt application architecture, component relationships, and data flow patterns.

## Component Tree

```mermaid
flowchart TD
    App["#app (main.ts)"]

    %% Header Section
    App --> Header["site-header"]
    Header --> NavBar["NavBar.ts"]
    NavBar --> Logo["Logo"]
    NavBar --> NavItems["Navigation Items"]
    NavBar --> ThemeToggle["Theme.ts"]

    %% Main Content
    App --> Main["site-main"]
    Main --> MainContent["main-content"]

    %% Router Pages
    MainContent --> HomePage["home.ts"]
    MainContent --> ComparePage["compare.ts"]
    MainContent --> FindPage["find.ts"]

    %% Compare Page Components
    ComparePage --> NewUserForm["NewUserForm.ts"]
    ComparePage --> MapView["MapView.ts"]
    ComparePage --> AddLocationForm["AddLocationForm.ts"]
    ComparePage --> LocationsTable["LocationsTable.ts"]

    %% Footer
    App --> Footer["site-footer"]

    %% Services (Data Layer)
    MapView -.-> GoogleMapsService["GoogleMapsService.ts"]
    AddLocationForm -.-> LocationsService["LocationsService.ts"]
    LocationsTable -.-> LocationsService
    NewUserForm -.-> UserService["UserService.ts"]

    %% External Dependencies
    GoogleMapsService -.-> GoogleMaps["Google Maps API"]
    LocationsService -.-> LocalStorage["localStorage"]
    UserService -.-> LocalStorage

    %% Styling
    classDef service fill:#e1f5fe
    classDef component fill:#f3e5f5
    classDef page fill:#e8f5e8
    classDef external fill:#fff3e0

    class GoogleMapsService,LocationsService,UserService service
    class NavBar,MapView,AddLocationForm,LocationsTable,NewUserForm component
    class HomePage,ComparePage,FindPage page
    class GoogleMaps,LocalStorage external
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant Component
    participant Service
    participant Storage
    participant API

    User->>Component: Interaction (click, form submit)
    Component->>Service: Call service method
    Service->>Storage: Read/Write data
    Service->>API: External API call
    API-->>Service: Response
    Service->>Service: Update internal state
    Service->>Component: Dispatch CustomEvent
    Component->>Component: Re-render with new data
    Component-->>User: Updated UI
```

## Event-Driven Communication

The application uses CustomEvents for loose coupling between services and components:

- `locationsUpdated` - Fired when LocationsService data changes
- `userUpdated` - Fired when UserService profile changes
- Theme changes propagated through CSS custom properties

## Routing System

Client-side routing handled by `router.ts`:

- Hash-based navigation
- Dynamic page rendering
- History API integration

## State Management

- **Services** maintain application state
- **localStorage** provides persistence
- **CustomEvents** notify UI components of changes
- **CSS Custom Properties** handle theming state
