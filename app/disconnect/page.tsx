'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scissors, Check, ArrowLeft, ArrowRight,
  Wifi, Dumbbell, Newspaper, User, Building2, Mail, Phone,
  MapPin, CreditCard, ShieldCheck, Clock, Zap, FileText,
  BadgeCheck, Star, Lock, Sparkles, Home, Hash, Search,
  ChevronRight, X, AlertCircle, Edit3, ChevronDown,
} from 'lucide-react';

/* ─── companies ─── */
const COMPANIES = [
  {
    id: 'telecom', category: 'ספקי תקשורת', Icon: Wifi, color: 'blue',
    items: ['סלקום','פלאפון','פרטנר','נטוויז\'ן','בזק','בזק בינלאומי','רמי לוי תקשורת','הוט מובייל','הוט','יס','אקספון','אנלימיטד','סלקום TV','פרטנר TV','סטינג TV','Free TV','גולן טלקום','019'],
  },
  {
    id: 'gym', category: 'מועדוני כושר', Icon: Dumbbell, color: 'violet',
    items: ['הולמס פלייס','גו אקטיב','גרייט שייפ','ספורטר','אייקון פיטנס','פרופיט','ספייס','Freefit / Move'],
  },
  {
    id: 'general', category: 'כללי', Icon: Newspaper, color: 'amber',
    items: ['תמי 4','מעיינות','ידיעות אחרונות','מעריב','עיתון הארץ','גלובס','לאישה','מפעל הפיס','ג\'רוזלם פוסט'],
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700' },
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700' },
};

const PREFIXES = ['050','051','052','053','054','055','056','057','058','072','073','074','076','077','078','02','03','04','08','09'];

/* ─── Validation helpers ─── */

// Israeli ID — 9 digits + Luhn check
function validateId(id: string): string | null {
  if (!id) return 'שדה חובה';
  if (!/^\d+$/.test(id)) return 'ת.ז. חייבת להכיל ספרות בלבד';
  if (id.length !== 9) return 'ת.ז. חייבת להכיל בדיוק 9 ספרות';
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let d = parseInt(id[i]) * (i % 2 === 0 ? 1 : 2);
    if (d > 9) d -= 9;
    sum += d;
  }
  if (sum % 10 !== 0) return 'מספר ת.ז. לא תקין';
  return null;
}

// Israeli phone — prefix + 7 digits
function validatePhone(prefix: string, phone: string, label = 'טלפון'): string | null {
  if (!phone) return 'שדה חובה';
  if (!/^\d{7}$/.test(phone)) return `${label} חייב להכיל 7 ספרות`;
  // mobile prefixes must start with 05
  const mobilePrefixes = ['050','051','052','053','054','055','056','057','058'];
  const fullNum = prefix + phone;
  if (mobilePrefixes.includes(prefix) && !/^05\d{8}$/.test(fullNum))
    return 'מספר נייד לא תקין';
  return null;
}

function validateEmail(email: string): string | null {
  if (!email) return 'שדה חובה';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'כתובת אימייל לא תקינה';
  return null;
}

function validateName(val: string, label: string): string | null {
  if (!val) return 'שדה חובה';
  if (val.trim().length < 2) return `${label} חייב להכיל לפחות 2 תווים`;
  return null;
}

function validateLast4(val: string): string | null {
  if (!val) return 'שדה חובה';
  if (!/^\d{4}$/.test(val)) return '4 ספרות בדיוק';
  return null;
}

function validateRequired(val: string, label: string): string | null {
  if (!val || !val.trim()) return `${label} הוא שדה חובה`;
  return null;
}

interface FormData {
  accountType: 'private' | 'business';
  firstName: string; lastName: string; idNumber: string; last4: string;
  email: string; phonePrefix: string; phone: string;
  city: string; street: string; houseNum: string; zip: string;
  serviceType: string; disPrefix: string; disPhone: string;
  agreed: boolean;
}
const blank: FormData = {
  accountType: 'private',
  firstName:'', lastName:'', idNumber:'', last4:'',
  email:'', phonePrefix:'050', phone:'',
  city:'', street:'', houseNum:'', zip:'',
  serviceType:'', disPrefix:'050', disPhone:'',
  agreed: false,
};

type SectionId = 'account' | 'personal' | 'contact' | 'address' | 'service';
const SECTION_ORDER: SectionId[] = ['account','personal','contact','address','service'];

