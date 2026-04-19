import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Layers, ArrowLeft, ChevronRight } from 'lucide-react';

type Stage = 'intro' | 'greeting' | 'malls';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Өглөөний мэнд!';
  if (hour >= 12 && hour < 17) return 'Өдрийн мэнд!';
  if (hour >= 17 && hour < 22) return 'Оройны мэнд!';
  return 'Сайн байна уу!';
}

// Cyber grid background
function CyberGrid() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#3b82f6" strokeWidth="0.8" />
        </pattern>
        <pattern id="dots" width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="0" cy="0" r="1.5" fill="#3b82f6" />
          <circle cx="60" cy="0" r="1.5" fill="#3b82f6" />
          <circle cx="0" cy="60" r="1.5" fill="#3b82f6" />
          <circle cx="60" cy="60" r="1.5" fill="#3b82f6" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  );
}

// Аав character SVG
function DadCharacter({ talking }: { talking: boolean }) {
  return (
    <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Body */}
      <rect x="30" y="95" width="60" height="55" rx="16" fill="#1e3a8a" />
      {/* Collar */}
      <path d="M48 95 L60 108 L72 95" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1" />
      {/* Tie */}
      <path d="M60 108 L55 130 L60 137 L65 130 Z" fill="#3b82f6" />
      {/* Head */}
      <circle cx="60" cy="58" r="32" fill="#fde68a" />
      {/* Hair */}
      <ellipse cx="60" cy="28" rx="26" ry="10" fill="#1e293b" />
      <rect x="34" y="28" width="52" height="10" rx="5" fill="#1e293b" />
      {/* Ears */}
      <ellipse cx="28" cy="60" rx="6" ry="8" fill="#fde68a" />
      <ellipse cx="92" cy="60" rx="6" ry="8" fill="#fde68a" />
      {/* Glasses frame */}
      <rect x="36" y="52" width="18" height="12" rx="5" fill="none" stroke="#1e293b" strokeWidth="2.5" />
      <rect x="66" y="52" width="18" height="12" rx="5" fill="none" stroke="#1e293b" strokeWidth="2.5" />
      <line x1="54" y1="57" x2="66" y2="57" stroke="#1e293b" strokeWidth="2" />
      <line x1="30" y1="57" x2="36" y2="57" stroke="#1e293b" strokeWidth="2" />
      <line x1="84" y1="57" x2="90" y2="57" stroke="#1e293b" strokeWidth="2" />
      {/* Eyes */}
      <circle cx="45" cy="58" r="3.5" fill="#1e293b" />
      <circle cx="75" cy="58" r="3.5" fill="#1e293b" />
      <circle cx="46.2" cy="56.8" r="1.2" fill="white" />
      <circle cx="76.2" cy="56.8" r="1.2" fill="white" />
      {/* Mustache */}
      <path d="M46 72 Q53 68 60 71 Q67 68 74 72" fill="#1e293b" />
      {/* Mouth - talking or smile */}
      {talking ? (
        <ellipse cx="60" cy="79" rx="8" ry="5" fill="#1e293b" />
      ) : (
        <path d="M50 76 Q60 83 70 76" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
      )}
      {/* Arms */}
      <rect x="10" y="95" width="22" height="12" rx="6" fill="#1e3a8a" transform="rotate(-20 21 101)" />
      <rect x="88" y="95" width="22" height="12" rx="6" fill="#1e3a8a" transform="rotate(20 99 101)" />
    </svg>
  );
}

// Floating particles
function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 3,
    dur: 4 + Math.random() * 6,
    delay: Math.random() * 4,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-blue-400/40"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

