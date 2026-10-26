import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  UploadCloud,
  File,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  CreditCard,
  FileText,
  Info,
  Lock,
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  services: any[];
  preSelectedService: any | null;
  onOrderCreated: (order: any) => void;
  initialCustomMode?: boolean;
  onOpenAuth?: (tab?: 'login' | 'register_customer' | 'apply_worker') => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  categories,
  services,
  preSelectedService,
  onOrderCreated,
  initialCustomMode = false,
  onOpenAuth,
}) => {
  const { isAuthenticated, user } = useAuth();

  // Mode: 'catalog' | 'custom'
  const [isCustomMode, setIsCustomMode] = useState(initialCustomMode);

  // Form Fields
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState('General Customers');
  const [title, setTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [targetDeadline, setTargetDeadline] = useState('');
  const [dynamicFormValues, setDynamicFormValues] = useState<Record<string, any>>({});
  const [dynamicSchema, setDynamicSchema] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Post-submit Fixed Price Payment Banner
  const [createdFixedOrder, setCreatedFixedOrder] = useState<any | null>(null);
  const [isPayingNow, setIsPayingNow] = useState(false);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setCreatedFixedOrder(null);
      setErrorMsg('');
      const d = new Date(Date.now() + 48 * 3600 * 1000);
      setTargetDeadline(d.toISOString().slice(0, 16));

      if (initialCustomMode) {
        setIsCustomMode(true);
        setTitle('');
        setCustomDescription('');
      } else if (preSelectedService) {
        setIsCustomMode(false);
        setSelectedServiceId(preSelectedService.id);
        setTitle(`Order for ${preSelectedService.title}`);
        loadSchemaForService(preSelectedService);
      } else if (services.length > 0) {
        setIsCustomMode(false);
        setSelectedServiceId(services[0].id);
        setTitle(`Order for ${services[0].title}`);
        loadSchemaForService(services[0]);
      }
    }
  }, [isOpen, preSelectedService, initialCustomMode, services]);

  const loadSchemaForService = (service: any) => {
    try {
      const parsed = typeof service.requirementSchema === 'string'
        ? JSON.parse(service.requirementSchema)
        : service.requirementSchema;
      setDynamicSchema(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      setDynamicSchema([]);
    }
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = e.target.value;
    setSelectedServiceId(sId);
    const s = services.find((srv) => srv.id === sId);
    if (s) {
      setTitle(`Order for ${s.title}`);
      loadSchemaForService(s);
      setDynamicFormValues({});
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleDynamicChange = (fieldId: string, val: any) => {
    setDynamicFormValues((prev) => ({ ...prev, [fieldId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isAuthenticated) {
      setErrorMsg('Please sign in or register as a customer to submit your order.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Please specify a title for your request.');
      return;
    }

    if (!targetDeadline) {
      setErrorMsg('Please choose a desired completion deadline.');
      return;
    }

    if (isCustomMode && !customDescription.trim()) {
      setErrorMsg('Please describe your requirements in detail so the administrator can provide a quotation.');
      return;
    }

    if (!isCustomMode) {
      // Validate required dynamic fields
      for (const field of dynamicSchema) {
        if (field.required && !dynamicFormValues[field.id]) {
          setErrorMsg(`Please fill in the required field: "${field.label}"`);
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      const selectedService = !isCustomMode ? services.find((s) => s.id === selectedServiceId) : null;
      const formData = new FormData();

      formData.append('title', title.trim());
      formData.append('targetDeadline', new Date(targetDeadline).toISOString());

      if (isCustomMode) {
        const customData = {
          targetAudience,
          description: customDescription.trim(),
          estimatedBudget: estimatedBudget.trim() || undefined,
          isCustomRequest: true,
        };
        formData.append('requirementsData', JSON.stringify(customData));
        // Use custom requests category if found
        const customCat = categories.find((c) => c.slug === 'custom-requests') || categories[0];
        if (customCat) {
          formData.append('categoryId', customCat.id);
        }
      } else if (selectedService) {
        formData.append('requirementsData', JSON.stringify(dynamicFormValues));
        formData.append('serviceId', selectedService.id);
        formData.append('categoryId', selectedService.categoryId);
      }

      // Attach files
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const res = await api.post('/orders', formData);

      // Check if this was a fixed-price service ready for immediate payment
      if (res.order.status === 'AWAITING_PAYMENT' && res.order.quotedPrice && res.order.quotedPrice > 0) {
        setCreatedFixedOrder(res.order);
        onOrderCreated(res.order);
      } else {
        onOrderCreated(res.order);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayNow = async () => {
    if (!createdFixedOrder) return;
    setIsPayingNow(true);
    try {
      await api.post(`/payments/sandbox-mock-pay/${createdFixedOrder.id}`);
      alert(`Payment of LKR ${createdFixedOrder.quotedPrice.toLocaleString()} confirmed! Funds locked in escrow.`);
      onOrderCreated({ ...createdFixedOrder, status: 'READY_FOR_ASSIGNMENT' });
      onClose();
    } catch (e: any) {
      alert(e.message || 'Payment failed.');
    } finally {
      setIsPayingNow(false);
    }
  };

  if (!isOpen || !isAuthenticated) return null;

  const currentService = !isCustomMode ? services.find((s) => s.id === selectedServiceId) : null;
  const isCurrentFixed = currentService?.pricingType === 'FIXED';

  // If order was created and is awaiting payment, show instant payment step
  if (createdFixedOrder) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '520px', textAlign: 'center', padding: '2.5rem 2rem' }}>
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '50%',
              backgroundColor: 'var(--success-bg)',
              border: '1px solid var(--success-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
            }}
          >
            <CheckCircle size={28} color="var(--success)" />
          </div>

          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Order Created Successfully!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Reference: <strong style={{ color: 'var(--primary-300)' }}>{createdFixedOrder.orderNumber}</strong>
          </p>

          <div
            className="glass-card"
            style={{
              padding: '1.5rem',
              marginBottom: '1.75rem',
              textAlign: 'left',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-sub)', fontSize: '0.85rem' }}>Fixed Service Price:</span>
              <strong style={{ fontSize: '1.25rem', color: 'var(--success)' }}>
                LKR {(createdFixedOrder.quotedPrice || 0).toLocaleString()}
              </strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              This service has a fixed fee. You can make an immediate payment now to lock escrow and start work, or pay later from your customer dashboard.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              className="btn btn-success"
              onClick={handlePayNow}
              disabled={isPayingNow}
              style={{ padding: '0.85rem', fontWeight: 700, fontSize: '0.95rem' }}
            >
              <CreditCard size={18} />
              <span>{isPayingNow ? 'Processing Payment...' : `Pay Now (LKR ${createdFixedOrder.quotedPrice.toLocaleString()})`}</span>
            </button>
            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isPayingNow}
            >
              Pay Later from Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '680px' }}>
        {/* Header */}
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
                {isCustomMode ? 'Request Custom / Another Service' : 'Submit Service Order'}
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                100% Escrow Protected & Quality Checked by Administrators
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            padding: '0.3rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => setIsCustomMode(false)}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              backgroundColor: !isCustomMode ? 'var(--primary-600)' : 'transparent',
              color: !isCustomMode ? '#FFFFFF' : 'var(--text-muted)',
              transition: 'all var(--transition-fast)',
            }}
          >
            Select from Catalog Services
          </button>
          <button
            type="button"
            onClick={() => setIsCustomMode(true)}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              backgroundColor: isCustomMode ? 'var(--primary-600)' : 'transparent',
              color: isCustomMode ? '#FFFFFF' : 'var(--text-muted)',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            <Sparkles size={14} />
            <span>Request Custom Service</span>
          </button>
        </div>

        {errorMsg && (
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
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* CATALOG MODE: Service Dropdown */}
          {!isCustomMode && (
            <div className="form-group">
              <label className="form-label">
                <span>Select Digital Service</span>
                <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={selectedServiceId}
                onChange={handleServiceChange}
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.targetAudience || 'General'}] {s.title} — {s.pricingType === 'FIXED' ? `LKR ${s.basePrice.toLocaleString()} (Fixed)` : 'Custom Quoted'}
                  </option>
                ))}
              </select>

              {/* Service Pricing & Flow Indicator */}
              {currentService && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isCurrentFixed ? 'var(--success-bg)' : 'rgba(99, 102, 241, 0.1)',
                    border: isCurrentFixed ? '1px solid var(--success-border)' : '1px solid rgba(99, 102, 241, 0.25)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                  }}
                >
                  {isCurrentFixed ? (
                    <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  ) : (
                    <Info size={18} color="var(--primary-400)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  )}
                  <div style={{ fontSize: '0.825rem', lineHeight: 1.5 }}>
                    {isCurrentFixed ? (
                      <div>
                        <strong style={{ color: 'var(--success)' }}>
                          Fixed Fee: LKR {currentService.basePrice.toLocaleString()}
                        </strong>
                        <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          This service has a determined cost. You can pay immediately upon submitting to start your order right away.
                        </div>
                      </div>
                    ) : (
                      <div>
                        <strong style={{ color: 'var(--primary-300)' }}>
                          Custom Quoted Service
                        </strong>
                        <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          The cost varies depending on your specific requirements. An administrator will review your instructions and files, provide an itemized fee, notify you, and provide the payment link.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CUSTOM MODE: Target Category & Audience */}
          {isCustomMode && (
            <>
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(99, 102, 241, 0.12)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.825rem',
                  color: 'var(--text-muted)',
                }}
              >
                <Info size={16} color="var(--primary-300)" />
                <span>
                  Describe what you need. Our administrator will examine your requirements, determine the fair fee, and notify you with the payment link.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    <span>Target Customer Category</span>
                  </label>
                  <select
                    className="form-select"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  >
                    <option value="Students">Students (Academic, Assignments, Research)</option>
                    <option value="Job Seekers">Job Seekers (CV, Applications, LinkedIn)</option>
                    <option value="Employees">Employees (Reports, Excel, Word, Presentations)</option>
                    <option value="Businesses">Businesses (Data, SOPs, Proposals, IT)</option>
                    <option value="General Customers">General Customers (Letters, Forms, PDF)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>Estimated Budget (LKR, Optional)</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 5,000 LKR"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Title & Deadline */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">
                <span>{isCustomMode ? 'Custom Service Title' : 'Order Reference Title'}</span>
                <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={isCustomMode ? 'e.g. Scrape and clean product catalog data' : 'e.g. Resume Revamp for Marketing Lead'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Target Deadline</span>
                <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                className="form-input"
                value={targetDeadline}
                onChange={(e) => setTargetDeadline(e.target.value)}
              />
            </div>
          </div>

          {/* CUSTOM MODE: Description */}
          {isCustomMode && (
            <div className="form-group">
              <label className="form-label">
                <span>Detailed Requirements & Instructions</span>
                <span className="required">*</span>
              </label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Explain the specific outcome you need, software to use, length, formatting standards, or any key parameters..."
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
              />
            </div>
          )}

          {/* CATALOG MODE: Dynamic Requirement Fields */}
          {!isCustomMode && dynamicSchema.length > 0 && (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                marginBottom: '1.25rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--primary-400)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span>Service Specific Requirements</span>
              </div>

              {dynamicSchema.map((field) => (
                <div key={field.id} className="form-group">
                  <label className="form-label">
                    <span>{field.label}</span>
                    {field.required && <span className="required">*</span>}
                  </label>

                  {field.type === 'text' && (
                    <input
                      type="text"
                      className="form-input"
                      placeholder={field.placeholder || ''}
                      value={dynamicFormValues[field.id] || ''}
                      onChange={(e) => handleDynamicChange(field.id, e.target.value)}
                    />
                  )}

                  {field.type === 'number' && (
                    <input
                      type="number"
                      className="form-input"
                      placeholder={field.placeholder || ''}
                      value={dynamicFormValues[field.id] || ''}
                      onChange={(e) => handleDynamicChange(field.id, e.target.value)}
                    />
                  )}

                  {field.type === 'textarea' && (
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder={field.placeholder || ''}
                      value={dynamicFormValues[field.id] || ''}
                      onChange={(e) => handleDynamicChange(field.id, e.target.value)}
                    />
                  )}

                  {field.type === 'select' && (
                    <select
                      className="form-select"
                      value={dynamicFormValues[field.id] || ''}
                      onChange={(e) => handleDynamicChange(field.id, e.target.value)}
                    >
                      <option value="">Select an option...</option>
                      {field.options?.map((opt: string) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* File Attachments */}
          <div className="form-group">
            <label className="form-label">
              <span>Attach Source / Reference Files (Optional)</span>
            </label>
            <div
              style={{
                border: '2px dashed var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('new-order-file-input')?.click()}
            >
              <UploadCloud size={24} color="var(--primary-400)" style={{ margin: '0 auto 0.5rem auto' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Click to attach documents</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                Word, Excel, PowerPoint, PDF, Images up to 25MB each
              </div>
              <input
                id="new-order-file-input"
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>

            {selectedFiles.length > 0 && (
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {selectedFiles.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.4rem 0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <File size={14} color="var(--primary-400)" />
                      <span>{f.name}</span>
                    </div>
                    <span style={{ color: 'var(--text-sub)' }}>{(f.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${isCurrentFixed && !isCustomMode ? 'btn-success' : 'btn-primary'}`}
              disabled={isSubmitting}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : isCurrentFixed && !isCustomMode ? (
                <>
                  <CreditCard size={16} />
                  <span>Confirm Order (LKR {currentService.basePrice.toLocaleString()})</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Submit for Administrator Quotation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
