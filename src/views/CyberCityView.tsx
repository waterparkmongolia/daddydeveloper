import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Check, Zap, Shield, Crown, Star, Flame, ArrowLeft } from 'lucide-react';
import axios from 'axios';

type Stage = 'form' | 'choose' | 'success';

interface CitizenType {
  id: string;
  name: string;
  price: number;
  icon: React.ElementType;
  gradient: string;
  border: string;
  textColor: string;
  colorName: string;
  glow?: string;
  animated?: boolean;
  perks: string[];
  popular?: boolean;
}

const citizenTypes: CitizenType[] = [
  {
    id: 'classic',
    name: 'Classic Citizen',
    price: 1000,
    icon: Shield,
    gradient: 'from-gray-500 via-gray-600 to-gray-700',
    border: 'border-gray-500/40',
    textColor: 'text-gray-100',
    colorName: 'Basic',
    perks: ['Үндсэн хандалт', 'Cyber City ID', 'Community badge'],
  },
  {
    id: 'cool',
    name: 'Cool Citizen',
    price: 5000,
    icon: Star,
    gradient: 'from-amber-600 via-orange-600 to-amber-800',
    border: 'border-amber-500/50',
    textColor: 'text-amber-50',
    colorName: 'Bronze',
    perks: ['Bronze хаягт', 'Онцгой дүр', 'Эрхэмлэгч эрх'],
  },
  {
    id: 'cyber',
    name: 'Cyber Citizen',
    price: 10000,
    icon: Zap,
    gradient: 'from-slate-300 via-slate-200 to-slate-400',
    border: 'border-slate-300/60',
    textColor: 'text-slate-900',
    colorName: 'Silver',
    perks: ['Silver хаягт', 'Хурдан нэвтрэлт', 'Тусгай хэсэг'],
  },
  {
    id: 'cyberstar',
    name: 'Cyberstar Citizen',
    price: 20000,
    icon: Crown,
    gradient: 'from-yellow-400 via-amber-300 to-yellow-500',
    border: 'border-yellow-400/70',
    textColor: 'text-yellow-900',
    colorName: 'Gold',
    popular: true,
    perks: ['Gold хаягт', 'VIP хэсэг', 'Тэргүүлэгч дүр', 'Онцгой нэр'],
  },
  {
    id: 'vip',
    name: 'VIP Citizen',
    price: 50000,
    icon: Star,
    gradient: 'from-cyan-300 via-blue-200 to-indigo-300',
    border: 'border-cyan-300/70',
    textColor: 'text-cyan-900',
    colorName: 'Diamond',
    perks: ['Diamond хаягт', 'Хязгааргүй нэвтрэлт', 'Захиалагч эрх', 'Онцгой хэсэг'],
  },
  {
    id: 'member',
    name: 'Member of Cyber City',
    price: 90000,
    icon: Flame,
    gradient: 'from-red-500 via-rose-500 to-red-700',
    border: 'border-red-500/80',
    textColor: 'text-red-50',
    colorName: 'Crazy Red',
    glow: 'shadow-[0_0_50px_rgba(239,68,68,0.5)]',
    animated: true,
    perks: ['Crazy Red дүр', 'Нийт хандалт', 'Хотын Гишүүн', 'Тусгай эффект', 'Founder эрх'],
  },
];

function CyberGrid() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="ccgrid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#3b82f6" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ccgrid)" />
    </svg>
  );
}

function generateCCRN() {
  const now = new Date();
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${y}${mo}${d}${h}${m}`;
}

function formatCCBD() {
  const now = new Date();
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}.${mo}.${d}`;
}

const PRESIDENT_EMAIL = 'javkhlantai@gmail.com';

