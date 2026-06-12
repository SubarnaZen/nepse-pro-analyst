import React from 'react';
import './SectorPanel.css';

const SECTORS = [
  {
    name: 'Commercial Banks',
    tickers: ['ADBL', 'CZBIL', 'EBL', 'GBIME', 'HBL', 'KBL', 'MBL', 'NABIL', 'NBL', 'NICA', 'NIB', 'NMB', 'PCBL', 'PRVU', 'SBI', 'SANIMA', 'SCB', 'SIL', 'SRBL']
  },
  {
    name: 'Development Banks',
    tickers: ['CORBL', 'EDBL', 'GBBL', 'GRDBL', 'HAMRO', 'JBBL', 'KSBBL', 'LBBL', 'MFDB', 'MDB', 'MNBBL', 'MSLB', 'NABBC', 'NGBL', 'SADBL', 'SAPDBL', 'SHINE', 'SINDU']
  },
  {
    name: 'Finance Companies',
    tickers: ['CFCL', 'GFCL', 'GUFL', 'ICFC', 'JFL', 'MFIL', 'NFS', 'PFL', 'PROFL', 'RLFL', 'SFCL', 'SIFC']
  },
  {
    name: 'Life Insurance',
    tickers: ['CLI', 'GLI', 'HLI', 'ILI', 'JLI', 'LIC', 'MLBSL', 'NLIC', 'PLI', 'PLIC', 'RNLI', 'SNLI']
  },
  {
    name: 'Non-Life Insurance',
    tickers: ['AIL', 'GILB', 'HGI', 'IGI', 'LGIL', 'MIC', 'NICL', 'NIL', 'NLG', 'PICL', 'PIC', 'PRIN', 'RBCL', 'SALICO', 'SGI', 'SICL', 'SIL', 'UAIL']
  },
  {
    name: 'Hydropower',
    tickers: ['AHPC', 'AKJCL', 'API', 'BARUN', 'BPCL', 'CHCL', 'DHPL', 'GHL', 'HDHPC', 'HURJA', 'KBSH', 'KPCL', 'KRBL', 'MBJC', 'MCHL', 'NHDL', 'NHPC', 'NWEDC', 'PMHPL', 'RADHI', 'RIDI', 'RHPC', 'RRHPCL', 'SHEL', 'SHPC', 'SHL', 'SJCL', 'SSHL', 'UMHL', 'UNHPL', 'UPPER', 'UPCL']
  },
  {
    name: 'Manufacturing & Processing',
    tickers: ['BNL', 'BNT', 'BSL', 'CIT', 'GCIL', 'HDL', 'HNBBL', 'NKU', 'NTC', 'PLI', 'RIDI', 'SHIVM', 'SRHL', 'STML', 'SWBBL', 'UNHPL']
  },
  {
    name: 'Hotels & Tourism',
    tickers: ['CGH', 'OMHL', 'OHL', 'SHL', 'TRH', 'YHL']
  },
  {
    name: 'Telecom',
    tickers: ['NTC', 'NCELL']
  },
  {
    name: 'Others / Investment',
    tickers: ['CHDC', 'HIDCL', 'NIFRA', 'NRN', 'SPDL']
  },
  {
    name: 'Trading',
    tickers: ['STC', 'NRBL']
  }
];

export default function SectorPanel({ selectedTicker, onSelectTicker }) {
  const [expandedSector, setExpandedSector] = React.useState(SECTORS[0].name);

  return (
    <div className="sector-panel">
      <div className="sectors-list">
        {SECTORS.map((sector) => (
          <div key={sector.name} className="sector-card">
            <button 
              className={`sector-header ${expandedSector === sector.name ? 'active' : ''}`}
              onClick={() => setExpandedSector(expandedSector === sector.name ? null : sector.name)}
            >
              <span>{sector.name}</span>
              <span className="pulse-dot"></span>
            </button>
            {expandedSector === sector.name && (
              <div className="sector-grid">
                {sector.tickers.map((ticker) => (
                  <button
                    key={ticker}
                    className={`ticker-btn mono ${selectedTicker === ticker ? 'selected' : ''}`}
                    onClick={() => onSelectTicker(ticker)}
                  >
                    {ticker}
                    {ticker === 'NCELL' && <span className="unlisted-badge" title="Not listed yet">*</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
