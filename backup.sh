#!/bin/bash

################################################################################
# Supabase Disaster Recovery - Backup Script
################################################################################
# This script creates a complete backup of your Supabase database including:
# - Schema (tables, indexes, constraints, relations)
# - RLS Policies
# - SQL Functions
# - Triggers
# - Extensions
# - Full binary data dump
# - Optional seed data
#
# Usage:
#   export SUPABASE_DB_URL="postgresql://postgres:[password]@[host]:[port]/postgres"
#   ./backup.sh
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="supabase_snapshot"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Optional: Define tables to include in seed data export
# Example: SEED_TABLES=("users" "roles" "settings")
SEED_TABLES=()

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

check_requirements() {
    log_info "Checking requirements..."
    
    # Check if SUPABASE_DB_URL is set
    if [ -z "$SUPABASE_DB_URL" ]; then
        log_error "SUPABASE_DB_URL environment variable is not set"
        log_error "Please set it with: export SUPABASE_DB_URL='postgresql://postgres:[password]@[host]:[port]/postgres'"
        exit 1
    fi
    
    # Check if required tools are installed
    local missing_tools=()
    
    if ! command -v psql &> /dev/null; then
        missing_tools+=("psql")
    fi
    
    if ! command -v pg_dump &> /dev/null; then
        missing_tools+=("pg_dump")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_error "Please install PostgreSQL client tools"
        exit 1
    fi
    
    log_info "✓ All requirements met"
}

create_backup_directory() {
    log_info "Creating backup directory..."
    mkdir -p "$BACKUP_DIR"
    log_info "✓ Backup directory ready: $BACKUP_DIR"
}

################################################################################
# Backup Functions
################################################################################

backup_extensions() {
    log_info "Exporting extensions..."
    
    psql "$SUPABASE_DB_URL" -t -c "
        SELECT 'CREATE EXTENSION IF NOT EXISTS \"' || extname || '\";'
        FROM pg_extension
        WHERE extname NOT IN ('plpgsql')
        ORDER BY extname;
    " > "$BACKUP_DIR/extensions.sql"
    
    if [ $? -eq 0 ]; then
        log_info "✓ Extensions exported to $BACKUP_DIR/extensions.sql"
    else
        log_error "Failed to export extensions"
        exit 1
    fi
}

backup_schema() {
    log_info "Exporting schema (tables, indexes, constraints, relations)..."
    
    pg_dump "$SUPABASE_DB_URL" \
        --schema-only \
        --no-owner \
        --no-privileges \
        --exclude-schema=storage \
        --exclude-schema=auth \
        --exclude-schema=realtime \
        --exclude-schema=supabase_functions \
        --file="$BACKUP_DIR/schema.sql"
    
    if [ $? -eq 0 ]; then
        log_info "✓ Schema exported to $BACKUP_DIR/schema.sql"
    else
        log_error "Failed to export schema"
        exit 1
    fi
}

backup_policies() {
    log_info "Exporting RLS policies..."
    
    psql "$SUPABASE_DB_URL" -t -c "
        SELECT 
            'CREATE POLICY ' || quote_ident(pol.polname) || 
            ' ON ' || quote_ident(n.nspname) || '.' || quote_ident(c.relname) ||
            CASE 
                WHEN pol.polpermissive THEN ' AS PERMISSIVE'
                ELSE ' AS RESTRICTIVE'
            END ||
            ' FOR ' || 
            CASE pol.polcmd
                WHEN 'r' THEN 'SELECT'
                WHEN 'a' THEN 'INSERT'
                WHEN 'w' THEN 'UPDATE'
                WHEN 'd' THEN 'DELETE'
                WHEN '*' THEN 'ALL'
            END ||
            ' TO ' || 
            CASE 
                WHEN pol.polroles = '{0}' THEN 'PUBLIC'
                ELSE array_to_string(ARRAY(
                    SELECT rolname FROM pg_roles WHERE oid = ANY(pol.polroles)
                ), ', ')
            END ||
            CASE WHEN pol.polqual IS NOT NULL 
                THEN ' USING (' || pg_get_expr(pol.polqual, pol.polrelid) || ')'
                ELSE ''
            END ||
            CASE WHEN pol.polwithcheck IS NOT NULL 
                THEN ' WITH CHECK (' || pg_get_expr(pol.polwithcheck, pol.polrelid) || ')'
                ELSE ''
            END || ';'
        FROM pg_policy pol
        JOIN pg_class c ON pol.polrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname NOT IN ('pg_catalog', 'information_schema', 'auth', 'storage', 'realtime', 'supabase_functions')
        ORDER BY n.nspname, c.relname, pol.polname;
    " > "$BACKUP_DIR/policies.sql"
    
    if [ $? -eq 0 ]; then
        log_info "✓ RLS policies exported to $BACKUP_DIR/policies.sql"
    else
        log_error "Failed to export RLS policies"
        exit 1
    fi
}

