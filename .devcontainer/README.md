# Development Container Setup for Theme CRUD6

This repository includes a complete development container setup for Theme CRUD6 development with UserFrosting 6.

## What's Included

### Full Stack Development Environment
- **PHP 8.2** with UserFrosting 6 beta
- **Node.js 20** for theme development
- **MySQL 8.0** database
- **Vite** development server with hot reload
- **XDebug** for PHP debugging
- **VS Code extensions** for PHP, Vue.js, and TypeScript development

### Two Development Configurations

#### 1. Full Stack Development (Recommended)
```bash
# Uses docker-compose.yml with both UserFrosting and theme development
.devcontainer/
├── devcontainer.json          # Main devcontainer config
├── docker-compose.yml         # Multi-container setup
├── Dockerfile.full-stack      # Combined PHP + Node.js container
└── setup-full-stack.sh       # Setup script for full environment
```

#### 2. Theme-Only Development
```bash
# Uses simple Dockerfile for theme-only development
.devcontainer/
├── Dockerfile                 # Node.js only container
└── setup-theme.sh            # Theme setup script
```

## Quick Start

### Option 1: Full Stack Development (Recommended)

1. **Open in VS Code Dev Container**
   - Install "Dev Containers" extension in VS Code
   - Open this repository in VS Code
   - When prompted, click "Reopen in Container"
   - Or use Command Palette: "Dev Containers: Reopen in Container"

2. **Automatic Setup**
   - The container will automatically run `setup-full-stack.sh`
   - This creates a UserFrosting 6 project
   - Installs theme-crud6 and sprinkle-crud6 dependencies
   - Sets up database connection
   - Configures development environment

3. **Start Development Servers**
   ```bash
   # Terminal 1: UserFrosting backend
   cd /workspace/userfrosting
   php bakery migrate  # Run database migrations
   composer serve      # Start UserFrosting server (port 8080)
   
   # Terminal 2: Theme frontend
   cd /workspace/theme
   npm run dev         # Start Vite dev server (port 5173)
   ```

### Option 2: Theme-Only Development

If you want to develop only the theme components:

1. Edit `.devcontainer/devcontainer.json` to use the simple Dockerfile:
   ```json
   {
     "name": "Theme CRUD6 Development",
     "dockerFile": "Dockerfile",
     // ... rest of simple config
   }
   ```

2. Open in Dev Container and run:
   ```bash
   npm run dev  # Start Vite dev server
   ```

## Development Workflow

### UserFrosting Integration

The setup automatically configures UserFrosting to use this theme and the CRUD6 sprinkle:

```json
// package.json dependencies added to UserFrosting
{
  "dependencies": {
    "@ssnukala/theme-crud6": "file:/workspace/theme",
    "@ssnukala/sprinkle-crud6": "git+https://github.com/ssnukala/sprinkle-crud6.git#main"
  }
}
```

### Available Commands

#### In UserFrosting project (`/workspace/userfrosting`):
```bash
composer install       # Install PHP dependencies
composer serve         # Start development server
php bakery migrate     # Run database migrations
php bakery bake        # Build assets and clear cache
```

#### In Theme project (`/workspace/theme`):
```bash
npm install            # Install Node.js dependencies
npm run dev           # Start Vite dev server with hot reload
npm run build         # Build theme for production
npm run test          # Run tests
npm run test:coverage # Run tests with coverage
```

### Port Mapping

| Service | Port | Description |
|---------|------|-------------|
| UserFrosting | 8080 | Main application server |
| Vite Dev Server | 5173 | Theme development with hot reload |
| MySQL | 3306 | Database server |
| XDebug | 9003 | PHP debugging |

### VS Code Integration

The devcontainer includes these VS Code extensions:
- **PHP**: Intelephense, XDebug, PHP CS Fixer, PHPStan
- **Vue.js**: Volar, TypeScript Vue Plugin
- **General**: Prettier, Tailwind CSS, Twig, GitHub Copilot

### Database Configuration

MySQL is automatically configured with:
- Host: `mysql`
- Database: `userfrosting`
- Username: `userfrosting`
- Password: `userfrosting`

The development `.env` file is automatically created in the UserFrosting project.

## File Structure After Setup

```
/workspace/
├── theme/                     # Theme CRUD6 source (this repository)
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
├── userfrosting/             # UserFrosting 6 project
│   ├── app/
│   │   ├── sprinkles/
│   │   │   └── crud6 -> vendor/ssnukala/sprinkle-crud6
│   │   └── .env
│   ├── vendor/
│   │   └── ssnukala/
│   │       ├── sprinkle-crud6/
│   │       └── theme-crud6 -> /workspace/theme
│   ├── composer.json
│   └── package.json
```

## Troubleshooting

### Common Issues

1. **Permission Issues**
   ```bash
   sudo chown -R vscode:vscode /workspace
   ```

2. **Node Modules Issues**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Database Connection Issues**
   - Wait for MySQL container to fully start
   - Check that database credentials match in `.env`

4. **XDebug Not Working**
   - Ensure XDebug client is configured for port 9003
   - Check that `host.docker.internal` resolves correctly

### Rebuilding Container

If you need to rebuild the development container:

1. In VS Code: Command Palette → "Dev Containers: Rebuild Container"
2. Or manually: `docker-compose down && docker-compose build --no-cache`

### Logs and Debugging

```bash
# View container logs
docker-compose logs theme-crud6
docker-compose logs mysql

# Connect to running container
docker-compose exec theme-crud6 bash

# View XDebug logs
tail -f /tmp/xdebug.log
```

## Integration with UserFrosting

This setup follows UserFrosting 6 conventions:

1. **Theme Registration**: The theme is automatically registered as a npm dependency
2. **Sprinkle Integration**: CRUD6 sprinkle is installed via Composer
3. **Asset Building**: Vite handles theme compilation with UserFrosting asset pipeline integration
4. **Development Workflow**: Supports both frontend theme development and backend UserFrosting development

The goal is to provide a seamless development experience for creating CRUD interfaces using UserFrosting 6 conventions while maintaining the ability to work on the theme independently.