#!/bin/bash

# Security Check Script for Codeunia
# This script performs comprehensive security checks on the codebase

set -e

echo "🔒 Starting Codeunia Security Check..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
ISSUES_FOUND=0
CRITICAL_ISSUES=0
WARNINGS=0

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            WARNINGS=$((WARNINGS + 1))
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ISSUES_FOUND=$((ISSUES_FOUND + 1))
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Function to check for potential SQL injection patterns
check_sql_injection() {
    echo -e "\n${BLUE}🔍 Checking for SQL injection patterns...${NC}"
    
    local sql_patterns=(
        "\.query\("
        "\.raw\("
        "\.exec\("
        "SELECT.*\+"
        "INSERT.*\+"
        "UPDATE.*\+"
        "DELETE.*\+"
    )
    
    local found_patterns=0
    
    for pattern in "${sql_patterns[@]}"; do
        if grep -r "$pattern" --include="*.ts" --include="*.js" app/ lib/ 2>/dev/null; then
            found_patterns=$((found_patterns + 1))
        fi
    done
    
    if [ $found_patterns -gt 0 ]; then
        print_status "WARNING" "Potential SQL injection patterns found. Please review for proper parameterization."
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    else
        print_status "SUCCESS" "No obvious SQL injection patterns found."
    fi
}

# Function to check for XSS vulnerabilities
check_xss() {
    echo -e "\n${BLUE}🔍 Checking for XSS vulnerabilities...${NC}"
    
    # Check for dangerouslySetInnerHTML without proper sanitization
    local unsafe_xss=0
    
    # Check for dangerouslySetInnerHTML without sanitization
    if grep -r "dangerouslySetInnerHTML.*__html.*[^}]" --include="*.tsx" --include="*.jsx" app/ components/ 2>/dev/null | grep -v "createSafeHtmlProps\|sanitize"; then
        unsafe_xss=$((unsafe_xss + 1))
    fi
    
    # Check for direct innerHTML usage
    if grep -r "\.innerHTML\s*=" --include="*.ts" --include="*.js" app/ lib/ 2>/dev/null; then
        unsafe_xss=$((unsafe_xss + 1))
    fi
    
    # Check for dangerous eval usage
    if grep -r "eval\(" --include="*.ts" --include="*.js" app/ lib/ 2>/dev/null; then
        unsafe_xss=$((unsafe_xss + 1))
    fi
    
    if [ $unsafe_xss -gt 0 ]; then
        print_status "WARNING" "Potential XSS vulnerabilities found. Please review for proper sanitization."
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    else
        print_status "SUCCESS" "No obvious XSS vulnerabilities found."
    fi
}

# Function to check for hardcoded secrets
check_hardcoded_secrets() {
    echo -e "\n${BLUE}🔍 Checking for hardcoded secrets...${NC}"
    
    # More specific patterns for actual hardcoded secrets
    local secret_patterns=(
        "password.*=.*['\"][a-zA-Z0-9+/=]{20,}['\"]"  # Base64-like passwords
        "secret.*=.*['\"][a-zA-Z0-9+/=]{20,}['\"]"    # Base64-like secrets
        "api_key.*=.*['\"][a-zA-Z0-9]{20,}['\"]"      # Long API keys
        "private_key.*=.*['\"][a-zA-Z0-9+/=]{50,}['\"]" # Long private keys
        "access_token.*=.*['\"][a-zA-Z0-9]{20,}['\"]"  # Access tokens
        "bearer.*=.*['\"][a-zA-Z0-9]{20,}['\"]"       # Bearer tokens
    )
    
    local found_secrets=0
    
    for pattern in "${secret_patterns[@]}"; do
        if grep -r "$pattern" --include="*.ts" --include="*.js" --exclude-dir=node_modules --exclude-dir=.git app/ lib/ 2>/dev/null | grep -v "process\.env" | grep -v "test\|mock\|example\|placeholder"; then
            found_secrets=$((found_secrets + 1))
        fi
    done
    
    if [ $found_secrets -gt 0 ]; then
        print_status "ERROR" "Potential hardcoded secrets found. Please use environment variables."
        CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
    else
        print_status "SUCCESS" "No hardcoded secrets found."
    fi
}

# Function to check for insecure dependencies
check_dependencies() {
    echo -e "\n${BLUE}🔍 Checking for insecure dependencies...${NC}"
    
    if [ -f "package.json" ]; then
        # Check for known vulnerable packages
        local vulnerable_packages=(
            "lodash"
            "moment"
            "jquery"
            "express"
            "request"
        )
        
        local found_vulnerable=0
        
        for package in "${vulnerable_packages[@]}"; do
            if grep -q "\"$package\"" package.json; then
                print_status "WARNING" "Potentially vulnerable package found: $package. Please check for updates."
                found_vulnerable=$((found_vulnerable + 1))
            fi
        done
        
        if [ $found_vulnerable -eq 0 ]; then
            print_status "SUCCESS" "No obviously vulnerable packages found."
        fi
    else
        print_status "WARNING" "package.json not found. Cannot check dependencies."
    fi
}

