const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Realistic Nepal stock market mock data
const STOCKS = [
  { symbol:'NABIL',  name:'Nabil Bank Ltd',              sector:'Banking',     ltp:1245.00, high:1262.00, low:1228.00, open:1240.00, prevClose:1232.00, volume:18420 },
  { symbol:'NMB',    name:'NMB Bank Ltd',                sector:'Banking',     ltp:456.80,  high:462.00,  low:450.00,  open:455.00,  prevClose:449.10,  volume:9830  },
  { symbol:'SANIMA', name:'Sanima Bank Ltd',             sector:'Banking',     ltp:312.50,  high:318.00,  low:308.00,  open:314.00,  prevClose:315.20,  volume:6540  },
  { symbol:'SBL',    name:'Sunrise Bank Ltd',            sector:'Banking',     ltp:189.40,  high:194.00,  low:187.00,  open:190.00,  prevClose:192.30,  volume:12100 },
  { symbol:'EBL',    name:'Everest Bank Ltd',            sector:'Banking',     ltp:2350.00, high:2380.00, low:2320.00, open:2340.00, prevClose:2290.00, volume:3220  },
  { symbol:'KBL',    name:'Kumari Bank Ltd',             sector:'Banking',     ltp:152.60,  high:156.00,  low:150.00,  open:153.00,  prevClose:154.80,  volume:22100 },
  { symbol:'NICA',   name:'NIC Asia Bank Ltd',           sector:'Banking',     ltp:546.00,  high:552.00,  low:540.00,  open:548.00,  prevClose:551.20,  volume:8760  },
  { symbol:'SBI',    name:'Nepal SBI Bank Ltd',          sector:'Banking',     ltp:418.00,  high:425.00,  low:412.00,  open:415.00,  prevClose:410.50,  volume:7430  },
  { symbol:'NLIC',   name:'Nepal Life Insurance Co.',    sector:'Insurance',   ltp:1580.00, high:1610.00, low:1565.00, open:1590.00, prevClose:1545.00, volume:2840  },
  { symbol:'NLICL',  name:'National Life Insurance',     sector:'Insurance',   ltp:890.00,  high:905.00,  low:882.00,  open:885.00,  prevClose:875.00,  volume:4120  },
  { symbol:'GLICL',  name:'Gurans Life Insurance',       sector:'Insurance',   ltp:645.00,  high:658.00,  low:638.00,  open:650.00,  prevClose:660.00,  volume:3560  },
  { symbol:'LGIL',   name:'Lumbini General Insurance',   sector:'Insurance',   ltp:432.00,  high:440.00,  low:428.00,  open:435.00,  prevClose:428.50,  volume:5200  },
  { symbol:'UPPER',  name:'Upper Tamakoshi Hydro',       sector:'Hydropower',  ltp:245.30,  high:250.00,  low:241.00,  open:244.00,  prevClose:238.40,  volume:35600 },
  { symbol:'NHPC',   name:'Nepal Hydro Power',           sector:'Hydropower',  ltp:68.50,   high:70.00,   low:67.00,   open:68.00,   prevClose:69.20,   volume:48200 },
  { symbol:'CHCL',   name:'Chilime Hydropower',          sector:'Hydropower',  ltp:398.00,  high:405.00,  low:392.00,  open:396.00,  prevClose:401.00,  volume:6800  },
  { symbol:'BPCL',   name:'Butwal Power Company',        sector:'Hydropower',  ltp:312.00,  high:318.00,  low:308.00,  open:314.00,  prevClose:308.50,  volume:9200  },
  { symbol:'HIDCL',  name:'Hydroelectricity Investment', sector:'Hydropower',  ltp:178.50,  high:182.00,  low:175.00,  open:178.00,  prevClose:180.20,  volume:28400 },
  { symbol:'NIFRA',  name:'Nepal Infrastructure Bank',   sector:'Development', ltp:102.40,  high:105.00,  low:100.00,  open:103.00,  prevClose:104.10,  volume:56000 },
  { symbol:'SIFC',   name:'Siddhartha Insurance',        sector:'Insurance',   ltp:816.00,  high:848.90,  low:815.00,  open:830.00,  prevClose:839.00,  volume:5430  },
  { symbol:'SHPC',   name:'Sanjen Hydropower',           sector:'Hydropower',  ltp:142.60,  high:146.00,  low:140.00,  open:143.00,  prevClose:144.80,  volume:18900 },
];

function calcChange(stock) {
  const change = +(stock.ltp - stock.prevClose).toFixed(2);
  const pct    = +((change / stock.prevClose) * 100).toFixed(2);
  return { ...stock, change, changePercent: pct };
}

// GET /api/market/indices
router.get('/indices', auth, (req, res) => {
  res.json({
    nepse:    { value: 2740.25, change: -4.15,  changePercent: -0.15 },
    sensind:  { value: 467.55,  change: -0.70,  changePercent: -0.15 },
    sensitive:{ value: 467.55,  change: -0.70,  changePercent: -0.15 },
    turnover: 2807446361.52,
    volume:   5643288,
    trades:   78432,
    marketStatus: 'CLOSED',
    date: new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' }),
  });
});

// GET /api/market/stocks?sector=Banking
router.get('/stocks', auth, (req, res) => {
  const { sector, search } = req.query;
  let list = STOCKS.map(calcChange);
  if (sector && sector !== 'All') list = list.filter(s => s.sector === sector);
  if (search) list = list.filter(s =>
    s.symbol.toLowerCase().includes(search.toLowerCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  res.json(list);
});

// GET /api/market/sectors
router.get('/sectors', auth, (req, res) => {
  const sectors = ['All', ...new Set(STOCKS.map(s => s.sector))];
  res.json(sectors);
});

// GET /api/market/summary - top gainers, losers
router.get('/summary', auth, (req, res) => {
  const all = STOCKS.map(calcChange);
  const gainers = [...all].sort((a,b) => b.changePercent - a.changePercent).slice(0,5);
  const losers  = [...all].sort((a,b) => a.changePercent - b.changePercent).slice(0,5);
  res.json({ gainers, losers });
});

module.exports = router;