function sectionValid(id: SectionId, f: FormData): boolean {
  if (id === 'account') return true;
  if (id === 'personal') return (
    !validateName(f.firstName, 'שם פרטי') &&
    !validateName(f.lastName, 'שם משפחה') &&
    !validateId(f.idNumber) &&
    !validateLast4(f.last4)
  );
  if (id === 'contact') return (
    !validateEmail(f.email) &&
    !validatePhone(f.phonePrefix, f.phone, 'טלפון')
  );
  if (id === 'address') return (
    !validateRequired(f.city, 'ישוב') &&
    !validateRequired(f.street, 'רחוב')
  );
  if (id === 'service') return (
    !validateRequired(f.serviceType, 'סוג השירות') &&
    !validatePhone(f.disPrefix, f.disPhone, 'טלפון לניתוק')
  );
  return false;
}

/* ─── StepBar ─── */
function StepBar({ step }: { step: number }) {
  const steps = [
    { label: 'בחירת חברה', Icon: Search },
    { label: 'מילוי פרטים', Icon: FileText },
    { label: 'אישור ותשלום', Icon: CreditCard },
  ];
  return (
    <div className="flex items-center justify-center mb-8 sm:mb-10">
      {steps.map(({ label, Icon }, i) => {
        const idx = i + 1;
        const done = idx < step;
        const active = idx === step;
        return (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center gap-1.5">
              <motion.div animate={{ scale: active ? 1.12 : 1 }}
                className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl font-bold text-sm transition-all duration-300 shadow-sm
                  ${done ? 'bg-emerald-500 text-white shadow-emerald-500/30' : ''}
                  ${active ? 'bg-blue-600 text-white shadow-blue-600/30' : ''}
                  ${!done && !active ? 'bg-slate-100 text-slate-400' : ''}`}>
                {done ? <Check className="h-5 w-5" strokeWidth={2.5} /> : <Icon className="h-4 w-4" />}
              </motion.div>
              <span className={`text-[10px] sm:text-xs font-bold whitespace-nowrap tracking-wide
                ${active ? 'text-blue-600' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {i < 2 && (
              <div className="flex items-center mb-5 mx-1 sm:mx-2">
                <div className={`h-px w-8 sm:w-14 transition-all duration-500 ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                <ChevronRight className={`h-3 w-3 mx-0.5 transition-colors duration-300 ${done ? 'text-emerald-400' : 'text-slate-300'}`} />
                <div className={`h-px w-8 sm:w-14 transition-all duration-500 ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─── AccordionSection ─── */
function AccordionSection({ id, open, onOpen, onConfirm, valid, collapsedContent, expandedContent }: {
  id: SectionId; open: boolean; onOpen: () => void; onConfirm: () => void; valid: boolean;
  collapsedContent: React.ReactNode; expandedContent: React.ReactNode;
}) {
  return (
    <motion.div layout className={`rounded-2xl border-2 overflow-hidden transition-all duration-300
      ${open ? 'border-slate-200 bg-white shadow-sm' : valid ? 'border-emerald-200 bg-white' : 'border-slate-100 bg-slate-50/60'}`}>
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.button key="collapsed" type="button"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onOpen} className="w-full flex items-center justify-between gap-3 p-4 text-right">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl
                ${valid ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                {valid ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <AlertCircle className="h-4 w-4" />}
              </div>
              <div className="min-w-0 text-right">{collapsedContent}</div>
            </div>
            <Edit3 className="h-4 w-4 text-slate-400 shrink-0" />
          </motion.button>
        ) : (
          <motion.div key="expanded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-4 sm:p-5 space-y-4">
            {expandedContent}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              type="button" onClick={onConfirm}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all
                ${valid ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-default'}`}>
              <Check className="h-4 w-4" strokeWidth={2.5} />
              {valid ? 'אישור וסגירה' : 'נא למלא את השדות הנדרשים'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Field (label above input) ─── */
function FloatingInput({ label, icon: Icon, required, placeholder, value, onChange, type = 'text', maxLength, inputMode, error }: {
  label: string; icon: React.ElementType; required?: boolean;
  placeholder?: string; value: string; onChange: (v: string) => void;
  type?: string; maxLength?: number; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  error?: string | null;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
        <Icon className="h-3.5 w-3.5 text-slate-400" />
        {label}{required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type} inputMode={inputMode} value={value} maxLength={maxLength}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={`w-full rounded-xl border-2 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-all duration-150
          ${error ? 'border-red-400 bg-red-50' : focused ? 'border-blue-400 shadow-sm shadow-blue-100' : 'border-slate-200 hover:border-slate-300'}`}
      />
      {error && <p className="text-[11px] text-red-500 font-medium mt-0.5">{error}</p>}
    </div>
  );
}

/* ─── PhoneInput ─── */
function PhoneInput({ label, prefix, onPrefix, phone, onPhone, required, error }: {
  label: string; prefix: string; onPrefix: (v: string) => void;
  phone: string; onPhone: (v: string) => void; required?: boolean; error?: string | null;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 flex items-center gap-1 mb-1">
        <Phone className="h-3.5 w-3.5 text-slate-400" />
        {label}{required && <span className="text-red-400">*</span>}
      </label>
      <div dir="ltr" className={`flex rounded-xl border-2 bg-white overflow-hidden transition-all duration-150 ${error ? 'border-red-400 bg-red-50' : focused ? 'border-blue-400 shadow-sm shadow-blue-100' : 'border-slate-200 hover:border-slate-300'}`}>
        <div className="flex items-center gap-1.5 px-3 border-l border-slate-200 shrink-0">
          <Phone className="h-3.5 w-3.5 text-blue-400" />
          <select value={prefix} onChange={e => onPrefix(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            className="bg-transparent text-sm font-semibold text-slate-700 outline-none appearance-none pr-1 cursor-pointer">
            {PREFIXES.map(p => <option key={p}>{p}</option>)}
          </select>
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </div>
        <input type="tel" inputMode="numeric" value={phone} maxLength={7}
          onChange={e => onPhone(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder="1234567"
          className="flex-1 bg-transparent py-3 pr-2 pl-3 text-sm text-slate-800 outline-none" />
      </div>
      {error && <p className="text-[11px] text-red-500 font-medium mt-1">{error}</p>}
    </div>
  );
}

/* ─── SelectInput ─── */
function SelectInput({ label, icon: Icon, value, onChange, options, required }: {
  label: string; icon: React.ElementType; value: string;
  onChange: (v: string) => void; options: string[]; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 flex items-center gap-1 mb-1">
        <Icon className="h-3.5 w-3.5 text-slate-400" />
        {label}{required && <span className="text-red-400">*</span>}
      </label>
      <div className={`flex items-center rounded-xl border-2 bg-white px-3 transition-all duration-150 ${focused ? 'border-blue-400 shadow-sm shadow-blue-100' : 'border-slate-200 hover:border-slate-300'}`}>
        <select value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent py-3 text-sm text-slate-800 outline-none appearance-none cursor-pointer">
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
      </div>
    </div>
  );
}

const slideV = {
  enter: (d: number) => ({ opacity: 0, x: d > 0 ? -50 : 50 }),
  center: { opacity: 1, x: 0 },
  exit:  (d: number) => ({ opacity: 0, x: d > 0 ? 50 : -50 }),
};

/* ─── main ─── */
export default function DisconnectPage() {
  const [step, setStep] = useState(1);
  const [dir, setDir]   = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<FormData>(blank);
  const [done, setDone] = useState(false);
  const [openSection, setOpenSection] = useState<SectionId | null>('account');
  const [showErrors, setShowErrors] = useState<Partial<Record<SectionId, boolean>>>({});

  function go(n: number) { setDir(n > step ? 1 : -1); setStep(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function sf<K extends keyof FormData>(k: K, v: FormData[K]) { setForm(f => ({ ...f, [k]: v })); }

  function confirmSection(id: SectionId) {
    setShowErrors(e => ({ ...e, [id]: true }));
    if (!sectionValid(id, form)) return;
    const idx = SECTION_ORDER.indexOf(id);
    setOpenSection(SECTION_ORDER[idx + 1] ?? null);
  }

  // shorthand: show error for field only if section was attempted
  function fe(id: SectionId) { return !!showErrors[id]; }

  const step2ok = !!selected;
  const allSectionsValid = SECTION_ORDER.every(id => sectionValid(id, form));
  const step3ok = allSectionsValid && form.agreed;

  const allCompanies = COMPANIES.flatMap(c => c.items);
  const filteredSearch = search.trim() ? allCompanies.filter(c => c.includes(search)) : null;

  /* ─── success ─── */
  if (done) return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 20 }}
        className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 p-8 sm:p-14 text-center max-w-md w-full">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <BadgeCheck className="h-10 w-10 text-emerald-500" strokeWidth={1.5} />
        </motion.div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">הבקשה נשלחה!</h2>
        <p className="text-slate-600 leading-relaxed mb-1">
          בקשת הניתוק מ<strong className="text-slate-800">{selected}</strong> נשלחה בהצלחה.
        </p>
        <p className="text-sm text-slate-500 mb-8">תקבל אישור למייל <strong className="text-blue-600">{form.email}</strong> תוך דקות.</p>
        <div className="flex flex-col gap-3 mb-8">
          {[
            { icon: Clock, text: 'ניתוק תוך 3 ימי עסקים לפי חוק' },
            { icon: Mail, text: 'אישור חתום ישלח למייל שלך' },
            { icon: ShieldCheck, text: 'ראיה משפטית מלאה בידיך' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <Icon className="h-4 w-4 text-blue-500 shrink-0" /><span>{text}</span>
            </div>
          ))}
        </div>
        <a href="/" className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
          <ArrowRight className="h-4 w-4" /> חזרה לעמוד הבית
        </a>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-lg border-b border-slate-200/70 shadow-sm">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
              <Scissors className="h-4 w-4 -rotate-45" />
            </div>
            <span className="text-xl font-black text-blue-600">CUT<span className="text-cyan-500">ME</span></span>
          </a>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">תהליך מאובטח</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-4 py-1.5 text-xs font-bold text-blue-600 mb-3">
            <Zap className="h-3.5 w-3.5" /> מהיר · חוקי · פשוט
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">בקשת ניתוק מהירה</h1>
          <p className="text-slate-500 mt-1 text-sm">3 שלבים ואנחנו מטפלים בשאר</p>
        </motion.div>

        <StepBar step={step} />

        <AnimatePresence mode="wait" custom={dir}>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <motion.div key="s1" custom={dir} variants={slideV} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
              <div className="rounded-3xl bg-white border border-slate-200/70 shadow-sm overflow-hidden">
                <div className="relative overflow-hidden bg-gradient-to-l from-blue-700 to-blue-500 px-6 py-5 text-white">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                  <div className="relative flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                      <Search className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-lg">שלב 1 — בחר את החברה</p>
                      <p className="text-blue-100 text-sm">אנחנו נשלח בשמך בקשת ניתוק רשמית</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                  <div className="relative">
                    <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="חפש חברה..."
                      className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 pr-10 pl-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:shadow-md focus:shadow-blue-100" />
                    {search && (
                      <button onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {filteredSearch && (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                      <p className="text-xs font-bold text-slate-500 mb-3">תוצאות ({filteredSearch.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {filteredSearch.map(c => <CompanyBtn key={c} name={c} selected={selected === c} onClick={() => { setSelected(c); setSearch(''); }} />)}
                        {filteredSearch.length === 0 && <p className="text-sm text-slate-400">לא נמצאה חברה</p>}
                      </div>
                    </div>
                  )}

                  {!filteredSearch && COMPANIES.map(cat => {
                    const c = colorMap[cat.color];
                    return (
                      <div key={cat.id}>
                        <div className={`flex items-center gap-2.5 mb-3 px-3 py-2.5 rounded-xl ${c.bg} border ${c.border}`}>
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.badge.split(' ')[0]}`}>
                            <cat.Icon className={`h-4 w-4 ${c.text}`} />
                          </div>
                          <span className={`font-bold text-sm ${c.text}`}>{cat.category}</span>
                          <span className={`mr-auto text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>{cat.items.length}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                          {cat.items.map(name => <CompanyBtn key={name} name={name} selected={selected === name} onClick={() => setSelected(name)} />)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 bg-slate-50/70 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className={`flex items-center gap-2.5 text-sm rounded-xl px-4 py-2.5 transition-all ${selected ? 'bg-blue-50 border border-blue-200' : 'text-slate-400'}`}>
                    {selected ? (
                      <><BadgeCheck className="h-4 w-4 text-blue-600 shrink-0" /><span>נבחר: <strong className="text-blue-700">{selected}</strong></span></>
                    ) : (
                      <><AlertCircle className="h-4 w-4" /><span>עדיין לא בחרת חברה</span></>
                    )}
                  </div>
                  <motion.button whileHover={{ scale: step2ok ? 1.03 : 1 }} whileTap={{ scale: step2ok ? 0.97 : 1 }}
                    onClick={() => step2ok && go(2)} disabled={!step2ok}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-3 text-sm font-bold transition-all
                      ${step2ok ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                    המשך למילוי פרטים <ArrowLeft className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <motion.div key="s2" custom={dir} variants={slideV} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
              <div className="rounded-3xl bg-white border border-slate-200/70 shadow-sm overflow-hidden">
                {/* Banner */}
                <div className="relative overflow-hidden bg-gradient-to-l from-blue-700 to-blue-500 px-6 py-5 text-white">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                  <div className="relative flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-lg">שלב 2 — פרטי המנוי</p>
                      <p className="text-blue-100 text-sm">ניתוק מ<strong>{selected}</strong> · אשר כל קטע כדי להמשיך</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-3">

                  {/* 1. Account type */}
                  <AccordionSection id="account" open={openSection === 'account'}
                    onOpen={() => setOpenSection('account')} onConfirm={() => confirmSection('account')}
                    valid={sectionValid('account', form)}
                    collapsedContent={
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">סוג חשבון</p>
                        <p className="text-sm font-bold text-slate-800">{form.accountType === 'private' ? 'חשבון פרטי' : 'חשבון עסקי'}</p>
                      </div>
                    }
                    expandedContent={
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          {([['private','פרטי', User],['business','עסקי', Building2]] as const).map(([type, label, Icon]) => (
                            <button key={type} type="button" onClick={() => sf('accountType', type)}
                              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-bold transition-all
                                ${form.accountType === type ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-200'}`}>
                              <Icon className="h-4 w-4" />{label}
                              {form.accountType === type && <Check className="h-3.5 w-3.5" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    }
                  />

                  {/* 2. Personal info */}
                  <AccordionSection id="personal" open={openSection === 'personal'}
                    onOpen={() => setOpenSection('personal')} onConfirm={() => confirmSection('personal')}
                    valid={sectionValid('personal', form)}
                    collapsedContent={
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">פרטים אישיים</p>
                        <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">
                          {form.firstName && form.lastName ? `${form.firstName} ${form.lastName}` : 'טרם מולא'}
                        </p>
                      </div>
                    }
                    expandedContent={
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FloatingInput label="שם פרטי" icon={User} required placeholder="ישראל" value={form.firstName} onChange={v => sf('firstName', v)}
                          error={fe('personal') ? validateName(form.firstName, 'שם פרטי') : null} />
                        <FloatingInput label="שם משפחה" icon={User} required placeholder="ישראלי" value={form.lastName} onChange={v => sf('lastName', v)}
                          error={fe('personal') ? validateName(form.lastName, 'שם משפחה') : null} />
                        <FloatingInput label="ת.ז." icon={Hash} required placeholder="000000000" value={form.idNumber} onChange={v => sf('idNumber', v)} maxLength={9} inputMode="numeric"
                          error={fe('personal') ? validateId(form.idNumber) : null} />
                        <FloatingInput label="4 ספרות אחרונות אמצעי תשלום" icon={CreditCard} required placeholder="1234" value={form.last4} onChange={v => sf('last4', v)} maxLength={4} inputMode="numeric"
                          error={fe('personal') ? validateLast4(form.last4) : null} />
                      </div>
                    }
                  />

                  {/* 3. Contact */}
                  <AccordionSection id="contact" open={openSection === 'contact'}
                    onOpen={() => setOpenSection('contact')} onConfirm={() => confirmSection('contact')}
                    valid={sectionValid('contact', form)}
                    collapsedContent={
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">יצירת קשר</p>
                        <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">{form.email || 'טרם מולא'}</p>
                      </div>
                    }
                    expandedContent={
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FloatingInput label='דוא"ל' icon={Mail} required placeholder="israel@email.com" type="email" value={form.email} onChange={v => sf('email', v)}
                          error={fe('contact') ? validateEmail(form.email) : null} />
                        <PhoneInput label="טלפון ליצירת קשר" required prefix={form.phonePrefix} onPrefix={v => sf('phonePrefix', v)} phone={form.phone} onPhone={v => sf('phone', v)}
                          error={fe('contact') ? validatePhone(form.phonePrefix, form.phone, 'טלפון') : null} />
                      </div>
                    }
                  />

                  {/* 4. Address */}
                  <AccordionSection id="address" open={openSection === 'address'}
                    onOpen={() => setOpenSection('address')} onConfirm={() => confirmSection('address')}
                    valid={sectionValid('address', form)}
                    collapsedContent={
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">כתובת</p>
                        <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">
                          {form.city && form.street ? `${form.street}, ${form.city}` : form.city || 'טרם מולא'}
                        </p>
                      </div>
                    }
                    expandedContent={
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-3">
                          <FloatingInput label="ישוב" icon={Home} required placeholder="תל אביב" value={form.city} onChange={v => sf('city', v)}
                            error={fe('address') ? validateRequired(form.city, 'ישוב') : null} />
                        </div>
                        <FloatingInput label="רחוב" icon={MapPin} required placeholder="הרצל" value={form.street} onChange={v => sf('street', v)}
                          error={fe('address') ? validateRequired(form.street, 'רחוב') : null} />
                        <FloatingInput label="מספר בית" icon={Hash} placeholder="12" value={form.houseNum} onChange={v => sf('houseNum', v)} maxLength={5} />
                        <FloatingInput label="מיקוד" icon={Hash} placeholder="6100000" value={form.zip} onChange={v => sf('zip', v)} maxLength={7} inputMode="numeric" />
                      </div>
                    }
                  />

                  {/* 5. Service */}
                  <AccordionSection id="service" open={openSection === 'service'}
                    onOpen={() => setOpenSection('service')} onConfirm={() => confirmSection('service')}
                    valid={sectionValid('service', form)}
                    collapsedContent={
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">פרטי ניתוק</p>
                        <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">
                          {form.serviceType}{form.disPhone ? ` · ${form.disPrefix}-${form.disPhone}` : ''}
                        </p>
                      </div>
                    }
                    expandedContent={
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FloatingInput label="סוג השירות" icon={Sparkles} required placeholder="לדוגמה: טלפון נייד, אינטרנט..." value={form.serviceType} onChange={v => sf('serviceType', v)}
                          error={fe('service') ? validateRequired(form.serviceType, 'סוג השירות') : null} />
                        <PhoneInput label="טלפון לניתוק" required prefix={form.disPrefix} onPrefix={v => sf('disPrefix', v)} phone={form.disPhone} onPhone={v => sf('disPhone', v)}
                          error={fe('service') ? validatePhone(form.disPrefix, form.disPhone, 'טלפון לניתוק') : null} />
                      </div>
                    }
                  />

                  {/* Terms */}
                  <motion.label whileTap={{ scale: 0.99 }}
                    className={`flex items-start gap-3.5 cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200
                      ${form.agreed ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-blue-200 hover:bg-blue-50/40'}`}>
                    <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200
                      ${form.agreed ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                      {form.agreed && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </div>
                    <input type="checkbox" checked={form.agreed} onChange={e => sf('agreed', e.target.checked)} className="hidden" />
                    <span className="text-sm text-slate-600 leading-relaxed">
                      קראתי והסכמתי ל<a href="#" className="text-blue-600 hover:underline font-bold">תנאי השימוש והתקנון</a> של אתר CutMe
                    </span>
                  </motion.label>
                </div>

                <div className="border-t border-slate-100 bg-slate-50/70 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center gap-3 justify-between">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => go(1)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:border-slate-300">
                    <ArrowRight className="h-4 w-4" /> חזרה לבחירת חברה
                  </motion.button>
                  <motion.button whileHover={{ scale: step3ok ? 1.03 : 1 }} whileTap={{ scale: step3ok ? 0.97 : 1 }}
                    onClick={() => step3ok && go(3)} disabled={!step3ok}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-3 text-sm font-bold transition-all
                      ${step3ok ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                    המשך לאישור ותשלום <ArrowLeft className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <motion.div key="s3" custom={dir} variants={slideV} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
              <div className="rounded-3xl bg-white border border-slate-200/70 shadow-sm overflow-hidden">
                <div className="relative overflow-hidden bg-gradient-to-l from-emerald-700 to-emerald-500 px-6 py-5 text-white">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                  <div className="relative flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                      <BadgeCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-lg">שלב 3 — אישור ותשלום</p>
                      <p className="text-emerald-100 text-sm">בדוק את הפרטים ואשר את הבקשה</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                  <div>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-blue-50 border border-blue-100 mb-4">
                      <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                      <p className="font-bold text-sm text-blue-700">סיכום הבקשה</p>
                      <p className="text-xs text-slate-500 mr-auto">ניתן לחזור לתיקון</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { icon: Wifi,     label: 'חברה לניתוק',       value: selected! },
                        { icon: Sparkles, label: 'סוג השירות',        value: form.serviceType },
                        { icon: User,     label: 'שם מלא',            value: `${form.firstName} ${form.lastName}` },
                        { icon: Hash,     label: 'ת.ז.',              value: form.idNumber },
                        { icon: Mail,     label: 'דוא"ל',             value: form.email },
                        { icon: Phone,    label: 'טלפון',             value: `${form.phonePrefix}-${form.phone}` },
                        { icon: Scissors, label: 'טלפון לניתוק',     value: `${form.disPrefix}-${form.disPhone}` },
                        { icon: MapPin,   label: 'כתובת',            value: [form.street, form.houseNum, form.city].filter(Boolean).join(', ') },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                          <Icon className="h-4 w-4 text-blue-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                            <p className="text-sm font-semibold text-slate-800 truncate">{value || '—'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => go(1)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
                      <Search className="h-3.5 w-3.5" /> שנה חברה
                    </button>
                    <button onClick={() => go(2)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
                      <FileText className="h-3.5 w-3.5" /> ערוך פרטים
                    </button>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-blue-700 to-blue-500 p-5 sm:p-6 text-white shadow-lg shadow-blue-600/20">
                    <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-white/5 -translate-x-8 -translate-y-8" />
                    <div className="relative flex flex-col sm:flex-row items-center justify-between gap-5">
                      <div className="text-center sm:text-right">
                        <p className="text-blue-200 text-sm font-medium">דמי שירות — הפקה ושיגור אוטומטי</p>
                        <p className="text-4xl sm:text-5xl font-black mt-1">₪29</p>
                        <p className="text-blue-200 text-xs mt-1">תשלום חד-פעמי · ללא חיובים נוספים</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                        {[
                          { icon: Clock,       text: 'ניתוק תוך 3 ימי עסקים' },
                          { icon: Mail,        text: 'אישור PDF חתום למייל' },
                          { icon: Star,        text: 'מעקב אוטומטי' },
                          { icon: ShieldCheck, text: 'ראיה משפטית מלאה' },
                        ].map(({ icon: Icon, text }) => (
                          <div key={text} className="flex items-center gap-2 text-blue-100">
                            <Icon className="h-4 w-4 text-cyan-300 shrink-0" />
                            <span className="text-xs sm:text-sm">{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4">
                    {[{ icon: Lock, text: 'תשלום מאובטח SSL' }, { icon: ShieldCheck, text: 'חוקי 100%' }, { icon: BadgeCheck, text: 'אישור מיידי למייל' }].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Icon className="h-3.5 w-3.5 text-slate-400" /> {text}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 bg-slate-50/70 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center gap-3 justify-between">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => go(2)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:border-slate-300">
                    <ArrowRight className="h-4 w-4" /> חזרה לתיקון פרטים
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setDone(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-emerald-500 px-7 py-3.5 text-base font-black text-white shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 transition-colors">
                    <CreditCard className="h-5 w-5" /> תשלום ושליחת בקשת ניתוק
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-slate-400 mt-6 leading-relaxed max-w-lg mx-auto">
          השירות פועל לפי חוק הגנת הצרכן. החברות מחויבות לנתק אותך תוך 3 ימי עסקים מרגע קבלת הבקשה הכתובה.
        </p>
      </main>
    </div>
  );
}

function CompanyBtn({ name, selected, onClick }: { name: string; selected: boolean; onClick: () => void }) {
  return (
    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={onClick}
      className={`relative flex items-center justify-center rounded-xl border-2 px-3 py-3 text-sm font-semibold text-center min-h-[52px] transition-all duration-200
        ${selected ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md shadow-blue-500/15' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-sm'}`}>
      {selected && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
          <Check className="h-2.5 w-2.5" strokeWidth={3} />
        </motion.div>
      )}
      {name}
    </motion.button>
  );
}
