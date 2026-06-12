export const IMPORTANT_SITES = [
  { name: 'NepseAlpha', url: 'https://nepsealpha.com' },
  { name: 'Mero Lagani', url: 'https://merolagani.com' },
  { name: 'ShareSansar', url: 'https://www.sharesansar.com' },
  { name: 'CDSC Nepal', url: 'https://www.cdsc.com.np' },
  { name: 'Nepal Stock', url: 'https://nepalstock.com.np' },
  { name: 'SEBON', url: 'https://sebon.gov.np' },
  { name: 'NEPSE', url: 'https://www.nepalstock.com' },
  { name: 'Trading View (NEPSE)', url: 'https://www.tradingview.com/symbols/NEPSE/' }
];

export default function ImportantSites() {
  return (
    <div className="workspace">
      <div className="section-header">
        <h2>Important Sites</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
        {IMPORTANT_SITES.map((site) => (
          <a
            key={site.name}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-color)',
              padding: '24px',
              borderRadius: 'var(--radius-panel)',
              textDecoration: 'none',
              color: 'var(--text-primary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-teal)';
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.backgroundColor = 'var(--bg-panel)';
            }}
          >
            <h3 style={{ margin: 0, color: 'var(--accent-teal)' }}>{site.name}</h3>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{site.url}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
