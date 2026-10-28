import React, { useState, useEffect } from 'react';
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
  MessageSquare,
  UploadCloud,
  Ban,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  DollarSign,
  RotateCcw,
  Edit2,
  Settings,
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
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'files' | 'history'>('overview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState('');

  // Quotation state for admin
  const [quotePrice, setQuotePrice] = useState(order?.quotedPrice || 4500);
  const [quoteCommissionRate, setQuoteCommissionRate] = useState<number>(order?.platformCommissionRate ?? 0.20);
  const [quoteNotes, setQuoteNotes] = useState(order?.quotationNotes || '');
  const [showAdvancedQuote, setShowAdvancedQuote] = useState(false);

  // Calculated quote preview
  const quotePlatformFee = Math.round((quotePrice || 0) * quoteCommissionRate);
  const quoteWorkerPayout = (quotePrice || 0) - quotePlatformFee;

  // Admin Escrow & Pricing Breakdown Editor state
  const [isEditingPricing, setIsEditingPricing] = useState(false);
  const [editQuotedPrice, setEditQuotedPrice] = useState<number>(order?.quotedPrice || 4500);
  const [editCommissionRate, setEditCommissionRate] = useState<number>(order?.platformCommissionRate ?? 0.20);
  const [editPlatformFee, setEditPlatformFee] = useState<number>(order?.platformFee || 900);
  const [editWorkerPayout, setEditWorkerPayout] = useState<number>(order?.workerPayout || 3600);
  const [editPricingNotes, setEditPricingNotes] = useState(order?.quotationNotes || '');
  const [editPricingReason, setEditPricingReason] = useState('');
  const [pricingSuccessMsg, setPricingSuccessMsg] = useState('');

  // Escrow Release / Refund state for admin
  const [showEscrowReleaseConfirm, setShowEscrowReleaseConfirm] = useState(false);
  const [showEscrowRefundConfirm, setShowEscrowRefundConfirm] = useState(false);
  const [escrowRefundReason, setEscrowRefundReason] = useState('Customer requested refund / operational cancellation');
  const [escrowRefundAmount, setEscrowRefundAmount] = useState<number>(order?.quotedPrice || 0);
  const [isEscrowProcessing, setIsEscrowProcessing] = useState(false);
  const [escrowActionMessage, setEscrowActionMessage] = useState('');

  useEffect(() => {
    if (order) {
      setQuotePrice(order.quotedPrice || 4500);
      setQuoteCommissionRate(order.platformCommissionRate ?? 0.20);
      setQuoteNotes(order.quotationNotes || '');
      setEditQuotedPrice(order.quotedPrice || 4500);
      setEditCommissionRate(order.platformCommissionRate ?? 0.20);
      setEditPlatformFee(order.platformFee || Math.round((order.quotedPrice || 4500) * 0.20));
      setEditWorkerPayout(order.workerPayout || Math.round((order.quotedPrice || 4500) * 0.80));
      setEditPricingNotes(order.quotationNotes || '');
      setEscrowRefundAmount(order.quotedPrice || 0);
    }
  }, [order?.id, order?.quotedPrice, order?.platformFee, order?.workerPayout]);

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

  // Cancellation state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Messaging state
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Additional file upload state
  const [additionalFile, setAdditionalFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  useEffect(() => {
    if (order?.messages) {
      setMessages(order.messages);
    }
  }, [order?.messages]);

  const fetchMessages = async () => {
    if (!order?.id) return;
    try {
      const res = await api.get(`/orders/${order.id}/messages`);
      if (res.messages) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'messages' && order?.id) {
      fetchMessages();
    }
  }, [activeTab, order?.id]);

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
        commissionRate: quoteCommissionRate,
        platformFee: quotePlatformFee,
        workerPayout: quoteWorkerPayout,
        quotationNotes: quoteNotes,
      });
      onOrderUpdated();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSavePricingBreakdown = async () => {
    setIsProcessing(true);
    setActionError('');
    setPricingSuccessMsg('');
    try {
      await api.put(`/admin/orders/${order.id}/pricing`, {
        quotedPrice: editQuotedPrice,
        platformCommissionRate: editCommissionRate,
        platformFee: editPlatformFee,
        workerPayout: editWorkerPayout,
        quotationNotes: editPricingNotes,
        adminReason: editPricingReason || 'Administrator updated pricing terms',
      });
      setPricingSuccessMsg('Escrow & Pricing breakdown updated successfully!');
      setTimeout(() => {
        setIsEditingPricing(false);
        setPricingSuccessMsg('');
      }, 1500);
      onOrderUpdated();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update pricing breakdown');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdminReleaseEscrow = async () => {
    setIsEscrowProcessing(true);
    setActionError('');
    try {
      const res = await api.post(`/admin/orders/${order.id}/escrow/release`, {
        notes: 'Manual release authorized by Administrator',
      });
      setShowEscrowReleaseConfirm(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setEscrowActionMessage(res.message || 'Escrow funds successfully released to specialist!');
      setTimeout(() => setEscrowActionMessage(''), 4000);
      onOrderUpdated();
    } catch (err: any) {
      setActionError(err.message || 'Failed to release escrow');
    } finally {
      setIsEscrowProcessing(false);
    }
  };

  const handleAdminRefundEscrow = async () => {
    setIsEscrowProcessing(true);
    setActionError('');
    try {
      const res = await api.post(`/admin/orders/${order.id}/escrow/refund`, {
        refundAmount: escrowRefundAmount,
        reason: escrowRefundReason,
      });
      setShowEscrowRefundConfirm(false);
      setEscrowActionMessage(res.message || 'Escrow refund successfully processed.');
      setTimeout(() => setEscrowActionMessage(''), 4000);
      onOrderUpdated();
    } catch (err: any) {
      setActionError(err.message || 'Failed to process refund');
    } finally {
      setIsEscrowProcessing(false);
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

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      setActionError('Please specify a reason for cancellation.');
      return;
    }
    setIsProcessing(true);
    try {
      await api.post(`/orders/${order.id}/cancel`, { reason: cancelReason });
      setShowCancelModal(false);
      onOrderUpdated();
    } catch (err: any) {
      setActionError(err.message || 'Failed to cancel order.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    setIsSendingMessage(true);
    try {
      const res = await api.post(`/orders/${order.id}/messages`, {
        message: newMessageText.trim(),
      });
      setMessages((prev) => [...prev, res.orderMessage]);
      setNewMessageText('');
    } catch (err: any) {
      alert(err.message || 'Failed to send message.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleUploadAdditionalFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!additionalFile) return;

    setIsUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', additionalFile);
      formData.append('fileTag', 'CUSTOMER_ADDITIONAL');

      await api.post(`/files/upload/${order.id}`, formData);
      setAdditionalFile(null);
      onOrderUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to upload additional file.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  let parsedRequirements: Record<string, any> = {};
  try {
    parsedRequirements = JSON.parse(order.requirementsData || '{}');
  } catch (e) {
    parsedRequirements = {};
  }

  // Calculate Progress Stepper
  const steps = [
    { key: 'SUBMITTED', label: '1. Order Submitted', doneStatuses: ['PENDING_REVIEW', 'QUOTATION_SENT', 'AWAITING_PAYMENT', 'READY_FOR_ASSIGNMENT', 'AWAITING_WORKER_ACCEPTANCE', 'IN_PROGRESS', 'SUBMITTED_FOR_QC', 'READY_FOR_CUSTOMER', 'COMPLETED'] },
    { key: 'QUOTED', label: '2. Quotation Confirmed', doneStatuses: ['AWAITING_PAYMENT', 'READY_FOR_ASSIGNMENT', 'AWAITING_WORKER_ACCEPTANCE', 'IN_PROGRESS', 'SUBMITTED_FOR_QC', 'READY_FOR_CUSTOMER', 'COMPLETED'] },
    { key: 'PAID', label: '3. Escrow Locked', doneStatuses: ['READY_FOR_ASSIGNMENT', 'AWAITING_WORKER_ACCEPTANCE', 'IN_PROGRESS', 'SUBMITTED_FOR_QC', 'READY_FOR_CUSTOMER', 'COMPLETED'] },
    { key: 'ASSIGNED', label: '4. Specialist Assigned', doneStatuses: ['IN_PROGRESS', 'SUBMITTED_FOR_QC', 'READY_FOR_CUSTOMER', 'COMPLETED'] },
    { key: 'EXECUTION', label: '5. Work Execution', doneStatuses: ['SUBMITTED_FOR_QC', 'READY_FOR_CUSTOMER', 'COMPLETED'] },
    { key: 'QC', label: '6. Quality Check (Admin)', doneStatuses: ['READY_FOR_CUSTOMER', 'COMPLETED'] },
    { key: 'DELIVERY', label: '7. Delivered & Review', doneStatuses: ['COMPLETED'] },
  ];

  const isCancelled = order.status === 'CANCELLED';

  const getStepStatus = (step: any) => {
    if (isCancelled) return 'cancelled';
    if (step.doneStatuses.includes(order.status)) return 'completed';
    return 'pending';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '860px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <span className={`status-badge status-${order.status}`}>
                {order.status.replace(/_/g, ' ')}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontFamily: 'var(--font-mono)' }}>
                {order.orderNumber}
              </span>
              {order.category?.name && (
                <span style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.08)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}>
                  {order.category.name}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.4rem' }}>{order.title}</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Cancel Order Action */}
            {isCustomer && !['COMPLETED', 'CANCELLED'].includes(order.status) && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setShowCancelModal(true)}
                title="Cancel order according to cancellation rules"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Ban size={14} />
                <span>Cancel Order</span>
              </button>
            )}
            <button className="modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 7-Step Visual Progress Stepper */}
        {!isCancelled ? (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Order Lifecycle Progress Tracking
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.4rem' }}>
              {steps.map((st, i) => {
                const stepState = getStepStatus(st);
                const isFinished = stepState === 'completed';
                return (
                  <div
                    key={st.key}
                    style={{
                      padding: '0.4rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isFinished ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                      border: isFinished ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                      fontSize: '0.72rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.15rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      {isFinished ? (
                        <CheckCircle2 size={12} color="var(--success)" />
                      ) : (
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-dim)' }} />
                      )}
                      <span style={{ fontWeight: 600, color: isFinished ? '#FFFFFF' : 'var(--text-sub)' }}>
                        {st.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Ban size={20} color="var(--danger)" />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '0.9rem' }}>
                This order was cancelled.
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Reason: {order.cancellationReason || 'Cancelled by customer / admin.'}
              </div>
            </div>
          </div>
        )}

        {/* Tab Selector */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
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
            onClick={() => setActiveTab('messages')}
            style={{
              padding: '0.5rem 0.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'messages' ? '2px solid var(--primary-500)' : '2px solid transparent',
              color: activeTab === 'messages' ? 'var(--primary-300)' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <MessageSquare size={14} />
            <span>Admin Messages ({messages.length})</span>
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
            Timeline & History
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
                    {isCustomer
                      ? 'Your order has been submitted! The administrator is reviewing your requirements and preparing a formal quotation.'
                      : 'This order was recently submitted by the client and requires an Administrator to review requirements and set quotation pricing.'}
                  </p>
                  {isAdmin ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '0.25rem', fontWeight: 600 }}>
                            Quoted Price to Client (LKR)
                          </label>
                          <input
                            type="number"
                            className="form-input"
                            placeholder="Quote Price (LKR)"
                            value={quotePrice}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setQuotePrice(val);
                            }}
                            style={{ width: '180px', fontWeight: 700 }}
                          />
                        </div>

                        <div style={{ flex: 1, minWidth: '220px' }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '0.25rem', fontWeight: 600 }}>
                            Quotation Terms & Deliverables Note
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Standard turnaround, includes 2 revisions"
                            value={quoteNotes}
                            onChange={(e) => setQuoteNotes(e.target.value)}
                            style={{ width: '100%' }}
                          />
                        </div>

                        <button
                          className="btn btn-primary btn-sm"
                          onClick={handleSendQuote}
                          disabled={isProcessing || !quotePrice || quotePrice <= 0}
                          style={{ marginTop: '1.25rem' }}
                        >
                          <Send size={15} />
                          <span>Send Quotation to Client</span>
                        </button>
                      </div>

                      {/* Escrow & Pricing Breakdown Configuration Bar */}
                      <div
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '1rem',
                          fontSize: '0.825rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: 'var(--text-sub)', fontWeight: 600 }}>Commission Rate:</span>
                          {[0.10, 0.15, 0.20, 0.25, 0.30].map((rate) => (
                            <button
                              key={rate}
                              type="button"
                              onClick={() => setQuoteCommissionRate(rate)}
                              className={`btn btn-sm ${quoteCommissionRate === rate ? 'btn-primary' : 'btn-secondary'}`}
                              style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem' }}
                            >
                              {(rate * 100).toFixed(0)}%
                            </button>
                          ))}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                          <div>
                            <span style={{ color: 'var(--text-sub)' }}>Platform Fee: </span>
                            <strong style={{ color: 'var(--accent-cyan)' }}>LKR {quotePlatformFee.toLocaleString()}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-sub)' }}>Specialist Payout: </span>
                            <strong style={{ color: 'var(--primary-300)' }}>LKR {quoteWorkerPayout.toLocaleString()}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary-300)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} />
                      <span>Estimated quote turnaround: Within 2 hours during operational hours.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Status 2: QUOTATION_SENT -> Customer confirms quotation */}
              {order.status === 'QUOTATION_SENT' && (
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.25rem' }}>
                      Quoted Price: LKR {order.quotedPrice?.toLocaleString() || 'N/A'}
                    </div>
                    {order.quotationNotes && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        <strong>Administrator Notes:</strong> {order.quotationNotes}
                      </p>
                    )}
                  </div>
                  {isCustomer ? (
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button className="btn btn-success btn-sm" onClick={handleAcceptQuote} disabled={isProcessing}>
                        <CheckCircle2 size={16} />
                        <span>Confirm & Accept Service Price</span>
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('messages')}>
                        <MessageSquare size={16} />
                        <span>Inquire with Admin</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                      ⏳ Waiting for client to review and accept quotation of LKR {order.quotedPrice?.toLocaleString()}.
                    </div>
                  )}
                </div>
              )}

              {/* Status 3: AWAITING_PAYMENT -> Customer pays escrow */}
              {order.status === 'AWAITING_PAYMENT' && (
                <div>
                  <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                    Price confirmed: <strong>LKR {order.quotedPrice?.toLocaleString()}</strong>. Payment is held securely in platform escrow and only released when you approve the deliverable.
                  </p>
                  {isCustomer ? (
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button className="btn btn-primary btn-sm" onClick={handleSandboxPayment} disabled={isProcessing}>
                        <CreditCard size={16} />
                        <span>⚡ Complete Escrow Payment (Instant Simulated)</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--warning)' }}>
                      ⏳ Waiting for customer to complete escrow payment.
                    </div>
                  )}
                </div>
              )}

              {/* Status 4: READY_FOR_ASSIGNMENT -> Admin assigns specialist */}
              {order.status === 'READY_FOR_ASSIGNMENT' && (
                <div>
                  <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--success)' }}>
                    ✅ Escrow payment confirmed (LKR {order.quotedPrice?.toLocaleString()}). Task is ready for specialist dispatch.
                  </p>
                  {isAdmin ? (
                    <div>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select
                          className="form-select"
                          value={selectedWorkerId}
                          onChange={(e) => setSelectedWorkerId(e.target.value)}
                          onFocus={fetchWorkers}
                          style={{ width: '280px' }}
                        >
                          <option value="">Select Verified Specialist...</option>
                          {approvedWorkers.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.fullName} • Rating: {w.workerProfile?.ratingAvg || '5.0'}★
                            </option>
                          ))}
                        </select>
                        <button className="btn btn-primary btn-sm" onClick={handleAssignWorker} disabled={isProcessing}>
                          <UserCheck size={16} />
                          <span>Dispatch Assignment Offer</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary-300)' }}>
                      ⚙️ Admin is assigning your order to a verified specialist matching your requirements.
                    </div>
                  )}
                </div>
              )}

              {/* Status 5: AWAITING_WORKER_ACCEPTANCE -> Worker accepts/declines */}
              {order.status === 'AWAITING_WORKER_ACCEPTANCE' && (
                <div>
                  <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                    Assignment dispatched. The specialist has an active acceptance countdown window.
                  </p>
                  {isWorker ? (
                    <button className="btn btn-primary btn-sm" onClick={handleAcceptAssignment} disabled={isProcessing}>
                      <CheckCircle2 size={16} />
                      <span>Accept Assignment & Start Delivery</span>
                    </button>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--warning)' }}>
                      ⏳ Awaiting specialist acceptance.
                    </div>
                  )}
                </div>
              )}

              {/* Status 6: IN_PROGRESS -> Worker is executing work */}
              {order.status === 'IN_PROGRESS' && (
                <div>
                  <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Specialist is actively working on your order.
                  </p>
                  <div style={{ fontSize: '0.85rem', color: 'var(--primary-300)' }}>
                    Target Completion Deadline: {new Date(order.targetDeadline).toLocaleString()}
                  </div>
                </div>
              )}

              {/* Status 7: SUBMITTED_FOR_QC -> Admin Quality Check */}
              {order.status === 'SUBMITTED_FOR_QC' && (
                <div>
                  <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                    Specialist has completed the draft and submitted for internal Admin Quality Assurance.
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
                    <div style={{ fontSize: '0.85rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ShieldCheck size={16} />
                      <span>Platform Administrator is conducting strict Quality Control before releasing the files to you.</span>
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
                            <span>Accept Deliverable & Complete Order</span>
                          </button>
                          {order.revisionsUsed < order.revisionsAllowed && (
                            <button className="btn btn-outline btn-sm" onClick={() => setShowRevisionForm(true)}>
                              <RefreshCw size={14} />
                              <span>Request Revision ({order.revisionsAllowed - order.revisionsUsed} free left)</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div style={{ marginTop: '0.75rem' }}>
                          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <strong>Service Revision Policy:</strong> Revisions cover adjustments matching your original instructions. Major scope additions require a supplementary quote.
                          </div>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Reason for Revision (e.g. Formatting correction, minor wording update)"
                            value={revisionReason}
                            onChange={(e) => setRevisionReason(e.target.value)}
                            style={{ marginBottom: '0.5rem' }}
                          />
                          <textarea
                            className="form-textarea"
                            placeholder="Provide specific notes and clear bullet points for the revision..."
                            value={revisionDetails}
                            onChange={(e) => setRevisionDetails(e.target.value)}
                          />
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
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

              {/* Status 9: REVISION_REQUESTED */}
              {order.status === 'REVISION_REQUESTED' && (
                <div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--warning)', fontWeight: 600, marginBottom: '0.35rem' }}>
                    🔄 Revision in Progress (Revision #{order.revisionsUsed} of {order.revisionsAllowed})
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    The specialist is updating your deliverable according to your revision brief.
                  </p>
                </div>
              )}

              {/* Status 10: COMPLETED -> Review & Rating */}
              {order.status === 'COMPLETED' && (
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--success)', marginBottom: '0.75rem' }}>
                    🏆 Order Completed! Escrow has been cleared.
                  </p>
                  {isCustomer && !order.review && (
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                      <h5 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Rate & Review This Service</h5>
                      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={22}
                            onClick={() => setReviewRating(star)}
                            color={star <= reviewRating ? 'var(--warning)' : 'var(--text-dim)'}
                            fill={star <= reviewRating ? 'var(--warning)' : 'transparent'}
                            style={{ cursor: 'pointer' }}
                          />
                        ))}
                      </div>
                      <textarea
                        className="form-textarea"
                        placeholder="Write feedback about service quality, timeliness, and experience..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        style={{ minHeight: '70px', marginBottom: '0.5rem' }}
                      />
                      <button className="btn btn-primary btn-sm" onClick={handleSubmitReview} disabled={isProcessing}>
                        Submit Service Review
                      </button>
                    </div>
                  )}

                  {order.review && (
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <div style={{ display: 'flex', gap: '0.15rem' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              color={s <= order.review.rating ? 'var(--warning)' : 'var(--text-dim)'}
                              fill={s <= order.review.rating ? 'var(--warning)' : 'transparent'}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                          Reviewed on {new Date(order.review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontStyle: 'italic' }}>
                        "{order.review.comment}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Deliverable Highlight if Ready */}
            {['READY_FOR_CUSTOMER', 'COMPLETED'].includes(order.status) && order.files && (
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(99, 102, 241, 0.1))',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={18} color="var(--success)" />
                    <span>Quality-Checked Work Deliverable Ready!</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Download your completed files, verify against requirements, and accept or request revision.
                  </div>
                </div>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => setActiveTab('files')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Download size={15} />
                  <span>Go to Files Vault</span>
                </button>
              </div>
            )}

            {/* Order Specification Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--primary-300)', marginBottom: '0.75rem' }}>
                  Client & Order Metadata
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-sub)' }}>Customer:</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{order.customer?.fullName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-sub)' }}>Target Deadline:</span>
                    <span style={{ color: 'var(--text-main)' }}>{new Date(order.targetDeadline).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-sub)' }}>Revisions:</span>
                    <span style={{ color: 'var(--text-main)' }}>{order.revisionsUsed} / {order.revisionsAllowed}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-sub)' }}>Submitted:</span>
                    <span style={{ color: 'var(--text-main)' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <DollarSign size={16} color="var(--primary-300)" />
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--primary-300)', margin: 0, fontWeight: 700 }}>
                      Escrow & Pricing Breakdown
                    </h4>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setIsEditingPricing(!isEditingPricing)}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Edit2 size={13} />
                      <span>{isEditingPricing ? 'Close Editor' : 'Manage Breakdown'}</span>
                    </button>
                  )}
                </div>

                {/* Escrow Status Notification Message */}
                {escrowActionMessage && (
                  <div
                    style={{
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid var(--success)',
                      color: 'var(--success)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      marginBottom: '0.75rem',
                    }}
                  >
                    {escrowActionMessage}
                  </div>
                )}

                {/* Read-Only Breakdown View */}
                {!isEditingPricing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-sub)' }}>Total Quoted Price:</span>
                      <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.05rem' }}>
                        {order.quotedPrice ? `LKR ${order.quotedPrice.toLocaleString()}` : 'Awaiting Quote'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-sub)' }}>Escrow Vault Status:</span>
                      <div>
                        {order.status === 'COMPLETED' ? (
                          <span style={{ color: 'var(--success)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={13} /> Escrow Released to Specialist
                          </span>
                        ) : order.payments?.some((p: any) => p.status === 'REFUNDED') ? (
                          <span style={{ color: '#A78BFA', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <RotateCcw size={13} /> Escrow Refunded
                          </span>
                        ) : order.payments?.some((p: any) => p.status === 'COMPLETED') ? (
                          <span style={{ color: 'var(--accent-cyan)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <ShieldCheck size={14} /> Escrow Locked & Funded
                          </span>
                        ) : (
                          <span style={{ color: 'var(--warning)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={13} /> Awaiting Escrow Deposit
                          </span>
                        )}
                      </div>
                    </div>

                    {isAdmin && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-sub)' }}>
                            Platform Commission ({((order.platformCommissionRate ?? 0.20) * 100).toFixed(0)}%):
                          </span>
                          <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>
                            LKR {order.platformFee.toLocaleString()}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-sub)' }}>Specialist Payout:</span>
                          <span style={{ color: 'var(--primary-300)', fontWeight: 700 }}>
                            LKR {order.workerPayout.toLocaleString()}
                          </span>
                        </div>
                        {order.quotationNotes && (
                          <div style={{ paddingTop: '0.4rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <strong style={{ color: 'var(--text-sub)' }}>Pricing Notes: </strong>
                            {order.quotationNotes}
                          </div>
                        )}

                        {/* Admin Direct Escrow Controls */}
                        {order.payments?.some((p: any) => p.status === 'COMPLETED') && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              onClick={() => setShowEscrowReleaseConfirm(true)}
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                            >
                              <ShieldCheck size={14} />
                              <span>Release Escrow to Specialist</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setShowEscrowRefundConfirm(true)}
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                            >
                              <RotateCcw size={14} />
                              <span>Refund Escrow to Customer</span>
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  /* Admin Editable Pricing Breakdown Panel */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
                    {pricingSuccessMsg && (
                      <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success)', fontSize: '0.8rem' }}>
                        {pricingSuccessMsg}
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '0.2rem', fontWeight: 600 }}>
                          Total Quoted Price (LKR)
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          value={editQuotedPrice}
                          onChange={(e) => {
                            const p = parseFloat(e.target.value) || 0;
                            setEditQuotedPrice(p);
                            const fee = Math.round(p * editCommissionRate);
                            setEditPlatformFee(fee);
                            setEditWorkerPayout(p - fee);
                          }}
                          style={{ width: '100%', fontSize: '0.85rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '0.2rem', fontWeight: 600 }}>
                          Commission Rate ({((editCommissionRate) * 100).toFixed(0)}%)
                        </label>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {[0.10, 0.15, 0.20, 0.25, 0.30].map((r) => (
                            <button
                              key={r}
                              type="button"
                              className={`btn btn-sm ${editCommissionRate === r ? 'btn-primary' : 'btn-secondary'}`}
                              onClick={() => {
                                setEditCommissionRate(r);
                                const fee = Math.round(editQuotedPrice * r);
                                setEditPlatformFee(fee);
                                setEditWorkerPayout(editQuotedPrice - fee);
                              }}
                              style={{ padding: '0.25rem 0.4rem', fontSize: '0.72rem', flex: 1 }}
                            >
                              {(r * 100).toFixed(0)}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '0.2rem', fontWeight: 600 }}>
                          Platform Fee (LKR)
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          value={editPlatformFee}
                          onChange={(e) => {
                            const fee = parseFloat(e.target.value) || 0;
                            setEditPlatformFee(fee);
                            setEditWorkerPayout(editQuotedPrice - fee);
                          }}
                          style={{ width: '100%', fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700 }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '0.2rem', fontWeight: 600 }}>
                          Specialist Net Payout (LKR)
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          value={editWorkerPayout}
                          onChange={(e) => setEditWorkerPayout(parseFloat(e.target.value) || 0)}
                          style={{ width: '100%', fontSize: '0.85rem', color: 'var(--primary-300)', fontWeight: 700 }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '0.2rem', fontWeight: 600 }}>
                        Itemized Breakdown Notes / Terms
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Base Task: LKR 3,000 + Express QC: LKR 1,500"
                        value={editPricingNotes}
                        onChange={(e) => setEditPricingNotes(e.target.value)}
                        style={{ width: '100%', fontSize: '0.825rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '0.2rem', fontWeight: 600 }}>
                        Audit Note for Adjustment <span style={{ color: 'var(--warning)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Reason for pricing adjustment..."
                        value={editPricingReason}
                        onChange={(e) => setEditPricingReason(e.target.value)}
                        style={{ width: '100%', fontSize: '0.825rem' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setIsEditingPricing(false)}
                        disabled={isProcessing}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleSavePricingBreakdown}
                        disabled={isProcessing || !editQuotedPrice || editQuotedPrice <= 0}
                      >
                        <span>{isProcessing ? 'Saving...' : 'Save Pricing Breakdown'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Requirements Display */}
            {Object.keys(parsedRequirements).length > 0 && (
              <div className="glass-card" style={{ padding: '1.25rem', marginTop: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--primary-300)', marginBottom: '0.75rem' }}>
                  Customer Requirement Brief & Form Answers
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

        {/* TAB 2: MESSAGES & ADMIN SUPPORT */}
        {activeTab === 'messages' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '1rem', color: '#FFFFFF' }}>Order Inquiries & Admin Communication</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                  Send messages, clarify requirements, or discuss progress directly with the platform administrator.
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={fetchMessages}>
                <RefreshCw size={13} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Messages Feed */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                minHeight: '260px',
                maxHeight: '380px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                  <MessageSquare size={32} style={{ margin: '0 auto 0.5rem auto', opacity: 0.5 }} />
                  No messages yet. Send a message below to communicate regarding this order.
                </div>
              ) : (
                messages.map((m: any) => {
                  const isMe = m.senderId === user?.id;
                  const isSenderAdmin = m.sender?.role === 'ADMIN';

                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        background: isMe
                          ? 'var(--primary-600)'
                          : isSenderAdmin
                          ? 'rgba(245, 158, 11, 0.15)'
                          : 'var(--bg-surface)',
                        border: isMe
                          ? 'none'
                          : isSenderAdmin
                          ? '1px solid rgba(245, 158, 11, 0.3)'
                          : '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.75rem 1rem',
                        color: '#FFFFFF',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', fontSize: '0.72rem' }}>
                        <span style={{ fontWeight: 700, color: isMe ? '#E0E7FF' : isSenderAdmin ? 'var(--warning)' : 'var(--text-sub)' }}>
                          {isMe ? 'You' : m.sender?.fullName || 'User'}
                        </span>
                        <span style={{ opacity: 0.7 }}>•</span>
                        <span style={{ opacity: 0.7 }}>
                          {isSenderAdmin ? 'Platform Admin' : m.sender?.role || 'Customer'}
                        </span>
                        <span style={{ opacity: 0.5, marginLeft: 'auto' }}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.875rem', lineHeight: 1.4, wordBreak: 'break-word' }}>
                        {m.message}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Send Message Form */}
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder={isCustomer ? "Message the platform administrator about this order..." : "Reply to customer regarding this order..."}
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSendingMessage || !newMessageText.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0 1.25rem' }}
              >
                <Send size={15} />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: FILES VAULT */}
        {activeTab === 'files' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h4 style={{ fontSize: '0.95rem' }}>Order Files Vault</h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                Download deliverables or attach additional reference materials
              </span>
            </div>

            {/* Upload Additional Reference Files (Customer or Admin) */}
            <form
              onSubmit={handleUploadAdditionalFile}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
                <UploadCloud size={20} color="var(--primary-400)" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Upload Additional Reference File</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                    Add guidelines, supplementary data, or reference notes
                  </div>
                </div>
              </div>

              <input
                type="file"
                onChange={(e) => setAdditionalFile(e.target.files ? e.target.files[0] : null)}
                style={{ fontSize: '0.8rem' }}
              />

              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={!additionalFile || isUploadingFile}
              >
                {isUploadingFile ? 'Uploading...' : 'Upload File'}
              </button>
            </form>

            {/* Files List */}
            {(!order.files || order.files.length === 0) ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>No files uploaded yet for this order.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {order.files.map((file: any) => {
                  const isDeliverable = file.fileTag === 'FINAL_DELIVERABLE';

                  return (
                    <div
                      key={file.id}
                      className="glass-card"
                      style={{
                        padding: '0.85rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: isDeliverable ? '1px solid rgba(16, 185, 129, 0.4)' : undefined,
                        background: isDeliverable ? 'rgba(16, 185, 129, 0.05)' : undefined,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FileText size={20} color={isDeliverable ? 'var(--success)' : 'var(--primary-400)'} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                            {file.originalFilename}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                            Tag: <span style={{ color: isDeliverable ? 'var(--success)' : 'var(--accent-cyan)', fontWeight: 600 }}>{file.fileTag}</span> • {(file.fileSizeBytes / 1024).toFixed(0)} KB • {new Date(file.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <a
                        href={api.getDownloadUrl(file.id)}
                        download
                        className={`btn ${isDeliverable ? 'btn-success' : 'btn-secondary'} btn-sm`}
                        style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}
                      >
                        <Download size={14} />
                        <span>Download</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TIMELINE & AUDIT HISTORY */}
        {activeTab === 'history' && (
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Order Status & Audit Timeline</h4>
            <div className="timeline">
              {order.statusHistory?.map((hist: any) => (
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

        {/* Cancellation Modal Dialog */}
        {showCancelModal && (
          <div className="modal-overlay" style={{ zIndex: 1200 }}>
            <div className="modal-content" style={{ maxWidth: '480px', padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', marginBottom: '0.75rem' }}>
                <ShieldAlert size={22} />
                <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>Cancel Service Order</h3>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <strong>Platform Cancellation Policy:</strong>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.35rem', lineHeight: 1.5 }}>
                  <li>Orders in <em>Pending Review</em>, <em>Quotation Sent</em>, or <em>Awaiting Payment</em> are cancelled immediately with zero charge.</li>
                  <li>Orders in active execution are reviewed by operations. Escrow refunds are calculated according to work progress.</li>
                </ul>
              </div>

              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Reason for Cancellation <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea
                className="form-textarea"
                placeholder="Please explain why you need to cancel this order..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ minHeight: '80px', marginBottom: '1.25rem' }}
              />

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowCancelModal(false)}
                  disabled={isProcessing}
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleCancelOrder}
                  disabled={isProcessing || !cancelReason.trim()}
                >
                  {isProcessing ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Escrow Release Modal Dialog */}
        {showEscrowReleaseConfirm && (
          <div className="modal-overlay" style={{ zIndex: 1250 }}>
            <div className="modal-content" style={{ maxWidth: '480px', padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', marginBottom: '0.75rem' }}>
                <ShieldCheck size={24} />
                <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>Authorize Escrow Release</h3>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                You are authorizing the manual disbursement of escrow funds to the assigned specialist. Funds will be directly credited to their wallet balance.
              </p>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-sub)' }}>Order Reference:</span>
                  <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{order.orderNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-sub)' }}>Customer Total Escrow:</span>
                  <span style={{ fontWeight: 700, color: '#FFFFFF' }}>LKR {order.quotedPrice?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-sub)' }}>Platform Revenue:</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>LKR {order.platformFee?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-sub)' }}>Disbursement to Specialist:</span>
                  <span style={{ fontWeight: 800, color: 'var(--success)', fontSize: '1rem' }}>
                    LKR {order.workerPayout?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowEscrowReleaseConfirm(false)}
                  disabled={isEscrowProcessing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={handleAdminReleaseEscrow}
                  disabled={isEscrowProcessing}
                >
                  {isEscrowProcessing ? 'Releasing...' : `Confirm Release (LKR ${order.workerPayout?.toLocaleString()})`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Escrow Refund Modal Dialog */}
        {showEscrowRefundConfirm && (
          <div className="modal-overlay" style={{ zIndex: 1250 }}>
            <div className="modal-content" style={{ maxWidth: '480px', padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', marginBottom: '0.75rem' }}>
                <RotateCcw size={22} />
                <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>Authorize Customer Escrow Refund</h3>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                Refund locked escrow funds back to the customer. This will update the payment record to REFUNDED, cancel active tasks, and notify the client and specialist.
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: '0.25rem', fontWeight: 600 }}>
                  Refund Amount (LKR)
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={escrowRefundAmount}
                  onChange={(e) => setEscrowRefundAmount(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', fontWeight: 700 }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: '0.25rem', fontWeight: 600 }}>
                  Reason for Refund & Audit Log <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <textarea
                  className="form-textarea"
                  value={escrowRefundReason}
                  onChange={(e) => setEscrowRefundReason(e.target.value)}
                  style={{ minHeight: '75px', width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowEscrowRefundConfirm(false)}
                  disabled={isEscrowProcessing}
                >
                  Keep Escrow Locked
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleAdminRefundEscrow}
                  disabled={isEscrowProcessing || !escrowRefundAmount || !escrowRefundReason.trim()}
                >
                  {isEscrowProcessing ? 'Processing Refund...' : `Refund LKR ${escrowRefundAmount?.toLocaleString()}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsModal;
