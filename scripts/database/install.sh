#!/bin/bash
#
# LMeve Database Setup Installation Script
# This script installs the database operation scripts on the DB host
# Run this on your database server to set up remote operations
#

set -euo pipefail

SCRIPT_DIR="/usr/local/lmeve"
SUDOERS_FILE="/etc/sudoers.d/lmeve_ops"
OPS_USER="${1:-opsuser}"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Error handling
error_exit() {
    log "ERROR: $1"
    exit 1
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    error_exit "This script must be run as root"
fi

log "Installing LMeve database operation scripts..."
log "Operations user: $OPS_USER"

# Create the scripts directory
log "Creating scripts directory..."
mkdir -p "$SCRIPT_DIR"

# Check if we're in the right location (should contain the scripts)
if [ ! -f "create-db.sh" ] || [ ! -f "import-sde.sh" ] || [ ! -f "import-schema.sh" ]; then
    error_exit "Database scripts not found in current directory. Please run this from the scripts/database directory."
fi

# Copy scripts
log "Installing scripts..."
cp create-db.sh "$SCRIPT_DIR/"
cp import-sde.sh "$SCRIPT_DIR/"
cp import-schema.sh "$SCRIPT_DIR/"

# Set proper permissions
log "Setting script permissions..."
chmod 700 "$SCRIPT_DIR"/*.sh
chown root:root "$SCRIPT_DIR"/*.sh

# Install sudoers configuration
log "Installing sudoers configuration..."
if [ -f "lmeve_ops_sudoers" ]; then
    # Replace opsuser with the actual username in the sudoers file
    sed "s/opsuser/$OPS_USER/g" lmeve_ops_sudoers > "$SUDOERS_FILE"
    chmod 440 "$SUDOERS_FILE"
    chown root:root "$SUDOERS_FILE"
    
    # Verify sudoers syntax
    if ! visudo -c -f "$SUDOERS_FILE"; then
        error_exit "Sudoers file syntax error. Installation aborted."
    fi
else
    error_exit "Sudoers template file not found"
fi

# Create operations user if it doesn't exist
if ! id "$OPS_USER" &>/dev/null; then
    log "Creating operations user: $OPS_USER"
    useradd -r -s /bin/bash -d "/home/$OPS_USER" -m "$OPS_USER"
    
    # Create SSH directory
    mkdir -p "/home/$OPS_USER/.ssh"
    chmod 700 "/home/$OPS_USER/.ssh"
    chown "$OPS_USER:$OPS_USER" "/home/$OPS_USER/.ssh"
    
    log "User $OPS_USER created. You'll need to add the public key to /home/$OPS_USER/.ssh/authorized_keys"
else
    log "User $OPS_USER already exists"
fi

# Test the installation
log "Testing installation..."
if sudo -u "$OPS_USER" sudo -l | grep -q "/usr/local/lmeve/create-db.sh"; then
    log "Sudoers configuration verified"
else
    error_exit "Sudoers configuration test failed"
fi

log "Installation completed successfully!"
log ""
log "Next steps:"
log "1. Copy the web application's SSH public key to /home/$OPS_USER/.ssh/authorized_keys"
log "2. Test SSH connection from web application: ssh -i ~/.ssh/lmeve_ops $OPS_USER@this-host"
log "3. Test script execution: ssh -i ~/.ssh/lmeve_ops $OPS_USER@this-host sudo /usr/local/lmeve/create-db.sh"
log ""
log "Available scripts:"
log "- $SCRIPT_DIR/create-db.sh"
log "- $SCRIPT_DIR/import-sde.sh" 
log "- $SCRIPT_DIR/import-schema.sh"

exit 0