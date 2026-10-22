import React, { useState } from 'react';
import {
  Briefcase,
  Clock,
  DollarSign,
  Star,
  CheckCircle2,
  UploadCloud,
  FileText,
  AlertCircle,
  Eye,
  Send,
  X,
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface WorkerWorkspaceProps {
  orders: any[];
  onOpenOrderDetails: (order: any) => void;
  onRefresh: () => void;
}

export const WorkerWorkspace: React.FC<WorkerWorkspaceProps> = ({
  orders,
  onOpenOrderDetails,
  onRefresh,
}) => {
  const { user } = useAuth();
  const [selectedTaskForUpload, setSelectedTaskForUpload] = useState<any | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const profile = user?.workerProfile;
  const wallet = profile?.wallet;

  // Filter tasks assigned to worker
  const myAssignedOrders = orders;

  const pendingOffers = myAssignedOrders.filter(
    (o) => o.status === 'AWAITING_WORKER_ACCEPTANCE'
  );
  const activeTasks = myAssignedOrders.filter(
    (o) => ['IN_PROGRESS', 'REVISION_REQUESTED'].includes(o.status)
  );
  const underQCTasks = myAssignedOrders.filter(
    (o) => o.status === 'SUBMITTED_FOR_QC'
  );
  const completedTasks = myAssignedOrders.filter(
    (o) => ['READY_FOR_CUSTOMER', 'COMPLETED'].includes(o.status)
  );

  const handleAccept = async (orderId: string) => {
    try {
      await api.post(`/assignments/${orderId}/accept`);
      onRefresh();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDecline = async (orderId: string) => {
    const reason = prompt('Please enter a reason for declining this assignment:');
    if (!reason) return;
    try {
      await api.post(`/assignments/${orderId}/decline`, { declineReason: reason });
      onRefresh();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForUpload || uploadFiles.length === 0) {
      alert('Please select at least one deliverable file to upload.');
      return;
    }

    setIsSubmitting(true);
    setActionMsg('');

    try {
      const formData = new FormData();
      formData.append('submissionNotes', submissionNotes);
      uploadFiles.forEach((f) => formData.append('files', f));

      await api.post(`/assignments/${selectedTaskForUpload.id}/submit-work`, formData);
      setSelectedTaskForUpload(null);
      setUploadFiles([]);
      setSubmissionNotes('');
      onRefresh();
    } catch (err: any) {
      setActionMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* Worker Profile Header */}
      <div
        className="glass-card"
        style={{
          padding: '1.75rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '4rem',
              height: '4rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#FFFFFF',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            {user?.fullName.charAt(0)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>{user?.fullName}</h2>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--success-bg)',
                  color: 'var(--success)',
                  border: '1px solid var(--success-border)',
                  padding: '0.15rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {profile?.verificationStatus || 'APPROVED'} SPECIALIST
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', marginTop: '0.2rem' }}>
              {profile?.headline || 'Certified Document Specialist'} • {profile?.experienceYears || 5}+ Years Experience
            </p>
          </div>
        </div>

        {/* Rating and Completed Counter */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#FBBF24', justifyContent: 'flex-end' }}>
              <Star size={18} fill="#FBBF24" />
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
                {profile?.ratingAvg || 4.9}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
              {profile?.ratingCount || 28} Verified Reviews
            </div>
          </div>

          <div style={{ height: '2.5rem', width: '1px', backgroundColor: 'var(--border-subtle)' }} />

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
              {profile?.totalCompletedJobs || 32}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Completed Jobs</div>
          </div>
        </div>
      </div>

      {/* Wallet Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '0.4rem' }}>
            Available for Payout
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>
            LKR {(wallet?.currentBalance || 12500).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>
            Processed directly to local bank account
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '0.4rem' }}>
            Pending in Escrow
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)' }}>
            LKR {(wallet?.pendingClearance || 4000).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>
            Held safely until client approves deliverable
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '0.4rem' }}>
            Lifetime Withdrawn
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#C084FC' }}>
            LKR {(wallet?.totalWithdrawn || 45000).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>
            Total processed payouts
          </div>
        </div>
      </div>

      {/* 1. New Assignment Offers Queue */}
      {pendingOffers.length > 0 && (
        <div
          className="glass-card"
          style={{
            padding: '1.5rem',
            marginBottom: '2rem',
            borderColor: 'rgba(245, 158, 11, 0.4)',
            backgroundColor: 'rgba(245, 158, 11, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertCircle size={20} color="var(--warning)" />
            <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF' }}>
              Pending Assignment Offers ({pendingOffers.length})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingOffers.map((ord) => (
              <div
                key={ord.id}
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--primary-300)' }}>
                    {ord.orderNumber}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>
                    {ord.title}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>
                    Turnaround: {new Date(ord.targetDeadline).toLocaleString()} • Payout: <strong style={{ color: 'var(--success)' }}>LKR {ord.workerPayout.toLocaleString()}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => handleAccept(ord.id)}>
                    <CheckCircle2 size={16} />
                    <span>Accept Job</span>
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleDecline(ord.id)}>
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Active Tasks Table */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>
          Active Tasks In Progress ({activeTasks.length})
        </h3>

        {activeTasks.length === 0 ? (
          <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>
            No tasks currently in progress. New assignments will appear when offered.
          </p>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Task Title</th>
                  <th>Deadline</th>
                  <th>Your Payout</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeTasks.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-300)' }}>
                      {t.orderNumber}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                        {t.category?.name}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(t.targetDeadline).toLocaleDateString()}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                      LKR {t.workerPayout.toLocaleString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelectedTaskForUpload(t)}
                        >
                          <UploadCloud size={14} />
                          <span>Submit Deliverable</span>
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onOpenOrderDetails(t)}
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inline Deliverable Submission Modal */}
      {selectedTaskForUpload && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem' }}>
                Submit Work for QC: {selectedTaskForUpload.orderNumber}
              </h3>
              <button className="modal-close" onClick={() => setSelectedTaskForUpload(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitDeliverable}>
              <div className="form-group">
                <label className="form-label">Attach Deliverable Files</label>
                <div
                  style={{
                    border: '2px dashed var(--border-card)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    textAlign: 'center',
                    backgroundColor: 'rgba(15, 23, 42, 0.4)',
                    cursor: 'pointer',
                  }}
                  onClick={() => document.getElementById('worker-deliverable-input')?.click()}
                >
                  <UploadCloud size={32} color="var(--primary-400)" style={{ margin: '0 auto 0.5rem auto' }} />
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    Upload Final Deliverable (.docx, .xlsx, .pptx, .pdf, .zip)
                  </div>
                  <input
                    id="worker-deliverable-input"
                    type="file"
                    multiple
                    onChange={(e) => e.target.files && setUploadFiles(Array.from(e.target.files))}
                    style={{ display: 'none' }}
                  />
                </div>

                {uploadFiles.length > 0 && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {uploadFiles.map((f, i) => (
                      <div key={i} style={{ fontSize: '0.85rem', color: 'var(--primary-300)' }}>
                        ✓ {f.name} ({(f.size / 1024).toFixed(0)} KB)
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Notes for Admin Quality Check</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe the completion steps, formulas formatted, or guidelines followed..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedTaskForUpload(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Uploading Deliverables...' : 'Submit to Admin QC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
