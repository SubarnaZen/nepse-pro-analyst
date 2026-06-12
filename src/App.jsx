import { useState, useEffect } from 'react';
import LeftSidebar from './components/LeftSidebar';
import MainContent from './components/MainContent';
import SectorPanel from './components/SectorPanel';
import ImportantSites from './components/ImportantSites';
import Watchlist from './components/Watchlist';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('Anthropic');

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('nepse_api_key');
    const savedProvider = localStorage.getItem('nepse_api_provider');
    if (savedKey) setApiKey(savedKey);
    if (savedProvider) setProvider(savedProvider);
  }, []);

  const handleKeyChange = (e) => {
    setApiKey(e.target.value);
    localStorage.setItem('nepse_api_key', e.target.value);
  };

  const handleProviderChange = (e) => {
    setProvider(e.target.value);
    localStorage.setItem('nepse_api_provider', e.target.value);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <MainContent selectedTicker={selectedTicker} apiKey={apiKey} provider={provider} />
            <SectorPanel selectedTicker={selectedTicker} onSelectTicker={setSelectedTicker} />
          </>
        );
      case 'sites':
        return <ImportantSites />;
      case 'watchlist':
        return <Watchlist onSelectTicker={setSelectedTicker} setActiveTab={setActiveTab} />;
      case 'settings':
        return (
          <div className="workspace">
            <div className="section-header">
              <h2>Settings</h2>
            </div>
            <div style={{ maxWidth: '600px', backgroundColor: 'var(--bg-panel)', padding: '24px', borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-color)' }}>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>AI Model Provider</label>
                <select 
                  value={provider}
                  onChange={handleProviderChange}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    backgroundColor: 'var(--bg-dark)', 
                    border: '1px solid var(--border-color)', 
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-button)',
                    fontFamily: 'var(--font-ui)',
                    marginBottom: '16px'
                  }}
                >
                  <option value="Anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                  <option value="Gemini">Google Gemini (Gemini 1.5 Pro)</option>
                  <option value="Grok">xAI (Grok Beta)</option>
                  <option value="Kimi">Moonshot (Kimi 8k)</option>
                </select>

                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>API Key for {provider}</label>
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={handleKeyChange}
                  placeholder={`Enter your ${provider} API Key...`}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    backgroundColor: 'var(--bg-dark)', 
                    border: '1px solid var(--border-color)', 
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-button)',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Your key is stored locally in your browser's localStorage and never sent anywhere except directly to {provider}.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="workspace">
            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>This section is under construction for MVP.</p>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        <header className="top-bar">
          <div className="current-context">
            <span className="mono" style={{ color: 'var(--text-secondary)' }}>
              {activeTab.toUpperCase()} {selectedTicker ? `> ${selectedTicker}` : ''}
            </span>
          </div>
          <div className="actions">
            {/* Additional header actions could go here */}
          </div>
        </header>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
