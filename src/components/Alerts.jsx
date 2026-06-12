import React, { useState, useEffect } from 'react';
import { Bell, Trash2, Plus, BellRing } from 'lucide-react';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [ticker, setTicker] = useState('');
  const [condition, setCondition] = useState('Above');
  const [price, setPrice] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('nepse_alerts');
    if (saved) {
      try { setAlerts(JSON.parse(saved)); } catch(e){}
    }
  }, []);

  const saveAlerts = (updated) => {
    setAlerts(updated);
    localStorage.setItem('nepse_alerts', JSON.stringify(updated));
  };

  const handleAddAlert = (e) => {
    e.preventDefault();
    if (!ticker || !price) return;
    
    const newAlert = {
      id: Date.now().toString(),
      ticker: ticker.toUpperCase(),
      condition,
      price: parseFloat(price),
      active: true
    };
    
    saveAlerts([...alerts, newAlert]);
    setTicker(''); setPrice('');
  };

  const removeAlert = (id) => {
    saveAlerts(alerts.filter(a => a.id !== id));
  };

  const toggleAlert = (id) => {
    saveAlerts(alerts.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  return (
    <div className="workspace">
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <h2>Price Alerts</h2>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, backgroundColor: 'var(--bg-panel)', padding: '24px', borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16}/> Create Alert
          </h3>
          <form onSubmit={handleAddAlert} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Ticker</label>
              <input required value={ticker} onChange={e => setTicker(e.target.value)} placeholder="e.g. NABIL" className="mono" style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-dark)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Condition</label>
              <select value={condition} onChange={e => setCondition(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-dark)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                <option value="Above">Goes Above</option>
                <option value="Below">Goes Below</option>
                <option value="Exactly">Is Exactly</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Target Price (Rs)</label>
              <input required type="number" step="any" value={price} onChange={e => setPrice(e.target.value)} placeholder="600" className="mono" style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-dark)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Bell size={16} /> Set Alert
            </button>
          </form>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '16px', lineHeight: 1.4 }}>
            Alerts run entirely in your browser. Since there is no background server, alerts are purely visual configurations for the MVP.
          </p>
        </div>

        <div style={{ flex: 2 }}>
          {alerts.length === 0 ? (
            <div style={{ backgroundColor: 'var(--bg-panel)', padding: '48px', borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <BellRing size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
              <h3>No Active Alerts</h3>
              <p>Create an alert to get notified of price movements.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {alerts.map(a => (
                <div 
                  key={a.id}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    backgroundColor: 'var(--bg-panel)', padding: '16px', 
                    borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-color)',
                    opacity: a.active ? 1 : 0.5
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '50%', 
                      backgroundColor: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: a.active ? 'var(--alert-amber)' : 'var(--text-secondary)'
                    }}>
                      <Bell size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }} className="mono">{a.ticker}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Alert when price goes <strong style={{color: 'var(--text-primary)'}}>{a.condition.toLowerCase()}</strong> ₨ <span className="mono">{a.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button 
                      onClick={() => toggleAlert(a.id)}
                      style={{ 
                        padding: '6px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600,
                        backgroundColor: a.active ? 'rgba(0, 212, 170, 0.1)' : 'var(--bg-dark)',
                        color: a.active ? 'var(--accent-teal)' : 'var(--text-secondary)',
                        border: `1px solid ${a.active ? 'var(--accent-teal)' : 'var(--border-color)'}`
                      }}
                    >
                      {a.active ? 'Active' : 'Paused'}
                    </button>
                    <button onClick={() => removeHolding(a.id)} style={{ color: 'var(--signal-red)', padding: '4px' }} title="Delete Alert">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
