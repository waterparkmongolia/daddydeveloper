import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Store, Tag, Type, FileText, Mail, Lock, 
  CreditCard, CheckCircle2, ChevronRight, Upload, AlertTriangle,
  X, ExternalLink, RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';

export function OrderView() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [selectedPlanInfo, setSelectedPlanInfo] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    if (!user) return;
    setLoading(true);
    try {
      let logoUrl = '';
      if (logoFile) {
        const logoRef = ref(storage, `logos/${user.uid}/${Date.now()}_${logoFile.name}`);
        const snapshot = await uploadBytes(logoRef, logoFile);
        logoUrl = await getDownloadURL(snapshot.ref);
      }

      const amountStr = data.orderType.replace(/[^0-9]/g, '');
      const amount = parseInt(amountStr);
      
      setSelectedPlanInfo({
        price: data.orderType,
        amount: amount,
        phone: profile?.phone || ''
      });

      const orderRef = await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userName: profile?.name || 'Anonymous',
        userPhone: profile?.phone || '',
        shopName: data.shopName,
        shopLogo: logoUrl,
        shopCategory: data.shopCategory,
        description: data.description || '',
        email: data.email,
        password: data.password,
        orderType: data.orderType,
        amount: amount,
        paymentStatus: 'pending',
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setOrderId(orderRef.id);

      // Create QPay Invoice
      const qpayResponse = await axios.post('/api/qpay/invoice', {
        amount: amount,
        description: `${data.orderType} Багц - ${profile?.phone} - ${data.shopName}`,
        orderId: orderRef.id
      });

      setPaymentInfo(qpayResponse.data);
    } catch (error) {
      console.error('Order error:', error);
      alert('Захиалга авахад алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  };

  const checkPayment = async () => {
    if (!paymentInfo || !orderId) return;
    setCheckingPayment(true);
    try {
      const response = await axios.get(`/api/qpay/check?invoiceId=${paymentInfo.invoice_id}`);
      
      // Check if any payment is paid
      const isPaid = response.data.rows?.some((row: any) => row.payment_status === 'PAID');
      
      if (isPaid) {
        await updateDoc(doc(db, 'orders', orderId), {
          paymentStatus: 'paid',
          paidAt: serverTimestamp()
        });
        alert('Төлбөр амжилттай төлөгдлөө!');
        navigate('/dashboard');
      } else {
        alert('Төлбөр хараахан төлөгдөөгүй байна.');
      }
    } catch (error) {
      console.error('Check payment error:', error);
      alert('Төлбөр шалгахад алдаа гарлаа.');
    } finally {
      setCheckingPayment(false);
    }
  };

  return (
    <div className="h-full overflow-hidden bg-bg-base flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 p-3 md:p-6 pb-24 md:pb-32">
          
          {/* Column 1: Store Information */}
          <div className="space-y-3 md:space-y-4">
            <h2 className="section-title">Дэлгүүрийн Мэдээлэл</h2>
            <div className="card-polish space-y-3 md:space-y-4">
              <div className="field-group">
                <label className="block text-[11px] md:text-[12px] font-semibold mb-1 text-[#0f172a]">Дэлгүүрийн нэр</label>
                <input
                  {...register('shopName', { required: true })}
                  className="input-polish !py-2"
                  placeholder="Жишээ нь: Жавхлан Дэлгүүр"
                />
              </div>
              
              <div className="field-group">
                <label className="block text-[11px] md:text-[12px] font-semibold mb-1 text-[#0f172a]">Дэлгүүрийн лого</label>
                <div className="relative upload-box bg-[#fafafa] border-2 border-dashed border-border-base rounded-lg p-3 md:p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-1 text-[11px] text-[#64748b]">
                    <Upload className="w-4 h-4 mb-0.5" />
                    <span className="truncate max-w-[150px]">{logoFile ? logoFile.name : 'Зураг сонгох'}</span>
                  </div>
                </div>
              </div>

              <div className="field-group">
                <label className="block text-[11px] md:text-[12px] font-semibold mb-1 text-[#0f172a]">Чиглэл</label>
                <input
                  {...register('shopCategory', { required: true })}
                  className="input-polish !py-2"
                  placeholder="Гар утас, Цүнх, Хувцас"
                />
              </div>

              <div className="field-group">
                <label className="block text-[11px] md:text-[12px] font-semibold mb-1 text-[#0f172a]">Танилцуулга</label>
                <textarea
                  {...register('description')}
                  rows={2}
                  className="input-polish !py-2 resize-none"
                  placeholder="Манай дэлгүүрийн..."
                />
              </div>
            </div>
          </div>

          {/* Column 2: Contact Information */}
          <div className="space-y-3 md:space-y-4">
            <h2 className="section-title">Холбоо Барих</h2>
            <div className="card-polish space-y-3 md:space-y-4">
              <div className="field-group">
                <label className="block text-[11px] md:text-[12px] font-semibold mb-1 text-[#0f172a]">Таны нэр</label>
                <input
                  value={profile?.name || ''}
                  disabled
                  className="input-polish !py-2 opacity-70 bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div className="field-group">
                <label className="block text-[11px] md:text-[12px] font-semibold mb-1 text-[#0f172a]">Утасны дугаар</label>
                <input
                  value={profile?.phone || ''}
                  disabled
                  className="input-polish !py-2 opacity-70 bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-lg p-2.5 text-[10px] leading-relaxed text-[#9f1239]">
                <strong className="block mb-0.5 uppercase tracking-tighter">Анхааруулга:</strong>
                Өөрийн имэйл хаягыг өгөхгүй байхыг анхаарна уу. Шинэ имэйл хаяг нээж бичнэ үү.
              </div>

              <div className="field-group">
                <label className="block text-[11px] md:text-[12px] font-semibold mb-1 text-[#0f172a]">Шинэ имэйл</label>
                <input
                  {...register('email', { required: true })}
                  type="email"
                  className="input-polish !py-2"
                  placeholder="new-email@gmail.com"
                />
              </div>

              <div className="field-group">
                <label className="block text-[11px] md:text-[12px] font-semibold mb-1 text-[#0f172a]">Нууц үг</label>
                <input
                  {...register('password', { required: true })}
                  type="password"
                  className="input-polish !py-2"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* Column 3: Order Type */}
          <div className="space-y-3 md:space-y-4">
            <h2 className="section-title">Захиалгын Төрөл</h2>
            <div className="card-polish space-y-3 md:space-y-4">
              <div className="space-y-2">
                {[
                  { id: '250', oldPrice: '2,500,000₮', price: '250,000₮', desc: '100+ захиалга бүртгэлтэй тул дарааллын дагуу хийгдэнэ.' },
                  { id: '500', oldPrice: '5,000,000₮', price: '500,000₮', desc: '8 цагийн турш хамтран ажиллана. Бүгдийг хийнэ.' },
                  { id: '1000', oldPrice: '10,000,000₮', price: '1,000,000₮', desc: '8 цагийн турш зааж хамт хийнэ. Суралцах боломж.' },
                  { id: '2000', oldPrice: '20,000,000₮', price: '2,000,000₮', desc: 'Бүтэн 1 өдөр хамт хийнэ. 1 сарын дэмжлэг.' },
                ].map((plan) => (
                  <label key={plan.id} className="relative block cursor-pointer group">
                    <input
                      {...register('orderType', { required: true })}
                      type="radio"
                      value={plan.price}
                      className="peer absolute inset-0 opacity-0"
                    />
                    <div className="p-2.5 border border-border-base rounded-md transition-all peer-checked:border-primary peer-checked:bg-[#eff6ff] peer-checked:ring-1 peer-checked:ring-primary hover:bg-[#f0f7ff]">
                      <div className="flex items-baseline gap-2">
                        <div className="text-[10px] font-bold line-through text-gray-400 opacity-50">{plan.oldPrice}</div>
                        <div className="text-[13px] font-bold text-primary">{plan.price}</div>
                      </div>
                      <p className="text-[10px] text-[#64748b] leading-tight mt-0.5">{plan.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm hover:bg-primary-dark transition-all disabled:opacity-50 shadow-md"
              >
                {loading ? 'Илгээж байна...' : 'Баталгаажуулах'}
              </button>
              
              <p className="text-[10px] text-[#64748b] text-center leading-tight">
                * Төлбөр төлөгдсөний дараа баталгаажна.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* QPay Payment Modal */}
      <AnimatePresence>
        {paymentInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setPaymentInfo(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full h-full md:h-auto md:max-w-2xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Drag Handle for Mobile */}
              <div className="md:hidden w-full flex justify-center py-3 shrink-0">
                <div className="w-12 h-1.5 bg-border-base rounded-full opacity-50" />
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="p-4 md:p-6 space-y-5 md:space-y-6">
                  <header className="flex justify-between items-start border-b border-border-base pb-3">
                    <div>
                      <h3 className="text-lg md:text-xl font-black text-[#0f172a]">Төлбөр Төлөх</h3>
                      <p className="text-[10px] md:text-xs font-medium text-[#64748b]">QPay ашиглан төлбөрөө баталгаажуулна уу</p>
                    </div>
                    <button 
                      onClick={() => setPaymentInfo(null)}
                      className="p-1 md:p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 md:w-5 md:h-5" />
                    </button>
                  </header>

                  <div className="flex flex-col md:flex-row gap-5 items-start">
                    {/* QR Code */}
                    <div className="w-full md:w-auto flex flex-col items-center shrink-0">
                      <div className="relative p-3 md:p-4 bg-white border-2 border-primary/20 rounded-xl shadow-lg">
                        <img 
                          src={`data:image/png;base64,${paymentInfo.qr_image}`} 
                          alt="QPay QR" 
                          className="w-44 h-44 md:w-52 md:h-52 object-contain"
                        />
                      </div>
                      <div className="mt-3 text-center space-y-0.5">
                        <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Нийт дүн</div>
                        <div className="text-xl font-black text-primary">{selectedPlanInfo?.price}</div>
                      </div>
                    </div>

                    {/* Order Details & Bank Apps */}
                    <div className="flex-1 w-full space-y-5">
                      {/* Quick Details Card */}
                      <div className="bg-bg-base/50 p-3 md:p-4 rounded-xl border border-border-base space-y-2">
                        <div className="flex justify-between items-center group">
                          <span className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 tracking-wider">Утасны дугаар</span>
                          <span className="text-xs md:text-sm font-bold text-[#0f172a] group-hover:text-primary transition-colors">{selectedPlanInfo?.phone}</span>
                        </div>
                        <div className="h-px bg-border-base w-full opacity-30" />
                        <div className="flex justify-between items-center group">
                          <span className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 tracking-wider">Сонгосон багц</span>
                          <span className="text-xs md:text-sm font-bold text-[#0f172a]">{selectedPlanInfo?.price}</span>
                        </div>
                      </div>

                      {/* Bank Apps Grid */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Банкны апп-аар нээх</h4>
                          <span className="text-[8px] font-bold text-gray-300 uppercase">{paymentInfo.urls?.length} банк</span>
                        </div>
                        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-6 gap-2 md:gap-3 max-h-[220px] overflow-y-auto no-scrollbar pr-1 pb-3">
                          {paymentInfo.urls?.map((bank: any) => (
                            <a 
                              key={bank.name}
                              href={bank.link}
                              target="_blank"
                              rel="noreferrer"
                              className="flex flex-col items-center gap-1 group"
                            >
                              <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-gray-50 border border-border-base flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-primary group-hover:shadow-md group-hover:-translate-y-0.5">
                                <img 
                                  src={bank.logo} 
                                  alt={bank.description} 
                                  className="w-full h-full object-cover" 
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <span className="text-[8px] font-bold text-[#64748b] truncate w-full text-center group-hover:text-primary">{bank.description?.split(' ')[0]}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Footer Action */}
              <div className="p-4 md:p-6 bg-white border-t border-border-base shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] shrink-0">
                <div className="max-w-xl mx-auto space-y-3">
                  <button 
                    onClick={checkPayment}
                    disabled={checkingPayment}
                    className="w-full bg-primary text-white py-3.5 md:py-4 rounded-xl font-black text-[11px] md:text-sm hover:shadow-2xl transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
                    {checkingPayment ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    <span className="relative">{checkingPayment ? 'Шалгаж байна...' : 'Би төлбөрөө төлчихсөн, шалгаад өг'}</span>
                  </button>
                  <div className="flex items-center gap-2 justify-center text-[9px] text-[#64748b]">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    <span>Төлбөр баталгаажмагц таны захиалга шууд идэвхжих болно.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
