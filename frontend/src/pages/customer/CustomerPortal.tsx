import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CustomerPortalProps {
  orders: any[];
  onOpenOrderDetails: (order: any) => void;
  onOpenNewOrderModal: (customMode?: boolean) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  orders,
  onOpenOrderDetails,
  onOpenNewOrderModal,
}) => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'ALL') return true;
    return o.status === statusFilter;
  });

  // KPI Calculations
  const inProgressCount = orders.filter((o) =>
    ['READY_FOR_ASSIGNMENT', 'AWAITING_WORKER_ACCEPTANCE', 'IN_PROGRESS', 'SUBMITTED_FOR_QC'].includes(o.status)
  ).length;
  const awaitingPaymentCount = orders.filter((o) =>
    ['QUOTATION_SENT', 'AWAITING_PAYMENT'].includes(o.status)
  ).length;
  const readyForCustomerCount = orders.filter((o) => o.status === 'READY_FOR_CUSTOMER').length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* Header */}
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
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>
            Customer Orders Workspace
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Welcome back, {user?.fullName}! Track active tasks, review quotations, make escrow payments, and download quality-checked deliverables.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => onOpenNewOrderModal(true)}>
            <Sparkles size={16} color="var(--primary-300)" />
            <span>Request Another / Custom Service</span>
          </button>
          <button className="btn btn-primary" onClick={() => onOpenNewOrderModal(false)}>
            <Plus size={18} />
            <span>Order Digital Service</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-sub)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active Orders</span>
            <Clock size={18} color="var(--primary-400)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{inProgressCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary-300)', marginTop: '0.25rem' }}>
            Under specialist execution
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
            Quotations & Pending Escrow
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-sub)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Ready for Review</span>
            <FileText size={18} color="var(--success)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>
            {readyForCustomerCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>
            QC Passed deliverables
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-sub)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Completed</span>
            <CheckCircle2 size={18} color="#C084FC" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{completedCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>
            Closed & Reviewed orders
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
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
          <h3 style={{ fontSize: '1.2rem' }}>Order Records ({filteredOrders.length})</h3>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All
            </button>
            <button
              className={`btn btn-sm ${statusFilter === 'AWAITING_PAYMENT' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('AWAITING_PAYMENT')}
            >
              Awaiting Payment
            </button>
            <button
              className={`btn btn-sm ${statusFilter === 'READY_FOR_CUSTOMER' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('READY_FOR_CUSTOMER')}
            >
              Ready to Download
            </button>
            <button
              className={`btn btn-sm ${statusFilter === 'IN_PROGRESS' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('IN_PROGRESS')}
            >
              In Progress
            </button>
            <button
              className={`btn btn-sm ${statusFilter === 'COMPLETED' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('COMPLETED')}
            >
              Completed
            </button>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <FileText size={42} color="var(--text-dim)" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ color: 'var(--text-muted)' }}>No orders in this view</h4>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: 'var(--text-sub)' }}>
              Submit a service order or request a custom service to get started.
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onOpenNewOrderModal(false)}
              style={{ marginTop: '1rem' }}
            >
              Browse Services & Order
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Service / Title</th>
                  <th>Status</th>
                  <th>Target Deadline</th>
                  <th>Service Fee</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => {
                  const isAwaitingPay = ord.status === 'AWAITING_PAYMENT';
                  const isQuoted = ord.status === 'QUOTATION_SENT';

                  return (
                    <tr key={ord.id}>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary-300)' }}>
                          {ord.orderNumber}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{ord.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                          {ord.category?.name || 'Custom Request'}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge status-${ord.status}`}>
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {new Date(ord.targetDeadline).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: ord.quotedPrice ? '#FFFFFF' : 'var(--text-dim)' }}>
                          {ord.quotedPrice ? `LKR ${ord.quotedPrice.toLocaleString()}` : 'Awaiting Quote'}
                        </div>
                      </td>
                      <td>
                        {isAwaitingPay ? (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => onOpenOrderDetails(ord)}
                            style={{ display: 'inline-flex', gap: '0.35rem' }}
                          >
                            <CreditCard size={14} />
                            <span>Pay Now</span>
                          </button>
                        ) : isQuoted ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onOpenOrderDetails(ord)}
                            style={{ display: 'inline-flex', gap: '0.35rem' }}
                          >
                            <Eye size={14} />
                            <span>Review Quote</span>
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onOpenOrderDetails(ord)}
                            style={{ display: 'inline-flex', gap: '0.35rem' }}
                          >
                            <Eye size={14} />
                            <span>View Details</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
