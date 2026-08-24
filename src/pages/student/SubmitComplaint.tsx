import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import type { ComplaintCategory, Priority } from '../../types';
import { CATEGORY_METADATA } from '../../data/mockData';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import {
  PlusCircle,
  Upload,
  X,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Image as ImageIcon,
  Flame,
  Home,
  GraduationCap,
  Zap,
  Droplets,
  Sparkles,
  Wifi,
  Bus,
  Building2,
  ShieldAlert,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';

interface SubmitComplaintProps {
  onNavigate: (path: string) => void;
  defaultCategory?: ComplaintCategory;
}

const CATEGORY_ICONS: Record<ComplaintCategory, React.ReactNode> = {
  Hostel: <Home size={19} strokeWidth={2.4} />,
  Classroom: <GraduationCap size={19} strokeWidth={2.4} />,
  Electricity: <Zap size={19} strokeWidth={2.4} />,
  Water: <Droplets size={19} strokeWidth={2.4} />,
  Sanitation: <Sparkles size={19} strokeWidth={2.4} />,
  Internet: <Wifi size={19} strokeWidth={2.4} />,
  Transportation: <Bus size={19} strokeWidth={2.4} />,
  Infrastructure: <Building2 size={19} strokeWidth={2.4} />,
  Security: <ShieldAlert size={19} strokeWidth={2.4} />,
  Other: <HelpCircle size={19} strokeWidth={2.4} />,
};

export const SubmitComplaint: React.FC<SubmitComplaintProps> = ({
  onNavigate,
  defaultCategory = 'Hostel',
}) => {
  const { createComplaint } = useComplaints();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>(defaultCategory);
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<
    { id: string; name: string; size: string; type: string; url: string; uploadedAt: string }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdComplaintId, setCreatedComplaintId] = useState<string | null>(null);

  // Common campus locations for quick selection
  const locationSuggestions = [
    'Banda Singh Bahadur Hostel - Block A',
    'Banda Singh Bahadur Hostel - Block C',
    'Mai Bhago Girls Hostel - Block A',
    'Mai Bhago Girls Hostel - Block B',
    'Department of Computer Science - Lab 302',
    'Department of Electronics - 2nd Floor',
    'Bhai Kahn Singh Nabha Central Library - 3rd Floor',
    'Arts Faculty Building - Ground Floor',
    'Sports Pavilion & Gymnasium',
    'Campus Gate 1 Shuttle Stand',
  ];

  // Handle simulated image attachment
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      const newAtt = {
        id: `att-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type || 'image/jpeg',
        url:
          result ||
          'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80',
        uploadedAt: new Date().toISOString(),
      };
      setAttachments((prev) => [...prev, newAtt]);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createComplaint({
        title: title.trim(),
        category,
        location: location.trim(),
        priority,
        description: description.trim(),
        attachments,
      });

      if (created?.id) {
        setCreatedComplaintId(created.id);
      }
    } catch (err: any) {
      console.error('Error submitting complaint:', err);
      setSubmitError(
        err?.message || 'Failed to submit complaint. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setTitle('');
    setLocation('');
    setDescription('');
    setAttachments([]);
    setSubmitError(null);
    setCreatedComplaintId(null);
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.95rem', fontWeight: 900, letterSpacing: '-0.025em' }}>Submit a Campus Complaint</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Provide clear details and optional photo evidence to expedite maintenance routing and resolution.
        </p>
      </div>

      <Card style={{ padding: '2.5rem 2.25rem' }}>
        {submitError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: '#FEF2F2',
              border: '1.5px solid #FCA5A5',
              color: '#DC2626',
              padding: '0.9rem 1.15rem',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>Submission Error:</strong> {submitError}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Complaint Title / Summary *</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Water cooler leaking on 2nd floor corridor"
              required
              disabled={isSubmitting}
              maxLength={120}
            />
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem', fontWeight: 500 }}>
              Keep it concise and descriptive. (Max 120 characters)
            </div>
          </div>

          {/* Category Selector Grid */}
          <div className="form-group">
            <label className="form-label">Category *</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '0.65rem',
                marginTop: '0.5rem',
              }}
            >
              {(Object.keys(CATEGORY_METADATA) as ComplaintCategory[]).map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    disabled={isSubmitting}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.85rem 0.6rem',
                      borderRadius: 'var(--radius-lg)',
                      border: isSelected ? '1.5px solid rgba(122, 18, 40, 0.3)' : '1px solid rgba(226, 232, 240, 0.7)',
                      background: isSelected ? 'linear-gradient(145deg, #FFFFFF 0%, #FDF2F4 100%)' : 'var(--clay-card-bg)',
                      color: isSelected ? 'var(--pup-maroon)' : 'var(--text-secondary)',
                      boxShadow: isSelected
                        ? '0 6px 14px -2px rgba(122, 18, 40, 0.15), inset 0 1.5px 2px rgba(255, 255, 255, 1)'
                        : 'var(--clay-card-shadow)',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.7 : 1,
                      fontSize: '0.825rem',
                      fontWeight: isSelected ? 800 : 600,
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{ color: isSelected ? 'var(--pup-maroon)' : 'var(--text-muted)' }}>
                      {CATEGORY_ICONS[cat]}
                    </div>
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location & Quick Fill */}
          <div className="form-group">
            <label className="form-label">Campus Location / Department / Room *</label>
            <div style={{ position: 'relative' }}>
              <MapPin
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Banda Singh Bahadur Hostel - Block C, Room 214"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Quick Location Chips */}
            <div style={{ marginTop: '0.65rem', display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.2rem' }}>
                Suggestions:
              </span>
              {locationSuggestions.slice(0, 4).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  disabled={isSubmitting}
                  style={{
                    background: 'var(--clay-btn-outline-bg)',
                    border: '1px solid rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 2px 5px rgba(15, 23, 42, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
                    borderRadius: 'var(--radius-full)',
                    padding: '3px 10px',
                    fontSize: '0.725rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Selection */}
          <div className="form-group">
            <label className="form-label">Priority Level *</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '0.85rem',
              }}
            >
              {[
                { level: 'Low' as Priority, desc: 'Routine fix / minor touchup', color: '#059669', bg: '#ECFDF5' },
                { level: 'Medium' as Priority, desc: 'Regular maintenance issue', color: '#2563EB', bg: '#EFF6FF' },
                { level: 'High' as Priority, desc: 'Affects daily classes or studies', color: '#D97706', bg: '#FEF3C7' },
                { level: 'Urgent' as Priority, desc: 'Safety hazard or total outage', color: '#DC2626', bg: '#FEF2F2' },
              ].map((p) => {
                const isSelected = priority === p.level;
                return (
                  <button
                    key={p.level}
                    type="button"
                    onClick={() => setPriority(p.level)}
                    disabled={isSubmitting}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-lg)',
                      border: `1.5px solid ${isSelected ? p.color : 'rgba(226, 232, 240, 0.7)'}`,
                      background: isSelected ? p.bg : 'var(--clay-card-bg)',
                      boxShadow: isSelected
                        ? `0 6px 14px -2px ${p.color}25, inset 0 1.5px 2px rgba(255, 255, 255, 1)`
                        : 'var(--clay-card-shadow)',
                      textAlign: 'left',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.7 : 1,
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '0.9rem', color: p.color }}>
                      {p.level === 'Urgent' && <Flame size={15} strokeWidth={2.4} />}
                      <span>{p.level}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.35, fontWeight: 500 }}>
                      {p.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Detailed Description *</label>
            <textarea
              rows={4}
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what is wrong, when it started happening, and any specific equipment details..."
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Attachment Upload Dropzone */}
          <div className="form-group">
            <label className="form-label">Photo / Evidence Attachment (Optional)</label>
            <div
              style={{
                border: '2px dashed rgba(203, 213, 225, 0.9)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.75rem',
                textAlign: 'center',
                background: 'var(--clay-inset-bg)',
                boxShadow: 'var(--clay-inset-shadow)',
                position: 'relative',
              }}
            >
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                disabled={isSubmitting}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  width: '100%',
                  height: '100%',
                }}
                aria-label="Upload photo attachment"
              />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--pup-maroon)',
                    boxShadow: '0 4px 10px rgba(15, 23, 42, 0.08), inset 0 1px 2px rgba(255, 255, 255, 1)',
                  }}
                >
                  <Upload size={20} />
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  Click or drag photo here to attach
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Supports JPG, PNG, PDF up to 10MB
                </div>
              </div>
            </div>

            {/* Attached files preview */}
            {attachments.length > 0 && (
              <div style={{ marginTop: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'var(--clay-card-bg)',
                      border: 'var(--clay-card-border)',
                      boxShadow: 'var(--clay-card-shadow)',
                      borderRadius: 'var(--radius-md)',
                      padding: '6px 12px',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                    }}
                  >
                    <ImageIcon size={15} style={{ color: 'var(--pup-maroon)' }} />
                    <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {att.name}
                    </span>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>({att.size})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      disabled={isSubmitting}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        padding: '2px',
                        display: 'flex',
                      }}
                      aria-label="Remove attachment"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div
            style={{
              marginTop: '2.25rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(241, 245, 249, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '1rem',
            }}
          >
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onNavigate('/student/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              leftIcon={!isSubmitting ? <PlusCircle size={19} /> : undefined}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Confirmation Success Modal */}
      <Modal
        isOpen={!!createdComplaintId}
        onClose={() => {
          if (createdComplaintId) {
            onNavigate(`/student/complaints/${createdComplaintId}`);
          }
        }}
        title="Complaint Registered Successfully!"
      >
        <div style={{ textAlign: 'center', padding: '1.25rem 0' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              boxShadow: '0 8px 20px rgba(5, 150, 105, 0.2), inset 0 2px 3px rgba(255, 255, 255, 1)',
            }}
          >
            <CheckCircle2 size={38} strokeWidth={2.5} />
          </div>

          <h3 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
            Complaint Reference Generated
          </h3>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '1.4rem',
              fontWeight: 900,
              color: 'var(--pup-maroon)',
              background: 'var(--pup-maroon-subtle)',
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              display: 'inline-block',
              margin: '0.6rem 0 1.25rem 0',
              border: '1px solid rgba(122, 18, 40, 0.15)',
              boxShadow: '0 4px 10px rgba(122, 18, 40, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
            }}
          >
            {createdComplaintId}
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 auto 1.75rem auto', maxWidth: '440px' }}>
            Your complaint has been logged into the PUP CampusCare maintenance queue. Department officers have been alerted and will review your ticket.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                if (createdComplaintId) onNavigate(`/student/complaints/${createdComplaintId}`);
              }}
              rightIcon={<ArrowRight size={16} />}
              style={{ width: '100%' }}
            >
              Track Complaint & View Timeline
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                handleResetForm();
              }}
              style={{ width: '100%' }}
            >
              Submit Another Issue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
