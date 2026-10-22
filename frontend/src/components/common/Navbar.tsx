import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  User,
  LogOut,
  Sparkles,
  Layers,
  ChevronDown,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openLoginModal: () => void;
  openNewOrderModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openLoginModal,
  openNewOrderModal,
}) => {
  const { user, isAuthenticated, logout, switchDemoAccount } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Top Demo Switcher Ribbon */}
      <div
        style={{
          background: 'linear-gradient(90deg, #1E1B4B 0%, #312E81 50%, #1E1B4B 100%)',
          padding: '0.4rem 1rem',
          fontSize: '0.8rem',
          color: '#E0E7FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          borderBottom: '1px solid rgba(99, 102, 241, 0.25)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Sparkles size={14} color="#818CF8" />
          <strong>Quick Role Switcher:</strong>
        </span>
        <button
          onClick={() => switchDemoAccount('CUSTOMER')}
          style={{
            background: user?.role === 'CUSTOMER' ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          👤 Customer Portal
        </button>
        <button
          onClick={() => switchDemoAccount('WORKER')}
          style={{
            background: user?.role === 'WORKER' ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          💼 Worker Workspace
        </button>
        <button
          onClick={() => switchDemoAccount('ADMIN')}
          style={{
            background: user?.role === 'ADMIN' ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          🛡️ Admin Control Center
        </button>
      </div>

      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4.5rem',
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={() => setCurrentTab('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary-500), #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Layers size={22} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                Task<span style={{ color: 'var(--primary-400)' }}>Pulse</span>
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  color: 'var(--primary-300)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                }}
              >
                PRO
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>
              Managed Digital & Document Services
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <button
            onClick={() => setCurrentTab('home')}
            style={{
              background: 'none',
              border: 'none',
              color: currentTab === 'home' ? 'var(--primary-300)' : 'var(--text-muted)',
              fontSize: '0.925rem',
              fontWeight: 600,
              cursor: 'pointer',
              borderBottom: currentTab === 'home' ? '2px solid var(--primary-500)' : '2px solid transparent',
              paddingBottom: '0.25rem',
              transition: 'all var(--transition-fast)',
            }}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentTab('catalog')}
            style={{
              background: 'none',
              border: 'none',
              color: currentTab === 'catalog' ? 'var(--primary-300)' : 'var(--text-muted)',
              fontSize: '0.925rem',
              fontWeight: 600,
              cursor: 'pointer',
              borderBottom: currentTab === 'catalog' ? '2px solid var(--primary-500)' : '2px solid transparent',
              paddingBottom: '0.25rem',
              transition: 'all var(--transition-fast)',
            }}
          >
            Services Catalog
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setCurrentTab('portal')}
              style={{
                background: 'none',
                border: 'none',
                color: currentTab === 'portal' ? 'var(--primary-300)' : 'var(--text-muted)',
                fontSize: '0.925rem',
                fontWeight: 600,
                cursor: 'pointer',
                borderBottom: currentTab === 'portal' ? '2px solid var(--primary-500)' : '2px solid transparent',
                paddingBottom: '0.25rem',
                transition: 'all var(--transition-fast)',
              }}
            >
              {user?.role === 'ADMIN'
                ? 'Admin Control'
                : user?.role === 'WORKER'
                ? 'Worker Workspace'
                : 'My Orders & Requests'}
            </button>
          )}
        </nav>

        {/* Right Action Cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={openNewOrderModal}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Sparkles size={16} />
            <span>Request Service</span>
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                onClick={() => setCurrentTab('portal')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.4rem 0.8rem',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    width: '1.8rem',
                    height: '1.8rem',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}
                >
                  {user?.fullName.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {user?.fullName.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--primary-300)', fontWeight: 600 }}>
                    {user?.role}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Logout"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-sub)',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={openLoginModal}>
              <User size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
