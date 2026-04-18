import React from 'react';
import { motion } from 'motion/react';
import { Check, ChevronRight, Rocket, Shield, Clock, GraduationCap, Heart, Star, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const pricingPlans = [
  {
    oldPrice: "2,500,000₮",
    price: "250,000₮",
    title: "Хүлээх захиалга",
    description: "Манайд 100+ захиалга бүртгэлтэй байгаа тул таны сайт дарааллын дагуу хийгдэнэ.",
    features: ["Дарааллын дагуу", "Стандарт хөгжүүлэлт", "Имэйл дэмжлэг"],
    icon: Clock,
    accent: "bg-gray-100"
  },
  {
    oldPrice: "5,000,000₮",
    price: "500,000₮",
    title: "Шууд хамтын ажиллагаа",
    description: "Шууд таньтай уулзаж, 8 цагийн турш хамтран ажиллана. Бүх хэрэгцээт зүйлсээ хийлгэх боломжтой.",
    features: ["8 цаг шууд ажил", "VIP Уулзалт", "Шуурхай дэмжлэг"],
    icon: Rocket,
    accent: "bg-blue-50",
    popular: true
  },
  {
    oldPrice: "10,000,000₮",
    price: "1,000,000₮",
    title: "Сургалт + Хөгжүүлэлт",
    description: "Шууд таньтай уулзаж, заангаа хамт хийж өгнө. 8 цагийн турш хүссэн ажлуудаа хийлгэх боломжтой.",
    features: ["8 цаг заах + хийх", "Эх кодтой танилцах", "Технологийн зөвлөгөө"],
    icon: GraduationCap,
    accent: "bg-purple-50"
  },
  {
    oldPrice: "20,000,000₮",
    price: "2,000,000₮",
    title: "Бүрэн дэмжлэг",
    description: "Бүтэн 1 өдрийн турш заангаа хамт хийнэ. 1 сарын турш зөвлөгөө болон нэмэлт хөгжүүлэлтээр дэмжлэг үзүүлнэ.",
    features: ["Бүтэн өдөр", "1 сарын зөвлөгөө", "Нэмэлт хөгжүүлэлт", "Бүрэн хариуцлага"],
    icon: Shield,
    accent: "bg-green-50"
  }
];

export function LandingView() {
  return (
    <div className="h-full overflow-y-auto no-scrollbar scroll-smooth bg-bg-base">
      {/* Hero Section */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center p-4 md:p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <span className="text-[10px] md:text-[12px] uppercase tracking-[0.3em] font-bold text-[#64748b] mb-4 md:mb-6 block">
            PREMIUM WEB DEVELOPMENT
          </span>
          <h1 className="text-4xl md:text-8xl font-black leading-[1.1] md:leading-[0.9] mb-6 md:mb-8 tracking-tight text-[#0f172a]">
            Таны мөрөөдлийн <br />
            <span className="text-primary">вэбсайтыг</span> бид бүтээнэ.
          </h1>
          <p className="text-[14px] md:text-[16px] text-[#64748b] max-w-2xl mx-auto mb-8 md:mb-12 font-medium px-4">
            Daddy Developer бол таны бизнесийн дижитал ирээдүй. Чанартай, хурдан, найдвартай хөгжүүлэлт.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 px-6 md:px-0">
            <Link to="/order" className="w-full md:w-auto bg-primary text-white px-8 py-3.5 rounded-md font-bold text-sm md:text-base hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
              Захиалга Өгөх
            </Link>
            <a href="#pricing" className="w-full md:w-auto bg-surface border border-border-base px-8 py-3.5 rounded-md font-bold text-sm md:text-base hover:bg-gray-50 transition-all text-[#0f172a]">
              Үнийн санал харах
            </a>
          </div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 md:py-24 px-4 md:px-6 bg-surface border-t border-border-base">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-3 md:mb-4 text-[#0f172a]">Үнийн санал</h2>
            <p className="text-sm md:text-[#64748b] font-medium text-[#64748b]">Танд тохирох төлөвлөгөөг сонгоно уу</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {pricingPlans.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "relative p-6 md:p-8 rounded-xl border flex flex-col h-full hover:shadow-xl transition-all duration-300 bg-surface",
                  plan.popular ? "border-primary ring-1 ring-primary shadow-lg shadow-primary/5" : "border-border-base"
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full">
                    Most Popular
                  </span>
                )}
                
                <div className={cn("w-12 h-12 rounded-lg mb-6 flex items-center justify-center", plan.popular ? "bg-primary/10" : "bg-gray-100")}>
                  <plan.icon className={cn("w-6 h-6", plan.popular ? "text-primary" : "text-[#64748b]")} />
                </div>
                
                <div className="flex items-baseline gap-2 mb-2">
                  <div className="text-[20px] font-bold line-through text-gray-400 opacity-50">{plan.oldPrice}</div>
                  <div className="text-[28px] font-black text-[#0f172a]">{plan.price}</div>
                </div>
                <h3 className="text-[14px] font-bold mb-4 uppercase tracking-wider text-[#64748b]">{plan.title}</h3>
                <p className="text-sm text-[#64748b] mb-8 flex-1 leading-relaxed">
                  {plan.description}
                </p>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-3 text-[13px] font-medium text-[#0f172a]">
                      <Check className="w-4 h-4 text-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/order"
                  className={cn(
                    "w-full py-3.5 rounded-md font-bold transition-all text-center text-sm",
                    plan.popular ? "bg-primary text-white hover:bg-primary-dark shadow-md" : "bg-bg-base text-[#0f172a] hover:bg-gray-200 border border-border-base"
                  )}
                >
                  Сонгох
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Spacer for bottom nav */}
      <div className="h-40" />
    </div>
  );
}
