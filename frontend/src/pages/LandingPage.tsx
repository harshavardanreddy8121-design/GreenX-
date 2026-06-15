import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GreenXLogo } from '@/components/GreenXLogo';
import { Sprout, FlaskConical, Wheat, Ship, Microscope, HardHat, BarChart3, Briefcase, Play, X, Users, Star } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('t2');
    const [showPlant, setShowPlant] = useState(false);
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [activeVideo, setActiveVideo] = useState(0);
    const cursorRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);

    // Authentication removed - direct access enabled
    // Users can select their role from landing page

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

        /* ══ VIDEO SECTION ══ */
        .video-section {
          position: relative;
          padding: 120px 60px;
          background: var(--black);
          overflow: hidden;
        }
        .video-section-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 50% 50%, rgba(34,197,94,0.06) 0%, transparent 65%),
            radial-gradient(ellipse 40% 50% at 10% 80%, rgba(212,168,71,0.05) 0%, transparent 55%),
            radial-gradient(ellipse 35% 45% at 90% 15%, rgba(34,197,94,0.04) 0%, transparent 55%);
          pointer-events: none;
        }
        .video-section-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black 20%, transparent 75%);
          pointer-events: none;
        }

        /* Floating orbs specific to video section */
        .vid-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          pointer-events: none;
          animation: float 10s ease-in-out infinite;
        }
        .vid-orb-1 {
          width: 320px; height: 320px;
          background: rgba(34,197,94,0.07);
          top: -80px; left: -80px;
          animation-delay: 0s;
        }
        .vid-orb-2 {
          width: 240px; height: 240px;
          background: rgba(212,168,71,0.06);
          bottom: -60px; right: -60px;
          animation-delay: -4s;
        }
        .vid-orb-3 {
          width: 180px; height: 180px;
          background: rgba(34,197,94,0.05);
          top: 50%; left: 75%;
          animation-delay: -7s;
        }

        /* Floating particles */
        .vid-particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: particleDrift linear infinite;
          opacity: 0;
        }
        @keyframes particleDrift {
          0%   { transform: translateY(0) translateX(0) scale(0.6); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 0.6; }
          100% { transform: translateY(-120px) translateX(30px) scale(1.2); opacity: 0; }
        }

        .video-inner {
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }
        .video-header {
          text-align: center;
          margin-bottom: 64px;
        }

        /* Tab pills for video selection */
        .video-tabs {
          display: inline-flex;
          gap: 8px;
          padding: 6px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 40px;
          margin-top: 28px;
        }
        .video-tab-btn {
          padding: 8px 20px;
          border: none;
          border-radius: 30px;
          font-family: 'Outfit', sans-serif;
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.3px;
          cursor: pointer;
          transition: all 0.25s;
          background: transparent;
          color: var(--text2);
        }
        .video-tab-btn.active {
          background: var(--green);
          color: #000;
          box-shadow: 0 0 20px rgba(34,197,94,0.3);
        }
        .video-tab-btn:not(.active):hover {
          color: var(--green);
          background: var(--green-dim);
        }

        /* Main video frame */
        .video-frame-wrap {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(34,197,94,0.18),
            0 0 60px rgba(34,197,94,0.10),
            0 40px 100px rgba(0,0,0,0.6);
          animation: borderGlow 4s ease-in-out infinite;
        }
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(34,197,94,0.18), 0 0 60px rgba(34,197,94,0.10), 0 40px 100px rgba(0,0,0,0.6); }
          50%       { box-shadow: 0 0 0 1px rgba(34,197,94,0.40), 0 0 100px rgba(34,197,94,0.20), 0 40px 100px rgba(0,0,0,0.6); }
        }
        .video-aspect {
          position: relative;
          width: 100%;
          padding-top: 56.25%; /* 16:9 */
          background: var(--surface);
          overflow: hidden;
        }
        .video-thumbnail {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease, filter 0.4s ease;
          filter: brightness(0.55) saturate(1.1);
        }
        .video-frame-wrap:hover .video-thumbnail {
          transform: scale(1.03);
          filter: brightness(0.45) saturate(1.2);
        }

        /* Gradient overlay on thumbnail */
        .video-overlay-grad {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to top, rgba(6,10,7,0.85) 0%, transparent 50%),
            linear-gradient(to bottom, rgba(6,10,7,0.3) 0%, transparent 40%);
          pointer-events: none;
        }

        /* Play button */
        .video-play-btn {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 80px; height: 80px;
          border-radius: 50%;
          background: rgba(34,197,94,0.15);
          border: 2px solid rgba(34,197,94,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
          animation: playPulse 3s ease-in-out infinite;
          z-index: 5;
        }
        @keyframes playPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4), 0 0 30px rgba(34,197,94,0.15); }
          50%       { box-shadow: 0 0 0 16px rgba(34,197,94,0), 0 0 50px rgba(34,197,94,0.25); }
        }
        .video-play-btn:hover {
          background: rgba(34,197,94,0.30);
          border-color: var(--green);
          transform: translate(-50%, -50%) scale(1.12);
          box-shadow: 0 0 0 0 rgba(34,197,94,0), 0 0 60px rgba(34,197,94,0.4);
          animation: none;
        }
        .video-play-btn svg {
          color: var(--green);
          margin-left: 4px; /* optical center for play icon */
          filter: drop-shadow(0 0 8px rgba(34,197,94,0.6));
          transition: filter 0.3s;
        }
        .video-play-btn:hover svg {
          filter: drop-shadow(0 0 16px rgba(34,197,94,1));
        }

        /* Duration badge */
        .video-duration-badge {
          position: absolute;
          bottom: 20px; right: 20px;
          padding: 5px 12px;
          background: rgba(6,10,7,0.75);
          border: 1px solid rgba(34,197,94,0.25);
          border-radius: 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 500;
          color: var(--text);
          backdrop-filter: blur(8px);
          z-index: 5;
        }

        /* Video caption bar */
        .video-caption {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 28px 32px 24px;
          z-index: 5;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
        }
        .video-caption-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 700;
          color: var(--white);
          line-height: 1.3;
        }
        .video-caption-sub {
          font-size: 13px;
          color: var(--text2);
          margin-top: 4px;
          line-height: 1.5;
        }
        .video-watch-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: var(--green);
          border: none;
          border-radius: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #000;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.25s;
          flex-shrink: 0;
        }
        .video-watch-cta:hover {
          background: var(--green3);
          transform: translateY(-1px);
          box-shadow: 0 0 30px rgba(34,197,94,0.4);
        }

        /* Social proof strip below video */
        .video-proof-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 40px;
          margin-top: 40px;
          flex-wrap: wrap;
        }
        .video-proof-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13.5px;
          color: var(--text2);
        }
        .video-proof-item svg { color: var(--green); flex-shrink: 0; }
        .video-proof-item strong { color: var(--white); font-weight: 700; }
        .video-proof-divider {
          width: 1px; height: 28px;
          background: var(--border);
        }
        .video-star { color: var(--gold) !important; }

        /* ══ VIDEO MODAL ══ */
        .video-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.88);
          backdrop-filter: blur(12px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: fadeIn 0.25s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .video-modal-inner {
          position: relative;
          width: 100%;
          max-width: 960px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 0 0 1px rgba(34,197,94,0.2), 0 40px 120px rgba(0,0,0,0.8);
          animation: scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        .video-modal-aspect {
          position: relative;
          width: 100%;
          padding-top: 56.25%;
          background: #000;
        }
        .video-modal-aspect iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
        .video-modal-close {
          position: absolute;
          top: -48px; right: 0;
          width: 40px; height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text);
          transition: all 0.2s;
        }
        .video-modal-close:hover {
          background: rgba(34,197,94,0.15);
          border-color: var(--green);
          color: var(--green);
        }

        /* ══ PROBLEM STAT CARDS ══ */
        .problem-stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(34,197,94,0.3) !important;
          box-shadow: 0 16px 40px rgba(0,0,0,0.3);
        }

        /* ══ SOLUTION SECTION ══ */
        .solution-feature-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px 24px;
          transition: all 0.3s;
        }
        .solution-feature-card:hover {
          border-color: var(--border2);
          box-shadow: 0 8px 32px rgba(34,197,94,0.12);
          transform: translateY(-3px);
        }
        .solution-feature-icon {
          color: var(--green2);
          margin-bottom: 14px;
        }
        .solution-feature-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 8px;
        }
        .solution-feature-desc {
          font-size: 13.5px;
          color: var(--text2);
          line-height: 1.6;
        }

        /* ══ DATA SECTION ══ */
        .data-charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-top: 64px;
        }
        .data-chart-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 36px 32px 28px;
        }
        .data-chart-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 6px;
          line-height: 1.3;
        }
        .data-chart-subtitle {
          font-size: 12px;
          color: var(--text3);
          letter-spacing: 0.5px;
          margin-bottom: 32px;
        }
        .data-bar-chart {
          display: flex;
          gap: 12px;
          height: 220px;
          align-items: stretch;
        }
        .data-bar-y-axis {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-end;
          padding-bottom: 28px;
          flex-shrink: 0;
        }
        .data-bar-y-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: var(--text3);
          line-height: 1;
        }
        .data-bar-area {
          flex: 1;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .data-bar-grid {
          position: absolute;
          inset: 0;
          bottom: 28px;
          pointer-events: none;
        }
        .data-bar-gridline {
          position: absolute;
          left: 0; right: 0;
          height: 1px;
          background: rgba(34,197,94,0.08);
        }
        .data-bars-row {
          display: flex;
          gap: 24px;
          align-items: flex-end;
          flex: 1;
          padding-bottom: 28px;
          justify-content: center;
        }
        .data-bar-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          width: 80px;
          height: 100%;
          justify-content: flex-end;
        }
        .data-bar-value-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          font-weight: 700;
          line-height: 1;
        }
        .data-bar {
          width: 64px;
          border-radius: 6px 6px 0 0;
          height: var(--bar-height);
          transition: height 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
        }
        .data-bar-green {
          background: linear-gradient(to top, var(--green2), var(--green3));
          box-shadow: 0 0 20px rgba(34,197,94,0.25);
        }
        .data-bar-red {
          background: linear-gradient(to top, #c2410c, #f97316);
          box-shadow: 0 0 20px rgba(249,115,22,0.2);
        }
        .data-bar-gray {
          background: linear-gradient(to top, #374151, #6b7280);
        }
        .data-bar-x-label {
          font-size: 12px;
          color: var(--text2);
          text-align: center;
          line-height: 1.4;
          font-weight: 600;
        }
        .data-annotation {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .data-annotation-drop {
          right: 8px;
          top: 8px;
          color: #f97316;
        }
        .data-annotation-multiplier {
          right: 8px;
          top: 8px;
          color: var(--green);
        }
        .data-annotation-arrow {
          font-size: 18px;
          font-weight: 700;
          line-height: 1;
        }
        .data-annotation-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 700;
          background: rgba(0,0,0,0.4);
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid currentColor;
          opacity: 0.9;
        }
        .data-chart-caption {
          font-size: 13px;
          color: var(--text3);
          margin-top: 20px;
          font-style: italic;
          text-align: center;
          letter-spacing: 0.2px;
        }

        @media (max-width: 900px) {
          section { padding: 70px 28px; }
          nav { padding: 16px 24px; }
          nav.scrolled { padding: 12px 24px; }
                    .hero { padding: 74px 24px 60px; }
          .nav-links { display: none; }
          .video-section { padding: 80px 24px; }
          .video-caption { flex-direction: column; align-items: flex-start; }
          .video-proof-strip { gap: 20px; }
          .video-proof-divider { display: none; }
          .video-tabs { flex-wrap: wrap; justify-content: center; }
          .data-charts-grid { grid-template-columns: 1fr; gap: 24px; }
          .data-chart-card { padding: 28px 20px 24px; }
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
                    <li><a href="#data">Data</a></li>
                    <li><a href="#solution">Solution</a></li>
                    <li><a href="#vision">Our Story</a></li>
                    <li><a href="#platform">Platform</a></li>
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
                        const items = ['Clinical Soil Testing', 'Precision Agriculture', 'Real-Time Dashboard', 'Direct International Export', 'Expert Agronomists', '80% Revenue to Landowner', 'GPS Field Tracking', 'VRT Technology'];
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
            <section id="problem" className="reveal" style={{ background: 'var(--black)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="section-eyebrow">The Crisis</div>
                    <h2 className="section-title">What India's Farmers <em>Actually Face</em></h2>
                    <p className="section-sub" style={{ fontSize: '15px', color: 'var(--text2)', marginBottom: '0' }}>
                        The crisis of fragmented, abandoned farmland
                    </p>
                    <p style={{
                        fontSize: '16px',
                        color: 'var(--text2)',
                        lineHeight: 1.85,
                        maxWidth: '760px',
                        marginTop: '20px'
                    }}>
                        Most Indian farmland is owned by smallholder farmers, each holding just 2–3 acres. But fewer young people want to farm anymore — many are moving to cities for other jobs, and the farming workforce has dropped from <strong style={{ color: 'var(--white)' }}>70% to under 46%</strong> of the population in just two decades. As a result, millions of acres of land sit fragmented, underused, or completely unmanaged, with no one to cultivate them properly.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '56px' }}>
                        {[
                            { num: '86%', label: 'Holdings < 5 Acres', desc: 'Below economic viability threshold', accent: 'var(--green)' },
                            { num: '40%', label: 'Post-Harvest Loss', desc: 'Due to middlemen & poor handling', accent: '#f97316' },
                            { num: '60%', label: 'Migrant Landowners', desc: 'Farms managed by relatives or abandoned', accent: '#f97316' },
                            { num: '₹8-12K', label: 'Per Acre Revenue', desc: 'Vs. ₹40K+ in professional farming', accent: 'var(--gold)' }
                        ].map((item, i) => (
                            <div key={i} className="problem-stat-card" style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderTop: `3px solid ${item.accent}`,
                                borderRadius: '16px',
                                padding: '36px 28px',
                                textAlign: 'center',
                                transition: 'all 0.3s',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${item.accent}0d 0%, transparent 70%)`,
                                    pointerEvents: 'none'
                                }} />
                                <div style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '52px',
                                    fontWeight: 700,
                                    color: item.accent,
                                    lineHeight: 1,
                                    marginBottom: '14px',
                                    position: 'relative'
                                }}>{item.num}</div>
                                <div style={{
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    color: 'var(--white)',
                                    marginBottom: '8px',
                                    position: 'relative'
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

            {/* ══ DATA SECTION ══ */}
            <section id="data" className="reveal" style={{ background: 'var(--deep)' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div className="section-eyebrow" style={{ justifyContent: 'center' }}>The Numbers</div>
                    <h2 className="section-title" style={{ textAlign: 'center' }}>
                        The Data Doesn't <em>Lie</em>
                    </h2>
                    <p style={{
                        fontSize: '16px',
                        color: 'var(--text2)',
                        lineHeight: 1.7,
                        textAlign: 'center',
                        maxWidth: '560px',
                        margin: '16px auto 0'
                    }}>
                        Two charts that tell the whole story — a workforce in decline, and an income opportunity hiding in plain sight.
                    </p>

                    <div className="data-charts-grid">
                        {/* Chart 1: Agricultural Workforce Decline */}
                        <div className="data-chart-card">
                            <div className="data-chart-title">Agricultural Workforce Decline</div>
                            <div className="data-chart-subtitle">% of population employed in agriculture</div>
                            <div className="data-bar-chart">
                                <div className="data-bar-y-axis">
                                    {[100, 75, 50, 25, 0].map(v => (
                                        <div key={v} className="data-bar-y-label">{v}%</div>
                                    ))}
                                </div>
                                <div className="data-bar-area">
                                    {/* Grid lines */}
                                    <div className="data-bar-grid">
                                        {[0, 25, 50, 75, 100].map(v => (
                                            <div key={v} className="data-bar-gridline" style={{ bottom: `${v}%` }} />
                                        ))}
                                    </div>
                                    {/* Bars */}
                                    <div className="data-bars-row">
                                        <div className="data-bar-col">
                                            <div className="data-bar-value-label" style={{ color: 'var(--green)' }}>70%</div>
                                            <div
                                                className="data-bar data-bar-green"
                                                style={{ '--bar-height': '70%' } as React.CSSProperties}
                                            />
                                            <div className="data-bar-x-label">2001</div>
                                        </div>
                                        <div className="data-bar-col">
                                            <div className="data-bar-value-label" style={{ color: '#f97316' }}>46%</div>
                                            <div
                                                className="data-bar data-bar-red"
                                                style={{ '--bar-height': '46%' } as React.CSSProperties}
                                            />
                                            <div className="data-bar-x-label">2023</div>
                                        </div>
                                    </div>
                                    {/* Drop annotation */}
                                    <div className="data-annotation data-annotation-drop">
                                        <span className="data-annotation-arrow">↓</span>
                                        <span className="data-annotation-text">−24 pts</span>
                                    </div>
                                </div>
                            </div>
                            <div className="data-chart-caption">
                                24-point decline in 22 years — and still falling.
                            </div>
                        </div>

                        {/* Chart 2: Landowner Income Comparison */}
                        <div className="data-chart-card">
                            <div className="data-chart-title">Landowner Income Per Acre / Year</div>
                            <div className="data-chart-subtitle">Annual income in ₹ (Indian Rupees)</div>
                            <div className="data-bar-chart">
                                <div className="data-bar-y-axis">
                                    {['60K', '45K', '30K', '15K', '0'].map(v => (
                                        <div key={v} className="data-bar-y-label">₹{v}</div>
                                    ))}
                                </div>
                                <div className="data-bar-area">
                                    {/* Grid lines */}
                                    <div className="data-bar-grid">
                                        {[0, 25, 50, 75, 100].map(v => (
                                            <div key={v} className="data-bar-gridline" style={{ bottom: `${v}%` }} />
                                        ))}
                                    </div>
                                    {/* Bars */}
                                    <div className="data-bars-row">
                                        <div className="data-bar-col">
                                            <div className="data-bar-value-label" style={{ color: '#9ca3af' }}>₹10K</div>
                                            <div
                                                className="data-bar data-bar-gray"
                                                style={{ '--bar-height': '17%' } as React.CSSProperties}
                                            />
                                            <div className="data-bar-x-label" style={{ fontSize: '11px' }}>Traditional<br/>Lease</div>
                                        </div>
                                        <div className="data-bar-col">
                                            <div className="data-bar-value-label" style={{ color: 'var(--green)' }}>₹53K</div>
                                            <div
                                                className="data-bar data-bar-green"
                                                style={{ '--bar-height': '88%' } as React.CSSProperties}
                                            />
                                            <div className="data-bar-x-label" style={{ fontSize: '11px' }}>GreenX<br/>Model</div>
                                        </div>
                                    </div>
                                    {/* Multiplier annotation */}
                                    <div className="data-annotation data-annotation-multiplier">
                                        <span className="data-annotation-arrow">↑</span>
                                        <span className="data-annotation-text">5.3×</span>
                                    </div>
                                </div>
                            </div>
                            <div className="data-chart-caption">
                                GreenX gives landowners 5.3× more income.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ SOLUTION SECTION ══ */}
            <section id="solution" className="reveal" style={{ background: 'var(--black)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="section-eyebrow" style={{ color: 'var(--green2)' }}>The Answer</div>
                    <h2 className="section-title" style={{ color: 'var(--white)' }}>The <em style={{ color: 'var(--green2)' }}>GreenX</em> Model</h2>
                    <p style={{ fontSize: '15px', color: 'var(--text2)', marginBottom: '0', fontWeight: 600, marginTop: '12px' }}>
                        Professional farming for landowners who can't manage it themselves
                    </p>
                    <p style={{
                        fontSize: '16px',
                        color: 'var(--text2)',
                        lineHeight: 1.85,
                        maxWidth: '760px',
                        marginTop: '16px'
                    }}>
                        GreenX takes care of farmland on behalf of landowners who can't manage it themselves. We bring together small, scattered plots into larger, professionally-run farms, use scientific soil testing and modern technology — sensors, precision farming tools, data-driven crop planning — to grow the right crops the right way, and sell the harvest directly to international buyers, skipping middlemen entirely. <strong style={{ color: 'var(--white)' }}>Landowners earn 80% of the profits</strong>, while GreenX handles all the work.
                    </p>

                    {/* Feature cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '64px' }}>
                        {[
                            { icon: <FlaskConical size={28} strokeWidth={1.5} />, title: 'Clinical Soil Testing', desc: 'NPK, pH, micronutrient analysis before every season' },
                            { icon: <Wheat size={28} strokeWidth={1.5} />, title: 'Precision Agriculture', desc: 'Variable Rate Technology, GPS tracking, optimized inputs' },
                            { icon: <HardHat size={28} strokeWidth={1.5} />, title: 'Professional Workforce', desc: 'Trained workers + expert agronomists on payroll' },
                            { icon: <Ship size={28} strokeWidth={1.5} />, title: 'Direct Export', desc: 'Bypass 5 middlemen, sell to international buyers' }
                        ].map((item, i) => (
                            <div key={i} className="solution-feature-card">
                                <div className="solution-feature-icon">{item.icon}</div>
                                <div className="solution-feature-title">{item.title}</div>
                                <div className="solution-feature-desc">{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ VIDEO SHOWCASE SECTION ══ */}
            <section className="video-section reveal" id="vision">
                {/* Background layers */}
                <div className="video-section-bg" />
                <div className="video-section-grid" />
                <div className="vid-orb vid-orb-1" />
                <div className="vid-orb vid-orb-2" />
                <div className="vid-orb vid-orb-3" />

                {/* Floating micro-particles */}
                {[
                    { size: 4, left: '12%', top: '70%', dur: '7s', delay: '0s',   color: 'rgba(34,197,94,0.5)' },
                    { size: 3, left: '25%', top: '80%', dur: '9s', delay: '-2s',  color: 'rgba(212,168,71,0.5)' },
                    { size: 5, left: '60%', top: '75%', dur: '8s', delay: '-4s',  color: 'rgba(34,197,94,0.4)' },
                    { size: 3, left: '78%', top: '65%', dur: '11s', delay: '-1s', color: 'rgba(74,222,128,0.5)' },
                    { size: 4, left: '88%', top: '82%', dur: '6s', delay: '-3s',  color: 'rgba(212,168,71,0.4)' },
                    { size: 2, left: '42%', top: '88%', dur: '10s', delay: '-5s', color: 'rgba(34,197,94,0.6)' },
                ].map((p, i) => (
                    <div key={i} className="vid-particle" style={{
                        width: p.size, height: p.size,
                        left: p.left, top: p.top,
                        background: p.color,
                        animationDuration: p.dur,
                        animationDelay: p.delay,
                    }} />
                ))}

                <div className="video-inner">
                    {/* Section header */}
                    <div className="video-header">
                        <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Our Story</div>
                        <h2 className="section-title" style={{ textAlign: 'center' }}>
                            See GreenX <em>in Action</em>
                        </h2>
                        <p className="section-sub" style={{ margin: '16px auto 0', textAlign: 'center' }}>
                            Watch how we transform idle farmland into high-yield, professionally managed operations — from soil test to export.
                        </p>

                        {/* Video selector tabs */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '28px' }}>
                            <div className="video-tabs">
                                {[
                                    { label: '🌱 Company Story',    idx: 0 },
                                    { label: '📱 Product Demo',     idx: 1 },
                                    { label: '👨‍🌾 Farmer Testimonial', idx: 2 },
                                ].map(tab => (
                                    <button
                                        key={tab.idx}
                                        className={`video-tab-btn${activeVideo === tab.idx ? ' active' : ''}`}
                                        onClick={() => setActiveVideo(tab.idx)}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Video frame */}
                    <div className="video-frame-wrap">
                        <div className="video-aspect">
                            {/* Thumbnail — rich gradient placeholder with field imagery feel */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: activeVideo === 0
                                    ? 'linear-gradient(135deg, #0a1f0e 0%, #0f2d14 30%, #071a0a 60%, #0a1208 100%)'
                                    : activeVideo === 1
                                    ? 'linear-gradient(135deg, #0a0f1f 0%, #0d1a2d 30%, #071018 60%, #060a12 100%)'
                                    : 'linear-gradient(135deg, #1a0f07 0%, #2d1a0d 30%, #180e07 60%, #120a06 100%)',
                                transition: 'background 0.5s ease',
                            }}>
                                {/* Decorative grid lines inside thumbnail */}
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    backgroundImage: 'linear-gradient(rgba(34,197,94,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.06) 1px, transparent 1px)',
                                    backgroundSize: '48px 48px',
                                }} />
                                {/* Central glow */}
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: activeVideo === 0
                                        ? 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(34,197,94,0.12) 0%, transparent 70%)'
                                        : activeVideo === 1
                                        ? 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(34,130,197,0.12) 0%, transparent 70%)'
                                        : 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,168,71,0.12) 0%, transparent 70%)',
                                }} />
                                {/* Large icon watermark */}
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    opacity: 0.06,
                                }}>
                                    <Sprout style={{ width: 220, height: 220, color: activeVideo === 2 ? '#d4a847' : '#22c55e' }} strokeWidth={1} />
                                </div>
                                {/* Video label top-left */}
                                <div style={{
                                    position: 'absolute', top: 20, left: 24,
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '5px 14px',
                                    background: 'rgba(6,10,7,0.65)',
                                    border: '1px solid rgba(34,197,94,0.2)',
                                    borderRadius: 20,
                                    backdropFilter: 'blur(8px)',
                                    fontSize: 12, fontWeight: 600,
                                    color: 'var(--text2)',
                                    letterSpacing: '0.5px',
                                    zIndex: 5,
                                }}>
                                    <span style={{
                                        width: 7, height: 7, borderRadius: '50%',
                                        background: '#ef4444',
                                        boxShadow: '0 0 8px #ef4444',
                                        display: 'inline-block',
                                        animation: 'pulse 2s infinite',
                                    }} />
                                    {activeVideo === 0 ? 'COMPANY STORY' : activeVideo === 1 ? 'PRODUCT DEMO' : 'TESTIMONIAL'}
                                </div>
                            </div>

                            {/* Gradient overlay */}
                            <div className="video-overlay-grad" />

                            {/* Play button */}
                            <button
                                className="video-play-btn"
                                onClick={() => setVideoModalOpen(true)}
                                aria-label="Play video"
                            >
                                <Play size={28} fill="currentColor" />
                            </button>

                            {/* Duration badge */}
                            <div className="video-duration-badge">
                                {activeVideo === 0 ? '2:45' : activeVideo === 1 ? '4:12' : '3:08'}
                            </div>

                            {/* Caption bar */}
                            <div className="video-caption">
                                <div>
                                    <div className="video-caption-title">
                                        {activeVideo === 0
                                            ? 'How GreenX is Rebuilding Indian Agriculture'
                                            : activeVideo === 1
                                            ? 'The GreenX Platform — Full Walkthrough'
                                            : '"My farm earned 4× more in the first season"'}
                                    </div>
                                    <div className="video-caption-sub">
                                        {activeVideo === 0
                                            ? 'Our founders explain the vision, mission, and the problem we\'re solving at scale.'
                                            : activeVideo === 1
                                            ? 'From soil testing to export — see every feature of the GreenX dashboard.'
                                            : 'Ramesh Patil, Landowner from Nashik, Maharashtra shares his GreenX journey.'}
                                    </div>
                                </div>
                                <button className="video-watch-cta" onClick={() => setVideoModalOpen(true)}>
                                    <Play size={14} fill="currentColor" /> Watch Now
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Social proof strip */}
                    <div className="video-proof-strip">
                        <div className="video-proof-item">
                            <Users size={16} />
                            <span>Watched by <strong>50K+ farmers</strong></span>
                        </div>
                        <div className="video-proof-divider" />
                        <div className="video-proof-item">
                            <Star size={16} className="video-star" style={{ color: 'var(--gold)' }} />
                            <span><strong>4.9 / 5</strong> avg. rating from viewers</span>
                        </div>
                        <div className="video-proof-divider" />
                        <div className="video-proof-item">
                            <Play size={16} />
                            <span><strong>3 videos</strong> — Story, Demo & Testimonial</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ VIDEO MODAL ══ */}
            {videoModalOpen && (
                <div
                    className="video-modal-backdrop"
                    onClick={(e) => { if (e.target === e.currentTarget) setVideoModalOpen(false); }}
                >
                    <div className="video-modal-inner">
                        <button
                            className="video-modal-close"
                            onClick={() => setVideoModalOpen(false)}
                            aria-label="Close video"
                        >
                            <X size={18} />
                        </button>
                        <div className="video-modal-aspect">
                            <iframe
                                src={
                                    activeVideo === 0
                                        ? 'https://www.youtube.com/embed/aAgNp6EFvf8?autoplay=1&rel=0&modestbranding=1'
                                        : activeVideo === 1
                                        ? 'https://www.youtube.com/embed/aAgNp6EFvf8?autoplay=1&rel=0&modestbranding=1'
                                        : 'https://www.youtube.com/embed/aAgNp6EFvf8?autoplay=1&rel=0&modestbranding=1'
                                }
                                title={
                                    activeVideo === 0
                                        ? 'GreenX Company Story'
                                        : activeVideo === 1
                                        ? 'GreenX Product Demo'
                                        : 'GreenX Farmer Testimonial'
                                }
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ══ PLATFORM PREVIEW ══ */}
            <section id="platform" className="reveal" style={{ background: 'var(--deep)', paddingTop: '120px', paddingBottom: '120px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="section-eyebrow" style={{ justifyContent: 'center', display: 'flex' }}>Technology</div>
                    <h2 className="section-title" style={{ textAlign: 'center' }}>Your Farm, <em>Digitally Managed</em></h2>

                    <div style={{ marginTop: '48px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', padding: '6px', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            {[
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
                                {['Our Solution', 'Pricing', 'Technology', 'Success Stories'].map((item, i) => (
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
                                Contact
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <li style={{ marginBottom: '10px' }}>
                                    <a href="tel:+918121710210" style={{ fontSize: '13.5px', color: 'var(--text2)', textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: 'var(--green)' }}>📞</span> +91 8121710210
                                    </a>
                                </li>
                                <li style={{ marginBottom: '10px' }}>
                                    <a href="mailto:greenxagritech@gmail.com" style={{ fontSize: '13.5px', color: 'var(--text2)', textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: 'var(--green)' }}>✉</span> greenxagritech@gmail.com
                                    </a>
                                </li>
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
