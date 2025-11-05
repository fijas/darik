/**
 * AMFI NAV Fetcher
 *
 * Fetches mutual fund NAV (Net Asset Value) data from AMFI India.
 * AMFI publishes NAV data daily at around 23:00 IST.
 *
 * Data source: https://www.amfiindia.com/spages/NAVAll.txt
 */

import { Env } from '../types';

export interface AMFIPrice {
  schemeCode: string;
  isinDivPayout: string;
  isinDivReinvest: string;
  schemeName: string;
  nav: number; // in paise
  date: string; // DD-MMM-YYYY format
  fundHouse: string;
  schemeType: string;
}

export interface FetchResult {
  success: boolean;
  pricesCount: number;
  timestamp: string;
  etag?: string;
  error?: string;
}

/**
 * Parse AMFI NAV text file format
 *
 * Format:
 * Scheme Code;ISIN Div Payout/ISIN Growth;ISIN Div Reinvestment;Scheme Name;Net Asset Value;Date
 *
 * Fund house lines start without semicolon
 */
export function parseAMFIData(rawText: string): AMFIPrice[] {
  const lines = rawText.split('\n');
  const prices: AMFIPrice[] = [];
  let currentFundHouse = '';
  let currentSchemeType = '';

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) continue;

    // Lines without semicolon are fund house or scheme type headers
    if (!trimmed.includes(';')) {
      // Detect scheme type (Open Ended Schemes, Close Ended Schemes, etc.)
      if (trimmed.includes('Schemes')) {
        currentSchemeType = trimmed;
      } else {
        // Fund house name
        currentFundHouse = trimmed;
      }
      continue;
    }

    // Parse NAV data line
    const parts = trimmed.split(';');
    if (parts.length < 6) continue;

    const [schemeCode, isinDivPayout, isinDivReinvest, schemeName, navStr, dateStr] = parts;

    // Validate all required fields are present and non-empty
    if (!schemeCode || !isinDivPayout || !isinDivReinvest || !schemeName || !dateStr) {
      continue;
    }

    // Skip if NAV is not a number or is N.A.
    if (!navStr || navStr === 'N.A.' || isNaN(parseFloat(navStr))) {
      continue;
    }

    // Convert NAV from rupees to paise (multiply by 100)
    const navInRupees = parseFloat(navStr);
    const navInPaise = Math.round(navInRupees * 100);

    prices.push({
      schemeCode: schemeCode.trim(),
      isinDivPayout: isinDivPayout.trim(),
      isinDivReinvest: isinDivReinvest.trim(),
      schemeName: schemeName.trim(),
      nav: navInPaise,
      date: dateStr.trim(),
      fundHouse: currentFundHouse,
      schemeType: currentSchemeType,
    });
  }

  return prices;
}

/**
 * Convert AMFI date format (DD-MMM-YYYY) to ISO date (YYYY-MM-DD)
 */
export function parseAMFIDate(amfiDate: string): string {
  // AMFI uses format like "04-Jan-2025"
  const monthMap: Record<string, string> = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12',
  };

  const [day, month, year] = amfiDate.split('-');

  // Validate all required parts are present
  if (!day || !month || !year) {
    throw new Error(`Invalid AMFI date format: ${amfiDate}`);
  }

  const monthNum = monthMap[month];

  if (!monthNum) {
    throw new Error(`Invalid AMFI date format: ${amfiDate}`);
  }

  return `${year}-${monthNum}-${day.padStart(2, '0')}`;
}

/**
 * Fetch AMFI NAV data from the official website
 */
