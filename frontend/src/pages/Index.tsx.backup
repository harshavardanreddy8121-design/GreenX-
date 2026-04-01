import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { GreenXLogo } from "@/components/GreenXLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  AlertTriangle, Sprout, Plane, ClipboardList, IndianRupee, Stethoscope,
  Mail, Phone, MapPin, ArrowRight, Instagram, Twitter, Linkedin, Youtube,
  Users, Map, Cpu, FlaskConical, CheckCircle, Package, TrendingUp, Droplets
} from "lucide-react";
import { useState } from "react";

const roleRoutes: Record<string, string> = {
  landowner: '/dashboard/landowner',
  fieldmanager: '/dashboard/field-manager',
  expert: '/dashboard/expert',
  worker: '/worker',
  user: '/worker',
  admin: '/dashboard/cluster-admin',
};

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, loading } = useAuth();
  const { t } = useTranslation();
  const [showPlant, setShowPlant] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated && role) {
      navigate(roleRoutes[role] || '/');
    }
  }, [isAuthenticated, role, loading, navigate]);

  useEffect(() => {
    // Trigger plant animation once on mount
    const timer = setTimeout(() => {
      setShowPlant(true);
      setTimeout(() => setShowPlant(false), 5000);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const problemItems = [
    {
      icon: Map,
      title: t('landing.problem.items.fragmented.title'),
      text: t('landing.problem.items.fragmented.text'),
      cardStyle: 'bg-gradient-to-br from-emerald-50 to-lime-100 border-emerald-200/80 dark:from-emerald-950/50 dark:to-lime-900/30 dark:border-emerald-700/60',
      iconStyle: 'bg-emerald-200/70 text-emerald-800 dark:bg-emerald-800/60 dark:text-emerald-100',
    },
    {
      icon: Users,
      title: t('landing.problem.items.labor.title'),
      text: t('landing.problem.items.labor.text'),
      cardStyle: 'bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200/80 dark:from-amber-950/50 dark:to-orange-900/35 dark:border-amber-700/60',
      iconStyle: 'bg-amber-200/80 text-amber-900 dark:bg-amber-800/60 dark:text-amber-100',
    },
    {
      icon: ClipboardList,
      title: t('landing.problem.items.management.title'),
      text: t('landing.problem.items.management.text'),
      cardStyle: 'bg-gradient-to-br from-sky-50 to-cyan-100 border-sky-200/80 dark:from-sky-950/45 dark:to-cyan-900/30 dark:border-sky-700/60',
      iconStyle: 'bg-sky-200/80 text-sky-900 dark:bg-sky-800/60 dark:text-sky-100',
    },
    {
      icon: AlertTriangle,
      title: t('landing.problem.items.unmanaged.title'),
      text: t('landing.problem.items.unmanaged.text'),
      cardStyle: 'bg-gradient-to-br from-rose-50 to-red-100 border-rose-200/80 dark:from-rose-950/45 dark:to-red-900/30 dark:border-rose-700/60',
      iconStyle: 'bg-rose-200/80 text-rose-900 dark:bg-rose-800/60 dark:text-rose-100',
    },
  ];

  const solutionItems = [
    {
      icon: Map,
      title: t('landing.solution.items.aggregation.title'),
      text: t('landing.solution.items.aggregation.text'),
      cardStyle: 'bg-gradient-to-br from-teal-50 to-emerald-100 border-teal-200/80 dark:from-teal-950/50 dark:to-emerald-900/35 dark:border-teal-700/60',
      iconStyle: 'bg-teal-200/70 text-teal-900 dark:bg-teal-800/60 dark:text-teal-100',
    },
    {
      icon: FlaskConical,
      title: t('landing.solution.items.soil.title'),
      text: t('landing.solution.items.soil.text'),
      cardStyle: 'bg-gradient-to-br from-violet-50 to-indigo-100 border-violet-200/80 dark:from-violet-950/45 dark:to-indigo-900/35 dark:border-violet-700/60',
      iconStyle: 'bg-violet-200/70 text-violet-900 dark:bg-violet-800/60 dark:text-violet-100',
    },
    {
      icon: Users,
      title: t('landing.solution.items.management.title'),
      text: t('landing.solution.items.management.text'),
      cardStyle: 'bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200/80 dark:from-orange-950/50 dark:to-amber-900/35 dark:border-orange-700/60',
      iconStyle: 'bg-orange-200/70 text-orange-900 dark:bg-orange-800/60 dark:text-orange-100',
    },
    {
      icon: Cpu,
      title: t('landing.solution.items.monitoring.title'),
      text: t('landing.solution.items.monitoring.text'),
      cardStyle: 'bg-gradient-to-br from-sky-50 to-blue-100 border-sky-200/80 dark:from-sky-950/45 dark:to-blue-900/35 dark:border-sky-700/60',
      iconStyle: 'bg-sky-200/70 text-sky-900 dark:bg-sky-800/60 dark:text-sky-100',
    },
  ];

  const howItWorks = [
    {
      icon: MapPin,
      title: t('landing.process.items.registration'),
      cardStyle: 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200/80 dark:from-green-950/45 dark:to-emerald-900/35 dark:border-green-700/60',
      iconStyle: 'bg-green-200/80 text-green-900 dark:bg-green-800/60 dark:text-green-100',
    },
    {
      icon: FlaskConical,
      title: t('landing.process.items.soil'),
      cardStyle: 'bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200/80 dark:from-blue-950/45 dark:to-cyan-900/35 dark:border-blue-700/60',
      iconStyle: 'bg-blue-200/80 text-blue-900 dark:bg-blue-800/60 dark:text-blue-100',
    },
    {
      icon: Sprout,
      title: t('landing.process.items.crop'),
      cardStyle: 'bg-gradient-to-br from-lime-50 to-emerald-100 border-lime-200/80 dark:from-lime-950/45 dark:to-emerald-900/35 dark:border-lime-700/60',
      iconStyle: 'bg-lime-200/80 text-lime-900 dark:bg-lime-800/60 dark:text-lime-100',
    },
    {
      icon: Users,
      title: t('landing.process.items.operations'),
      cardStyle: 'bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200/80 dark:from-amber-950/45 dark:to-orange-900/35 dark:border-amber-700/60',
      iconStyle: 'bg-amber-200/80 text-amber-900 dark:bg-amber-800/60 dark:text-amber-100',
    },
    {
      icon: TrendingUp,
      title: t('landing.process.items.monitoring'),
      cardStyle: 'bg-gradient-to-br from-violet-50 to-purple-100 border-violet-200/80 dark:from-violet-950/45 dark:to-purple-900/35 dark:border-violet-700/60',
      iconStyle: 'bg-violet-200/80 text-violet-900 dark:bg-violet-800/60 dark:text-violet-100',
    },
    {
      icon: IndianRupee,
      title: t('landing.process.items.harvest'),
      cardStyle: 'bg-gradient-to-br from-rose-50 to-pink-100 border-rose-200/80 dark:from-rose-950/45 dark:to-pink-900/35 dark:border-rose-700/60',
      iconStyle: 'bg-rose-200/80 text-rose-900 dark:bg-rose-800/60 dark:text-rose-100',
    },
  ];

  const transparencyCards = [
    {
      label: t('landing.transparency.cards.live.label'),
      value: t('landing.transparency.cards.live.value'),
      image: '/ai-live-updates.svg',
      headline: t('landing.transparency.cards.live.headline'),
      subline: t('landing.transparency.cards.live.subline'),
      style: 'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200/80 dark:from-emerald-950/45 dark:to-green-900/35 dark:border-emerald-700/60',
    },
    {
      label: t('landing.transparency.cards.crop.label'),
      value: t('landing.transparency.cards.crop.value'),
      image: '/ai-crop-growth.svg',
      headline: t('landing.transparency.cards.crop.headline'),
      subline: t('landing.transparency.cards.crop.subline'),
      style: 'bg-gradient-to-br from-sky-50 to-cyan-100 border-sky-200/80 dark:from-sky-950/45 dark:to-cyan-900/35 dark:border-sky-700/60',
    },
    {
      label: t('landing.transparency.cards.input.label'),
      value: t('landing.transparency.cards.input.value'),
      image: '/ai-input-transparency.svg',
      headline: t('landing.transparency.cards.input.headline'),
      subline: t('landing.transparency.cards.input.subline'),
      style: 'bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200/80 dark:from-amber-950/45 dark:to-orange-900/35 dark:border-amber-700/60',
    },
    {
      label: t('landing.transparency.cards.profit.label'),
      value: t('landing.transparency.cards.profit.value'),
      image: '/ai-profit-forecast.svg',
      headline: t('landing.transparency.cards.profit.headline'),
      subline: t('landing.transparency.cards.profit.subline'),
      style: 'bg-gradient-to-br from-violet-50 to-purple-100 border-violet-200/80 dark:from-violet-950/45 dark:to-purple-900/35 dark:border-violet-700/60',
    },
  ];

  const contactCards = [
    {
      icon: Mail,
      title: t('landing.contact.cards.email.title'),
      value: t('landing.contact.cards.email.value'),
      style: 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200/80 dark:from-blue-950/45 dark:to-indigo-900/35 dark:border-blue-700/60',
      iconStyle: 'text-blue-700 dark:text-blue-300',
    },
    {
      icon: Phone,
      title: t('landing.contact.cards.phone.title'),
      value: t('landing.contact.cards.phone.value'),
      style: 'bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-200/80 dark:from-emerald-950/45 dark:to-teal-900/35 dark:border-emerald-700/60',
      iconStyle: 'text-emerald-700 dark:text-emerald-300',
    },
    {
      icon: MapPin,
      title: t('landing.contact.cards.address.title'),
      value: t('landing.contact.cards.address.value'),
      style: 'bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200/80 dark:from-amber-950/45 dark:to-yellow-900/35 dark:border-amber-700/60',
      iconStyle: 'text-amber-700 dark:text-amber-300',
    },
  ];

  const platformFeatures = [
    { icon: Cpu, title: t('landing.platform.features.landowner.title'), text: t('landing.platform.features.landowner.text') },
    { icon: ClipboardList, title: t('landing.platform.features.manager.title'), text: t('landing.platform.features.manager.text') },
    { icon: Stethoscope, title: t('landing.platform.features.soil.title'), text: t('landing.platform.features.soil.text') },
    { icon: Plane, title: t('landing.platform.features.monitoring.title'), text: t('landing.platform.features.monitoring.text') },
    { icon: Package, title: t('landing.platform.features.inventory.title'), text: t('landing.platform.features.inventory.text') },
  ];

  // Avoid unused variable linting while keeping translated platform content ready for future section rendering.
  void platformFeatures;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-card/90 backdrop-blur-lg border-b border-border">
        <div className="w-full px-4 py-3 flex items-center justify-between">
          <div className="absolute left-4 bg-gradient-to-br from-emerald-600/20 via-green-600/20 to-teal-600/20 dark:from-emerald-600/30 dark:via-green-600/30 dark:to-teal-600/30 px-4 py-2 rounded-xl backdrop-blur-md border border-emerald-400/30 dark:border-emerald-500/30 shadow-lg">
            <GreenXLogo size="sm" />
          </div>
          <div className="hidden md:flex items-center gap-3 text-sm mx-auto">
            <a href="#hero" className="px-4 py-2 rounded-lg font-medium text-foreground bg-primary/10 hover:bg-primary/20 hover:scale-105 transition-all shadow-sm hover:shadow-md">{t('nav.home')}</a>
            <a href="#problem" className="px-4 py-2 rounded-lg font-medium text-foreground bg-primary/10 hover:bg-primary/20 hover:scale-105 transition-all shadow-sm hover:shadow-md">{t('nav.problem')}</a>
            <a href="#solution" className="px-4 py-2 rounded-lg font-medium text-foreground bg-primary/10 hover:bg-primary/20 hover:scale-105 transition-all shadow-sm hover:shadow-md">{t('nav.solution')}</a>
            <a href="#platform" className="px-4 py-2 rounded-lg font-medium text-foreground bg-primary/10 hover:bg-primary/20 hover:scale-105 transition-all shadow-sm hover:shadow-md">{t('nav.platform')}</a>
            <a href="#contact" className="px-4 py-2 rounded-lg font-medium text-foreground bg-primary/10 hover:bg-primary/20 hover:scale-105 transition-all shadow-sm hover:shadow-md">{t('nav.contact')}</a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/workflow')}
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-primary/30 bg-primary/10 text-foreground hover:bg-primary/20 transition-colors"
            >
              Workflow
            </button>
            <LanguageSwitcher compact />
            <ThemeToggle />
            <button
              onClick={() => navigate('/login')}
              className="btn-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 hover:scale-105 transition-all shadow-lg hover:shadow-xl"
            >
              {t('nav.login')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(16 185 129) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-16 text-center">
          <h1 className="text-7xl md:text-8xl font-extrabold tracking-[0.15em] leading-tight flex justify-center items-center gap-2">
            <span className="text-[#39FF14] drop-shadow-[0_0_25px_#39FF14]">GREEN</span>
            <span className="inline-block text-7xl md:text-8xl relative overflow-visible" style={{ width: '1em', height: '1.2em' }}>
              <span
                className={`absolute inset-0 flex items-center justify-center text-white transition-all duration-[5000ms] ${showPlant ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
                  }`}
              >
                X
              </span>
              {/* Soil Line */}
              <span
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-800 to-transparent transition-all duration-500 ${showPlant ? 'opacity-100' : 'opacity-0'
                  }`}
                style={{ transform: showPlant ? 'translateY(0)' : 'translateY(20px)' }}
              />
              {/* Rising Plant */}
              <span
                className={`absolute inset-0 flex items-end justify-center text-[#39FF14] transition-all duration-[5000ms] ${showPlant ? 'opacity-100' : 'opacity-0'
                  }`}
                style={{
                  transform: showPlant ? 'translateY(-10%)' : 'translateY(100%)',
                  transitionDelay: showPlant ? '400ms' : '0ms'
                }}
              >
                <Sprout className="w-14 h-14 md:w-20 md:h-20" strokeWidth={2.5} />
              </span>
            </span>
          </h1>
          <p className="mt-4 text-sm md:text-base tracking-[0.2em] text-white/70">
            {t('hero.subtitle')}
          </p>

          <div className="max-w-3xl mx-auto mt-6">
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate('/land-register')}
                className="btn-gradient text-primary-foreground px-6 py-3 rounded-xl text-sm md:text-base font-semibold inline-flex items-center gap-2 shadow-2xl hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] hover:scale-105 transition-all"
              >
                {t('hero.land_register')} <ArrowRight className="w-4 h-4" />
              </button>
              <a href="#solution" className="px-6 py-3 rounded-xl text-sm md:text-base font-semibold border-2 border-white/50 text-white hover:bg-white/20 hover:border-white hover:scale-105 transition-all shadow-lg hover:shadow-xl">
                {t('hero.explore_model')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="py-12 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6 text-center">
            <h3 className="text-3xl font-display font-bold mb-4 relative inline-block px-6 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 dark:from-slate-200 dark:via-slate-100 dark:to-slate-200 bg-clip-text text-transparent">
                {t('landing.problem.heading')}
              </span>
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {problemItems.map((item) => (
              <div
                key={item.title}
                className={`rounded-xl p-5 text-left border shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${item.cardStyle}`}
              >
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-3 shadow-sm ${item.iconStyle}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground text-base mb-1">{item.title}</h3>
                <p className="text-xs text-foreground/75 dark:text-foreground/85">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section id="solution" className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-display font-bold mb-3 inline-block px-6 py-3 bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-teal-500/20 dark:from-emerald-500/30 dark:via-green-500/30 dark:to-teal-500/30 rounded-2xl border-2 border-emerald-500/40 shadow-lg">
              <span className="bg-gradient-to-r from-emerald-700 via-green-700 to-teal-700 dark:from-emerald-300 dark:via-green-300 dark:to-teal-300 bg-clip-text text-transparent">
                {t('landing.solution.heading')}
              </span>
            </h2>
            <p className="text-lg italic font-semibold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 dark:from-emerald-400 dark:via-green-400 dark:to-teal-400 bg-clip-text text-transparent max-w-2xl mx-auto mt-2">
              {t('landing.solution.tagline')}
            </p>
          </div>

          <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-4 mb-6">
            {solutionItems.map((item) => (
              <div key={item.title} className={`rounded-xl p-5 border shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${item.cardStyle}`}>
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-3 mx-auto shadow-sm ${item.iconStyle}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground text-base mb-1 text-center">{item.title}</h3>
                <p className="text-xs text-foreground/75 dark:text-foreground/80 text-center">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="process" className="py-12 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-center mb-6 relative">
            <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-40"></span>
              <span className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-extrabold">
                {t('landing.process.heading')}
              </span>
            </span>
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {howItWorks.map((step, idx) => (
              <div key={step.title} className={`rounded-xl p-5 flex gap-3 items-start border shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${step.cardStyle}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${step.iconStyle}`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-foreground/60 dark:text-foreground/70">{t('landing.process.step', { count: idx + 1 })}</p>
                  <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency */}
      <section id="transparency" className="py-12 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-4 items-center">
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-emerald-950/35 dark:via-slate-950 dark:to-cyan-950/30 p-5 shadow-lg dark:shadow-emerald-500/10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300 mb-3">{t('landing.transparency.kicker')}</p>
              <h2 className="text-3xl font-display font-bold mb-3 relative">
                <span className="bg-gradient-to-r from-emerald-800 via-green-800 to-emerald-700 dark:from-emerald-200 dark:via-green-200 dark:to-emerald-100 bg-clip-text text-transparent drop-shadow-sm">
                  {t('landing.transparency.heading')}
                </span>
                <div className="absolute -bottom-1 left-0 w-24 h-0.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full"></div>
              </h2>
              <p className="text-sm italic font-medium text-emerald-700 dark:text-emerald-300 mb-3 border-l-2 border-emerald-500 pl-3">
                {t('landing.transparency.tagline')}
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-foreground"><CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-300" /> {t('landing.transparency.points.live')}</div>
                <div className="flex items-center gap-3 text-sm text-foreground"><Sprout className="w-4 h-4 text-cyan-600 dark:text-cyan-300" /> {t('landing.transparency.points.crop')}</div>
                <div className="flex items-center gap-3 text-sm text-foreground"><Droplets className="w-4 h-4 text-amber-600 dark:text-amber-300" /> {t('landing.transparency.points.input')}</div>
                <div className="flex items-center gap-3 text-sm text-foreground"><TrendingUp className="w-4 h-4 text-violet-600 dark:text-violet-300" /> {t('landing.transparency.points.profit')}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {transparencyCards.map((card) => (
                <div key={card.label} className={`rounded-xl border shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ${card.style}`}>
                  <div className="relative h-24">
                    <img src={card.image} alt={card.headline} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                    <p className="absolute left-3 bottom-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/95">{card.headline}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-foreground/65 dark:text-foreground/75">{card.label}</p>
                    <p className="text-lg font-semibold text-foreground">{card.value}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-foreground/70 dark:text-foreground/80">{card.subline}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section id="vision" className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="rounded-2xl overflow-hidden border border-border">
            <div className="p-6 bg-card text-center">
              <h2 className="text-3xl font-display font-bold mb-4 inline-block px-8 py-2 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-violet-500/10 dark:from-violet-500/20 dark:via-purple-500/20 dark:to-violet-500/20 rounded-full border border-violet-500/30">
                <span className="bg-gradient-to-r from-violet-700 via-purple-700 to-violet-700 dark:from-violet-300 dark:via-purple-300 dark:to-violet-300 bg-clip-text text-transparent">
                  {t('landing.vision.heading')}
                </span>
              </h2>
              <p className="text-muted-foreground text-base">
                {t('landing.vision.description')}
              </p>
              <div className="mt-3 flex items-center justify-center gap-3 text-sm text-muted-foreground">
                <Cpu className="w-4 h-4 text-primary" /> {t('landing.vision.subline')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-12 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-center mb-8 relative">
            <span className="inline-block relative px-6 py-2">
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-lg opacity-20 dark:opacity-30 blur-sm"></span>
              <span className="relative bg-gradient-to-r from-cyan-700 via-blue-700 to-cyan-700 dark:from-cyan-300 dark:via-blue-300 dark:to-cyan-300 bg-clip-text text-transparent font-extrabold">
                {t('landing.contact.heading')}
              </span>
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contactCards.map((card) => (
              <div key={card.title} className={`rounded-xl p-6 text-center border shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${card.style}`}>
                <card.icon className={`w-8 h-8 mx-auto mb-3 ${card.iconStyle}`} />
                <p className="text-sm font-medium text-foreground">{card.title}</p>
                <p className="text-xs text-foreground/70 dark:text-foreground/80 mt-1">{card.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-4">{t('landing.social.heading')}</h3>
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
        <p className="text-center text-xs text-muted-foreground">{t('footer.copyright')}</p>
      </footer>
    </div>
  );
};

export default Index;
