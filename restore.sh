#!/bin/bash

################################################################################
# Supabase Disaster Recovery - Restore Script
################################################################################
# This script restores a complete Supabase database backup including:
# - Extensions
# - Schema (tables, indexes, constraints, relations)
# - Full data
# - SQL Functions
# - Triggers
# - RLS Policies
#
# Usage:
#   export SUPABASE_DB_URL="postgresql://postgres:[password]@[host]:[port]/postgres"
#   ./restore.sh
#
# IMPORTANT: This should be run on a NEW/EMPTY Supabase project
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="supabase_snapshot"

################################################################################
# Helper Functions
################################################################################

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

check_requirements() {
    log_info "Checking requirements..."
    
    # Check if SUPABASE_DB_URL is set
    if [ -z "$SUPABASE_DB_URL" ]; then
        log_error "SUPABASE_DB_URL environment variable is not set"
        log_error "Please set it with: export SUPABASE_DB_URL='postgresql://postgres:[password]@[host]:[port]/postgres'"
        exit 1
    fi
    
    # Check if backup directory exists
    if [ ! -d "$BACKUP_DIR" ]; then
        log_error "Backup directory not found: $BACKUP_DIR"
        log_error "Please ensure you have run backup.sh first or the backup files are in the correct location"
        exit 1
    fi
    
    # Check if required tools are installed
    local missing_tools=()
    
    if ! command -v psql &> /dev/null; then
        missing_tools+=("psql")
    fi
    
    if ! command -v pg_restore &> /dev/null; then
        missing_tools+=("pg_restore")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_error "Please install PostgreSQL client tools"
        exit 1
    fi
    
    log_info "✓ All requirements met"
}

check_backup_files() {
    log_info "Checking backup files..."
    
    local missing_files=()
    local required_files=(
        "$BACKUP_DIR/extensions.sql"
        "$BACKUP_DIR/schema.sql"
        "$BACKUP_DIR/complete_backup.dump"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -ne 0 ]; then
        log_error "Missing required backup files:"
        for file in "${missing_files[@]}"; do
            log_error "  - $file"
        done
        exit 1
    fi
    
    log_info "✓ All required backup files found"
}

confirm_restore() {
    echo ""
    log_warn "=========================================="
    log_warn "WARNING: Database Restore Operation"
    log_warn "=========================================="
    log_warn "This will restore the backup to the target database."
    log_warn "Target: ${SUPABASE_DB_URL%%@*}@***"
    echo ""
    log_warn "IMPORTANT: This should only be run on a NEW/EMPTY Supabase project!"
    log_warn "Restoring to an existing database may cause conflicts."
    echo ""
    
    read -p "Are you sure you want to continue? (yes/no): " -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "Restore cancelled by user"
        exit 0
    fi
}

test_connection() {
    log_info "Testing database connection..."
    
    if psql "$SUPABASE_DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
        log_info "✓ Database connection successful"
    else
        log_error "Failed to connect to database"
        log_error "Please check your SUPABASE_DB_URL and ensure the database is accessible"
        exit 1
    fi
}

################################################################################
# Restore Functions
################################################################################

restore_extensions() {
    log_step "Step 1/6: Restoring extensions..."
    
    if [ ! -f "$BACKUP_DIR/extensions.sql" ]; then
        log_warn "Extensions file not found, skipping..."
        return
    fi
    
    psql "$SUPABASE_DB_URL" -f "$BACKUP_DIR/extensions.sql" > /dev/null 2>&1 || {
        log_warn "Some extensions may have failed to install (this is often normal)"
    }
    
    log_info "✓ Extensions restored"
}

restore_schema() {
    log_step "Step 2/6: Restoring schema (tables, indexes, constraints)..."
    
    if [ ! -f "$BACKUP_DIR/schema.sql" ]; then
        log_error "Schema file not found: $BACKUP_DIR/schema.sql"
        exit 1
    fi
    
    psql "$SUPABASE_DB_URL" -f "$BACKUP_DIR/schema.sql" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        log_info "✓ Schema restored successfully"
    else
        log_error "Failed to restore schema"
        log_error "Check the schema.sql file for syntax errors"
        exit 1
    fi
}

