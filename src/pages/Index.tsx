import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { GreenXLogo } from "@/components/GreenXLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import farmBg from "@/assets/farm-bg.jpg";
import {
  CloudSun, Sprout, Plane, ClipboardList, IndianRupee, Stethoscope,
  Mail, Phone, MapPin, ArrowRight, Instagram, Twitter, Linkedin, Youtube
} from "lucide-react";

const roleRoutes: Record<string, string> = {
  landowner: '/landowner', fieldmanager: '/fieldmanager',
  expert: '/expert', worker: '/worker', admin: '/admin',
};

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, loading } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && isAuthenticated && role) {
      navigate(roleRoutes[role] || '/');
    }
  }, [isAuthenticated, role, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const features = [
    { icon: CloudSun, key: 'weather' },
    { icon: Sprout, key: 'soil' },
    { icon: Plane, key: 'drone' },
    { icon: ClipboardList, key: 'task' },
    { icon: IndianRupee, key: 'finance' },
    { icon: Stethoscope, key: 'diagnostics' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-card/90 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <GreenXLogo size="sm" />
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#hero" className="hover:text-foreground transition-colors">{t('nav.home')}</a>
            <a href="#about" className="hover:text-foreground transition-colors">{t('nav.about')}</a>
            <a href="#features" className="hover:text-foreground transition-colors">{t('nav.features')}</a>
            <a href="#contact" className="hover:text-foreground transition-colors">{t('nav.contact')}</a>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <ThemeToggle />
            <button
              onClick={() => navigate('/login')}
              className="btn-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
            >
              {t('nav.login')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="hero" className="relative bg-black overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-24 md:py-40 text-center">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-[0.15em] leading-tight">
            <span className="text-[#39FF14] drop-shadow-[0_0_25px_#39FF14]">GREEN</span>
            <span className="text-white text-7xl md:text-8xl">X</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl tracking-[0.3em] text-white/80">
            WHERE LAND MEETS INTELLIGENCE
          </p>
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn-gradient text-primary-foreground px-8 py-3 rounded-xl text-lg font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-all shadow-lg"
          >
            {t('hero.cta')} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold text-foreground mb-6">{t('about.title')}</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {t('about.description')}
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-foreground text-center mb-12">{t('features.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.key} className="glass-card rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg btn-gradient flex items-center justify-center text-primary-foreground mb-4">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{t(`features.${f.key}`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`features.${f.key}_desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-foreground text-center mb-12">{t('contact.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-xl p-6 text-center">
              <Mail className="w-8 h-8 mx-auto mb-3 text-primary" />
              <p className="text-sm font-medium text-foreground">{t('contact.email')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('contact.email_val')}</p>
            </div>
            <div className="glass-card rounded-xl p-6 text-center">
              <Phone className="w-8 h-8 mx-auto mb-3 text-primary" />
              <p className="text-sm font-medium text-foreground">{t('contact.phone')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('contact.phone_val')}</p>
            </div>
            <div className="glass-card rounded-xl p-6 text-center">
              <MapPin className="w-8 h-8 mx-auto mb-3 text-primary" />
              <p className="text-sm font-medium text-foreground">{t('contact.address')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('contact.address_val')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-4">{t('social.title')}</h3>
          <div className="flex items-center justify-center gap-4">
            {[
              { icon: Instagram, href: 'https://instagram.com/greenx.agri' },
              { icon: Twitter, href: 'https://twitter.com/greenxagritech' },
              { icon: Linkedin, href: 'https://linkedin.com/company/greenxagritech' },
              { icon: Youtube, href: 'https://youtube.com/@greenxagritech' },
            ].map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
                <s.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <p className="text-center text-xs text-muted-foreground">© 2026 GreenX. Where land meets intelligence.</p>
      </footer>
    </div>
  );
};

export default Index;
