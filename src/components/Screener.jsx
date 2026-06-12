import React, { useState } from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';

const MOCK_STOCKS = [
  { ticker: 'NABIL', sector: 'Commercial Banks', price: 580.50, change: 1.2, rsi: 45, volume: 125000, pe: 15.4 },
  { ticker: 'NICA', sector: 'Commercial Banks', price: 720.00, change: -0.8, rsi: 38, volume: 89000, pe: 18.2 },
  { ticker: 'GBIME', sector: 'Commercial Banks', price: 195.20, change: 0.5, rsi: 52, volume: 210000, pe: 12.1 },
  { ticker: 'SHIVM', sector: 'Manufacturing', price: 540.00, change: 3.4, rsi: 65, volume: 340000, pe: 35.6 },
  { ticker: 'HDL', sector: 'Manufacturing', price: 1850.00, change: -1.2, rsi: 42, volume: 15000, pe: 45.2 },
  { ticker: 'NTC', sector: 'Telecom', price: 890.00, change: 0.1, rsi: 50, volume: 45000, pe: 22.4 },
  { ticker: 'UPPER', sector: 'Hydropower', price: 345.00, change: 5.2, rsi: 72, volume: 550000, pe: 0 },
  { ticker: 'API', sector: 'Hydropower', price: 180.50, change: -2.1, rsi: 35, volume: 120000, pe: 45.1 },
  { ticker: 'NLIC', sector: 'Life Insurance', price: 650.00, change: 0.8, rsi: 55, volume: 65000, pe: 28.9 },
  { ticker: 'CIT', sector: 'Investment', price: 2100.00, change: 1.5, rsi: 60, volume: 8000, pe: 40.5 }
];

export default function Screener({ onSelectTicker, setActiveTab }) {
  const [filterSector, setFilterSector] = useState('All');
  const [filterRsi, setFilterRsi] = useState('All');

  const sectors = ['All', ...new Set(MOCK_STOCKS.map(s => s.sector))];

  const filteredStocks = MOCK_STOCKS.filter(stock => {
    let sectorMatch = filterSector === 'All' || stock.sector === filterSector;
    let rsiMatch = true;
    if (filterRsi === 'Oversold (<40)') rsiMatch = stock.rsi < 40;
    if (filterRsi === 'Neutral (40-60)') rsiMatch = stock.rsi >= 40 && stock.rsi <= 60;
    if (filterRsi === 'Overbought (>60)') rsiMatch = stock.rsi > 60;
    return sectorMatch && rsiMatch;
  });

  const handleRowClick = (ticker) => {
    onSelectTicker(ticker);
    setActiveTab('dashboard');
  };

  return (
    <div className="workspace">
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <h2>Stock Screener</h2>
      </div>

      <div style={{ 
        display: 'flex', gap: '16px', marginBottom: '24px', 
        backgroundColor: 'var(--bg-panel)', padding: '16px', 
        borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-color)' 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={12}/> Sector
          </label>
          <select 
            value={filterSector} 
            onChange={e => setFilterSector(e.target.value)}
            style={{ padding: '8px', backgroundColor: 'var(--bg-dark)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
          >
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={12}/> RSI (14)
          </label>
          <select 
            value={filterRsi} 
            onChange={e => setFilterRsi(e.target.value)}
            style={{ padding: '8px', backgroundColor: 'var(--bg-dark)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
          >
            <option>All</option>
            <option>Oversold (&lt;40)</option>
            <option>Neutral (40-60)</option>
            <option>Overbought (&gt;60)</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-panel)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Ticker</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sector</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Price (Rs)</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Change %</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>RSI</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Volume</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>P/E Ratio</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map(stock => (
              <tr 
                key={stock.ticker} 
                onClick={() => handleRowClick(stock.ticker)}
                style={{ 
                  borderBottom: '1px solid var(--border-color)', 
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td className="mono" style={{ padding: '12px 16px', color: 'var(--accent-teal)', fontWeight: 'bold' }}>{stock.ticker}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{stock.sector}</td>
                <td className="mono" style={{ padding: '12px 16px' }}>{stock.price.toFixed(2)}</td>
                <td className="mono" style={{ padding: '12px 16px', color: stock.change >= 0 ? 'var(--accent-teal)' : 'var(--signal-red)' }}>
                  {stock.change > 0 ? '+' : ''}{stock.change}%
                </td>
                <td className="mono" style={{ padding: '12px 16px', color: stock.rsi > 60 ? 'var(--signal-red)' : stock.rsi < 40 ? 'var(--accent-teal)' : 'var(--text-primary)' }}>
                  {stock.rsi}
                </td>
                <td className="mono" style={{ padding: '12px 16px' }}>{stock.volume.toLocaleString()}</td>
                <td className="mono" style={{ padding: '12px 16px' }}>{stock.pe > 0 ? stock.pe : 'N/A'}</td>
              </tr>
            ))}
            {filteredStocks.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>No stocks match your filter criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
