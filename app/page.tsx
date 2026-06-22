'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from 'framer-motion';
import { Scissors, ShieldCheck, Zap, Clock, ArrowLeft, CheckCircle2, Menu, X, ChevronDown, Star, Sparkles, FileText, Bell } from 'lucide-react';

/* ─── animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const fadeLeft = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.13 } },
};

/* ─── floating particle ─── */
function Particle({ x, y, size, delay, color }: { x: string; y: string; size: number; delay: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, background: color, opacity: 0.18 }}
      animate={{ y: [0, -28, 0], opacity: [0.12, 0.3, 0.12] }}
      transition={{ duration: 5 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

/* ─── animated counter ─── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 50);
    const interval = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(interval); }
      else setCount(start);
    }, 28);
    return () => clearInterval(interval);
  }, [inView, to]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── mobile menu ─── */
function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const links = [
    { label: 'איך זה עובד?', href: '#how-it-works' },
    { label: 'למה אנחנו?', href: '#benefits' },
    { label: 'החוק לטובתך', href: '#law' },
  ];
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 z-[998] md:hidden backdrop-blur-sm"
          />
          {/* Drawer — slides in from right (RTL) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full z-[999] bg-slate-50 flex flex-col md:hidden"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6 bg-white border-b border-slate-100">
              <button onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-slate-200 text-slate-500">
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-black tracking-tight text-slate-900">CUT<span className="text-blue-600">ME</span></span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Scissors className="h-5 w-5 -rotate-45" />
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="flex-1 flex flex-col justify-start px-6 pt-8 gap-3">
              {links.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.08 }}
                  className="flex items-center justify-between rounded-2xl bg-white border border-slate-100 px-6 py-5 text-2xl font-bold text-slate-800 shadow-sm active:bg-blue-50 active:text-blue-600 transition-all"
                >
                  {item.label}
                  <ArrowLeft className="h-6 w-6 text-slate-300 shrink-0" />
                </motion.a>
              ))}
            </div>

            {/* CTA */}
            <div className="px-6 pb-12 pt-6 space-y-3">
              <motion.a
                href="/disconnect"
                onClick={onClose}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-3 w-full rounded-2xl bg-blue-600 py-5 text-xl font-extrabold text-white shadow-xl shadow-blue-600/25"
              >
                <Scissors className="h-5 w-5" />
                בצע ניתוק עכשיו
              </motion.a>
              <p className="text-center text-sm text-slate-400 font-medium">תשלום על בסיס הצלחה בלבד</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── main page ─── */
export default function CutmeLandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const springY = useSpring(heroY, { stiffness: 60, damping: 20 });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased overflow-x-hidden" dir="rtl">

      {/* ── NAVBAR ── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md relative"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: -15, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20"
            >
              <Scissors className="h-4 w-4 sm:h-5 sm:w-5 -rotate-45" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black tracking-tight text-blue-600">CUT<span className="text-cyan-500">ME</span></span>
              <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 -mt-0.5">שירותי ניתוק חכמים</span>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            {[
              { label: 'איך זה עובד?', href: '#how-it-works' },
              { label: 'למה אנחנו?', href: '#benefits' },
              { label: 'החוק לטובתך', href: '#law' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative py-1 hover:text-blue-600 transition-colors after:absolute after:bottom-0 after:right-0 after:h-[2px] after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="/disconnect"
              className="hidden sm:inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/15 hover:bg-blue-700 transition-colors"
            >
              להתנתק עכשיו
            </motion.a>
            {/* Mobile CTA — tiny */}
            <a
              href="/disconnect"
              className="sm:hidden inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white"
            >
              התנתק
            </a>
            {/* Burger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-600"
              aria-label="תפריט"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-transparent flex items-center">
        {/* Animated background blobs */}
        <motion.div style={{ y: springY }} className="absolute inset-0 pointer-events-none -z-10">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[-5%] left-[15%] h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-cyan-200/50 blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.4, 0.25] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute bottom-[5%] right-[10%] h-72 w-72 sm:h-[28rem] sm:w-[28rem] rounded-full bg-blue-200/40 blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], x: [0, 30, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            className="absolute top-[40%] right-[30%] h-48 w-48 rounded-full bg-indigo-200/30 blur-3xl"
          />
          {/* Particles */}
          <Particle x="8%" y="20%" size={12} delay={0} color="#3b82f6" />
          <Particle x="18%" y="60%" size={8} delay={1.2} color="#06b6d4" />
          <Particle x="75%" y="15%" size={10} delay={0.7} color="#3b82f6" />
          <Particle x="85%" y="55%" size={14} delay={2} color="#06b6d4" />
          <Particle x="45%" y="80%" size={7} delay={1.5} color="#6366f1" />
          <Particle x="60%" y="30%" size={9} delay={0.4} color="#3b82f6" />
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,1) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        </motion.div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-16 items-center">

            {/* Text */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="lg:col-span-7 flex flex-col items-center lg:items-start space-y-5 sm:space-y-6 text-center lg:text-right min-h-[100svh] lg:min-h-0 justify-center py-16 lg:py-32"
            >
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-blue-700"
              >
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 shrink-0" />
                <span>ניתוק רשמי תוך 3 ימי עסקים לפי חוק</span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]"
              >
                נמאס לך לנסות להתנתק{' '}
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-l from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  מחברות בטלפון?
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="max-w-xl text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed"
              >
                בלי להמתין שעות בטלפון, בלי נציגי שימור מתישים ובלי ויכוחים. ממלאים טופס קצר ב-2 דקות, ואנחנו מנתקים אותך מסלקום, יס, הוט — או כל חברה אחרת.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-2"
              >
                <motion.a
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  href="/disconnect"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white shadow-xl shadow-blue-600/25 hover:bg-blue-700 transition-colors"
                >
                  <span>מתחילים כאן: בצע ניתוק עכשיו</span>
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.01 }}
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-slate-700 shadow-sm hover:border-slate-300 transition-colors"
                >
                  <span>איך זה עובד?</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </motion.a>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-slate-500 pt-2"
              >
                {['אבטחת מידע מלאה', 'אישור חתום למייל', 'חוקי 100%'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-cyan-500 shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </motion.div>

              {/* Support cards */}
              <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-1">
                <a href="/disconnect"
                  className="group flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-3.5 text-right transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                    <ShieldCheck className="h-4.5 w-4.5 h-[18px] w-[18px] text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-emerald-800">לא נותקת — לא שילמת</p>
                    <p className="text-[11px] text-emerald-600 leading-snug">המשיכו לחייב אותך? נטפל בזה</p>
                  </div>
                  <ArrowLeft className="h-3.5 w-3.5 text-emerald-400 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
                </a>
                <a href="mailto:support@cutme.co.il"
                  className="group flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 px-4 py-3.5 text-right transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                    <Bell className="h-[18px] w-[18px] text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-blue-800">לא מצאת את החברה?</p>
                    <p className="text-[11px] text-blue-600 leading-snug">כתוב לנו — נבצע את הניתוק עבורך</p>
                  </div>
                  <ArrowLeft className="h-3.5 w-3.5 text-blue-400 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
                </a>
              </motion.div>
            </motion.div>

            {/* Card visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 flex justify-center w-full pb-16 lg:py-32"
            >
              <div className="relative w-full max-w-[340px] sm:max-w-sm">
                {/* Glow behind card */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/20 to-cyan-400/10 blur-2xl scale-110" />
                <div className="relative rounded-3xl border border-slate-200/70 bg-white p-6 sm:p-8 shadow-2xl shadow-slate-300/30">
                  {/* Zap badge */}
                  <motion.div
                    animate={{ y: [0, -7, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-4 -right-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                  >
                    <Zap className="h-5 w-5" />
                  </motion.div>
                  {/* Sparkle badge */}
                  <motion.div
                    animate={{ y: [0, 7, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute -bottom-4 -left-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>

                  <div className="space-y-5">
                    <div className="space-y-2 border-b border-slate-100 pb-4">
                      <div className="h-2 w-1/3 rounded-full bg-slate-200" />
                      <div className="h-4 w-3/4 rounded-full bg-slate-300" />
                    </div>
                    <div className="space-y-2.5">
                      {/* HOT row */}
                      <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
                        <div className="flex items-center gap-3">
                          <img src={`https://img.logo.dev/hot.net.il?token=${process.env.NEXT_PUBLIC_LOGO_DEV_PK}&size=40&format=png`} alt="הוט" className="h-11 w-11 shrink-0 rounded-lg object-contain bg-white border border-slate-100 p-0.5" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                          <div className="space-y-1">
                            <div className="h-2.5 w-16 rounded-full bg-slate-300" />
                            <div className="h-2 w-10 rounded-full bg-slate-200" />
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 border border-amber-100">בטיפול</span>
                      </div>
                      {/* Cellcom row */}
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.9, duration: 0.4 }}
                        className="flex items-center justify-between rounded-xl bg-blue-50/60 p-3 border border-blue-100/70"
                      >
                        <div className="flex items-center gap-3">
                          <img src={`https://img.logo.dev/cellcom.co.il?token=${process.env.NEXT_PUBLIC_LOGO_DEV_PK}&size=40&format=png`} alt="סלקום" className="h-11 w-11 shrink-0 rounded-lg object-contain bg-white border border-slate-100 p-0.5" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                          <div className="space-y-1">
                            <div className="h-2.5 w-14 rounded-full bg-slate-300" />
                            <div className="h-2 w-9 rounded-full bg-slate-200" />
                          </div>
                        </div>
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.3 }}
                          className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-100"
                        >
                          ✓ נותק
                        </motion.span>
                      </motion.div>
                      {/* YES row */}
                      <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
                        <div className="flex items-center gap-3">
                          <img src={`https://img.logo.dev/yes.co.il?token=${process.env.NEXT_PUBLIC_LOGO_DEV_PK}&size=40&format=png`} alt="YES" className="h-11 w-11 shrink-0 rounded-lg object-contain bg-white border border-slate-100 p-0.5" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                          <div className="space-y-1">
                            <div className="h-2.5 w-12 rounded-full bg-slate-300" />
                            <div className="h-2 w-8 rounded-full bg-slate-200" />
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 border border-slate-200">ממתין</span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 p-4 text-center text-white">
                      <p className="text-xs font-medium opacity-75">דמי שירות סמליים</p>
                      <p className="text-2xl font-black mt-0.5">₪29 בלבד</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400"
        >
          <span className="text-xs font-medium">גלול למטה</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS STRIP ── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
        className="relative z-10 -mt-4 sm:-mt-8 py-8 sm:py-10 bg-white border-y border-slate-200/60 shadow-sm"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 grid grid-cols-3 gap-4 sm:gap-8 text-center">
          {[
            { value: 3200, suffix: '+', label: 'ניתוקים בוצעו' },
            { value: 3, suffix: ' ימים', label: 'זמן ניתוק מרבי' },
            { value: 98, suffix: '%', label: 'לקוחות מרוצים' },
          ].map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="flex flex-col items-center">
              <span className="text-2xl sm:text-4xl font-black text-blue-600">
                <Counter to={s.value} suffix={s.suffix} />
              </span>
              <span className="mt-1 text-[11px] sm:text-sm text-slate-500 font-medium">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="relative py-16 sm:py-24 bg-white overflow-hidden">
        {/* bg decoration */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <motion.div
            animate={{ x: [0, 20, 0], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute top-0 right-0 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl"
          />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs sm:text-sm font-semibold text-blue-600">
              <Zap className="h-3.5 w-3.5" /> 3 שלבים פשוטים
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
              איך המערכת מנתקת אותך?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sm sm:text-lg text-slate-600">
              הכול אוטומטי, חוקי ופשוט. אתה רק ממלא פרטים — אנחנו עושים את השאר.
            </motion.p>
          </motion.div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-8">
            {/* connecting line — desktop only */}
            <div className="hidden md:block absolute top-12 right-[calc(16.67%+24px)] left-[calc(16.67%+24px)] h-px bg-gradient-to-l from-blue-300/60 via-cyan-300/60 to-blue-300/60" />

            {[
              { n: '1', icon: <FileText className="h-5 w-5" />, title: 'מילוי טופס מהיר', desc: 'בוחרים חברה, מזינים פרטי מנוי בסיסיים — לוקח פחות מ-2 דקות.', color: 'bg-blue-600', shadow: 'shadow-blue-600/20', numColor: 'text-blue-200' },
              { n: '2', icon: <Scissors className="h-5 w-5 -rotate-45" />, title: 'הפקת מסמך ושליחה', desc: 'המערכת מייצרת PDF חתום ושולחת אותו למחלקת הניתוקים באופן אוטומטי.', color: 'bg-cyan-500', shadow: 'shadow-cyan-500/20', numColor: 'text-cyan-200' },
              { n: '3', icon: <Bell className="h-5 w-5" />, title: 'אישור סופי למייל', desc: 'מעקב אוטומטי מול החברה. ברגע שאושר — מייל מסודר נשלח אליך.', color: 'bg-indigo-600', shadow: 'shadow-indigo-600/20', numColor: 'text-indigo-200' },
            ].map((step, i, arr) => (
              <React.Fragment key={step.n}>
                <motion.div
                  initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
                  variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } }}
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  className="relative flex flex-col items-center md:items-start text-center md:text-right p-6 rounded-2xl border border-slate-100 bg-slate-50/60 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${step.color} text-white shadow-md ${step.shadow} mb-5 text-lg font-bold`}>
                    {step.icon}
                  </div>
                  <span className={`absolute top-3 left-4 text-6xl font-black select-none leading-none ${step.numColor}`}>{step.n}</span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </motion.div>
                {i < arr.length - 1 && (
                  <div className="md:hidden flex justify-center py-2">
                    <div className="w-px h-10 border-r-2 border-dashed border-slate-300" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section id="benefits" className="relative py-16 sm:py-24 bg-slate-50 overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 14, repeat: Infinity }}
            className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cyan-100/40 blur-3xl"
          />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
          >
            {/* Text side */}
            <div className="space-y-6 sm:space-y-8 text-center lg:text-right">
              <motion.div variants={fadeLeft} className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs sm:text-sm font-semibold text-blue-600">
                <Star className="h-3.5 w-3.5" /> למה לבחור בנו?
              </motion.div>
              <motion.h2 variants={fadeLeft} className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                אנחנו עושים את מה שחברות<br className="hidden sm:block" /> התקשורת <span className="text-blue-600">לא רוצות</span>
              </motion.h2>
              <motion.div variants={stagger} className="space-y-3 sm:space-y-4">
                {[
                  { title: 'תשלום על בסיס הצלחה בלבד', desc: 'לא נותקת — לא שילמת. אנחנו גובים רק אם הניתוק בוצע בפועל.' },
                  { title: 'מהיר ופשוט', desc: 'הטופס שלנו לוקח 2 דקות. לא צריך להסביר לאיש שירות מתיש.' },
                  { title: 'מעקב אוטומטי', desc: 'המערכת עוקבת אחרי הבקשה עבורך ומדווחת ברגע שהניתוק אושר.' },
                  { title: 'ראיה משפטית', desc: 'המסמך שאנחנו מפיקים תקף כראיה משפטית מלאה בכל מחלוקת עתידית.' },
                ].map((b) => (
                  <motion.div
                    key={b.title}
                    variants={fadeLeft}
                    className="flex items-start gap-3 text-right"
                  >
                    <CheckCircle2 className="h-5 w-5 text-cyan-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 text-sm sm:text-base">{b.title} — </span>
                      <span className="text-slate-600 text-sm sm:text-base">{b.desc}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Visual side — review cards stack */}
            <motion.div variants={fadeUp} className="relative flex flex-col gap-3 sm:gap-4 max-w-sm mx-auto lg:mx-0 w-full">
              {[
                { name: 'מיכל כ.', text: 'ניתקתי מהוט אחרי 3 שנות ויכוחים. לקח להם פחות מ-48 שעות לאשר אחרי שCUTME שלחה את המסמך!', stars: 5 },
                { name: 'אבי ש.', text: 'לא האמנתי שיהיה כל כך פשוט. שילמתי 29 שקל וחסכתי מאות בחודשים הבאים.', stars: 5 },
                { name: 'תמר ל.', text: 'הנציגים של סלקום הציקו לי שלושה חודשים. אחרי CutMe — שקט.', stars: 5 },
              ].map((review, i) => (
                <motion.div
                  key={review.name}
                  initial={{ opacity: 0, x: i % 2 === 0 ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="rounded-2xl bg-white border border-slate-200/70 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: review.stars }).map((_, s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">"{review.text}"</p>
                  <span className="text-xs font-bold text-slate-500">{review.name}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── LAW SECTION ── */}
      <section id="law" className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-10 md:p-14 shadow-2xl text-white relative overflow-hidden"
          >
            {/* decorations */}
            <div className="absolute -bottom-10 -left-10 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="relative max-w-3xl space-y-4 sm:space-y-6 text-right">
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs sm:text-sm font-semibold text-cyan-400">
                <ShieldCheck className="h-3.5 w-3.5" /> החוק לטובתך
              </div>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold leading-tight">
                חובת ניתוק תוך{' '}
                <span className="text-cyan-400">3 ימי עסקים</span>{' '}
                — זה החוק
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base md:text-lg">
                לפי חוק הגנת הצרכן בישראל, מרגע שנשלחה בקשת ניתוק בכתב — חברות התקשורת <span className="text-cyan-400 font-bold">מחויבות בחוק</span> לנתק אותך תוך 3 ימי עסקים. כל חיוב לאחר מכן הוא עבירה על החוק המאפשרת תביעת פיצויים. המסמכים שמערכתנו מפיקה מהווים ראיה משפטית מלאה.
              </p>
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="/disconnect"
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 sm:px-7 py-3 text-sm sm:text-base font-bold text-white shadow-lg shadow-cyan-500/30 hover:bg-cyan-400 transition-colors"
              >
                נצל את החוק עכשיו
                <ArrowLeft className="h-4 w-4" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="start-disconnect" className="relative py-16 sm:py-24 bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-0 right-1/4 h-80 w-80 rounded-full bg-blue-600/30 blur-3xl" />
          <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.22, 0.1] }} transition={{ duration: 13, repeat: Infinity, delay: 2 }}
            className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
        </div>
        <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 text-xs sm:text-sm font-semibold text-blue-400">
              <Scissors className="h-3.5 w-3.5" /> 3 שלבים פשוטים · ₪29 בלבד
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              מוכן לחתוך<br className="sm:hidden" /> את הקשר?
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg max-w-md mx-auto leading-relaxed">
              בחר חברה, מלא פרטים — המערכת שולחת בשמך בקשה רשמית וחוקית תוך דקות.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.a
              whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
              href="/disconnect"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 text-base sm:text-lg font-black text-white shadow-2xl shadow-blue-600/30 hover:bg-blue-500 transition-colors"
            >
              <Scissors className="h-5 w-5 -rotate-45" />
              בצע ניתוק עכשיו
              <ArrowLeft className="h-5 w-5" />
            </motion.a>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
            {[
              { icon: ShieldCheck, text: 'מאובטח ומוצפן' },
              { icon: CheckCircle2, text: 'ניתוק תוך 3 ימים לפי חוק' },
              { icon: Zap, text: 'תשלום חד-פעמי ₪29' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-blue-500" /> {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-right">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Scissors className="h-4 w-4 -rotate-45" />
            </div>
            <span className="text-lg font-black text-white">CUT<span className="text-cyan-400">ME</span></span>
            <span className="text-xs text-slate-500">© {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            האתר הינו שירות פרטי ואינו מטעם חברות התקשורת בישראל. השירות כרוך בדמי טיפול וסליקה סמליים עבור הפקת הבקשה ושיגורה האוטומטי.
          </p>
        </div>
      </footer>

    </div>
  );
}
