# CRUD6 Route Configuration

This theme provides route configuration for CRUD6 operations that integrate with UserFrosting's routing system.

## Usage

To use the CRUD6 routes in your UserFrosting application:

```typescript
import { CRUD6Routes } from '@ssnukala/theme-crud6'

// Add to your router configuration
const routes = [
  // ... your other routes
  ...CRUD6Routes
]
```

## Available Routes

- `GET /crud6/:model` - List view for any model (e.g., `/crud6/groups`)
- `GET /crud6/:model/create` - Create form for new records
- `GET /crud6/:model/:id` - View single record
- `GET /crud6/:model/:id/edit` - Edit form for existing records

## Route Components

All routes use the theme's UIKit-styled components:

- **PageList.vue** - Schema-driven table listing with UFSprunjeTable
- **PageRow.vue** - Dynamic form for viewing/editing records

## Permissions

All routes require the `uri_crud6` permission slug for access control.

## Integration

These routes override the default Bootstrap-styled views from `@ssnukala/sprinkle-crud6` with UserFrosting-compatible UIKit components that integrate with:

- UFSprunjeTable for data listing
- Schema-driven field rendering
- UserFrosting permission system
- UIKit styling and components