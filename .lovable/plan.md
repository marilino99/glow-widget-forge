

# Wix App Market Integration Plan

## Overview
Build a native Wix App that enables one-click installation of your widget from the Wix App Market. When users install the app, it automatically injects your widget script into their Wix site - no manual code copying needed.

## How It Works

```text
User installs from Wix App Market
           │
           ▼
┌──────────────────────────────┐
│  Wix redirects to your      │
│  OAuth endpoint             │
└──────────────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  User authorizes permissions │
│  (Manage Scripts, Read Site) │
└──────────────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Exchange code for tokens    │
│  Store in database          │
└──────────────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Auto-inject widget script   │
│  via Wix Embedded Scripts API│
└──────────────────────────────┘
```

## Prerequisites (Manual Steps Required)

Before implementation, you need to:

1. **Create Wix Developer Account** at https://dev.wix.com
2. **Create a new Wix App** in the Dev Center:
   - Choose "Website App" type
   - Add "Embedded Scripts" extension
   - Configure OAuth redirect URL to your edge function
3. **Obtain credentials**: App ID and App Secret Key
4. **Prepare legal pages**: Privacy Policy and Terms of Service URLs

## Technical Implementation

### 1. Database Schema

Create a `wix_installations` table to track connected Wix sites:

```sql
CREATE TABLE wix_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wix_instance_id TEXT UNIQUE NOT NULL,
  wix_site_id TEXT,
  wix_refresh_token TEXT NOT NULL,
  widget_config_id UUID REFERENCES widget_configurations(id),
  script_injected BOOLEAN DEFAULT false,
  installed_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies for security
ALTER TABLE wix_installations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own installations"
  ON wix_installations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own installations"
  ON wix_installations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
```

### 2. Edge Functions

#### `wix-oauth/index.ts`
Handles the OAuth callback from Wix:
- Receives authorization code from Wix redirect
- Exchanges code for access and refresh tokens
- Stores tokens in `wix_installations` table
- Redirects user to Widjet dashboard to link their widget

#### `wix-install-webhook/index.ts`
Listens for `APP_INSTALLED` webhook:
- Verifies webhook signature
- Calls Wix Embedded Scripts API to inject the widget loader script
- Updates `script_injected` status in database

#### `wix-uninstall-webhook/index.ts`
Listens for `APP_REMOVED` webhook:
- Cleans up the installation record from database
- (Script is automatically removed by Wix when app is uninstalled)

### 3. Wix API Integration

The Embedded Scripts API endpoint:
```
POST https://www.wixapis.com/apps/v1/scripts
Authorization: Bearer {access_token}

{
  "script": {
    "content": "<script>window.__wj={widgetId:'{{WIDGET_ID}}'};...</script>",
    "placement": "BODY_END",
    "enabled": true
  }
}
```

### 4. Configuration Updates

Add to `supabase/config.toml`:
```toml
[functions.wix-oauth]
verify_jwt = false

[functions.wix-install-webhook]
verify_jwt = false

[functions.wix-uninstall-webhook]
verify_jwt = false
```

### 5. Secrets Required

The following secrets need to be added:
- `WIX_APP_ID` - Your Wix App ID from Dev Center
- `WIX_APP_SECRET` - Your Wix App Secret Key

### 6. UI Updates

Update `AddToWebsiteDialog.tsx` to:
- Show "Connect with Wix" button when Wix integration is available
- Link to the Wix OAuth flow for new installations
- Display connected Wix sites for existing users

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/wix-oauth/index.ts` | OAuth callback handler |
| `supabase/functions/wix-install-webhook/index.ts` | APP_INSTALLED webhook |
| `supabase/functions/wix-uninstall-webhook/index.ts` | APP_REMOVED webhook |

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/config.toml` | Add function configs |
| `src/components/builder/AddToWebsiteDialog.tsx` | Add "Connect with Wix" button |

## Implementation Timeline

1. **Phase 1**: Create Wix App in Dev Center and configure OAuth (manual)
2. **Phase 2**: Database migration for `wix_installations` table
3. **Phase 3**: Implement OAuth edge function
4. **Phase 4**: Implement webhook edge functions
5. **Phase 5**: Update UI with "Connect with Wix" flow
6. **Phase 6**: Test end-to-end and submit app for review

## Next Steps

To proceed, you'll need to:
1. Create a Wix Developer account
2. Create the Wix App and get your App ID and Secret
3. Share those credentials so I can implement the edge functions

