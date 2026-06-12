import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';

const MOCK_NEWS = [
  {
    id: 1,
    title: "NABIL Bank proposes 11% dividend for FY 2080/81",
    source: "ShareSansar",
    time: "2 hours ago",
    snippet: "Nabil Bank Limited has proposed an 11% cash dividend for its shareholders from the distributable profit of the fiscal year 2080/81. The proposal is subject to approval from Nepal Rastra Bank and the company's upcoming AGM.",
    url: "https://www.sharesansar.com"
  },
  {
    id: 2,
    title: "NEPSE index drops by 15 points amidst low trading volume",
    source: "MeroLagani",
    time: "4 hours ago",
    snippet: "The Nepal Stock Exchange (NEPSE) index saw a decline of 15.2 points today, closing at 2,015. The trading volume remained sluggish as investors await the upcoming monetary policy review.",
    url: "https://merolagani.com"
  },
  {
    id: 3,
    title: "Upcoming IPO: Sonapur Minerals to issue 1.5M shares",
    source: "NepseAlpha",
    time: "5 hours ago",
    snippet: "Sonapur Minerals and Oil Limited is set to issue 1.5 million ordinary shares to the general public. The issue manager has stated that the offering will open next week.",
    url: "https://nepsealpha.com"
  },
  {
    id: 4,
    title: "Hydropower sector leads the market turnover today",
    source: "ShareSansar",
    time: "1 day ago",
    snippet: "Despite a bearish overall market, the hydropower sector witnessed significant trading activity today, contributing to over 40% of the total daily turnover.",
    url: "https://www.sharesansar.com"
  },
  {
    id: 5,
    title: "SEBON tightens regulations on margin lending",
    source: "Nepal Stock",
    time: "1 day ago",
    snippet: "The Securities Board of Nepal (SEBON) has issued new directives tightening the margin lending limits for institutional investors to mitigate systemic risks.",
    url: "https://sebon.gov.np"
  }
];

export default function MarketNews() {
  return (
    <div className="workspace">
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <h2>Market News</h2>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px' }}>
        {MOCK_NEWS.map(news => (
          <div 
            key={news.id}
            style={{
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-panel)',
              padding: '20px',
              transition: 'border-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-teal)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{news.title}</h3>
              <a 
                href={news.url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontSize: '0.875rem' }}
              >
                Read <ExternalLink size={14} />
              </a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              <span style={{ fontWeight: 600, color: 'var(--alert-amber)' }}>{news.source}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {news.time}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
              {news.snippet}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
