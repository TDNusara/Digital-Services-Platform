import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  AlertCircle,
  Eye,
  Filter,
  UserCheck,
  UserX,
  Search,
  Plus,
  Trash2,
  Edit2,
  CreditCard,
  FileText,
  X,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import api from '../../api/client';

interface AdminControlCenterProps {
  orders: any[];
  onOpenOrderDetails: (order: any) => void;
  onRefresh: () => void;
  categories?: any[];
  onServicesUpdated?: () => void;
  activeTab?: 'orders' | 'services' | 'workers' | 'escrow';
  onTabChange?: (tab: 'orders' | 'services' | 'workers' | 'escrow') => void;
}

export const AdminControlCenter: React.FC<AdminControlCenterProps> = ({
  orders,
  onOpenOrderDetails,
  onRefresh,
  categories = [],
  onServicesUpdated,
  activeTab: propActiveTab,
  onTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<'orders' | 'services' | 'workers' | 'escrow'>('orders');
  const activeTab = propActiveTab || internalTab;
  const setActiveTab = (tab: any) => {
    setInternalTab(tab);
    if (onTabChange) onTabChange(tab);
  };
  const [stats, setStats] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [workers, setWorkers] = useState<any[]>([]);

  // Services Management State
  const [adminServices, setAdminServices] = useState<any[]>([]);
  const [adminCategories, setAdminCategories] = useState<any[]>(categories);
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceAudienceFilter, setServiceAudienceFilter] = useState('ALL');
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  // Escrow & Financials State
  const [escrowOverview, setEscrowOverview] = useState<any>(null);
  const [isLoadingEscrow, setIsLoadingEscrow] = useState(false);
  const [escrowFilter, setEscrowFilter] = useState<'ALL' | 'LOCKED' | 'RELEASED' | 'REFUNDED' | 'UNPAID'>('ALL');
  const [escrowSearch, setEscrowSearch] = useState('');
  const [escrowActionMessage, setEscrowActionMessage] = useState('');

  // Quick Action Modal states
  const [targetEscrowOrder, setTargetEscrowOrder] = useState<any | null>(null);
  const [showQuickReleaseModal, setShowQuickReleaseModal] = useState(false);
  const [showQuickRefundModal, setShowQuickRefundModal] = useState(false);
  const [quickRefundAmount, setQuickRefundAmount] = useState<number>(0);
  const [quickRefundReason, setQuickRefundReason] = useState('Customer dispute resolution');
  const [isEscrowExecuting, setIsEscrowExecuting] = useState(false);

  const fetchEscrowOverview = async () => {
    setIsLoadingEscrow(true);
    try {
      const res = await api.get('/admin/escrow');
      setEscrowOverview(res);
    } catch (e) {
      console.error('Failed to load escrow overview:', e);
    } finally {
      setIsLoadingEscrow(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'escrow') {
      fetchEscrowOverview();
    }
  }, [activeTab, orders]);

  const handleExecuteRelease = async () => {
    if (!targetEscrowOrder) return;
    setIsEscrowExecuting(true);
    try {
      await api.post(`/admin/orders/${targetEscrowOrder.id}/escrow/release`, {
        notes: 'Admin manual release from Escrow & Financials dashboard',
      });
      setEscrowActionMessage(`Escrow released for order ${targetEscrowOrder.orderNumber}!`);
      setTimeout(() => setEscrowActionMessage(''), 4000);
      setShowQuickReleaseModal(false);
      setTargetEscrowOrder(null);
      fetchEscrowOverview();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to release escrow');
    } finally {
      setIsEscrowExecuting(false);
    }
  };

  const handleExecuteRefund = async () => {
    if (!targetEscrowOrder) return;
    setIsEscrowExecuting(true);
    try {
      await api.post(`/admin/orders/${targetEscrowOrder.id}/escrow/refund`, {
        refundAmount: quickRefundAmount,
        reason: quickRefundReason,
      });
      setEscrowActionMessage(`Refund of LKR ${quickRefundAmount?.toLocaleString()} processed for order ${targetEscrowOrder.orderNumber}!`);
      setTimeout(() => setEscrowActionMessage(''), 4000);
      setShowQuickRefundModal(false);
      setTargetEscrowOrder(null);
      fetchEscrowOverview();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to refund escrow');
    } finally {
      setIsEscrowExecuting(false);
    }
  };

  // Add / Edit Service Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formTargetAudience, setFormTargetAudience] = useState('General Customers');
  const [formPricingType, setFormPricingType] = useState<'FIXED' | 'CUSTOM_QUOTE'>('FIXED');
  const [formBasePrice, setFormBasePrice] = useState<number>(3000);
  const [formTurnaroundHours, setFormTurnaroundHours] = useState<number>(24);
  const [formShortSummary, setFormShortSummary] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [serviceFormError, setServiceFormError] = useState('');
  const [isSavingService, setIsSavingService] = useState(false);

  const fetchAdminStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.stats);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchWorkersList = async () => {
    try {
      const res = await api.get('/admin/workers');
      setWorkers(res.workers || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAdminServices = async () => {
    setIsLoadingServices(true);
    try {
      const [srvRes, catRes] = await Promise.all([
        api.get('/services?includeInactive=true'),
        api.get('/categories'),
      ]);
      setAdminServices(srvRes.services || []);
      setAdminCategories(catRes.categories || []);
      if (catRes.categories?.length > 0 && !formCategoryId) {
        setFormCategoryId(catRes.categories[0].id);
      }
    } catch (e) {
      console.error('Failed to load admin services:', e);
    } finally {
      setIsLoadingServices(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
    fetchWorkersList();
    fetchAdminServices();
  }, [orders]);

  const handleUpdateWorkerStatus = async (workerId: string, status: string) => {
    try {
      await api.put(`/admin/workers/${workerId}/status`, { status });
      fetchWorkersList();
      fetchAdminStats();
      onRefresh();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleOpenAddService = () => {
    setEditingServiceId(null);
    setFormTitle('');
    setFormShortSummary('');
    setFormDescription('');
    setFormPricingType('FIXED');
    setFormBasePrice(3500);
    setFormTurnaroundHours(24);
    setFormTargetAudience('General Customers');
    setFormIsActive(true);
    setServiceFormError('');
    if (adminCategories.length > 0) {
      setFormCategoryId(adminCategories[0].id);
    }
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (service: any) => {
    setEditingServiceId(service.id);
    setFormCategoryId(service.categoryId);
    setFormTitle(service.title);
    setFormTargetAudience(service.targetAudience || 'General Customers');
    setFormPricingType(service.pricingType || 'FIXED');
    setFormBasePrice(service.basePrice || 0);
    setFormTurnaroundHours(service.turnaroundHours || 24);
    setFormShortSummary(service.shortSummary || '');
    setFormDescription(service.description || '');
    setFormIsActive(service.isActive !== undefined ? service.isActive : true);
    setServiceFormError('');
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setServiceFormError('');

    if (!formTitle.trim()) {
      setServiceFormError('Service title is required.');
      return;
    }

    if (!formCategoryId) {
      setServiceFormError('Please select a service category.');
      return;
    }

    if (formPricingType === 'FIXED' && (formBasePrice <= 0 || isNaN(formBasePrice))) {
      setServiceFormError('Please enter a valid fixed price greater than 0.');
      return;
    }

    setIsSavingService(true);
    try {
      const payload = {
        categoryId: formCategoryId,
        title: formTitle.trim(),
        targetAudience: formTargetAudience,
        pricingType: formPricingType,
        basePrice: formPricingType === 'FIXED' ? formBasePrice : 0,
        turnaroundHours: formTurnaroundHours,
        shortSummary: formShortSummary.trim(),
        description: formDescription.trim(),
        isActive: formIsActive,
      };

      if (editingServiceId) {
        await api.put(`/services/${editingServiceId}`, payload);
      } else {
        await api.post('/services', payload);
      }

      setIsServiceModalOpen(false);
      await fetchAdminServices();
      if (onServicesUpdated) onServicesUpdated();
      alert(editingServiceId ? 'Service updated successfully!' : 'Service created and added to catalog!');
    } catch (err: any) {
      setServiceFormError(err.message || 'Failed to save service.');
    } finally {
      setIsSavingService(false);
    }
  };

  const handleDeleteService = async (service: any) => {
    if (!window.confirm(`Are you sure you want to remove the service "${service.title}"?`)) {
      return;
    }
    try {
      const res = await api.delete(`/services/${service.id}`);
      alert(res.message || 'Service removed.');
      await fetchAdminServices();
      if (onServicesUpdated) onServicesUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to delete service.');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesSearch =
      !searchTerm ||
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredAdminServices = adminServices.filter((s) => {
    const matchesAudience = serviceAudienceFilter === 'ALL' || s.targetAudience === serviceAudienceFilter;
    const matchesSearch =
      !serviceSearch ||
      s.title.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      s.shortSummary?.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      s.category?.name?.toLowerCase().includes(serviceSearch.toLowerCase());
    return matchesAudience && matchesSearch;
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
          <ShieldCheck size={24} color="var(--primary-400)" />
          <h1 style={{ fontSize: '2.2rem' }}>Platform Control Center</h1>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage digital services, set quotations, control quality checks, and dispatch tasks to verified specialists.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: '0.25rem' }}>
            Pending Review
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)' }}>
            {stats?.pendingReviewCount ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Requires quotation</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: '0.25rem' }}>
            Active Order Pipeline
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
            {stats?.activeOrdersCount ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>In progress & QC</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: '0.25rem' }}>
            Active Services Catalog
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38BDF8' }}>
            {adminServices.filter((s) => s.isActive).length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Across 5 customer segments</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: '0.25rem' }}>
            Gross Platform Revenue
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF' }}>
            LKR {(stats?.totalRevenue ?? 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Completed transactions</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: '0.25rem' }}>
            Net Platform Profit (20%)
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>
            LKR {(stats?.platformProfit ?? 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success-border)' }}>Commission earnings</div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '2rem',
        }}
      >
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '0.75rem 0.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'orders' ? '2px solid var(--primary-500)' : '2px solid transparent',
            color: activeTab === 'orders' ? 'var(--primary-300)' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Master Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('services')}
          style={{
            padding: '0.75rem 0.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'services' ? '2px solid var(--primary-500)' : '2px solid transparent',
            color: activeTab === 'services' ? 'var(--primary-300)' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Services Management ({adminServices.length})
        </button>

        <button
          onClick={() => setActiveTab('workers')}
          style={{
            padding: '0.75rem 0.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'workers' ? '2px solid var(--primary-500)' : '2px solid transparent',
            color: activeTab === 'workers' ? 'var(--primary-300)' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Worker Verifications ({workers.length})
        </button>

        <button
          onClick={() => setActiveTab('escrow')}
          style={{
            padding: '0.75rem 0.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'escrow' ? '2px solid var(--primary-500)' : '2px solid transparent',
            color: activeTab === 'escrow' ? 'var(--primary-300)' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <DollarSign size={16} />
          <span>Escrow & Financials</span>
        </button>
      </div>

      {/* TAB 1: MASTER ORDERS */}
      {activeTab === 'orders' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          {/* Filters & Search */}
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
            <div style={{ position: 'relative', minWidth: '320px' }}>
              <Search
                size={16}
                color="var(--text-sub)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Search orders, ID, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['ALL', 'PENDING_REVIEW', 'QUOTATION_SENT', 'AWAITING_PAYMENT', 'READY_FOR_ASSIGNMENT', 'SUBMITTED_FOR_QC', 'READY_FOR_CUSTOMER', 'COMPLETED'].map((st) => (
                <button
                  key={st}
                  className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Customer</th>
                  <th>Title & Category</th>
                  <th>Pricing Flow</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => {
                  const isFixed = ord.service?.pricingType === 'FIXED';
                  return (
                    <tr key={ord.id}>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary-300)' }}>
                          {ord.orderNumber}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{ord.customer?.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{ord.customer?.email}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{ord.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                          {ord.category?.name || 'Custom Request'}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 600,
                            backgroundColor: isFixed ? 'var(--success-bg)' : 'rgba(99, 102, 241, 0.15)',
                            color: isFixed ? 'var(--success)' : 'var(--primary-300)',
                            border: isFixed ? '1px solid var(--success-border)' : '1px solid rgba(99, 102, 241, 0.3)',
                          }}
                        >
                          {isFixed ? 'Fixed Price' : 'Custom Quote'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${ord.status}`}>
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: ord.quotedPrice ? '#FFFFFF' : 'var(--text-dim)' }}>
                          {ord.quotedPrice ? `LKR ${ord.quotedPrice.toLocaleString()}` : 'Awaiting Quote'}
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onOpenOrderDetails(ord)}
                          style={{ display: 'inline-flex', gap: '0.35rem' }}
                        >
                          <Eye size={14} />
                          <span>Inspect & Action</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SERVICES MANAGEMENT (ADMIN CREATE, EDIT, DELETE) */}
      {activeTab === 'services' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          {/* Action Header */}
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
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>Digital Services Management</h3>
              <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>
                Add new services, configure fixed or quotation-based pricing, and remove obsolete offerings.
              </p>
            </div>

            <button className="btn btn-primary" onClick={handleOpenAddService}>
              <Plus size={16} />
              <span>Add New Service</span>
            </button>
          </div>

          {/* Filters & Search */}
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
            <div style={{ position: 'relative', minWidth: '300px' }}>
              <Search
                size={16}
                color="var(--text-sub)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Search services or categories..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['ALL', 'Students', 'Job Seekers', 'Employees', 'Businesses', 'General Customers'].map((aud) => (
                <button
                  key={aud}
                  className={`btn btn-sm ${serviceAudienceFilter === aud ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setServiceAudienceFilter(aud)}
                >
                  {aud}
                </button>
              ))}
            </div>
          </div>

          {/* Services Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service Title & Category</th>
                  <th>Target Customer</th>
                  <th>Pricing Model</th>
                  <th>Price (LKR)</th>
                  <th>Turnaround</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdminServices.map((srv) => (
                  <tr key={srv.id} style={{ opacity: srv.isActive ? 1 : 0.6 }}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{srv.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                        {srv.category?.name || 'General Category'}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {srv.targetAudience || 'General'}
                      </span>
                    </td>
                    <td>
                      {srv.pricingType === 'FIXED' ? (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: 'var(--success)',
                            backgroundColor: 'var(--success-bg)',
                            border: '1px solid var(--success-border)',
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          Fixed Price
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: 'var(--primary-300)',
                            backgroundColor: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          Custom Quote
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: srv.pricingType === 'FIXED' ? '#FFFFFF' : 'var(--text-sub)' }}>
                        {srv.pricingType === 'FIXED' ? `LKR ${srv.basePrice.toLocaleString()}` : 'Custom'}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                        {srv.turnaroundHours}h
                      </span>
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: srv.isActive ? 'var(--success-bg)' : 'rgba(255, 255, 255, 0.05)',
                          color: srv.isActive ? 'var(--success)' : 'var(--text-dim)',
                        }}
                      >
                        {srv.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEditService(srv)}
                          title="Edit Service"
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteService(srv)}
                          title="Remove Service"
                        >
                          <Trash2 size={14} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WORKERS VERIFICATION */}
      {activeTab === 'workers' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>
            Freelance Worker Registry
          </h3>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Specialist Name</th>
                  <th>Headline & Experience</th>
                  <th>Rating</th>
                  <th>Verification Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w) => (
                  <tr key={w.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{w.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{w.email} • {w.phone || 'No phone'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{w.workerProfile?.headline || 'Specialist'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                        {w.workerProfile?.experienceYears || 0} years exp • {w.workerProfile?.totalCompletedJobs || 0} jobs done
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#FBBF24' }}>
                        ★ <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{w.workerProfile?.ratingAvg || 0}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: w.workerProfile?.verificationStatus === 'APPROVED' ? 'var(--success-bg)' : 'var(--warning-bg)',
                          color: w.workerProfile?.verificationStatus === 'APPROVED' ? 'var(--success)' : 'var(--warning)',
                        }}
                      >
                        {w.workerProfile?.verificationStatus || 'PENDING'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {w.workerProfile?.verificationStatus !== 'APPROVED' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleUpdateWorkerStatus(w.id, 'APPROVED')}
                          >
                            <UserCheck size={14} />
                            <span>Approve</span>
                          </button>
                        )}
                        {w.workerProfile?.verificationStatus === 'APPROVED' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleUpdateWorkerStatus(w.id, 'SUSPENDED')}
                          >
                            <UserX size={14} />
                            <span>Suspend</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ESCROW & FINANCIAL MANAGEMENT */}
      {activeTab === 'escrow' && (
        <div>
          {/* Escrow Notification Message */}
          {escrowActionMessage && (
            <div
              style={{
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid var(--success)',
                color: 'var(--success)',
                fontWeight: 700,
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={18} />
              <span>{escrowActionMessage}</span>
            </div>
          )}

          {/* Escrow Financial KPI Vault Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem',
            }}
          >
            <div className="glass-card" style={{ padding: '1.35rem', borderLeft: '4px solid var(--accent-cyan)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Escrow Locked in Vault
                </span>
                <ShieldCheck size={18} color="var(--accent-cyan)" />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                LKR {(escrowOverview?.summary?.totalEscrowLocked ?? orders.filter((o: any) => o.payments?.some((p: any) => p.status === 'COMPLETED') && !['COMPLETED', 'CANCELLED'].includes(o.status)).reduce((s: number, o: any) => s + (o.quotedPrice || 0), 0)).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.2rem' }}>
                Secure funds in active tasks
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.35rem', borderLeft: '4px solid var(--success)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Escrow Disbursed
                </span>
                <CheckCircle2 size={18} color="var(--success)" />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--success)' }}>
                LKR {(escrowOverview?.summary?.totalEscrowReleased ?? orders.filter((o: any) => o.status === 'COMPLETED').reduce((s: number, o: any) => s + (o.workerPayout || 0), 0)).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.2rem' }}>
                Cleared payouts to specialists
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.35rem', borderLeft: '4px solid var(--primary-400)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Platform Profit (Commissions)
                </span>
                <DollarSign size={18} color="var(--primary-400)" />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF' }}>
                LKR {(escrowOverview?.summary?.totalPlatformRevenue ?? orders.filter((o: any) => o.status === 'COMPLETED').reduce((s: number, o: any) => s + (o.platformFee || 0), 0)).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.2rem' }}>
                Accrued net commission fees
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.35rem', borderLeft: '4px solid #A78BFA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Escrow Refunds
                </span>
                <RotateCcw size={18} color="#A78BFA" />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#A78BFA' }}>
                LKR {(escrowOverview?.summary?.totalEscrowRefunded ?? orders.filter((o: any) => o.payments?.some((p: any) => p.status === 'REFUNDED')).reduce((s: number, o: any) => s + (o.quotedPrice || 0), 0)).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.2rem' }}>
                Returned to clients in disputes
              </div>
            </div>
          </div>

          {/* Escrow Orders & Ledger Card */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            {/* Filters Bar */}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                marginBottom: '1.5rem',
              }}
            >
              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(['ALL', 'LOCKED', 'RELEASED', 'REFUNDED', 'UNPAID'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setEscrowFilter(filter)}
                    className={`btn btn-sm ${escrowFilter === filter ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                  >
                    {filter === 'ALL' && 'All Orders'}
                    {filter === 'LOCKED' && '🔒 Escrow Locked'}
                    {filter === 'RELEASED' && '✅ Released'}
                    {filter === 'REFUNDED' && '↩️ Refunded'}
                    {filter === 'UNPAID' && '⏳ Unpaid'}
                  </button>
                ))}
              </div>

              {/* Search Box & Refresh */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Search
                    size={15}
                    style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search by order #, client, specialist..."
                    value={escrowSearch}
                    onChange={(e) => setEscrowSearch(e.target.value)}
                    style={{ paddingLeft: '2.2rem', width: '280px', fontSize: '0.85rem' }}
                  />
                </div>
                <button className="btn btn-secondary btn-sm" onClick={fetchEscrowOverview} title="Refresh Escrow Ledger">
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Escrow Ledger Table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Order & Service</th>
                    <th>Client</th>
                    <th>Assigned Specialist</th>
                    <th>Total Quoted</th>
                    <th>Platform Fee</th>
                    <th>Specialist Payout</th>
                    <th>Escrow State</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(escrowOverview?.orders || orders)
                    .filter((o: any) => {
                      const hasCompletedPayment = o.payments?.some((p: any) => p.status === 'COMPLETED');
                      const hasRefundedPayment = o.payments?.some((p: any) => p.status === 'REFUNDED');
                      const isReleased = o.status === 'COMPLETED';

                      if (escrowFilter === 'LOCKED' && (!hasCompletedPayment || isReleased || hasRefundedPayment)) return false;
                      if (escrowFilter === 'RELEASED' && !isReleased) return false;
                      if (escrowFilter === 'REFUNDED' && !hasRefundedPayment && o.status !== 'CANCELLED') return false;
                      if (escrowFilter === 'UNPAID' && hasCompletedPayment) return false;

                      if (escrowSearch.trim()) {
                        const q = escrowSearch.toLowerCase();
                        const matchOrderNum = o.orderNumber?.toLowerCase().includes(q);
                        const matchTitle = o.title?.toLowerCase().includes(q);
                        const matchCustomer = o.customer?.fullName?.toLowerCase().includes(q);
                        const matchWorker = o.assignments?.[0]?.worker?.fullName?.toLowerCase().includes(q);
                        if (!matchOrderNum && !matchTitle && !matchCustomer && !matchWorker) return false;
                      }
                      return true;
                    })
                    .map((o: any) => {
                      const hasCompletedPayment = o.payments?.some((p: any) => p.status === 'COMPLETED');
                      const hasRefundedPayment = o.payments?.some((p: any) => p.status === 'REFUNDED');
                      const isReleased = o.status === 'COMPLETED';
                      const assignedWorker = o.assignments?.find((a: any) => ['ACCEPTED', 'OFFERED'].includes(a.status))?.worker;

                      return (
                        <tr key={o.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--primary-300)' }}>{o.orderNumber}</div>
                            <div style={{ fontSize: '0.8rem', color: '#FFFFFF', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {o.title}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{o.customer?.fullName || 'Customer'}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>{o.customer?.email}</div>
                          </td>
                          <td>
                            {assignedWorker ? (
                              <div>
                                <div style={{ fontWeight: 600, color: '#38BDF8' }}>{assignedWorker.fullName}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>{assignedWorker.email}</div>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Unassigned</span>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 800, color: '#FFFFFF' }}>
                              {o.quotedPrice ? `LKR ${o.quotedPrice.toLocaleString()}` : '—'}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                              LKR {(o.platformFee || 0).toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                              ({((o.platformCommissionRate ?? 0.20) * 100).toFixed(0)}%)
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--primary-300)' }}>
                              LKR {(o.workerPayout || 0).toLocaleString()}
                            </div>
                          </td>
                          <td>
                            {isReleased ? (
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: 'var(--radius-full)',
                                  background: 'rgba(16, 185, 129, 0.15)',
                                  color: 'var(--success)',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                }}
                              >
                                <CheckCircle2 size={12} /> Released
                              </span>
                            ) : hasRefundedPayment ? (
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: 'var(--radius-full)',
                                  background: 'rgba(167, 139, 250, 0.15)',
                                  color: '#A78BFA',
                                  border: '1px solid rgba(167, 139, 250, 0.3)',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                }}
                              >
                                <RotateCcw size={12} /> Refunded
                              </span>
                            ) : hasCompletedPayment ? (
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: 'var(--radius-full)',
                                  background: 'rgba(6, 182, 212, 0.15)',
                                  color: 'var(--accent-cyan)',
                                  border: '1px solid rgba(6, 182, 212, 0.3)',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                }}
                              >
                                <ShieldCheck size={12} /> Locked in Vault
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: 'var(--radius-full)',
                                  background: 'rgba(245, 158, 11, 0.12)',
                                  color: 'var(--warning)',
                                  border: '1px solid rgba(245, 158, 11, 0.3)',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                }}
                              >
                                <Clock size={12} /> Unpaid
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => onOpenOrderDetails(o)}
                                style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                                title="Inspect & Edit Pricing Breakdown"
                              >
                                <span>Manage</span>
                              </button>
                              {hasCompletedPayment && !isReleased && !hasRefundedPayment && (
                                <>
                                  <button
                                    type="button"
                                    className="btn btn-success btn-sm"
                                    onClick={() => {
                                      setTargetEscrowOrder(o);
                                      setShowQuickReleaseModal(true);
                                    }}
                                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                                    title="Release Escrow to Specialist"
                                  >
                                    <ShieldCheck size={13} />
                                    <span>Release</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => {
                                      setTargetEscrowOrder(o);
                                      setQuickRefundAmount(o.quotedPrice || 0);
                                      setShowQuickRefundModal(true);
                                    }}
                                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                                    title="Refund Escrow to Customer"
                                  >
                                    <RotateCcw size={13} />
                                    <span>Refund</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ESCROW RELEASE CONFIRMATION MODAL */}
      {showQuickReleaseModal && targetEscrowOrder && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div className="modal-content" style={{ maxWidth: '480px', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', marginBottom: '0.75rem' }}>
              <ShieldCheck size={24} />
              <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>Release Escrow to Specialist</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Disburse locked escrow payment for order <strong>{targetEscrowOrder.orderNumber}</strong> directly to the specialist.
            </p>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-sub)' }}>Customer Escrow:</span>
                <span style={{ fontWeight: 700, color: '#FFFFFF' }}>LKR {targetEscrowOrder.quotedPrice?.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-sub)' }}>Platform Profit:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>LKR {targetEscrowOrder.platformFee?.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-sub)' }}>Net Specialist Payout:</span>
                <span style={{ fontWeight: 800, color: 'var(--success)', fontSize: '1rem' }}>
                  LKR {targetEscrowOrder.workerPayout?.toLocaleString()}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setShowQuickReleaseModal(false);
                  setTargetEscrowOrder(null);
                }}
                disabled={isEscrowExecuting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={handleExecuteRelease}
                disabled={isEscrowExecuting}
              >
                {isEscrowExecuting ? 'Releasing...' : `Confirm Release (LKR ${targetEscrowOrder.workerPayout?.toLocaleString()})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ESCROW REFUND MODAL */}
      {showQuickRefundModal && targetEscrowOrder && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div className="modal-content" style={{ maxWidth: '480px', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', marginBottom: '0.75rem' }}>
              <RotateCcw size={22} />
              <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>Process Escrow Refund</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Refund escrow funds for order <strong>{targetEscrowOrder.orderNumber}</strong> back to <strong>{targetEscrowOrder.customer?.fullName}</strong>.
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: '0.25rem', fontWeight: 600 }}>
                Refund Amount (LKR)
              </label>
              <input
                type="number"
                className="form-input"
                value={quickRefundAmount}
                onChange={(e) => setQuickRefundAmount(parseFloat(e.target.value) || 0)}
                style={{ width: '100%', fontWeight: 700 }}
              />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: '0.25rem', fontWeight: 600 }}>
                Audit Reason <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea
                className="form-textarea"
                value={quickRefundReason}
                onChange={(e) => setQuickRefundReason(e.target.value)}
                style={{ minHeight: '75px', width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setShowQuickRefundModal(false);
                  setTargetEscrowOrder(null);
                }}
                disabled={isEscrowExecuting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleExecuteRefund}
                disabled={isEscrowExecuting || !quickRefundAmount || !quickRefundReason.trim()}
              >
                {isEscrowExecuting ? 'Processing...' : `Refund LKR ${quickRefundAmount?.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* MODAL: ADD / EDIT SERVICE */}
      {isServiceModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    width: '2.2rem',
                    height: '2.2rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={18} color="var(--primary-400)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem' }}>
                    {editingServiceId ? 'Edit Digital Service' : 'Add New Digital Service'}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                    Admin Controls — Service Catalog & Pricing Engine
                  </div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setIsServiceModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {serviceFormError && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--danger)',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{serviceFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveService}>
              {/* Category & Target Audience in 2 Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    <span>Category</span>
                    <span className="required">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                  >
                    {adminCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>Target Customer Segment</span>
                    <span className="required">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={formTargetAudience}
                    onChange={(e) => setFormTargetAudience(e.target.value)}
                  >
                    <option value="Students">Students (Academic, Reports, Excel)</option>
                    <option value="Job Seekers">Job Seekers (CV, Applications, LinkedIn)</option>
                    <option value="Employees">Employees (Reports, Excel, Presentations)</option>
                    <option value="Businesses">Businesses (Data, SOPs, Proposals, IT)</option>
                    <option value="General Customers">General Customers (Letters, Forms, PDF)</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="form-group">
                <label className="form-label">
                  <span>Service Title</span>
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. ATS Resume Revamp, Thesis Typesetting, Excel Modeling..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              {/* Pricing Model Selection */}
              <div
                className="glass-card"
                style={{
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                }}
              >
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                  <span>Pricing Model</span>
                  <span className="required">*</span>
                </label>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="radio"
                      name="pricingType"
                      checked={formPricingType === 'FIXED'}
                      onChange={() => setFormPricingType('FIXED')}
                    />
                    <span>Fixed Price (Determined Cost)</span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="radio"
                      name="pricingType"
                      checked={formPricingType === 'CUSTOM_QUOTE'}
                      onChange={() => setFormPricingType('CUSTOM_QUOTE')}
                    />
                    <span>Custom Quotation (Based on Requirements)</span>
                  </label>
                </div>

                {formPricingType === 'FIXED' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label className="form-label">
                        <span>Fixed Price (LKR)</span>
                        <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="e.g. 4500"
                        value={formBasePrice}
                        onChange={(e) => setFormBasePrice(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="form-label">
                        <span>Turnaround Hours</span>
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="e.g. 24"
                        value={formTurnaroundHours}
                        onChange={(e) => setFormTurnaroundHours(parseInt(e.target.value) || 24)}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary-300)', lineHeight: 1.5 }}>
                    Customers will submit their files and specific parameters. You will evaluate the scope and issue an official quotation fee in the Orders queue.
                  </div>
                )}
              </div>

              {/* Short Summary */}
              <div className="form-group">
                <label className="form-label">
                  <span>Short Summary (Visible on Service Card)</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="One sentence summary of this service..."
                  value={formShortSummary}
                  onChange={(e) => setFormShortSummary(e.target.value)}
                />
              </div>

              {/* Detailed Description */}
              <div className="form-group">
                <label className="form-label">
                  <span>Detailed Description & Scope</span>
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Explain deliverables, formats, and scope inclusions..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              {/* Status Toggle (for edit) */}
              {editingServiceId && (
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <input
                    type="checkbox"
                    id="service-active-toggle"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                  />
                  <label htmlFor="service-active-toggle" style={{ fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                    Active (Visible in public customer catalog)
                  </label>
                </div>
              )}

              {/* Modal Actions */}
              <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsServiceModalOpen(false)}
                  disabled={isSavingService}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSavingService}>
                  <span>{isSavingService ? 'Saving...' : editingServiceId ? 'Save Changes' : 'Create Service'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
