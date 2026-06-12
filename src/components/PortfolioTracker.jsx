import React, { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

// Using the same mock data prices for calculations
const MOCK_CURRENT_PRICES = {
  'NABIL': 580.50, 'NICA': 720.00, 'GBIME': 195.20, 'SHIVM': 540.00, 'HDL': 1850.00,
  'NTC': 890.00, 'UPPER': 345.00, 'API': 180.50, 'NLIC': 650.00, 'CIT': 2100.00
};

export default function PortfolioTracker() {
  const [holdings, setHoldings] = useState([]);
  const [newTicker, setNewTicker] = useState('');
  const [newUnits, setNewUnits] = useState('');
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('nepse_portfolio');
    if (saved) {
      try { setHoldings(JSON.parse(saved)); } catch(e){}
    }
  }, []);

  const saveHoldings = (updatedHoldings) => {
    setHoldings(updatedHoldings);
    localStorage.setItem('nepse_portfolio', JSON.stringify(updatedHoldings));
  };

  const handleAddHolding = (e) => {
    e.preventDefault();
    if (!newTicker || !newUnits || !newPrice) return;
    
    const holding = {
      id: Date.now().toString(),
      ticker: newTicker.toUpperCase(),
      units: parseFloat(newUnits),
      buyPrice: parseFloat(newPrice)
    };
    
    saveHoldings([...holdings, holding]);
    setNewTicker(''); setNewUnits(''); setNewPrice('');
  };

  const removeHolding = (id) => {
    saveHoldings(holdings.filter(h => h.id !== id));
  };

  // Calculate totals
  const totalInvestment = holdings.reduce((sum, h) => sum + (h.units * h.buyPrice), 0);
  const currentValue = holdings.reduce((sum, h) => {
    const currentPrice = MOCK_CURRENT_PRICES[h.ticker] || h.buyPrice; // fallback to buy price if mock doesn't have it
    return sum + (h.units * currentPrice);
  }, 0);
  const totalPnL = currentValue - totalInvestment;
  const pnlPercentage = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;

  return (
    <div className="workspace">
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <h2>Portfolio Tracker</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'var(--bg-panel)', padding: '20px', borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-color)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>Total Investment</div>
          <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₨ {totalInvestment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-panel)', padding: '20px', borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-color)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>Current Value</div>
          <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₨ {currentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-panel)', padding: '20px', borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-color)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>Total P&L</div>
          <div className="mono" style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            color: totalPnL >= 0 ? 'var(--accent-teal)' : 'var(--signal-red)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            {totalPnL >= 0 ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
            ₨ {Math.abs(totalPnL).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>({pnlPercentage > 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <div style={{ flex: 2, backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-panel)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Ticker</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Units</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Buy Price</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>LTP (Simulated)</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>P&L</th>
                <th style={{ padding: '12px 16px' }}></th>
              </tr>
            </thead>
            <tbody>
              {holdings.map(h => {
                const currentPrice = MOCK_CURRENT_PRICES[h.ticker] || h.buyPrice;
                const pnl = (currentPrice - h.buyPrice) * h.units;
                const pnlPct = ((currentPrice - h.buyPrice) / h.buyPrice) * 100;
                
                return (
                  <tr key={h.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="mono" style={{ padding: '12px 16px', fontWeight: 'bold' }}>{h.ticker}</td>
                    <td className="mono" style={{ padding: '12px 16px' }}>{h.units}</td>
                    <td className="mono" style={{ padding: '12px 16px' }}>{h.buyPrice.toFixed(2)}</td>
                    <td className="mono" style={{ padding: '12px 16px' }}>{currentPrice.toFixed(2)}</td>
                    <td className="mono" style={{ padding: '12px 16px', color: pnl >= 0 ? 'var(--accent-teal)' : 'var(--signal-red)' }}>
                      {pnl > 0 ? '+' : ''}{pnl.toFixed(2)} ({pnlPct.toFixed(2)}%)
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button onClick={() => removeHolding(h.id)} style={{ color: 'var(--signal-red)' }} title="Remove">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {holdings.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No stocks in portfolio. Add one using the form.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ flex: 1, backgroundColor: 'var(--bg-panel)', padding: '24px', borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16}/> Add Holding
          </h3>
          <form onSubmit={handleAddHolding} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Ticker</label>
              <input required value={newTicker} onChange={e => setNewTicker(e.target.value)} placeholder="e.g. NABIL" className="mono" style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-dark)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Quantity (Units)</label>
              <input required type="number" min="1" step="any" value={newUnits} onChange={e => setNewUnits(e.target.value)} placeholder="100" className="mono" style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-dark)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Buy Price (Rs)</label>
              <input required type="number" min="1" step="any" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="580.5" className="mono" style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-dark)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Add to Portfolio</button>
          </form>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '16px', lineHeight: 1.4 }}>
            Note: LTP uses simulated static prices for known tickers in the MVP.
          </p>
        </div>
      </div>
    </div>
  );
}
