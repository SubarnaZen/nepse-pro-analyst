import React, { useState, useEffect } from 'react';
import { Star, Trash2, ArrowRight } from 'lucide-react';

export default function Watchlist({ onSelectTicker, setActiveTab }) {
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('nepse_watchlist');
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) {
        setWatchlist([]);
      }
    }
  }, []);

  const saveWatchlist = (newList) => {
    setWatchlist(newList);
    localStorage.setItem('nepse_watchlist', JSON.stringify(newList));
  };

  const removeTicker = (ticker) => {
    const newList = watchlist.filter(t => t !== ticker);
    saveWatchlist(newList);
  };

  const handleAnalyzeClick = (ticker) => {
    onSelectTicker(ticker);
    setActiveTab('dashboard');
  };

  return (
    <div className="workspace">
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <h2>Watchlist</h2>
      </div>
      
      {watchlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
          <Star size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
          <h3>Your watchlist is empty</h3>
          <p>Go to the dashboard and star some stocks to add them here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {watchlist.map(ticker => (
            <div 
              key={ticker} 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                backgroundColor: 'var(--bg-panel)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-panel)'
              }}
            >
              <div>
                <h3 className="mono" style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>{ticker}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Added to watchlist</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  onClick={() => handleAnalyzeClick(ticker)}
                >
                  Analyze <ArrowRight size={14} />
                </button>
                <button 
                  style={{ color: 'var(--signal-red)', padding: '8px' }}
                  onClick={() => removeTicker(ticker)}
                  title="Remove from watchlist"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
