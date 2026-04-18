import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, ShoppingBag, Trash2, Edit3, X, 
  Plus, Phone, Store, User, Settings2,
  Zap, Trophy, TrendingUp
} from 'lucide-react';
import { cn } from '../lib/utils';

export function AdminView() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState<'orders' | 'users'>('orders');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Stats
  const [stats, setStats] = useState({ totalOrders: 0, pending: 0, users: 0 });

  useEffect(() => {
    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(docs);
      setStats(prev => ({ ...prev, totalOrders: docs.length, pending: docs.filter((o: any) => o.status === 'pending').length }));
      
      if (selectedOrder) {
        const updated = docs.find(d => d.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(docs);
      setStats(prev => ({ ...prev, users: docs.length }));
      setLoading(false);
    });

    return () => {
      unsubOrders();
      unsubUsers();
    };
  }, [selectedOrder]);

  const updateOrderStatus = async (id: string, status: string, websiteLink?: string) => {
    const updateData: any = { status };
    if (websiteLink) updateData.websiteLink = websiteLink;
    await updateDoc(doc(db, 'orders', id), updateData);
  };

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
    const formData = new FormData(e.currentTarget);
    const updates = {
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      membership: formData.get('membership') as string,
      initialInvestment: Number(formData.get('initialInvestment')),
      recordValue: Number(formData.get('recordValue')),
      additionalDev: Number(formData.get('additionalDev')),
    };
    await updateDoc(doc(db, 'users', editingUser.id), updates);
    alert('Хэрэглэгчийн мэдээлэл шинэчлэгдлээ');
    setEditingUser(null);
  };
   
  const handleCompleteOrder = async (id: string) => {
    const link = prompt('Вэбсайт байршсан холбоосыг (link) оруулна уу:');
    if (link) {
      await updateOrderStatus(id, 'completed', link);
      alert('Захиалга амжилттай дууслаа!');
      setSelectedOrder(null);
    } else {
      alert('Холбоос оруулах шаардлагатай.');
    }
  };

  const deleteUser = async (uid: string) => {
    if (confirm('Энэ хэрэглэгчийг устгах уу?')) {
      await deleteDoc(doc(db, 'users', uid));
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-bg-base">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-bg-base p-4 md:p-12">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-10 pb-32">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#0f172a]">Админ Хэсэг</h1>
            <p className="text-xs md:text-sm font-medium text-[#64748b]">Системийн хяналт болон удирдлага</p>
          </div>
          <div className="flex w-full md:w-auto gap-1 p-1 bg-surface border border-border-base rounded-xl shadow-sm">
            <button 
              onClick={() => setTab('orders')}
              className={cn(
                "flex-1 md:flex-none px-4 md:px-5 py-2 rounded-lg font-bold text-[10px] md:text-[12px] uppercase tracking-wider transition-all",
                tab === 'orders' ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-bg-base text-[#64748b]"
              )}
            >
              Захиалгууд
            </button>
            <button 
              onClick={() => setTab('users')}
              className={cn(
                "flex-1 md:flex-none px-4 md:px-5 py-2 rounded-lg font-bold text-[10px] md:text-[12px] uppercase tracking-wider transition-all",
                tab === 'users' ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-bg-base text-[#64748b]"
              )}
            >
              Хэрэглэгчид
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="card-polish border-l-[4px] border-l-primary/60">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <ShoppingBag className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-black text-[#0f172a]">{stats.totalOrders}</div>
            <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mt-1">Нийт Захиалга</div>
          </div>
          <div className="card-polish border-l-[4px] border-l-amber-500/60">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mb-4">
              <Plus className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-[#0f172a]">{stats.pending}</div>
            <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mt-1">Хүлээгдэж буй</div>
          </div>
          <div className="card-polish border-l-[4px] border-l-purple-500/60">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center mb-4">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-[#0f172a]">{stats.users}</div>
            <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mt-1">Нийт Хэрэглэгч</div>
          </div>
        </div>

        {/* Content Lists */}
        <div>
          {tab === 'orders' ? (
            <>
              {/* Desktop Orders Table */}
              <div className="hidden md:block card-polish !p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg-base">
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#64748b]">Захиалагч</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#64748b]">Дэлгүүр</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#64748b]">Төрөл</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#64748b]">Төлөв</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#64748b]">Үйлдэл</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-base">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-bg-base/50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="text-sm font-bold text-[#0f172a]">{order.userName}</div>
                            <div className="text-[11px] font-medium text-[#64748b]">{order.userPhone}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-bg-base overflow-hidden flex items-center justify-center shrink-0 border border-border-base">
                                {order.shopLogo ? <img src={order.shopLogo} className="w-full h-full object-cover" /> : <Store className="w-5 h-5 text-[#64748b]" />}
                              </div>
                              <div className="text-sm font-bold text-[#0f172a]">{order.shopName}</div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-[11px] font-bold text-[#64748b] bg-bg-base px-2.5 py-1 rounded-md border border-border-base">{order.orderType}</span>
                          </td>
                          <td className="px-6 py-5">
                            <select 
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className={cn(
                                "text-[10px] font-black uppercase px-2.5 py-1.5 rounded-md outline-none border cursor-pointer",
                                order.status === 'completed' ? "bg-green-50 border-green-200 text-green-700" :
                                order.status === 'pending' ? "bg-amber-50 border-amber-200 text-amber-700" :
                                "bg-blue-50 border-blue-200 text-blue-700"
                              )}
                            >
                              <option value="pending">PENDING</option>
                              <option value="working">WORKING</option>
                              <option value="completed">DONE</option>
                            </select>
                          </td>
                          <td className="px-6 py-5">
                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="p-2 hover:bg-gray-100 rounded-md text-[#64748b] hover:text-primary transition-colors flex items-center gap-2"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span className="text-xs font-bold">Show Info</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Orders Cards */}
              <div className="md:hidden space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="card-polish p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-bg-base border border-border-base overflow-hidden flex items-center justify-center">
                          {order.shopLogo ? <img src={order.shopLogo} className="w-full h-full object-cover" /> : <Store className="w-5 h-5 text-[#64748b]" />}
                        </div>
                        <div>
                          <div className="text-[13px] font-black text-[#0f172a]">{order.shopName}</div>
                          <div className="text-[10px] text-[#64748b] font-bold uppercase">{order.orderType}</div>
                        </div>
                      </div>
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={cn(
                          "text-[9px] font-black uppercase px-2 py-1 rounded-md outline-none border",
                          order.status === 'completed' ? "bg-green-50 border-green-200 text-green-700" :
                          order.status === 'pending' ? "bg-amber-50 border-amber-200 text-amber-700" :
                          "bg-blue-50 border-blue-200 text-blue-700"
                        )}
                      >
                        <option value="pending">PENDING</option>
                        <option value="working">WORKING</option>
                        <option value="completed">DONE</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border-base">
                      <div className="text-[11px]">
                        <div className="font-bold text-[#0f172a]">{order.userName}</div>
                        <div className="text-[#64748b]">{order.userPhone}</div>
                      </div>
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="bg-gray-50 text-[#0f172a] px-3 py-1.5 rounded-lg text-[10px] font-bold border border-border-base"
                      >
                        Харах
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Desktop Users Table */}
              <div className="hidden md:block card-polish !p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg-base">
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#64748b]">Хэрэглэгч</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#64748b]">Утас</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#64748b]">Эрх</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#64748b]">Гишүүнчлэл</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-[#64748b]">Үйлдэл</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-base">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-bg-base/50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="text-sm font-bold text-[#0f172a]">{u.name}</div>
                          </td>
                          <td className="px-6 py-5 text-sm font-medium text-[#64748b]">{u.phone}</td>
                          <td className="px-6 py-5">
                            <span className={cn(
                              "text-[10px] font-black uppercase px-2.5 py-1 rounded-md border",
                              u.role === 'admin' ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-bg-base border-border-base text-gray-700"
                            )}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-sm font-semibold text-[#0f172a]">{u.membership || 'Standard'}</td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setEditingUser(u)}
                                className="p-2 hover:bg-gray-100 rounded-md text-[#64748b] hover:text-primary transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => deleteUser(u.id)}
                                className="p-2 hover:bg-red-50 rounded-md text-[#64748b] hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Users Cards */}
              <div className="md:hidden space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="card-polish p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-[14px] font-black text-[#0f172a]">{u.name}</div>
                      <div className="text-[11px] font-medium text-[#64748b]">{u.phone}</div>
                      <div className="flex gap-2 pt-1">
                        <span className={cn(
                          "text-[9px] font-black uppercase px-2 py-0.5 rounded border",
                          u.role === 'admin' ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-bg-base border-border-base text-gray-700"
                        )}>
                          {u.role}
                        </span>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-gray-50 border border-border-base rounded text-gray-600">
                          {u.membership || 'Standard'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditingUser(u)}
                        className="p-3 bg-gray-50 text-[#0f172a] rounded-xl border border-border-base"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => deleteUser(u.id)}
                        className="p-3 bg-red-50 text-red-600 rounded-xl"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl overflow-y-auto max-h-[90vh] md:max-h-none"
            >
              <div className="p-6 md:p-8 space-y-6 md:space-y-8">
                <header className="flex justify-between items-start">
                  <div className="flex items-center gap-4 md:gap-5">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gray-50 flex items-center justify-center border border-border-base overflow-hidden shrink-0">
                      {selectedOrder.shopLogo ? (
                        <img src={selectedOrder.shopLogo} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-6 h-6 md:w-8 md:h-8 text-[#64748b]" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg md:text-2xl font-black text-[#0f172a] line-clamp-1">{selectedOrder.shopName}</h2>
                      <p className="text-xs md:text-sm font-medium text-[#64748b]">{selectedOrder.shopCategory}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] md:text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] mb-3">Хэрэглэгчийн мэдээлэл</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-[13px] md:text-sm font-bold text-[#0f172a]">
                          <User className="w-4 h-4 text-primary" />
                          {selectedOrder.userName}
                        </div>
                        <div className="flex items-center gap-3 text-[13px] md:text-sm font-medium text-[#64748b]">
                          <Phone className="w-4 h-4 text-primary" />
                          {selectedOrder.userPhone}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] md:text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] mb-3">Техник мэдээлэл</h4>
                      <div className="p-4 bg-gray-50 border border-border-base rounded-xl space-y-3 font-mono">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-gray-400 font-sans uppercase mb-1 tracking-wider">Email:</span>
                          <span className="text-[12px] md:text-[13px] font-bold text-[#0f172a] break-all">{selectedOrder.email}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-gray-400 font-sans uppercase mb-1 tracking-wider">Pass:</span>
                          <span className="text-[12px] md:text-[13px] font-bold text-[#0f172a]">{selectedOrder.password}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] md:text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] mb-3">Захиалгын дэлгэрэнгүй</h4>
                      <div className="space-y-3">
                        <div className="text-[11px] md:text-[13px] font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 inline-block uppercase">
                          {selectedOrder.orderType}
                        </div>
                        <p className="text-[13px] md:text-sm text-[#64748b] leading-relaxed line-clamp-4">
                          {selectedOrder.description || 'Тайлбар байхгүй.'}
                        </p>
                      </div>
                    </div>

                      <div className="pt-6 border-t border-border-base">
                        <h4 className="text-[10px] md:text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] mb-4">Төлөв өөрчлөх</h4>
                        <div className="flex flex-wrap gap-2">
                          {['pending', 'working'].map((s) => (
                            <button
                              key={s}
                              onClick={() => updateOrderStatus(selectedOrder.id, s)}
                              className={cn(
                                "px-3 md:px-4 py-2 rounded-lg text-[9px] md:text-[11px] font-black uppercase transition-all border",
                                selectedOrder.status === s 
                                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                                  : "bg-white text-[#64748b] border-border-base hover:border-primary/40"
                              )}
                            >
                              {s === 'pending' ? 'Хүлээх' : 'Хийх'}
                            </button>
                          ))}
                          <button
                            onClick={() => handleCompleteOrder(selectedOrder.id)}
                            className={cn(
                              "px-3 md:px-4 py-2 rounded-lg text-[9px] md:text-[11px] font-black uppercase transition-all border",
                              selectedOrder.status === 'completed'
                                ? "bg-green-600 text-white border-green-600 shadow-lg shadow-green-200"
                                : "bg-white text-green-600 border-green-100 hover:border-green-400"
                            )}
                          >
                            Дууссан
                          </button>
                        </div>
                        {selectedOrder.websiteLink && (
                          <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-100">
                            <span className="text-[9px] uppercase font-black text-green-600 tracking-wider block mb-1">Байршсан холбоос:</span>
                            <a href={selectedOrder.websiteLink} target="_blank" rel="noreferrer" className="text-xs font-bold text-green-700 underline break-all">
                              {selectedOrder.websiteLink}
                            </a>
                          </div>
                        )}
                      </div>
                  </div>
                </div>

                <footer className="pt-6 md:pt-8 border-t border-border-base flex justify-center">
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="w-full bg-[#0f172a] text-white py-3 md:py-4 rounded-xl font-black text-xs md:text-sm hover:shadow-xl transition-all"
                  >
                    Бүх зүйл тодорхой
                  </button>
                </footer>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Edit Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl"
            >
              <form onSubmit={handleUpdateUser} className="p-6 md:p-8 space-y-6">
                <header className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Settings2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-[#0f172a]">Засах: {editingUser.name}</h2>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">{editingUser.phone}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setEditingUser(null)} className="p-1 hover:bg-gray-100 rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                </header>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5">Нэр</label>
                    <input name="name" defaultValue={editingUser.name} className="w-full bg-gray-50 border border-border-base rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5">Эрх</label>
                    <select name="role" defaultValue={editingUser.role} className="w-full bg-gray-50 border border-border-base rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5">Гишүүнчлэл</label>
                    <input name="membership" defaultValue={editingUser.membership || 'Standard'} className="w-full bg-gray-50 border border-border-base rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div className="col-span-2 h-px bg-border-base my-2" />
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 flex items-center gap-1.5">
                      <Zap className="w-3 h-3" /> Анхны Удаа (₮)
                    </label>
                    <input name="initialInvestment" type="number" defaultValue={editingUser.initialInvestment || 1000000} className="w-full bg-gray-50 border border-border-base rounded-xl px-4 py-2.5 text-sm font-black focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 flex items-center gap-1.5">
                      <Trophy className="w-3 h-3" /> Миний Рекорд (₮)
                    </label>
                    <input name="recordValue" type="number" defaultValue={editingUser.recordValue || 13000000} className="w-full bg-gray-50 border border-border-base rounded-xl px-4 py-2.5 text-sm font-black focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3" /> Нэмэлт Өсөлт (₮)
                    </label>
                    <input name="additionalDev" type="number" defaultValue={editingUser.additionalDev || 0} className="w-full bg-gray-50 border border-border-base rounded-xl px-4 py-2.5 text-sm font-black focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                </div>

                <footer className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setEditingUser(null)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-xs">Болих</button>
                  <button type="submit" className="flex-2 bg-primary text-white py-3 rounded-xl font-black text-xs shadow-lg shadow-primary/20">Хадгалах</button>
                </footer>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
