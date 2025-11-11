// api/paradex.js
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await fetch('https://api.prod.paradex.trade/v1/markets/summary?market=ALL');
    
    if (!response.ok) {
      throw new Error(`Paradex API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract funding rates
    const fundingRates = {};
    
    if (data && data.results && Array.isArray(data.results)) {
      data.results.forEach(market => {
        if (market.symbol && market.funding_rate !== undefined) {
          const symbol = market.symbol.replace('-USD-PERP', '');
          fundingRates[symbol] = parseFloat(market.funding_rate);
        }
      });
    }

    res.status(200).json({
      success: true,
      source: 'paradex',
      count: Object.keys(fundingRates).length,
      data: fundingRates,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Paradex API Error:', error);
    res.status(500).json({
      success: false,
      source: 'paradex',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}