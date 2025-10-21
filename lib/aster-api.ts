import crypto from 'crypto';

const ASTER_API_BASE = 'https://sapi.asterdex.com';
const API_KEY = process.env.MASTER_DEX_API_KEY || '';
const API_SECRET = process.env.MASTER_DEX_API_SECRET || '';

/**
 * Create HMAC SHA256 signature for authenticated requests
 */
function createSignature(queryString: string): string {
  return crypto
    .createHmac('sha256', API_SECRET)
    .update(queryString)
    .digest('hex');
}

/**
 * Build query string from parameters
 */
function buildQueryString(params: Record<string, any>): string {
  return Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
}

/**
 * Make authenticated GET request to Aster Dex API
 */
export async function authenticatedGet(endpoint: string, params: Record<string, any> = {}) {
  // Add timestamp
  const timestamp = Date.now();
  const queryParams = {
    ...params,
    timestamp,
  };

  // Create query string
  const queryString = buildQueryString(queryParams);
  
  // Create signature
  const signature = createSignature(queryString);
  
  // Build full URL with signature
  const url = `${ASTER_API_BASE}${endpoint}?${queryString}&signature=${signature}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-MBX-APIKEY': API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Make authenticated POST request to Aster Dex API
 */
export async function authenticatedPost(endpoint: string, params: Record<string, any> = {}) {
  // Add timestamp
  const timestamp = Date.now();
  const bodyParams: Record<string, any> = {
    ...params,
    timestamp,
  };

  // Create query string for signature
  const queryString = buildQueryString(bodyParams);
  
  // Create signature
  const signature = createSignature(queryString);
  
  // Add signature to body
  bodyParams.signature = signature;

  const response = await fetch(`${ASTER_API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'X-MBX-APIKEY': API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: buildQueryString(bodyParams),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Make public GET request (no authentication)
 */
export async function publicGet(endpoint: string, params: Record<string, any> = {}) {
  const queryString = buildQueryString(params);
  const url = queryString 
    ? `${ASTER_API_BASE}${endpoint}?${queryString}`
    : `${ASTER_API_BASE}${endpoint}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

// Example usage functions:

/**
 * Get account information (requires authentication)
 */
export async function getAccountInfo() {
  return authenticatedGet('/api/v1/account', { recvWindow: 5000 });
}

/**
 * Get all open orders (requires authentication)
 */
export async function getOpenOrders(symbol?: string) {
  const params = symbol ? { symbol } : {};
  return authenticatedGet('/api/v1/openOrders', params);
}

/**
 * Place a new order (requires authentication)
 */
export async function placeOrder(orderParams: {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: string;
  quantity?: string;
  price?: string;
  timeInForce?: string;
}) {
  return authenticatedPost('/api/v1/order', orderParams);
}

/**
 * Get exchange info (public endpoint)
 */
export async function getExchangeInfo() {
  return publicGet('/api/v1/exchangeInfo');
}

/**
 * Get ticker price (public endpoint)
 */
export async function getTickerPrice(symbol?: string) {
  const params = symbol ? { symbol } : {};
  return publicGet('/api/v1/ticker/price', params);
}

/**
 * Get 24hr ticker statistics (public endpoint)
 */
export async function get24hrTicker(symbol?: string) {
  const params = symbol ? { symbol } : {};
  return publicGet('/api/v1/ticker/24hr', params);
}
