#!/bin/bash

# Setup Vercel Configuration Script
# This script helps set up the .vercel/project.json file for CI/CD deployments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to setup Vercel configuration
setup_vercel_config() {
    print_status "Setting up Vercel configuration..."
    
    # Check if required environment variables are set
    if [ -z "$VERCEL_ORG_ID" ] || [ -z "$VERCEL_PROJECT_ID" ]; then
        print_error "VERCEL_ORG_ID and VERCEL_PROJECT_ID environment variables are required"
        print_status "Please set these variables:"
        echo "  export VERCEL_ORG_ID=your_org_id"
        echo "  export VERCEL_PROJECT_ID=your_project_id"
        exit 1
    fi
    
    # Validate format of IDs
    if [[ ! "$VERCEL_ORG_ID" =~ ^team_ ]]; then
        print_warning "VERCEL_ORG_ID should start with 'team_' (current: $VERCEL_ORG_ID)"
    fi
    
    if [[ ! "$VERCEL_PROJECT_ID" =~ ^prj_ ]]; then
        print_warning "VERCEL_PROJECT_ID should start with 'prj_' (current: $VERCEL_PROJECT_ID)"
    fi
    
    # Create .vercel directory if it doesn't exist
    mkdir -p .vercel
    
    # Create project.json with actual values
    cat > .vercel/project.json << EOF
{
  "orgId": "$VERCEL_ORG_ID",
  "projectId": "$VERCEL_PROJECT_ID"
}
EOF
    
    # Verify the file was created correctly
    if [ ! -f ".vercel/project.json" ]; then
        print_error "Failed to create .vercel/project.json"
        exit 1
    fi
    
    print_success "Vercel configuration created successfully!"
    print_status "Configuration file: .vercel/project.json"
    print_status "Org ID: $VERCEL_ORG_ID"
    print_status "Project ID: $VERCEL_PROJECT_ID"
    
    # Display the created configuration
    print_status "Configuration content:"
    cat .vercel/project.json
}

# Function to validate Vercel CLI installation
validate_vercel_cli() {
    print_status "Validating Vercel CLI installation..."
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel@latest
    fi
    
    print_status "Vercel CLI version:"
    vercel --version
    
    print_success "Vercel CLI validation completed!"
}

# Function to test Vercel authentication
test_vercel_auth() {
    print_status "Testing Vercel authentication..."
    
    if [ -z "$VERCEL_TOKEN" ]; then
        print_warning "VERCEL_TOKEN not set. Authentication test skipped."
        return
    fi
    
    vercel whoami --token "$VERCEL_TOKEN"
    print_success "Vercel authentication test completed!"
}

# Main execution
main() {
    print_status "Starting Vercel configuration setup..."
    
    validate_vercel_cli
    test_vercel_auth
    setup_vercel_config
    
    print_success "Vercel configuration setup completed!"
    print_status "You can now run deployment commands without deprecated flags."
}

# Run main function
main "$@"
