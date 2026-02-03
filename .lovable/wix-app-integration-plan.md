# Wix App Market Integration Plan

## Overview
Create a native Wix App that allows one-click installation of Widjet from the Wix App Market.

## Prerequisites
1. **Wix Developer Account** - Register at https://dev.wix.com
2. **Business Website** - Required for app submission
3. **Privacy Policy & Terms of Service** - Required for app listing

## Technical Requirements

### 1. Create Wix App
- Go to Wix Dev Center → Create New App
- Choose "Website App" type
- Configure OAuth permissions:
  - `WIX_DEVELOPERS.MANAGE_WIDGETS` - To inject widget code
  - `WIX_DEVELOPERS.READ_SITES` - To read site info

### 2. OAuth Flow
```
User clicks "Add to Site" 
  → Wix redirects to your OAuth endpoint
  → User authorizes permissions
  → Wix sends auth code
  → Exchange for access token
  → Store token with user's Widjet ID
```

### 3. Required Endpoints (Edge Functions)

#### `wix-oauth/index.ts`
- Handle OAuth callback from Wix
- Exchange auth code for tokens
- Store Wix instance ID → Widjet config mapping

#### `wix-install-webhook/index.ts`
- Listen for `APP_INSTALLED` webhook
- Auto-inject widget code into user's Wix site via Wix APIs

#### `wix-uninstall-webhook/index.ts`
- Listen for `APP_UNINSTALLED` webhook
- Clean up widget code from site

### 4. Database Schema Addition
```sql
CREATE TABLE wix_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  wix_instance_id TEXT UNIQUE NOT NULL,
  wix_refresh_token TEXT,
  widget_config_id UUID REFERENCES widget_configurations(id),
  installed_at TIMESTAMP DEFAULT now()
);
```

### 5. Wix App Dashboard Widget
Build a settings panel that appears in Wix dashboard:
- Link existing Widjet account
- Or create new Widjet account
- Configure which widget to display

## Timeline Estimate
- Week 1: OAuth + webhook endpoints
- Week 2: Dashboard widget UI
- Week 3: Testing & submission
- Week 4: Review & approval

## Resources
- Wix Dev Docs: https://dev.wix.com/docs
- OAuth Guide: https://dev.wix.com/docs/build-apps/build-your-app/authentication/oauth
- Webhooks: https://dev.wix.com/docs/build-apps/build-your-app/app-webhooks
