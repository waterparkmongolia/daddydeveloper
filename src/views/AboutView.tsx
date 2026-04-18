import React from 'react';
import { motion } from 'motion/react';
import { 
  Rocket, Check, X, Eye, Target, Sparkles, 
  Heart, Shield, TrendingUp, Lightbulb, Zap, Users
} from 'lucide-react';
import { cn } from '../lib/utils';

export function AboutView() {
  return (
    <div className="h-full overflow-y-auto no-scrollbar scroll-smooth bg-white">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-[#0f172a] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] md:text-[12px] mb-6 block">
              About Daddy Developer
            </span>
            <h1 className="text-4xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tighter">
              Бид зүгээр нэг Website <br />
              <span className="text-primary italic">хийж өгөхгүй.</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              Нийгэм, эдийн засгийн уналттай энэ үед та бүхэнд зориулсан 90% хямдралтай онцгой боломж 🚀
              Та өөрийн дэлгүүр, бизнесдээ Website-тай болох цаг яг одоо.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-black text-[#0f172a]">Миний амлалт</h2>
            <div className="space-y-4">
              {[
                "Би танд зааж өгнө.",
                "Та өөрөө цаашид хөгжүүлж чаддаг болно.",
                "Нэг үгээр — надад дахин мөнгө төлөх шаардлагагүй болно."
              ].map((text, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-[15px] font-bold text-[#0f172a]">{text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-4">
            {/* Comparison Logic */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl border border-red-100 bg-red-50/30"
            >
              <div className="flex items-center gap-2 mb-4 text-red-600">
                <X className="w-5 h-5" />
                <span className="font-black uppercase tracking-widest text-[11px]">Бусад газрууд</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-bold text-gray-600">Танилцуулга сайт</span>
                  <span className="text-[13px] font-black text-red-600 opacity-60 line-through">2M - 3M₮</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-bold text-gray-600">Full E-Commerce</span>
                  <span className="text-[13px] font-black text-red-600 opacity-60 line-through">10M₮+</span>
                </div>
                <div className="pt-2 border-t border-red-100 flex justify-between items-center">
                  <span className="text-[11px] font-bold text-gray-500 italic">Хугацаа</span>
                  <span className="text-[11px] font-bold text-gray-500">7-28 хоног</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl border border-primary bg-primary/5 shadow-xl shadow-primary/5"
            >
              <div className="flex items-center gap-2 mb-4 text-primary">
                <Check className="w-5 h-5" />
                <span className="font-black uppercase tracking-widest text-[11px]">Харин энд</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-[15px] font-black text-[#0f172a]">7–14 цагийн дотор</span>
                </div>
                <div className="space-y-2">
                  <p className="text-[13px] font-medium text-[#64748b]">✔️ Тантай хамт сууж байгаад</p>
                  <p className="text-[13px] font-medium text-[#64748b]">✔️ Шууд нүдэн дээр чинь бүтээж өгнө</p>
                  <p className="text-[13px] font-medium text-[#64748b]">✔️ Дээрээс нь бүх процессыг зааж өгнө</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Website Section */}
      <section className="py-16 md:py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-black text-[#0f172a] mb-12">Та яагаад Website-тэй болох ёстой вэ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: "24/7 Ажиллагаа", desc: "Амралтгүй ажиллах онлайн дэлгүүртэй болно" },
              { icon: Shield, title: "Брэнд Имидж", desc: "Итгэл төрүүлсэн брэнд имиджтэй болно" },
              { icon: Users, title: "Хязгааргүй Хүрээ", desc: "Хэн ч, хаанаас ч таны бизнесийг олж харна" },
              { icon: TrendingUp, title: "Борлуулалт", desc: "Борлуулалт тань зөвхөн байршлаас хамаарахаа болино" },
              { icon: Rocket, title: "Дараагийн шат", desc: "Та бизнесээ дараагийн шатанд гаргана" },
              { icon: Sparkles, title: "Ур чадвар", desc: "Та зүгээр нэг сайт авахгүй, ур чадвар + систем авна" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-2xl border border-border-base text-left group"
              >
                <item.icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-[15px] font-black text-[#0f172a] mb-2">{item.title}</h3>
                <p className="text-[13px] text-[#64748b] leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us (Personal Story) */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full inline-block text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            Our Story
          </div>
          <h2 className="text-3xl font-black text-[#0f172a] mb-6">Бидний Тухай</h2>
          <p className="text-[#64748b] font-medium leading-[1.8] text-[15px] md:text-[17px]">
            Daddy Developer бол Website хөгжүүлэлтийн чиглэлээр ажилладаг хувь хүн бөгөөд энэ цаг үеийн нийгэм, эдийн засгийн нөхцөл байдлыг ойлгон аавууддаа зориулсан 90% хямдралтай үйлчилгээ санал болгож байна.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-polish p-8 bg-white border-l-4 border-l-primary"
          >
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-black text-[#0f172a]">Бидний Зорилго</h3>
            </div>
            <ul className="space-y-4">
              {[
                "Монголын аавуудыг орлоготой, дижитал орчинд бэлэн болгох",
                "Хүн бүрт Website-тэй болох боломжийг нээх",
                "Өндөр үнэтэй, удаан хугацааны системийг хялбар болгох",
                "Бизнесийг 7–14 цагийн дотор онлайн болгох",
                "Зөвхөн үйлчилгээ биш — мэдлэгийг хамт өгөх"
              ].map((text, i) => (
                <li key={i} className="flex gap-3 text-[14px] text-[#64748b] font-medium">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="card-polish p-8 bg-white border-l-4 border-l-purple-500"
          >
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-6 h-6 text-purple-500" />
              <h3 className="text-lg font-black text-[#0f172a]">Алсын Хараа</h3>
            </div>
            <ul className="space-y-4">
              {[
                "Дижитал чадвартай аавуудын шинэ үеийг бий болгох",
                "Аав бүр онлайн орчинд орлого олдог болох",
                "Бизнес бүр Website-тэй, системтэй болох",
                "Хэн нэгнээс хамааралгүйгээр өөрсдөө хөгждөг болох",
                "Итгэл дээр суурилсан, чадвартай бизнесийн экосистем"
              ].map((text, i) => (
                <li key={i} className="flex gap-3 text-[14px] text-[#64748b] font-medium">
                  <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-purple-600" />
                  </div>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-[#0f172a] text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <Rocket className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-black mb-6">Өнөөдөр эхэл — маргааш бэлэн сайттай бол</h2>
          <p className="text-gray-400 mb-10 font-medium">Бид таныг зүгээр нэг хэрэглэгч биш, өөрийн бизнесээ өөрөө хөгжүүлэгч болгоно.</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary text-white px-12 py-4 rounded-xl font-black text-lg shadow-2xl shadow-primary/20"
          >
            Одоо эхлэх
          </motion.button>
        </div>
      </section>

      {/* Bottom Spacer */}
      <div className="h-40 bg-[#0f172a]" />
    </div>
  );
}

const Clock = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
