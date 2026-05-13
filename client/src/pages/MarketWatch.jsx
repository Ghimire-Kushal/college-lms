import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Star, StarOff, Search, RefreshCw,
  BarChart2, Activity, DollarSign, Eye
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />;
}

function ChangeChip({ value, pct }) {
  const up = value >= 0;
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md"
      style={{
        background: up ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
        color: up ? '#059669' : '#dc2626',
      }}>
      {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {up ? '+' : ''}{pct}%
    </span>
  );
}

const SECTORS = ['All', 'Banking', 'Insurance', 'Hydropower', 'Development'];

export default function MarketWatch() {
  const { dark } = useTheme();
  const [indices, setIndices] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState('All');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('market');
  const [watchlist, setWatchlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nepse_watchlist') || '[]'); } catch { return []; }
  });

  const cardBg  = dark ? '#131e1e' : '#ffffff';
  const border  = dark ? '#1e2e2e' : '#ede8e4';
  const headClr = dark ? '#e2e8f0' : '#1e293b';
  const subClr  = dark ? '#6e7681' : '#64748b';
  const rowHover = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';

  const fetchData = useCallback(async () => {
    try {
      const [idxRes, stockRes, sumRes] = await Promise.all([
        api.get('/market/indices'),
        api.get(`/market/stocks?sector=${sector}&search=${search}`),
        api.get('/market/summary'),
      ]);
      setIndices(idxRes.data);
      setStocks(stockRes.data);
      setSummary(sumRes.data);
    } catch {
      toast.error('Failed to load market data');
    } finally {
      setLoading(false);
    }
  }, [sector, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleWatchlist = (symbol) => {
    setWatchlist(prev => {
      const next = prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol];
      localStorage.setItem('nepse_watchlist', JSON.stringify(next));
      return next;
    });
  };

  const displayStocks = tab === 'watchlist'
    ? stocks.filter(s => watchlist.includes(s.symbol))
    : stocks;

  if (loading) return (
    <div className="space-y-5">
      <Skeleton className="h-24" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
      <Skeleton className="h-96" />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header banner */}
      <div className="rounded-2xl p-5 sm:p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1414 0%, #0f1e1e 55%, #162828 100%)' }}>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F2C04E 0%, transparent 70%)', opacity: 0.18 }} />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-[#F2C04E] text-xs font-semibold uppercase tracking-wider">NEPSE Market Watch</p>
            <h2 className="text-white text-xl sm:text-2xl font-bold mt-1">Nepal Stock Exchange</h2>
            <p className="text-white/50 text-sm mt-1">{indices?.date}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide"
              style={{ background: 'rgba(239,68,68,0.18)', color: '#f87171' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              {indices?.marketStatus || 'CLOSED'}
            </span>
            <button onClick={fetchData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all hover:opacity-80"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#e2e8f0' }}>
              <RefreshCw size={11} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Index cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'NEPSE Index', value: indices?.nepse?.value?.toLocaleString(), change: indices?.nepse?.change, pct: indices?.nepse?.changePercent, icon: Activity },
          { label: 'SENSIND', value: indices?.sensind?.value?.toLocaleString(), change: indices?.sensind?.change, pct: indices?.sensind?.changePercent, icon: BarChart2 },
          { label: 'Turnover (Rs)', value: indices ? `${(indices.turnover / 1e7).toFixed(2)}Cr` : '—', icon: DollarSign, noChange: true },
          { label: 'Total Volume', value: indices?.volume?.toLocaleString(), icon: Eye, noChange: true },
        ].map(({ label, value, change, pct, icon: Icon, noChange }) => (
          <div key={label} className="rounded-2xl p-4 border shadow-sm flex items-start gap-3"
            style={{ background: cardBg, borderColor: border }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: dark ? '#0f2020' : '#edf5f0', color: '#1E3535' }}>
              <Icon size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium truncate" style={{ color: subClr }}>{label}</p>
              <p className="text-[15px] font-bold mt-0.5 truncate" style={{ color: headClr }}>{value}</p>
              {!noChange && change !== undefined && (
                <ChangeChip value={change} pct={pct} />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main stock table */}
        <div className="lg:col-span-2 rounded-2xl border shadow-sm overflow-hidden"
          style={{ background: cardBg, borderColor: border }}>
          {/* Toolbar */}
          <div className="p-4 border-b flex flex-col sm:flex-row gap-3" style={{ borderColor: border }}>
            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl flex-shrink-0"
              style={{ background: dark ? '#0f1e1e' : '#f0ebe8' }}>
              {['market', 'watchlist'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all"
                  style={tab === t
                    ? { background: '#8B3030', color: '#fff', boxShadow: '0 2px 8px rgba(139,48,48,0.4)' }
                    : { color: subClr }}>
                  {t === 'watchlist' ? `Watchlist (${watchlist.length})` : 'Market'}
                </button>
              ))}
            </div>

            {/* Sector filter */}
            <div className="flex gap-1 flex-wrap">
              {SECTORS.map(s => (
                <button key={s} onClick={() => setSector(s)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
                  style={sector === s
                    ? { background: '#1E3535', color: '#fff' }
                    : { background: dark ? '#0f1e1e' : '#f0ebe8', color: subClr }}>
                  {s}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative sm:ml-auto">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: subClr }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search symbol…"
                className="pl-7 pr-3 py-1.5 rounded-xl text-[12px] border outline-none w-full sm:w-36 transition-all"
                style={{
                  background: dark ? '#0f1e1e' : '#f8f5f3',
                  borderColor: border,
                  color: headClr,
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {['Symbol', 'LTP', 'Change %', 'High', 'Low', 'Open', 'Prev Close', 'Volume', ''].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left font-semibold"
                      style={{ color: subClr, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayStocks.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-10 text-sm" style={{ color: subClr }}>
                    {tab === 'watchlist' ? 'No stocks in watchlist. Click ★ to add.' : 'No stocks found.'}
                  </td></tr>
                )}
                {displayStocks.map(s => (
                  <tr key={s.symbol} className="transition-colors"
                    style={{ borderBottom: `1px solid ${border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = rowHover}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td className="px-3 py-2.5">
                      <p className="font-bold" style={{ color: headClr }}>{s.symbol}</p>
                      <p className="text-[10px] truncate max-w-[110px]" style={{ color: subClr }}>{s.name}</p>
                    </td>
                    <td className="px-3 py-2.5 font-bold" style={{ color: headClr }}>
                      {s.ltp.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5">
                      <ChangeChip value={s.change} pct={s.changePercent} />
                    </td>
                    <td className="px-3 py-2.5" style={{ color: headClr }}>{s.high.toLocaleString()}</td>
                    <td className="px-3 py-2.5" style={{ color: headClr }}>{s.low.toLocaleString()}</td>
                    <td className="px-3 py-2.5" style={{ color: subClr }}>{s.open.toLocaleString()}</td>
                    <td className="px-3 py-2.5" style={{ color: subClr }}>{s.prevClose.toLocaleString()}</td>
                    <td className="px-3 py-2.5" style={{ color: subClr }}>{s.volume.toLocaleString()}</td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => toggleWatchlist(s.symbol)}
                        className="transition-colors hover:scale-110"
                        style={{ color: watchlist.includes(s.symbol) ? '#F2C04E' : subClr }}>
                        {watchlist.includes(s.symbol) ? <Star size={14} fill="#F2C04E" /> : <StarOff size={14} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-2.5 flex items-center justify-between border-t" style={{ borderColor: border }}>
            <p className="text-[11px]" style={{ color: subClr }}>{displayStocks.length} stocks</p>
            <p className="text-[11px]" style={{ color: subClr }}>
              {indices?.trades?.toLocaleString()} trades · {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Right panel: Trade Summary + Gainers/Losers */}
        <div className="space-y-4">
          {/* Trade Summary */}
          <div className="rounded-2xl p-4 border shadow-sm" style={{ background: cardBg, borderColor: border }}>
            <h3 className="text-[13px] font-semibold mb-3" style={{ color: headClr }}>Trade Summary</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Total Turnover', value: `Rs ${(indices?.turnover / 1e7).toFixed(2)} Cr` },
                { label: 'Total Volume', value: indices?.volume?.toLocaleString() },
                { label: 'Total Trades', value: indices?.trades?.toLocaleString() },
                { label: 'Market Status', value: indices?.marketStatus },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-1.5 border-b last:border-0"
                  style={{ borderColor: border }}>
                  <span className="text-[11px]" style={{ color: subClr }}>{label}</span>
                  <span className="text-[11px] font-semibold" style={{ color: headClr }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Gainers */}
          <div className="rounded-2xl p-4 border shadow-sm" style={{ background: cardBg, borderColor: border }}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} style={{ color: '#059669' }} />
              <h3 className="text-[13px] font-semibold" style={{ color: headClr }}>Top Gainers</h3>
            </div>
            <div className="space-y-2">
              {summary?.gainers?.map(s => (
                <div key={s.symbol} className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-bold" style={{ color: headClr }}>{s.symbol}</p>
                    <p className="text-[10px]" style={{ color: subClr }}>{s.ltp.toLocaleString()}</p>
                  </div>
                  <ChangeChip value={s.changePercent} pct={s.changePercent} />
                </div>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="rounded-2xl p-4 border shadow-sm" style={{ background: cardBg, borderColor: border }}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown size={14} style={{ color: '#dc2626' }} />
              <h3 className="text-[13px] font-semibold" style={{ color: headClr }}>Top Losers</h3>
            </div>
            <div className="space-y-2">
              {summary?.losers?.map(s => (
                <div key={s.symbol} className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-bold" style={{ color: headClr }}>{s.symbol}</p>
                    <p className="text-[10px]" style={{ color: subClr }}>{s.ltp.toLocaleString()}</p>
                  </div>
                  <ChangeChip value={s.changePercent} pct={s.changePercent} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
