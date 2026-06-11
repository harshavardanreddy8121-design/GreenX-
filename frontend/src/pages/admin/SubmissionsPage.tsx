import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { admin, LandRegistrationSubmission } from '@/lib/api';
import { toast } from 'sonner';
import {
    CheckCircle2,
    ChevronDown,
    ClipboardList,
    Filter,
    Loader2,
    MapPin,
    Phone,
    Search,
    StickyNote,
    Trash2,
    User,
    X,
} from 'lucide-react';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'CONTACTED', 'REGISTERED', 'REJECTED'] as const;

const STATUS_COLORS: Record<string, string> = {
    PENDING:    'gx-s-pending',
    CONTACTED:  'gx-s-done',
    REGISTERED: 'gx-s-done',
    REJECTED:   'gx-s-alert',
};

function formatDate(dt?: string) {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export default function SubmissionsPage() {
    const queryClient = useQueryClient();

    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [searchPhone, setSearchPhone]   = useState('');
    const [searchLoc, setSearchLoc]       = useState('');
    const [selected, setSelected]         = useState<LandRegistrationSubmission | null>(null);
    const [editNotes, setEditNotes]       = useState('');
    const [editStatus, setEditStatus]     = useState('');

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const { data: submissions = [], isLoading, isError, error } = useQuery({
        queryKey: ['land-registrations', statusFilter, searchPhone, searchLoc],
        queryFn: () => {
            const status   = statusFilter !== 'ALL' ? statusFilter : undefined;
            const phone    = searchPhone.trim() || undefined;
            const location = searchLoc.trim()   || undefined;
            return admin.getLandRegistrations(status, phone, location);
        },
    });

    // ── Mutations ──────────────────────────────────────────────────────────────
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            admin.updateSubmissionStatus(id, status),
        onSuccess: (updated) => {
            toast.success(`Status updated to ${updated.status}`);
            queryClient.invalidateQueries({ queryKey: ['land-registrations'] });
            if (selected?.id === updated.id) setSelected(updated);
        },
        onError: (err: Error) => toast.error(err.message || 'Failed to update status'),
    });

    const updateNotesMutation = useMutation({
        mutationFn: ({ id, notes }: { id: string; notes: string }) =>
            admin.addSubmissionNotes(id, notes),
        onSuccess: (updated) => {
            toast.success('Notes saved');
            queryClient.invalidateQueries({ queryKey: ['land-registrations'] });
            if (selected?.id === updated.id) setSelected(updated);
        },
        onError: (err: Error) => toast.error(err.message || 'Failed to save notes'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => admin.deleteSubmission(id),
        onSuccess: () => {
            toast.success('Submission deleted');
            queryClient.invalidateQueries({ queryKey: ['land-registrations'] });
            setSelected(null);
        },
        onError: (err: Error) => toast.error(err.message || 'Failed to delete'),
    });

    // ── Handlers ───────────────────────────────────────────────────────────────
    const openDetail = (sub: LandRegistrationSubmission) => {
        setSelected(sub);
        setEditNotes(sub.notes ?? '');
        setEditStatus(sub.status);
    };

    const closeDetail = () => setSelected(null);

    const handleStatusChange = (id: string, status: string) => {
        updateStatusMutation.mutate({ id, status });
    };

    const handleSaveNotes = () => {
        if (!selected) return;
        updateNotesMutation.mutate({ id: selected.id, notes: editNotes });
    };

    const handleDelete = (id: string) => {
        if (!window.confirm('Delete this submission? This cannot be undone.')) return;
        deleteMutation.mutate(id);
    };

    const pendingCount = submissions.filter(s => s.status === 'PENDING').length;

    return (
        <>
            {/* ── Page Header ── */}
            <div className="gx-page-header">
                <div className="gx-page-title">
                    <ClipboardList className="inline-block w-4 h-4 mr-2 align-middle" />
                    Land Registration Submissions
                </div>
                <div className="gx-page-sub">
                    {submissions.length} total · {pendingCount} pending review
                </div>
            </div>

            {isError && (
                <div className="gx-alert-box gx-alert-red" style={{ marginBottom: 16 }}>
                    Failed to load submissions: {(error as Error)?.message}
                </div>
            )}

            {/* ── Filters ── */}
            <div className="gx-card" style={{ marginBottom: 16 }}>
                <div className="gx-card-body">
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        {/* Status filter */}
                        <div className="gx-form-group" style={{ minWidth: 160 }}>
                            <label className="gx-label">
                                <Filter className="inline-block w-3 h-3 mr-1" />
                                Status
                            </label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    className="gx-select"
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    style={{ paddingRight: 28 }}
                                >
                                    {STATUS_OPTIONS.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                <ChevronDown className="w-3 h-3" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: .5 }} />
                            </div>
                        </div>

                        {/* Phone search */}
                        <div className="gx-form-group" style={{ minWidth: 200 }}>
                            <label className="gx-label">
                                <Phone className="inline-block w-3 h-3 mr-1" />
                                Search by Phone
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Search className="w-3 h-3" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', opacity: .5 }} />
                                <input
                                    className="gx-input"
                                    style={{ paddingLeft: 26 }}
                                    placeholder="e.g. 9876543210"
                                    value={searchPhone}
                                    onChange={e => { setSearchPhone(e.target.value); setSearchLoc(''); }}
                                />
                            </div>
                        </div>

                        {/* Location search */}
                        <div className="gx-form-group" style={{ minWidth: 200 }}>
                            <label className="gx-label">
                                <MapPin className="inline-block w-3 h-3 mr-1" />
                                Search by Location
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Search className="w-3 h-3" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', opacity: .5 }} />
                                <input
                                    className="gx-input"
                                    style={{ paddingLeft: 26 }}
                                    placeholder="e.g. Hyderabad"
                                    value={searchLoc}
                                    onChange={e => { setSearchLoc(e.target.value); setSearchPhone(''); }}
                                />
                            </div>
                        </div>

                        {/* Clear */}
                        {(searchPhone || searchLoc || statusFilter !== 'ALL') && (
                            <button
                                className="gx-btn gx-btn-ghost"
                                style={{ fontSize: 12, alignSelf: 'flex-end' }}
                                onClick={() => { setSearchPhone(''); setSearchLoc(''); setStatusFilter('ALL'); }}
                            >
                                <X className="inline-block w-3 h-3 mr-1" /> Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="gx-card">
                <div className="gx-card-header">
                    <div className="gx-card-title">
                        <ClipboardList className="inline-block w-4 h-4 mr-1 align-middle" />
                        Submissions
                    </div>
                    <span className="gx-status gx-s-pending">{submissions.length} records</span>
                </div>
                <div className="gx-card-body">
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: 40, opacity: .5 }}>
                            <Loader2 className="inline-block w-5 h-5 animate-spin mr-2" />
                            Loading submissions…
                        </div>
                    ) : submissions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, opacity: .5 }}>
                            No submissions found.
                        </div>
                    ) : (
                        <table className="gx-data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Location</th>
                                    <th>Land Size</th>
                                    <th>Status</th>
                                    <th>Submitted</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((sub, i) => (
                                    <tr
                                        key={sub.id}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => openDetail(sub)}
                                    >
                                        <td>{i + 1}</td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{sub.fullName}</div>
                                        </td>
                                        <td>{sub.phone}</td>
                                        <td>{sub.location}</td>
                                        <td>{sub.landSize}</td>
                                        <td>
                                            <span className={`gx-status ${STATUS_COLORS[sub.status] ?? 'gx-s-pending'}`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 12, opacity: .7 }}>{formatDate(sub.submittedAt)}</td>
                                        <td onClick={e => e.stopPropagation()}>
                                            <button
                                                className="gx-btn gx-btn-ghost"
                                                style={{ fontSize: 11, padding: '3px 8px', color: 'var(--gx-red, #ef4444)' }}
                                                onClick={() => handleDelete(sub.id)}
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="inline-block w-3 h-3 mr-1" />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ── Detail Drawer ── */}
            {selected && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 50,
                        background: 'rgba(0,0,0,.45)',
                        display: 'flex', justifyContent: 'flex-end',
                    }}
                    onClick={closeDetail}
                >
                    <div
                        style={{
                            width: '100%', maxWidth: 480,
                            background: 'var(--gx-card, #1a1a1a)',
                            height: '100%', overflowY: 'auto',
                            padding: 24, boxShadow: '-4px 0 24px rgba(0,0,0,.4)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div style={{ fontWeight: 700, fontSize: 16 }}>Submission Detail</div>
                            <button className="gx-btn gx-btn-ghost" style={{ padding: '4px 8px' }} onClick={closeDetail}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Info rows */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                            <InfoRow icon={<User className="w-4 h-4" />}    label="Full Name"  value={selected.fullName} />
                            <InfoRow icon={<Phone className="w-4 h-4" />}   label="Phone"      value={selected.phone} />
                            <InfoRow icon={<MapPin className="w-4 h-4" />}  label="Location"   value={selected.location} />
                            <InfoRow icon={<ClipboardList className="w-4 h-4" />} label="Land Size" value={selected.landSize} />
                            {selected.message && (
                                <InfoRow icon={<StickyNote className="w-4 h-4" />} label="Message" value={selected.message} />
                            )}
                            <InfoRow icon={<CheckCircle2 className="w-4 h-4" />} label="Submitted" value={formatDate(selected.submittedAt)} />
                        </div>

                        {/* Status update */}
                        <div className="gx-form-group" style={{ marginBottom: 16 }}>
                            <label className="gx-label">Update Status</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <select
                                    className="gx-select"
                                    value={editStatus}
                                    onChange={e => setEditStatus(e.target.value)}
                                    style={{ flex: 1 }}
                                >
                                    {STATUS_OPTIONS.filter(s => s !== 'ALL').map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                <button
                                    className="gx-btn gx-btn-green"
                                    style={{ fontSize: 12 }}
                                    disabled={updateStatusMutation.isPending || editStatus === selected.status}
                                    onClick={() => handleStatusChange(selected.id, editStatus)}
                                >
                                    {updateStatusMutation.isPending
                                        ? <Loader2 className="w-3 h-3 animate-spin" />
                                        : 'Save'}
                                </button>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="gx-form-group" style={{ marginBottom: 20 }}>
                            <label className="gx-label">
                                <StickyNote className="inline-block w-3 h-3 mr-1" />
                                Admin Notes
                            </label>
                            <textarea
                                className="gx-input"
                                rows={4}
                                style={{ resize: 'vertical', fontFamily: 'inherit' }}
                                placeholder="Add internal notes about this submission…"
                                value={editNotes}
                                onChange={e => setEditNotes(e.target.value)}
                            />
                            <button
                                className="gx-btn gx-btn-green"
                                style={{ marginTop: 8, fontSize: 12 }}
                                disabled={updateNotesMutation.isPending}
                                onClick={handleSaveNotes}
                            >
                                {updateNotesMutation.isPending
                                    ? <><Loader2 className="inline-block w-3 h-3 animate-spin mr-1" /> Saving…</>
                                    : 'Save Notes'}
                            </button>
                        </div>

                        {/* Delete */}
                        <div style={{ borderTop: '1px solid var(--gx-border, #333)', paddingTop: 16 }}>
                            <button
                                className="gx-btn gx-btn-ghost"
                                style={{ color: 'var(--gx-red, #ef4444)', fontSize: 13 }}
                                disabled={deleteMutation.isPending}
                                onClick={() => handleDelete(selected.id)}
                            >
                                <Trash2 className="inline-block w-4 h-4 mr-1" />
                                {deleteMutation.isPending ? 'Deleting…' : 'Delete Submission'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ opacity: .5, marginTop: 2, flexShrink: 0 }}>{icon}</span>
            <div>
                <div style={{ fontSize: 11, opacity: .5, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 14 }}>{value}</div>
            </div>
        </div>
    );
}
