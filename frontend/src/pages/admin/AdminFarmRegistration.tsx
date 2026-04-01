import { useState, useRef, type ChangeEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { admin } from '@/lib/api';
import { AlertCircle, AlertTriangle, Building2, Check, CheckCircle2, ChevronLeft, ChevronRight, Copy, Droplets, FileText, Hammer, Home, KeyRound, Landmark, MapPin, Paperclip, Ruler, Upload, User, UserRound, Wheat, X } from 'lucide-react';

// ─── Andhra Pradesh Districts ─────────────────────────────────────────────────
const AP_DISTRICTS = [
    'Alluri Sitharama Raju', 'Anakapalli', 'Anantapur', 'Annamayya', 'Bapatla',
    'Chittoor', 'East Godavari', 'Eluru', 'Guntur', 'Kakinada', 'Konaseema',
    'Krishna', 'Kurnool', 'Nandyal', 'NTR', 'Palnadu', 'Parvathipuram Manyam',
    'Prakasam', 'Sri Potti Sriramulu Nellore', 'Sri Sathya Sai', 'Srikakulam',
    'Tirupati', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR Kadapa',
];

// ─── Steps Config ─────────────────────────────────────────────────────────────
const steps = [
    { id: 1, title: 'Personal Details', icon: User, icon: <UserRound size={16} /> },
    { id: 2, title: 'Land Location', icon: MapPin, icon: <Home size={16} /> },
    { id: 3, title: 'Land Details', icon: Ruler, icon: <Ruler size={16} /> },
    { id: 4, title: 'Water & Irrigation', icon: Droplets, icon: <Droplets size={16} /> },
    { id: 5, title: 'Infrastructure', icon: Building2, icon: <Hammer size={16} /> },
    { id: 6, title: 'Bank Details', icon: Landmark, icon: <Landmark size={16} /> },
    { id: 7, title: 'Documents', icon: FileText, icon: <Paperclip size={16} /> },
    { id: 8, title: 'Confirmation', icon: CheckCircle2, icon: <CheckCircle2 size={16} /> },
];

// ─── Default Form State ───────────────────────────────────────────────────────
const defaultForm = {
    // Step 1 – Personal Details
    full_name: '', mobile: '', email: '', aadhaar: '', pan: '',
    dob: '', gender: '', occupation: '',
    // Step 2 – Land Location
    village: '', mandal: '', district: '', state: 'Andhra Pradesh',
    pincode: '', landmark: '',
    // Step 3 – Land Details
    survey_number: '', total_area: '', cultivable_area: '', soil_type: '',
    topography: '', land_ownership: '', previous_crop: '', years_cultivated: '',
    // Step 4 – Water & Irrigation
    water_source: '', irrigation_method: '', borewell_depth: '', electricity: '',
    // Step 5 – Infrastructure
    road_access: '', storage_available: false as boolean, fencing: '', distance_to_market: '',
    // Step 6 – Bank Details
    account_holder: '', bank_name: '', branch_name: '', account_number: '',
    ifsc_code: '', account_type: '', upi_id: '',
    // Step 8 – Confirmation
    agree_terms: false as boolean,
};

type FormState = typeof defaultForm;

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminFarmRegistration() {
    const queryClient = useQueryClient();
    const [currentStep, setCurrentStep] = useState(1);
    const [form, setForm] = useState<FormState>({ ...defaultForm });
    const [files, setFiles] = useState<{ aadhaar_doc: File | null; passbook_doc: File | null; profile_photo: File | null; land_doc: File | null }>({
        aadhaar_doc: null, passbook_doc: null, profile_photo: null, land_doc: null,
    });
    const [errors, setErrors] = useState<string[]>([]);
    const [credentials, setCredentials] = useState<{ ownerEmail: string; tempPassword: string; farmCode: string } | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const formRef = useRef<HTMLDivElement>(null);

    const set = (key: keyof FormState, value: string | boolean) =>
        setForm(f => ({ ...f, [key]: value }));

    // ─── Validation ──────────────────────────────────────────────────────────
    const validateStep = (step: number): string[] => {
        const e: string[] = [];
        switch (step) {
            case 1:
                if (!form.full_name.trim()) e.push('Full Name is required');
                if (!/^\d{10}$/.test(form.mobile)) e.push('Mobile must be 10 digits');
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.push('Valid email is required');
                if (!/^\d{12}$/.test(form.aadhaar)) e.push('Aadhaar must be 12 digits');
                if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(form.pan.toUpperCase())) e.push('PAN format: ABCDE1234F');
                if (!form.dob) e.push('Date of Birth is required');
                if (!form.gender) e.push('Gender is required');
                if (!form.occupation) e.push('Occupation is required');
                break;
            case 2:
                if (!form.village.trim()) e.push('Village is required');
                if (!form.mandal.trim()) e.push('Mandal / Taluk is required');
                if (!form.district) e.push('District is required');
                if (!/^\d{6}$/.test(form.pincode)) e.push('PIN Code must be 6 digits');
                break;
            case 3:
                if (!form.survey_number.trim()) e.push('Survey Number is required');
                if (!form.total_area || +form.total_area <= 0) e.push('Total Area is required');
                if (!form.cultivable_area || +form.cultivable_area <= 0) e.push('Cultivable Area is required');
                if (+form.cultivable_area > +form.total_area) e.push('Cultivable area cannot exceed total area');
                if (!form.soil_type) e.push('Soil Type is required');
                if (!form.topography) e.push('Topography is required');
                if (!form.land_ownership) e.push('Land Ownership is required');
                break;
            case 4:
                if (!form.water_source) e.push('Water Source is required');
                if (!form.irrigation_method) e.push('Irrigation Method is required');
                if (!form.electricity) e.push('Electricity is required');
                break;
            case 5:
                if (!form.road_access) e.push('Road Access is required');
                if (!form.fencing) e.push('Fencing is required');
                break;
            case 6:
                if (!form.account_holder.trim()) e.push('Account Holder Name is required');
                if (!form.bank_name.trim()) e.push('Bank Name is required');
                if (!form.branch_name.trim()) e.push('Branch Name is required');
                if (!form.account_number.trim()) e.push('Account Number is required');
                if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(form.ifsc_code)) e.push('Valid IFSC Code is required');
                if (!form.account_type) e.push('Account Type is required');
                break;
            case 7:
                if (!files.aadhaar_doc) e.push('Aadhaar Card document is required');
                if (!files.passbook_doc) e.push('Pattadar Passbook is required');
                if (!files.profile_photo) e.push('Profile Photo is required');
                break;
            case 8:
                if (!form.agree_terms) e.push('You must agree to Terms & Conditions');
                break;
        }
        return e;
    };

    // ─── Navigation ──────────────────────────────────────────────────────────
    const nextStep = () => {
        const errs = validateStep(currentStep);
        if (errs.length) { setErrors(errs); return; }
        setErrors([]);
        setCurrentStep(s => Math.min(s + 1, 8));
        formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const prevStep = () => {
        setErrors([]);
        setCurrentStep(s => Math.max(s - 1, 1));
        formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToStep = (step: number) => {
        // Only allow going to completed or current steps
        if (step <= currentStep) {
            setErrors([]);
            setCurrentStep(step);
        }
    };

    // ─── Submit ──────────────────────────────────────────────────────────────
    const submitMutation = useMutation({
        mutationFn: async () => {
            const fd = new FormData();
            // Append all form fields
            Object.entries(form).forEach(([key, val]) => {
                fd.append(key, String(val));
            });
            // Append files
            if (files.aadhaar_doc) fd.append('aadhaar_doc', files.aadhaar_doc);
            if (files.passbook_doc) fd.append('passbook_doc', files.passbook_doc);
            if (files.profile_photo) fd.append('profile_photo', files.profile_photo);
            if (files.land_doc) fd.append('land_doc', files.land_doc);
            return admin.registerFarm(fd);
        },
        onSuccess: (data) => {
            toast.success('Farm registered successfully!');
            queryClient.invalidateQueries({ queryKey: ['admin-farms'] });
            setCredentials({
                ownerEmail: data.ownerEmail,
                tempPassword: data.tempPassword,
                farmCode: data.farmCode,
            });
            setForm({ ...defaultForm });
            setFiles({ aadhaar_doc: null, passbook_doc: null, profile_photo: null, land_doc: null });
            setCurrentStep(1);
            setErrors([]);
        },
        onError: (err: Error) => toast.error(err.message || 'Registration failed'),
    });

    const handleSubmit = () => {
        const errs = validateStep(8);
        if (errs.length) { setErrors(errs); return; }
        setErrors([]);
        submitMutation.mutate();
    };

    // ─── File Handler ────────────────────────────────────────────────────────
    const handleFile = (key: keyof typeof files, maxMB: number) =>
        (e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > maxMB * 1024 * 1024) {
                toast.error(`File size exceeds ${maxMB}MB limit`);
                e.target.value = '';
                return;
            }
            setFiles(f => ({ ...f, [key]: file }));
        };

    // ─── Render Each Step ────────────────────────────────────────────────────
    const renderStep = () => {
        switch (currentStep) {
            case 1: return <Step1 form={form} set={set} />;
            case 2: return <Step2 form={form} set={set} />;
            case 3: return <Step3 form={form} set={set} />;
            case 4: return <Step4 form={form} set={set} />;
            case 5: return <Step5 form={form} set={set} />;
            case 6: return <Step6 form={form} set={set} />;
            case 7: return <Step7 files={files} handleFile={handleFile} setFiles={setFiles} />;
            case 8: return <Step8 form={form} files={files} set={set} />;
            default: return null;
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
    };

    const currentStepInfo = steps[currentStep - 1];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* ─── Credentials Modal ──────────────────────────────────────── */}
            {credentials && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                }}>
                    <div style={{
                        background: 'var(--gx-surface)', border: '1px solid var(--gx-border)',
                        borderRadius: 16, padding: '32px 28px', maxWidth: 440, width: '90%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px',
                                background: 'var(--gx-green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <KeyRound size={28} style={{ color: 'var(--gx-green)' }} />
                            </div>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gx-text)', margin: 0 }}>
                                Landowner Login Credentials
                            </h2>
                            <p style={{ fontSize: 13, color: 'var(--gx-text2)', marginTop: 6 }}>
                                Share these details with the farm owner to access their dashboard
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                            {/* Farm Code */}
                            <div style={{
                                background: 'var(--gx-surface2)', border: '1px solid var(--gx-border2)',
                                borderRadius: 10, padding: '12px 16px',
                            }}>
                                <div style={{ fontSize: 11, color: 'var(--gx-text3)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Farm Code</div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--gx-text)', fontFamily: 'monospace' }}>{credentials.farmCode}</span>
                                    <button onClick={() => copyToClipboard(credentials.farmCode, 'farmCode')} style={{
                                        background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: copied === 'farmCode' ? 'var(--gx-green)' : 'var(--gx-text2)',
                                    }}>
                                        {copied === 'farmCode' ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Email */}
                            <div style={{
                                background: 'var(--gx-surface2)', border: '1px solid var(--gx-border2)',
                                borderRadius: 10, padding: '12px 16px',
                            }}>
                                <div style={{ fontSize: 11, color: 'var(--gx-text3)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Login Email</div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--gx-text)', fontFamily: 'monospace' }}>{credentials.ownerEmail}</span>
                                    <button onClick={() => copyToClipboard(credentials.ownerEmail, 'email')} style={{
                                        background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: copied === 'email' ? 'var(--gx-green)' : 'var(--gx-text2)',
                                    }}>
                                        {copied === 'email' ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Password */}
                            <div style={{
                                background: 'var(--gx-surface2)', border: '1px solid rgba(234,179,8,0.2)',
                                borderRadius: 10, padding: '12px 16px',
                            }}>
                                <div style={{ fontSize: 11, color: 'var(--gx-text3)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Temporary Password</div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--gx-gold)', fontFamily: 'monospace' }}>{credentials.tempPassword}</span>
                                    <button onClick={() => copyToClipboard(credentials.tempPassword, 'password')} style={{
                                        background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: copied === 'password' ? 'var(--gx-green)' : 'var(--gx-text2)',
                                    }}>
                                        {copied === 'password' ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)',
                            borderRadius: 8, padding: '10px 14px', marginBottom: 20,
                            fontSize: 12, color: 'var(--gx-text2)', lineHeight: 1.5,
                        }}>
                            <AlertTriangle className="inline-block w-4 h-4 mr-1 align-middle" /> Please save these credentials. The landowner should change the temporary password after first login.
                        </div>

                        <button
                            className="gx-btn gx-btn-primary"
                            onClick={() => setCredentials(null)}
                            style={{ width: '100%', justifyContent: 'center', padding: '12px 0', fontSize: 14 }}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
            {/* Header */}
            <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gx-text)', margin: 0 }}>
                    <Wheat className="inline-block w-4 h-4 mr-1 align-middle" /> Farm Registration
                </h1>
                <p style={{ fontSize: 13, color: 'var(--gx-text2)', marginTop: 4 }}>
                    Register a new farm owner and their land details
                </p>
            </div>

            {/* Step Indicator */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                {steps.map((step, idx) => {
                    const isCompleted = step.id < currentStep;
                    const isCurrent = step.id === currentStep;
                    return (
                        <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <button
                                onClick={() => goToStep(step.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '8px 14px', borderRadius: 8,
                                    background: isCurrent ? 'var(--gx-green-dim)' : isCompleted ? 'rgba(34,197,94,0.06)' : 'transparent',
                                    border: isCurrent ? '1px solid var(--gx-green)' : '1px solid transparent',
                                    cursor: step.id <= currentStep ? 'pointer' : 'default',
                                    opacity: step.id > currentStep ? 0.4 : 1,
                                    transition: 'all 0.2s',
                                }}
                            >
                                <span style={{
                                    width: 26, height: 26, borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 12, fontWeight: 700,
                                    background: isCompleted ? 'var(--gx-green)' : isCurrent ? 'var(--gx-green-dim)' : 'var(--gx-border2)',
                                    color: isCompleted ? '#000' : isCurrent ? 'var(--gx-green)' : 'var(--gx-text3)',
                                }}>
                                    {isCompleted ? '✓' : step.id}
                                </span>
                                <span style={{
                                    fontSize: 12.5, fontWeight: isCurrent ? 600 : 400,
                                    color: isCurrent ? 'var(--gx-green)' : isCompleted ? 'var(--gx-text)' : 'var(--gx-text3)',
                                    display: 'none',
                                }}>
                                    {step.title}
                                </span>
                            </button>
                            {idx < steps.length - 1 && (
                                <div style={{
                                    width: 16, height: 2,
                                    background: isCompleted ? 'var(--gx-green)' : 'var(--gx-border2)',
                                    borderRadius: 1,
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Step Card */}
            <div className="gx-card" ref={formRef} style={{ overflow: 'visible' }}>
                <div className="gx-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 20 }}>{currentStepInfo.icon}</span>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gx-text)' }}>
                                Step {currentStep} of 8 — {currentStepInfo.title}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--gx-text2)', marginTop: 2 }}>
                                {stepDescriptions[currentStep - 1]}
                            </div>
                        </div>
                    </div>
                    <span style={{
                        fontSize: 11, fontWeight: 600, color: 'var(--gx-green)',
                        background: 'var(--gx-green-dim)', padding: '4px 10px', borderRadius: 6,
                    }}>
                        {Math.round(((currentStep - 1) / 8) * 100)}% Complete
                    </span>
                </div>

                <div className="gx-card-body" style={{ padding: '20px 24px' }}>
                    {/* Errors */}
                    {errors.length > 0 && (
                        <div style={{
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 8, padding: '12px 16px', marginBottom: 20,
                            display: 'flex', gap: 10, alignItems: 'flex-start',
                        }}>
                            <AlertCircle size={16} style={{ color: 'var(--gx-red)', flexShrink: 0, marginTop: 2 }} />
                            <div>
                                {errors.map((err, i) => (
                                    <div key={i} style={{ fontSize: 13, color: 'var(--gx-red)', lineHeight: 1.6 }}>{err}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step Content */}
                    {renderStep()}
                </div>

                {/* Navigation */}
                <div style={{
                    padding: '16px 24px', borderTop: '1px solid var(--gx-border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <button
                        className="gx-btn gx-btn-ghost"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        style={{ opacity: currentStep === 1 ? 0.3 : 1 }}
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>

                    {currentStep < 8 ? (
                        <button className="gx-btn gx-btn-primary" onClick={nextStep}>
                            Next <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            className="gx-btn gx-btn-primary"
                            onClick={handleSubmit}
                            disabled={submitMutation.isPending}
                            style={{ minWidth: 160 }}
                        >
                            {submitMutation.isPending ? 'Submitting...' : <><CheckCircle2 className="inline-block w-4 h-4 mr-1 align-middle" /> Register Farm</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Step Descriptions ────────────────────────────────────────────────────────
const stepDescriptions = [
    'Farm owner personal and identity information',
    'Land location within Andhra Pradesh',
    'Survey and land classification details',
    'Water sources and irrigation setup',
    'Road, storage, and fencing infrastructure',
    'Bank account details for revenue sharing',
    'Upload identity and land documents',
    'Review all details and confirm registration',
];

// ─── Shared Field Components ──────────────────────────────────────────────────
type SetFn = (key: keyof FormState, value: string | boolean) => void;

function Field({ label, children, required = true, span }: {
    label: string; children: React.ReactNode; required?: boolean; span?: boolean;
}) {
    return (
        <div className="gx-form-group" style={span ? { gridColumn: '1 / -1' } : undefined}>
            <label className="gx-label">
                {label} {required && <span style={{ color: 'var(--gx-red)' }}>*</span>}
            </label>
            {children}
        </div>
    );
}

function TextInput({ value, onChange, placeholder, type = 'text', maxLength }: {
    value: string; onChange: (v: string) => void; placeholder: string;
    type?: string; maxLength?: number;
}) {
    return (
        <input
            className="gx-input"
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
        />
    );
}

function Select({ value, onChange, options, placeholder }: {
    value: string; onChange: (v: string) => void;
    options: { value: string; label: string }[]; placeholder: string;
}) {
    return (
        <select className="gx-select" value={value} onChange={e => onChange(e.target.value)}>
            <option value="">{placeholder}</option>
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    );
}

// ─── STEP 1: Personal Details ─────────────────────────────────────────────────
function Step1({ form, set }: { form: FormState; set: SetFn }) {
    return (
        <div className="gx-form-grid">
            <Field label="Full Name">
                <TextInput value={form.full_name} onChange={v => set('full_name', v)} placeholder="e.g. Ramesh Naidu" />
            </Field>
            <Field label="Mobile Number (WhatsApp)">
                <TextInput value={form.mobile} onChange={v => set('mobile', v.replace(/\D/g, '').slice(0, 10))} placeholder="e.g. 9876543210" type="tel" maxLength={10} />
            </Field>
            <Field label="Email Address">
                <TextInput value={form.email} onChange={v => set('email', v)} placeholder="e.g. ramesh@email.com" type="email" />
            </Field>
            <Field label="Aadhaar Number">
                <TextInput value={form.aadhaar} onChange={v => set('aadhaar', v.replace(/\D/g, '').slice(0, 12))} placeholder="12-digit Aadhaar" maxLength={12} />
            </Field>
            <Field label="PAN Number">
                <TextInput value={form.pan} onChange={v => set('pan', v.toUpperCase().slice(0, 10))} placeholder="e.g. ABCDE1234F" maxLength={10} />
            </Field>
            <Field label="Date of Birth">
                <input className="gx-input" type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
            </Field>
            <Field label="Gender">
                <Select value={form.gender} onChange={v => set('gender', v)} placeholder="Select Gender"
                    options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]}
                />
            </Field>
            <Field label="Occupation">
                <Select value={form.occupation} onChange={v => set('occupation', v)} placeholder="Select Occupation"
                    options={[
                        { value: 'Farmer', label: 'Farmer' },
                        { value: 'Salaried', label: 'Salaried' },
                        { value: 'Business', label: 'Business' },
                        { value: 'NRI', label: 'NRI' },
                    ]}
                />
            </Field>
        </div>
    );
}

// ─── STEP 2: Land Location ────────────────────────────────────────────────────
function Step2({ form, set }: { form: FormState; set: SetFn }) {
    return (
        <div className="gx-form-grid">
            <Field label="Village Name">
                <TextInput value={form.village} onChange={v => set('village', v)} placeholder="e.g. Rajahmundry" />
            </Field>
            <Field label="Mandal / Taluk">
                <TextInput value={form.mandal} onChange={v => set('mandal', v)} placeholder="e.g. Rajanagaram" />
            </Field>
            <Field label="District">
                <Select value={form.district} onChange={v => set('district', v)} placeholder="Select District"
                    options={AP_DISTRICTS.map(d => ({ value: d, label: d }))}
                />
            </Field>
            <Field label="State">
                <input className="gx-input" value="Andhra Pradesh" disabled style={{ opacity: 0.6 }} />
            </Field>
            <Field label="PIN Code">
                <TextInput value={form.pincode} onChange={v => set('pincode', v.replace(/\D/g, '').slice(0, 6))} placeholder="e.g. 533001" maxLength={6} />
            </Field>
            <Field label="Nearest Landmark" required={false}>
                <TextInput value={form.landmark} onChange={v => set('landmark', v)} placeholder="e.g. Near temple, main road junction" />
            </Field>
        </div>
    );
}

// ─── STEP 3: Land Details ─────────────────────────────────────────────────────
function Step3({ form, set }: { form: FormState; set: SetFn }) {
    return (
        <div className="gx-form-grid">
            <Field label="Survey Number">
                <TextInput value={form.survey_number} onChange={v => set('survey_number', v)} placeholder="e.g. 123/4A" />
            </Field>
            <Field label="Total Area (Acres)">
                <TextInput value={form.total_area} onChange={v => set('total_area', v)} placeholder="e.g. 10" type="number" />
            </Field>
            <Field label="Cultivable Area (Acres)">
                <TextInput value={form.cultivable_area} onChange={v => set('cultivable_area', v)} placeholder="e.g. 8.5" type="number" />
            </Field>
            <Field label="Soil Type">
                <Select value={form.soil_type} onChange={v => set('soil_type', v)} placeholder="Select Soil Type"
                    options={[
                        { value: 'Black', label: 'Black (Cotton Soil)' },
                        { value: 'Red', label: 'Red (Laterite)' },
                        { value: 'Sandy', label: 'Sandy' },
                        { value: 'Loamy', label: 'Loamy' },
                    ]}
                />
            </Field>
            <Field label="Topography">
                <Select value={form.topography} onChange={v => set('topography', v)} placeholder="Select Topography"
                    options={[
                        { value: 'Flat', label: 'Flat' },
                        { value: 'Sloped', label: 'Sloped' },
                        { value: 'Hilly', label: 'Hilly' },
                    ]}
                />
            </Field>
            <Field label="Land Ownership">
                <Select value={form.land_ownership} onChange={v => set('land_ownership', v)} placeholder="Select Ownership"
                    options={[
                        { value: 'Own', label: 'Own' },
                        { value: 'Joint', label: 'Joint' },
                        { value: 'Leased', label: 'Leased' },
                        { value: 'Inherited', label: 'Inherited' },
                    ]}
                />
            </Field>
            <Field label="Previous Crop" required={false}>
                <TextInput value={form.previous_crop} onChange={v => set('previous_crop', v)} placeholder="e.g. Paddy, Cotton" />
            </Field>
            <Field label="Years Cultivated" required={false}>
                <TextInput value={form.years_cultivated} onChange={v => set('years_cultivated', v)} placeholder="e.g. 15" type="number" />
            </Field>
        </div>
    );
}

// ─── STEP 4: Water & Irrigation ───────────────────────────────────────────────
function Step4({ form, set }: { form: FormState; set: SetFn }) {
    return (
        <div className="gx-form-grid">
            <Field label="Water Source">
                <Select value={form.water_source} onChange={v => set('water_source', v)} placeholder="Select Water Source"
                    options={[
                        { value: 'Borewell', label: 'Borewell' },
                        { value: 'Canal', label: 'Canal' },
                        { value: 'Tank', label: 'Tank' },
                        { value: 'Rainfed', label: 'Rainfed' },
                    ]}
                />
            </Field>
            <Field label="Irrigation Method">
                <Select value={form.irrigation_method} onChange={v => set('irrigation_method', v)} placeholder="Select Irrigation"
                    options={[
                        { value: 'Drip', label: 'Drip' },
                        { value: 'Sprinkler', label: 'Sprinkler' },
                        { value: 'Flood', label: 'Flood' },
                        { value: 'None', label: 'None' },
                    ]}
                />
            </Field>
            <Field label="Borewell Depth (ft)" required={false}>
                <TextInput value={form.borewell_depth} onChange={v => set('borewell_depth', v)} placeholder="e.g. 200" type="number" />
            </Field>
            <Field label="Electricity">
                <Select value={form.electricity} onChange={v => set('electricity', v)} placeholder="Select Electricity"
                    options={[
                        { value: '3-Phase', label: '3-Phase' },
                        { value: '1-Phase', label: '1-Phase' },
                        { value: 'Solar', label: 'Solar' },
                        { value: 'None', label: 'None' },
                    ]}
                />
            </Field>
        </div>
    );
}

// ─── STEP 5: Infrastructure ──────────────────────────────────────────────────
function Step5({ form, set }: { form: FormState; set: SetFn }) {
    return (
        <div className="gx-form-grid">
            <Field label="Road Access">
                <Select value={form.road_access} onChange={v => set('road_access', v)} placeholder="Select Road Type"
                    options={[
                        { value: 'Paved', label: 'Paved / Tar Road' },
                        { value: 'Kachcha', label: 'Kachcha / Mud Road' },
                        { value: 'None', label: 'No Road' },
                    ]}
                />
            </Field>
            <Field label="Storage Available">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 6 }}>
                    <button
                        className="gx-btn"
                        onClick={() => set('storage_available', true)}
                        style={{
                            background: form.storage_available ? 'var(--gx-green)' : 'transparent',
                            color: form.storage_available ? '#000' : 'var(--gx-text2)',
                            border: `1px solid ${form.storage_available ? 'var(--gx-green)' : 'var(--gx-border2)'}`,
                            padding: '6px 18px', fontSize: 13,
                        }}
                    >Yes</button>
                    <button
                        className="gx-btn"
                        onClick={() => set('storage_available', false)}
                        style={{
                            background: !form.storage_available ? 'var(--gx-red)' : 'transparent',
                            color: !form.storage_available ? '#fff' : 'var(--gx-text2)',
                            border: `1px solid ${!form.storage_available ? 'var(--gx-red)' : 'var(--gx-border2)'}`,
                            padding: '6px 18px', fontSize: 13,
                        }}
                    >No</button>
                </div>
            </Field>
            <Field label="Fencing Done">
                <Select value={form.fencing} onChange={v => set('fencing', v)} placeholder="Select Fencing"
                    options={[
                        { value: 'Full', label: 'Full' },
                        { value: 'Partial', label: 'Partial' },
                        { value: 'None', label: 'None' },
                    ]}
                />
            </Field>
            <Field label="Distance to Market (km)" required={false}>
                <TextInput value={form.distance_to_market} onChange={v => set('distance_to_market', v)} placeholder="e.g. 12" type="number" />
            </Field>
        </div>
    );
}

// ─── STEP 6: Bank Details ─────────────────────────────────────────────────────
function Step6({ form, set }: { form: FormState; set: SetFn }) {
    return (
        <div className="gx-form-grid">
            <Field label="Account Holder Name">
                <TextInput value={form.account_holder} onChange={v => set('account_holder', v)} placeholder="As per bank records" />
            </Field>
            <Field label="Bank Name">
                <TextInput value={form.bank_name} onChange={v => set('bank_name', v)} placeholder="e.g. State Bank of India" />
            </Field>
            <Field label="Branch Name">
                <TextInput value={form.branch_name} onChange={v => set('branch_name', v)} placeholder="e.g. Kakinada Main Branch" />
            </Field>
            <Field label="Account Number">
                <TextInput value={form.account_number} onChange={v => set('account_number', v)} placeholder="Account number" />
            </Field>
            <Field label="IFSC Code">
                <TextInput value={form.ifsc_code} onChange={v => set('ifsc_code', v.toUpperCase().slice(0, 11))} placeholder="e.g. SBIN0001234" maxLength={11} />
            </Field>
            <Field label="Account Type">
                <Select value={form.account_type} onChange={v => set('account_type', v)} placeholder="Select Type"
                    options={[
                        { value: 'Savings', label: 'Savings' },
                        { value: 'Current', label: 'Current' },
                    ]}
                />
            </Field>
            <Field label="UPI ID" required={false} span>
                <TextInput value={form.upi_id} onChange={v => set('upi_id', v)} placeholder="e.g. ramesh@upi (optional)" />
            </Field>
        </div>
    );
}

// ─── STEP 7: Document Upload ──────────────────────────────────────────────────
function FileUpload({ label, accept, maxMB, file, onFile, onClear, required = true }: {
    label: string; accept: string; maxMB: number;
    file: File | null; onFile: (e: ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void; required?: boolean;
}) {
    const ref = useRef<HTMLInputElement>(null);
    return (
        <div className="gx-form-group">
            <label className="gx-label">
                {label} {required && <span style={{ color: 'var(--gx-red)' }}>*</span>}
                <span style={{ fontWeight: 400, textTransform: 'none', marginLeft: 6, color: 'var(--gx-text3)' }}>
                    (max {maxMB}MB)
                </span>
            </label>
            {file ? (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'var(--gx-surface2)', border: '1px solid var(--gx-border2)',
                    borderRadius: 8, padding: '10px 14px',
                }}>
                    <FileText size={16} style={{ color: 'var(--gx-green)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--gx-text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--gx-text2)', flexShrink: 0 }}>
                        {(file.size / 1024 / 1024).toFixed(1)}MB
                    </span>
                    <button onClick={() => { onClear(); if (ref.current) ref.current.value = ''; }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                        <X size={14} style={{ color: 'var(--gx-red)' }} />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => ref.current?.click()}
                    style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: 6, padding: '20px 16px', borderRadius: 8,
                        border: '2px dashed var(--gx-border2)', background: 'transparent',
                        cursor: 'pointer', transition: 'border-color 0.2s',
                        color: 'var(--gx-text2)', fontSize: 13, width: '100%',
                    }}
                    onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--gx-green)')}
                    onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--gx-border2)')}
                >
                    <Upload size={20} />
                    Click to upload
                </button>
            )}
            <input ref={ref} type="file" accept={accept} onChange={onFile} style={{ display: 'none' }} />
        </div>
    );
}

function Step7({ files, handleFile, setFiles }: {
    files: { aadhaar_doc: File | null; passbook_doc: File | null; profile_photo: File | null; land_doc: File | null };
    handleFile: (key: keyof typeof files, maxMB: number) => (e: ChangeEvent<HTMLInputElement>) => void;
    setFiles: React.Dispatch<React.SetStateAction<typeof files>>;
}) {
    return (
        <div className="gx-form-grid">
            <FileUpload label="Aadhaar Card" accept=".pdf,.jpg,.jpeg,.png" maxMB={5}
                file={files.aadhaar_doc} onFile={handleFile('aadhaar_doc', 5)}
                onClear={() => setFiles(f => ({ ...f, aadhaar_doc: null }))} />
            <FileUpload label="Pattadar Passbook" accept=".pdf,.jpg,.jpeg,.png" maxMB={5}
                file={files.passbook_doc} onFile={handleFile('passbook_doc', 5)}
                onClear={() => setFiles(f => ({ ...f, passbook_doc: null }))} />
            <FileUpload label="Profile Photo" accept=".jpg,.jpeg,.png" maxMB={2}
                file={files.profile_photo} onFile={handleFile('profile_photo', 2)}
                onClear={() => setFiles(f => ({ ...f, profile_photo: null }))} />
            <FileUpload label="Land Document" accept=".pdf,.jpg,.jpeg,.png" maxMB={5} required={false}
                file={files.land_doc} onFile={handleFile('land_doc', 5)}
                onClear={() => setFiles(f => ({ ...f, land_doc: null }))} />
        </div>
    );
}

// ─── STEP 8: Confirmation ─────────────────────────────────────────────────────
function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--gx-border)' }}>
            <span style={{ fontSize: 12.5, color: 'var(--gx-text2)' }}>{label}</span>
            <span style={{ fontSize: 12.5, color: 'var(--gx-text)', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value || '—'}</span>
        </div>
    );
}

function Step8({ form, files, set }: { form: FormState; files: { aadhaar_doc: File | null; passbook_doc: File | null; profile_photo: File | null; land_doc: File | null }; set: SetFn }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Personal */}
            <SummarySection title=<><UserRound className="inline-block w-4 h-4 mr-1 align-middle" /> Personal Details</>>
                <SummaryRow label="Full Name" value={form.full_name} />
                <SummaryRow label="Mobile" value={form.mobile} />
                <SummaryRow label="Email" value={form.email} />
                <SummaryRow label="Aadhaar" value={form.aadhaar ? `XXXX-XXXX-${form.aadhaar.slice(-4)}` : ''} />
                <SummaryRow label="PAN" value={form.pan} />
                <SummaryRow label="DOB" value={form.dob} />
                <SummaryRow label="Gender" value={form.gender} />
                <SummaryRow label="Occupation" value={form.occupation} />
            </SummarySection>

            {/* Location */}
            <SummarySection title=<><Home className="inline-block w-4 h-4 mr-1 align-middle" /> Land Location</>>
                <SummaryRow label="Village" value={form.village} />
                <SummaryRow label="Mandal" value={form.mandal} />
                <SummaryRow label="District" value={form.district} />
                <SummaryRow label="State" value={form.state} />
                <SummaryRow label="PIN Code" value={form.pincode} />
                <SummaryRow label="Landmark" value={form.landmark} />
            </SummarySection>

            {/* Land */}
            <SummarySection title=<><Ruler className="inline-block w-4 h-4 mr-1 align-middle" /> Land Details</>>
                <SummaryRow label="Survey No." value={form.survey_number} />
                <SummaryRow label="Total Area" value={form.total_area ? `${form.total_area} Acres` : ''} />
                <SummaryRow label="Cultivable Area" value={form.cultivable_area ? `${form.cultivable_area} Acres` : ''} />
                <SummaryRow label="Soil Type" value={form.soil_type} />
                <SummaryRow label="Topography" value={form.topography} />
                <SummaryRow label="Ownership" value={form.land_ownership} />
                <SummaryRow label="Previous Crop" value={form.previous_crop} />
                <SummaryRow label="Years Cultivated" value={form.years_cultivated} />
            </SummarySection>

            {/* Water */}
            <SummarySection title=<><Droplets className="inline-block w-4 h-4 mr-1 align-middle" /> Water & Irrigation</>>
                <SummaryRow label="Water Source" value={form.water_source} />
                <SummaryRow label="Irrigation" value={form.irrigation_method} />
                <SummaryRow label="Borewell Depth" value={form.borewell_depth ? `${form.borewell_depth} ft` : ''} />
                <SummaryRow label="Electricity" value={form.electricity} />
            </SummarySection>

            {/* Infrastructure */}
            <SummarySection title=<><Hammer className="inline-block w-4 h-4 mr-1 align-middle" /> Infrastructure</>>
                <SummaryRow label="Road Access" value={form.road_access} />
                <SummaryRow label="Storage" value={form.storage_available ? 'Yes' : 'No'} />
                <SummaryRow label="Fencing" value={form.fencing} />
                <SummaryRow label="Distance to Market" value={form.distance_to_market ? `${form.distance_to_market} km` : ''} />
            </SummarySection>

            {/* Bank */}
            <SummarySection title=<><Landmark className="inline-block w-4 h-4 mr-1 align-middle" /> Bank Details</>>
                <SummaryRow label="Account Holder" value={form.account_holder} />
                <SummaryRow label="Bank" value={form.bank_name} />
                <SummaryRow label="Branch" value={form.branch_name} />
                <SummaryRow label="Account No." value={form.account_number ? `XXXX${form.account_number.slice(-4)}` : ''} />
                <SummaryRow label="IFSC" value={form.ifsc_code} />
                <SummaryRow label="Type" value={form.account_type} />
                <SummaryRow label="UPI" value={form.upi_id} />
            </SummarySection>

            {/* Documents */}
            <SummarySection title=<><Paperclip className="inline-block w-4 h-4 mr-1 align-middle" /> Documents</>>
                <SummaryRow label="Aadhaar Card" value={files.aadhaar_doc?.name || 'Not uploaded'} />
                <SummaryRow label="Pattadar Passbook" value={files.passbook_doc?.name || 'Not uploaded'} />
                <SummaryRow label="Profile Photo" value={files.profile_photo?.name || 'Not uploaded'} />
                <SummaryRow label="Land Document" value={files.land_doc?.name || 'Not uploaded'} />
            </SummarySection>

            {/* Revenue Split */}
            <div style={{
                background: 'var(--gx-green-dim)', border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: 10, padding: '16px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gx-text)' }}>Revenue Split Agreement</div>
                    <div style={{ fontSize: 12, color: 'var(--gx-text2)', marginTop: 2 }}>As per GreenX standard contract</div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--gx-green)' }}>80%</div>
                        <div style={{ fontSize: 10, color: 'var(--gx-text2)', textTransform: 'uppercase' }}>Farmer</div>
                    </div>
                    <div style={{ width: 1, background: 'var(--gx-border2)' }} />
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--gx-gold)' }}>20%</div>
                        <div style={{ fontSize: 10, color: 'var(--gx-text2)', textTransform: 'uppercase' }}>GreenX</div>
                    </div>
                </div>
            </div>

            {/* Terms */}
            <label style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
                background: 'var(--gx-surface2)', borderRadius: 10, padding: '14px 16px',
                border: form.agree_terms ? '1px solid var(--gx-green)' : '1px solid var(--gx-border2)',
                transition: 'border-color 0.2s',
            }}>
                <input
                    type="checkbox"
                    checked={form.agree_terms as boolean}
                    onChange={e => set('agree_terms', e.target.checked)}
                    style={{ marginTop: 2, accentColor: 'var(--gx-green)', width: 16, height: 16 }}
                />
                <div>
                    <div style={{ fontSize: 13.5, color: 'var(--gx-text)', fontWeight: 500 }}>
                        I agree to the Terms & Conditions
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gx-text2)', marginTop: 3, lineHeight: 1.5 }}>
                        By registering, the farm owner agrees to the GreenX revenue sharing model (80/20 split),
                        data privacy policy, and standard agricultural service agreement.
                    </div>
                </div>
            </label>
        </div>
    );
}

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{
            background: 'var(--gx-surface2)', borderRadius: 10,
            border: '1px solid var(--gx-border)', overflow: 'hidden',
        }}>
            <div style={{
                padding: '10px 16px', borderBottom: '1px solid var(--gx-border)',
                fontSize: 13, fontWeight: 600, color: 'var(--gx-text)',
            }}>
                {title}
            </div>
            <div style={{ padding: '4px 16px 8px' }}>{children}</div>
        </div>
    );
}
