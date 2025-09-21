#!/bin/bash

# Theme CRUD6 Development Setup Script
# This script sets up the theme development environment

set -e  # Exit on any error

echo "🎨 Setting up Theme CRUD6 development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

print_step "Verifying Node.js and npm installations..."
node --version
npm --version

print_step "Installing theme dependencies..."
npm install

print_step "Verifying TypeScript configuration..."
if [ -f "tsconfig.json" ]; then
    npx tsc --noEmit
    print_info "✅ TypeScript configuration is valid"
else
    print_info "⚠️  No TypeScript configuration found"
fi

print_step "Validating Vue components..."
if [ -d "src/components" ]; then
    # Count Vue components
    COMPONENT_COUNT=$(find src/components -name "*.vue" | wc -l)
    print_info "✅ Found $COMPONENT_COUNT Vue components"
fi

print_step "Checking theme integration..."
if [ -f "src/index.ts" ]; then
    print_info "✅ Theme entry point found"
else
    print_error "❌ Theme entry point (src/index.ts) not found"
fi

print_step "Setting up development scripts..."
if ! npm run --silent 2>/dev/null | grep -q "dev"; then
    print_info "Adding development script to package.json..."
    npm pkg set scripts.dev="vite dev --host"
    npm pkg set scripts.build="vite build"
    npm pkg set scripts.preview="vite preview"
    npm pkg set scripts.test="vitest"
    npm pkg set scripts.test:coverage="vitest --coverage"
fi

print_step "Validating Vite configuration..."
if [ -f "vite.config.ts" ]; then
    print_info "✅ Vite configuration found"
else
    print_error "❌ Vite configuration not found"
fi

print_step "Setup completed successfully! 🎉"
echo ""
print_info "Development Environment Summary:"
print_info "  🟢 Node.js version: $(node --version)"
print_info "  📦 npm version: $(npm --version)"
print_info "  📁 Working directory: $(pwd)"
print_info "  🎨 Theme: Theme CRUD6"
echo ""
print_info "Available commands:"
print_info "  📦 Install dependencies: npm install"
print_info "  🚀 Start dev server: npm run dev"
print_info "  🔨 Build theme: npm run build"
print_info "  🧪 Run tests: npm run test"
print_info "  📊 Test coverage: npm run test:coverage"
echo ""
print_info "Development server will be available at:"
print_info "  🌐 Local: http://localhost:5173"
print_info "  🌐 Network: http://0.0.0.0:5173"
echo ""
print_info "Happy coding! 🚀"