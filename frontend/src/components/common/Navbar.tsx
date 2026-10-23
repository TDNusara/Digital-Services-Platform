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
  UserPlus,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openNewOrderModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openNewOrderModal,
}) => {
  const { user, isAuthenticated, logout, switchDemoAccount } = useAuth();
  const [showRegisterMenu, setShowRegisterMenu] = useState(false);

  const handleDemoSwitch = async (role: 'CUSTOMER' | 'WORKER' | 'ADMIN') => {
    await switchDemoAccount(role);
    if (role === 'ADMIN') {
      setCurrentTab('admin-control');
    } else if (role === 'WORKER') {
      setCurrentTab('worker-workspace');
    } else {
      setCurrentTab('customer-portal');
    }
  };

  const getRoleDashboardTab = () => {
    if (user?.role === 'ADMIN') return 'admin-control';
    if (user?.role === 'WORKER') return 'worker-workspace';
    return 'customer-portal';
  };

  const getRoleDashboardLabel = () => {
    if (user?.role === 'ADMIN') return '🛡️ Admin Control';
    if (user?.role === 'WORKER') return '💼 Specialist Workspace';
    return '👤 Customer Portal';
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(11, 15, 25, 0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Top Demo Switcher Ribbon (1-Click Tester) */}
      <div
        style={{
          background: 'linear-gradient(90deg, #1E1B4B 0%, #312E81 50%, #1E1B4B 100%)',
          padding: '0.35rem 1rem',
          fontSize: '0.78rem',
          color: '#E0E7FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid rgba(99, 102, 241, 0.25)',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#A5B4FC' }}>
          <Sparkles size={13} color="#818CF8" />
          <strong>Independent Role Pages (1-Click Switch):</strong>
        </span>
        <button
          onClick={() => handleDemoSwitch('CUSTOMER')}
          style={{
            background: user?.role === 'CUSTOMER' && currentTab === 'customer-portal' ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontWeight: 600,
          }}
        >
          👤 Customer Page
        </button>
        <button
          onClick={() => handleDemoSwitch('WORKER')}
          style={{
            background: user?.role === 'WORKER' && currentTab === 'worker-workspace' ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontWeight: 600,
          }}
        >
          💼 Specialist Page
        </button>
        <button
          onClick={() => handleDemoSwitch('ADMIN')}
          style={{
            background: user?.role === 'ADMIN' && currentTab === 'admin-control' ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontWeight: 600,
          }}
        >
          🛡️ Admin Page
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
                PLATFORM
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)' }}>
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

          {/* Active Role Portal Tab (if logged in) */}
          {isAuthenticated && (
            <button
              onClick={() => setCurrentTab(getRoleDashboardTab())}
              style={{
                background: 'none',
                border: 'none',
                color: currentTab === getRoleDashboardTab() ? 'var(--primary-300)' : 'var(--text-muted)',
                fontSize: '0.925rem',
                fontWeight: 700,
                cursor: 'pointer',
                borderBottom: currentTab === getRoleDashboardTab() ? '2px solid var(--primary-500)' : '2px solid transparent',
                paddingBottom: '0.25rem',
                transition: 'all var(--transition-fast)',
              }}
            >
              {getRoleDashboardLabel()}
            </button>
          )}
        </nav>

        {/* Right Action Cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={openNewOrderModal}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Sparkles size={15} />
            <span>Request Service</span>
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                onClick={() => setCurrentTab(getRoleDashboardTab())}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.35rem 0.75rem',
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
                    backgroundColor: user?.role === 'ADMIN' ? 'var(--warning)' : user?.role === 'WORKER' ? '#0284C7' : 'var(--primary-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    color: '#FFFFFF',
                  }}
                >
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {user?.fullName?.split(' ')[0]}
                  </div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      color: user?.role === 'ADMIN' ? 'var(--warning)' : user?.role === 'WORKER' ? '#38BDF8' : 'var(--primary-300)',
                      fontWeight: 700,
                    }}
                  >
                    {user?.role}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  setCurrentTab('login');
                }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
              <button
                className={`btn btn-sm ${currentTab === 'login' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCurrentTab('login')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <User size={15} />
                <span>Sign In</span>
              </button>

              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowRegisterMenu(!showRegisterMenu)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <UserPlus size={15} />
                  <span>Register</span>
                  <ChevronDown size={13} />
                </button>

                {showRegisterMenu && (
                  <div
                    className="glass-card"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 0.5rem)',
                      width: '240px',
                      padding: '0.5rem',
                      zIndex: 200,
                      boxShadow: 'var(--shadow-xl)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                    }}
                    onMouseLeave={() => setShowRegisterMenu(false)}
                  >
                    <button
                      onClick={() => {
                        setShowRegisterMenu(false);
                        setCurrentTab('register-customer');
                      }}
                      style={{
                        padding: '0.65rem 0.75rem',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.15rem',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#FFFFFF' }}>
                        👤 Register as Customer
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                        For students, businesses, & employees
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowRegisterMenu(false);
                        setCurrentTab('register-worker');
                      }}
                      style={{
                        padding: '0.65rem 0.75rem',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.15rem',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#38BDF8' }}>
                        💼 Apply as Specialist
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                        For freelancers & document experts
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