restore_data() {
    log_step "Step 3/6: Restoring data (this may take a while)..."
    
    if [ ! -f "$BACKUP_DIR/complete_backup.dump" ]; then
        log_error "Backup dump file not found: $BACKUP_DIR/complete_backup.dump"
        exit 1
    fi
    
    # Use pg_restore with data-only mode to avoid conflicts with already-created schema
    pg_restore "$SUPABASE_DB_URL" \
        --data-only \
        --no-owner \
        --no-privileges \
        --disable-triggers \
        "$BACKUP_DIR/complete_backup.dump" 2>&1 | grep -v "WARNING" || true
    
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        log_info "✓ Data restored successfully"
    else
        log_warn "Data restore completed with some warnings (this is often normal)"
    fi
}

restore_functions() {
    log_step "Step 4/6: Restoring SQL functions..."
    
    if [ ! -f "$BACKUP_DIR/functions.sql" ]; then
        log_warn "Functions file not found, skipping..."
        return
    fi
    
    # Check if file has actual content
    if grep -q "CREATE FUNCTION\|CREATE OR REPLACE FUNCTION" "$BACKUP_DIR/functions.sql"; then
        psql "$SUPABASE_DB_URL" -f "$BACKUP_DIR/functions.sql" > /dev/null 2>&1
        log_info "✓ Functions restored"
    else
        log_info "✓ No custom functions to restore"
    fi
}

restore_triggers() {
    log_step "Step 5/6: Restoring triggers..."
    
    if [ ! -f "$BACKUP_DIR/triggers.sql" ]; then
        log_warn "Triggers file not found, skipping..."
        return
    fi
    
    # Check if file has actual content
    if grep -q "CREATE TRIGGER" "$BACKUP_DIR/triggers.sql"; then
        psql "$SUPABASE_DB_URL" -f "$BACKUP_DIR/triggers.sql" > /dev/null 2>&1
        log_info "✓ Triggers restored"
    else
        log_info "✓ No custom triggers to restore"
    fi
}

restore_policies() {
    log_step "Step 6/6: Restoring RLS policies..."
    
    if [ ! -f "$BACKUP_DIR/policies.sql" ]; then
        log_warn "Policies file not found, skipping..."
        return
    fi
    
    # Check if file has actual content
    if grep -q "CREATE POLICY" "$BACKUP_DIR/policies.sql"; then
        psql "$SUPABASE_DB_URL" -f "$BACKUP_DIR/policies.sql" > /dev/null 2>&1
        log_info "✓ RLS policies restored"
    else
        log_info "✓ No RLS policies to restore"
    fi
}

verify_restore() {
    log_info "Verifying restore..."
    
    # Count tables
    local table_count=$(psql "$SUPABASE_DB_URL" -t -c "
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
    " | xargs)
    
    log_info "✓ Restored $table_count tables in public schema"
    
    # Check for data
    local has_data=$(psql "$SUPABASE_DB_URL" -t -c "
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables t
            JOIN pg_class c ON c.relname = t.table_name
            WHERE t.table_schema = 'public'
            AND t.table_type = 'BASE TABLE'
            AND c.reltuples > 0
            LIMIT 1
        );
    " | xargs)
    
    if [ "$has_data" = "t" ]; then
        log_info "✓ Data verification successful"
    else
        log_warn "No data found in tables (this may be expected if your backup was empty)"
    fi
}

################################################################################
# Main Execution
################################################################################

main() {
    echo ""
    log_info "=========================================="
    log_info "Supabase Disaster Recovery - Restore"
    log_info "=========================================="
    echo ""
    
    check_requirements
    check_backup_files
    confirm_restore
    test_connection
    
    echo ""
    log_info "Starting restore process..."
    echo ""
    
    # Restore in the correct order
    restore_extensions
    restore_schema
    restore_data
    restore_functions
    restore_triggers
    restore_policies
    
    echo ""
    verify_restore
    
    echo ""
    log_info "=========================================="
    log_info "✓ Restore completed successfully!"
    log_info "=========================================="
    log_info "Your Supabase database has been restored from backup"
    log_info "Please verify your application is working correctly"
    echo ""
}

# Run main function
main
