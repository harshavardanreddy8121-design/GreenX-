import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, User } from 'lucide-react';
import { GreenXLogo } from '@/components/GreenXLogo';
import { toast } from 'sonner';

const landSizeOptions = [
    '1-2 acres',
    '2-5 acres',
    '5-10 acres',
    '10+ acres',
];

export default function LandRegister() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        location: '',
        landSize: '',
        message: '',
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.fullName.trim() || !form.phone.trim() || !form.location.trim() || !form.landSize.trim()) {
            toast.error('Please fill all required fields.');
            return;
        }

        toast.success('Land details submitted successfully. Our team will contact you soon.');
        setForm({ fullName: '', phone: '', location: '', landSize: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur px-4 py-3">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <GreenXLogo size="sm" />
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Register Your Land</h1>
                    <p className="text-sm text-muted-foreground mb-6">
                        Share basic land details and our GreenX team will connect with you.
                    </p>

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">1. Name</label>
                            <div className="relative">
                                <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    value={form.fullName}
                                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                                    placeholder="Landowner full name"
                                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">2. Phone Number</label>
                            <div className="relative">
                                <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    value={form.phone}
                                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                                    placeholder="Most important"
                                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">3. Village / Location</label>
                            <div className="relative">
                                <MapPin className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    value={form.location}
                                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                                    placeholder="Where the land is located"
                                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">4. Land Size</label>
                            <select
                                value={form.landSize}
                                onChange={(e) => setForm((f) => ({ ...f, landSize: e.target.value }))}
                                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm"
                            >
                                <option value="">Select land size</option>
                                {landSizeOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">5. Optional Message</label>
                            <textarea
                                value={form.message}
                                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                                placeholder="Tell us about your land (optional)"
                                rows={4}
                                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full btn-gradient text-primary-foreground py-3 rounded-lg text-sm font-semibold"
                        >
                            Submit Land Details
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
