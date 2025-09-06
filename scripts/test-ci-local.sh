#!/bin/bash

# Local CI/CD Testing Script
# This script allows you to test individual parts of your CI/CD pipeline locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to run security checks
run_security_checks() {
    print_status "Running security checks..."
    
    # Install dependencies
    npm ci
    
    # Run ESLint
    print_status "Running ESLint..."
    npm run lint
    
    # Run TypeScript check
    print_status "Running TypeScript check..."
    npx tsc --noEmit
    
    # Security audit
    print_status "Running security audit..."
    npm audit --audit-level=moderate
    
    print_success "Security checks completed!"
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Install dependencies
    npm ci
    
    # Run tests
    print_status "Running test suite..."
    npm run test:ci
    
    print_success "Tests completed!"
}

# Function to run build
run_build() {
    print_status "Running build..."
    
    # Install dependencies
    npm ci
    
    # Build application
    print_status "Building application..."
    NODE_ENV=production npm run build
    
    # Analyze bundle size
    print_status "Analyzing bundle size..."
    npm run build:analyze
    
    print_success "Build completed!"
}

# Function to test Vercel deployment commands
test_vercel_commands() {
    print_status "Testing Vercel CLI commands..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel@latest
    fi
    
    # Test Vercel CLI version
    print_status "Vercel CLI version:"
    vercel --version
    
    # Test direct deployment with environment variables
    print_status "Testing Vercel direct deployment with environment variables..."
    echo "export VERCEL_ORG_ID=\$VERCEL_ORG_ID"
    echo "export VERCEL_PROJECT_ID=\$VERCEL_PROJECT_ID"
    echo "vercel --token \$VERCEL_TOKEN --yes"
    echo "vercel --prod --token \$VERCEL_TOKEN --yes"
    
    print_success "Vercel command testing completed!"
}

# Function to run with act (GitHub Actions simulation)
run_with_act() {
    print_status "Running GitHub Actions simulation with act..."
    
    # Check if act is installed
    if ! command -v act &> /dev/null; then
        print_error "act is not installed. Please install it with: brew install act"
        exit 1
    fi
    
    # List available workflows
    print_status "Available workflows:"
    act --list
    
    # Run specific job (you can modify this)
    print_status "Running security job..."
    act -j security --secret-file .secrets --dry-run
    
    print_success "Act simulation completed!"
}

# Function to show help
show_help() {
    echo "Local CI/CD Testing Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  security    Run security checks (lint, typescript, audit)"
    echo "  test        Run test suite"
    echo "  build       Run build process"
    echo "  vercel      Test Vercel CLI commands"
    echo "  act         Run GitHub Actions simulation with act"
    echo "  all         Run all checks (security, test, build, vercel)"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 security    # Run only security checks"
    echo "  $0 all         # Run all checks"
    echo "  $0 act         # Simulate GitHub Actions"
}

# Main script logic
case "${1:-help}" in
    "security")
        run_security_checks
        ;;
    "test")
        run_tests
        ;;
    "build")
        run_build
        ;;
    "vercel")
        test_vercel_commands
        ;;
    "act")
        run_with_act
        ;;
    "all")
        print_status "Running all CI/CD checks..."
        run_security_checks
        run_tests
        run_build
        test_vercel_commands
        print_success "All checks completed!"
        ;;
    "help"|*)
        show_help
        ;;
esac
