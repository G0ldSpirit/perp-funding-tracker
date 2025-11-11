// api/lighter.js
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await fetch('https://api.lighter.xyz/markets');
    
    if (!response.ok) {
      throw new Error(`Lighter API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract funding rates
    const fundingRates = {};
    
    if (Array.isArray(data)) {
      data.forEach(market => {
        if (market.symbol && market.funding_rate !== undefined) {
          const symbol = market.symbol.split('_')[0].replace('PERP', '');
          fundingRates[symbol] = parseFloat(market.funding_rate);
        }
      });
    }

    res.status(200).json({
      success: true,
      source: 'lighter',
      count: Object.keys(fundingRates).length,
      data: fundingRates,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Lighter API Error:', error);
    res.status(500).json({
      success: false,
      source: 'lighter',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
```

---

## ✅ Résumé de ce que tu dois avoir :
```
perp-funding-tracker/
├── index.html          ← Le HTML mis à jour
└── api/
    ├── paradex.js     ← Le code ci-dessus
    └── lighter.js     ← Le code ci-dessus