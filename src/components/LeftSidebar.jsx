import { useState } from 'react';
import { 
  LayoutDashboard, 
  Star, 
  Search, 
  Newspaper, 
  Calendar, 
  Briefcase, 
  Bell, 
  Globe, 
  Settings, 
  History,
  Menu,
  Zap
} from 'lucide-react';
import './LeftSidebar.css';

const navItems = [
  { id: 'dashboard',  label: 'Dashboard',       icon: LayoutDashboard },
  { id: 'zenchart',   label: 'ZenChart ⚡',     icon: Zap },
  { id: 'watchlist',  label: 'Watchlist',        icon: Star },
  { id: 'screener',   label: 'Stock Screener',   icon: Search },
  { id: 'news',       label: 'Market News',      icon: Newspaper },
  { id: 'ipo',        label: 'IPO / FPO Tracker',icon: Calendar },
  { id: 'portfolio',  label: 'Portfolio Tracker', icon: Briefcase },
  { id: 'alerts',     label: 'Alerts',           icon: Bell },
  { id: 'sites',      label: 'Important Sites',  icon: Globe },
  { id: 'history',    label: 'Analysis History', icon: History },
  { id: 'settings',   label: 'Settings',         icon: Settings },
];

export default function LeftSidebar({ activeTab, setActiveTab }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <h2 className="brand">NEPSE<span className="brand-accent">Pro</span></h2>}
        <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
          <Menu size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : ''}
            >
              <Icon size={20} className="nav-icon" />
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