backup_functions() {
    log_info "Exporting SQL functions..."
    
    pg_dump "$SUPABASE_DB_URL" \
        --schema-only \
        --no-owner \
        --no-privileges \
        --exclude-schema=storage \
        --exclude-schema=auth \
        --exclude-schema=realtime \
        --exclude-schema=supabase_functions \
        --section=pre-data \
        --section=post-data \
        | grep -A 1000 "CREATE FUNCTION\|CREATE OR REPLACE FUNCTION" \
        > "$BACKUP_DIR/functions.sql"
    
    # If no functions found, create empty file
    if [ ! -s "$BACKUP_DIR/functions.sql" ]; then
        echo "-- No custom functions found" > "$BACKUP_DIR/functions.sql"
    fi
    
    log_info "✓ Functions exported to $BACKUP_DIR/functions.sql"
}

backup_triggers() {
    log_info "Exporting triggers..."
    
    psql "$SUPABASE_DB_URL" -t -c "
        SELECT pg_get_triggerdef(oid) || ';'
        FROM pg_trigger
        WHERE tgisinternal = false
        AND tgrelid IN (
            SELECT oid FROM pg_class 
            WHERE relnamespace IN (
                SELECT oid FROM pg_namespace 
                WHERE nspname NOT IN ('pg_catalog', 'information_schema', 'auth', 'storage', 'realtime', 'supabase_functions')
            )
        )
        ORDER BY tgname;
    " > "$BACKUP_DIR/triggers.sql"
    
    # If no triggers found, create empty file
    if [ ! -s "$BACKUP_DIR/triggers.sql" ]; then
        echo "-- No custom triggers found" > "$BACKUP_DIR/triggers.sql"
    fi
    
    log_info "✓ Triggers exported to $BACKUP_DIR/triggers.sql"
}

backup_full_data() {
    log_info "Creating full binary backup (this may take a while)..."
    
    pg_dump "$SUPABASE_DB_URL" \
        --format=custom \
        --no-owner \
        --no-privileges \
        --exclude-schema=storage \
        --exclude-schema=auth \
        --exclude-schema=realtime \
        --exclude-schema=supabase_functions \
        --file="$BACKUP_DIR/complete_backup.dump"
    
    if [ $? -eq 0 ]; then
        local size=$(du -h "$BACKUP_DIR/complete_backup.dump" | cut -f1)
        log_info "✓ Full backup created: $BACKUP_DIR/complete_backup.dump ($size)"
    else
        log_error "Failed to create full backup"
        exit 1
    fi
}

backup_seed_data() {
    if [ ${#SEED_TABLES[@]} -eq 0 ]; then
        log_warn "No seed tables configured, skipping seed data export"
        echo "-- No seed tables configured" > "$BACKUP_DIR/seed_data.sql"
        return
    fi
    
    log_info "Exporting seed data for tables: ${SEED_TABLES[*]}..."
    
    local table_args=""
    for table in "${SEED_TABLES[@]}"; do
        table_args="$table_args --table=$table"
    done
    
    pg_dump "$SUPABASE_DB_URL" \
        --data-only \
        --no-owner \
        --no-privileges \
        --column-inserts \
        $table_args \
        --file="$BACKUP_DIR/seed_data.sql"
    
    if [ $? -eq 0 ]; then
        log_info "✓ Seed data exported to $BACKUP_DIR/seed_data.sql"
    else
        log_error "Failed to export seed data"
        exit 1
    fi
}

create_backup_metadata() {
    log_info "Creating backup metadata..."
    
    cat > "$BACKUP_DIR/backup_info.txt" << EOF
Supabase Backup Information
===========================
Backup Date: $(date)
Timestamp: $TIMESTAMP

Database Connection: ${SUPABASE_DB_URL%%@*}@***

Files Generated:
- extensions.sql    : Database extensions
- schema.sql        : Complete schema (tables, indexes, constraints)
- policies.sql      : Row Level Security policies
- functions.sql     : Custom SQL functions
- triggers.sql      : Database triggers
- complete_backup.dump : Full binary backup with all data
- seed_data.sql     : Seed data (if configured)

Restore Instructions:
1. Create a new Supabase project
2. Get the connection string from project settings
3. Run: export SUPABASE_DB_URL="your-new-connection-string"
4. Run: ./restore.sh

For more information, see README.md
EOF
    
    log_info "✓ Backup metadata created"
}

################################################################################
# Main Execution
################################################################################

main() {
    echo ""
    log_info "=========================================="
    log_info "Supabase Disaster Recovery - Backup"
    log_info "=========================================="
    echo ""
    
    check_requirements
    create_backup_directory
    
    echo ""
    log_info "Starting backup process..."
    echo ""
    
    backup_extensions
    backup_schema
    backup_policies
    backup_functions
    backup_triggers
    backup_full_data
    backup_seed_data
    create_backup_metadata
    
    echo ""
    log_info "=========================================="
    log_info "✓ Backup completed successfully!"
    log_info "=========================================="
    log_info "Backup location: $BACKUP_DIR"
    log_info "To restore, run: ./restore.sh"
    echo ""
}

# Run main function
main
