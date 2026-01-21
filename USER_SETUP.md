# User Setup Guide

## Login Information

**Login URL:** https://ultimate-report-dashboard-main-otxe5dvdm.vercel.app/login

## Creating Users

### Option 1: Using the Helper Script

```bash
cd /Users/imac2017/claude-test/ultimate-report-dashboard-main
./scripts/create-user.sh
```

Follow the prompts to create a user.

### Option 2: Using curl directly

**Create an Admin User:**
```bash
curl -X POST https://ultimate-report-dashboard-main-otxe5dvdm.vercel.app/api/admin/add-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123!",
    "role": "admin"
  }'
```

**Create a Client User:**
```bash
curl -X POST https://ultimate-report-dashboard-main-otxe5dvdm.vercel.app/api/admin/add-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@company.com",
    "password": "ClientPass456!",
    "role": "client",
    "clientId": "client-slug-from-database"
  }'
```

## User Roles Explained

### Admin Role
- **Access:** Team Overview page at `/admin`
- **Capabilities:**
  - View all clients in a grid layout
  - Click any client card to view their dashboard
  - See aggregated metrics across all clients
  - Search and filter clients
  - Change date ranges to view different time periods

### Client Role
- **Access:** Individual dashboard at `/dashboard`
- **Capabilities:**
  - View only their own metrics and performance data
  - See their company name in the hero section
  - Track leads, ad spend, cost per lead, phone calls
  - View channel performance (Google Ads, Organic Search)
  - Use date range picker to view historical data
  - Navigate between tabs: Overview, Analytics, Calls, SEO (tabs other than Overview coming soon)

## Quick Setup Example

1. **Create an admin user first:**
```bash
curl -X POST https://ultimate-report-dashboard-main-otxe5dvdm.vercel.app/api/admin/add-user \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123","role":"admin"}'
```

2. **Visit the login page:**
https://ultimate-report-dashboard-main-otxe5dvdm.vercel.app/login

3. **Login with:**
- Email: admin@test.com
- Password: admin123

4. **You'll be redirected to `/admin` (Team Overview)**

## Finding Client IDs

To create client users, you need the client slug from your database. Client slugs are stored in the `clients` table.

You can find them by:
1. Logging in as admin
2. Looking at the client cards - the slug is shown as `@client-slug`
3. Or by checking the database directly in Supabase

## Testing the Login

After creating a user, test the login:
1. Go to: https://ultimate-report-dashboard-main-otxe5dvdm.vercel.app/login
2. Enter your email and password
3. Admin users → redirected to `/admin` (Team Overview)
4. Client users → redirected to `/dashboard` (Their dashboard)

## Troubleshooting

**Login fails:**
- Check that the user exists in the `users` table
- Verify `is_active = true`
- Confirm the password matches what you set
- Check browser console for errors

**Admin sees no clients:**
- Verify clients exist in the `clients` table
- Check that metrics data exists in `daily_client_rollups` table
- Look at browser network tab to see API responses

**Client sees wrong data:**
- Verify `client_id` matches their slug in the `clients` table
- Check that the client has data in `daily_client_rollups`
