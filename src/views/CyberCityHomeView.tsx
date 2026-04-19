import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Send, Zap } from 'lucide-react';

const CREDIT_LIMITS: Record<string, number> = {
  president: 999999,
  classic: 100,
  cool: 250,
  cyber: 500,
  cyberstar: 750,
  vip: 1000,
  member: 2500,
};

const CREDIT_PRICE = 25;

function CyberGrid() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="homegrid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#3b82f6" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#homegrid)" />
    </svg>
  );
}

export function CyberCityHomeView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Citizen data passed from registration — no Firestore dependency needed
  const navCitizen = (location.state as any)?.citizen ?? null;
  const [citizen, setCitizen] = useState<any>(navCitizen);
  const [loadingCitizen, setLoadingCitizen] = useState(!navCitizen);
  const [usedCredits, setUsedCredits] = useState(0);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (navCitizen) return; // Already have data from registration navigate
    async function load() {
      if (!user) { setLoadingCitizen(false); return; }
      try {
        const snap = await getDocs(
          query(collection(db, 'cyberCitizens'), where('userId', '==', user.uid))
        );
        if (!snap.empty) setCitizen(snap.docs[0].data());

        const msgSnap = await getDocs(
          query(collection(db, 'cyberMessages'), where('userId', '==', user.uid))
        );
        const used = msgSnap.docs.reduce((sum, d) => sum + ((d.data().length as number) || 0), 0);
        setUsedCredits(used);
      } catch (e) {
        console.warn('Load error:', e);
      } finally {
        setLoadingCitizen(false);
      }
    }
    load();
  }, [user]);

  const creditLimit = citizen ? (CREDIT_LIMITS[citizen.citizenType] ?? 100) : 0;
  const remainingCredits = Math.max(0, creditLimit - usedCredits);
  const msgLen = message.length;
  const extraCredits = Math.max(0, msgLen - remainingCredits);
  const cost = extraCredits * CREDIT_PRICE;
  const creditPct = creditLimit > 0 ? Math.min(1, (creditLimit - Math.max(0, remainingCredits - msgLen)) / creditLimit) : 0;

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'cyberMessages'), {
        userId: user?.uid ?? null,
        username: citizen?.username ?? null,
        ccid: citizen?.ccid ?? null,
        citizenType: citizen?.citizenType ?? null,
        message: message.trim(),
        length: message.trim().length,
        extraCost: cost,
        createdAt: serverTimestamp(),
      });
      setUsedCredits(prev => prev + message.trim().length);
      setMessage('');
      setSent(true);
      setTimeout(() => setSent(false), 2500);
    } catch (e) {
      console.warn('Send error:', e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#030712] flex flex-col overflow-hidden">
      <CyberGrid />
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/8 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-80px] right-[-60px] w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[130px] pointer-events-none" />

      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
        <button type="button" onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-xs font-black uppercase tracking-widest">
          <ArrowLeft className="w-3.5 h-3.5" /> Буцах
        </button>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400/60 text-[9px] font-black uppercase tracking-widest">Online</span>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 pb-12 pt-4 flex flex-col gap-8">

          {/* ── Header ── */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <p className="text-blue-400/40 text-[9px] uppercase tracking-[0.45em] font-black mb-2">Enter The World</p>
            <h1 className="text-[52px] md:text-[72px] font-black tracking-tight leading-none">
              <span className="text-white">CYBER</span>
              <span className="text-blue-400"> CITY</span>
            </h1>
            <div className="h-px w-40 mx-auto mt-3 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
            <motion.p
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-white/30 text-[11px] font-black uppercase tracking-[0.25em] mt-3"
            >
              Coming on 2026.09.01
            </motion.p>
          </motion.div>

          {/* ── Greeting + CCID ── */}
          {loadingCitizen ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-white/10 border-t-blue-400 rounded-full animate-spin" />
            </div>
          ) : citizen ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="text-center"
            >
              <p className="text-white/40 text-sm font-medium mb-4">Сайн байна уу</p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, type: 'spring', damping: 18 }}
                className="text-[88px] md:text-[120px] font-black leading-none text-white tracking-tight"
              >
                №{citizen.ccid}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/30 text-sm font-black uppercase tracking-widest mt-1"
              >
                дэх иргэн
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-3 inline-flex items-center gap-2 bg-white/5 border border-white/8 rounded-full px-4 py-1.5"
              >
                <span className="text-white/60 text-[11px] font-black">@{citizen.username}</span>
                <span className="w-px h-3 bg-white/15" />
                <span className="text-blue-300/70 text-[10px] font-black uppercase tracking-wider">{citizen.citizenName}</span>
              </motion.div>
            </motion.div>
          ) : (
            <div className="text-center py-6">
              <p className="text-white/30 text-sm">Иргэний мэдээлэл олдсонгүй</p>
              <button type="button" onClick={() => navigate('/cyber-city')}
                className="mt-3 text-blue-400 text-xs font-black underline underline-offset-2">
                Бүртгүүлэх
              </button>
            </div>
          )}

          {/* ── Message box ── */}
          {citizen && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, type: 'spring', damping: 22 }}
              className="bg-white/4 border border-white/8 rounded-3xl overflow-hidden"
            >
              {/* Credit bar */}
              <div className="px-5 pt-5 pb-3 border-b border-white/6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-white/50 text-[10px] font-black uppercase tracking-widest">Credit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-black ${msgLen > remainingCredits ? 'text-red-400' : 'text-emerald-400'}`}>
                      {Math.max(0, remainingCredits - msgLen).toLocaleString()}
                    </span>
                    <span className="text-white/20 text-[10px]">/</span>
                    <span className="text-white/30 text-[10px] font-black">{creditLimit.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-full h-1 bg-white/8 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${Math.min(100, (msgLen / creditLimit) * 100 + ((usedCredits / creditLimit) * 100))}%` }}
                    transition={{ type: 'spring', damping: 30 }}
                    className={`h-full rounded-full ${msgLen > remainingCredits ? 'bg-red-500' : 'bg-blue-400'}`}
                  />
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Энэ хотод юу хиймээр байна вэ? Санаа бодлоо хуваалцаарай..."
                  rows={5}
                  className="w-full bg-transparent px-5 py-4 text-white text-sm placeholder:text-white/20 focus:outline-none resize-none leading-relaxed"
                />
                <div className="absolute bottom-3 right-4 text-[10px] font-black text-white/20">
                  {msgLen}
                </div>
              </div>

              {/* Cost warning + send */}
              <div className="px-5 pb-5 flex items-center justify-between gap-3">
                <AnimatePresence>
                  {cost > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-1.5"
                    >
                      <Zap className="w-3 h-3 text-red-400" />
                      <span className="text-red-400 text-[11px] font-black">+{cost.toLocaleString()}₮</span>
                    </motion.div>
                  )}
                  {sent && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-emerald-400 text-[11px] font-black"
                    >
                      Илгээгдлээ ✓
                    </motion.p>
                  )}
                </AnimatePresence>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={sending || !message.trim()}
                  className="ml-auto flex items-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-40 text-white font-black text-xs uppercase tracking-widest px-5 py-3 rounded-2xl transition-colors shadow-lg shadow-blue-500/20"
                >
                  {sending
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Send className="w-3.5 h-3.5" /> Илгээх</>
                  }
                </motion.button>
              </div>

              {/* Credit legend */}
              <div className="px-5 pb-4 border-t border-white/5 pt-3">
                <p className="text-white/20 text-[9px] leading-relaxed">
                  1 үсэг = 1 кредит · Нэмэлт кредит 1 = {CREDIT_PRICE}₮
                </p>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
