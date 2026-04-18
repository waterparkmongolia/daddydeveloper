import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Phone, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export function AuthView() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, data.email, data.password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;
        
        const role = data.email === 'javkhlantai@gmail.com' ? 'admin' : 'user';
        
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: data.name,
          phone: data.phone,
          role: role,
          membership: role === 'admin' ? 'Founder' : 'none',
          createdAt: new Date().toISOString(),
          initialInvestment: 1000000,
          recordValue: 13000000,
          additionalDev: 0
        });
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-bg-base flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-surface flex flex-col md:flex-row shadow-2xl rounded-2xl overflow-hidden border border-border-base">
        {/* Left side: Content */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-3xl font-black mb-3 text-[#0f172a]">
                {isLogin ? 'Тавтай морил' : 'Шинэ хаяг нээх'}
              </h2>
              <p className="text-[13px] font-medium text-[#64748b]">
                {isLogin 
                  ? 'Системд нэвтэрч захиалгаа хянана уу.' 
                  : 'Мэдээллээ оруулж бидэнтэй нэгдээрэй.'}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="field-group">
                      <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5 text-[#0f172a]">Нэр</label>
                      <input
                        {...register('name', { required: !isLogin })}
                        className="input-polish"
                        placeholder="Таны нэр"
                      />
                    </div>
                    <div className="field-group">
                      <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5 text-[#0f172a]">Утас</label>
                      <input
                        {...register('phone', { required: !isLogin })}
                        className="input-polish"
                        placeholder="99-88-XX-XX"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="field-group">
                <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5 text-[#0f172a]">Имэйл</label>
                <input
                  {...register('email', { required: true })}
                  type="email"
                  className="input-polish"
                  placeholder="name@email.com"
                />
              </div>

              <div className="field-group">
                <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5 text-[#0f172a]">Нууц үг</label>
                <input
                  {...register('password', { required: true })}
                  type="password"
                  className="input-polish"
                  placeholder="••••••••"
                />
              </div>

              {!isLogin && (
                <div className="field-group">
                  <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5 text-[#0f172a]">Баталгаажуулах</label>
                  <input
                    {...register('confirmPassword', { 
                      required: true,
                      validate: (val: string) => watch('password') === val || "Нууц үг таарахгүй байна"
                    })}
                    type="password"
                    className="input-polish"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {error && <div className="text-[11px] font-bold text-red-500 mt-2 bg-red-50 p-2 rounded border border-red-100">{error}</div>}
              {errors.confirmPassword && <div className="text-[11px] font-bold text-red-500 mt-2">{errors.confirmPassword.message as string}</div>}

              <button
                disabled={loading}
                className="w-full bg-primary text-white flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm hover:bg-primary-dark transition-all disabled:opacity-50 shadow-md shadow-primary/10 mt-6"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Нэвтрэх' : 'Бүртгүүлэх'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="w-full mt-6 text-[12px] font-bold text-[#64748b] hover:text-primary transition-colors text-center"
            >
              {isLogin ? 'Хаяг байхгүй юу? Бүртгүүлэх' : 'Хаяг байгаа юу? Нэвтрэх'}
            </button>
          </div>
        </div>

        {/* Right side: Branding */}
        <div className="hidden md:flex md:w-1/2 bg-[#0f172a] p-12 relative overflow-hidden text-white flex-col justify-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
          
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-8">Daddy Developer</h3>
            <div className="space-y-6">
              {[
                { title: 'Мэргэжлийн баг', desc: 'Салбартаа олон жилийн туршлагатай хамт олон.' },
                { title: 'Хурдан гүйцэтгэл', desc: 'Бид таны цагийг дээдэлж, хамгийн богино хугацаанд хүлээлгэн өгнө.' },
                { title: 'Байнгын дэмжлэг', desc: 'Вэбсайт бэлэн болсны дараа ч бид тантай хамт байна.' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold">{item.title}</h4>
                    <p className="text-[12px] text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
