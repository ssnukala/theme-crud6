#!/bin/bash

# Full Stack Theme CRUD6 Development Setup Script
# This script sets up both the UserFrosting backend and theme frontend development environment

set -e  # Exit on any error

echo "🚀 Setting up Full Stack Theme CRUD6 development environment..."

# Environment variables
PACKAGE_DIR=${PACKAGE_DIR:-"/workspace/userfrosting"}
THEME_DIR=${THEME_DIR:-"/workspace/theme"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[====]${NC} $1"
}

print_header "Verifying environment..."
node --version
npm --version
php --version
composer --version

# Setup workspace structure
print_step "Setting up workspace structure..."
mkdir -p "$PACKAGE_DIR"
mkdir -p "$THEME_DIR"

# Copy theme files to dedicated directory
print_step "Organizing theme files..."
if [ -d "/workspace" ] && [ ! -f "$THEME_DIR/package.json" ]; then
    cp -r /workspace/* "$THEME_DIR/" 2>/dev/null || true
    cp -r /workspace/.* "$THEME_DIR/" 2>/dev/null || true
fi

print_header "Setting up UserFrosting Backend..."

# Create UserFrosting 6 project if it doesn't exist
if [ ! -d "$PACKAGE_DIR/composer.json" ]; then
    print_step "Creating new UserFrosting 6 project at $PACKAGE_DIR..."
    composer create-project userfrosting/userfrosting "$PACKAGE_DIR" "^6.0-beta" --no-interaction
    
    # Set proper permissions
    sudo chown -R vscode:vscode "$PACKAGE_DIR"
    
    print_info "UserFrosting 6 project created successfully!"
else
    print_info "UserFrosting project already exists at $PACKAGE_DIR"
fi

cd "$PACKAGE_DIR"

print_step "Configuring UserFrosting for CRUD6 development..."

# Backup original files
if [ -f "composer.json" ]; then
    cp composer.json composer.json.backup
fi

if [ -f "package.json" ]; then
    cp package.json package.json.backup
fi

# Add the CRUD6 sprinkle as dependency
print_step "Adding CRUD6 sprinkle to UserFrosting..."
composer config repositories.crud6-sprinkle git https://github.com/ssnukala/sprinkle-crud6.git
composer require "ssnukala/sprinkle-crud6:dev-main" --no-update

# Ensure minimum-stability and prefer-stable are set
composer config minimum-stability beta
composer config prefer-stable true

print_step "Installing UserFrosting PHP dependencies..."
composer install --no-interaction

print_step "Adding frontend dependencies to UserFrosting..."

# Check if package.json exists, if not create a basic one
if [ ! -f "package.json" ]; then
    npm init -y
fi

# Add theme and sprinkle dependencies
npm pkg set dependencies.@ssnukala/theme-crud6="file:$THEME_DIR"
npm pkg set dependencies.@ssnukala/sprinkle-crud6="git+https://github.com/ssnukala/sprinkle-crud6.git#main"

print_step "Installing UserFrosting JavaScript dependencies..."
npm install

print_step "Setting up UserFrosting directories and permissions..."
mkdir -p app/logs app/cache app/sessions
sudo chown -R vscode:vscode app/logs app/cache app/sessions 2>/dev/null || true
chmod -R 775 app/logs app/cache app/sessions 2>/dev/null || true

print_header "Setting up Theme Development Environment..."

cd "$THEME_DIR"

print_step "Installing theme dependencies..."
npm install

print_step "Verifying theme TypeScript configuration..."
if [ -f "tsconfig.json" ]; then
    # Try to validate TypeScript without erroring out on missing modules
    npx tsc --noEmit --skipLibCheck || print_info "⚠️  TypeScript validation completed with warnings (expected for development setup)"
else
    print_info "⚠️  No TypeScript configuration found"
fi

print_step "Validating theme Vue components..."
if [ -d "src/components" ]; then
    COMPONENT_COUNT=$(find src/components -name "*.vue" | wc -l)
    print_info "✅ Found $COMPONENT_COUNT Vue components"
fi

print_step "Setting up theme development scripts..."
npm pkg set scripts.dev="vite dev --host"
npm pkg set scripts.build="vite build"
npm pkg set scripts.preview="vite preview"
npm pkg set scripts.test="vitest"
npm pkg set scripts.test:coverage="vitest --coverage"

print_header "Final Setup and Validation..."

print_step "Creating symbolic links for integrated development..."
cd "$PACKAGE_DIR"
if [ ! -L "app/sprinkles/crud6" ]; then
    mkdir -p app/sprinkles
    # Create a link to the sprinkle source in vendor for development
    if [ -d "vendor/ssnukala/sprinkle-crud6" ]; then
        ln -sf "$(realpath vendor/ssnukala/sprinkle-crud6)" app/sprinkles/crud6
        print_info "Created symbolic link: app/sprinkles/crud6"
    fi
fi

print_step "Setting up database configuration..."
if [ ! -f "app/.env" ]; then
    cat > app/.env << EOF
# Database Configuration for Development
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=userfrosting
DB_USERNAME=userfrosting
DB_PASSWORD=userfrosting

# Debug Configuration
DEBUG=true
CACHE_ENABLED=false

# UserFrosting Configuration
UF_MODE=development
EOF
    print_info "Created development .env file"
fi

print_step "Setup completed successfully! 🎉"
echo ""
print_info "Full Stack Development Environment Summary:"
print_info "  🐘 PHP version: $(php --version | head -n1)"
print_info "  📦 Composer version: $(composer --version | head -n1)"
print_info "  🟢 Node.js version: $(node --version)"
print_info "  📦 npm version: $(npm --version)"
print_info "  📁 UserFrosting project: $PACKAGE_DIR"
print_info "  🎨 Theme source: $THEME_DIR"
echo ""
print_info "Development Servers:"
print_info "  🌐 UserFrosting: Run 'composer serve' in $PACKAGE_DIR"
print_info "  🎨 Theme Development: Run 'npm run dev' in $THEME_DIR"
print_info "  🗄️  MySQL: mysql://userfrosting:userfrosting@mysql:3306/userfrosting"
echo ""
print_info "Next Steps:"
print_info "  1. Configure UserFrosting app to include CRUD6::class in getSprinkles()"
print_info "  2. Run database migrations: cd $PACKAGE_DIR && php bakery migrate"
print_info "  3. Start UserFrosting server: cd $PACKAGE_DIR && composer serve"
print_info "  4. Start theme dev server: cd $THEME_DIR && npm run dev"
echo ""
print_info "Happy full-stack coding! 🚀"