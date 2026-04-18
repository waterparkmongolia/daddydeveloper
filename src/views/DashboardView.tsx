import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { motion } from 'motion/react';
import { 
  User, CreditCard, Clock, CheckCircle, ExternalLink, 
  Store, Package, Calendar, ChevronRight, Trophy, Zap, TrendingUp, PlusCircle
} from 'lucide-react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export function DashboardView() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingDev, setAddingDev] = useState(false);

  const handleAddDev = async () => {
    if (!user) return;
    const amount = prompt('Нэмэлт хөгжүүлэлтийн дүн (₮):');
    if (!amount || isNaN(Number(amount))) return;
    
    setAddingDev(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        additionalDev: increment(Number(amount))
      });
      alert('Амжилттай бүртгэгдлээ!');
    } catch (error) {
      console.error(error);
    } finally {
      setAddingDev(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'orders'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-bg-base p-3 md:p-12 text-sm md:text-base">
      <div className="max-w-6xl mx-auto space-y-5 md:space-y-10 pb-32">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-polish flex flex-col md:flex-row gap-4 md:gap-10 items-center p-4 md:p-8"
        >
          <div className="w-14 h-14 md:w-24 md:h-24 rounded-full bg-gray-50 flex items-center justify-center border border-border-base shrink-0">
            <User className="w-6 h-6 md:w-10 md:h-10 text-primary" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-xl md:text-3xl font-black mb-1.5 md:mb-2 text-[#0f172a]">{profile?.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-1.5 md:gap-3">
              <span className="flex items-center gap-1 text-[9px] md:text-[12px] font-bold px-2 py-0.5 md:px-3 md:py-1 bg-primary text-white rounded-md shadow-sm">
                <CreditCard className="w-3 h-3 md:w-3.5 md:h-3.5" />
                {profile?.membership || 'Гишүүн'}
              </span>
              <span className="flex items-center gap-1 text-[9px] md:text-[12px] font-semibold px-2 py-0.5 md:px-3 md:py-1 bg-surface border border-border-base text-[#64748b] rounded-md">
                {profile?.phone}
              </span>
            </div>
          </div>
          <div className="hidden md:flex gap-4">
            <div className="text-center p-5 bg-bg-base rounded-xl border border-border-base">
              <div className="text-2xl font-black text-primary">{orders.length}</div>
              <div className="text-[10px] uppercase font-bold text-[#64748b] tracking-wider">Нийт Захиалга</div>
            </div>
          </div>
        </motion.div>

        {/* Records Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="card-polish p-4 border-l-4 border-l-[#f59e0b] bg-white flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-[#f59e0b]" fill="currentColor" />
                <h3 className="text-[9px] md:text-xs uppercase font-black text-gray-400 tracking-wider">Анхны Удаа</h3>
              </div>
              <div className="text-lg md:text-2xl font-black text-[#0f172a]">
                {(profile?.initialInvestment || 1000000).toLocaleString()}₮
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="card-polish p-4 border-l-4 border-l-primary bg-white flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Trophy className="w-4 h-4 md:w-5 md:h-5 text-primary" fill="currentColor" />
                <h3 className="text-[9px] md:text-xs uppercase font-black text-gray-400 tracking-wider">Миний Рекорд</h3>
              </div>
              <div className="text-lg md:text-2xl font-black text-[#0f172a]">
                {(profile?.recordValue || 13000000).toLocaleString()}₮
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="card-polish p-4 border-l-4 border-l-[#10b981] bg-white flex flex-col justify-between group col-span-2 md:col-span-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-[#10b981]" />
                  <h3 className="text-[9px] md:text-xs uppercase font-black text-gray-400 tracking-wider">Миний Өсөлт</h3>
                </div>
                <div className="text-lg md:text-2xl font-black text-[#0f172a]">
                  {(profile?.additionalDev || 0).toLocaleString()}₮
                </div>
              </div>
              <button 
                onClick={handleAddDev}
                disabled={addingDev}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                title="Нэмэх"
              >
                <PlusCircle className="w-5 h-5 text-primary" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Orders Section */}
        <section>
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <h2 className="section-title !m-0 !text-sm md:!text-xl capitalize">Миний Захиалгууд</h2>
          </div>

          <div className="space-y-6 md:space-y-10">
            {[
              { title: 'Хүлээлтэнд байна', status: 'pending', color: 'text-amber-600', bg: 'bg-amber-50' },
              { title: 'Яг одоо хөгжүүлж байна', status: 'working', color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'Дууссан', status: 'completed', color: 'text-green-600', bg: 'bg-green-50' },
            ].map((section) => {
              const filteredOrders = orders.filter(o => o.status === section.status);
              if (filteredOrders.length === 0) return null;

              return (
                <div key={section.status} className="space-y-2.5 md:space-y-4">
                  <div className="flex items-center gap-1.5">
                    <div className={cn("w-1.5 h-1.5 md:w-2 md:h-2 rounded-full", section.status === 'pending' ? 'bg-amber-500' : section.status === 'working' ? 'bg-blue-500' : 'bg-green-500')} />
                    <h3 className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-[#0f172a]">{section.title}</h3>
                    <span className="text-[9px] font-bold text-gray-400">({filteredOrders.length})</span>
                  </div>
                  
                  <div className="grid gap-2 md:gap-3">
                    {filteredOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card-polish group p-3 md:p-5 flex flex-col md:flex-row gap-3 md:gap-4 md:items-center"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-bg-base flex items-center justify-center overflow-hidden shrink-0 border border-border-base">
                            {order.shopLogo ? (
                              <img src={order.shopLogo} alt={order.shopName} className="w-full h-full object-cover" />
                            ) : (
                              <Store className="w-5 h-5 text-[#64748b]" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <h3 className="text-[13px] md:text-base font-bold text-[#0f172a] truncate">{order.shopName}</h3>
                              {order.paymentStatus === 'paid' && (
                                <span className="text-[7px] md:text-[9px] bg-green-50 text-green-600 border border-green-100 px-1 py-0.5 rounded font-black uppercase tracking-tighter shrink-0">Төлөгдсөн</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] md:text-[12px] font-medium text-[#64748b]">
                              <span className="flex items-center gap-1"><Package className="w-3 h-3 text-primary" /> {order.orderType}</span>
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-primary" /> {order.createdAt?.toDate().toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {order.status === 'completed' && order.websiteLink && (
                          <a 
                            href={order.websiteLink.startsWith('http') ? order.websiteLink : `https://${order.websiteLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full md:w-auto mt-1 md:mt-0 bg-primary text-white px-4 py-2 rounded-lg font-bold text-[10px] md:text-xs flex items-center justify-center gap-1.5 hover:bg-primary-dark transition-all shadow-md shadow-primary/10"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Вебсайт Руу Орох
                          </a>
                        )}

                        {order.status !== 'completed' && (
                          <div className="hidden md:flex items-center gap-1.5 text-primary font-black text-[10px] md:text-[11px] uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                            Хөгжүүлж байна <ChevronRight className="w-4 h-4" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}

            {orders.length === 0 && !loading && (
              <div className="bg-surface p-20 rounded-3xl border-2 border-dashed border-border-base text-center">
                <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-[#64748b] font-bold text-sm">Танд хараахан захиалга байхгүй байна.</p>
                <Link to="/order" className="text-primary font-black text-xs uppercase tracking-widest mt-4 inline-block hover:underline">
                  Одоо захиалга өгөх
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
