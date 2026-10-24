import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Layers,
  FileText,
  Search,
  Receipt,
  Bell,
  User,
  Plus,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  DollarSign,
  Users,
  Settings,
  HelpCircle,
  Inbox,
  Menu,
  Home,
  Globe,
} from 'lucide-react';
import api from '../../api/client';

interface RoleSidebarLayoutProps {
  role: 'CUSTOMER' | 'WORKER' | 'ADMIN';
  activeSubTab: string;
  onSelectSubTab: (subTab: string) => void;
  onNavigate: (route: string) => void;
  openNewOrderModal: () => void;
  orders?: any[];
  children: React.ReactNode;
}

export const RoleSidebarLayout: React.FC<RoleSidebarLayoutProps> = ({
  role,
  activeSubTab,
  onSelectSubTab,
  onNavigate,
  openNewOrderModal,
  orders = [],
  children,
}) => {
  const { user, logout, switchDemoAccount } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);

  // Calculate badges
  const activeOrdersCount = orders.filter((o) =>
    ['PENDING_REVIEW', 'QUOTATION_SENT', 'AWAITING_PAYMENT', 'READY_FOR_ASSIGNMENT', 'AWAITING_WORKER_ACCEPTANCE', 'IN_PROGRESS', 'SUBMITTED_FOR_QC', 'READY_FOR_CUSTOMER', 'REVISION_REQUESTED'].includes(o.status)
  ).length;

  const fetchUnreadNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotificationsList(res.notifications?.slice(0, 5) || []);
      setUnreadNotifications(res.unreadCount || 0);
    } catch (e) {
      // Silently catch
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();
  }, []);

  const handleDemoSwitch = async (newRole: 'CUSTOMER' | 'WORKER' | 'ADMIN') => {
    setShowRoleSwitcher(false);
    await switchDemoAccount(newRole);
    if (newRole === 'ADMIN') onNavigate('admin-control');
    else if (newRole === 'WORKER') onNavigate('worker-workspace');
    else onNavigate('customer-portal');
  };

  // Nav Items by Role
  const customerNavItems = [
    { id: 'home', label: 'Customer Home', icon: Home },
    { id: 'orders', label: 'My Orders', icon: FileText, badge: activeOrdersCount > 0 ? activeOrdersCount : undefined },
    { id: 'services', label: 'Browse & Order', icon: Search },
    { id: 'transactions', label: 'Payment History', icon: Receipt },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications > 0 ? unreadNotifications : undefined },
    { id: 'profile', label: 'Profile & Settings', icon: User },
  ];

  const workerNavItems = [
    { id: 'workspace', label: 'Specialist Queue', icon: Briefcase, badge: orders.length > 0 ? orders.length : undefined },
    { id: 'submissions', label: 'Deliverables & QC', icon: CheckCircle2 },
    { id: 'wallet', label: 'Wallet & Payouts', icon: DollarSign },
    { id: 'profile', label: 'Specialist Profile', icon: User },
  ];

  const adminNavItems = [
    { id: 'orders', label: 'Order Operations', icon: FileText, badge: orders.length > 0 ? orders.length : undefined },
    { id: 'services', label: 'Services Manager', icon: Settings },
    { id: 'workers', label: 'Specialists & QC', icon: Users },
  ];

  const currentNavItems = role === 'CUSTOMER' ? customerNavItems : role === 'WORKER' ? workerNavItems : adminNavItems;

  const getRoleHeader = () => {
    if (role === 'ADMIN') {
      return {
        badge: 'ADMIN OPERATIONS',
        badgeColor: 'var(--warning)',
        bgColor: 'rgba(245, 158, 11, 0.15)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
      };
    }
    if (role === 'WORKER') {
      return {
        badge: 'SPECIALIST HUB',
        badgeColor: '#38BDF8',
        bgColor: 'rgba(56, 189, 248, 0.15)',
        borderColor: 'rgba(56, 189, 248, 0.3)',
      };
    }
    return {
      badge: 'CUSTOMER WORKSPACE',
      badgeColor: 'var(--primary-300)',
      bgColor: 'rgba(99, 102, 241, 0.15)',
      borderColor: 'rgba(99, 102, 241, 0.3)',
    };
  };

  const roleStyle = getRoleHeader();

  return (
    <div className="app-shell">
      {/* 1. Independent Role Sidebar */}
      <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Header */}
        <div className="app-sidebar-header">
          {!isCollapsed ? (
            <div
              onClick={() => {
                onSelectSubTab('home');
                if (role !== 'CUSTOMER') onNavigate('customer-portal');
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
            >
              <div
                style={{
                  width: '2.1rem',
                  height: '2.1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'linear-gradient(135deg, var(--primary-500), #8B5CF6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                <Layers size={17} color="#FFFFFF" />
              </div>
              <div>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  Task<span style={{ color: 'var(--primary-400)' }}>Pulse</span>
                </span>
                <div
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    color: roleStyle.badgeColor,
                    marginTop: '-2px',
                    letterSpacing: '0.04em',
                  }}
                >
                  {roleStyle.badge}
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => {
                onSelectSubTab('home');
                if (role !== 'CUSTOMER') onNavigate('customer-portal');
              }}
              style={{
                width: '2.2rem',
                height: '2.2rem',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--primary-500), #8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                cursor: 'pointer',
              }}
            >
              <Layers size={17} color="#FFFFFF" />
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-sub)',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Primary Role Action (e.g. Customer New Order) */}
        {!isCollapsed && role === 'CUSTOMER' && (
          <div style={{ padding: '1rem 0.85rem 0.25rem 0.85rem' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={openNewOrderModal}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.65rem' }}
            >
              <Plus size={16} />
              <span>Request Service</span>
            </button>
          </div>
        )}

        {/* Navigation Items List */}
        <nav className="sidebar-nav-list">
          {currentNavItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeSubTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectSubTab(item.id)}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <IconComponent size={19} color={isActive ? 'var(--primary-300)' : 'var(--text-muted)'} />
                {!isCollapsed && <span>{item.label}</span>}
                {!isCollapsed && item.badge !== undefined && (
                  <span className="sidebar-nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: User Card & Fast Exit */}
        <div className="app-sidebar-footer">
          {!isCollapsed ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    background: roleStyle.bgColor,
                    border: `1px solid ${roleStyle.borderColor}`,
                    color: roleStyle.badgeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user?.fullName || 'User'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user?.email}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <button
                  onClick={() => {
                    onSelectSubTab('home');
                    if (role !== 'CUSTOMER') onNavigate('customer-portal');
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, fontSize: '0.75rem', padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                  title="Customer Home"
                >
                  <Home size={12} />
                  <span>Customer Home</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    onNavigate('home');
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.35rem 0.5rem' }}
                  title="Log Out"
                >
                  <LogOut size={14} color="var(--danger)" />
                </button>
              </div>

              <button
                onClick={() => onNavigate('guest-home')}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', fontSize: '0.72rem', padding: '0.3rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', color: 'var(--text-sub)' }}
                title="View Guest / Public Home Page"
              >
                <Globe size={12} />
                <span>Guest Home Page</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  onSelectSubTab('home');
                  if (role !== 'CUSTOMER') onNavigate('customer-portal');
                }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-sub)', cursor: 'pointer' }}
                title="Customer Home"
              >
                <Home size={16} />
              </button>
              <button
                onClick={() => onNavigate('guest-home')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-sub)', cursor: 'pointer' }}
                title="View Guest Home Page"
              >
                <Globe size={16} />
              </button>
              <button
                onClick={() => {
                  logout();
                  onNavigate('home');
                }}
                style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 2. Main Dashboard Area with Sticky Topbar */}
      <div className="app-main-content">
        <header className="dashboard-topbar">
          {/* Left: Role Page Indicator & Mobile Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  background: roleStyle.bgColor,
                  color: roleStyle.badgeColor,
                  border: `1px solid ${roleStyle.borderColor}`,
                  letterSpacing: '0.04em',
                }}
              >
                {role}
              </span>
              <span style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>/</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize' }}>
                {activeSubTab.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Right: Role Switcher Pill + Notifications Drawer + Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Quick Demo Role Switcher */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
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
                <span>Switch Role View</span>
                <ChevronDown size={12} />
              </button>

              {showRoleSwitcher && (
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
                  onMouseLeave={() => setShowRoleSwitcher(false)}
                >
                  <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.7rem', color: 'var(--text-sub)', fontWeight: 700 }}>
                    1-Click Role Switch
                  </div>
                  <button
                    onClick={() => handleDemoSwitch('CUSTOMER')}
                    className={`btn btn-sm ${role === 'CUSTOMER' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'flex-start', textAlign: 'left', width: '100%' }}
                  >
                    👤 Customer Hub
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('WORKER')}
                    className={`btn btn-sm ${role === 'WORKER' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'flex-start', textAlign: 'left', width: '100%' }}
                  >
                    💼 Specialist Workspace
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('ADMIN')}
                    className={`btn btn-sm ${role === 'ADMIN' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'flex-start', textAlign: 'left', width: '100%' }}
                  >
                    🛡️ Admin Operations
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotificationsDrawer(!showNotificationsDrawer)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.45rem', position: 'relative' }}
                title="Notifications"
              >
                <Bell size={16} />
                {unreadNotifications > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: 'var(--primary-500)',
                      color: '#FFFFFF',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {showNotificationsDrawer && (
                <div
                  className="glass-card"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 0.5rem)',
                    width: '320px',
                    padding: '1rem',
                    zIndex: 200,
                    boxShadow: 'var(--shadow-xl)',
                  }}
                  onMouseLeave={() => setShowNotificationsDrawer(false)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#FFFFFF' }}>Recent Alerts</span>
                    <button
                      onClick={() => {
                        setShowNotificationsDrawer(false);
                        onSelectSubTab('notifications');
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-300)', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      View All
                    </button>
                  </div>

                  {notificationsList.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', textAlign: 'center', padding: '1rem 0' }}>
                      No recent notifications
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {notificationsList.map((n) => (
                        <div
                          key={n.id}
                          style={{
                            padding: '0.5rem 0.65rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            fontSize: '0.78rem',
                          }}
                        >
                          <div style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: '0.15rem' }}>{n.title}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{n.message}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Role Header Action */}
            {role === 'CUSTOMER' && (
              <button
                className="btn btn-primary btn-sm"
                onClick={openNewOrderModal}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Plus size={14} />
                <span>New Request</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Content Body */}
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default RoleSidebarLayout;
