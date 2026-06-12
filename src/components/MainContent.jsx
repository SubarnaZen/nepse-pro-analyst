import React, { useState } from 'react';
import './MainContent.css';
import { ExternalLink, Play, AlertCircle } from 'lucide-react';

import { analyzeStock } from '../services/ai';

export default function MainContent({ selectedTicker, apiKey }) {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!selectedTicker) return;
    if (!apiKey) {
      alert("Please set your Anthropic API Key in Settings first.");
      return;
    }

    setLoading(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeStock(selectedTicker, apiKey);
      setAnalysisResult(result);
    } catch (error) {
      setAnalysisResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = () => {
    const saved = localStorage.getItem('nepse_watchlist');
    let watchlist = [];
    if (saved) {
      try { watchlist = JSON.parse(saved); } catch(e){}
    }
    if (!watchlist.includes(selectedTicker)) {
      watchlist.push(selectedTicker);
      localStorage.setItem('nepse_watchlist', JSON.stringify(watchlist));
      alert(`${selectedTicker} added to watchlist!`);
    } else {
      alert(`${selectedTicker} is already in your watchlist.`);
    }
  };

  if (!selectedTicker) {
    return (
      <div className="main-content-empty">
        <div className="empty-state">
          <AlertCircle size={48} className="empty-icon" />
          <h3>Select a Ticker</h3>
          <p>Choose a stock from the sector panel below or search to view analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content-area">
      <div className="chart-section">
        <div className="section-header">
          <h3>
            Live Chart: <span className="mono">{selectedTicker}</span>
            <button 
              onClick={handleAddToWatchlist}
              style={{ color: 'var(--alert-amber)', marginLeft: '8px', padding: '4px' }}
              title="Add to Watchlist"
            >
              ★
            </button>
          </h3>
          <a 
            href={`https://nepsealpha.com/trading/chart?symbol=${selectedTicker}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-link"
          >
            Open in NepseAlpha <ExternalLink size={14} />
          </a>
        </div>
        <div className="chart-container">
          <iframe 
            src={`https://nepsealpha.com/trading/chart?symbol=${selectedTicker}`}
            title={`${selectedTicker} Chart`}
            className="nepse-iframe"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
      </div>

      <div className="analysis-section">
        <div className="section-header">
          <h3>AI Analysis Engine</h3>
          <button 
            className="btn-primary flex-center"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? 'Analyzing...' : <><Play size={14} style={{marginRight: '6px'}}/> Run Analysis</>}
          </button>
        </div>
        <div className="analysis-output mono">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Analyzing order blocks, Wyckoff phases, and ICT concepts...</p>
            </div>
          ) : analysisResult ? (
            <pre className="analysis-text">{analysisResult}</pre>
          ) : (
            <div className="placeholder-state">
              <p>Click "Run Analysis" to generate an AI-powered technical breakdown using SMC, ICT, and Wyckoff frameworks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
