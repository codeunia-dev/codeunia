# Supabase Disaster Recovery System

A complete backup and restore solution for Supabase databases, enabling full recovery within minutes in case of project pausing, locking, or deletion.

## 🎯 Features

This system provides comprehensive backup of:

- ✅ All tables, indexes, constraints, and relations
- ✅ All RLS (Row Level Security) policies
- ✅ All SQL functions
- ✅ All triggers
- ✅ All extensions currently enabled
- ✅ Full data backup (binary dump)
- ✅ Optional seed data export

## 📁 Directory Structure

```
.
├── backup.sh                    # Backup script
├── restore.sh                   # Restore script
├── .github/workflows/
│   └── backup.yml              # GitHub Actions workflow
└── supabase_snapshot/          # Backup files directory
    ├── schema.sql              # Database schema
    ├── policies.sql            # RLS policies
    ├── functions.sql           # SQL functions
    ├── triggers.sql            # Database triggers
    ├── extensions.sql          # Enabled extensions
    ├── complete_backup.dump    # Full binary backup
    ├── seed_data.sql           # Seed data (optional)
    └── backup_info.txt         # Backup metadata
```

## 🚀 Quick Start

### Prerequisites

1. **PostgreSQL Client Tools**: Install `psql`, `pg_dump`, and `pg_restore`
   ```bash
   # macOS
   brew install postgresql
   
   # Ubuntu/Debian
   sudo apt-get install postgresql-client
   
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Supabase Connection String**: Get your database URL from Supabase project settings
   - Go to Project Settings → Database
   - Copy the connection string (URI format)
   - Format: `postgresql://postgres:[password]@[host]:[port]/postgres`

### Manual Backup

```bash
# Set your Supabase database URL
export SUPABASE_DB_URL="postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres"

# Run backup
./backup.sh
```

The backup will be saved in the `supabase_snapshot/` directory.

### Manual Restore

```bash
# Set your NEW Supabase database URL
export SUPABASE_DB_URL="postgresql://postgres:new-password@db.yyy.supabase.co:5432/postgres"

# Run restore
./restore.sh
```

**⚠️ IMPORTANT**: Only run restore on a **NEW/EMPTY** Supabase project to avoid conflicts.

## 🤖 Automated Backups with GitHub Actions

### Setup

1. **Add GitHub Secret**:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `SUPABASE_DB_URL`
   - Value: Your Supabase connection string

2. **Enable Workflow**:
   - The workflow is automatically enabled when you commit `.github/workflows/backup.yml`
   - It runs daily at 02:00 IST (20:30 UTC)

### Manual Trigger

You can manually trigger a backup:
1. Go to Actions tab in your GitHub repository
2. Select "Supabase Disaster Recovery Backup"
3. Click "Run workflow"

### Accessing Backups

Backups are stored as GitHub Actions artifacts:
1. Go to Actions tab
2. Click on a completed workflow run
3. Download the artifact (valid for 30 days)

### 🔒 Encrypted Backups (Public Repositories)

**For security**, backups are encrypted with AES256 before being uploaded as artifacts. This protects sensitive user data in public repositories.

#### Downloading Encrypted Backups

1. Go to **Actions** tab in your repository
2. Click on a completed workflow run
3. Scroll to **Artifacts** section
4. Download `supabase-backup-encrypted-XXX`
5. You'll get a file named `supabase_snapshot.tar.gz.gpg`

#### Decrypting Backups

**Prerequisites**: Install GPG (GnuPG)
```bash
# macOS
brew install gnupg

# Ubuntu/Debian
sudo apt-get install gnupg

# Windows
# Download from https://www.gnupg.org/download/
```

**Decryption Steps**:

```bash
# 1. Navigate to the directory with the encrypted file
cd ~/Downloads

# 2. Decrypt the backup (will prompt for password)
gpg --decrypt supabase_snapshot.tar.gz.gpg > supabase_snapshot.tar.gz

# Enter the BACKUP_ENCRYPTION_KEY when prompted

# 3. Extract the archive
tar -xzf supabase_snapshot.tar.gz

# 4. You now have the supabase_snapshot/ directory with all backup files
cd supabase_snapshot/
ls -lh
```

**Files inside the decrypted backup**:
- `extensions.sql` - Database extensions
- `schema.sql` - Complete database schema
- `policies.sql` - RLS policies
- `functions.sql` - Custom SQL functions
- `triggers.sql` - Database triggers
- `complete_backup.dump` - Full binary backup with all data
- `backup_info.txt` - Backup metadata

#### Restoring from Encrypted Backup

After decrypting:

