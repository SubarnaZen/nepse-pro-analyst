import React from 'react';
import { Calendar, Users, Briefcase } from 'lucide-react';

const MOCK_IPOS = [
  {
    id: 1,
    company: "Vision Lumjuni Jalvidyut Co. Ltd",
    type: "IPO (General Public)",
    units: "2,075,285",
    price: "Rs. 100",
    status: "Open",
    closeDate: "2024-05-15",
    manager: "NIBL Ace Capital"
  },
  {
    id: 2,
    company: "Sarbottam Cement Ltd",
    type: "IPO (Book Building)",
    units: "2,400,000",
    price: "Rs. 360.90",
    status: "Upcoming",
    closeDate: "2024-06-01",
    manager: "Global IME Capital"
  },
  {
    id: 3,
    company: "Muktinath Krishi Co. Ltd",
    type: "IPO (Foreign Migrants)",
    units: "400,000",
    price: "Rs. 100",
    status: "Upcoming",
    closeDate: "2024-06-10",
    manager: "NIMB Ace Capital"
  },
  {
    id: 4,
    company: "Himalayan Reinsurance Ltd",
    type: "IPO (Premium)",
    units: "30,000,000",
    price: "Rs. 206",
    status: "Closed",
    closeDate: "2024-01-20",
    manager: "NMB Capital"
  }
];

export default function IPOTracker() {
  const getStatusColor = (status) => {
    switch(status) {
      case 'Open': return 'var(--accent-teal)';
      case 'Upcoming': return 'var(--alert-amber)';
      case 'Closed': return 'var(--text-secondary)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="workspace">
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <h2>IPO / FPO Tracker</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {MOCK_IPOS.map(ipo => (
          <div 
            key={ipo.id}
            style={{
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-color)',
              borderLeft: `4px solid ${getStatusColor(ipo.status)}`,
              borderRadius: 'var(--radius-panel)',
              padding: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{ipo.company}</h3>
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                padding: '4px 8px', 
                borderRadius: '12px',
                backgroundColor: 'var(--bg-dark)',
                color: getStatusColor(ipo.status),
                border: `1px solid ${getStatusColor(ipo.status)}`
              }}>
                {ipo.status}
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Briefcase size={14} /> Type</span>
                <span style={{ color: 'var(--text-primary)' }}>{ipo.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={14} /> Units</span>
                <span className="mono" style={{ color: 'var(--text-primary)' }}>{ipo.units}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{fontWeight: 700}}>₨</span> Price</span>
                <span className="mono" style={{ color: 'var(--text-primary)' }}>{ipo.price}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> Close Date</span>
                <span className="mono" style={{ color: 'var(--text-primary)' }}>{ipo.closeDate}</span>
              </div>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Issue Manager: <span style={{ color: 'var(--text-primary)' }}>{ipo.manager}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
