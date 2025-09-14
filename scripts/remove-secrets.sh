#!/bin/bash

# Script to remove secrets from git history
# This script helps clean up accidentally committed secrets

set -e

echo "🔒 CodeUnia Secret Removal Script"
echo "=================================="
echo ""

# Check if git filter-repo is installed
if ! command -v git-filter-repo &> /dev/null; then
    echo "❌ git-filter-repo is not installed."
    echo "Please install it first:"
    echo "  pip install git-filter-repo"
    echo "  or"
    echo "  brew install git-filter-repo"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Check if we're on main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" = "main" ]; then
    echo "⚠️  WARNING: You are on the main branch!"
    echo "This script will rewrite git history. Make sure you have backups."
    echo ""
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

echo "🔍 Scanning for potential secrets..."
echo ""

# Common secret patterns to look for
SECRET_PATTERNS=(
    "sk-[a-zA-Z0-9]{20,}"  # OpenAI API keys
    "pk_[a-zA-Z0-9]{20,}"  # Stripe public keys
    "sk_[a-zA-Z0-9]{20,}"  # Stripe secret keys
    "AKIA[0-9A-Z]{16}"     # AWS access keys
    "ya29\.[a-zA-Z0-9_-]+" # Google OAuth tokens
    "AIza[0-9A-Za-z_-]{35}" # Google API keys
    "ghp_[a-zA-Z0-9]{36}"  # GitHub personal access tokens
    "gho_[a-zA-Z0-9]{36}"  # GitHub OAuth tokens
    "ghu_[a-zA-Z0-9]{36}"  # GitHub user tokens
    "ghs_[a-zA-Z0-9]{36}"  # GitHub server tokens
    "ghr_[a-zA-Z0-9]{36}"  # GitHub refresh tokens
    "xoxb-[0-9]{11}-[0-9]{11}-[a-zA-Z0-9]{24}" # Slack bot tokens
    "xoxp-[0-9]{11}-[0-9]{11}-[a-zA-Z0-9]{24}" # Slack user tokens
    "xoxa-[0-9]{11}-[0-9]{11}-[a-zA-Z0-9]{24}" # Slack app tokens
    "xoxr-[0-9]{11}-[0-9]{11}-[a-zA-Z0-9]{24}" # Slack refresh tokens
    "xoxs-[0-9]{11}-[0-9]{11}-[a-zA-Z0-9]{24}" # Slack socket tokens
)

# Function to scan for secrets
scan_for_secrets() {
    local found_secrets=false
    
    for pattern in "${SECRET_PATTERNS[@]}"; do
        echo "Checking pattern: $pattern"
        
        # Search in git history
        if git log --all --full-history --grep="$pattern" --oneline | head -1 | grep -q .; then
            echo "  ⚠️  Found in commit messages"
            found_secrets=true
        fi
        
        # Search in file contents
        if git log --all --full-history -S "$pattern" --oneline | head -1 | grep -q .; then
            echo "  ⚠️  Found in file contents"
            found_secrets=true
        fi
    done
    
    if [ "$found_secrets" = false ]; then
        echo "✅ No obvious secrets found in git history"
    fi
}

# Function to remove specific secrets
remove_secrets() {
    echo ""
    echo "🗑️  Removing secrets from git history..."
    echo ""
    
    # Create a backup branch first
    backup_branch="backup-before-secret-removal-$(date +%Y%m%d-%H%M%S)"
    echo "Creating backup branch: $backup_branch"
    git branch "$backup_branch"
    
    # Remove secrets using git-filter-repo
    echo "Running git-filter-repo to remove secrets..."
    
    # Create a file with patterns to remove
    cat > /tmp/secret_patterns.txt << EOF
# Common secret patterns
sk-[a-zA-Z0-9]{20,}
pk_[a-zA-Z0-9]{20,}
sk_[a-zA-Z0-9]{20,}
AKIA[0-9A-Z]{16}
ya29\.[a-zA-Z0-9_-]+
AIza[0-9A-Za-z_-]{35}
ghp_[a-zA-Z0-9]{36}
gho_[a-zA-Z0-9]{36}
ghu_[a-zA-Z0-9]{36}
ghs_[a-zA-Z0-9]{36}
ghr_[a-zA-Z0-9]{36}
xoxb-[0-9]{11}-[0-9]{11}-[a-zA-Z0-9]{24}
xoxp-[0-9]{11}-[0-9]{11}-[a-zA-Z0-9]{24}
xoxa-[0-9]{11}-[0-9]{11}-[a-zA-Z0-9]{24}
xoxr-[0-9]{11}-[0-9]{11}-[a-zA-Z0-9]{24}
xoxs-[0-9]{11}-[0-9]{11}-[a-zA-Z0-9]{24}
EOF
    
    # Use git-filter-repo to remove secrets
    git filter-repo --replace-text /tmp/secret_patterns.txt --force
    
    # Clean up
    rm -f /tmp/secret_patterns.txt
    
    echo "✅ Secrets removed from git history"
    echo ""
    echo "⚠️  IMPORTANT NEXT STEPS:"
    echo "1. Rotate/revoke the exposed secrets in their respective services"
    echo "2. Update your environment variables with new secrets"
    echo "3. Force push to remote repository (this will rewrite history):"
    echo "   git push --force-with-lease origin $current_branch"
    echo "4. Notify team members to re-clone the repository"
    echo ""
    echo "Backup branch created: $backup_branch"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --scan-only    Only scan for secrets, don't remove them"
    echo "  --remove       Remove secrets from git history"
    echo "  --help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --scan-only    # Scan for secrets without removing"
    echo "  $0 --remove       # Remove secrets from git history"
}

# Main script logic
case "${1:-}" in
    --scan-only)
        scan_for_secrets
        ;;
    --remove)
        scan_for_secrets
        echo ""
        read -p "Do you want to proceed with removing secrets? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            remove_secrets
        else
            echo "Aborted."
        fi
        ;;
    --help)
        show_usage
        ;;
    "")
        echo "No action specified. Use --help for usage information."
        echo ""
        scan_for_secrets
        ;;
    *)
        echo "Unknown option: $1"
        show_usage
        exit 1
        ;;
esac

echo ""
echo "🔒 Secret removal script completed"
