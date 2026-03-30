import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GreenXLogo } from '@/components/GreenXLogo';
import { useAuth } from "@/contexts/AuthContext";
import { Sprout, FlaskConical, Wheat, Smartphone, Ship, Microscope, DollarSign, Map, HardHat, BarChart3, Briefcase, Building2, ClipboardList, MapPin } from 'lucide-react';

const roleRoutes: Record<string, string> = {
    admin: "/admin/users",
    fieldmanager: "/field-manager",
    expert: "/expert",
    landowner: "/landowner",
    worker: "/worker",
};

export default function LandingPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('t1');
    const [showPlant, setShowPlant] = useState(false);
    const cursorRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);

    // Redirect authenticated users to their dashboard
    useEffect(() => {
        if (user) {
            const roleLower = user.role?.toLowerCase() || "";
            const route = roleRoutes[roleLower];
            if (route) {
                navigate(route);
            }
        }
    }, [user, navigate]);

    // Trigger plant animation
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowPlant(true);
            setTimeout(() => setShowPlant(false), 5000);
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Add landing-active class to body for custom styles
        document.body.classList.add('landing-active');

        let mx = 0, my = 0, rx = 0, ry = 0;

        const handleMouseMove = (e: MouseEvent) => {
            mx = e.clientX; my = e.clientY;
            if (cursorRef.current) {
                cursorRef.current.style.left = mx + 'px';
                cursorRef.current.style.top = my + 'px';
            }
        };

        const animRing = () => {
            rx += (mx - rx) * 0.12;
            ry += (my - ry) * 0.12;
            if (ringRef.current) {
                ringRef.current.style.left = rx + 'px';
                ringRef.current.style.top = ry + 'px';
            }
            requestAnimationFrame(animRing);
        };

        document.addEventListener('mousemove', handleMouseMove);
        animRing();

        // Scroll reveal
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                }
            });
        }, { threshold: 0.12 });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

        // Navbar scroll
        const handleScroll = () => {
            const nav = document.getElementById('navbar');
            if (nav) {
                nav.classList.toggle('scrolled', window.scrollY > 60);
            }
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            document.body.classList.remove('landing-active');
            document.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const showToast = (msg: string) => {
        const t = document.getElementById('toast');
        const tmsg = document.getElementById('toast-msg');
        if (t && tmsg) {
            tmsg.textContent = msg;
            t.style.transform = 'translateY(0)';
            t.style.opacity = '1';
            setTimeout(() => {
                t.style.transform = 'translateY(80px)';
                t.style.opacity = '0';
            }, 4000);
        }
    };

    return (
        <div className="landing-page">
            <style>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        
        :root {
          --black:    #060a07;
          --deep:     #0a0f0c;
          --surface:  #0f1a12;
          --surface2: #152018;
          --green:    #22c55e;
          --green2:   #16a34a;
          --green3:   #4ade80;
          --neon-green: #39FF14;
          --green-dim: rgba(34,197,94,0.12);
          --gold:     #d4a847;
          --gold2:    #f0c55a;
          --cream:    #f5f0e8;
          --white:    #ffffff;
          --text:     #e2ede6;
          --text2:    #9abfaa;
          --text3:    #6b9a78;
          --border:   rgba(34,197,94,0.12);
          --border2:  rgba(34,197,94,0.25);
        }

        html { scroll-behavior: smooth; }

        body.landing-active {
          font-family: 'Outfit', sans-serif;
          background: var(--black);
          color: var(--text);
          overflow-x: hidden;
          cursor: none;
        }

        .cursor {
          position: fixed;
          width: 10px; height: 10px;
          background: var(--green);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          transition: transform 0.1s, width 0.2s, height 0.2s, opacity 0.2s;
          mix-blend-mode: screen;
        }
        .cursor-ring {
          position: fixed;
          width: 36px; height: 36px;
          border: 1px solid rgba(34,197,94,0.4);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9998;
          transform: translate(-50%, -50%);
          transition: transform 0.15s ease, width 0.3s, height 0.3s;
        }

        body.landing-active::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 1000;
          opacity: 0.4;
        }

        nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 500;
          padding: 20px 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.4s;
        }
        nav.scrolled {
          background: rgba(6,10,7,0.92);
          backdrop-filter: blur(20px);
          padding: 14px 60px;
          border-bottom: 1px solid var(--border);
        }
        .nav-links {
          display: flex;
          gap: 36px;
          list-style: none;
        }
        .nav-links a {
          font-size: 13.5px;
          font-weight: 500;
          color: #9abfaa;
          text-decoration: none;
          letter-spacing: 0.3px;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: var(--green); }
        .nav-cta {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .btn-nav-ghost {
          padding: 9px 20px;
          border: 1px solid var(--border2);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text2);
          background: transparent;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          transition: all 0.2s;
          text-decoration: none;
        }
        .btn-nav-ghost:hover { border-color: var(--green); color: var(--green); }
        .btn-nav-primary {
          padding: 9px 22px;
          background: var(--green);
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          color: #000;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          transition: all 0.2s;
          text-decoration: none;
        }
        .btn-nav-primary:hover { background: var(--green3); transform: translateY(-1px); }

        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          position: relative;
                    padding: 88px 40px 80px;
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 40%,
              rgba(34,197,94,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 20% 80%,
              rgba(212,168,71,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 80% 20%,
              rgba(34,197,94,0.05) 0%, transparent 60%);
        }

        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(34,197,94,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,197,94,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%);
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: float 8s ease-in-out infinite;
        }
        .orb1 {
          width: 400px; height: 400px;
          background: rgba(34,197,94,0.08);
          top: -100px; left: -100px;
          animation-delay: 0s;
        }
        .orb2 {
          width: 300px; height: 300px;
          background: rgba(212,168,71,0.06);
          bottom: -50px; right: -50px;
          animation-delay: -3s;
        }
        .orb3 {
          width: 200px; height: 200px;
          background: rgba(34,197,94,0.05);
          top: 40%; right: 10%;
          animation-delay: -5s;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 16px;
          background: var(--green-dim);
          border: 1px solid var(--border2);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: var(--green);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 28px;
          position: relative;
          z-index: 2;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.2s both;
        }
        .eyebrow-dot {
          width: 6px; height: 6px;
          background: var(--green);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(52px, 8vw, 96px);
          font-weight: 900;
          line-height: 1.0;
          letter-spacing: -2px;
          color: var(--white);
          max-width: 900px;
          position: relative;
          z-index: 2;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.4s both;
        }
        .hero-title em {
          font-style: italic;
          color: var(--green);
          position: relative;
        }
        .hero-title em::after {
          content: '';
          position: absolute;
          bottom: 4px; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--green), transparent);
          border-radius: 2px;
        }
        .hero-title .gold-word { color: var(--gold); }

        .hero-sub {
          font-size: 18px;
          font-weight: 400;
          color: #b0ceba;
          max-width: 560px;
          line-height: 1.7;
          margin-top: 24px;
          position: relative;
          z-index: 2;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.6s both;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          margin-top: 40px;
          position: relative;
          z-index: 2;
          opacity: 0;
          animation: fadeUp 0.8s ease 0.8s both;
          flex-wrap: wrap;
          justify-content: center;
        }
        .btn-hero-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          background: var(--green);
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          color: #000;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          text-decoration: none;
          transition: all 0.25s;
          box-shadow: 0 0 40px rgba(34,197,94,0.25);
        }
        .btn-hero-primary:hover {
          background: var(--green3);
          transform: translateY(-2px);
          box-shadow: 0 0 60px rgba(34,197,94,0.4);
        }
        .btn-hero-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          background: transparent;
          border: 1px solid var(--border2);
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          text-decoration: none;
          transition: all 0.25s;
        }
        .btn-hero-secondary:hover {
          border-color: var(--green);
          color: var(--green);
          background: var(--green-dim);
        }

        .hero-stats {
          display: flex;
          gap: 48px;
          margin-top: 64px;
          position: relative;
          z-index: 2;
          opacity: 0;
          animation: fadeUp 0.8s ease 1s both;
          flex-wrap: wrap;
          justify-content: center;
        }
        .hero-stat {
          text-align: center;
        }
        .hero-stat-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 36px;
          font-weight: 500;
          color: var(--white);
          line-height: 1;
        }
        .hero-stat-num span { color: var(--green); }
        .hero-stat-label {
          font-size: 12px;
          color: #8fb8a0;
          margin-top: 6px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .hero-stat-divider {
          width: 1px;
          background: var(--border);
          align-self: stretch;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        section {
          padding: 100px 60px;
          position: relative;
        }
        .section-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--green);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .section-eyebrow::before {
          content: '';
          width: 24px; height: 1px;
          background: var(--green);
        }
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -1px;
          color: var(--white);
        }
        .section-title em { font-style: italic; color: var(--green); }
        .section-sub {
          font-size: 16px;
          color: #9abfaa;
          line-height: 1.7;
          max-width: 500px;
          margin-top: 16px;
        }

        .reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 900px) {
          section { padding: 70px 28px; }
          nav { padding: 16px 24px; }
          nav.scrolled { padding: 12px 24px; }
                    .hero { padding: 74px 24px 60px; }
          .nav-links { display: none; }
        }
      `}</style>

            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

            {/* CURSOR */}
            <div className="cursor" ref={cursorRef} />
            <div className="cursor-ring" ref={ringRef} />

            {/* ══ NAVBAR ══ */}
            <nav id="navbar">
                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <GreenXLogo size="sm" />
                </div>
                <ul className="nav-links">
                    <li><a href="#problem">Problem</a></li>
                    <li><a href="#solution">Solution</a></li>
                    <li><a href="#platform">Platform</a></li>
                    <li><a href="#roles">Roles</a></li>
                    <li><a href="#revenue">Business</a></li>
                </ul>
                <div className="nav-cta">
                    <button className="btn-nav-ghost" onClick={() => navigate('/login')}>Sign In</button>
                    <button className="btn-nav-primary" onClick={() => navigate('/land-register')}>Get Started →</button>
                </div>
            </nav>

            {/* ══ HERO ══ */}
            <section className="hero" id="home">
                <div className="hero-bg"></div>
                <div className="hero-grid"></div>
                <div className="orb orb1"></div>
                <div className="orb orb2"></div>
                <div className="orb orb3"></div>

                <div className="hero-eyebrow">
                    <div className="eyebrow-dot"></div>
                    INDIA'S FIRST FARM OPERATING SYSTEM
                </div>

                <h1 className="text-7xl md:text-8xl font-extrabold tracking-[0.15em] leading-tight flex justify-center items-center gap-2 relative z-10" style={{ marginBottom: '28px' }}>
                    <span className="text-[#39FF14] drop-shadow-[0_0_25px_#39FF14]">GREEN</span>
                    <span className="inline-block text-7xl md:text-8xl relative overflow-visible" style={{ width: '1em', height: '1.2em' }}>
                        <span
                            className={`absolute inset-0 flex items-center justify-center text-white transition-all duration-[5000ms] ${showPlant ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}
                        >
                            X
                        </span>
                        {/* Soil Line */}
                        <span
                            className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-800 to-transparent transition-all duration-500 ${showPlant ? 'opacity-100' : 'opacity-0'}`}
                            style={{ transform: showPlant ? 'translateY(0)' : 'translateY(20px)' }}
                        />
                        {/* Rising Plant */}
                        <span
                            className={`absolute inset-0 flex items-end justify-center text-[#39FF14] transition-all duration-[5000ms] ${showPlant ? 'opacity-100' : 'opacity-0'}`}
                            style={{
                                transform: showPlant ? 'translateY(-10%)' : 'translateY(100%)',
                                transitionDelay: showPlant ? '400ms' : '0ms'
                            }}
                        >
                            <Sprout className="w-14 h-14 md:w-20 md:h-20" strokeWidth={2.5} />
                        </span>
                    </span>
                </h1>

                <div className="hero-actions">
                    <button className="btn-hero-primary" onClick={() => navigate('/land-register')}>
                        <Sprout className="inline-block w-5 h-5 mr-1 align-middle" /> List Your Land
                    </button>
                    <a href="#solution" className="btn-hero-secondary">
                        ▶ See How It Works
                    </a>
                </div>
            </section>

            <div style={{
                background: 'var(--surface)',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                padding: '16px 0',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <div style={{
                    display: 'flex',
                    gap: 0,
                    animation: 'marquee 30s linear infinite',
                    width: 'max-content'
                }}>
                    {[...Array(16)].map((_, i) => {
                        const items = ['Clinical Soil Testing', 'Precision Agriculture', 'Real-Time Dashboard', 'Direct International Export', 'Expert Agronomists', '70% Revenue to Landowner', 'GPS Field Tracking', 'VRT Technology'];
                        return (
                            <div key={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '0 32px',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: 'var(--text3)',
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                                whiteSpace: 'nowrap'
                            }}>
                                <span style={{ color: 'var(--green)', fontSize: '16px' }}>
                                    {items[i % items.length].split(' ')[0]}
                                </span>
                                {items[i % items.length].substring(items[i % items.length].indexOf(' ') + 1)}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ══ PROBLEM SECTION ══ */}
            <section id="problem" className="reveal" style={{ background: 'var(--deep)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="section-eyebrow">The Crisis</div>
                    <h2 className="section-title">What India's Farmers <em>Actually Face</em></h2>
                    <p className="section-sub">
                        While India dreams of doubling farmer income, reality shows fragmented land, absent owners, and zero professional infrastructure.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '56px' }}>
                        {[
                            { num: '86%', label: 'Holdings < 5 Acres', desc: 'Below economic viability threshold' },
                            { num: '40%', label: 'Post-Harvest Loss', desc: 'Due to middlemen & poor handling' },
                            { num: '60%', label: 'Migrant Landowners', desc: 'Farms managed by relatives or abandoned' },
                            { num: '₹8-12K', label: 'Per Acre Revenue', desc: 'Vs. ₹40K+ in professional farming' }
                        ].map((item, i) => (
                            <div key={i} style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '16px',
                                padding: '32px',
                                textAlign: 'center',
                                transition: 'all 0.3s'
                            }}>
                                <div style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '48px',
                                    fontWeight: 700,
                                    color: 'var(--green)',
                                    lineHeight: 1,
                                    marginBottom: '12px'
                                }}>{item.num}</div>
                                <div style={{
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    color: 'var(--white)',
                                    marginBottom: '8px'
                                }}>{item.label}</div>
                                <div style={{
                                    fontSize: '13px',
                                    color: 'var(--text3)',
                                    lineHeight: 1.5
                                }}>{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ SOLUTION SECTION ══ */}
            <section id="solution" className="reveal">
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="section-eyebrow">The Answer</div>
                    <h2 className="section-title">GreenX <em>Operates</em> Your Farm</h2>
                    <p className="section-sub">
                        We don't just "connect" or "advise." We physically takeover your land, run it like a professional operation, and share profits.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '56px' }}>
                        {[
                            { icon: <FlaskConical size={36} strokeWidth={1.5} />, title: 'Clinical Soil Testing', desc: 'NPK, pH, micronutrient analysis before every season' },
                            { icon: <Wheat size={36} strokeWidth={1.5} />, title: 'Precision Agriculture', desc: 'Variable Rate Technology, GPS tracking, optimized inputs' },
                            { icon: <HardHat size={36} strokeWidth={1.5} />, title: 'Professional Workforce', desc: 'Trained workers + expert agronomists on payroll' },
                            { icon: <Ship size={36} strokeWidth={1.5} />, title: 'Direct Export', desc: 'Bypass 5 middlemen, sell to international buyers' }
                        ].map((item, i) => (
                            <div key={i} style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '16px',
                                padding: '32px',
                                transition: 'all 0.3s'
                            }}>
                                <div style={{ fontSize: '40px', marginBottom: '16px' }}>{item.icon}</div>
                                <div style={{
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    color: 'var(--white)',
                                    marginBottom: '10px'
                                }}>{item.title}</div>
                                <div style={{
                                    fontSize: '14px',
                                    color: 'var(--text2)',
                                    lineHeight: 1.6
                                }}>{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ HOW IT WORKS ══ */}
            <section className="reveal" style={{ background: 'var(--deep)' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                    <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Process</div>
                    <h2 className="section-title">How It Works: <em>5 Steps</em></h2>

                    <div style={{ marginTop: '64px', textAlign: 'left' }}>
                        {[
                            { num: '01', title: 'Register Land', desc: 'Submit land docs (7/12, survey map). 48hr verification.' },
                            { num: '02', title: 'Soil Lab Test', desc: 'Our team conducts clinical NPK, pH, micronutrient analysis.' },
                            { num: '03', title: 'Crop Plan Assigned', desc: 'Expert agronomist creates custom crop calendar + input schedule.' },
                            { num: '04', title: 'Farm Operations', desc: 'Our workers execute: planting, irrigation, pest control, harvest.' },
                            { num: '05', title: 'Export & Payment', desc: 'Produce graded, packed, exported. 70% profit to your account.' }
                        ].map((step, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                gap: '28px',
                                marginBottom: '40px',
                                alignItems: 'flex-start'
                            }}>
                                <div style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '56px',
                                    fontWeight: 700,
                                    color: 'var(--border2)',
                                    lineHeight: 1,
                                    minWidth: '100px'
                                }}>{step.num}</div>
                                <div style={{ flex: 1, paddingTop: '8px' }}>
                                    <div style={{
                                        fontSize: '24px',
                                        fontWeight: 700,
                                        color: 'var(--white)',
                                        marginBottom: '8px'
                                    }}>{step.title}</div>
                                    <div style={{
                                        fontSize: '15px',
                                        color: 'var(--text2)',
                                        lineHeight: 1.7
                                    }}>{step.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ AGRI HOSPITAL MODEL ══ */}
            <section className="reveal">
                <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                    <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Paradigm Shift</div>
                    <h2 className="section-title">The "<em>Agri-Hospital</em>" Model</h2>
                    <p className="section-sub" style={{ margin: '16px auto 0' }}>
                        Just as you don't perform surgery on yourself, you shouldn't manage your own farm without professional infrastructure.
                    </p>

                    <div style={{
                        marginTop: '56px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border2)',
                        borderRadius: '20px',
                        padding: '48px',
                        textAlign: 'left'
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '32px', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '32px', marginBottom: '12px' }}><Building2 size={32} strokeWidth={1.5} /></div>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--white)', marginBottom: '8px' }}>
                                    Hospital
                                </div>
                                <ul style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.9', paddingLeft: '20px', margin: 0 }}>
                                    <li>Professional doctors</li>
                                    <li>Clinical equipment</li>
                                    <li>Diagnostic labs</li>
                                    <li>Standardized treatment</li>
                                    <li>Insurance-covered</li>
                                </ul>
                            </div>

                            <div style={{
                                width: '2px',
                                height: '180px',
                                background: 'var(--border2)'
                            }}></div>

                            <div>
                                <div style={{ fontSize: '32px', marginBottom: '12px' }}><Wheat size={32} strokeWidth={1.5} /></div>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--green)', marginBottom: '8px' }}>
                                    GreenX Farm
                                </div>
                                <ul style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.9', paddingLeft: '20px', margin: 0 }}>
                                    <li>Expert agronomists</li>
                                    <li>Precision agriculture tools</li>
                                    <li>Soil testing labs</li>
                                    <li>Scientific crop plans</li>
                                    <li>Performance guaranteed</li>
                                </ul>
                            </div>
                        </div>

                        <div style={{
                            marginTop: '32px',
                            padding: '20px',
                            background: 'var(--green-dim)',
                            border: '1px solid var(--border2)',
                            borderRadius: '12px',
                            fontSize: '14px',
                            color: 'var(--text)',
                            textAlign: 'center',
                            fontWeight: 500
                        }}>
                            ✓ You own the asset (land/body). We provide the expertise & infrastructure.
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ PLATFORM PREVIEW ══ */}
            <section id="platform" className="reveal" style={{ background: 'var(--deep)', paddingTop: '120px', paddingBottom: '120px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="section-eyebrow" style={{ justifyContent: 'center', display: 'flex' }}>Technology</div>
                    <h2 className="section-title" style={{ textAlign: 'center' }}>Your Farm, <em>Digitally Managed</em></h2>

                    <div style={{ marginTop: '48px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', padding: '6px', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            {[
                                { id: 't1', label: 'Worker View' },
                                { id: 't2', label: 'Expert View' },
                                { id: 't3', label: 'Owner View' },
                                { id: 't4', label: 'Manager View' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        padding: '10px 20px',
                                        border: 'none',
                                        borderRadius: '8px',
                                        background: activeTab === tab.id ? 'var(--green)' : 'transparent',
                                        color: activeTab === tab.id ? '#000' : 'var(--text2)',
                                        fontFamily: "'Outfit', sans-serif",
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div style={{
                            marginTop: '40px',
                            background: 'var(--surface)',
                            border: '1px solid var(--border2)',
                            borderRadius: '20px',
                            padding: '48px',
                            minHeight: '400px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {activeTab === 't1' && (
                                <div style={{ maxWidth: '600px', textAlign: 'left' }}>
                                    <div style={{ fontSize: '40px', marginBottom: '20px' }}><HardHat size={40} strokeWidth={1.5} /></div>
                                    <h3 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--white)', marginBottom: '12px' }}>
                                        Worker Dashboard
                                    </h3>
                                    <p style={{ fontSize: '15px', color: 'var(--text2)', lineHeight: 1.7, marginBottom: '24px' }}>
                                        Field workers receive daily tasks (GPS-tagged), log activities, capture photos, and report issues in real-time via mobile app.
                                    </p>
                                    <ul style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.8, paddingLeft: '20px' }}>
                                        <li>Task checklist with photos</li>
                                        <li>GPS field verification</li>
                                        <li>Weather alerts</li>
                                        <li>Equipment request</li>
                                    </ul>
                                </div>
                            )}
                            {activeTab === 't2' && (
                                <div style={{ maxWidth: '600px', textAlign: 'left' }}>
                                    <div style={{ fontSize: '40px', marginBottom: '20px' }}><Microscope size={40} strokeWidth={1.5} /></div>
                                    <h3 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--white)', marginBottom: '12px' }}>
                                        Expert Agronomist Panel
                                    </h3>
                                    <p style={{ fontSize: '15px', color: 'var(--text2)', lineHeight: 1.7, marginBottom: '24px' }}>
                                        Agronomists review soil data, create seasonal crop plans, prescribe treatments, and remotely monitor farm health metrics.
                                    </p>
                                    <ul style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.8, paddingLeft: '20px' }}>
                                        <li>Soil lab results dashboard</li>
                                        <li>Crop calendar builder</li>
                                        <li>Pest/disease diagnosis (AI-assisted)</li>
                                        <li>Input prescription system</li>
                                    </ul>
                                </div>
                            )}
                            {activeTab === 't3' && (
                                <div style={{ maxWidth: '600px', textAlign: 'left' }}>
                                    <div style={{ fontSize: '40px', marginBottom: '20px' }}><BarChart3 size={40} strokeWidth={1.5} /></div>
                                    <h3 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--white)', marginBottom: '12px' }}>
                                        Landowner Portal
                                    </h3>
                                    <p style={{ fontSize: '15px', color: 'var(--text2)', lineHeight: 1.7, marginBottom: '24px' }}>
                                        Track your farm's performance from anywhere: live yield estimates, expense breakdown, payment history, and live field camera feeds.
                                    </p>
                                    <ul style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.8, paddingLeft: '20px' }}>
                                        <li>Real-time revenue tracker</li>
                                        <li>Detailed expense reports</li>
                                        <li>Live camera feeds (coming soon)</li>
                                        <li>Profit share transactions</li>
                                    </ul>
                                </div>
                            )}
                            {activeTab === 't4' && (
                                <div style={{ maxWidth: '600px', textAlign: 'left' }}>
                                    <div style={{ fontSize: '40px', marginBottom: '20px' }}><Briefcase size={40} strokeWidth={1.5} /></div>
                                    <h3 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--white)', marginBottom: '12px' }}>
                                        Field Manager Command Center
                                    </h3>
                                    <p style={{ fontSize: '15px', color: 'var(--text2)', lineHeight: 1.7, marginBottom: '24px' }}>
                                        Managers oversee multiple farms: assign workers, approve expenses, coordinate logistics, resolve escalations, and report to HQ.
                                    </p>
                                    <ul style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.8, paddingLeft: '20px' }}>
                                        <li>Multi-farm overview map</li>
                                        <li>Worker allocation & performance</li>
                                        <li>Expense approval workflow</li>
                                        <li>Issue escalation system</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ ROLES SECTION ══ */}
            <section id="roles" className="reveal">
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="section-eyebrow" style={{ justifyContent: 'center', display: 'flex' }}>Stakeholders</div>
                    <h2 className="section-title" style={{ textAlign: 'center' }}>Who Uses <em>GreenX</em>?</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px', marginTop: '56px' }}>
                        {[
                            { icon: <Building2 size={40} strokeWidth={1.5} />, title: 'Landowners', desc: 'Professionals in cities with inherited/idle farmland. Want passive farm income without relocating.' },
                            { icon: <HardHat size={40} strokeWidth={1.5} />, title: 'Field Workers', desc: 'On-ground labor executing daily farm operations: planting, irrigation, harvest. GPS-tracked tasks.' },
                            { icon: <Microscope size={40} strokeWidth={1.5} />, title: 'Expert Agronomists', desc: 'Qualified agriculture scientists who design crop plans, diagnose issues, prescribe treatments.' },
                            { icon: <Briefcase size={40} strokeWidth={1.5} />, title: 'Field Managers', desc: 'Regional coordinators overseeing 20-30 farms, managing workers, logistics, and quality control.' }
                        ].map((role, i) => (
                            <div key={i} style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '16px',
                                padding: '32px',
                                textAlign: 'center',
                                transition: 'all 0.3s',
                                cursor: 'pointer'
                            }} onClick={() => navigate('/login')}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{role.icon}</div>
                                <div style={{
                                    fontSize: '20px',
                                    fontWeight: 700,
                                    color: 'var(--white)',
                                    marginBottom: '10px'
                                }}>{role.title}</div>
                                <div style={{
                                    fontSize: '13.5px',
                                    color: 'var(--text2)',
                                    lineHeight: 1.6
                                }}>{role.desc}</div>
                                <button style={{
                                    marginTop: '20px',
                                    padding: '8px 20px',
                                    background: 'transparent',
                                    border: '1px solid var(--border2)',
                                    borderRadius: '8px',
                                    color: 'var(--green)',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontFamily: "'Outfit', sans-serif"
                                }}>
                                    Access Portal →
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ REVENUE MODEL ══ */}
            <section id="revenue" className="reveal" style={{ background: 'var(--deep)' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div className="section-eyebrow" style={{ justifyContent: 'center', display: 'flex' }}>Business Model</div>
                    <h2 className="section-title" style={{ textAlign: 'center' }}>How <em>Everyone</em> Wins</h2>

                    <div style={{ marginTop: '56px', background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: '20px', padding: '48px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <div style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: '72px',
                                fontWeight: 900,
                                color: 'var(--gold)',
                                lineHeight: 1
                            }}>70 / 30</div>
                            <div style={{
                                fontSize: '14px',
                                color: 'var(--text3)',
                                marginTop: '8px',
                                letterSpacing: '1px',
                                textTransform: 'uppercase'
                            }}>Revenue Split</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                            <div>
                                <div style={{ fontSize: '28px', marginBottom: '12px' }}><Wheat size={28} strokeWidth={1.5} /></div>
                                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--white)', marginBottom: '8px' }}>
                                    Landowner (70%)
                                </div>
                                <ul style={{ fontSize: '13.5px', color: 'var(--text2)', lineHeight: 1.8, paddingLeft: '20px', margin: 0 }}>
                                    <li>₹22,000+ per acre/year</li>
                                    <li>Quarterly profit payouts</li>
                                    <li>Zero operational headache</li>
                                    <li>2x vs. traditional leasing</li>
                                </ul>
                            </div>

                            <div>
                                <div style={{ fontSize: '28px', marginBottom: '12px' }}><Building2 size={28} strokeWidth={1.5} /></div>
                                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--green)', marginBottom: '8px' }}>
                                    GreenX (30%)
                                </div>
                                <ul style={{ fontSize: '13.5px', color: 'var(--text2)', lineHeight: 1.8, paddingLeft: '20px', margin: 0 }}>
                                    <li>Covers all operating costs</li>
                                    <li>Worker salaries</li>
                                    <li>Technology & infrastructure</li>
                                    <li>Export logistics & compliance</li>
                                </ul>
                            </div>
                        </div>

                        <div style={{
                            marginTop: '32px',
                            padding: '20px',
                            background: 'var(--green-dim)',
                            border: '1px solid var(--border2)',
                            borderRadius: '12px',
                            fontSize: '13.5px',
                            color: 'var(--text)',
                            textAlign: 'center',
                            fontWeight: 500
                        }}>
                            ✓ Transparent ledger. Every rupee tracked. No hidden deductions.
                        </div>
                    </div>

                    <div style={{ marginTop: '48px', textAlign: 'center' }}>
                        <button className="btn-hero-primary" onClick={() => navigate('/land-register')}>
                            <ClipboardList className="inline-block w-5 h-5 mr-1 align-middle" /> Register Your Land Now
                        </button>
                    </div>
                </div>
            </section>

            {/* ══ SCALE SECTION ══ */}
            <section className="reveal">
                <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                    <div className="section-eyebrow" style={{ justifyContent: 'center', display: 'flex' }}>Market Opportunity</div>
                    <h2 className="section-title">INDIA'S FIRST FARM OPERATING SYSTEM: <em>₹30,000 Cr</em> Market</h2>

                    <div style={{ marginTop: '56px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
                        {[
                            { year: 'Year 1', acres: '5,000', revenue: '₹11 Cr' },
                            { year: 'Year 3', acres: '50,000', revenue: '₹110 Cr' },
                            { year: 'Year 5', acres: '120,000', revenue: '₹264 Cr' }
                        ].map((milestone, i) => (
                            <div key={i} style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '16px',
                                padding: '36px 28px',
                                transition: 'all 0.3s'
                            }}>
                                <div style={{
                                    fontSize: '13px',
                                    color: 'var(--text3)',
                                    marginBottom: '12px',
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                    fontWeight: 600
                                }}>{milestone.year}</div>
                                <div style={{
                                    fontSize: '36px',
                                    fontWeight: 700,
                                    color: 'var(--green)',
                                    marginBottom: '8px'
                                }}>{milestone.acres}</div>
                                <div style={{
                                    fontSize: '13px',
                                    color: 'var(--text3)',
                                    marginBottom: '16px'
                                }}>Acres Under Management</div>
                                <div style={{
                                    fontSize: '24px',
                                    fontWeight: 700,
                                    color: 'var(--gold)'
                                }}>{milestone.revenue}</div>
                                <div style={{
                                    fontSize: '12px',
                                    color: 'var(--text3)',
                                    marginTop: '4px'
                                }}>Projected ARR</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ VISION QUOTE ══ */}
            <section className="reveal" style={{ background: 'var(--deep)', padding: '100px 60px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <div style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(28px, 4vw, 42px)',
                        fontWeight: 700,
                        fontStyle: 'italic',
                        lineHeight: 1.5,
                        color: 'var(--white)',
                        marginBottom: '32px'
                    }}>
                        "We're not building a marketplace.<br />
                        We're building the <span style={{ color: 'var(--green)' }}>operating system</span><br />
                        for India's farmlands."
                    </div>
                    <div style={{
                        fontSize: '14px',
                        color: 'var(--text3)',
                        letterSpacing: '2px',
                        textTransform: 'uppercase'
                    }}>
                        — GreenX Founders
                    </div>
                </div>
            </section>

            {/* ══ FINAL CTA ══ */}
            <section className="reveal" style={{ padding: '120px 60px' }}>
                <div style={{
                    maxWidth: '700px',
                    margin: '0 auto',
                    background: 'var(--surface)',
                    border: '1px solid var(--border2)',
                    borderRadius: '24px',
                    padding: '56px 48px',
                    textAlign: 'center'
                }}>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(32px, 5vw, 48px)',
                        fontWeight: 700,
                        color: 'var(--white)',
                        marginBottom: '16px'
                    }}>
                        Ready to <em style={{ color: 'var(--green)' }}>Professionalize</em> Your Farm?
                    </h2>
                    <p style={{
                        fontSize: '15px',
                        color: 'var(--text2)',
                        lineHeight: 1.7,
                        marginBottom: '36px',
                        maxWidth: '480px',
                        margin: '0 auto 36px'
                    }}>
                        Join 200+ landowners earning 2-3x more while living in Hyderabad, Bangalore, or abroad.
                    </p>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '28px' }}>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            style={{
                                flex: 1,
                                maxWidth: '320px',
                                padding: '14px 18px',
                                background: 'var(--deep)',
                                border: '1px solid var(--border2)',
                                borderRadius: '10px',
                                color: 'var(--text)',
                                fontSize: '14px',
                                fontFamily: "'Outfit', sans-serif",
                                outline: 'none'
                            }}
                        />
                        <button
                            onClick={() => showToast('Early access request received! We\'ll contact you within 48 hours.')}
                            className="btn-hero-primary"
                        >
                            Request Access
                        </button>
                    </div>

                    <div style={{
                        fontSize: '12px',
                        color: 'var(--text3)',
                        marginTop: '20px'
                    }}>
                        <MapPin className="inline-block w-4 h-4 mr-1 align-middle" /> Currently accepting farms in <strong style={{ color: 'var(--green)' }}>India</strong>
                    </div>

                    <div style={{
                        marginTop: '36px',
                        paddingTop: '36px',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        gap: '20px',
                        justifyContent: 'center',
                        fontSize: '13px',
                        color: 'var(--text3)'
                    }}>
                        <span>✓ No upfront fees</span>
                        <span>✓ 30-day trial</span>
                        <span>✓ Exit anytime</span>
                    </div>
                </div>
            </section>

            {/* ══ FOOTER ══ */}
            <footer style={{
                background: 'var(--surface)',
                borderTop: '1px solid var(--border)',
                padding: '60px 60px 32px'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '48px' }}>
                        <div>
                            <div style={{ marginBottom: '20px' }}>
                                <GreenXLogo size="sm" />
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--text3)', lineHeight: 1.7, maxWidth: '280px' }}>
                                Professional farmland management for the modern landowner.
                            </p>
                        </div>

                        <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text3)', marginBottom: '16px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                Platform
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {['How It Works', 'Pricing', 'Technology', 'Success Stories'].map((item, i) => (
                                    <li key={i} style={{ marginBottom: '10px' }}>
                                        <a href="#" style={{ fontSize: '13.5px', color: 'var(--text2)', textDecoration: 'none', transition: 'color 0.2s' }}>
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text3)', marginBottom: '16px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                Company
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {['About Us', 'Careers', 'Contact', 'Legal'].map((item, i) => (
                                    <li key={i} style={{ marginBottom: '10px' }}>
                                        <a href="#" style={{ fontSize: '13.5px', color: 'var(--text2)', textDecoration: 'none', transition: 'color 0.2s' }}>
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text3)', marginBottom: '16px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                Get Started
                            </div>
                            <button className="btn-hero-primary" style={{ marginBottom: '12px', width: '100%' }} onClick={() => navigate('/land-register')}>
                                List Your Land
                            </button>
                            <button className="btn-hero-secondary" style={{ width: '100%' }} onClick={() => navigate('/login')}>
                                Sign In
                            </button>
                        </div>
                    </div>

                    <div style={{
                        paddingTop: '28px',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px',
                        color: 'var(--text3)',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}>
                        <div>© 2026 GreenX. All rights reserved.</div>
                        <div style={{ display: 'flex', gap: '24px' }}>
                            <a href="#" style={{ color: 'var(--text3)', textDecoration: 'none' }}>Privacy</a>
                            <a href="#" style={{ color: 'var(--text3)', textDecoration: 'none' }}>Terms</a>
                            <a href="#" style={{ color: 'var(--text3)', textDecoration: 'none' }}>Security</a>
                        </div>
                    </div>
                </div>
            </footer>

            <div id="toast" style={{
                position: 'fixed',
                bottom: '28px',
                right: '28px',
                background: '#1e2d24',
                border: '1px solid var(--green)',
                color: '#86efac',
                padding: '14px 20px',
                borderRadius: '10px',
                fontSize: '13.5px',
                maxWidth: '320px',
                transform: 'translateY(80px)',
                opacity: 0,
                transition: 'all 0.3s',
                zIndex: 9999,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            }}>
                ✓ <span id="toast-msg"></span>
            </div>

            <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
