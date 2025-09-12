#!/bin/bash

# CodeUnia Load Testing Runner
# 
# This script runs comprehensive load tests using K6 and Artillery
# to simulate 1000+ concurrent users and validate performance optimizations.
#
# Usage:
#   ./scripts/run-load-tests.sh [k6|artillery|both] [target_url]
#
# Examples:
#   ./scripts/run-load-tests.sh k6 http://localhost:3000
#   ./scripts/run-load-tests.sh artillery https://codeunia.com
#   ./scripts/run-load-tests.sh both http://localhost:3000

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEST_TYPE=${1:-"both"}
TARGET_URL=${2:-"http://localhost:3000"}
RESULTS_DIR="tests/load/results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to create results directory
create_results_dir() {
    if [ ! -d "$RESULTS_DIR" ]; then
        mkdir -p "$RESULTS_DIR"
        print_status "Created results directory: $RESULTS_DIR"
    fi
}

# Function to run K6 load test
run_k6_test() {
    print_status "Starting K6 load test..."
    
    if ! command_exists k6; then
        print_error "K6 is not installed. Please install it from https://k6.io/docs/getting-started/installation/"
        return 1
    fi
    
    # Run K6 test with environment variables
    BASE_URL="$TARGET_URL" VUS=1000 DURATION="5m" k6 run \
        --out json="$RESULTS_DIR/k6-results-$TIMESTAMP.json" \
        tests/load/k6-load-test.js
    
    if [ $? -eq 0 ]; then
        print_success "K6 load test completed successfully"
        print_status "Results saved to: $RESULTS_DIR/k6-results-$TIMESTAMP.json"
    else
        print_error "K6 load test failed"
        return 1
    fi
}

# Function to run Artillery load test
run_artillery_test() {
    print_status "Starting Artillery load test..."
    
    if ! command_exists artillery; then
        print_error "Artillery is not installed. Please install it with: npm install -g artillery"
        return 1
    fi
    
    # Run Artillery test
    artillery run \
        --target "$TARGET_URL" \
        --output "$RESULTS_DIR/artillery-results-$TIMESTAMP.json" \
        tests/load/artillery-load-test.yml
    
    if [ $? -eq 0 ]; then
        print_success "Artillery load test completed successfully"
        print_status "Results saved to: $RESULTS_DIR/artillery-results-$TIMESTAMP.json"
    else
        print_error "Artillery load test failed"
        return 1
    fi
}

# Function to generate performance report
generate_report() {
    print_status "Generating performance report..."
    
    cat > "$RESULTS_DIR/load-test-report-$TIMESTAMP.md" << EOF
# CodeUnia Load Test Report

**Generated:** $(date)
**Target URL:** $TARGET_URL
**Test Type:** $TEST_TYPE

## Test Configuration

- **Virtual Users:** 1000 concurrent users
- **Duration:** 5 minutes sustained load
- **Ramp-up:** Gradual increase over 2 minutes
- **Ramp-down:** 2 minutes

## Performance Thresholds

- **Response Time (P95):** < 2000ms
- **Error Rate:** < 10%
- **Cache Hit Rate:** > 80%

## Test Scenarios

1. **Registration Flow** (30% of traffic)
   - POST /api/register
   - Expected: 201 (new) or 409 (existing)
   - Threshold: < 3000ms

2. **Login Flow** (25% of traffic)
   - POST /api/auth/signin
   - Expected: 200 (success) or 401 (failure)
   - Threshold: < 2000ms

3. **Event Fetching** (20% of traffic)
   - GET /api/events
   - GET /api/hackathons
   - GET /api/leaderboard
   - Threshold: < 1000ms

4. **API Endpoints** (15% of traffic)
   - GET /api/tests/public
   - GET /api/events/featured
   - GET /api/hackathons/featured
   - Threshold: < 1500ms

5. **Protected Routes** (10% of traffic)
   - GET /api/user/registrations
   - GET /protected/profile
   - Expected: 401 (unauthorized)
   - Threshold: < 1000ms

## Cache Performance

The load test validates:
- ✅ Cache hit rates for API endpoints
- ✅ Cache invalidation strategies
- ✅ Redis fallback to memory cache
- ✅ Cache warming effectiveness

## Results

Detailed results are available in:
- K6: \`$RESULTS_DIR/k6-results-$TIMESTAMP.json\`
- Artillery: \`$RESULTS_DIR/artillery-results-$TIMESTAMP.json\`

## Recommendations

Based on the load test results:

1. **If response times exceed thresholds:**
   - Check cache hit rates
   - Verify Redis connection
   - Monitor database query performance
   - Review API endpoint optimizations

2. **If error rates exceed 10%:**
   - Check server resources (CPU, memory)
   - Verify database connection limits
   - Review rate limiting configurations
   - Check for memory leaks

3. **If cache hit rates are below 80%:**
   - Verify cache warming is working
   - Check cache invalidation strategies
   - Review cache TTL configurations
   - Monitor cache eviction policies

EOF

    print_success "Performance report generated: $RESULTS_DIR/load-test-report-$TIMESTAMP.md"
}

# Function to validate target URL
validate_target() {
    print_status "Validating target URL: $TARGET_URL"
    
    # Check if URL is reachable
    if curl -s --head "$TARGET_URL" > /dev/null; then
        print_success "Target URL is reachable"
    else
        print_warning "Target URL may not be reachable. Continuing with tests..."
    fi
}

# Function to check system resources
check_system_resources() {
    print_status "Checking system resources..."
    
    # Check available memory
    if command_exists free; then
        MEMORY_GB=$(free -g | awk '/^Mem:/{print $7}')
        if [ "$MEMORY_GB" -lt 4 ]; then
            print_warning "Low available memory: ${MEMORY_GB}GB. Consider closing other applications."
        else
            print_success "Available memory: ${MEMORY_GB}GB"
        fi
    fi
    
    # Check CPU cores
    if command_exists nproc; then
        CPU_CORES=$(nproc)
        print_status "CPU cores available: $CPU_CORES"
    fi
}

# Main execution
main() {
    print_status "Starting CodeUnia Load Testing Suite"
    print_status "Test Type: $TEST_TYPE"
    print_status "Target URL: $TARGET_URL"
    
    # Validate inputs
    if [[ "$TEST_TYPE" != "k6" && "$TEST_TYPE" != "artillery" && "$TEST_TYPE" != "both" ]]; then
        print_error "Invalid test type. Use: k6, artillery, or both"
        exit 1
    fi
    
    # Setup
    create_results_dir
    validate_target
    check_system_resources
    
    # Run tests based on type
    case $TEST_TYPE in
        "k6")
            run_k6_test
            ;;
        "artillery")
            run_artillery_test
            ;;
        "both")
            run_k6_test
            run_artillery_test
            ;;
    esac
    
    # Generate report
    generate_report
    
    print_success "Load testing completed successfully!"
    print_status "Check the results directory for detailed reports: $RESULTS_DIR"
}

# Run main function
main "$@"
