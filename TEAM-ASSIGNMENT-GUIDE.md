# Team Member Assignment Guide

## Overview
This guide explains how to assign team members to clients and display them in the dashboard to build trust.

## Database Structure

### Tables
1. **team_members** - Store team member information
2. **client_team_assignments** - Many-to-many relationship between clients and team members

## Setup Instructions

### Step 1: Run Migration
Run the migration file in Supabase SQL Editor:
```
supabase/migrations/create_team_members.sql
```

URL: https://supabase.com/dashboard/project/tupedninjtaarmdwppgy/sql

### Step 2: Verify Team Members
Team members are already inserted:
- **Sam** - Google Ads Specialist
- **Quan** - SEO & Local SEO Expert
- **Thiên** - SEO & Local SEO Expert
- **Trieu** - Strategic Developer
- **An** - Google Ads Specialist

Check with:
```sql
SELECT * FROM team_members;
```

### Step 3: Assign Team Members to Clients

Example: Assign Sam to handle Google Ads for Dr DiGrado:

```sql
INSERT INTO client_team_assignments (client_id, team_member_id, service_type, is_primary, notes)
SELECT
  c.id,
  tm.id,
  'google_ads',
  true,
  'Primary Google Ads specialist managing all PPC campaigns'
FROM clients c
CROSS JOIN team_members tm
WHERE c.slug = 'dr-digrado' AND tm.name = 'Sam';
```

Example: Assign Quan to handle SEO:

```sql
INSERT INTO client_team_assignments (client_id, team_member_id, service_type, is_primary, notes)
SELECT
  c.id,
  tm.id,
  'seo',
  true,
  'Lead SEO specialist handling technical SEO and local search'
FROM clients c
CROSS JOIN team_members tm
WHERE c.slug = 'dr-digrado' AND tm.name = 'Quan';
```

Example: Assign Thiên to handle Local SEO:

```sql
INSERT INTO client_team_assignments (client_id, team_member_id, service_type, is_primary)
SELECT
  c.id,
  tm.id,
  'local_seo',
  true
FROM clients c
CROSS JOIN team_members tm
WHERE c.slug = 'dr-digrado' AND tm.name = 'Thiên';
```

### Step 4: View Assignments

Check assignments for a specific client:

```sql
SELECT
  c.name AS client_name,
  tm.name AS team_member,
  tm.role,
  cta.service_type,
  cta.is_primary,
  cta.notes
FROM client_team_assignments cta
JOIN clients c ON cta.client_id = c.id
JOIN team_members tm ON cta.team_member_id = tm.id
WHERE c.slug = 'dr-digrado'
ORDER BY cta.service_type;
```

## Service Types

Available service types for assignment:
- `google_ads` - Google Ads campaigns
- `seo` - Search Engine Optimization
- `local_seo` - Local SEO / Google Business Profile
- `strategy` - Strategic planning and consulting
- `development` - Technical development
- `analytics` - Analytics setup and reporting
- `content` - Content creation
- `social_media` - Social media management

## Bulk Assignment Example

Assign team members to all active clients:

```sql
-- Assign Sam to all clients with Google Ads
INSERT INTO client_team_assignments (client_id, team_member_id, service_type, is_primary)
SELECT
  c.id,
  tm.id,
  'google_ads',
  true
FROM clients c
CROSS JOIN team_members tm
JOIN service_configs sc ON c.id = sc.client_id
WHERE c.is_active = true
  AND tm.name = 'Sam'
  AND sc.gads_customer_id IS NOT NULL
  AND sc.gads_customer_id != ''
ON CONFLICT DO NOTHING;

-- Assign Quan to all clients with SEO
INSERT INTO client_team_assignments (client_id, team_member_id, service_type, is_primary)
SELECT
  c.id,
  tm.id,
  'seo',
  true
FROM clients c
CROSS JOIN team_members tm
JOIN service_configs sc ON c.id = sc.client_id
WHERE c.is_active = true
  AND tm.name = 'Quan'
  AND sc.gsc_site_url IS NOT NULL
  AND sc.gsc_site_url != ''
ON CONFLICT DO NOTHING;
```

## Dashboard Display

Team members will be displayed in the client dashboard header showing:
- Team member name
- Role/specialty
- Service they're handling
- Avatar (optional)

This builds trust by showing clients exactly who is working on their account.

## API Endpoint

The dashboard will fetch team assignments via:
```
GET /api/client-dashboard?clientId=dr-digrado
```

Response will include:
```json
{
  "teamMembers": [
    {
      "id": "...",
      "name": "Sam",
      "role": "Google Ads Specialist",
      "serviceType": "google_ads",
      "isPrimary": true
    },
    {
      "id": "...",
      "name": "Quan",
      "role": "SEO & Local SEO Expert",
      "serviceType": "seo",
      "isPrimary": true
    }
  ]
}
```

## Benefits

1. **Builds Trust** - Clients see real people working on their account
2. **Transparency** - Clear accountability for each service
3. **Personal Touch** - Humanizes the agency relationship
4. **Confidence** - Especially important when metrics are down, clients know someone is actively working on it
