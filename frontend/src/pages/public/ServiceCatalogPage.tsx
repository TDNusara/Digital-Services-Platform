import React, { useState } from 'react';
import {
  Search,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle,
  FileCheck,
  Tag,
  CreditCard,
  FileText,
  HelpCircle,
  Briefcase,
  GraduationCap,
  Building2,
  Users,
  UserCheck,
} from 'lucide-react';

interface ServiceCatalogPageProps {
  categories: any[];
  services: any[];
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  onSelectServiceToOrder: (service: any) => void;
  onRequestCustomService: () => void;
}

export const ServiceCatalogPage: React.FC<ServiceCatalogPageProps> = ({
  categories,
  services,
  selectedCategory,
  onSelectCategory,
  onSelectServiceToOrder,
  onRequestCustomService,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAudience, setSelectedAudience] = useState<string>('All');
  const [selectedPricingFilter, setSelectedPricingFilter] = useState<'ALL' | 'FIXED' | 'CUSTOM_QUOTE'>('ALL');

  const customerAudiences = [
    { id: 'All', label: 'All Customers', icon: Users },
    { id: 'Students', label: 'Students', icon: GraduationCap },
    { id: 'Job Seekers', label: 'Job Seekers', icon: Briefcase },
    { id: 'Employees', label: 'Employees', icon: UserCheck },
    { id: 'Businesses', label: 'Businesses', icon: Building2 },
    { id: 'General Customers', label: 'General Customers', icon: FileText },
  ];

  const filteredServices = services.filter((s) => {
    const matchesCat = !selectedCategory || s.category?.slug === selectedCategory;
    const matchesAudience = selectedAudience === 'All' || s.targetAudience === selectedAudience;
    const matchesPricing =
      selectedPricingFilter === 'ALL' ||
      (selectedPricingFilter === 'FIXED' && s.pricingType === 'FIXED') ||
      (selectedPricingFilter === 'CUSTOM_QUOTE' && s.pricingType === 'CUSTOM_QUOTE');
    const matchesSearch =
      !searchTerm ||
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.shortSummary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesAudience && matchesPricing && matchesSearch;
  });

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--primary-400)',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              Verified Specialist Network
            </span>
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Digital Services Catalog
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '650px' }}>
            Choose from fixed-price instant services or submit tailored requirements for an itemized administrator quotation.
          </p>
        </div>

        {/* Custom Service Request CTA */}
        <button
          className="btn btn-outline"
          onClick={onRequestCustomService}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.8rem 1.25rem',
            borderColor: 'var(--primary-500)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
          }}
        >
          <Sparkles size={16} color="var(--primary-300)" />
          <span style={{ fontWeight: 600 }}>Request Another / Custom Service</span>
        </button>
      </div>

      {/* Target Customer Audience Segment Selector */}
      <div
        className="glass-card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Filter by Target Customer:
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {customerAudiences.map((aud) => {
            const Icon = aud.icon;
            const isSelected = selectedAudience === aud.id;
            const count = aud.id === 'All' ? services.length : services.filter((s) => s.targetAudience === aud.id).length;
            return (
              <button
                key={aud.id}
                onClick={() => setSelectedAudience(aud.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--primary-500)' : '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Icon size={14} color={isSelected ? 'var(--primary-400)' : 'var(--text-sub)'} />
                <span>{aud.label}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.1rem 0.35rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isSelected ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.08)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-sub)',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <Search
              size={18}
              color="var(--text-sub)"
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search services (e.g. Assignments, CV Revamp, Excel Sheets, Data Entry, Reports)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>

          {/* Pricing Model Filter */}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginRight: '0.25rem' }}>Pricing:</span>
            <button
              className={`btn btn-sm ${selectedPricingFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedPricingFilter('ALL')}
            >
              All Types
            </button>
            <button
              className={`btn btn-sm ${selectedPricingFilter === 'FIXED' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedPricingFilter('FIXED')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <CreditCard size={13} />
              <span>Fixed Price</span>
            </button>
            <button
              className={`btn btn-sm ${selectedPricingFilter === 'CUSTOM_QUOTE' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedPricingFilter('CUSTOM_QUOTE')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <FileText size={13} />
              <span>Custom Quote</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-sub)', marginRight: '0.25rem' }}>
            Category:
          </span>
          <button
            onClick={() => onSelectCategory(null)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: selectedCategory === null ? '1px solid var(--primary-500)' : '1px solid var(--border-subtle)',
              backgroundColor: selectedCategory === null ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: selectedCategory === null ? 'var(--primary-300)' : 'var(--text-muted)',
              transition: 'all var(--transition-fast)',
            }}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: selectedCategory === cat.slug ? '1px solid var(--primary-500)' : '1px solid var(--border-subtle)',
                backgroundColor: selectedCategory === cat.slug ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: selectedCategory === cat.slug ? 'var(--primary-300)' : 'var(--text-muted)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <FileCheck size={48} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
          <h3>No services found matching your filters</h3>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
            Can't find what you need? You can request a custom service directly from our administrator!
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchTerm('');
                setSelectedAudience('All');
                setSelectedPricingFilter('ALL');
                onSelectCategory(null);
              }}
            >
              Reset Filters
            </button>
            <button
              className="btn btn-primary"
              onClick={onRequestCustomService}
            >
              <Sparkles size={16} />
              <span>Request Custom Service</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredServices.map((service) => {
            const isFixed = service.pricingType === 'FIXED';
            let fieldCount = 0;
            try {
              const schema = JSON.parse(service.requirementSchema);
              fieldCount = Array.isArray(schema) ? schema.length : 0;
            } catch (e) {
              fieldCount = 0;
            }

            return (
              <div
                key={service.id}
                className="glass-card interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.75rem',
                  borderTop: isFixed ? '3px solid var(--success)' : '3px solid var(--primary-500)',
                }}
              >
                <div>
                  {/* Top Badges */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      {service.targetAudience && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            color: '#FFFFFF',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          {service.targetAudience}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: 'var(--text-sub)',
                        }}
                      >
                        {service.category?.name}
                      </span>
                    </div>

                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.78rem',
                        color: 'var(--text-sub)',
                      }}
                    >
                      <Clock size={13} />
                      <span>{service.turnaroundHours}h</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.6rem', color: 'var(--text-main)', lineHeight: 1.35 }}>
                    {service.title}
                  </h3>

                  {/* Short Summary */}
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                    {service.shortSummary}
                  </p>

                  {/* Pricing Type Info Pill */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    {isFixed ? (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontSize: '0.76rem',
                          color: 'var(--success)',
                          backgroundColor: 'var(--success-bg)',
                          border: '1px solid var(--success-border)',
                          padding: '0.25rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 600,
                        }}
                      >
                        <CheckCircle size={13} />
                        <span>Fixed Price — Immediate Payment Available</span>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontSize: '0.76rem',
                          color: 'var(--primary-300)',
                          backgroundColor: 'rgba(99, 102, 241, 0.12)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          padding: '0.25rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 600,
                        }}
                      >
                        <FileText size={13} />
                        <span>Quoted on Request — Price Determined by Admin</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer / Pricing & CTA */}
                <div
                  style={{
                    paddingTop: '1.25rem',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                      {isFixed ? 'Fixed Service Fee' : 'Pricing Model'}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                      {isFixed ? (
                        <span style={{ color: 'var(--success)' }}>LKR {service.basePrice.toLocaleString()}</span>
                      ) : (
                        <span style={{ color: 'var(--primary-300)', fontSize: '1.05rem' }}>
                          Custom Quote
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    className={`btn ${isFixed ? 'btn-success' : 'btn-primary'} btn-sm`}
                    onClick={() => onSelectServiceToOrder(service)}
                  >
                    <span>{isFixed ? 'Order & Pay' : 'Submit Details'}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Banner: Request Bespoke / Custom Service */}
      <div
        className="glass-card"
        style={{
          marginTop: '3.5rem',
          padding: '2.5rem 2rem',
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.8), rgba(15, 23, 42, 0.95))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ maxWidth: '620px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-300)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Sparkles size={16} />
            <span>CAN'T FIND YOUR EXACT REQUIREMENT?</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: '#FFFFFF' }}>
            Request a Custom Digital Service
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Our verified freelance specialists and administrators handle unique, bespoke, or multi-disciplinary tasks. Submit your files and description, and our administrator will calculate an itemized fee and provide a direct payment link.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={onRequestCustomService}
          style={{ padding: '0.9rem 1.75rem', fontSize: '1rem', fontWeight: 700 }}
        >
          <Sparkles size={18} />
          <span>Request Custom Service</span>
        </button>
      </div>
    </div>
  );
};
