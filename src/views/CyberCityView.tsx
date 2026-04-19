import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Check, Zap, Shield, Crown, Star, Diamond, Flame } from 'lucide-react';
import axios from 'axios';

type Stage = 'form' | 'choose' | 'payment' | 'success';

interface CitizenType {
  id: string;
  name: string;
  price: number;
  label: string;
  icon: React.ElementType;
  gradient: string;
  border: string;
  text: string;
  badge: string;
  glow?: string;
  animated?: boolean;
  perks: string[];
}

const citizenTypes: CitizenType[] = [
  {
    id: 'classic',
    name: 'Classic Citizen',
    price: 1000,
    label: '1,000₮/сар',
    icon: Shield,
    gradient: 'from-gray-500 via-gray-600 to-gray-700',
    border: 'border-gray-500/40',
    text: 'text-gray-100',
    badge: 'bg-gray-600',
    perks: ['Үндсэн хандалт', 'Cyber City ID', 'Community'],
  },
  {
    id: 'cool',
    name: 'Cool Citizen',
    price: 5000,
    label: '5,000₮/сар',
    icon: Star,
    gradient: 'from-amber-700 via-orange-700 to-amber-900',
    border: 'border-amber-600/50',
    text: 'text-amber-100',
    badge: 'bg-amber-700',
    perks: ['Bronze хаягт', 'Онцгой дүр', 'Эрхэмлэгч'],
  },
  {
    id: 'cyber',
    name: 'Cyber Citizen',
    price: 10000,
    label: '10,000₮/сар',
    icon: Zap,
    gradient: 'from-slate-400 via-slate-300 to-slate-500',
    border: 'border-slate-300/60',
    text: 'text-slate-900',
    badge: 'bg-slate-300',
    perks: ['Silver хаягт', 'Хурдан нэвтрэлт', 'Тусгай хэсэг'],
  },
  {
    id: 'cyberstar',
    name: 'Cyberstar Citizen',
    price: 20000,
    label: '20,000₮/сар',
    icon: Crown,
    gradient: 'from-yellow-400 via-amber-400 to-yellow-600',
    border: 'border-yellow-400/70',
    text: 'text-yellow-900',
    badge: 'bg-yellow-400',
    perks: ['Gold хаягт', 'VIP хэсэг', 'Тэргүүлэгч дүр'],
  },
  {
    id: 'vip',
    name: 'VIP Citizen',
    price: 50000,
    label: '50,000₮/сар',
    icon: Diamond,
    gradient: 'from-cyan-300 via-blue-300 to-indigo-400',
    border: 'border-cyan-300/70',
    text: 'text-cyan-900',
    badge: 'bg-cyan-300',
    perks: ['Diamond хаягт', 'Хязгааргүй нэвтрэлт', 'Захиалагч'],
  },
  {
    id: 'member',
    name: 'Member of Cyber City',
    price: 90000,
    label: '90,000₮/сар',
    icon: Flame,
    gradient: 'from-red-500 via-rose-600 to-red-800',
    border: 'border-red-500/80',
    text: 'text-red-50',
    badge: 'bg-red-500',
    glow: 'shadow-[0_0_40px_rgba(239,68,68,0.6)]',
    animated: true,
    perks: ['Crazy Red дүр', 'Нийт хандалт', 'Хотын Гишүүн'],
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

export function CyberCityView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>('form');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [birthday, setBirthday] = useState('');
  const [ccid, setCcid] = useState<number | null>(null);
  const [ccrn] = useState(generateCCRN());
  const [selectedType, setSelectedType] = useState<CitizenType | null>(null);
  const [paying, setPaying] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [docId, setDocId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch next CCID
  useEffect(() => {
    getDocs(collection(db, 'cyberCitizens')).then(snap => {
      setCcid(1001 + snap.size);
    });
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Нэр оруулна уу';
    if (!username.trim()) e.username = 'Username оруулна уу';
    if (!birthday) e.birthday = 'Төрсөн өдрийг оруулна уу';
    if (!selectedType) e.type = 'Иргэний төрлөө сонгоно уу';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setPaying(true);
    try {
      // Save draft to Firestore
      const ref = await addDoc(collection(db, 'cyberCitizens'), {
        userId: user?.uid || null,
        fullName,
        username,
        birthday,
        ccid,
        ccrn,
        citizenType: selectedType!.id,
        citizenName: selectedType!.name,
        monthlyFee: selectedType!.price,
        paymentStatus: 'pending',
        createdAt: serverTimestamp(),
      });
      setDocId(ref.id);

      // Create QPay invoice
      const res = await axios.post('/api/qpay/invoice', {
        amount: selectedType!.price,
        description: `Cyber City - ${selectedType!.name}`,
        orderId: ref.id,
      });
      setPaymentInfo(res.data);
      setStage('payment');
    } catch (err) {
      console.error(err);
      alert('Алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setPaying(false);
    }
  };

  const handleCheckPayment = async () => {
    if (!paymentInfo?.invoice_id) return;
    setCheckingPayment(true);
    try {
      const res = await axios.get(`/api/qpay/check?invoiceId=${paymentInfo.invoice_id}`);
      const rows = res.data?.rows || [];
      const paid = rows.some((r: any) => r.payment_status === 'PAID');
      if (paid) {
        setStage('success');
      } else {
        alert('Төлбөр баталгаажаагүй байна. Дахин шалгана уу.');
      }
    } catch {
      alert('Шалгахад алдаа гарлаа.');
    } finally {
      setCheckingPayment(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#030712] relative">
      <CyberGrid />
      <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-violet-700/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto px-4 py-10 pb-28">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="text-blue-400/60 text-[10px] uppercase tracking-[0.4em] font-black mb-2">Enter The World</p>
          <h1 className="text-[42px] md:text-[56px] font-black tracking-tight leading-none text-white">
            CYBER<span className="text-blue-400"> CITY</span>
          </h1>
          <div className="h-px w-40 mx-auto mt-4 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
          <p className="text-white/30 text-xs font-medium mt-3">Цахим иргэн болж хотод нэгдэнэ үү</p>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ─── STAGE: FORM ─── */}
          {stage === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 backdrop-blur-sm">
                <h2 className="text-white font-black text-lg mb-2">Цахим Иргэн Хүсэлт</h2>

                {/* Full Name */}
                <div>
                  <label className="text-white/50 text-[10px] uppercase tracking-widest font-black block mb-1.5">Full Name</label>
                  <input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Таны бүтэн нэр"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium placeholder:text-white/20 focus:outline-none focus:border-blue-400/50 transition-colors"
                  />
                  {errors.fullName && <p className="text-red-400 text-[10px] mt-1">{errors.fullName}</p>}
                </div>

                {/* Username */}
                <div>
                  <label className="text-white/50 text-[10px] uppercase tracking-widest font-black block mb-1.5">Username</label>
                  <input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="@username"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium placeholder:text-white/20 focus:outline-none focus:border-blue-400/50 transition-colors"
                  />
                  {errors.username && <p className="text-red-400 text-[10px] mt-1">{errors.username}</p>}
                </div>

                {/* Birthday */}
                <div>
                  <label className="text-white/50 text-[10px] uppercase tracking-widest font-black block mb-1.5">Birthday</label>
                  <input
                    type="date"
                    value={birthday}
                    onChange={e => setBirthday(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:border-blue-400/50 transition-colors [color-scheme:dark]"
                  />
                  {errors.birthday && <p className="text-red-400 text-[10px] mt-1">{errors.birthday}</p>}
                </div>

                {/* Auto fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/50 text-[10px] uppercase tracking-widest font-black block mb-1.5">CCID</label>
                    <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-blue-300 text-sm font-black">
                      {ccid !== null ? `№${ccid}` : '...'}
                    </div>
                  </div>
                  <div>
                    <label className="text-white/50 text-[10px] uppercase tracking-widest font-black block mb-1.5">CCRN</label>
                    <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-blue-300 text-[11px] font-black">
                      {ccrn}
                    </div>
                  </div>
                </div>

                {/* Choose Citizen */}
                <div>
                  <label className="text-white/50 text-[10px] uppercase tracking-widest font-black block mb-2">Choose Your Citizen</label>
                  {selectedType ? (
                    <div
                      onClick={() => setStage('choose')}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer bg-gradient-to-r ${selectedType.gradient} ${selectedType.border}`}
                    >
                      <div className="flex items-center gap-2">
                        <selectedType.icon className={`w-4 h-4 ${selectedType.text}`} />
                        <span className={`font-black text-sm ${selectedType.text}`}>{selectedType.name}</span>
                      </div>
                      <span className={`text-[10px] font-black ${selectedType.text} opacity-80`}>{selectedType.label}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setStage('choose')}
                      className="w-full flex items-center justify-between bg-white/5 border border-white/10 hover:border-blue-400/40 rounded-xl px-4 py-3 text-white/40 hover:text-white/70 transition-all"
                    >
                      <span className="text-sm font-medium">Иргэний төрлөө сонгоно уу</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  {errors.type && <p className="text-red-400 text-[10px] mt-1">{errors.type}</p>}
                </div>

                {/* Monthly fee preview */}
                {selectedType && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between"
                  >
                    <span className="text-white/50 text-xs font-black uppercase tracking-wider">Таны төлбөр</span>
                    <span className="text-white font-black text-lg">{selectedType.price.toLocaleString()}₮<span className="text-white/40 text-xs font-medium">/сар</span></span>
                  </motion.div>
                )}

                {/* Pay button */}
                <motion.button
                  type="button"
                  onClick={handlePay}
                  disabled={paying}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-4 rounded-2xl bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-black uppercase tracking-widest text-sm shadow-lg shadow-blue-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  {paying ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Төлбөр Төлөх <ChevronRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ─── STAGE: CHOOSE CITIZEN TYPE ─── */}
          {stage === 'choose' && (
            <motion.div key="choose" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}>
              <div className="flex items-center gap-3 mb-6">
                <button type="button" onClick={() => setStage('form')}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors">
                  <X className="w-4 h-4" />
                </button>
                <h2 className="text-white font-black text-lg">Иргэний Төрлөө Сонгоно уу</h2>
              </div>

              <div className="space-y-3">
                {citizenTypes.map((ct, i) => (
                  <motion.button
                    type="button"
                    key={ct.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, type: 'spring', damping: 20 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setSelectedType(ct); setStage('form'); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border bg-gradient-to-r ${ct.gradient} ${ct.border} ${ct.glow || ''} transition-all relative overflow-hidden`}
                  >
                    {/* Animated shimmer for member */}
                    {ct.animated && (
                      <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                      />
                    )}

                    <div className={`w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center shrink-0`}>
                      <ct.icon className={`w-5 h-5 ${ct.text}`} />
                    </div>

                    <div className="flex-1 text-left">
                      <p className={`font-black text-sm leading-tight ${ct.text}`}>{ct.name}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {ct.perks.map(p => (
                          <span key={p} className={`text-[8px] font-black uppercase opacity-70 ${ct.text} bg-black/20 px-1.5 py-0.5 rounded-full`}>{p}</span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className={`font-black text-sm ${ct.text}`}>{ct.price.toLocaleString()}₮</p>
                      <p className={`text-[9px] font-bold opacity-60 ${ct.text}`}>/сар</p>
                    </div>

                    {selectedType?.id === ct.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─── STAGE: PAYMENT ─── */}
          {stage === 'payment' && paymentInfo && (
            <motion.div key="payment" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center backdrop-blur-sm">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-white font-black text-xl mb-1">Төлбөр Төлөх</h2>
                <p className="text-white/40 text-xs mb-6">{selectedType?.name} · {selectedType?.price.toLocaleString()}₮/сар</p>

                {/* QPay QR */}
                {paymentInfo.qr_image && (
                  <div className="bg-white p-3 rounded-2xl inline-block mb-4">
                    <img src={`data:image/png;base64,${paymentInfo.qr_image}`} alt="QPay QR" className="w-40 h-40" />
                  </div>
                )}

                {/* Bank buttons */}
                {paymentInfo.urls && paymentInfo.urls.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {paymentInfo.urls.slice(0, 6).map((u: any) => (
                      <a key={u.name} href={u.link} target="_blank" rel="noreferrer"
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white text-[10px] font-black transition-colors">
                        {u.name}
                      </a>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCheckPayment}
                  disabled={checkingPayment}
                  className="w-full py-4 rounded-2xl bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-black uppercase tracking-widest text-sm shadow-lg shadow-blue-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  {checkingPayment ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Баталгаажуулах'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── STAGE: SUCCESS ─── */}
          {stage === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center py-10">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-6xl mb-6"
                >
                  🎉
                </motion.div>
                <h2 className="text-white font-black text-2xl mb-2">Тавтай морил!</h2>
                <p className="text-white/50 text-sm mb-2">Та Cyber City-н иргэн боллоо</p>
                <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-2 mb-8">
                  <span className="text-blue-300 font-black text-xs">CCID №{ccid}</span>
                  <span className="text-white/30 text-xs">·</span>
                  <span className="text-blue-300 font-black text-xs">{selectedType?.name}</span>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/business')}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-600 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/30"
                >
                  Cyber City рүү орох →
                </motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
