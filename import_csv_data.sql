-- ============================================================================
-- IMPORT DATA FROM CSV - UPDATE EXISTING CLIENTS
-- ============================================================================

-- Map CSV data to existing clients + add new information
-- Based on /Users/imac2017/Downloads/Call details - Sheet1.csv

UPDATE clients SET
  website_url = 'https://decarlochiropractic.com/',
  address = 'New City, New York',
  phone = '845-708-8885',
  contact_email = 'info@decarlochiropractic.com',
  doctor_name = 'Chris DeCarlo',
  status = 'Working',
  wordpress_site = 'mychiropractice',
  seo_rating = 3,
  ads_rating = 5,
  ads_budget_month = NULL,
  notes = NULL
WHERE slug = 'decarlo-chiropractic';

UPDATE clients SET
  website_url = 'https://mychirosolutions.com/',
  address = 'Virginia Beach, VA',
  phone = '757-271-0001',
  contact_email = 'info@mychirosolutions.com',
  doctor_name = 'Samantha Coleman',
  status = 'Working',
  wordpress_site = 'mychiropractice',
  seo_rating = 5,
  ads_rating = 0, -- 🚫 = not have
  ads_budget_month = NULL,
  notes = NULL
WHERE slug = 'chirosolutions-center';

UPDATE clients SET
  website_url = 'https://coreposturechiropractic.com/',
  address = 'Newport Beach, CA',
  phone = '(949) 536-5506',
  contact_email = NULL,
  doctor_name = 'Tyler Meier',
  status = 'Working',
  wordpress_site = 'mychiropractice',
  seo_rating = 5,
  ads_rating = 5,
  ads_budget_month = '$3,000',
  notes = NULL
WHERE slug = 'coreposture';

UPDATE clients SET
  website_url = 'https://zencare.com/',
  address = 'Irvine, CA',
  phone = '(949) 727-1772',
  contact_email = NULL,
  doctor_name = 'Jay Kang',
  status = 'Working',
  wordpress_site = 'mychiropractice',
  seo_rating = 5,
  ads_rating = 0, -- 🚫
  ads_budget_month = NULL,
  notes = NULL
WHERE slug = 'zen-care-physical-medicine';

UPDATE clients SET
  website_url = 'https://wbwchiro.com/',
  address = 'Riverside, CA',
  phone = '951-683-9807',
  contact_email = NULL,
  doctor_name = 'Daniel Mendez',
  status = 'Working',
  wordpress_site = 'mychiropractice',
  seo_rating = 5,
  ads_rating = 5,
  ads_budget_month = '$2,000',
  notes = NULL
WHERE slug = 'whole-body-wellness';

UPDATE clients SET
  website_url = 'https://tailschirocare.com/',
  address = 'Fort Collins, CO',
  phone = '970-420-9489',
  contact_email = 'dralisha@tailschirocare.com',
  doctor_name = 'Alisha Barnes',
  status = 'Working',
  wordpress_site = 'mychiropractice',
  seo_rating = 4,
  ads_rating = 3,
  ads_budget_month = '$400',
  notes = NULL
WHERE slug = 'tails-animal-chiropractic';

UPDATE clients SET
  website_url = 'https://drdigrado.com/',
  address = 'Newport Beach, CA',
  phone = '(949) 408-0393',
  contact_email = 'ncfcdr@sbcglobal.net',
  doctor_name = 'Mike Digrado',
  status = 'Working',
  wordpress_site = 'mychiropractice',
  seo_rating = 5,
  ads_rating = 5,
  ads_budget_month = '$3,000',
  notes = 'Dr DiGrado & Newport Center Family Chiro are same'
WHERE slug = 'dr-digrado' OR slug = 'newport-center-family-chiro';

UPDATE clients SET
  website_url = 'https://thechiropracticsource.com/',
  address = '388 Pompton Avenue, Cedar Grove, NJ 07009',
  phone = '973-228-0500',
  contact_email = 'tcsfrontdesk@gmail.com',
  doctor_name = 'Dr. Marco Ferrucci',
  status = 'Cancel',
  wordpress_site = 'mychiropractice',
  seo_rating = 5,
  ads_rating = 0, -- 🚫
  ads_budget_month = '$1,500',
  notes = 'Oct 9th, 2023'
