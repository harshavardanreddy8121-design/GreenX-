import { useState, useEffect } from "react";
import { Eye, EyeOff, LogIn, ArrowLeft, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GreenXLogo } from "@/components/GreenXLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import farmBg from "@/assets/farm-bg.jpg";

const roleRoutes: Record<string, string> = {
  landowner: '/landowner', fieldmanager: '/fieldmanager',
  expert: '/expert', worker: '/worker', admin: '/admin',
};

const roles = [
  { value: 'admin', labelKey: 'roles.admin' },
  { value: 'landowner', labelKey: 'roles.landowner' },
  { value: 'fieldmanager', labelKey: 'roles.fieldmanager' },
  { value: 'expert', labelKey: 'roles.expert' },
  { value: 'worker', labelKey: 'roles.worker' },
];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, role, loading, login } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && isAuthenticated && role) {
      navigate(roleRoutes[role] || '/');
    }
  }, [isAuthenticated, role, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoginLoading(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || "Login failed");
      } else if (result.role) {
        navigate(roleRoutes[result.role] || '/');
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) setError(String(error));
    } catch {
      setError("Google sign-in failed.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Role selection screen
  if (!selectedRole) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${farmBg})` }} />
        <div className="absolute inset-0 bg-foreground/40 dark:bg-background/70 backdrop-blur-[2px]" />

        <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in-up">
          <div className="absolute top-4 right-4 flex items-center gap-1">
            <LanguageSwitcher compact />
            <ThemeToggle />
          </div>
          <div className="glass-card rounded-2xl p-8 md:p-10">
            <div className="mb-8"><GreenXLogo size="lg" /></div>
            <h2 className="text-lg font-semibold text-foreground text-center mb-6">{t('login_page.select_role')}</h2>
            <div className="space-y-3">
              {roles.map(r => (
                <button
                  key={r.value}
                  onClick={() => setSelectedRole(r.value)}
                  className="w-full px-4 py-3 rounded-xl bg-muted/60 border border-border text-foreground hover:bg-primary/10 hover:border-primary/30 transition-all text-sm font-medium text-left"
                >
                  {t(r.labelKey)}
                </button>
              ))}
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">{t('login_page.or')}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button onClick={handleGoogleSignIn}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-all text-sm font-medium flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
              {t('login_page.google_signin')}
            </button>

            <button onClick={() => navigate('/')}
              className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1">
              <ArrowLeft className="w-4 h-4" /> {t('login_page.back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login form
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${farmBg})` }} />
      <div className="absolute inset-0 bg-foreground/40 dark:bg-background/70 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in-up">
        <div className="glass-card rounded-2xl p-8 md:p-10">
          <div className="mb-6"><GreenXLogo size="lg" /></div>

          {/* Role selector dropdown */}
          <div className="relative mb-6">
            <button onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground text-sm font-medium flex items-center justify-between">
              <span>{t(roles.find(r => r.value === selectedRole)?.labelKey || '')}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {roleDropdownOpen && (
              <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg z-50">
                {roles.map(r => (
                  <button key={r.value} onClick={() => { setSelectedRole(r.value); setRoleDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg ${selectedRole === r.value ? 'font-semibold text-primary' : 'text-foreground'}`}>
                    {t(r.labelKey)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">{t('login_page.email')}</label>
              <input id="email" type="email" placeholder={t('login_page.email')} value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">{t('login_page.password')}</label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} placeholder={t('login_page.password')} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button type="submit" disabled={loginLoading}
              className="w-full btn-gradient text-primary-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50">
              <LogIn className="w-5 h-5" /> {loginLoading ? t('login_page.signing_in') : t('login_page.login')}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">{t('login_page.or')}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button onClick={handleGoogleSignIn}
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-all text-sm font-medium flex items-center justify-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
            {t('login_page.google_signin')}
          </button>

          <button onClick={() => setSelectedRole(null)}
            className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1">
            <ArrowLeft className="w-4 h-4" /> {t('login_page.back')}
          </button>

          <p className="text-xs text-muted-foreground text-center mt-4">{t('login_page.contact_admin')}</p>
        </div>
      </div>
    </div>
  );
}