export function CyberCityView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isPresident = user?.email === PRESIDENT_EMAIL;
  const [stage, setStage] = useState<Stage>('form');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameTaken, setUsernameTaken] = useState(false);
  const [birthday, setBirthday] = useState('');
  const [ccid, setCcid] = useState<number | null>(null);
  const [ccrn] = useState(generateCCRN());
  const ccbd = formatCCBD();
  const [selectedType, setSelectedType] = useState<CitizenType | null>(null);
  const [paying, setPaying] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getDocs(collection(db, 'cyberCitizens')).then(snap => {
      // President gets CCID #1 (special)
      setCcid(isPresident ? 1 : 1001 + snap.size);
    });
  }, [isPresident]);

  const checkUsername = async (val: string) => {
    if (!val.trim()) { setUsernameTaken(false); return; }
    setUsernameChecking(true);
    try {
      const snap = await getDocs(collection(db, 'cyberCitizens'));
      const taken = snap.docs.some(d =>
        (d.data().username || '').toLowerCase() === val.trim().toLowerCase()
      );
      setUsernameTaken(taken);
    } catch {
      setUsernameTaken(false);
    } finally {
      setUsernameChecking(false);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Нэр оруулна уу';
    if (!username.trim()) e.username = 'Username оруулна уу';
    else if (usernameTaken) e.username = 'Энэ нэр байна. Энэ нэрийг хүн авсан.';
    if (!birthday) e.birthday = 'Төрсөн өдрийг оруулна уу';
    if (!selectedType && !isPresident) e.type = 'Иргэний төрлөө сонгоно уу';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setPaying(true);
    try {
      // President: save to Firestore and skip payment
      if (isPresident) {
        try {
          await addDoc(collection(db, 'cyberCitizens'), {
            userId: user?.uid || null,
            fullName, username, birthday,
            ccid, ccrn, ccbd,
            citizenType: 'president',
            citizenName: 'President of Cyber City',
            monthlyFee: 0,
            paymentStatus: 'free',
            createdAt: serverTimestamp(),
          });
        } catch (e) { console.warn('Firestore save failed:', e); }
        setStage('success');
        return;
      }

      // Regular user: call QPay first (orderId = ccrn, already unique)
      const res = await axios.post('/api/qpay/invoice', {
        amount: selectedType!.price,
        description: `Cyber City - ${selectedType!.name}`,
        orderId: ccrn,
      });
      navigate('/cyber-city/payment', {
        state: { paymentInfo: res.data, selectedType, ccid, ccrn, ccbd, fullName, username, birthday },
      });
    } catch (err) {
      console.error(err);
      alert('Алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#030712] overflow-hidden flex flex-col">
      <CyberGrid />
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-50px] w-[400px] h-[400px] bg-violet-700/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Back button */}
      <div className="relative z-20 p-4">
        <button type="button" onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/30 hover:text-white/70 transition-colors text-xs font-black uppercase tracking-widest">
          <ArrowLeft className="w-3.5 h-3.5" /> Буцах
        </button>
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 pb-16">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 pt-4">
            <p className="text-blue-400/60 text-[10px] uppercase tracking-[0.4em] font-black mb-2">Enter The World</p>
            <h1 className="text-[48px] md:text-[72px] font-black tracking-tight leading-none text-white">
              CYBER<span className="text-blue-400"> CITY</span>
            </h1>
            <div className="h-px w-40 mx-auto mt-4 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
            <p className="text-white/30 text-xs font-medium mt-3">Цахим иргэн болж хотод нэгдэнэ үү</p>
          </motion.div>

          <AnimatePresence mode="wait">

            {/* ─── FORM ─── */}
            {stage === 'form' && (
              <motion.div key="form" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
                className="max-w-xl mx-auto">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 backdrop-blur-sm">
                  <h2 className="text-white font-black text-xl">Цахим Иргэн Хүсэлт</h2>

                  <Field label="Full Name" error={errors.fullName}>
                    <input value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder="Таны бүтэн нэр"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-blue-400/50 transition-colors" />
                  </Field>

                  <Field label="Username" error={errors.username}>
                    <div className="relative">
                      <input
                        value={username}
                        onChange={e => { setUsername(e.target.value); setUsernameTaken(false); }}
                        onBlur={e => checkUsername(e.target.value)}
                        placeholder="@username"
                        className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none transition-colors ${usernameTaken ? 'border-red-500/60' : 'border-white/10 focus:border-blue-400/50'}`}
                      />
                      {usernameChecking && <div className="absolute right-3 top-3.5 w-4 h-4 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />}
                      {!usernameChecking && username && !usernameTaken && <div className="absolute right-3 top-3.5 w-4 h-4 rounded-full bg-emerald-400/20 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-emerald-400" /></div>}
                    </div>
                    {usernameTaken && <p className="text-red-400 text-[11px] mt-1.5 font-medium">Энэ нэр байна. Энэ нэрийг хүн авсан.</p>}
                  </Field>

                  <Field label="Birthday" error={errors.birthday}>
                    <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)}
                      title="Таны жинхэнэ төрсөн өдөр"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-400/50 transition-colors [color-scheme:dark]" />
                  </Field>

                  {/* Auto fields */}
                  <div className="grid grid-cols-3 gap-3">
                    <AutoField label="CCID" value={ccid !== null ? `№${ccid}` : '...'} />
                    <AutoField label="CCRN" value={ccrn} small />
                    <AutoField label="CCBD" value={ccbd} highlight />
                  </div>

                  <p className="text-white/30 text-[10px] leading-relaxed">
                    🎂 CCBD нь таны Cyber City-д бүртгүүлсэн өдөр бөгөөд жинхэнэ болон хотын төрсөн өдрийг хоёуланг нь тэмдэглэх боломжтой.
                  </p>

                  {/* President badge */}
                  {isPresident && (
                    <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 rounded-2xl px-4 py-3">
                      <span className="text-2xl">👑</span>
                      <div>
                        <p className="text-yellow-300 font-black text-sm">President of Cyber City</p>
                        <p className="text-yellow-400/60 text-[10px]">Үнэгүй бүртгэл · Бүх эрх нээлттэй</p>
                      </div>
                    </div>
                  )}

                  {/* Choose Citizen */}
                  {!isPresident && (
                    <Field label="Choose Your Citizen" error={errors.type}>
                      {selectedType ? (
                        <div onClick={() => setStage('choose')}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer bg-gradient-to-r ${selectedType.gradient} ${selectedType.border}`}>
                          <div className="flex items-center gap-2">
                            <selectedType.icon className={`w-4 h-4 ${selectedType.textColor}`} />
                            <span className={`font-black text-sm ${selectedType.textColor}`}>{selectedType.name}</span>
                            <span className={`text-[9px] font-black ${selectedType.textColor} opacity-60 bg-black/20 px-1.5 py-0.5 rounded-full`}>{selectedType.colorName}</span>
                          </div>
                          <span className={`text-[11px] font-black ${selectedType.textColor} opacity-80`}>{selectedType.price.toLocaleString()}₮/сар</span>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setStage('choose')}
                          className="w-full flex items-center justify-between bg-white/5 border border-white/10 hover:border-blue-400/40 rounded-xl px-4 py-3 text-white/40 hover:text-white/70 transition-all">
                          <span className="text-sm font-medium">Иргэний төрлөө сонгоно уу</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </Field>
                  )}

                  {!isPresident && selectedType && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                      <span className="text-white/50 text-xs font-black uppercase tracking-wider">Таны төлбөр</span>
                      <span className="text-white font-black text-xl">{selectedType.price.toLocaleString()}₮<span className="text-white/40 text-xs font-medium">/сар</span></span>
                    </motion.div>
                  )}

                  <motion.button type="button" onClick={handlePay} disabled={paying || usernameTaken}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="w-full py-4 rounded-2xl bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-black uppercase tracking-widest text-sm shadow-lg shadow-blue-500/30 transition-colors flex items-center justify-center gap-2">
                    {paying ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : isPresident ? <>Үнэгүй Бүртгүүлэх 👑</> : <>Төлбөр Төлөх <ChevronRight className="w-4 h-4" /></>}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ─── CHOOSE CITIZEN TYPE ─── */}
            {stage === 'choose' && (
              <motion.div key="choose" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}>
                <div className="flex items-center gap-3 mb-8 max-w-xl mx-auto md:max-w-none">
                  <button type="button" onClick={() => setStage('form')} title="Буцах"
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="text-white font-black text-xl">Иргэний Төрлөө Сонгоно уу</h2>
                    <p className="text-white/30 text-xs mt-0.5">Сарын төлбөрийн дагуу давуу эрх эдэлнэ</p>
                  </div>
                </div>

                {/* Mobile: list | Desktop: grid like pricing */}
                <div className="md:hidden max-w-xl mx-auto space-y-3">
                  {citizenTypes.map((ct, i) => (
                    <MobileCard key={ct.id} ct={ct} i={i} selected={selectedType?.id === ct.id}
                      onSelect={() => { setSelectedType(ct); setStage('form'); }} />
                  ))}
                </div>

                <div className="hidden md:grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
                  {citizenTypes.map((ct, i) => (
                    <DesktopCard key={ct.id} ct={ct} i={i} selected={selectedType?.id === ct.id}
                      onSelect={() => { setSelectedType(ct); setStage('form'); }} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ─── SUCCESS ─── */}
            {stage === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="max-w-sm mx-auto text-center py-8">
                <motion.div animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.9, delay: 0.2 }} className="text-7xl mb-6">🎉</motion.div>
                <h2 className="text-white font-black text-3xl mb-2">Тавтай морил!</h2>
                <p className="text-white/50 text-sm mb-6">Та Cyber City-н иргэн боллоо</p>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 space-y-2 text-left">
                  <Row label="CCID" value={`№${ccid}`} />
                  <Row label="CCRN" value={ccrn} small />
                  <Row label="CCBD" value={ccbd} />
                  <Row label="Иргэний төрөл" value={selectedType?.name || ''} accent />
                </div>
                <motion.button type="button" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/cyber-city/home')}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-600 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/30">
                  Cyber City рүү орох →
                </motion.button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Small helper components ──

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-white/50 text-[10px] uppercase tracking-widest font-black block mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}
    </div>
  );
}

