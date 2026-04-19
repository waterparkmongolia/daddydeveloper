import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, Home, ShoppingCart, User, LogOut, LayoutDashboard, ShieldCheck,
  Trophy, Zap, TrendingUp, Info, Store, Heart,
  Utensils, Gamepad2, Briefcase, BookOpen, BadgeDollarSign,
  GraduationCap, Plane, Tv, HandHeart, Star, ThumbsUp,
  ShoppingBag, UserPlus, LineChart, Headphones, Coffee, Laugh, Archive,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../App';
import { cn } from '../lib/utils';

const iWantToItems = [
  { label: 'Eat',     icon: Utensils,       color: 'from-orange-400 to-red-500',      text: 'text-orange-50'  },
  { label: 'Play',    icon: Gamepad2,        color: 'from-purple-500 to-indigo-600',   text: 'text-purple-50'  },
  { label: 'Work',    icon: Briefcase,       color: 'from-slate-500 to-slate-800',     text: 'text-slate-50'   },
  { label: 'Study',   icon: BookOpen,        color: 'from-blue-400 to-cyan-500',       text: 'text-blue-50'    },
  { label: 'Earn',    icon: BadgeDollarSign, color: 'from-emerald-400 to-green-600',   text: 'text-emerald-50' },
  { label: 'Learn',   icon: GraduationCap,   color: 'from-violet-500 to-purple-700',   text: 'text-violet-50'  },
  { label: 'Travel',  icon: Plane,           color: 'from-sky-400 to-blue-600',        text: 'text-sky-50'     },
  { label: 'Watch',   icon: Tv,              color: 'from-pink-400 to-rose-600',       text: 'text-pink-50'    },
  { label: 'Help',    icon: HandHeart,       color: 'from-red-400 to-pink-600',        text: 'text-red-50'     },
  { label: 'Rate',    icon: Star,            color: 'from-yellow-400 to-amber-600',    text: 'text-yellow-50'  },
  { label: 'Vote',    icon: ThumbsUp,        color: 'from-teal-400 to-cyan-600',       text: 'text-teal-50'    },
  { label: 'Shop',    icon: ShoppingBag,     color: 'from-fuchsia-500 to-pink-600',    text: 'text-fuchsia-50' },
  { label: 'Invite',  icon: UserPlus,        color: 'from-lime-400 to-green-500',      text: 'text-lime-50'    },
  { label: 'Invest',  icon: LineChart,       color: 'from-indigo-500 to-blue-700',     text: 'text-indigo-50'  },
  { label: 'Listen',  icon: Headphones,      color: 'from-rose-400 to-red-600',        text: 'text-rose-50'    },
  { label: 'Relax',   icon: Coffee,          color: 'from-amber-400 to-orange-500',    text: 'text-amber-50'   },
  { label: 'Enjoy',   icon: Laugh,           color: 'from-cyan-400 to-teal-600',       text: 'text-cyan-50'    },
  { label: 'Collect', icon: Archive,         color: 'from-stone-500 to-stone-700',     text: 'text-stone-50'   },
];

const bottomNavItems = [
  { name: 'Нүүр',        path: '/',          icon: Home,   modal: false },
  { name: 'Leaderboard', path: '/dashboard', icon: Trophy, modal: false },
  { name: 'I Want To',   path: '/order',     icon: Heart,  modal: true  },
  { name: 'DadStore',    path: '/business',  icon: Store,  modal: false },
  { name: 'My Profile',  path: '/dashboard', icon: User,   modal: false },
];

function IWantToModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();

  const handleSelect = () => {
    onClose();
    navigate('/order');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex flex-col"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" />

        {/* Mobile: bottom sheet */}
        <div className="md:hidden absolute inset-x-0 bottom-0" onClick={e => e.stopPropagation()}>
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="bg-[#0f172a] rounded-t-[32px] px-4 pt-5 pb-10"
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-white/40 text-[9px] uppercase tracking-[0.25em] font-black">What do you want?</p>
                <h2 className="text-white text-[24px] font-black tracking-tight">I Want To...</h2>
              </div>
              <button type="button" title="Хаах" onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {iWantToItems.map((item, i) => (
                <motion.button
                  type="button"
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.4, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.03, type: 'spring', damping: 16, stiffness: 340 }}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.88 }}
                  onClick={handleSelect}
                  className={cn('flex flex-col items-center justify-center gap-1.5 rounded-2xl p-2.5 aspect-square bg-gradient-to-br shadow-md', item.color)}
                >
                  <item.icon className={cn('w-5 h-5', item.text)} strokeWidth={1.8} />
                  <span className={cn('text-[9px] font-black uppercase tracking-wide leading-none', item.text)}>{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Desktop: full screen */}
        <div className="hidden md:flex absolute inset-0 items-center justify-center p-8" onClick={e => e.stopPropagation()}>
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            className="w-full h-full bg-[#080f1e] rounded-[40px] flex flex-col overflow-hidden relative"
          >
            {/* Ambient glows */}
            <div className="absolute top-[-120px] left-[-80px] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-100px] right-[-60px] w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center justify-between px-12 pt-10 pb-6">
              <div>
                <motion.p
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}
                  className="text-white/40 text-[11px] uppercase tracking-[0.3em] font-black mb-1"
                >
                  Choose your vibe
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}
                  className="text-white text-[48px] font-black tracking-tight leading-none"
                >
                  I Want To<span className="text-primary">.</span><span className="text-primary/60">.</span><span className="text-primary/30">.</span>
                </motion.h1>
              </div>
              <motion.button
                type="button" title="Хаах"
                initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
                whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Grid */}
            <div className="relative flex-1 px-12 pb-10 overflow-auto">
              <div className="grid grid-cols-6 gap-4 h-full">
                {iWantToItems.map((item, i) => (
                  <motion.button
                    type="button"
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.5, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ delay: 0.08 + i * 0.035, type: 'spring', damping: 18, stiffness: 300 }}
                    whileHover={{ scale: 1.06, y: -6, transition: { type: 'spring', damping: 14, stiffness: 400 } }}
                    whileTap={{ scale: 0.93 }}
                    onClick={handleSelect}
                    className={cn(
                      'flex flex-col items-center justify-center gap-3 rounded-3xl p-5',
                      'bg-gradient-to-br shadow-2xl cursor-pointer aspect-square',
                      item.color
                    )}
                  >
                    <item.icon className={cn('w-9 h-9', item.text)} strokeWidth={1.6} />
                    <span className={cn('text-[13px] font-black uppercase tracking-widest leading-none', item.text)}>
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function Navigation() {
  const { user, profile, signOut } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isIWantToOpen, setIWantToOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: 'Cyber City', path: '/cyber-city', icon: Globe, cyber: true },
    { name: 'Нүүр', path: '/', icon: Home },
    { name: 'Бидний Тухай', path: '/about', icon: Info },
    { name: 'DadStore', path: '/business', icon: Store },
    { name: 'Захиалга Өгөх', path: '/order', icon: ShoppingCart },
    { name: 'Миний Захиалга', path: '/dashboard', icon: LayoutDashboard },
    ...(profile?.role === 'admin' ? [{ name: 'Админ', path: '/admin', icon: ShieldCheck }] : []),
  ];

  if (location.pathname.includes('/mall/') && !location.pathname.includes('/admin')) {
    return null;
  }

  return (
    <>
      {/* Top Navigation */}
      <nav className="h-[56px] md:h-[64px] bg-surface sticky top-0 z-50 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-5">
          <button
            type="button"
            title="Цэс нээх"
            onClick={() => setSidebarOpen(true)}
            className="text-[#64748b] hover:text-primary transition-colors p-1"
          >
            <Menu className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="DaddyDeveloper" className="w-8 h-8 md:w-9 md:h-9 object-contain" />
            <span className="text-[16px] md:text-[20px] font-extrabold text-primary tracking-tight">DADDY DEVELOPER</span>
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-4 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full mr-4">
          <div className="flex flex-col items-center px-3 border-r border-gray-200">
            <span className="text-[9px] uppercase font-black text-gray-400 tracking-tighter leading-none mb-0.5">Анхны Удаа</span>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#f59e0b]" fill="currentColor" />
              <span className="text-[12px] font-black text-[#0f172a]">{(profile?.initialInvestment || 0).toLocaleString()}₮</span>
            </div>
          </div>
          <div className="flex flex-col items-center px-3 border-r border-gray-200">
            <span className="text-[9px] uppercase font-black text-gray-400 tracking-tighter leading-none mb-0.5">Рекорд</span>
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-primary" fill="currentColor" />
              <span className="text-[12px] font-black text-[#0f172a]">{(profile?.recordValue || 0).toLocaleString()}₮</span>
            </div>
          </div>
          <div className="flex flex-col items-center px-3">
            <span className="text-[9px] uppercase font-black text-gray-400 tracking-tighter leading-none mb-0.5">Нэмэлт</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-[#10b981]" />
              <span className="text-[12px] font-black text-[#0f172a]">{(profile?.additionalDev || 0).toLocaleString()}₮</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          {!user && (
            <Link to="/auth" className="md:hidden p-2 text-primary hover:bg-primary/5 rounded-full transition-colors flex items-center gap-1.5">
              <User className="w-5 h-5" />
              <span className="text-[11px] font-black uppercase">Нэвтрэх</span>
            </Link>
          )}
          {user && (
            <button type="button" onClick={() => signOut()}
              className="md:hidden p-2 text-[#64748b] hover:text-primary transition-colors hover:bg-gray-100 rounded-full"
              title="Гарах"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/about" className="text-sm font-medium text-[#64748b] hover:text-primary transition-colors">Бидний Тухай</Link>
            <Link to="/#pricing" className="text-sm font-medium text-[#64748b] hover:text-primary transition-colors">Үнийн санал</Link>
            {user ? (
              <div className="flex items-center gap-6">
                <Link to="/dashboard" className="text-sm font-medium text-[#0f172a] flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  {profile?.name || 'Хэрэглэгч'} ({profile?.membership || 'Гишүүн'})
                </Link>
                <button type="button" onClick={() => signOut()} className="text-sm font-medium text-[#64748b] hover:text-primary transition-colors">
                  Гарах
                </button>
              </div>
            ) : (
              <Link to="/auth" className="text-sm font-semibold bg-primary text-white px-5 py-2 rounded-md hover:bg-primary-dark transition-all shadow-sm">
                Нэвтрэх
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[240px] bg-white z-[70] shadow-2xl p-4 flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-display font-bold">Menu</span>
                <button type="button" title="Хаах" onClick={() => setSidebarOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 space-y-1">
                {menuItems.map((item: any) => (
                  <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                      item.cyber
                        ? "bg-[#030712] text-blue-400 border border-blue-500/30 hover:border-blue-400/60 mb-2"
                        : location.pathname === item.path ? "bg-gray-900 text-white shadow-md" : "hover:bg-gray-100 text-gray-600"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4", item.cyber && "text-blue-400")} />
                    <span className={cn("font-semibold text-sm", item.cyber && "font-black tracking-wide")}>{item.name}</span>
                    {item.cyber && (
                      <span className="ml-auto text-[8px] font-black uppercase tracking-widest text-blue-400/60 bg-blue-400/10 px-1.5 py-0.5 rounded-full">Enter</span>
                    )}
                  </Link>
                ))}
              </div>
              {user && (
                <div className="pt-4 border-t mt-auto space-y-3">
                  <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate w-20">{profile?.name}</div>
                        <div className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">{profile?.membership || 'Free'}</div>
                      </div>
                    </div>
                    <button type="button" title="Системээс гарах"
                      onClick={() => { signOut(); setSidebarOpen(false); }}
                      className="p-1.5 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                  <button type="button"
                    onClick={() => { signOut(); setSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-bold text-xs"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Системээс Гарах</span>
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* I Want To Modal */}
      <AnimatePresence>
        {isIWantToOpen && <IWantToModal onClose={() => setIWantToOpen(false)} />}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 h-[60px] bg-surface z-40 flex items-center justify-around px-2">
        {bottomNavItems.map((item) => {
          const active = location.pathname === item.path;
          return item.modal ? (
            <button
              key={item.name}
              type="button"
              title="I Want To"
              onClick={() => setIWantToOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors relative"
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shadow-lg shadow-primary/30 -mt-5"
              >
                <item.icon className="w-5 h-5 text-white" fill="white" strokeWidth={0} />
              </motion.div>
              <span className="hidden md:block text-[9px] font-bold uppercase tracking-wide text-[#94a3b8]">{item.name}</span>
            </button>
          ) : (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                active ? "text-primary" : "text-[#94a3b8] hover:text-[#64748b]"
              )}
            >
              <item.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
              <span className="hidden md:block text-[9px] font-bold uppercase tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
