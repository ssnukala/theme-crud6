# Extension of Pink Cupcake Theme for UserFrosting 6 CRUD operations

-   Assumes UserFrosting 6 Beta and Modelled after Admin Sprinkle Group Management
-   Key feature is to load the schema dynamically and render the CRUD Pages

## Development Setup

This repository includes a complete development container setup for seamless development with UserFrosting 6.

### Quick Start with Dev Containers

1. **Prerequisites**
   - Install [Docker](https://docs.docker.com/get-docker/) and [VS Code](https://code.visualstudio.com/)
   - Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

2. **Open in Dev Container**
   - Clone this repository
   - Open in VS Code
   - When prompted, click "Reopen in Container"
   - The environment will automatically set up UserFrosting 6 + CRUD6 sprinkle + this theme

3. **Start Development**
   ```bash
   # Terminal 1: UserFrosting backend (auto-configured)
   cd /workspace/userfrosting
   php bakery migrate  # Run database migrations
   composer serve      # Start at http://localhost:8080
   
   # Terminal 2: Theme development with hot reload
   cd /workspace/theme  
   npm run dev         # Start at http://localhost:5173
   ```

See [.devcontainer/README.md](.devcontainer/README.md) for detailed setup instructions and troubleshooting.

## Manual Development Setup

If you prefer manual setup without containers:

```bash
# Install dependencies
npm install

# Development with hot reload
npm run dev

# Build for production  
npm run build

# Run tests
npm run test
```

## Design Principles

Design principle here is to stick to all the UserFrosting conventions and utilize all the components and composables, plugins etc built in UserFrosting Core, and use Admin sprinkle as a reference implementation.

### Key Features

- **Schema-driven CRUD**: Dynamic form generation based on model schemas
- **UserFrosting Integration**: Seamless integration with UserFrosting 6 ecosystem
- **Vue.js Components**: Reusable components following UserFrosting patterns  
- **TypeScript Support**: Full TypeScript integration with proper type definitions
- **Development Container**: Complete dev environment with UserFrosting 6 + MySQL + debugging tools

# needs a lot of work in cleaning up and updating