export async function fetchAMFIData(env: Env): Promise<FetchResult> {
  const url = 'https://www.amfiindia.com/spages/NAVAll.txt';
  const cacheKey = 'amfi:nav:etag';

  try {
    // Check for cached ETag to avoid unnecessary downloads
    const cachedETag = await env.KV.get(cacheKey);

    // Fetch with conditional request
    const headers: Record<string, string> = {};
    if (cachedETag) {
      headers['If-None-Match'] = cachedETag;
    }

    const response = await fetch(url, { headers });

    // 304 Not Modified - data hasn't changed
    if (response.status === 304) {
      console.log('AMFI data not modified (304), skipping update');
      return {
        success: true,
        pricesCount: 0,
        timestamp: new Date().toISOString(),
        etag: cachedETag || undefined,
      };
    }

    if (!response.ok) {
      throw new Error(`AMFI fetch failed: ${response.status} ${response.statusText}`);
    }

    // Get new ETag
    const newETag = response.headers.get('ETag');

    // Parse the data
    const rawText = await response.text();
    const prices = parseAMFIData(rawText);

    if (prices.length === 0) {
      throw new Error('No valid NAV data found in AMFI response');
    }

    console.log(`Parsed ${prices.length} NAV records from AMFI`);

    // Store prices in D1
    await storePricesInD1(env, prices);

    // Update cached ETag
    if (newETag) {
      await env.KV.put(cacheKey, newETag, { expirationTtl: 86400 }); // 24 hours
    }

    // Store last fetch timestamp
    await env.KV.put('amfi:nav:last_fetch', new Date().toISOString(), {
      expirationTtl: 86400 * 7, // 7 days
    });

    return {
      success: true,
      pricesCount: prices.length,
      timestamp: new Date().toISOString(),
      etag: newETag || undefined,
    };
  } catch (error) {
    console.error('AMFI fetch error:', error);
    return {
      success: false,
      pricesCount: 0,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Store prices in D1 database
 */
async function storePricesInD1(env: Env, prices: AMFIPrice[]): Promise<void> {
  // Batch insert for performance
  const batchSize = 500;
  let inserted = 0;

  for (let i = 0; i < prices.length; i += batchSize) {
    const batch = prices.slice(i, i + batchSize);

    // Build batch insert query
    const values = batch.map(p => {
      const isoDate = parseAMFIDate(p.date);
      return `('${p.schemeCode}', '${isoDate}', ${p.nav}, '${escapeSql(p.schemeName)}', '${escapeSql(p.fundHouse)}', '${p.isinDivPayout || ''}', '${p.isinDivReinvest || ''}')`;
    }).join(',');

    const query = `
      INSERT OR REPLACE INTO prices (
        security_id, date, price_paise, metadata, source, created_at, updated_at
      )
      SELECT
        s.id,
        date_val,
        price_val,
        json_object('schemeName', scheme_name, 'fundHouse', fund_house, 'isinDivPayout', isin_div_payout, 'isinDivReinvest', isin_div_reinvest),
        'amfi',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      FROM (
        VALUES ${values}
      ) AS v(scheme_code, date_val, price_val, scheme_name, fund_house, isin_div_payout, isin_div_reinvest)
      LEFT JOIN securities s ON s.code = v.scheme_code AND s.type = 'mutual_fund'
      WHERE s.id IS NOT NULL;
    `;

    await env.DB.prepare(query).run();
    inserted += batch.length;
  }

  console.log(`Inserted/updated ${inserted} prices in D1`);
}

/**
 * Escape SQL strings to prevent injection
 */
function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

/**
 * Get the last AMFI fetch timestamp
 */
export async function getLastFetchTime(env: Env): Promise<string | null> {
  return await env.KV.get('amfi:nav:last_fetch');
}

/**
 * Get price statistics from D1
 */
export async function getPriceStats(env: Env): Promise<{
  totalPrices: number;
  latestDate: string | null;
  securitiesWithPrices: number;
}> {
  const result = await env.DB.prepare(`
    SELECT
      COUNT(*) as total_prices,
      MAX(date) as latest_date,
      COUNT(DISTINCT security_id) as securities_with_prices
    FROM prices
    WHERE source = 'amfi'
  `).first<{
    total_prices: number;
    latest_date: string | null;
    securities_with_prices: number;
  }>();

  return {
    totalPrices: result?.total_prices || 0,
    latestDate: result?.latest_date || null,
    securitiesWithPrices: result?.securities_with_prices || 0,
  };
}
