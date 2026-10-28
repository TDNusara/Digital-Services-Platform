import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  Table,
  Presentation,
  Briefcase,
  Code,
  Search,
  BookOpen,
  Palette,
  FileCheck,
  Layers,
  TrendingUp,
  Star,
  Users,
  Award,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Lock,
  Download,
  RefreshCw,
  CreditCard,
} from 'lucide-react';
import { CustomerFooter } from '../../components/layout/CustomerFooter';

interface GuestHomePageProps {
  categories: any[];
  services: any[];
  onSelectCategory: (slug: string) => void;
  openNewOrderModal: (customMode?: boolean, service?: any) => void;
  onNavigate: (tab: string) => void;
}

export const GuestHomePage: React.FC<GuestHomePageProps> = ({
  categories = [],
  services = [],
  onSelectCategory,
  openNewOrderModal,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen size={22} color="#818CF8" />;
      case 'FileText': return <FileText size={22} color="#38BDF8" />;
      case 'Table': return <Table size={22} color="#34D399" />;
      case 'Presentation': return <Presentation size={22} color="#FBBF24" />;
      case 'Briefcase': return <Briefcase size={22} color="#F472B6" />;
      case 'Search': return <Search size={22} color="#A78BFA" />;
      case 'Code': return <Code size={22} color="#2DD4BF" />;
      case 'Palette': return <Palette size={22} color="#FB923C" />;
      case 'FileCheck': return <FileCheck size={22} color="#60A5FA" />;
      case 'Layers': return <Layers size={22} color="#C084FC" />;
      case 'TrendingUp': return <TrendingUp size={22} color="#4ADE80" />;
      default: return <Sparkles size={22} color="#818CF8" />;
    }
  };

  // Filtered Services for Guest Exploration
  const filteredServices = services.filter((srv) => {
    if (selectedCategory !== 'ALL' && srv.categoryId !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = srv.title?.toLowerCase().includes(q);
      const summaryMatch = srv.shortSummary?.toLowerCase().includes(q);
      const descMatch = srv.description?.toLowerCase().includes(q);
      if (!titleMatch && !summaryMatch && !descMatch) return false;
    }
    return true;
  });

  const faqs = [
    {
      q: 'How does TaskPulse protect my payment?',
      a: 'All payments are held securely in platform escrow. The specialist only receives payment after the internal quality control review passes and you personally approve the completed deliverable.',
    },
    {
      q: 'Can I request revisions if changes are needed?',
      a: 'Yes! Every customer order comes with 2 free revision cycles within 7 days of delivery according to our service policy. You can provide direct feedback in your customer portal.',
    },
    {
      q: 'How does the Admin Quality Control (QC) gate work?',
      a: 'Unlike open freelance platforms where workers deliver files directly without review, every deliverable on TaskPulse is reviewed by our operations administrators to ensure accuracy, formatting standards, and completeness.',
    },
    {
      q: 'Can I submit custom digital requests not in the catalog?',
      a: 'Yes, absolutely. Use the "Custom Service Request" option to provide your unique requirements, target budget, and deadline. Our admin team will inspect the request and issue a clear quotation.',
    },
    {
      q: 'What payment methods are supported?',
      a: 'We accept local and international Visa, MasterCard, and online banking through PayHere with transparent LKR pricing.',
    },
  ];

  return (
    <div>
      {/* Top Value Banner */}
      <div
        style={{
          background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2), rgba(56, 189, 248, 0.2))',
          borderBottom: '1px solid rgba(99, 102, 241, 0.3)',
          padding: '0.5rem 1rem',
          textAlign: 'center',
          fontSize: '0.825rem',
          color: '#E0E7FF',
          fontWeight: 600,
        }}
      >
        ✨ 100% Escrow Protection • Admin Quality Control Gate • 2 Free Revisions within 7 Days • Sign In or Register to Get Services
      </div>

      {/* Hero Section */}
      <section style={{ padding: '4.5rem 0 3.5rem 0', position: 'relative' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          {/* Trust Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1.1rem',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              color: 'var(--primary-300)',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
            }}
          >
            <ShieldCheck size={16} color="var(--primary-400)" />
            <span>The Managed Digital Services Platform — Quality Checked on Every Job</span>
          </div>

          <h1
            style={{
              fontSize: '3.4rem',
              fontWeight: 800,
              lineHeight: 1.15,
              maxWidth: '920px',
              margin: '0 auto 1.25rem auto',
              letterSpacing: '-0.02em',
            }}
          >
            Professional Digital, Document & Creative Services{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #818CF8 0%, #C084FC 50%, #38BDF8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Delivered Flawlessly.
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              maxWidth: '720px',
              margin: '0 auto 2.25rem auto',
              color: 'var(--text-muted)',
              lineHeight: 1.65,
            }}
          >
            Get expert assistance with document drafting, advanced Excel modeling, high-stakes investor pitch decks, ATS resumes, technical proofreading, and bespoke digital tasks. Every order is reviewed by an Administrator before release.
          </p>

          {/* Search Bar in Hero */}
          <div
            style={{
              maxWidth: '620px',
              margin: '0 auto 2.5rem auto',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-full)',
                padding: '0.4rem 0.5rem 0.4rem 1.25rem',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <Search size={19} color="var(--primary-400)" style={{ marginRight: '0.65rem' }} />
              <input
                type="text"
                placeholder="Search services (e.g. Financial Model, ATS Resume, Proofreading...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  const el = document.getElementById('available-services-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ borderRadius: 'var(--radius-full)', padding: '0.55rem 1.25rem' }}
              >
                <span>Find Services</span>
              </button>
            </div>
          </div>

          {/* CTA Cluster */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '3.5rem',
            }}
          >
            <button className="btn btn-primary btn-lg" onClick={() => openNewOrderModal(false, null)}>
              <Sparkles size={18} />
              <span>Order a Service</span>
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => openNewOrderModal(true, null)}>
              <span>✨ Custom Service Request</span>
            </button>
            <button
              className="btn btn-outline btn-lg"
              onClick={() => onNavigate('register-customer')}
              style={{ borderColor: 'rgba(99, 102, 241, 0.5)', color: 'var(--primary-300)' }}
            >
              <Users size={18} />
              <span>Register as Customer</span>
            </button>
            <button
              className="btn btn-outline btn-lg"
              onClick={() => onNavigate('login')}
            >
              <span>Sign In</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Trust Metric Pillars */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              maxWidth: '1050px',
              margin: '0 auto',
            }}
          >
            <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                <CheckCircle2 size={20} color="var(--success)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  Admin Quality Gate
                </span>
              </div>
              <p style={{ fontSize: '0.825rem', margin: 0, color: 'var(--text-muted)' }}>
                Deliverables are inspected and verified for accuracy before customer delivery.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                <ShieldCheck size={20} color="var(--accent-cyan)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  100% Escrow Protection
                </span>
              </div>
              <p style={{ fontSize: '0.825rem', margin: 0, color: 'var(--text-muted)' }}>
                Funds are held securely and released only when you approve the final files.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                <RefreshCw size={20} color="var(--warning)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  Free Revisions Policy
                </span>
              </div>
              <p style={{ fontSize: '0.825rem', margin: 0, color: 'var(--text-muted)' }}>
                2 free revision rounds within 7 days for any required adjustments.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                <Award size={20} color="#C084FC" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  Vetted Specialists
                </span>
              </div>
              <p style={{ fontSize: '0.825rem', margin: 0, color: 'var(--text-muted)' }}>
                Verified specialists matched to tasks based on subject-matter expertise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Available Services Section (Common Details) */}
      <section id="available-services-section" style={{ padding: '4.5rem 0', backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-300)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                <Sparkles size={14} />
                <span>EXPLORE DIGITAL SERVICES</span>
              </div>
              <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Available Services & Upfront Pricing</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px' }}>
                Browse our catalog of professional services with transparent pricing. Services are provided to registered customers — sign in or register to get any service.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => openNewOrderModal(true, null)}
              >
                <span>Need Something Custom?</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`filter-pill ${selectedCategory === 'ALL' ? 'active' : ''}`}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.825rem',
                fontWeight: 600,
                border: '1px solid var(--border-medium)',
                background: selectedCategory === 'ALL' ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.04)',
                color: selectedCategory === 'ALL' ? '#FFFFFF' : 'var(--text-sub)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              All Categories ({services.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  border: '1px solid var(--border-medium)',
                  background: selectedCategory === cat.id ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.04)',
                  color: selectedCategory === cat.id ? '#FFFFFF' : 'var(--text-sub)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat.name} ({cat._count?.services || 0})
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {filteredServices.slice(0, 8).map((srv) => (
              <div
                key={srv.id}
                className="glass-card interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.5rem',
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
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {srv.category?.name || 'Digital Service'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={13} />
                      <span>~{srv.turnaroundHours}h</span>
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#FFFFFF' }}>{srv.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {srv.shortSummary || srv.description?.slice(0, 110) + '...'}
                  </p>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.85rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>Pricing:</span>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: srv.pricingType === 'FIXED' ? 'var(--success)' : 'var(--primary-300)' }}>
                      {srv.pricingType === 'FIXED' && srv.basePrice > 0 ? `LKR ${srv.basePrice.toLocaleString()}` : 'Custom Quotation'}
                    </span>
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => openNewOrderModal(false, srv)}
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', padding: '0.6rem' }}
                  >
                    <span>Get Service</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4-Step Stepper: How TaskPulse Works */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>
              How TaskPulse Works
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)' }}>
              From initial request to verified delivery in 4 transparent steps.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '1.75rem',
            }}
          >
            <div className="glass-card">
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-400)', marginBottom: '0.75rem' }}>
                01
              </div>
              <h4 style={{ marginBottom: '0.5rem', color: '#FFFFFF' }}>Submit Request & Files</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Select a service or specify custom instructions, budget, and deadline. Upload reference documents.
              </p>
            </div>

            <div className="glass-card">
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '0.75rem' }}>
                02
              </div>
              <h4 style={{ marginBottom: '0.5rem', color: '#FFFFFF' }}>Quotation & Escrow</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Admin reviews your request and issues a fixed price. Pay securely into escrow; funds are held until your approval.
              </p>
            </div>

            <div className="glass-card">
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#C084FC', marginBottom: '0.75rem' }}>
                03
              </div>
              <h4 style={{ marginBottom: '0.5rem', color: '#FFFFFF' }}>Specialist Execution & Admin QC</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Assigned specialist drafts the work. Admin quality control inspects files against specifications.
              </p>
            </div>

            <div className="glass-card">
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', marginBottom: '0.75rem' }}>
                04
              </div>
              <h4 style={{ marginBottom: '0.5rem', color: '#FFFFFF' }}>Download & 2 Free Revisions</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Download deliverables instantly. If adjustments are needed, request up to 2 free revisions within 7 days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Managed Agency vs Open Freelance */}
      <section style={{ padding: '4.5rem 0', backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>
              Why Clients Choose TaskPulse
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)' }}>
              How our managed quality-gate model outperforms open freelance platforms.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
              maxWidth: '1000px',
              margin: '0 auto',
            }}
          >
            <div
              className="glass-card"
              style={{
                borderColor: 'rgba(239, 68, 68, 0.25)',
                background: 'rgba(239, 68, 68, 0.03)',
              }}
            >
              <h3 style={{ color: '#F87171', marginBottom: '1rem', fontSize: '1.25rem' }}>
                ⚠️ Traditional Open Freelance Sites
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: 0 }}>
                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: '#EF4444' }}>✕</span> Unmonitored direct negotiations and high risk of ghosting.
                </li>
                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: '#EF4444' }}>✕</span> Zero quality check before delivery; high defect and error rate.
                </li>
                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: '#EF4444' }}>✕</span> Cumbersome refund arbitration when deliverables are poor.
                </li>
                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: '#EF4444' }}>✕</span> Currency conversion markups and non-local payment barriers.
                </li>
              </ul>
            </div>

            <div
              className="glass-card"
              style={{
                borderColor: 'rgba(99, 102, 241, 0.5)',
                background: 'rgba(99, 102, 241, 0.05)',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <h3 style={{ color: '#818CF8', marginBottom: '1rem', fontSize: '1.25rem' }}>
                ✨ The TaskPulse Managed Guarantee
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: 0 }}>
                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Administrator assigns verified, credentialed specialists.
                </li>
                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> Quality Assurance (QC) gate inspects files prior to release.
                </li>
                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> 100% Escrow safe: payment released upon customer signoff.
                </li>
                <li style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> PayHere integration supporting local LKR & cards seamlessly.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Reviews Section */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>
              Verified Client Testimonials
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)' }}>
              See what professionals and business owners say about TaskPulse.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <div className="glass-card">
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem', color: '#FBBF24' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#FBBF24" />
                ))}
              </div>
              <p style={{ fontSize: '0.925rem', fontStyle: 'italic', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
                "TaskPulse transformed my raw financial data into an investor-grade Excel dashboard in under 36 hours. The quality check made sure every formula was accurate."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '2.2rem',
                    height: '2.2rem',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  N
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Niroshan Fernando</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>SME Managing Director</div>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem', color: '#FBBF24' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#FBBF24" />
                ))}
              </div>
              <p style={{ fontSize: '0.925rem', fontStyle: 'italic', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
                "Got my executive CV restructured with ATS keywords. Landed 3 interviews within a fortnight! Outstanding professionalism and smooth payment with PayHere."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '2.2rem',
                    height: '2.2rem',
                    borderRadius: '50%',
                    backgroundColor: '#8B5CF6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  A
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Anushka De Silva</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Senior Business Analyst</div>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem', color: '#FBBF24' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#FBBF24" />
                ))}
              </div>
              <p style={{ fontSize: '0.925rem', fontStyle: 'italic', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
                "Our 40-page technical proposal needed strict corporate styling and auto-updating tables. Delivered cleanly ahead of schedule."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '2.2rem',
                    height: '2.2rem',
                    borderRadius: '50%',
                    backgroundColor: '#06B6D4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  K
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Kavinda Rajapaksha</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Tech Lead</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '4.5rem 0', backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>Frequently Asked Questions</h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
              Got questions about ordering, escrow security, or our quality control process?
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="glass-card"
                  style={{ padding: '1.25rem 1.5rem', cursor: 'pointer' }}
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1.05rem', color: '#FFFFFF', margin: 0 }}>{faq.q}</h4>
                    {isOpen ? <ChevronUp size={18} color="var(--primary-400)" /> : <ChevronDown size={18} color="var(--text-sub)" />}
                  </div>
                  {isOpen && (
                    <p style={{ marginTop: '0.85rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0.85rem 0 0 0' }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Conversion Banner */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div
            className="glass-card"
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
              borderColor: 'rgba(99, 102, 241, 0.4)',
            }}
          >
            <h2 style={{ fontSize: '2.4rem', marginBottom: '1rem', color: '#FFFFFF' }}>
              Ready to Get Your Digital Tasks Done Right?
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
              Join corporate professionals, researchers, and SME business owners who trust TaskPulse for verified quality and peace of mind.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => onNavigate('register-customer')}
              >
                <span>Register as Customer</span>
                <ArrowRight size={18} />
              </button>
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => onNavigate('login')}
              >
                <span>Sign In to Existing Account</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Footer */}
      <CustomerFooter
        onNavigate={onNavigate}
        openNewOrderModal={(customMode, service) => openNewOrderModal(Boolean(customMode), service || null)}
      />
    </div>
  );
};

export default GuestHomePage;