# Function to check for security headers
check_security_headers() {
    echo -e "\n${BLUE}🔍 Checking for security headers configuration...${NC}"
    
    if [ -f "next.config.ts" ] || [ -f "next.config.js" ]; then
        local security_headers=(
            "X-Frame-Options"
            "X-Content-Type-Options"
            "X-XSS-Protection"
            "Strict-Transport-Security"
            "Content-Security-Policy"
        )
        
        local found_headers=0
        
        for header in "${security_headers[@]}"; do
            if grep -q "$header" next.config.* 2>/dev/null; then
                found_headers=$((found_headers + 1))
            fi
        done
        
        if [ $found_headers -gt 0 ]; then
            print_status "SUCCESS" "Security headers configuration found."
        else
            print_status "WARNING" "No security headers configuration found. Consider adding security headers."
            ISSUES_FOUND=$((ISSUES_FOUND + 1))
        fi
    else
        print_status "WARNING" "Next.js config file not found. Cannot check security headers."
    fi
}

# Function to check for authentication patterns
check_authentication() {
    echo -e "\n${BLUE}🔍 Checking authentication patterns...${NC}"
    
    # Check for proper authentication middleware usage
    if grep -r "withAdminAuth\|withAuth" --include="*.ts" --include="*.js" app/api/ 2>/dev/null; then
        print_status "SUCCESS" "Authentication middleware patterns found."
    else
        print_status "WARNING" "No authentication middleware patterns found. Ensure API routes are protected."
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
    
    # Check for session management
    if grep -r "session\|jwt\|token" --include="*.ts" --include="*.js" lib/ 2>/dev/null; then
        print_status "SUCCESS" "Session/token management patterns found."
    else
        print_status "WARNING" "No session/token management patterns found."
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
}

# Function to check for rate limiting
check_rate_limiting() {
    echo -e "\n${BLUE}🔍 Checking for rate limiting...${NC}"
    
    if grep -r "rate.*limit\|throttle" --include="*.ts" --include="*.js" lib/ middleware.ts 2>/dev/null; then
        print_status "SUCCESS" "Rate limiting patterns found."
    else
        print_status "WARNING" "No rate limiting patterns found. Consider implementing rate limiting."
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
}

# Function to check for CORS configuration
check_cors() {
    echo -e "\n${BLUE}🔍 Checking CORS configuration...${NC}"
    
    if grep -r "cors\|origin" --include="*.ts" --include="*.js" next.config.* middleware.ts 2>/dev/null; then
        print_status "SUCCESS" "CORS configuration found."
    else
        print_status "WARNING" "No CORS configuration found. Consider implementing CORS policies."
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
}

# Function to check for input validation
check_input_validation() {
    echo -e "\n${BLUE}🔍 Checking for input validation...${NC}"
    
    local validation_patterns=(
        "zod\|joi\|yup\|validator"
        "validate\|sanitize"
        "trim\|escape"
    )
    
    local found_validation=0
    
    for pattern in "${validation_patterns[@]}"; do
        if grep -r "$pattern" --include="*.ts" --include="*.js" app/ lib/ 2>/dev/null; then
            found_validation=$((found_validation + 1))
        fi
    done
    
    if [ $found_validation -gt 0 ]; then
        print_status "SUCCESS" "Input validation patterns found."
    else
        print_status "WARNING" "No input validation patterns found. Consider implementing input validation."
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
}

# Function to check for logging and monitoring
check_logging() {
    echo -e "\n${BLUE}🔍 Checking for logging and monitoring...${NC}"
    
    if grep -r "console\.log\|console\.error\|logger\|audit" --include="*.ts" --include="*.js" lib/ 2>/dev/null; then
        print_status "SUCCESS" "Logging patterns found."
    else
        print_status "WARNING" "Limited logging patterns found. Consider implementing comprehensive logging."
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
}

# Main execution
main() {
    echo -e "${BLUE}Starting comprehensive security check...${NC}\n"
    
    # Run all security checks
    check_sql_injection
    check_xss
    check_hardcoded_secrets
    check_dependencies
    check_security_headers
    check_authentication
    check_rate_limiting
    check_cors
    check_input_validation
    check_logging
    
    # Summary
    echo -e "\n${BLUE}======================================"
    echo -e "🔒 Security Check Summary${NC}"
    echo -e "${BLUE}======================================${NC}"
    
    if [ $CRITICAL_ISSUES -gt 0 ]; then
        print_status "ERROR" "Critical issues found: $CRITICAL_ISSUES"
        echo -e "${RED}❌ Security check FAILED due to critical issues.${NC}"
        exit 1
    elif [ $ISSUES_FOUND -gt 0 ]; then
        print_status "WARNING" "Issues found: $ISSUES_FOUND"
        print_status "WARNING" "Warnings: $WARNINGS"
        echo -e "${YELLOW}⚠️  Security check completed with warnings.${NC}"
        exit 0
    else
        print_status "SUCCESS" "No security issues found."
        print_status "SUCCESS" "Warnings: $WARNINGS"
        echo -e "${GREEN}✅ Security check PASSED.${NC}"
        exit 0
    fi
}

# Run main function
main "$@"
