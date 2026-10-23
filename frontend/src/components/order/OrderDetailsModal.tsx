import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  CreditCard,
  UserCheck,
  Send,
  RefreshCw,
  Star,
  FileText,
  ShieldAlert,
  ArrowRight,
  Eye,
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface OrderDetailsModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onOrderUpdated,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'history'>('overview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState('');

  // Quotation state for admin
  const [quotePrice, setQuotePrice] = useState(order?.quotedPrice || 4500);
  const [quoteNotes, setQuoteNotes] = useState('');

  // Revision state for customer
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');
  const [revisionDetails, setRevisionDetails] = useState('');

  // QC return feedback for admin
  const [showQCReturnForm, setShowQCReturnForm] = useState(false);
  const [qcFeedback, setQcFeedback] = useState('');

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Worker assignment state for admin
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [approvedWorkers, setApprovedWorkers] = useState<any[]>([]);

  if (!isOpen || !order) return null;

  const isAdmin = user?.role === 'ADMIN';
  const isCustomer = user?.role === 'CUSTOMER' && user.id === order.customerId;
  const isWorker = user?.role === 'WORKER';

  // Load approved workers when admin views order awaiting assignment
  const fetchWorkers = async () => {
    try {
      const res = await api.get('/admin/workers?status=APPROVED');
      setApprovedWorkers(res.workers || []);
      if (res.workers?.length > 0 && !selectedWorkerId) {
        setSelectedWorkerId(res.workers[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendQuote = async () => {
    setIsProcessing(true);
    setActionError('');
    try {
      await api.post(`/orders/${order.id}/quote`, {
        quotedPrice: quotePrice,
        quotationNotes: quoteNotes,
      });
      onOrderUpdated();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptQuote = async () => {
    setIsProcessing(true);
    setActionError('');
    try {
      await api.post(`/orders/${order.id}/accept-quote`);
      onOrderUpdated();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSandboxPayment = async () => {
    setIsProcessing(true);
    setActionError('');
    try {
      await api.post(`/payments/sandbox-mock-pay/${order.id}`);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      onOrderUpdated();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssignWorker = async () => {
    if (!selectedWorkerId) return;
    setIsProcessing(true);
    setActionError('');
    try {
      await api.post('/assignments/assign', {
        orderId: order.id,
        workerId: selectedWorkerId,
        hoursToAccept: 6,
      });
      onOrderUpdated();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptAssignment = async () => {
    setIsProcessing(true);
    try {
      await api.post(`/assignments/${order.id}/accept`);
      onOrderUpdated();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQCApprove = async () => {
    setIsProcessing(true);
    try {
      await api.post(`/admin/orders/${order.id}/qc-approve`);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
      onOrderUpdated();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQCReturn = async () => {
    if (!qcFeedback) {
      setActionError('Feedback notes are required for corrections.');
      return;
    }
    setIsProcessing(true);
    try {
      await api.post(`/admin/orders/${order.id}/qc-return`, { qcFeedback });
      setShowQCReturnForm(false);
      onOrderUpdated();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteOrder = async () => {
    setIsProcessing(true);
    try {
      await api.post(`/orders/${order.id}/complete`);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      onOrderUpdated();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionReason.trim()) {
      setActionError('Please provide a reason for the revision.');
      return;
    }
    setIsProcessing(true);
    try {
      await api.post(`/orders/${order.id}/revision`, {
        reason: revisionReason,
        details: revisionDetails,
      });
      setShowRevisionForm(false);
      onOrderUpdated();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitReview = async () => {
    setIsProcessing(true);
    try {
      await api.post(`/reviews/${order.id}`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      confetti({ particleCount: 60, spread: 50 });
      onOrderUpdated();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  let parsedRequirements: Record<string, any> = {};
  try {
    parsedRequirements = JSON.parse(order.requirementsData || '{}');
  } catch (e) {
    parsedRequirements = {};
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '820px', padding: '2rem' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <span className="status-badge" style={{ fontSize: '0.8rem' }}>
                <span className={`status-${order.status}`}>{order.status.replace(/_/g, ' ')}</span>
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontFamily: 'var(--font-mono)' }}>
                {order.orderNumber}
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem' }}>{order.title}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem',
          }}
        >
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '0.5rem 0.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'overview' ? '2px solid var(--primary-500)' : '2px solid transparent',
              color: activeTab === 'overview' ? 'var(--primary-300)' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Overview & Actions
          </button>
          <button
            onClick={() => setActiveTab('files')}
            style={{
              padding: '0.5rem 0.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'files' ? '2px solid var(--primary-500)' : '2px solid transparent',
              color: activeTab === 'files' ? 'var(--primary-300)' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Files Vault ({order.files?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '0.5rem 0.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'history' ? '2px solid var(--primary-500)' : '2px solid transparent',
              color: activeTab === 'history' ? 'var(--primary-300)' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Timeline & Audit History
          </button>
        </div>

        {actionError && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            {actionError}
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            {/* Action Banner According to Order Status */}
            <div
              className="glass-card"
              style={{
                backgroundColor: 'rgba(99, 102, 241, 0.06)',
                borderColor: 'rgba(99, 102, 241, 0.3)',
                padding: '1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#FFFFFF' }}>
                Next Required Operational Action:
              </h4>

              {/* Status 1: PENDING_REVIEW -> Admin can send quotation */}
              {order.status === 'PENDING_REVIEW' && (
                <div>
                  <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                    This order was recently submitted by the client and requires an Administrator to review requirements and set quotation pricing.
                  </p>
                  {isAdmin ? (
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="Quote Price (LKR)"
                        value={quotePrice}
                        onChange={(e) => setQuotePrice(parseFloat(e.target.value))}
                        style={{ width: '180px' }}
                      />
                      <button className="btn btn-primary btn-sm" onClick={handleSendQuote} disabled={isProcessing}>
                        <Send size={14} />
                        <span>Issue Official Quotation</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--warning)' }}>
                      ⏳ The Administrator is currently preparing your itemized quotation.
                    </div>
                  )}
                </div>
              )}

              {/* Status 2: QUOTATION_SENT -> Customer accepts quote */}
              {order.status === 'QUOTATION_SENT' && (
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                    Quoted Price: LKR {(order.quotedPrice || 0).toLocaleString()}
                  </div>
                  <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {order.quotationNotes || 'Service pricing confirmed.'}
                  </p>
                  {isCustomer ? (
                    <button className="btn btn-primary btn-sm" onClick={handleAcceptQuote} disabled={isProcessing}>
                      <CheckCircle2 size={16} />
                      <span>Accept Quotation & Proceed to Payment</span>
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Waiting for customer to accept quotation.
                    </span>
                  )}
                </div>
              )}

              {/* Status 3: AWAITING_PAYMENT -> PayHere checkout */}
              {order.status === 'AWAITING_PAYMENT' && (
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                    Amount Due: LKR {(order.quotedPrice || 0).toLocaleString()} (Escrow Protected)
                  </div>
                  <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                    Funds are held in secure escrow. The assigned specialist only receives payout once you inspect and approve the work.
                  </p>
                  {isCustomer ? (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button className="btn btn-success btn-sm" onClick={handleSandboxPayment} disabled={isProcessing}>
                        <CreditCard size={16} />
                        <span>Pay via PayHere (Sandbox Simulated Instant Pay)</span>
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Awaiting client payment confirmation.
                    </span>
                  )}
                </div>
              )}

              {/* Status 4: READY_FOR_ASSIGNMENT -> Admin assigns approved worker */}
              {order.status === 'READY_FOR_ASSIGNMENT' && (
                <div>
                  <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                    Payment verified (held in escrow). The order is ready to be dispatched to a verified worker.
                  </p>
                  {isAdmin ? (
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={fetchWorkers}
                        style={{ display: approvedWorkers.length === 0 ? 'inline-flex' : 'none' }}
                      >
                        Load Approved Workers
                      </button>

                      {approvedWorkers.length > 0 && (
                        <>
                          <select
                            className="form-select"
                            value={selectedWorkerId}
                            onChange={(e) => setSelectedWorkerId(e.target.value)}
                            style={{ maxWidth: '300px' }}
                          >
                            {approvedWorkers.map((w) => (
                              <option key={w.id} value={w.id}>
                                {w.fullName} ({w.workerProfile?.headline || 'Specialist'}) — ★ {w.workerProfile?.ratingAvg}
                              </option>
                            ))}
                          </select>
                          <button className="btn btn-primary btn-sm" onClick={handleAssignWorker} disabled={isProcessing}>
                            <UserCheck size={16} />
                            <span>Assign Specialist</span>
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                      ⚙️ Admin is assigning your task to a verified specialist.
                    </div>
                  )}
                </div>
              )}

              {/* Status 5: AWAITING_WORKER_ACCEPTANCE -> Worker accepts/declines */}
              {order.status === 'AWAITING_WORKER_ACCEPTANCE' && (
                <div>
                  <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                    Assignment dispatched. The worker has an active acceptance countdown window.
                  </p>
                  {isWorker ? (
                    <button className="btn btn-primary btn-sm" onClick={handleAcceptAssignment} disabled={isProcessing}>
                      <CheckCircle2 size={16} />
                      <span>Accept Assignment & Start Delivery</span>
                    </button>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--warning)' }}>
                      ⏳ Awaiting worker acceptance.
                    </div>
                  )}
                </div>
              )}

              {/* Status 6: IN_PROGRESS -> Worker is executing work */}
              {order.status === 'IN_PROGRESS' && (
                <div>
                  <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Specialist is currently executing the project.
                  </p>
                  <div style={{ fontSize: '0.85rem', color: 'var(--primary-300)' }}>
                    Target Completion: {new Date(order.targetDeadline).toLocaleString()}
                  </div>
                </div>
              )}

              {/* Status 7: SUBMITTED_FOR_QC -> Admin Quality Check */}
              {order.status === 'SUBMITTED_FOR_QC' && (
                <div>
                  <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                    Worker has submitted final deliverables. Deliverable is gated by Admin Quality Check.
                  </p>
                  {isAdmin ? (
                    <div>
                      {!showQCReturnForm ? (
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button className="btn btn-success btn-sm" onClick={handleQCApprove} disabled={isProcessing}>
                            <CheckCircle2 size={16} />
                            <span>Approve QC & Unlock for Customer</span>
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => setShowQCReturnForm(true)}>
                            <span>Return for Corrections</span>
                          </button>
                        </div>
                      ) : (
                        <div style={{ marginTop: '0.75rem' }}>
                          <textarea
                            className="form-textarea"
                            placeholder="Specify what corrections or formatting changes the worker must resolve..."
                            value={qcFeedback}
                            onChange={(e) => setQcFeedback(e.target.value)}
                          />
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button className="btn btn-danger btn-sm" onClick={handleQCReturn} disabled={isProcessing}>
                              Submit Correction Notes to Worker
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowQCReturnForm(false)}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--warning)' }}>
                      🔍 Administrator is currently conducting a Quality Check on your files.
                    </div>
                  )}
                </div>
              )}

              {/* Status 8: READY_FOR_CUSTOMER -> Download, accept, or request revision */}
              {order.status === 'READY_FOR_CUSTOMER' && (
                <div>
                  <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--success)' }}>
                    🎉 Your deliverables have passed Admin Quality Check and are available for download!
                  </p>

                  {isCustomer && (
                    <div>
                      {!showRevisionForm ? (
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <button className="btn btn-success btn-sm" onClick={handleCompleteOrder} disabled={isProcessing}>
                            <CheckCircle2 size={16} />
                            <span>Accept Work & Complete Order</span>
                          </button>
                          {order.revisionsUsed < order.revisionsAllowed && (
                            <button className="btn btn-outline btn-sm" onClick={() => setShowRevisionForm(true)}>
                              <RefreshCw size={14} />
                              <span>Request Revision ({order.revisionsAllowed - order.revisionsUsed} left)</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div style={{ marginTop: '0.75rem' }}>
                          <div className="form-group">
                            <label className="form-label">Revision Reason</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="e.g. Minor wording change in executive summary"
                              value={revisionReason}
                              onChange={(e) => setRevisionReason(e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Specific Revision Details</label>
                            <textarea
                              className="form-textarea"
                              placeholder="Detail the exact adjustments required within the original brief..."
                              value={revisionDetails}
                              onChange={(e) => setRevisionDetails(e.target.value)}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-primary btn-sm" onClick={handleRequestRevision} disabled={isProcessing}>
                              Submit Revision Request
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowRevisionForm(false)}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Status 9: COMPLETED -> Review & rating */}
              {order.status === 'COMPLETED' && (
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--success)', marginBottom: '0.5rem' }}>
                    ✅ Order officially completed and closed! Funds released to worker.
                  </p>

                  {isCustomer && !order.review && (
                    <div style={{ marginTop: '0.75rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)' }}>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Leave a Rating & Review</h4>
                      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={20}
                            fill={star <= reviewRating ? '#FBBF24' : 'none'}
                            color="#FBBF24"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setReviewRating(star)}
                          />
                        ))}
                      </div>
                      <textarea
                        className="form-textarea"
                        placeholder="Write a testimonial for the worker..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        style={{ minHeight: '70px', marginBottom: '0.5rem' }}
                      />
                      <button className="btn btn-primary btn-sm" onClick={handleSubmitReview} disabled={isProcessing}>
                        Submit Review
                      </button>
                    </div>
                  )}

                  {order.review && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      ⭐ Your rating: {order.review.rating}/5 — "{order.review.comment}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Order Specification Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--primary-300)', marginBottom: '0.75rem' }}>
                  Project Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-sub)' }}>Category: </span>
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{order.category?.name || 'Custom'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-sub)' }}>Target Deadline: </span>
                    <span style={{ color: 'var(--text-main)' }}>{new Date(order.targetDeadline).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-sub)' }}>Customer: </span>
                    <span style={{ color: 'var(--text-main)' }}>{order.customer?.fullName}</span>
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--primary-300)', marginBottom: '0.75rem' }}>
                  Financial Breakdown
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-sub)' }}>Quoted Price:</span>
                    <span style={{ fontWeight: 700, color: '#FFFFFF' }}>LKR {(order.quotedPrice || 0).toLocaleString()}</span>
                  </div>
                  {isAdmin && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-sub)' }}>Platform Fee (20%):</span>
                        <span style={{ color: 'var(--success)' }}>LKR {order.platformFee.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-sub)' }}>Worker Payout:</span>
                        <span style={{ color: 'var(--primary-300)' }}>LKR {order.workerPayout.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic Requirements Display */}
            {Object.keys(parsedRequirements).length > 0 && (
              <div className="glass-card" style={{ padding: '1.25rem', marginTop: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--primary-300)', marginBottom: '0.75rem' }}>
                  Customer Requirement Brief
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  {Object.entries(parsedRequirements).map(([key, val]) => (
                    <div key={key} style={{ fontSize: '0.85rem' }}>
                      <div style={{ color: 'var(--text-sub)', textTransform: 'capitalize' }}>
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div style={{ color: 'var(--text-main)', fontWeight: 500, marginTop: '0.15rem' }}>
                        {String(val)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FILES VAULT */}
        {activeTab === 'files' && (
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Order Files Vault</h4>
            {(!order.files || order.files.length === 0) ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>No files uploaded yet for this order.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {order.files.map((file: any) => (
                  <div
                    key={file.id}
                    className="glass-card"
                    style={{
                      padding: '0.85rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FileText size={20} color="var(--primary-400)" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{file.originalFilename}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                          Tag: <span style={{ color: 'var(--accent-cyan)' }}>{file.fileTag}</span> • {(file.fileSizeBytes / 1024).toFixed(0)} KB
                        </div>
                      </div>
                    </div>

                    <a
                      href={api.getDownloadUrl(file.id)}
                      download
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', gap: '0.35rem' }}
                    >
                      <Download size={14} />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TIMELINE & AUDIT HISTORY */}
        {activeTab === 'history' && (
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>16-Step Lifecycle Audit Trail</h4>
            <div className="timeline">
              {order.statusHistory?.map((hist: any, i: number) => (
                <div key={hist.id} className="timeline-step active">
                  <div className="timeline-node" />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {hist.toStatus.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {hist.notes}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-sub)', marginTop: '0.15rem' }}>
                      {new Date(hist.createdAt).toLocaleString()} by {hist.changedBy?.fullName || 'System'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
