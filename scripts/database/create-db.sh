#!/bin/bash
#
# LMeve Database Creation Script
# This script creates the required databases and user for LMeve
# Must be run with sudo privileges on the database host
#
# Usage: sudo ./create-db.sh [mysql_root_password] [lmeve_user_password]
#

set -euo pipefail

# Configuration
MYSQL_ROOT_PASS="${1:-}"
LMEVE_PASS="${2:-lmpassword}"
LMEVE_USER="lmeve"
LMEVE_DB="lmeve"
SDE_DB="EveStaticData"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >&2
}

# Error handling
error_exit() {
    log "ERROR: $1"
    exit 1
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    error_exit "This script must be run as root (use sudo)"
fi

log "Starting LMeve database creation..."

# Test MySQL connectivity
log "Testing MySQL connectivity..."
if [ -n "$MYSQL_ROOT_PASS" ]; then
    MYSQL_CMD="mysql -u root -p$MYSQL_ROOT_PASS"
else
    MYSQL_CMD="mysql -u root"
fi

# Test connection
if ! $MYSQL_CMD -e "SELECT 1;" >/dev/null 2>&1; then
    error_exit "Cannot connect to MySQL. Please check if MySQL is running and credentials are correct."
fi

log "MySQL connection successful"

# Create databases
log "Creating databases..."
$MYSQL_CMD <<EOF
CREATE DATABASE IF NOT EXISTS \`$LMEVE_DB\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS \`$SDE_DB\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF

if [ $? -eq 0 ]; then
    log "Databases created successfully"
else
    error_exit "Failed to create databases"
fi

# Create user and grant permissions
log "Creating user and setting permissions..."
$MYSQL_CMD <<EOF
CREATE USER IF NOT EXISTS '$LMEVE_USER'@'%' IDENTIFIED BY '$LMEVE_PASS';
CREATE USER IF NOT EXISTS '$LMEVE_USER'@'localhost' IDENTIFIED BY '$LMEVE_PASS';

GRANT ALL PRIVILEGES ON \`$LMEVE_DB\`.* TO '$LMEVE_USER'@'%';
GRANT ALL PRIVILEGES ON \`$LMEVE_DB\`.* TO '$LMEVE_USER'@'localhost';
GRANT ALL PRIVILEGES ON \`$SDE_DB\`.* TO '$LMEVE_USER'@'%';
GRANT ALL PRIVILEGES ON \`$SDE_DB\`.* TO '$LMEVE_USER'@'localhost';

FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
    log "User created and permissions granted successfully"
else
    error_exit "Failed to create user or grant permissions"
fi

# Verify setup
log "Verifying setup..."
if ! mysql -u "$LMEVE_USER" -p"$LMEVE_PASS" -e "USE $LMEVE_DB; SELECT 1;" >/dev/null 2>&1; then
    error_exit "User verification failed for $LMEVE_DB"
fi

if ! mysql -u "$LMEVE_USER" -p"$LMEVE_PASS" -e "USE $SDE_DB; SELECT 1;" >/dev/null 2>&1; then
    error_exit "User verification failed for $SDE_DB"
fi

log "Database setup completed successfully!"
log "Created databases: $LMEVE_DB, $SDE_DB"
log "Created user: $LMEVE_USER with full access to both databases"
log "Next step: Import the LMeve schema and SDE data"

exit 0