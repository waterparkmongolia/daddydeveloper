import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu, X, Home, ShoppingCart, User, LogOut, LayoutDashboard, ShieldCheck,
  Trophy, Zap, TrendingUp, Info, Store, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../App';
import { cn } from '../lib/utils';

const bottomNavItems = [
  { name: 'Нүүр', path: '/', icon: Home },
  { name: 'Leaderboard', path: '/dashboard', icon: Trophy },
  { name: 'I Want To', path: '/order', icon: Heart },
  { name: 'DadStore', path: '/business', icon: Store },
  { name: 'My Profile', path: '/dashboard', icon: User },
];

export function Navigation() {
  const { user, profile, signOut } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: 'Нүүр', path: '/', icon: Home },
    { name: 'Бидний Тухай', path: '/about', icon: Info },
    { name: 'Бидний Бизнес', path: '/business', icon: Store },
    { name: 'Захиалга Өгөх', path: '/order', icon: ShoppingCart },
    { name: 'Миний Захиалга', path: '/dashboard', icon: LayoutDashboard },
    ...(profile?.role === 'admin' ? [{ name: 'Админ', path: '/admin', icon: ShieldCheck }] : []),
  ];

  // Hide navigation in Mall Experience
  if (location.pathname.includes('/mall/') && !location.pathname.includes('/admin')) {
    return null;
  }

  return (
    <>
      {/* Top Navigation */}
      <nav className="h-[56px] md:h-[64px] bg-surface sticky top-0 z-50 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-5">
          <button
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
            <Link
              to="/auth"
              className="md:hidden p-2 text-primary hover:bg-primary/5 rounded-full transition-colors flex items-center gap-1.5"
            >
              <User className="w-5 h-5" />
              <span className="text-[11px] font-black uppercase">Нэвтрэх</span>
            </Link>
          )}

          {user && (
            <button
              onClick={() => signOut()}
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
                <button
                  onClick={() => signOut()}
                  className="text-sm font-medium text-[#64748b] hover:text-primary transition-colors"
                >
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

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[240px] bg-white z-[70] shadow-2xl p-4 flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-display font-bold">Menu</span>
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                      location.pathname === item.path
                        ? "bg-gray-900 text-white shadow-md shadow-gray-200"
                        : "hover:bg-gray-100 text-gray-600"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-semibold text-sm">{item.name}</span>
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
                    <button
                      onClick={() => {
                        signOut();
                        setSidebarOpen(false);
                      }}
                      className="p-1.5 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                      title="Системээс гарах"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      signOut();
                      setSidebarOpen(false);
                    }}
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

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 h-[60px] bg-surface z-40 flex items-center justify-around px-2">
        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.path &&
            !(item.name === 'My Profile' && location.pathname === '/dashboard' && bottomNavItems.find(i => i.name === 'Leaderboard')?.path === '/dashboard');
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                active ? "text-primary" : "text-[#94a3b8] hover:text-[#64748b]"
              )}
            >
              <item.icon className={cn("w-5 h-5", active && "fill-primary/10")} strokeWidth={active ? 2.5 : 1.8} />
              <span className="hidden md:block text-[9px] font-bold uppercase tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