WHERE slug = 'the-chiropractic-source';

UPDATE clients SET
  website_url = 'https://restorationdentaloc.com/',
  address = '725 W La Veta Ave, Ste 200, Orange, CA 92868',
  phone = '714-400-0075',
  contact_email = 'info@restorationdentaloc.com',
  doctor_name = 'Dr. Ronald Pham DDS',
  status = 'Working',
  wordpress_site = 'Ron Pham',
  seo_rating = 4,
  ads_rating = 3,
  ads_budget_month = '$2,500',
  notes = 'Apr 9th, 2024'
WHERE slug = 'restoration-dental';

UPDATE clients SET
  website_url = 'https://painresults.com/',
  address = '4247 W Kennedy Blvd, Tampa, FL 33609',
  phone = '813-289-5575',
  contact_email = 'drdean@painresults.com',
  doctor_name = 'Dr. Dean Brown',
  status = 'Working',
  wordpress_site = 'mychiropractice',
  seo_rating = 4,
  ads_rating = 4,
  ads_budget_month = '$3,000',
  notes = 'Apr 2024'
WHERE slug = 'chiropractic-care-centre';

UPDATE clients SET
  website_url = 'https://chiropractichealthclub.com/',
  address = '6700 Indiana Ave, Suite 100, Riverside, CA 92506',
  phone = '(951) 341-6565',
  contact_email = 'info@chiropractichealthclub.com',
  doctor_name = 'Jay Kang',
  status = 'Working',
  wordpress_site = 'mychiropractice',
  seo_rating = 5,
  ads_rating = 0, -- 🚫
  ads_budget_month = NULL,
  notes = NULL
WHERE slug = 'chiropractic-health-club';

UPDATE clients SET
  website_url = 'https://www.chirofirstredding.com/',
  address = '1435 Market Street, Redding, CA 96001',
  phone = '(530) 243-0889',
  contact_email = 'chiroteam@chirofirst.net',
  doctor_name = 'Dr. Todd Royse',
  status = 'Working',
  wordpress_site = 'mychiropractice',
  seo_rating = 5,
  ads_rating = 0, -- 🚫
  ads_budget_month = NULL,
  notes = NULL
WHERE slug = 'chiropractic-first';

UPDATE clients SET
  website_url = 'https://www.chiroct.com/',
  address = '1995 Post Rd, Fairfield, CT 06824',
  phone = '(203) 259-1555',
  contact_email = 'info@chiroct.com',
  doctor_name = 'Dr. Richard Pinsky & Dr. Cathy Brodows',
  status = 'Working',
  wordpress_site = 'mychiropractice',
  seo_rating = 5,
  ads_rating = 5,
  ads_budget_month = NULL,
  notes = NULL
WHERE slug = 'southport-chiropractic';

UPDATE clients SET
  website_url = 'https://havencbp.com/',
  address = '420 Swannanoa River Rd., Asheville, NC 28805',
  phone = '828-848-8709',
  contact_email = 'frontdesk@havencbp.com',
  doctor_name = 'Unknown',
  status = 'Working',
  wordpress_site = 'MyChiroPractice',
  seo_rating = 5,
  ads_rating = 5,
  ads_budget_month = NULL,
  notes = NULL
WHERE slug = 'haven-chiropractic';

UPDATE clients SET
  website_url = 'https://regeneratechiro.com/',
  address = '11920 Hwy 707 Suite E, Murrells Inlet, SC 29576',
  phone = '843-357-0125',
  contact_email = 'info@regeneratechiro.com',
  doctor_name = 'Unknown',
  status = '?',
  wordpress_site = NULL,
  seo_rating = 5,
  ads_rating = 0,
  ads_budget_month = NULL,
  notes = NULL
WHERE slug = 'regenerate-chiropractic';

UPDATE clients SET
  website_url = 'https://tinkerfamilychiro.com/',
  address = '12908 Lebanon Rd, Mt. Juliet, TN 37122',
  phone = '615-288-2671',
  contact_email = 'tinkerfamilychiropractic@gmail.com',
  doctor_name = 'Dr. Brittany Tinker',
  status = 'Working',
  wordpress_site = 'mychiropractice',
  seo_rating = 3,
  ads_rating = 5,
  ads_budget_month = '$1,000',
  notes = 'Dec 03, 2025'
