import { useState, useEffect, useRef, useCallback } from "react";
import { Eye, EyeOff, LogIn, ArrowLeft, ChevronDown, Leaf, Shield, Map, FlaskConical, Hammer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GreenXLogo } from "@/components/GreenXLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

const roleRoutes: Record<string, string> = {
  landowner: '/dashboard/landowner',
  fieldmanager: '/dashboard/field-manager',
  expert: '/dashboard/expert',
  worker: '/worker',
  user: '/worker',
  admin: '/dashboard/cluster-admin',
};

const roles = [
  { value: 'admin', labelKey: 'roles.admin', icon: Shield, color: '#f0b429' },
  { value: 'landowner', labelKey: 'roles.landowner', icon: Leaf, color: '#22c55e' },
  { value: 'fieldmanager', labelKey: 'roles.fieldmanager', icon: Map, color: '#3b82f6' },
  { value: 'expert', labelKey: 'roles.expert', icon: FlaskConical, color: '#a855f7' },
  { value: 'worker', labelKey: 'roles.worker', icon: Hammer, color: '#f97316' },
];

/* ── Floating particle component ── */
function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number; }[] = [];

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5,
        o: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34,197,94,${p.o})`;
        ctx.fill();
      });
      // draw lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(34,197,94,${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }} />;
}

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [name, setName] = useState("");
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated, role, loading, login, register } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && isAuthenticated && role) {
      navigate(roleRoutes[role] || '/');
    }
  }, [isAuthenticated, role, loading, navigate]);

  /* ── 3D tilt on card ── */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (cardRef.current) cardRef.current.style.transform = 'perspective(800px) rotateY(0) rotateX(0)';
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter email and password."); return; }
    if (showRegister && !name) { setError("Please enter your name."); return; }
    setLoginLoading(true);

    try {
      if (showRegister) {
        await register(email, password, name, selectedRole || 'LAND_OWNER');
      } else {
        await login(email, password);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoginLoading(false);
    }
  };


  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060a07' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(34,197,94,0.2)', borderTop: '3px solid #22c55e', borderRadius: '50%', animation: 'loginSpin 0.8s linear infinite' }} />
      </div>
    );
  }

  const loginStyles = `
    @keyframes loginSpin { to { transform: rotate(360deg); } }
    @keyframes loginFadeUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes loginGlow {
      0%, 100% { box-shadow: 0 0 20px rgba(34,197,94,0.15), 0 0 60px rgba(34,197,94,0.05); }
      50% { box-shadow: 0 0 30px rgba(34,197,94,0.25), 0 0 80px rgba(34,197,94,0.1); }
    }
    @keyframes loginBorderGlow {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes loginPulse {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.2); }
    }
    @keyframes loginFloat {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-20px) scale(1.03); }
    }
    @keyframes loginShimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes roleSlideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .login-page * { box-sizing: border-box; }

    .login-input {
      width: 100%;
      padding: 14px 18px;
      border-radius: 10px;
      background: rgba(15, 26, 18, 0.8);
      border: 1px solid rgba(34,197,94,0.15);
      color: #e2ede6;
      font-size: 14px;
      font-family: 'Outfit', sans-serif;
      outline: none;
      transition: all 0.3s ease;
    }
    .login-input::placeholder { color: #3d5a44; }
    .login-input:focus {
      border-color: #22c55e;
      box-shadow: 0 0 0 3px rgba(34,197,94,0.1), 0 0 20px rgba(34,197,94,0.08);
    }

    .login-btn-primary {
      width: 100%;
      padding: 14px 24px;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      font-family: 'Outfit', sans-serif;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: #000;
      box-shadow: 0 4px 20px rgba(34,197,94,0.3);
    }
    .login-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 30px rgba(34,197,94,0.4);
    }
    .login-btn-primary:active { transform: translateY(0) scale(0.98); }
    .login-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .login-btn-primary::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
      background-size: 200% 100%;
      animation: loginShimmer 3s ease-in-out infinite;
    }

    .login-role-btn {
      width: 100%;
      padding: 16px 20px;
      border-radius: 12px;
      background: rgba(15, 26, 18, 0.6);
      border: 1px solid rgba(34,197,94,0.1);
      color: #e2ede6;
      font-size: 14px;
      font-weight: 600;
      font-family: 'Outfit', sans-serif;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 14px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      text-align: left;
    }
    .login-role-btn:hover {
      border-color: rgba(34,197,94,0.4);
      transform: translateX(4px);
      background: rgba(34,197,94,0.08);
    }
    .login-role-btn::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 3px;
      border-radius: 0 3px 3px 0;
      transition: all 0.3s ease;
      opacity: 0;
    }
    .login-role-btn:hover::before { opacity: 1; }

    .login-link {
      background: none;
      border: none;
      color: #7a9a82;
      font-size: 13px;
      font-family: 'Outfit', sans-serif;
      cursor: pointer;
      transition: color 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
      margin-top: 16px;
    }
    .login-link:hover { color: #22c55e; }
    .login-link-green { color: #22c55e; }
    .login-link-green:hover { color: #4ade80; }
  `;

  // Role selection screen
  if (!selectedRole) {
    return (
      <div className="login-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060a07', position: 'relative', overflow: 'hidden', fontFamily: "'Outfit', sans-serif" }}>
        <style>{loginStyles}</style>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

        <Particles />

        {/* Orbs */}
        <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'rgba(34,197,94,0.06)', filter: 'blur(80px)', top: -100, left: -100, animation: 'loginFloat 8s ease-in-out infinite', zIndex: 1 }} />
        <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'rgba(212,168,71,0.05)', filter: 'blur(80px)', bottom: -50, right: -50, animation: 'loginFloat 8s ease-in-out infinite 3s', zIndex: 1 }} />

        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          backgroundImage: 'linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 80%)',
        }} />

        {/* Card */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'relative', zIndex: 10, width: '100%', maxWidth: 440, margin: '0 16px',
            background: 'linear-gradient(160deg, rgba(15,26,18,0.95), rgba(10,15,12,0.98))',
            border: '1px solid rgba(34,197,94,0.12)',
            borderRadius: 20, padding: '40px 36px',
            backdropFilter: 'blur(20px)',
            animation: 'loginFadeUp 0.7s ease both, loginGlow 4s ease-in-out infinite',
            transition: 'transform 0.15s ease',
          }}>

          {/* Animated border accent */}
          <div style={{
            position: 'absolute', top: -1, left: 40, right: 40, height: 2,
            background: 'linear-gradient(90deg, transparent, #22c55e, #4ade80, #22c55e, transparent)',
            backgroundSize: '200% 100%',
            animation: 'loginBorderGlow 3s linear infinite',
            borderRadius: 2,
          }} />

          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <GreenXLogo size="lg" />
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e2ede6', textAlign: 'center', marginBottom: 8 }}>
            {t('login_page.select_role')}
          </h2>
          <p style={{ fontSize: 13, color: '#3d5a44', textAlign: 'center', marginBottom: 28 }}>
            Choose your role to continue
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {roles.map((r, i) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.value}
                  className="login-role-btn"
                  onClick={() => setSelectedRole(r.value)}
                  onMouseEnter={() => setHoveredRole(r.value)}
                  onMouseLeave={() => setHoveredRole(null)}
                  style={{
                    animationDelay: `${0.1 + i * 0.08}s`,
                    animation: `roleSlideIn 0.5s ease ${0.1 + i * 0.08}s both`,
                    borderColor: hoveredRole === r.value ? `${r.color}44` : undefined,
                    background: hoveredRole === r.value ? `${r.color}0d` : undefined,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: `${r.color}15`, flexShrink: 0 }}>
                    <Icon size={18} color={r.color} />
                  </span>
                  <span>{t(r.labelKey)}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 18, transition: 'transform 0.2s, color 0.2s', transform: hoveredRole === r.value ? 'translateX(4px)' : 'none', color: hoveredRole === r.value ? r.color : '#3d5a44' }}>→</span>
                  <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, borderRadius: '0 3px 3px 0', background: r.color, opacity: hoveredRole === r.value ? 1 : 0, transition: 'opacity 0.3s' }} />
                </button>
              );
            })}
          </div>

          <button onClick={() => navigate('/')} className="login-link">
            <ArrowLeft size={14} /> {t('login_page.back')}
          </button>
        </div>
      </div>
    );
  }

  // Login form
  const activeRole = roles.find(r => r.value === selectedRole);
  const ActiveIcon = activeRole?.icon || Leaf;

  return (
    <div className="login-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060a07', position: 'relative', overflow: 'hidden', fontFamily: "'Outfit', sans-serif" }}>
      <style>{loginStyles}</style>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <Particles />

      {/* Orbs */}
      <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: `${activeRole?.color || '#22c55e'}10`, filter: 'blur(80px)', top: -100, right: -50, animation: 'loginFloat 8s ease-in-out infinite', zIndex: 1 }} />
      <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(34,197,94,0.04)', filter: 'blur(60px)', bottom: '20%', left: '10%', animation: 'loginFloat 6s ease-in-out infinite 2s', zIndex: 1 }} />

      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        backgroundImage: 'linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 80%)',
      }} />

      {/* Card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'relative', zIndex: 10, width: '100%', maxWidth: 440, margin: '0 16px',
          background: 'linear-gradient(160deg, rgba(15,26,18,0.95), rgba(10,15,12,0.98))',
          border: '1px solid rgba(34,197,94,0.12)',
          borderRadius: 20, padding: '40px 36px',
          backdropFilter: 'blur(20px)',
          animation: 'loginFadeUp 0.7s ease both, loginGlow 4s ease-in-out infinite',
          transition: 'transform 0.15s ease',
        }}>

        {/* Animated border accent */}
        <div style={{
          position: 'absolute', top: -1, left: 40, right: 40, height: 2,
          background: `linear-gradient(90deg, transparent, ${activeRole?.color || '#22c55e'}, ${activeRole?.color || '#22c55e'}88, ${activeRole?.color || '#22c55e'}, transparent)`,
          backgroundSize: '200% 100%',
          animation: 'loginBorderGlow 3s linear infinite',
          borderRadius: 2,
        }} />

        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <GreenXLogo size="lg" />
        </div>

        {/* Role selector dropdown */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <button onClick={() => setRoleDropdownOpen(!roleDropdownOpen)} style={{
            width: '100%', padding: '12px 18px', borderRadius: 10,
            background: 'rgba(15,26,18,0.8)', border: '1px solid rgba(34,197,94,0.15)',
            color: '#e2ede6', fontSize: 14, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: 'all 0.3s',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: `${activeRole?.color || '#22c55e'}15` }}>
                <ActiveIcon size={14} color={activeRole?.color} />
              </span>
              {t(activeRole?.labelKey || '')}
            </span>
            <ChevronDown size={16} style={{ color: '#3d5a44', transition: 'transform 0.2s', transform: roleDropdownOpen ? 'rotate(180deg)' : 'none' }} />
          </button>
          {roleDropdownOpen && (
            <div style={{
              position: 'absolute', top: '100%', marginTop: 6, width: '100%', zIndex: 50,
              background: 'rgba(10,15,12,0.98)', border: '1px solid rgba(34,197,94,0.15)',
              borderRadius: 12, overflow: 'hidden', backdropFilter: 'blur(20px)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            }}>
              {roles.map(r => {
                const Icon = r.icon;
                return (
                  <button key={r.value} onClick={() => { setSelectedRole(r.value); setRoleDropdownOpen(false); }} style={{
                    width: '100%', padding: '12px 18px', border: 'none',
                    background: selectedRole === r.value ? 'rgba(34,197,94,0.08)' : 'transparent',
                    color: selectedRole === r.value ? '#22c55e' : '#e2ede6',
                    fontSize: 13, fontWeight: selectedRole === r.value ? 600 : 400,
                    fontFamily: "'Outfit', sans-serif", cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'all 0.2s', textAlign: 'left',
                    borderLeft: selectedRole === r.value ? `2px solid ${r.color}` : '2px solid transparent',
                  }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(34,197,94,0.06)'; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.background = selectedRole === r.value ? 'rgba(34,197,94,0.08)' : 'transparent'; }}
                  >
                    <Icon size={14} color={r.color} />
                    {t(r.labelKey)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {showRegister && (
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#7a9a82', marginBottom: 6 }}>Name</label>
              <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} className="login-input" />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#7a9a82', marginBottom: 6 }}>{t('login_page.email')}</label>
            <input type="email" placeholder={t('login_page.email')} value={email} onChange={e => setEmail(e.target.value)} className="login-input" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#7a9a82', marginBottom: 6 }}>{t('login_page.password')}</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? "text" : "password"} placeholder={t('login_page.password')} value={password} onChange={e => setPassword(e.target.value)}
                className="login-input" style={{ paddingRight: 48 }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#3d5a44',
                transition: 'color 0.2s', padding: 0, display: 'flex',
              }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: '#ef4444', padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.15)' }}>{error}</p>
          )}

          <button type="submit" disabled={loginLoading} className="login-btn-primary">
            <LogIn size={18} /> {loginLoading ? (showRegister ? 'Creating account...' : t('login_page.signing_in')) : (showRegister ? 'Create Account' : t('login_page.login'))}
          </button>
        </form>

        {!showRegister && (
          <button onClick={() => setShowRegister(true)} className="login-link login-link-green">
            Don't have an account? Register
          </button>
        )}

        {showRegister && (
          <button onClick={() => { setShowRegister(false); setName(""); setError(""); }} className="login-link">
            Already have an account? Login
          </button>
        )}

        <button onClick={() => setSelectedRole(null)} className="login-link">
          <ArrowLeft size={14} /> {t('login_page.back')}
        </button>

        <p style={{ fontSize: 11, color: '#3d5a44', textAlign: 'center', marginTop: 16 }}>{t('login_page.contact_admin')}</p>
      </div>
    </div>
  );
}