```bash
# 1. Set your NEW Supabase database URL
export SUPABASE_DB_URL="postgresql://postgres:password@db.xxx.supabase.co:6543/postgres"

# 2. Restore extensions first
psql "$SUPABASE_DB_URL" -f extensions.sql

# 3. Restore schema
psql "$SUPABASE_DB_URL" -f schema.sql

# 4. Restore full data using pg_restore
pg_restore --dbname="$SUPABASE_DB_URL" \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  complete_backup.dump

# 5. Restore RLS policies
psql "$SUPABASE_DB_URL" -f policies.sql

# 6. Restore functions
psql "$SUPABASE_DB_URL" -f functions.sql

# 7. Restore triggers
psql "$SUPABASE_DB_URL" -f triggers.sql
```

**Or use the restore script** (if available in the backup):
```bash
cd supabase_snapshot/
export SUPABASE_DB_URL="your-new-connection-string"
./restore.sh
```

#### Security Notes

- 🔑 **Keep your encryption key safe!** Store `BACKUP_ENCRYPTION_KEY` in a password manager
- 🔒 **Without the key, backups cannot be decrypted** - there's no recovery method
- 👥 **Share the key** with trusted team members who may need to restore
- 🔄 **Rotate keys periodically** and update the GitHub secret

#### Why Encryption?

Since this repository is public, anyone can view workflow runs and download artifacts. Encryption ensures:
- ✅ User data remains private
- ✅ Passwords (even hashed) are protected
- ✅ Compliance with data protection regulations
- ✅ Peace of mind for your users

## 📝 Configuration

### Customizing Seed Data Export

Edit `backup.sh` and modify the `SEED_TABLES` array:

```bash
# Example: Export specific tables as seed data
SEED_TABLES=("users" "roles" "settings" "categories")
```

### Excluding Schemas

By default, the following Supabase internal schemas are excluded:
- `storage`
- `auth`
- `realtime`
- `supabase_functions`

To modify exclusions, edit the `--exclude-schema` flags in `backup.sh`.

## 🔧 Troubleshooting

### Connection Issues

**Problem**: Cannot connect to database

**Solution**:
- Verify your connection string is correct
- Ensure your IP is allowed in Supabase (Database Settings → Network Restrictions)
- Check if the database is paused (unpause it in Supabase dashboard)

### Permission Errors

**Problem**: Permission denied errors during restore

**Solution**:
- Ensure you're using the `postgres` user (included in Supabase connection string)
- Verify the target database is empty/new

### Large Backup Files

**Problem**: Binary dump is very large

**Solution**:
- The binary dump uses custom format with compression
- For very large databases, consider:
  - Increasing GitHub Actions artifact retention
  - Using external storage (S3, etc.) for binary dumps
  - Running backups less frequently

### Restore Warnings

**Problem**: Warnings during restore about existing objects

**Solution**:
- These are usually safe to ignore if restoring to a new project
- The scripts are designed to handle common warnings
- Check the final verification step to ensure data was restored

## 🔐 Security Best Practices

1. **Never commit database credentials** to your repository
2. **Use GitHub Secrets** for storing `SUPABASE_DB_URL`
3. **Rotate passwords** periodically and update the secret
4. **Limit artifact retention** to necessary duration (default: 30 days)
5. **Review access** to your repository (who can download artifacts)

## 📊 What Gets Backed Up

### Included
- Public schema tables and data
- Custom schemas (if any)
- All indexes and constraints
- Foreign key relationships
- RLS policies
- Custom functions and procedures
- Triggers
- Extensions (uuid-ossp, pgcrypto, etc.)

### Excluded
- Supabase internal schemas (auth, storage, realtime)
- System catalogs
- Temporary tables
- Ownership and privilege information (restored as postgres user)

## 🆘 Disaster Recovery Procedure

If your Supabase project becomes unavailable:

1. **Create a new Supabase project**
   - Go to https://supabase.com
   - Create a new project
   - Wait for it to initialize

2. **Get the new connection string**
   - Project Settings → Database
   - Copy the connection string

3. **Download your latest backup**
   - From GitHub Actions artifacts, or
   - From your local `supabase_snapshot/` directory

4. **Run the restore script**
   ```bash
   export SUPABASE_DB_URL="your-new-connection-string"
   ./restore.sh
   ```

5. **Update your application**
   - Update environment variables with new Supabase URL
   - Update API keys if needed
   - Test your application

**Estimated recovery time**: 5-15 minutes (depending on database size)

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Backup Documentation](https://www.postgresql.org/docs/current/backup.html)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🤝 Contributing

Feel free to customize these scripts for your specific needs. Common modifications:
- Adjust backup schedule in `.github/workflows/backup.yml`
- Add custom validation steps
- Integrate with external storage services
- Add notification systems (email, Slack, etc.)

## 📄 License

This disaster recovery system is provided as-is for use with your Supabase projects.

---

**Last Updated**: 2025-11-24