WHERE slug = 'tinker-family-chiro';

UPDATE clients SET
  website_url = 'https://drnicolebonner.com/',
  address = '691 Mill Creek Rd #5, Manahawkin, NJ 08050',
  phone = '(609) 978-4304',
  contact_email = NULL,
  doctor_name = 'Dr. Nicole Bonner',
  status = '?',
  wordpress_site = 'MyChiroPractice',
  seo_rating = NULL,
  ads_rating = 5,
  ads_budget_month = '$1,000',
  notes = 'Feb 27, 2025'
WHERE slug = 'healing-hands-of-manahawkin';

UPDATE clients SET
  website_url = 'https://www.cinquechiropractic.com/',
  address = '252 Union ST, Schenectady, NY 12305',
  phone = '(518)-377-5300',
  contact_email = 'dralexacinque@gmail.com',
  doctor_name = 'Dr. Alexa Cinque',
  status = 'Working',
  wordpress_site = 'mychiropractice',
  seo_rating = 5,
  ads_rating = 5,
  ads_budget_month = '$1,200',
  notes = 'Oct 29, 2025'
WHERE slug = 'cinque-chiropractic';

UPDATE clients SET
  website_url = 'https://redlandschiro.net/',
  address = '1460 Industrial Park Ave, Redlands, CA 92374',
  phone = '(909) 792-6976',
  contact_email = NULL,
  doctor_name = 'Dr. Rayed Sahawneh',
  status = 'Working',
  wordpress_site = 'mychiropractice',
  seo_rating = NULL,
  ads_rating = NULL,
  ads_budget_month = NULL,
  notes = NULL
WHERE slug = 'ray-chiropractic';

UPDATE clients SET
  website_url = 'https://axischirocare.com/',
  address = '1236 Folly Rd, Charleston, SC 29412',
  phone = '(843) 225-1236',
  contact_email = 'info@axischirocare.com',
  doctor_name = 'Dr. Lee Russo',
  status = 'Cancel',
  wordpress_site = 'mychiropractice',
  seo_rating = NULL,
  ads_rating = 0, -- 🚫
  ads_budget_month = NULL,
  notes = NULL
WHERE slug = 'axis-chiropractic';

UPDATE clients SET
  website_url = 'https://saigondistrict.net/',
  address = '19171 Magnolia Street, Unit #3, Huntington Beach, CA',
  phone = '714-964-4500',
  contact_email = NULL,
  doctor_name = 'Chef Rachel',
  status = 'Cancel',
  wordpress_site = NULL,
  seo_rating = NULL,
  ads_rating = 4,
  ads_budget_month = NULL,
  notes = NULL
WHERE slug = 'saigon-district-restaurant';

UPDATE clients SET
  website_url = 'https://hoodchiropractic.com/',
  address = '5990 54th Ave N, St. Petersburg, FL 33709',
  phone = '(727) 544-9000',
  contact_email = 'chirochampion@me.com',
  doctor_name = 'Christopher Hood',
  status = 'Working',
  wordpress_site = 'mychiropractice',
  seo_rating = 3,
  ads_rating = 0, -- 🚫
  ads_budget_month = NULL,
  notes = NULL
WHERE slug = 'hood-chiropractic';

-- ============================================================================
-- UPDATE SERVICE FLAGS BASED ON SERVICE_CONFIGS
-- ============================================================================

UPDATE clients c SET
  has_seo = (sc.gsc_site_url IS NOT NULL AND sc.gsc_site_url != ''),
  has_ads = (sc.gads_customer_id IS NOT NULL AND sc.gads_customer_id != ''),
  has_gbp = (sc.gbp_location_id IS NOT NULL AND sc.gbp_location_id != ''),
  has_callrail = (sc.callrail_account_id IS NOT NULL AND sc.callrail_account_id != '')
FROM service_configs sc
WHERE c.id = sc.client_id;

-- ============================================================================
-- DONE
-- ============================================================================

-- Verify update:
-- SELECT id, name, website_url, address, phone, doctor_name, status, seo_rating, ads_rating, ads_budget_month, has_seo, has_ads, has_gbp FROM clients LIMIT 10;
