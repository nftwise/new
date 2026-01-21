# Supabase Client Audit Report
**Generated:** 2026-01-19
**Database:** tupedninjtaarmdwppgy.supabase.co

---

## Executive Summary

- **Total Active Clients:** 24
- **Fully Configured Clients (All 4 APIs):** 3
- **Partially Configured Clients:** 18
- **Incomplete Configurations:** 3

### Configuration Completeness by API

| API | Configured | Missing | Percentage |
|-----|-----------|---------|-----------|
| Google Analytics (GA) | 22/24 | 2 | 91.7% |
| Google Ads | 6/24 | 18 | 25% |
| Google Search Console (GSC) | 24/24 | 0 | 100% |
| Google Business Profile (GBP) | 10/24 | 14 | 41.7% |

---

## Detailed Client Configurations

### Fully Configured Clients (All 4 APIs Present)

| # | Client Name | City | GA Property ID | Google Ads Customer ID | GSC Site URL | GBP Location ID |
|---|-------------|------|----------------|----------------------|--------------|-----------------|
| 1 | Dr DiGrado | N/A | 326814792 | 2812810609 | https://drdigrado.com/ | locations/12570443580620511972 |
| 2 | DeCarlo Chiropractic | New City, New York | 312855752 | 6379112944 | https://decarlochiropractic.com/ | accounts/111728963099305708584/locations/17196030318038468635 |
| 3 | CorePosture | Newport Beach, CA | 305884406 | 1144073048 | https://coreposturechiropractic.com/ | accounts/111728963099305708584/locations/1203151849529238982 |
| 4 | Restoration Dental | Orange | 422959132 | 7405571819 | https://restorationdentaloc.com/ | accounts/111728963099305708584/locations/8747587443047417718 |

### Clients Missing Google Ads Configuration (18 clients)

| # | Client Name | City | GA | GSC | GBP |
|---|-------------|------|----|----|-----|
| 5 | CHIROSOLUTIONS CENTER | Virginia Beach, VA | 310677662 | ✓ | ✓ |
| 6 | WHOLE BODY WELLNESS | Riverside, CA | 310663278 | ✓ | ✗ |
| 7 | TAILS ANIMAL CHIROPRACTIC CARE | Fort Collins, CO | 310696997 | ✓ | ✗ |
| 8 | NEWPORT CENTER FAMILY CHIROPRACTIC | Newport Beach, CA | 326814792 | ✓ | ✓ |
| 9 | THE CHIROPRACTIC SOURCE | Cedar Grove, NJ | 411313920 | ✓ | ✗ |
| 10 | CHIROPRACTIC CARE CENTRE | Tampa, FL | 424573076 | ✓ | ✗ |
| 11 | CHIROPRACTIC HEALTH CLUB | Riverside, CA | 434778271 | ✓ | ✗ |
| 12 | CHIROPRACTIC FIRST | Redding, CA | 445245630 | ✓ | ✓ |
| 13 | SOUTHPORT CHIROPRACTIC | Fairfield, CT | 442138602 | ✓ | ✗ |
| 14 | HAVEN CHIROPRACTIC | Asheville, NC | 452955656 | ✓ | ✗ |
| 15 | TINKER FAMILY CHIRO | Mt. Juliet, TN | 471509608 | ✓ | ✗ |
| 16 | AXIS CHIROPRACTIC | Charleston, SC | 500323723 | ✓ | ✓ |
| 17 | HOOD CHIROPRACTIC | St. Petersburg, FL | 506284949 | ✓ | ✓ |
| 18 | HEALING HANDS OF MANAHAWKIN | Manahawkin, NJ | 480650707 | ✓ | ✗ |
| 19 | RAY CHIROPRACTIC | Redlands, CA | 497130648 | ✓ | ✗ |
| 20 | SAIGON DISTRICT RESTAURANT | Huntington Beach, CA | 503604905 | ✓ | ✗ |

### Clients Missing GA Property ID (2 clients)

| # | Client Name | City | Google Ads | GSC | GBP |
|---|-------------|------|-----------|-----|-----|
| 21 | REGENERATE CHIROPRACTIC | Murrells Inlet, SC | ✗ | ✓ | ✗ |
| 22 | CINQUE CHIROPRACTIC | Schenectady, NY | ✗ | ✓ | ✗ |

### Clients Missing GBP Location ID (14 clients)