function AutoField({ label, value, small, highlight }: { label: string; value: string; small?: boolean; highlight?: boolean }) {
  return (
    <div className="flex flex-col">
      <p className="text-white/40 text-[9px] uppercase tracking-widest font-black mb-1.5 leading-tight h-8 flex items-center">{label}</p>
      <div className={`bg-white/5 border rounded-xl px-3 py-3 font-black h-12 flex items-center ${small ? 'text-[10px]' : 'text-sm'} ${highlight ? 'text-emerald-300 border-emerald-400/20' : 'text-blue-300 border-white/5'}`}>
        {value}
      </div>
    </div>
  );
}

function Row({ label, value, small, accent }: { label: string; value: string; small?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/40 text-[10px] uppercase tracking-widest font-black">{label}</span>
      <span className={`font-black ${small ? 'text-[10px]' : 'text-xs'} ${accent ? 'text-blue-300' : 'text-white/70'}`}>{value}</span>
    </div>
  );
}

function MobileCard({ ct, i, selected, onSelect }: { ct: CitizenType; i: number; selected: boolean; onSelect: () => void }) {
  return (
    <motion.button type="button" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.05, type: 'spring', damping: 20 }}
      whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border bg-gradient-to-r ${ct.gradient} ${ct.border} ${ct.glow || ''} transition-all relative overflow-hidden`}>
      {ct.animated && (
        <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      )}
      <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
        <ct.icon className={`w-5 h-5 ${ct.textColor}`} />
      </div>
      <div className="flex-1 text-left">
        <p className={`font-black text-sm ${ct.textColor}`}>{ct.name}</p>
        <div className="flex gap-1 mt-1 flex-wrap">
          {ct.perks.slice(0, 3).map(p => (
            <span key={p} className={`text-[8px] font-black uppercase opacity-70 ${ct.textColor} bg-black/20 px-1.5 py-0.5 rounded-full`}>{p}</span>
          ))}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className={`font-black text-sm ${ct.textColor}`}>{ct.price.toLocaleString()}₮</p>
        <p className={`text-[9px] font-bold opacity-60 ${ct.textColor}`}>/сар</p>
      </div>
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </motion.button>
  );
}

function DesktopCard({ ct, i, selected, onSelect }: { ct: CitizenType; i: number; selected: boolean; onSelect: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.06, type: 'spring', damping: 20 }}
      className={`relative rounded-3xl border flex flex-col overflow-hidden ${ct.border} ${ct.glow || ''} ${selected ? 'ring-2 ring-white/40' : ''}`}>
      {ct.popular && (
        <div className="absolute top-0 left-0 right-0 text-center py-1.5 bg-black/30 backdrop-blur-sm">
          <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Most Popular</span>
        </div>
      )}
      {ct.animated && (
        <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none z-10" />
      )}

      <div className={`bg-gradient-to-br ${ct.gradient} p-6 flex-1 flex flex-col`}>
        <div className={`w-12 h-12 rounded-2xl bg-black/20 flex items-center justify-center mb-5 ${ct.popular ? 'mt-4' : ''}`}>
          <ct.icon className={`w-6 h-6 ${ct.textColor}`} strokeWidth={1.8} />
        </div>

        <div className="mb-1">
          <span className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${ct.textColor} bg-black/15 px-2 py-0.5 rounded-full`}>{ct.colorName}</span>
        </div>
        <p className={`font-black text-[20px] leading-tight mb-1 ${ct.textColor}`}>{ct.price.toLocaleString()}₮</p>
        <p className={`text-[10px] font-bold opacity-60 mb-3 ${ct.textColor}`}>/сар</p>
        <h3 className={`font-black text-sm uppercase tracking-wide mb-4 ${ct.textColor}`}>{ct.name}</h3>

        <div className="space-y-2.5 flex-1 mb-6">
          {ct.perks.map(p => (
            <div key={p} className={`flex items-center gap-2 text-[12px] font-medium ${ct.textColor} opacity-90`}>
              <Check className="w-3.5 h-3.5 shrink-0 opacity-70" strokeWidth={2.5} />
              <span>{p}</span>
            </div>
          ))}
        </div>

        <motion.button type="button" onClick={onSelect}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
          className="w-full py-3 rounded-xl bg-black/25 hover:bg-black/40 text-white font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5">
          {selected ? <><Check className="w-3.5 h-3.5" /> Сонгогдсон</> : 'Сонгох'}
        </motion.button>
      </div>
    </motion.div>
  );
}
