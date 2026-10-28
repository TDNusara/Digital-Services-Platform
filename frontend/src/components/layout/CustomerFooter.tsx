import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  CreditCard,
  ArrowUp,
  FileText,
  Search,
  Sparkles,
  Phone,
  Mail,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Info,
  Clock,
  Home,
  Receipt,
  Bell,
  User,
  X,
} from 'lucide-react';

interface CustomerFooterProps {
  activeSubTab?: string;
  onSelectSubTab?: (subTab: string) => void;
  onNavigate?: (route: string) => void;
  openNewOrderModal?: (customMode?: boolean, service?: any) => void;
}

interface PolicyModalInfo {
  title: string;
  badge: string;
  badgeColor: string;
  content: string[];
}

export const CustomerFooter: React.FC<CustomerFooterProps> = ({
  activeSubTab,
  onSelectSubTab,
  onNavigate,
  openNewOrderModal,
}) => {
  const [activePolicyModal, setActivePolicyModal] = useState<PolicyModalInfo | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubTabClick = (tabId: string) => {
    if (onSelectSubTab) {
      onSelectSubTab(tabId);
      scrollToTop();
    } else if (onNavigate) {
      if (tabId === 'services') onNavigate('catalog');
      else onNavigate('customer-portal');
      scrollToTop();
    }
  };

  const policyDetails: Record<string, PolicyModalInfo> = {
    escrow: {
      title: 'Escrow Payment Protection Framework',
      badge: '100% ESCROW SECURED',
      badgeColor: 'var(--success)',
      content: [
        'When you place an order on TaskPulse, your payment is held securely in our digital escrow vault powered by PayHere.',
        'Funds are NOT immediately transferred to freelance specialists. The specialist only begins work with the certainty that payment is locked.',
        'Once work is delivered, you and our Quality Control (QC) administrators inspect the deliverable.',
        'Payment is only disbursed to the specialist once you mark the order as completed or accept the deliverable.',
      ],
    },
    qc: {
      title: 'Quality Control (QC) Inspection Guarantee',
      badge: 'VERIFIED QUALITY',
      badgeColor: '#38BDF8',
      content: [
        'Every deliverable submitted by a specialist undergoes multi-stage verification before it is released to you.',
        'Our QC administrators cross-check requirements, guidelines, structural completeness, and formatting standards.',
        'If deliverables do not meet specifications, our administrators return the work for revision immediately at no extra cost to you.',
        'You also retain the right to request revisions if any detail from your original order brief was missed.',
      ],
    },
    integrity: {
      title: 'Academic & Professional Integrity Policy',
      badge: 'ETHICAL STANDARDS',
      badgeColor: 'var(--warning)',
      content: [
        'TaskPulse is dedicated to promoting high ethical and academic integrity standards.',
        'Deliverables provided in educational and research categories are intended as structural models, study guides, reference templates, and research assistance.',
        'Customers are expected to uphold institutional honor codes and utilize delivered materials in compliance with their organization or university policies.',
        'We do not support plagiarism, impersonation on live examinations, or fraudulent submissions.',
      ],
    },
    refund: {
      title: 'Refund & Dispute Resolution Terms',
      badge: 'DISPUTE PROTECTION',
      badgeColor: 'var(--primary-300)',
      content: [
        'If a specialist is unable to complete your order within the agreed deadline, you are entitled to a full escrow refund.',
        'In the event of an unresolvable dispute regarding quality or scope, TaskPulse Administration steps in to mediate impartially.',
        'Refunds are processed back to your original payment method (Credit/Debit Card or Bank Transfer) via PayHere.',
        'Our customer support team is available 24/7 to assist with payment inquiries and dispute mediation.',
      ],
    },
    privacy: {
      title: 'Confidentiality & Data Encryption Protocol',
      badge: '256-BIT ENCRYPTION',
      badgeColor: '#A78BFA',
      content: [
        'Your privacy and file confidentiality are strictly safeguarded.',
        'All uploaded attachments, project specifications, and communications are encrypted in transit and stored in protected cloud storage.',
        'Specialists sign confidentiality covenants and cannot share or publish your materials.',
        'Deliverables become your sole property upon escrow disbursement.',
      ],
    },
  };

  return (
    <footer className="customer-footer">
      {/* Top Gradient Border Accent */}
      <div className="customer-footer-accent" />

      <div className="container" style={{ padding: '3.5rem 1.5rem 2.5rem 1.5rem' }}>
        {/* Main Footer Grid */}
        <div className="customer-footer-grid">
          {/* Brand & Overview Column */}
          <div className="customer-footer-brand-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                }}
              >
                <Sparkles size={20} color="#FFFFFF" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  Task<span style={{ color: 'var(--primary-400)' }}>Pulse</span>
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--primary-300)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    letterSpacing: '0.04em',
                  }}
                >
                  CUSTOMER HUB
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.25rem', maxWidth: '320px' }}>
              Sri Lanka's premier digital services ecosystem. Empowering customers with escrow-backed protection, verified specialists, and rigorous quality control inspection.
            </p>

            {/* Live Status Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontSize: '0.75rem',
                color: 'var(--text-main)',
              }}
            >
              <span className="pulse-indicator" />
              <span style={{ fontWeight: 600, color: 'var(--success)' }}>Systems Operational</span>
              <span style={{ color: 'var(--text-dim)' }}>•</span>
              <span style={{ color: 'var(--text-sub)' }}>PayHere Sandbox</span>
            </div>
          </div>

          {/* Column 1: Customer Navigation */}
          <div className="customer-footer-col">
            <h4 className="customer-footer-title">
              <Home size={15} color="var(--primary-400)" />
              <span>Customer Pages</span>
            </h4>
            <ul className="customer-footer-links">
              <li>
                <button
                  type="button"
                  className={`customer-footer-btn-link ${activeSubTab === 'home' ? 'active' : ''}`}
                  onClick={() => handleSubTabClick('home')}
                >
                  <ChevronRight size={13} className="link-arrow" />
                  <span>Customer Home</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`customer-footer-btn-link ${activeSubTab === 'orders' ? 'active' : ''}`}
                  onClick={() => handleSubTabClick('orders')}
                >
                  <ChevronRight size={13} className="link-arrow" />
                  <span>My Orders & Deliverables</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`customer-footer-btn-link ${activeSubTab === 'services' ? 'active' : ''}`}
                  onClick={() => handleSubTabClick('services')}
                >
                  <ChevronRight size={13} className="link-arrow" />
                  <span>Browse Service Catalog</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`customer-footer-btn-link ${activeSubTab === 'transactions' ? 'active' : ''}`}
                  onClick={() => handleSubTabClick('transactions')}
                >
                  <ChevronRight size={13} className="link-arrow" />
                  <span>Payment History & Invoices</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`customer-footer-btn-link ${activeSubTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => handleSubTabClick('notifications')}
                >
                  <ChevronRight size={13} className="link-arrow" />
                  <span>Order Alerts & Updates</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`customer-footer-btn-link ${activeSubTab === 'profile' ? 'active' : ''}`}
                  onClick={() => handleSubTabClick('profile')}
                >
                  <ChevronRight size={13} className="link-arrow" />
                  <span>Account Settings & Security</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Order & Actions */}
          <div className="customer-footer-col">
            <h4 className="customer-footer-title">
              <Sparkles size={15} color="var(--primary-400)" />
              <span>Orders & Requests</span>
            </h4>
            <ul className="customer-footer-links">
              <li>
                <button
                  type="button"
                  className="customer-footer-btn-link"
                  onClick={() => {
                    if (openNewOrderModal) openNewOrderModal(false, null);
                    else handleSubTabClick('services');
                  }}
                >
                  <ChevronRight size={13} className="link-arrow" />
                  <span>New Service Order</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="customer-footer-btn-link"
                  onClick={() => {
                    if (openNewOrderModal) openNewOrderModal(true, null);
                    else handleSubTabClick('services');
                  }}
                >
                  <ChevronRight size={13} className="link-arrow" />
                  <span>Request Custom Quote</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="customer-footer-btn-link"
                  onClick={() => handleSubTabClick('services')}
                >
                  <ChevronRight size={13} className="link-arrow" />
                  <span>Fixed-Price Catalog</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="customer-footer-btn-link"
                  onClick={() => setActivePolicyModal(policyDetails.qc)}
                >
                  <ChevronRight size={13} className="link-arrow" />
                  <span>QC Review Standards</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="customer-footer-btn-link"
                  onClick={() => handleSubTabClick('orders')}
                >
                  <ChevronRight size={13} className="link-arrow" />
                  <span>Download Finished Files</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Policies */}
          <div className="customer-footer-col">
            <h4 className="customer-footer-title">
              <ShieldCheck size={15} color="var(--success)" />
              <span>Trust & Protection</span>
            </h4>
            <ul className="customer-footer-links">
              <li>
                <button
                  type="button"
                  className="customer-footer-btn-link"
                  onClick={() => setActivePolicyModal(policyDetails.escrow)}
                >
                  <ChevronRight size={13} className="link-arrow" />
                  <span>Escrow Protection Framework</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="customer-footer-btn-link"
                  onClick={() => setActivePolicyModal(policyDetails.refund)}
                >
                  <ChevronRight size={13} className="link-arrow" />
                  <span>Refund & Dispute Terms</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="customer-footer-btn-link"
                  onClick={() => setActivePolicyModal(policyDetails.integrity)}
                >
                  <ChevronRight size={13} className="link-arrow" />
                  <span>Academic Integrity Policy</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="customer-footer-btn-link"
                  onClick={() => setActivePolicyModal(policyDetails.privacy)}
                >
                  <ChevronRight size={13} className="link-arrow" />
                  <span>Confidentiality & Privacy</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="customer-footer-btn-link"
                  onClick={() => setActivePolicyModal(policyDetails.qc)}
                >
                  <ChevronRight size={13} className="link-arrow" />
                  <span>Deliverable Acceptance Guide</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Customer Support & Hotline */}
          <div className="customer-footer-col">
            <h4 className="customer-footer-title">
              <HelpCircle size={15} color="var(--primary-400)" />
              <span>Customer Support</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div
                style={{
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Phone size={14} color="var(--primary-300)" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600 }}>Helpline (Mon - Sun)</span>
                </div>
                <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.02em' }}>
                  +94 11 234 5678
                </div>
              </div>

              <div
                style={{
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Mail size={14} color="var(--primary-300)" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600 }}>Support Email</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-300)' }}>
                  support@taskpulse.lk
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Clock size={13} color="var(--success)" />
                <span>24/7 Admin Ticket Response</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges Strip */}
        <div
          style={{
            marginTop: '2.5rem',
            paddingTop: '2rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          {/* Trust Guarantees */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={16} color="var(--success)" />
              <span>Escrow Protected Payments</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={16} color="#38BDF8" />
              <span>Quality Control Verified</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Lock size={15} color="var(--primary-300)" />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <CreditCard size={15} color="#FBBF24" />
              <span>PayHere Sandbox Integration</span>
            </div>
          </div>

          {/* Back to Top Button */}
          <button
            type="button"
            className="back-to-top-btn"
            onClick={scrollToTop}
            title="Scroll to top of customer page"
          >
            <span>Back to top</span>
            <ArrowUp size={14} />
          </button>
        </div>

        {/* Bottom Legal / Copyright Row */}
        <div
          style={{
            marginTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.78rem',
            color: 'var(--text-sub)',
          }}
        >
          <div>
            © {new Date().getFullYear()} TaskPulse Digital Services Platform. All rights reserved.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setActivePolicyModal(policyDetails.integrity)}
              style={{ background: 'none', border: 'none', color: 'var(--text-sub)', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
            >
              Academic Policy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActivePolicyModal(policyDetails.escrow)}
              style={{ background: 'none', border: 'none', color: 'var(--text-sub)', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
            >
              Escrow Terms
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActivePolicyModal(policyDetails.refund)}
              style={{ background: 'none', border: 'none', color: 'var(--text-sub)', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
            >
              Refund Guarantee
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActivePolicyModal(policyDetails.privacy)}
              style={{ background: 'none', border: 'none', color: 'var(--text-sub)', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
            >
              Privacy & Confidentiality
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Policy Information Modal */}
      {activePolicyModal && (
        <div
          className="modal-overlay"
          onClick={() => setActivePolicyModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="glass-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '560px',
              width: '100%',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-card)',
              background: 'linear-gradient(145deg, rgba(19, 27, 46, 0.98), rgba(11, 15, 25, 0.98))',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              animation: 'modalFadeIn 0.2s ease-out',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: activePolicyModal.badgeColor,
                    border: `1px solid ${activePolicyModal.badgeColor}`,
                    display: 'inline-block',
                    marginBottom: '0.5rem',
                  }}
                >
                  {activePolicyModal.badge}
                </span>
                <h3 style={{ fontSize: '1.3rem', color: '#FFFFFF', fontWeight: 800 }}>
                  {activePolicyModal.title}
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActivePolicyModal(null)}
                style={{ padding: '0.35rem', borderRadius: '50%' }}
                aria-label="Close policy modal"
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }}>
              {activePolicyModal.content.map((point, index) => (
                <div key={index} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--primary-300)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '0.15rem',
                    }}
                  >
                    {index + 1}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.55, margin: 0 }}>
                    {point}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setActivePolicyModal(null)}
                style={{ minWidth: '120px' }}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default CustomerFooter;
