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
} from 'lucide-react';
import api from '../../api/client';

interface AdminControlCenterProps {
  orders: any[];
  onOpenOrderDetails: (order: any) => void;
  onRefresh: () => void;
}

export const AdminControlCenter: React.FC<AdminControlCenterProps> = ({
  orders,
  onOpenOrderDetails,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'workers' | 'finances'>('orders');
  const [stats, setStats] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [workers, setWorkers] = useState<any[]>([]);

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

  useEffect(() => {
    fetchAdminStats();
    fetchWorkersList();
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

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesSearch =
      !searchTerm ||
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
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
          Operations management, quotation builder, quality-assurance gate, and worker dispatching.
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

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: '0.25rem' }}>
            Approved Specialists
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#C084FC' }}>
            {stats?.approvedWorkersCount ?? 1}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Active pool</div>
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
              {['ALL', 'PENDING_REVIEW', 'READY_FOR_ASSIGNMENT', 'SUBMITTED_FOR_QC', 'READY_FOR_CUSTOMER', 'COMPLETED'].map((st) => (
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
                  <th>Status</th>
                  <th>Quoted Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => (
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
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{ord.category?.name || 'Custom'}</div>
                    </td>
                    <td>
                      <span className={`status-badge status-${ord.status}`}>
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>
                        {ord.quotedPrice ? `LKR ${ord.quotedPrice.toLocaleString()}` : '—'}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: WORKERS VERIFICATION */}
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
    </div>
  );
};