export function BusinessView() {
  const { profile } = useAuth();
  const [malls, setMalls] = useState<any[]>([]);
  const [loadingMalls, setLoadingMalls] = useState(false);
  const [stage, setStage] = useState<Stage>('intro');
  const [talking, setTalking] = useState(false);
  const greeting = getGreeting();
  const lastTapRef = useRef<number>(0);

  const fetchMalls = useCallback(async () => {
    if (malls.length > 0) return;
    setLoadingMalls(true);
    try {
      const q = query(collection(db, 'malls'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setMalls(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMalls(false);
    }
  }, [malls.length]);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 400) {
      // Double tap!
      setStage('greeting');
      setTalking(true);
      fetchMalls();
      setTimeout(() => setTalking(false), 1800);
      setTimeout(() => setStage('malls'), 3000);
    }
    lastTapRef.current = now;
  }, [fetchMalls]);

  const goBack = () => {
    setStage('intro');
    lastTapRef.current = 0;
  };

  return (
    <div className="h-full overflow-hidden relative flex flex-col bg-[#030712]">
      <CyberGrid />
      <Particles />

      {/* Ambient glow */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Admin button */}
      {profile?.role === 'admin' && (
        <div className="absolute top-4 right-4 z-20">
          <Link to="/mall/admin"
            className="flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary p-2 md:px-4 md:py-2 rounded-xl font-black text-xs backdrop-blur-sm hover:bg-primary/30 transition-all">
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Create Mall</span>
          </Link>
        </div>
      )}

      {/* ─── STAGE: INTRO ─── */}
      <AnimatePresence>
        {stage === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer select-none z-10"
            onClick={handleDoubleTap}
          >
            {/* Logo / Title */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-8 text-center"
            >
              <p className="text-blue-400/60 text-[10px] uppercase tracking-[0.4em] font-black mb-3">Welcome to</p>
              <h1 className="text-[52px] md:text-[80px] font-black tracking-tight leading-none">
                <span className="text-white">CYBER</span>
                <span className="text-blue-400"> CITY</span>
              </h1>
              {/* Scanline effect on title */}
              <div className="h-px w-48 md:w-72 mx-auto mt-4 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
            </motion.div>

            {/* Double-tap hint */}
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-3 mt-4"
            >
              {/* Two tap icons */}
              <div className="flex gap-3">
                {[0, 1].map(i => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.2, delay: i * 0.35, repeat: Infinity }}
                    className="w-10 h-10 rounded-full border-2 border-blue-400/50 flex items-center justify-center"
                  >
                    <div className="w-3 h-3 rounded-full bg-blue-400/70" />
                  </motion.div>
                ))}
              </div>
              <p className="text-blue-300/50 text-[11px] font-black uppercase tracking-[0.25em]">
                Дэлгэцийг 2 удаа дарна уу
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── STAGE: GREETING ─── */}
      <AnimatePresence>
        {stage === 'greeting' && (
          <motion.div
            key="greeting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6"
          >
            {/* Character */}
            <motion.div
              initial={{ y: 120, opacity: 0, scale: 0.6 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 16, stiffness: 220, delay: 0.1 }}
              className="w-32 h-44 md:w-40 md:h-56 mb-2"
            >
              <DadCharacter talking={talking} />
            </motion.div>

            {/* Speech bubble */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 18, stiffness: 280, delay: 0.45 }}
              className="relative bg-white rounded-2xl px-6 py-4 shadow-2xl max-w-xs text-center"
            >
              {/* Bubble tail */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0
                border-l-[10px] border-l-transparent
                border-r-[10px] border-r-transparent
                border-b-[14px] border-b-white" />
              <p className="text-[#0f172a] font-black text-lg md:text-xl tracking-tight">{greeting}</p>
              <p className="text-[#64748b] text-[11px] font-medium mt-1">Аль газар руу орох вэ?</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── STAGE: MALLS ─── */}
      <AnimatePresence>
        {stage === 'malls' && (
          <motion.div
            key="malls"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col overflow-hidden"
          >
            {/* Mini dad + greeting on top */}
            <div className="flex items-center gap-3 px-5 pt-5 pb-4">
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 20 }}
                className="w-12 h-16 shrink-0"
              >
                <DadCharacter talking={false} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-2.5"
              >
                <p className="text-white font-black text-sm">{greeting}</p>
                <p className="text-blue-300/70 text-[10px] font-medium mt-0.5">Газраа сонгоно уу</p>
              </motion.div>
            </div>

            {/* Malls grid */}
            <div className="flex-1 overflow-y-auto px-4 pb-24">
              {loadingMalls ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
                </div>
              ) : malls.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-white/30 font-black text-lg">Одоогоор малл байхгүй байна</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {malls.map((mall, i) => (
                    <motion.div
                      key={mall.id}
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: i * 0.07, type: 'spring', damping: 20, stiffness: 260 }}
                    >
                      <Link
                        to={`/mall/${mall.id}`}
                        className="group block relative rounded-2xl overflow-hidden border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]"
                      >
                        <div className="aspect-square md:aspect-[4/3] overflow-hidden">
                          <img
                            src={mall.coverImage || 'https://picsum.photos/seed/mall/800/600'}
                            alt={mall.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        </div>
                        {/* Info overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h3 className="text-white font-black text-[13px] md:text-base uppercase tracking-tight leading-tight line-clamp-1">
                            {mall.name}
                          </h3>
                          <div className="flex items-center justify-between mt-1.5">
                            <div className="flex items-center gap-1 bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/20">
                              <Layers className="w-2.5 h-2.5" />
                              <span className="text-[8px] font-black uppercase">{mall.floors} давхар</span>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-blue-500 transition-colors flex items-center justify-center">
                              <ChevronRight className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Back button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="absolute bottom-20 left-0 right-0 flex justify-center"
            >
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Буцаана
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
