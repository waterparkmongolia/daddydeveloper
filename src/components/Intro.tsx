import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Code, Smartphone, Layout, Coffee, Sparkles, Star, Rocket, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Intro({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const sequence = [
      { delay: 1500, next: 1 },
      { delay: 1500, next: 2 },
      { delay: 1500, next: 3 }, // 3 is the new promo step
    ];

    let timer: any;
    const run = (idx: number) => {
      if (idx >= sequence.length) {
        // We don't automatically complete anymore if we reached the promo step
        return;
      }
      timer = setTimeout(() => {
        setStep(sequence[idx].next);
        run(idx + 1);
      }, sequence[idx].delay);
    };

    run(0);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    onComplete();
  };

  const handlePromoAction = () => {
    onComplete();
    navigate('/order');
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#0f172a] flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center"
          >
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <Heart className="w-16 h-16 text-primary animate-pulse" fill="currentColor" />
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                />
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-widest uppercase mb-2">Хайртай бүхнийхээ төлөө...</h2>
            <p className="text-gray-400 text-sm font-medium">Халамжтай аав, Чадварлаг хөгжүүлэгч</p>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center space-y-4"
          >
            <div className="flex justify-center gap-6">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Smartphone className="w-10 h-10 text-white/40" />
              </motion.div>
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <Code className="w-6 h-6 text-white" />
              </div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Layout className="w-10 h-10 text-white/40" />
              </motion.div>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase">Хамгийн гоё вэбсайт</h2>
            <p className="text-gray-400 text-sm font-medium">Таны төсөөллийг бодит болгоно</p>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 2 }}
            className="text-center"
          >
            <div className="relative inline-block mb-6">
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                DADDY <span className="text-primary italic">DEVELOPER</span>
              </h1>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute -bottom-2 left-0 h-1 bg-primary"
              />
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Coffee className="w-4 h-4 text-gray-500" />
              <span className="text-[10px] uppercase font-black text-gray-500 tracking-[0.4em]">Ready to build</span>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[1100] bg-[#0f172a] p-4 flex flex-col items-center justify-center text-center"
          >
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <Sparkles className="absolute top-10 left-10 w-12 h-12 text-blue-400 animate-pulse" />
              <Star className="absolute bottom-20 left-20 w-8 h-8 text-yellow-400 animate-bounce" />
              <Heart className="absolute top-20 right-10 w-16 h-16 text-red-500/30 rotate-12" fill="currentColor" />
              <Rocket className="absolute bottom-10 right-20 w-10 h-10 text-primary-light" />
            </div>

            <button 
              onClick={handleStart}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-md w-full"
            >
              <div className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 mb-6">
                <Sparkles className="w-3 h-3" />
                Special Offer
              </div>

              <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                ЗӨВХӨН <span className="text-primary italic">ААВУУДАД</span> <br/>
                <span className="text-primary tracking-tighter">90%</span> ХЯМДРАЛТАЙ!
              </h2>

              <p className="text-gray-400 text-[13px] md:text-sm font-medium leading-relaxed mb-8 px-4">
                Аав хүн байна гэдэг хамгийн том ажил. Та өөрийн бизнесээ эхлэхийг хүсч байвал бид танд маш их хөнгөлөлттэй (90% хөнгөлөлттэй) туслах болно.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8 px-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
                  </div>
                  <div className="text-[12px] font-bold text-white">Дэмжлэг</div>
                  <div className="text-[10px] text-gray-500">100% Хамгаалалт</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Rocket className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-[12px] font-bold text-white">Шуурхай</div>
                  <div className="text-[10px] text-gray-500">Хурдан эхлэл</div>
                </div>
              </div>

              <div className="space-y-3 px-4">
                <button 
                  onClick={handlePromoAction}
                  className="w-full bg-primary text-white py-4 rounded-xl font-black text-sm shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group transition-all active:scale-95"
                >
                  Хямдралтай Захиалга Өгөх
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={handleStart}
                  className="w-full bg-transparent text-gray-500 py-3 rounded-xl font-bold text-[12px] hover:text-white transition-colors"
                >
                  Дараа болох уу? Үндсэн сайт руу очих
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
