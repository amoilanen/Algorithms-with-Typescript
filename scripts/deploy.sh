#!/usr/bin/env bash
#
# Deploy the static website to a Google Cloud Storage bucket.
#
# Prerequisites:
#   - gcloud CLI authenticated (https://cloud.google.com/sdk/docs/install)
#   - gsutil available
#   - A GCS bucket configured for static website hosting
#
# Environment variables:
#   GCS_BUCKET  - The GCS bucket name (e.g., gs://your-bucket-name)
#
# Usage:
#   GCS_BUCKET=gs://your-algorithms-book npm run deploy
#   # or directly:
#   GCS_BUCKET=gs://your-algorithms-book bash scripts/deploy.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WEB_DIR="$PROJECT_ROOT/dist/web"

if [ -z "${GCS_BUCKET:-}" ]; then
  echo "Error: GCS_BUCKET environment variable is not set."
  echo ""
  echo "Usage:"
  echo "  GCS_BUCKET=gs://your-bucket-name npm run deploy"
  echo ""
  echo "Setup instructions:"
  echo "  1. Create a GCS bucket:"
  echo "     gsutil mb -l us-central1 gs://your-bucket-name"
  echo ""
  echo "  2. Enable static website hosting:"
  echo "     gsutil web set -m index.html -e 404.html gs://your-bucket-name"
  echo ""
  echo "  3. Make the bucket public:"
  echo "     gsutil iam ch allUsers:objectViewer gs://your-bucket-name"
  echo ""
  echo "  4. (Optional) Set up a load balancer with SSL for a custom domain."
  echo "     See DEPLOYMENT.md for detailed instructions."
  exit 1
fi

if ! command -v gsutil &>/dev/null; then
  echo "Error: 'gsutil' is not installed."
  echo "Install the Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

if [ ! -d "$WEB_DIR" ]; then
  echo "Error: Web build not found at $WEB_DIR"
  echo "Run 'npm run build:web' first."
  exit 1
fi

echo "Deploying to $GCS_BUCKET..."

# Sync files with appropriate cache headers
# HTML files: short cache (5 minutes) for fast updates
gsutil -m -h "Cache-Control:public, max-age=300" \
  rsync -r -x '.*\.(js|css|woff2?|png|jpg|svg)$' \
  "$WEB_DIR" "$GCS_BUCKET"

# Static assets: long cache (1 year) since they're fingerprinted
gsutil -m -h "Cache-Control:public, max-age=31536000, immutable" \
  rsync -r -x '.*\.html$' \
  "$WEB_DIR" "$GCS_BUCKET"

echo ""
echo "Deployment complete."
echo "If using a custom domain, the site will be available at your configured URL."
echo "If using default GCS hosting: https://storage.googleapis.com/${GCS_BUCKET#gs://}/index.html"
