#!/bin/bash

# Lighthouse CI Testing Script
# This script helps test Lighthouse CI locally and in CI environments

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

# Function to check if Lighthouse CI is installed
check_lighthouse_ci() {
    if ! command -v lhci &> /dev/null; then
        print_warning "Lighthouse CI is not installed globally"
        print_status "Installing Lighthouse CI..."
        npm install -g @lhci/cli@0.12.x
        print_success "Lighthouse CI installed successfully"
    else
        print_success "Lighthouse CI is already installed"
    fi
}

# Function to test local development server
test_local() {
    print_status "Testing Lighthouse CI on local development server..."
    
    # Check if local server is running
    if curl -f -s http://localhost:3000 > /dev/null; then
        print_success "Local server is running on http://localhost:3000"
    else
        print_warning "Local server is not running. Starting it..."
        print_status "Building and starting the application..."
        npm run build
        npm run start &
        SERVER_PID=$!
        
        # Wait for server to start
        print_status "Waiting for server to start..."
        for i in {1..30}; do
            if curl -f -s http://localhost:3000 > /dev/null; then
                print_success "Server is ready!"
                break
            else
                echo -n "."
                sleep 2
            fi
            
            if [ $i -eq 30 ]; then
                print_error "Server failed to start after 60 seconds"
                kill $SERVER_PID 2>/dev/null || true
                exit 1
            fi
        done
    fi
    
    # Run Lighthouse CI
    print_status "Running Lighthouse CI tests..."
    lhci autorun --config=lighthouserc.js
    
    print_success "Lighthouse CI tests completed!"
}

# Function to test with custom URL
test_custom_url() {
    local url="$1"
    
    if [ -z "$url" ]; then
        print_error "Please provide a URL to test"
        echo "Usage: $0 custom <URL>"
        exit 1
    fi
    
    print_status "Testing Lighthouse CI on custom URL: $url"
    
    # Validate URL format
    if [[ ! "$url" =~ ^https?:// ]]; then
        print_warning "URL doesn't have protocol, adding https://"
        url="https://$url"
    fi
    
    # Check if URL is reachable
    if curl -f -s --max-time 10 "$url" > /dev/null; then
        print_success "URL is reachable: $url"
    else
        print_error "URL is not reachable: $url"
        exit 1
    fi
    
    # Create temporary config
    cat > lighthouserc-temp.js << EOF
module.exports = {
  ci: {
    collect: {
      url: ['$url'],
      numberOfRuns: 1,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --disable-gpu',
        preset: 'desktop'
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.6 }],
        'categories:accessibility': ['warn', { minScore: 0.7 }],
        'categories:best-practices': ['warn', { minScore: 0.7 }],
        'categories:seo': ['warn', { minScore: 0.7 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
EOF
    
    # Run Lighthouse CI
    print_status "Running Lighthouse CI tests..."
    lhci autorun --config=lighthouserc-temp.js
    
    # Clean up
    rm -f lighthouserc-temp.js
    
    print_success "Lighthouse CI tests completed!"
}

# Function to show help
show_help() {
    echo "Lighthouse CI Testing Script"
    echo ""
    echo "Usage: $0 [OPTION] [URL]"
    echo ""
    echo "Options:"
    echo "  local       Test local development server (http://localhost:3000)"
    echo "  custom URL  Test a custom URL"
    echo "  install     Install Lighthouse CI globally"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 local                    # Test local server"
    echo "  $0 custom https://example.com # Test custom URL"
    echo "  $0 install                  # Install Lighthouse CI"
}

# Main script logic
case "${1:-help}" in
    "local")
        check_lighthouse_ci
        test_local
        ;;
    "custom")
        check_lighthouse_ci
        test_custom_url "$2"
        ;;
    "install")
        check_lighthouse_ci
        ;;
    "help"|*)
        show_help
        ;;
esac