| Client Name | City | GA | Google Ads | GSC |
|-------------|------|----|-----------|----|
| Zen Care Physical Medicine | Irvine, CA | ✓ | ✓ | ✓ |
| WHOLE BODY WELLNESS | Riverside, CA | ✓ | ✗ | ✓ |
| TAILS ANIMAL CHIROPRACTIC CARE | Fort Collins, CO | ✓ | ✗ | ✓ |
| THE CHIROPRACTIC SOURCE | Cedar Grove, NJ | ✓ | ✗ | ✓ |
| CHIROPRACTIC CARE CENTRE | Tampa, FL | ✓ | ✗ | ✓ |
| CHIROPRACTIC HEALTH CLUB | Riverside, CA | ✓ | ✗ | ✓ |
| SOUTHPORT CHIROPRACTIC | Fairfield, CT | ✓ | ✗ | ✓ |
| HAVEN CHIROPRACTIC | Asheville, NC | ✓ | ✗ | ✓ |
| REGENERATE CHIROPRACTIC | Murrells Inlet, SC | ✗ | ✗ | ✓ |
| CINQUE CHIROPRACTIC | Schenectady, NY | ✗ | ✗ | ✓ |
| FUNCTIONAL SPINE CHIROPRACTIC | Tampa, FL | ✗ | ✗ | ✓ |
| TINKER FAMILY CHIRO | Mt. Juliet, TN | ✓ | ✗ | ✓ |
| HEALING HANDS OF MANAHAWKIN | Manahawkin, NJ | ✓ | ✗ | ✓ |
| RAY CHIROPRACTIC | Redlands, CA | ✓ | ✗ | ✓ |
| SAIGON DISTRICT RESTAURANT | Huntington Beach, CA | ✓ | ✗ | ✓ |

---

## OAuth Token Status

**Directory:** `~/.oauth-tokens`
**Status:** Directory does not exist

### Findings:
- No `.oauth-tokens` directory found in the user's home directory
- GBP OAuth tokens are likely stored in:
  - Database (service_configs table)
  - Supabase Storage
  - Environment variables
  - Session storage

### Project-Related GBP Files Found:
- `/scripts/gbp-token-manager.ts` - Token management utility
- `/scripts/refresh-gbp-token.ts` - Token refresh script
- `/scripts/generate-gbp-master-token.js` - Master token generation
- `/lib/api/gbp-token-manager.ts` - Token manager library

---

## Configuration Analysis

### Google Analytics (GA)
- **Status:** Well-configured (91.7% coverage)
- **Missing:** 2 clients (REGENERATE CHIROPRACTIC, CINQUE CHIROPRACTIC)
- **Note:** GSC is 100% configured, indicating strong GA tracking

### Google Ads
- **Status:** Needs attention (25% coverage)
- **Configured:** 6 clients
- **Missing:** 18 clients
- **Priority:** Consider implementing Google Ads API integration for remaining clients

### Google Search Console (GSC)
- **Status:** Perfect (100% coverage)
- **All 24 active clients** have GSC site URLs configured
- **Strength:** Uniform SEO monitoring across all clients

### Google Business Profile (GBP)
- **Status:** Partial (41.7% coverage)
- **Configured:** 10 clients
- **Missing:** 14 clients
- **Note:** Some clients have full format IDs (accounts/.../locations/...), while others have simple numeric IDs

---

## Recommendations

1. **Google Ads Integration** (Priority: High)
   - 18 clients are missing Google Ads configurations
   - Review with clients to determine if they have Google Ads campaigns
   - Update service_configs table with missing customer IDs

2. **GBP Profile Completion** (Priority: Medium)
   - 14 clients are missing GBP Location IDs
   - Consider if these businesses have physical locations worthy of GBP
   - May be intentional for service-based businesses without physical location

3. **GA Property IDs** (Priority: Low)
   - Only 2 clients missing (91.7% coverage is excellent)
   - Follow up with REGENERATE CHIROPRACTIC and CINQUE CHIROPRACTIC

4. **OAuth Token Management** (Priority: Ongoing)
   - Verify token storage mechanism for GBP authentication
   - Review token refresh scripts in `/scripts` directory
   - Consider implementing centralized token management

---

## Database Tables Reference

### Table: `clients`
- **Fields:** id, name, slug, city, is_active
- **Active Records:** 24

### Table: `service_configs`
- **Fields:** client_id, ga_property_id, gads_customer_id, gsc_site_url, gbp_location_id
- **Related Records:** 24 (one per active client)

---

## Next Steps

1. Review Google Ads coverage with sales/account team
2. Validate GBP requirements for all clients
3. Update missing configurations in database
4. Test token refresh processes for GBP integration
5. Document API availability per client for dashboard filtering
