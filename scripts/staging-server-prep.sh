#!/usr/bin/env bash
# Phase 1: Prepare a fresh Ubuntu VPS for School ERP staging.
# Run as root or with sudo on the server.
set -euo pipefail

echo "==> School ERP staging — VPS preparation"
echo "    Target: school.raipursolutions.com"

if [[ $EUID -ne 0 ]]; then
  echo "Run with sudo: sudo $0"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

echo "==> Updating packages..."
apt-get update -qq
apt-get upgrade -y -qq

echo "==> Installing prerequisites..."
apt-get install -y -qq ca-certificates curl git ufw

echo "==> Installing Docker..."
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi

echo "==> Enabling Docker..."
systemctl enable docker
systemctl start docker

echo "==> Configuring firewall (UFW)..."
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

DEPLOY_USER="${DEPLOY_USER:-deploy}"
if ! id "$DEPLOY_USER" &>/dev/null; then
  echo "==> Creating deploy user: $DEPLOY_USER"
  useradd -m -s /bin/bash "$DEPLOY_USER"
  usermod -aG docker "$DEPLOY_USER"
  mkdir -p "/home/$DEPLOY_USER/.ssh"
  chmod 700 "/home/$DEPLOY_USER/.ssh"
  chown -R "$DEPLOY_USER:$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
  echo "    Add your SSH public key to /home/$DEPLOY_USER/.ssh/authorized_keys"
else
  usermod -aG docker "$DEPLOY_USER" 2>/dev/null || true
fi

APP_PATH="${APP_PATH:-/opt/school-erp}"
mkdir -p "$APP_PATH"
chown "$DEPLOY_USER:$DEPLOY_USER" "$APP_PATH"

echo ""
echo "==> VPS prep complete."
echo ""
echo "Next steps (as $DEPLOY_USER):"
echo "  1. DNS A record: school.raipursolutions.com -> $(curl -s ifconfig.me 2>/dev/null || echo '<server-ip>')"
echo "  2. Clone: git clone https://github.com/Raipursolution123/sch.git $APP_PATH"
echo "  3. GHCR:  echo <PAT> | docker login ghcr.io -u <github-user> --password-stdin"
echo "  4. Env:   cp .env.staging.example .env && nano .env"
echo "  5. Boot:  ./scripts/staging-bootstrap.sh"
echo ""
