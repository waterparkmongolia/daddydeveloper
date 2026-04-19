import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Store, Globe, ArrowLeft } from 'lucide-react';

function CyberGrid() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
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
  const navigate = useNavigate();

  const zones = [
    {
      id: 'dadstore',
      label: 'DadStore',
      sub: 'Апп ба дижитал дэлгүүр',
      icon: Store,
      gradient: 'from-blue-600 to-indigo-700',
      glow: 'shadow-blue-500/30',
      path: '/business',
    },
    {
      id: 'register',
      label: 'Бүртгэл',
      sub: 'Иргэний мэдээлэл',
      icon: Globe,
      gradient: 'from-violet-600 to-purple-700',
      glow: 'shadow-violet-500/30',
      path: '/cyber-city',
    },
  ];

  return (
    <div className="fixed inset-0 bg-[#030712] overflow-hidden flex flex-col">
      <CyberGrid />
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-600/8 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[130px] pointer-events-none" />

      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between px-6 pt-6 pb-4">
        <button type="button" onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/30 hover:text-white/70 transition-colors text-xs font-black uppercase tracking-widest">
          <ArrowLeft className="w-3.5 h-3.5" /> Буцах
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400/70 text-[9px] font-black uppercase tracking-widest">Online</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">

        {/* City title */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-blue-400/50 text-[10px] uppercase tracking-[0.4em] font-black mb-3"
          >
            Welcome to
          </motion.div>
          <h1 className="text-[56px] md:text-[90px] font-black tracking-tight leading-none">
            <span className="text-white">CYBER</span>
            <span className="text-blue-400"> CITY</span>
          </h1>
          <div className="h-px w-48 mx-auto mt-5 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
        </motion.div>

        {/* Zone grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
          {zones.map((zone, i) => (
            <motion.button
              key={zone.id}
              type="button"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.1, type: 'spring', damping: 18, stiffness: 260 }}
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(zone.path)}
              className={`flex flex-col items-center justify-center gap-3 p-8 rounded-3xl bg-gradient-to-br ${zone.gradient} shadow-2xl ${zone.glow} border border-white/10`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
                <zone.icon className="w-7 h-7 text-white" strokeWidth={1.6} />
              </div>
              <div className="text-center">
                <p className="text-white font-black text-lg tracking-tight">{zone.label}</p>
                <p className="text-white/50 text-xs font-medium mt-0.5">{zone.sub}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Bottom hint */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="text-white/20 text-[10px] uppercase tracking-[0.2em] font-black mt-12"
        >
          Cyber City · Digital World
        </motion.p>
      </div>
    </div>
  );
}
