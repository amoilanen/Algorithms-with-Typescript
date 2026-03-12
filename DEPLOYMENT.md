# Deploying to Google Cloud

This guide covers deploying the *Algorithms with TypeScript* website to Google Cloud as a static site with a custom domain, HTTPS, and CDN.

## Overview

The deployment uses:

- **Google Cloud Storage (GCS)** to host the static files
- **Cloud Load Balancer** with a managed SSL certificate for HTTPS
- **Cloud CDN** for caching and fast global delivery
- **Cloud DNS** (optional) for domain management

## Prerequisites

1. A Google Cloud account with billing enabled
2. The [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) (`gcloud`) installed and authenticated
3. A registered domain name
4. The website built locally (`npm run build:web`)

## Step 1: Create a Google Cloud project

```bash
# Create a new project (or use an existing one)
gcloud projects create algorithms-book --name="Algorithms Book"
gcloud config set project algorithms-book

# Enable required APIs
gcloud services enable compute.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable dns.googleapis.com
```

## Step 2: Create a Cloud Storage bucket

The bucket name must be globally unique. If you plan to use a custom domain, name the bucket after your domain:

```bash
BUCKET_NAME="your-domain.com"

# Create the bucket
gsutil mb -l us-central1 gs://$BUCKET_NAME

# Enable static website hosting
gsutil web set -m index.html -e 404.html gs://$BUCKET_NAME

# Make the bucket publicly readable
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
```

## Step 3: Upload the website

```bash
# Build the website
npm run build:web

# Deploy using the project's deploy script
GCS_BUCKET=gs://$BUCKET_NAME npm run deploy
```

The deploy script (`scripts/deploy.sh`) uses `gsutil rsync` with appropriate cache headers:
- HTML files: 5-minute cache for fast updates
- Static assets (JS, CSS, fonts, images): 1-year cache

At this point, the site is accessible at:
```
https://storage.googleapis.com/$BUCKET_NAME/index.html
```

## Step 4: Set up a custom domain with HTTPS

For a custom domain with HTTPS, you need a Cloud Load Balancer with a managed SSL certificate.

### Reserve a static IP address

```bash
gcloud compute addresses create algorithms-book-ip \
  --global \
  --ip-version=IPV4

# Note the IP address
gcloud compute addresses describe algorithms-book-ip --global --format="get(address)"
```

### Create a backend bucket

```bash
gcloud compute backend-buckets create algorithms-book-backend \
  --gcs-bucket-name=$BUCKET_NAME \
  --enable-cdn
```

### Create a URL map

```bash
gcloud compute url-maps create algorithms-book-url-map \
  --default-backend-bucket=algorithms-book-backend
```

### Create a managed SSL certificate

```bash
DOMAIN="your-domain.com"

gcloud compute ssl-certificates create algorithms-book-cert \
  --domains=$DOMAIN \
  --global
```

### Create the HTTPS proxy and forwarding rule

```bash
gcloud compute target-https-proxies create algorithms-book-https-proxy \
  --ssl-certificates=algorithms-book-cert \
  --url-map=algorithms-book-url-map

gcloud compute forwarding-rules create algorithms-book-https-rule \
  --global \
  --target-https-proxy=algorithms-book-https-proxy \
  --address=algorithms-book-ip \
  --ports=443
```

### (Optional) Redirect HTTP to HTTPS

```bash
gcloud compute url-maps import algorithms-book-http-redirect --global --source=- <<'EOF'
kind: compute#urlMap
name: algorithms-book-http-redirect
defaultUrlRedirect:
  httpsRedirect: true
  redirectResponseCode: MOVED_PERMANENTLY_DEFAULT
EOF

gcloud compute target-http-proxies create algorithms-book-http-proxy \
  --url-map=algorithms-book-http-redirect

gcloud compute forwarding-rules create algorithms-book-http-rule \
  --global \
  --target-http-proxy=algorithms-book-http-proxy \
  --address=algorithms-book-ip \
  --ports=80
```

## Step 5: Configure DNS

Point your domain to the static IP address. You can use Cloud DNS or any DNS provider.

### Using Cloud DNS

```bash
# Create a managed zone
gcloud dns managed-zones create algorithms-book-zone \
  --dns-name="$DOMAIN." \
  --description="Algorithms book DNS zone"

# Add an A record pointing to the load balancer IP
IP_ADDRESS=$(gcloud compute addresses describe algorithms-book-ip --global --format="get(address)")

gcloud dns record-sets create "$DOMAIN." \
  --zone=algorithms-book-zone \
  --type=A \
  --ttl=300 \
  --rrdatas=$IP_ADDRESS
```

### Using an external DNS provider

Create an A record in your DNS provider's dashboard:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | (your static IP) | 300 |

## Step 6: Verify

After DNS propagation (which can take up to 48 hours, but usually completes within minutes):

1. The managed SSL certificate will automatically provision once Google verifies DNS ownership
2. Check certificate status: `gcloud compute ssl-certificates describe algorithms-book-cert --global`
3. Visit `https://your-domain.com` to confirm the site loads with HTTPS

## Subsequent deployments

After the initial setup, updating the site requires only:

```bash
npm run build:web
GCS_BUCKET=gs://$BUCKET_NAME npm run deploy
```

Cloud CDN caches are invalidated automatically for HTML files (short cache TTL). For immediate full invalidation:

```bash
gcloud compute url-maps invalidate-cdn-cache algorithms-book-url-map --path="/*"
```

## Cost estimate

For a low-traffic static site, the monthly cost is minimal:

- Cloud Storage: < $1/month for hosting the static files
- Load Balancer: ~$18/month (minimum forwarding rule charge)
- Cloud CDN: ~$1/month for low traffic
- Managed SSL certificate: free
- Cloud DNS: ~$0.20/month per zone

The load balancer is the dominant cost. For a lower-cost alternative, you can skip the load balancer and serve directly from the GCS bucket URL without a custom domain or HTTPS (see Step 3).

## Cleanup

To remove all resources:

```bash
gcloud compute forwarding-rules delete algorithms-book-https-rule --global -q
gcloud compute forwarding-rules delete algorithms-book-http-rule --global -q
gcloud compute target-https-proxies delete algorithms-book-https-proxy -q
gcloud compute target-http-proxies delete algorithms-book-http-proxy -q
gcloud compute url-maps delete algorithms-book-url-map -q
gcloud compute url-maps delete algorithms-book-http-redirect -q
gcloud compute ssl-certificates delete algorithms-book-cert --global -q
gcloud compute backend-buckets delete algorithms-book-backend -q
gcloud compute addresses delete algorithms-book-ip --global -q
gcloud dns managed-zones delete algorithms-book-zone -q
gsutil rm -r gs://$BUCKET_NAME
```
