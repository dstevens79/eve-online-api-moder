# LMeve Remote Database Operations Setup

This directory contains scripts and configuration for setting up secure remote database operations for LMeve.

## Overview

These scripts allow the LMeve web application to safely perform privileged database operations on a remote database server without requiring root access or storing sensitive credentials.

## Architecture

```
Web Application Server          Database Server
┌─────────────────────────┐    ┌─────────────────────────┐
│  LMeve Web App          │    │  MySQL Database         │
│  ├─ API Endpoint        │    │  ├─ lmeve DB            │
│  ├─ SSH Private Key     │━━━━│  ├─ EveStaticData DB    │
│  └─ Task Bridge         │    │  └─ Scripts Directory   │
└─────────────────────────┘    │     ├─ create-db.sh     │
                               │     ├─ import-sde.sh    │
                               │     ├─ import-schema.sh  │
                               │     └─ opsuser account   │
                               └─────────────────────────┘
```

## Files

### Database Server Scripts (`/usr/local/lmeve/`)

- **`create-db.sh`** - Creates the `lmeve` and `EveStaticData` databases and sets up the `lmeve` MySQL user
- **`import-sde.sh`** - Imports EVE Static Data Export SQL dump into the `EveStaticData` database
- **`import-schema.sh`** - Imports LMeve application schema into the `lmeve` database
- **`install.sh`** - Installs all scripts and configures the database server
- **`lmeve_ops_sudoers`** - Sudoers configuration template

### Web Application Files

These will be integrated into your existing LMeve web application:

- API endpoint for handling remote database tasks
- SSH key management for secure connections
- UI integration in Settings > Database tab

## Installation

### 1. Database Server Setup

On your database server, run as root:

```bash
# Copy scripts to database server
scp -r scripts/database/ root@db-server:/tmp/

# On the database server
cd /tmp/database/
chmod +x install.sh
sudo ./install.sh [opsuser]
```

This will:
- Install scripts to `/usr/local/lmeve/`
- Create the `opsuser` account (or use provided username)
- Configure sudoers to allow script execution
- Set proper permissions

### 2. SSH Key Setup

On your web application server:

```bash
# Generate SSH keypair for database operations
ssh-keygen -t ed25519 -f ~/.ssh/lmeve_ops -C "lmeve database operations"

# Copy public key to database server
ssh-copy-id -i ~/.ssh/lmeve_ops.pub opsuser@db-server
```

### 3. Test Connection

Verify the setup works:

```bash
# Test SSH connection
ssh -i ~/.ssh/lmeve_ops opsuser@db-server

# Test script execution
ssh -i ~/.ssh/lmeve_ops opsuser@db-server sudo /usr/local/lmeve/create-db.sh
```

## Security Features

- **Privilege Isolation**: Scripts run as root but can only be executed via sudo by `opsuser`
- **Command Restriction**: Sudoers only allows specific whitelisted scripts
- **No Shell Access**: `opsuser` cannot gain shell access or run arbitrary commands
- **Key-based Auth**: SSH uses key authentication, no passwords
- **Audit Trail**: All operations are logged with timestamps

## Usage

Once installed, the LMeve web application can perform database operations by:

1. User clicks "Create Databases" in Settings > Database
2. Web app sends request to `/api/database/task` endpoint
3. Backend validates request and maps to appropriate script
4. SSH connection executes script on database server
5. Results streamed back to user interface
6. User sees real-time progress and completion status

## Script Details

### create-db.sh
- Creates `lmeve` and `EveStaticData` databases
- Creates `lmeve` MySQL user with proper permissions
- Validates setup and connectivity
- Idempotent (safe to re-run)

### import-sde.sh
- Handles multiple archive formats (.sql, .tar.bz2, .tar.gz)
- Clears existing SDE data before import
- Shows progress for large files
- Validates import completion

### import-schema.sh
- Imports LMeve application schema
- Validates table creation
- Tests user access permissions
- Prepares application for use

## Troubleshooting

### Permission Denied
```bash
# Check script permissions
ls -la /usr/local/lmeve/
# Should show: -rwx------ root root

# Test sudoers configuration
sudo -u opsuser sudo -l
# Should list the allowed scripts
```

### SSH Connection Issues
```bash
# Test SSH key
ssh -i ~/.ssh/lmeve_ops -v opsuser@db-server

# Check authorized_keys
sudo cat /home/opsuser/.ssh/authorized_keys
```

### MySQL Connection Problems
```bash
# Test MySQL access
mysql -u root -p -e "SELECT 1;"

# Check MySQL is running
systemctl status mysql
```

## Maintenance

- Scripts are owned by root and cannot be modified without root access
- SSH keys should be rotated periodically
- Monitor logs for unauthorized access attempts
- Keep sudoers configuration minimal and specific

## Integration with LMeve

The web application integrates these scripts through:
- Settings > Database tab UI components
- Backend API endpoints in `/api/database/`
- Real-time progress streaming
- Error handling and user feedback
- Configuration management for SSH keys and hostnames