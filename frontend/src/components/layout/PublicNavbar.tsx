import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Layers,
  User,
  UserPlus,
  ChevronDown,
  ArrowRight,
  LogOut,
  Plus,
  Menu,
  X,
  Shield,
  Briefcase,
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
  const { user, isAuthenticated, logout } = useAuth();
  const [showRegisterMenu, setShowRegisterMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardRoute = () => {
    if (user?.role === 'ADMIN') return 'admin-control';
    if (user?.role === 'WORKER') return 'worker-workspace';
    return 'customer-portal';
  };

  const getRoleBadge = () => {
    if (user?.role === 'ADMIN') {
      return { label: 'Admin', color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.15)', icon: Shield };
    }
    if (user?.role === 'WORKER') {
      return { label: 'Specialist', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)', icon: Briefcase };
    }
    return { label: 'Customer', color: 'var(--primary-300)', bg: 'rgba(99, 102, 241, 0.15)', icon: User };
  };

  const roleInfo = getRoleBadge();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(11, 15, 25, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
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
          onClick={() => {
            setCurrentTab('home');
            setMobileMenuOpen(false);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            userSelect: 'none',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                Task<span style={{ color: 'var(--primary-400)' }}>Pulse</span>
              </span>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(99, 102, 241, 0.18)',
                  color: 'var(--primary-300)',
                  padding: '0.12rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                  letterSpacing: '0.04em',
                }}
              >
                PLATFORM
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)', letterSpacing: '0.01em' }}>
              Verified Digital & Document Services
            </div>
          </div>
        </div>

        {/* Desktop Public Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '2rem',
          }}
          className="desktop-nav"
        >
          <button
            onClick={() => setCurrentTab('home')}
            style={{
              background: 'none',
              border: 'none',
              color: currentTab === 'home' || currentTab === 'guest-home' ? 'var(--primary-300)' : 'var(--text-muted)',
              fontSize: '0.925rem',
              fontWeight: 600,
              cursor: 'pointer',
              borderBottom: currentTab === 'home' || currentTab === 'guest-home' ? '2px solid var(--primary-500)' : '2px solid transparent',
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

        {/* Right Desktop Actions Cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {isAuthenticated ? (
            /* Logged In State: User Portal Button & Profile */
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.35rem 0.75rem 0.35rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    width: '1.85rem',
                    height: '1.85rem',
                    borderRadius: '50%',
                    backgroundColor: roleInfo.bg,
                    color: roleInfo.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                  }}
                >
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
                    {user?.fullName || 'User'}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: roleInfo.color, fontWeight: 700 }}>
                    {roleInfo.label}
                  </span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => setCurrentTab(getDashboardRoute())}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.95rem' }}
              >
                <span>Dashboard</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => {
                  logout();
                  setCurrentTab('login');
                }}
                title="Sign Out"
                className="btn btn-secondary btn-sm"
                style={{
                  padding: '0.55rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-sub)',
                }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            /* Unauthenticated State: Sign In & Registration Options */
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={openNewOrderModal}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.55rem 0.85rem' }}
              >
                <Plus size={14} />
                <span>Request Service</span>
              </button>

              <button
                className={`btn btn-sm ${currentTab === 'login' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCurrentTab('login')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 0.95rem',
                  fontWeight: 600,
                }}
              >
                <User size={14} />
                <span>Sign In</span>
              </button>

              {/* Clean Registration Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowRegisterMenu(!showRegisterMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.55rem 0.95rem',
                    fontWeight: 600,
                  }}
                >
                  <UserPlus size={14} />
                  <span>Get Started</span>
                  <ChevronDown size={13} />
                </button>

                {showRegisterMenu && (
                  <div
                    className="glass-card"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 0.5rem)',
                      width: '260px',
                      padding: '0.5rem',
                      zIndex: 200,
                      boxShadow: 'var(--shadow-xl)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                    }}
                    onMouseLeave={() => setShowRegisterMenu(false)}
                  >
                    <button
                      onClick={() => {
                        setShowRegisterMenu(false);
                        setCurrentTab('register-customer');
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        width: '100%',
                        padding: '0.75rem 0.85rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.65rem',
                      }}
                    >
                      <User size={17} color="var(--primary-300)" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.85rem' }}>Customer Account</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginTop: '2px' }}>
                          Order verified formatting & digital tasks
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowRegisterMenu(false);
                        setCurrentTab('register-worker');
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        width: '100%',
                        padding: '0.75rem 0.85rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.65rem',
                      }}
                    >
                      <Briefcase size={17} color="#38BDF8" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, color: '#38BDF8', fontSize: '0.85rem' }}>Specialist Application</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginTop: '2px' }}>
                          Deliver tasks and earn on completion
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-secondary btn-sm mobile-menu-btn"
            style={{
              padding: '0.55rem',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(11, 15, 25, 0.98)',
            padding: '1rem 1.5rem 1.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <button
            onClick={() => {
              setCurrentTab('home');
              setMobileMenuOpen(false);
            }}
            className="btn btn-secondary btn-sm"
            style={{ justifyContent: 'flex-start' }}
          >
            Home
          </button>
          <button
            onClick={() => {
              setCurrentTab('catalog');
              setMobileMenuOpen(false);
            }}
            className="btn btn-secondary btn-sm"
            style={{ justifyContent: 'flex-start' }}
          >
            Services Catalog
          </button>
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => {
                  setCurrentTab('login');
                  setMobileMenuOpen(false);
                }}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start' }}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setCurrentTab('register-customer');
                  setMobileMenuOpen(false);
                }}
                className="btn btn-primary btn-sm"
                style={{ justifyContent: 'flex-start' }}
              >
                Register as Customer
              </button>
              <button
                onClick={() => {
                  setCurrentTab('register-worker');
                  setMobileMenuOpen(false);
                }}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start' }}
              >
                Apply as Specialist
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setCurrentTab(getDashboardRoute());
                setMobileMenuOpen(false);
              }}
              className="btn btn-primary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              Go to Dashboard
            </button>
          )}
        </div>
      )}

      {/* CSS helper for responsive desktop nav */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};

export default PublicNavbar;
