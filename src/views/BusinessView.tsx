import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { motion } from 'motion/react';
import { Store, Building, Plus, ArrowRight, Layers } from 'lucide-react';

export function BusinessView() {
  const { profile } = useAuth();
  const [malls, setMalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMalls = async () => {
      try {
        const q = query(collection(db, 'malls'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMalls(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMalls();
  }, []);

  return (
    <div className="h-full bg-surface overflow-y-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-[#0f172a] uppercase tracking-tighter mb-2 italic">Бизнес Төв</h1>
            <p className="text-sm md:text-base text-[#64748b] font-medium max-w-md">Виртуал ертөнцөд бизнесээ эхлүүлж, дэлхийн хэмжээний дэлгүүртэй болоорой</p>
          </div>
          {profile?.role === 'admin' && (
            <Link 
              to="/mall/admin"
              className="flex items-center gap-2 bg-primary text-white p-3 md:px-6 md:py-3 rounded-2xl font-black text-xs md:text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" /> 
              <span className="hidden md:inline uppercase tracking-tight">Create Mall</span>
            </Link>
          )}
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ачаалж байна...</span>
          </div>
        ) : malls.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-black text-gray-400">Одоогоор бүртгэлтэй малл байхгүй байна</h2>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 pb-20">
            {malls.map((mall, index) => (
              <motion.div
                key={mall.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white rounded-2xl md:rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="aspect-square md:aspect-[16/9] overflow-hidden relative">
                  <img 
                    src={mall.coverImage || 'https://picsum.photos/seed/mall/800/450'} 
                    alt={mall.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="p-3 md:p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2 md:mb-4 gap-1">
                    <h3 className="text-[12px] md:text-xl font-black text-[#0f172a] leading-tight uppercase tracking-tighter italic line-clamp-1">{mall.name}</h3>
                    <div className="flex items-center gap-1 bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/20 shrink-0">
                      <Layers className="w-2.5 h-2.5" />
                      <span className="text-[7px] md:text-[10px] font-black uppercase">{mall.floors}</span>
                    </div>
                  </div>
                  <Link 
                    to={`/mall/${mall.id}`}
                    className="mt-auto w-full flex items-center justify-center bg-gray-900 text-white py-2 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-xs uppercase tracking-tighter hover:bg-primary transition-colors"
                  >
                    Орох
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
