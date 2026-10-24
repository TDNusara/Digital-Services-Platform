import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Eye,
  CreditCard,
  Sparkles,
  Search,
  Filter,
  Bell,
  User,
  Download,
  Ban,
  MessageSquare,
  Check,
  Receipt,
  Globe,
  Phone,
  Mail,
  ShieldCheck,
  RefreshCw,
  Star,
  Home,
  Zap,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

interface CustomerPortalProps {
  orders: any[];
  onOpenOrderDetails: (order: any) => void;
  onOpenNewOrderModal: (customMode?: boolean, service?: any) => void;
  categories?: any[];
  services?: any[];
  activeTab?: 'home' | 'orders' | 'services' | 'transactions' | 'notifications' | 'profile';
  onTabChange?: (tab: 'home' | 'orders' | 'services' | 'transactions' | 'notifications' | 'profile') => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  orders,
  onOpenOrderDetails,
  onOpenNewOrderModal,
  categories = [],
  services = [],
  activeTab: propActiveTab,
  onTabChange,
}) => {
  const { user } = useAuth();

  // Navigation Tabs in Customer Hub
  const [internalTab, setInternalTab] = useState<'home' | 'orders' | 'services' | 'transactions' | 'notifications' | 'profile'>('home');
  const activeMainTab = propActiveTab || internalTab;
  const setActiveMainTab = (tab: any) => {
    setInternalTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  // Orders Filter State
  const [orderGroupFilter, setOrderGroupFilter] = useState<'ACTIVE' | 'PREVIOUS' | 'ALL'>('ACTIVE');
  const [specificStatusFilter, setSpecificStatusFilter] = useState<string>('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Services Catalog Search & Filter State
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string>('ALL');
  const [selectedAudienceFilter, setSelectedAudienceFilter] = useState<string>('ALL');

  // Transactions State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // Profile Management State
  const [profileData, setProfileData] = useState<any>(null);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Sri Lanka');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [customerStats, setCustomerStats] = useState<any>({
    totalOrders: orders.length,
    activeOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
  });

  // Load Transactions
  const fetchTransactions = async () => {
    setIsLoadingTransactions(true);
    try {
      const res = await api.get('/payments/transactions');
      setTransactions(res.payments || []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // Load Notifications
  const fetchNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.notifications || []);
      setUnreadNotificationsCount(res.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Load Customer Profile
  const fetchProfile = async () => {
    try {
      const res = await api.get('/customer/profile');
      if (res.user) {
        setProfileData(res.user);
        setFullName(res.user.fullName || '');
        setPhone(res.user.phone || '');
        if (res.user.customerProfile) {
          setCity(res.user.customerProfile.city || '');
          setCountry(res.user.customerProfile.country || 'Sri Lanka');
          setPreferredLanguage(res.user.customerProfile.preferredLanguage || 'en');
        }
      }
      if (res.stats) {
        setCustomerStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (activeMainTab === 'transactions') {
      fetchTransactions();
    } else if (activeMainTab === 'notifications') {
      fetchNotifications();
    } else if (activeMainTab === 'profile') {
      fetchProfile();
    }
  }, [activeMainTab]);

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotificationsCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    setProfileErrorMsg('');
    setIsUpdatingProfile(true);

    try {
      const payload: any = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        country: country.trim(),
        preferredLanguage,
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await api.put('/customer/profile', payload);
      setProfileSuccessMsg('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      if (res.user) {
        setProfileData(res.user);
      }
    } catch (err: any) {
      setProfileErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Orders Classification
  const activeOrdersList = orders.filter((o) =>
    ['PENDING_REVIEW', 'QUOTATION_SENT', 'AWAITING_PAYMENT', 'READY_FOR_ASSIGNMENT', 'AWAITING_WORKER_ACCEPTANCE', 'IN_PROGRESS', 'SUBMITTED_FOR_QC', 'READY_FOR_CUSTOMER', 'REVISION_REQUESTED'].includes(o.status)
  );

  const previousOrdersList = orders.filter((o) =>
    ['COMPLETED', 'CANCELLED'].includes(o.status)
  );

  // Filtered Orders for Current Tab
  const filteredOrders = orders.filter((o) => {
    // 1. Group filter: ACTIVE vs PREVIOUS vs ALL
    if (orderGroupFilter === 'ACTIVE') {
      if (!['PENDING_REVIEW', 'QUOTATION_SENT', 'AWAITING_PAYMENT', 'READY_FOR_ASSIGNMENT', 'AWAITING_WORKER_ACCEPTANCE', 'IN_PROGRESS', 'SUBMITTED_FOR_QC', 'READY_FOR_CUSTOMER', 'REVISION_REQUESTED'].includes(o.status)) {
        return false;
      }
    } else if (orderGroupFilter === 'PREVIOUS') {
      if (!['COMPLETED', 'CANCELLED'].includes(o.status)) {
        return false;
      }
    }

    // 2. Specific status pill
    if (specificStatusFilter !== 'ALL' && o.status !== specificStatusFilter) {
      return false;
    }

    // 3. Search query
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      const titleMatch = o.title?.toLowerCase().includes(q);
      const numberMatch = o.orderNumber?.toLowerCase().includes(q);
      const catMatch = o.category?.name?.toLowerCase().includes(q);
      if (!titleMatch && !numberMatch && !catMatch) return false;
    }

    return true;
  });

  // Filtered Services for Catalog Tab
  const filteredServices = services.filter((srv) => {
    if (selectedServiceCategory !== 'ALL' && srv.categoryId !== selectedServiceCategory) {
      return false;
    }
    if (selectedAudienceFilter !== 'ALL' && srv.targetAudience && !srv.targetAudience.includes(selectedAudienceFilter)) {
      return false;
    }
    if (serviceSearchQuery.trim()) {
      const q = serviceSearchQuery.toLowerCase();
      const titleMatch = srv.title?.toLowerCase().includes(q);
      const summaryMatch = srv.shortSummary?.toLowerCase().includes(q);
      const descMatch = srv.description?.toLowerCase().includes(q);
      if (!titleMatch && !summaryMatch && !descMatch) return false;
    }
    return true;
  });

  // KPI Counts
  const inProgressCount = activeOrdersList.length;
  const awaitingPaymentCount = orders.filter((o) =>
    ['QUOTATION_SENT', 'AWAITING_PAYMENT'].includes(o.status)
  ).length;
  const readyForCustomerCount = orders.filter((o) => o.status === 'READY_FOR_CUSTOMER').length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '2.2rem' }}>Customer Workspace</h1>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                background: 'rgba(99, 102, 241, 0.2)',
                color: 'var(--primary-300)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
              }}
            >
              CUSTOMER ROLE
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Welcome, <strong>{user?.fullName}</strong>! Request professional services, review quotations, track orders, communicate with administration, and download quality-checked work.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => onOpenNewOrderModal(true, null)}>
            <Sparkles size={16} color="var(--primary-300)" />
            <span>Custom Service Request</span>
          </button>
          <button className="btn btn-primary" onClick={() => onOpenNewOrderModal(false, null)}>
            <Plus size={18} />
            <span>Submit Service Order</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Subtabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '2rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setActiveMainTab('home')}
          style={{
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeMainTab === 'home' ? '2px solid var(--primary-500)' : '2px solid transparent',
            color: activeMainTab === 'home' ? 'var(--primary-300)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Home size={17} />
          <span>Customer Home</span>
        </button>

        <button
          onClick={() => setActiveMainTab('orders')}
          style={{
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeMainTab === 'orders' ? '2px solid var(--primary-500)' : '2px solid transparent',
            color: activeMainTab === 'orders' ? 'var(--primary-300)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <FileText size={17} />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('services')}
          style={{
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeMainTab === 'services' ? '2px solid var(--primary-500)' : '2px solid transparent',
            color: activeMainTab === 'services' ? 'var(--primary-300)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Search size={17} />
          <span>Browse & Search Services</span>
        </button>

        <button
          onClick={() => setActiveMainTab('transactions')}
          style={{
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeMainTab === 'transactions' ? '2px solid var(--primary-500)' : '2px solid transparent',
            color: activeMainTab === 'transactions' ? 'var(--primary-300)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Receipt size={17} />
          <span>Payment History</span>
        </button>

        <button
          onClick={() => setActiveMainTab('notifications')}
          style={{
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeMainTab === 'notifications' ? '2px solid var(--primary-500)' : '2px solid transparent',
            color: activeMainTab === 'notifications' ? 'var(--primary-300)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            position: 'relative',
          }}
        >
          <Bell size={17} />
          <span>Notifications</span>
          {unreadNotificationsCount > 0 && (
            <span
              style={{
                backgroundColor: 'var(--primary-500)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.7rem',
                padding: '0.1rem 0.45rem',
                fontWeight: 800,
              }}
            >
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveMainTab('profile')}
          style={{
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeMainTab === 'profile' ? '2px solid var(--primary-500)' : '2px solid transparent',
            color: activeMainTab === 'profile' ? 'var(--primary-300)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <User size={17} />
          <span>Profile & Settings</span>
        </button>
      </div>

      {/* KPI Cards (Overview stats) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-sub)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active Orders</span>
            <Clock size={18} color="var(--primary-400)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{inProgressCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary-300)', marginTop: '0.25rem' }}>
            In review or specialist progress
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-sub)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Action Required</span>
            <AlertCircle size={18} color="var(--warning)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)' }}>
            {awaitingPaymentCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>
            Review Quote or Pay Escrow
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-sub)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Ready to Download</span>
            <CheckCircle2 size={18} color="var(--success)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>
            {readyForCustomerCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>
            Quality-Checked deliverables
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-sub)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Completed Orders</span>
            <ShieldCheck size={18} color="#C084FC" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{completedCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>
            Closed & rated projects
          </div>
        </div>
      </div>

      {/* TAB 1: ORDERS MANAGEMENT (Active vs Previous vs All) */}
      {activeMainTab === 'orders' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          {/* Controls Bar: Group toggle, search, and status pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            {/* Active vs Previous Toggle */}
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
              <button
                className={`btn btn-sm ${orderGroupFilter === 'ACTIVE' ? 'btn-primary' : ''}`}
                style={{ background: orderGroupFilter === 'ACTIVE' ? 'var(--primary-600)' : 'transparent', border: 'none' }}
                onClick={() => {
                  setOrderGroupFilter('ACTIVE');
                  setSpecificStatusFilter('ALL');
                }}
              >
                Active Orders ({activeOrdersList.length})
              </button>
              <button
                className={`btn btn-sm ${orderGroupFilter === 'PREVIOUS' ? 'btn-primary' : ''}`}
                style={{ background: orderGroupFilter === 'PREVIOUS' ? 'var(--primary-600)' : 'transparent', border: 'none' }}
                onClick={() => {
                  setOrderGroupFilter('PREVIOUS');
                  setSpecificStatusFilter('ALL');
                }}
              >
                Previous Orders ({previousOrdersList.length})
              </button>
              <button
                className={`btn btn-sm ${orderGroupFilter === 'ALL' ? 'btn-primary' : ''}`}
                style={{ background: orderGroupFilter === 'ALL' ? 'var(--primary-600)' : 'transparent', border: 'none' }}
                onClick={() => {
                  setOrderGroupFilter('ALL');
                  setSpecificStatusFilter('ALL');
                }}
              >
                All Records ({orders.length})
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search orders, title, #ref..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Secondary Status Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)', alignSelf: 'center', marginRight: '0.25rem' }}>
              Filter Status:
            </span>
            {['ALL', 'PENDING_REVIEW', 'QUOTATION_SENT', 'AWAITING_PAYMENT', 'IN_PROGRESS', 'READY_FOR_CUSTOMER', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                className={`btn btn-sm ${specificStatusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                onClick={() => setSpecificStatusFilter(st)}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <FileText size={42} color="var(--text-dim)" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ color: 'var(--text-muted)' }}>No matching orders found</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: 'var(--text-sub)' }}>
                {orderSearchQuery ? 'Try clearing your search query or status filter.' : 'Submit a new service order or request a custom quote.'}
              </p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onOpenNewOrderModal(false, null)}
                style={{ marginTop: '1rem' }}
              >
                Submit New Order
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order Reference</th>
                    <th>Service & Title</th>
                    <th>Status</th>
                    <th>Deadline</th>
                    <th>Quoted Price</th>
                    <th>Quick Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((ord) => {
                    const isAwaitingPay = ord.status === 'AWAITING_PAYMENT';
                    const isQuoted = ord.status === 'QUOTATION_SENT';
                    const isReady = ord.status === 'READY_FOR_CUSTOMER';
                    const isCompleted = ord.status === 'COMPLETED';

                    return (
                      <tr key={ord.id}>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary-300)' }}>
                            {ord.orderNumber}
                          </span>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{ord.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', display: 'flex', gap: '0.5rem' }}>
                            <span>{ord.category?.name || 'Custom Request'}</span>
                            {ord.files?.length > 0 && <span>• {ord.files.length} files</span>}
                          </div>
                        </td>

                        <td>
                          <span className={`status-badge status-${ord.status}`}>
                            {ord.status.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td style={{ fontSize: '0.85rem' }}>
                          <div>{new Date(ord.targetDeadline).toLocaleDateString()}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                            {new Date(ord.targetDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 700, color: ord.quotedPrice ? '#FFFFFF' : 'var(--text-dim)' }}>
                            {ord.quotedPrice ? `LKR ${ord.quotedPrice.toLocaleString()}` : 'Pending Quote'}
                          </div>
                          {ord.quotedPrice && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>
                              Escrow Protected
                            </div>
                          )}
                        </td>

                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {isReady ? (
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => onOpenOrderDetails(ord)}
                                style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}
                              >
                                <Download size={13} />
                                <span>Download Work</span>
                              </button>
                            ) : isAwaitingPay ? (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => onOpenOrderDetails(ord)}
                                style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}
                              >
                                <CreditCard size={13} />
                                <span>Pay Now</span>
                              </button>
                            ) : isQuoted ? (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => onOpenOrderDetails(ord)}
                                style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}
                              >
                                <Eye size={13} />
                                <span>Review Quote</span>
                              </button>
                            ) : isCompleted && !ord.review ? (
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => onOpenOrderDetails(ord)}
                                style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}
                              >
                                <Star size={13} color="var(--warning)" />
                                <span>Rate Service</span>
                              </button>
                            ) : (
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => onOpenOrderDetails(ord)}
                                style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}
                              >
                                <Eye size={13} />
                                <span>Track Details</span>
                              </button>
                            )}

                            {/* Order Chat / Messages Shortcut */}
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                onOpenOrderDetails(ord);
                              }}
                              title="Communicate with admin"
                              style={{ padding: '0.35rem 0.5rem' }}
                            >
                              <MessageSquare size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BROWSE & SEARCH SERVICES CATALOG */}
      {activeMainTab === 'services' && (
        <div>
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF' }}>Digital & Professional Services Catalog</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                  Browse, search, and submit orders for document drafting, academic support, and professional tasks.
                </p>
              </div>

              {/* Keyword Search */}
              <div style={{ position: 'relative', width: '300px' }}>
                <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search services by keyword..."
                  value={serviceSearchQuery}
                  onChange={(e) => setServiceSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <button
                className={`btn btn-sm ${selectedServiceCategory === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedServiceCategory('ALL')}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  className={`btn btn-sm ${selectedServiceCategory === c.id ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedServiceCategory(c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Target Audience Pills */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-sub)' }}>Target Audience:</span>
              {['ALL', 'Students', 'Job Seekers', 'Employees', 'Businesses', 'General'].map((aud) => (
                <button
                  key={aud}
                  onClick={() => setSelectedAudienceFilter(aud)}
                  style={{
                    background: selectedAudienceFilter === aud ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedAudienceFilter === aud ? 'var(--primary-300)' : 'var(--text-muted)',
                    border: '1px solid ' + (selectedAudienceFilter === aud ? 'var(--primary-500)' : 'transparent'),
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.2rem 0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                  }}
                >
                  {aud}
                </button>
              ))}
            </div>
          </div>

          {/* Services Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {filteredServices.map((srv) => (
              <div
                key={srv.id}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: 'var(--primary-300)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {srv.category?.name || 'Service'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                      ⏱️ ~{srv.turnaroundHours}h
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#FFFFFF' }}>{srv.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {srv.shortSummary || srv.description?.slice(0, 110) + '...'}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Pricing:</span>
                    <span style={{ fontWeight: 700, color: srv.pricingType === 'FIXED' ? 'var(--success)' : 'var(--primary-300)' }}>
                      {srv.pricingType === 'FIXED' && srv.basePrice > 0 ? `LKR ${srv.basePrice.toLocaleString()}` : 'Custom Quotation'}
                    </span>
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onOpenNewOrderModal(false, srv)}
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <span>Order This Service</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}

            {/* Request Custom Service Card */}
            <div
              className="glass-card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                border: '1px dashed var(--primary-500)',
                background: 'rgba(99, 102, 241, 0.05)',
              }}
            >
              <Sparkles size={36} color="var(--primary-400)" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#FFFFFF' }}>Need Something Else?</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Submit a custom service brief with your custom requirements, budget, and desired deadline.
              </p>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onOpenNewOrderModal(true, null)}
              >
                Request Custom Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENT & TRANSACTION HISTORY */}
      {activeMainTab === 'transactions' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF' }}>Financial & Escrow Transactions</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                View complete payment logs, PayHere escrow receipts, and transaction references.
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={fetchTransactions}>
              <RefreshCw size={14} />
              <span>Refresh Transactions</span>
            </button>
          </div>

          {isLoadingTransactions ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Loading transaction records...</div>
          ) : transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <Receipt size={42} color="var(--text-dim)" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ color: 'var(--text-muted)' }}>No payment transactions yet</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>
                When you fund escrow for an order, your transaction receipts will be logged here.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Order Reference</th>
                    <th>Amount (LKR)</th>
                    <th>Payment Method</th>
                    <th>Gateway Ref</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id}>
                      <td style={{ fontSize: '0.85rem' }}>
                        {new Date(txn.createdAt).toLocaleDateString()}
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          {new Date(txn.createdAt).toLocaleTimeString()}
                        </div>
                      </td>

                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary-300)' }}>
                          {txn.order?.orderNumber || 'N/A'}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                          {txn.order?.title || 'Order Payment'}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>
                          LKR {txn.amount?.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--success)' }}>
                          Escrow Protected
                        </div>
                      </td>

                      <td style={{ fontSize: '0.85rem' }}>
                        <span style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                          {txn.paymentMethod}
                        </span>
                      </td>

                      <td style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {txn.gatewayReference || txn.payherePaymentId || 'Direct'}
                      </td>

                      <td>
                        <span className="status-badge status-COMPLETED">
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: NOTIFICATIONS & ALERTS FEED */}
      {activeMainTab === 'notifications' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF' }}>Activity Notifications & Deadline Alerts</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                Real-time updates regarding quotation confirmations, payments, milestone progress, and deadline reminders.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {unreadNotificationsCount > 0 && (
                <button className="btn btn-primary btn-sm" onClick={handleMarkAllNotificationsRead}>
                  <Check size={14} />
                  <span>Mark All as Read</span>
                </button>
              )}
              <button className="btn btn-secondary btn-sm" onClick={fetchNotifications}>
                <RefreshCw size={14} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {isLoadingNotifications ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <Bell size={42} color="var(--text-dim)" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ color: 'var(--text-muted)' }}>No notifications right now</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>
                You're all caught up! Order status changes and quote alerts will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: n.isRead ? 'rgba(255, 255, 255, 0.02)' : 'rgba(99, 102, 241, 0.08)',
                    border: n.isRead ? '1px solid var(--border-subtle)' : '1px solid rgba(99, 102, 241, 0.3)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: n.isRead ? 'transparent' : 'var(--primary-400)',
                        marginTop: '0.45rem',
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF', marginBottom: '0.2rem' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', marginTop: '0.4rem' }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {!n.isRead && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleMarkNotificationRead(n.id)}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', whiteSpace: 'nowrap' }}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CUSTOMER PROFILE & SETTINGS */}
      {activeMainTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Profile Form */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', marginBottom: '0.5rem' }}>Customer Profile & Settings</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '1.5rem' }}>
              Manage your personal information, contact phone, and communication preferences.
            </p>

            {profileSuccessMsg && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--success)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {profileSuccessMsg}
              </div>
            )}

            {profileErrorMsg && (
              <div style={{ padding: '0.75rem 1rem', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {profileErrorMsg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={user?.email || ''}
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>Email is linked to your account credentials.</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Colombo"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Language</label>
                  <select
                    className="form-select"
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                  >
                    <option value="en">English (Primary)</option>
                    <option value="si">Sinhala</option>
                    <option value="ta">Tamil</option>
                  </select>
                </div>
              </div>

              {/* Password Section */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: '#FFFFFF' }}>Change Password (Optional)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isUpdatingProfile}
                style={{ width: '100%' }}
              >
                {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Account Metrics Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h4 style={{ fontSize: '1.1rem', color: '#FFFFFF', marginBottom: '1rem' }}>Customer Profile Summary</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-sub)' }}>Account Role:</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary-300)' }}>Customer</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-sub)' }}>Account Status:</span>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>Active</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-sub)' }}>Total Orders Placed:</span>
                  <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{customerStats.totalOrders}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-sub)' }}>Total Completed Orders:</span>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>{customerStats.completedOrders}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-sub)' }}>Total Escrow Investments:</span>
                  <span style={{ fontWeight: 700, color: '#FFFFFF' }}>LKR {customerStats.totalSpent?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <ShieldCheck size={22} color="var(--primary-400)" />
                <div>
                  <h5 style={{ fontSize: '0.95rem', color: '#FFFFFF', marginBottom: '0.25rem' }}>TaskPulse Customer Guarantees</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Your payments are held in secure escrow and only disbursed when you approve the final deliverable. All submissions undergo internal Quality Control review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPortal;
