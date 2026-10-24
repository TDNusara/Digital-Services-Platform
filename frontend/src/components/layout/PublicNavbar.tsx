import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Layers,
  Sparkles,
  User,
  UserPlus,
  ChevronDown,
  ArrowRight,
  LogOut,
  ExternalLink,
} from 'lucide-react';

interface PublicNavbarProps {
  currentTab: string;
  setCurrentTab: (tab: any) => void;
  openNewOrderModal: () => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  currentTab,
  setCurrentTab,
  openNewOrderModal,
}) => {
  const { user, isAuthenticated, logout, switchDemoAccount } = useAuth();
  const [showRegisterMenu, setShowRegisterMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const getDashboardRoute = () => {
    if (user?.role === 'ADMIN') return 'admin-control';
    if (user?.role === 'WORKER') return 'worker-workspace';
    return 'customer-portal';
  };

  const getDashboardLabel = () => {
    if (user?.role === 'ADMIN') return '🛡️ Admin Operations';
    if (user?.role === 'WORKER') return '💼 Specialist Workspace';
    return '👤 Customer Workspace';
  };

  const handleDemoSwitch = async (role: 'CUSTOMER' | 'WORKER' | 'ADMIN') => {
    setShowDemoMenu(false);
    await switchDemoAccount(role);
    if (role === 'ADMIN') setCurrentTab('admin-control');
    else if (role === 'WORKER') setCurrentTab('worker-workspace');
    else setCurrentTab('customer-portal');
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(11, 15, 25, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
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
              width: '2.4rem',
              height: '2.4rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary-500), #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Layers size={20} color="#FFFFFF" />
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
                SERVICES
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)' }}>
              Managed Digital & Document Services
            </div>
          </div>
        </div>

        {/* Public Navigation Links */}
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
        </nav>

        {/* Right Actions Cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Quick Demo Switcher Dropdown (Unobtrusive) */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.78rem',
                borderColor: 'rgba(99, 102, 241, 0.3)',
              }}
            >
              <Sparkles size={13} color="var(--primary-300)" />
              <span>Role Tester</span>
              <ChevronDown size={12} />
            </button>

            {showDemoMenu && (
              <div
                className="glass-card"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 0.4rem)',
                  width: '210px',
                  padding: '0.5rem',
                  zIndex: 200,
                  boxShadow: 'var(--shadow-xl)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
                onMouseLeave={() => setShowDemoMenu(false)}
              >
                <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.7rem', color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase' }}>
                  1-Click Switch Role
                </div>
                <button
                  onClick={() => handleDemoSwitch('CUSTOMER')}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start', textAlign: 'left', width: '100%' }}
                >
                  👤 Customer Hub
                </button>
                <button
                  onClick={() => handleDemoSwitch('WORKER')}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start', textAlign: 'left', width: '100%' }}
                >
                  💼 Specialist Workspace
                </button>
                <button
                  onClick={() => handleDemoSwitch('ADMIN')}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start', textAlign: 'left', width: '100%' }}
                >
                  🛡️ Admin Control
                </button>
              </div>
            )}
          </div>

          {/* If Logged In: Enter Workspace button */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setCurrentTab(getDashboardRoute())}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>{getDashboardLabel()}</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => {
                  logout();
                  setCurrentTab('login');
                }}
                title="Logout"
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.45rem' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            /* If Not Logged In: Sign In & Register */
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                className={`btn btn-sm ${currentTab === 'login' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCurrentTab('login')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <User size={14} />
                <span>Sign In</span>
              </button>

              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowRegisterMenu(!showRegisterMenu)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <UserPlus size={14} />
                  <span>Get Started</span>
                  <ChevronDown size={12} />
                </button>

                {showRegisterMenu && (
                  <div
                    className="glass-card"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 0.5rem)',
                      width: '230px',
                      padding: '0.5rem',
                      zIndex: 200,
                      boxShadow: 'var(--shadow-xl)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}
                    onMouseLeave={() => setShowRegisterMenu(false)}
                  >
                    <button
                      onClick={() => {
                        setShowRegisterMenu(false);
                        setCurrentTab('register-customer');
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'flex-start', textAlign: 'left', width: '100%', padding: '0.6rem 0.75rem' }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#FFFFFF' }}>👤 Register as Customer</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>For documents, academic & business tasks</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowRegisterMenu(false);
                        setCurrentTab('register-worker');
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'flex-start', textAlign: 'left', width: '100%', padding: '0.6rem 0.75rem' }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#38BDF8' }}>💼 Apply as Specialist</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>For freelance document experts</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default PublicNavbar;
