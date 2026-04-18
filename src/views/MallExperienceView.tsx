import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, Store, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  X, ShoppingCart, Key, Phone, Globe, Facebook, Instagram, Youtube
} from 'lucide-react';

// Demo Shop Constants
const DEMO_SHOP_ID = 10001;
const DEMO_SHOP_DATA = {
    name: "Happy Bag Store",
    owner: "Биндэръяа",
    description: "Happy Bag Store бол чанартай, загварлаг, өдөр тутмын болон баяр ёслолын бүх төрлийн цүнхийг нэг дороос авах боломжтой дэлгүүр юм. Бид хамгийн сүүлийн үеийн трэнд загваруудыг боломжийн үнээр хэрэглэгчиддээ хүргэдэг.",
    phone: "99112233",
    website: "happybag.shop",
    facebook: "facebook.com/happybag",
    instagram: "@happybag_mn",
    youtube: "youtube.com/@happybag",
    profileImage: "https://picsum.photos/seed/happyprofile/200/200",
    coverImage: "https://picsum.photos/seed/happybagcover/1080/1080",
    products: [
        { id: 1, name: "Luxury Black Handbag", price: "120,000₮", image: "https://picsum.photos/seed/bag1/1080/1080" },
        { id: 2, name: "Vintage Leather Tote", price: "150,000₮", image: "https://picsum.photos/seed/bag2/1080/1080" },
        { id: 3, name: "Mini Pastel Clutch", price: "85,000₮", image: "https://picsum.photos/seed/bag3/1080/1080" },
        { id: 4, name: "Designer Travel Backpack", price: "210,000₮", image: "https://picsum.photos/seed/bag4/1080/1080" },
    ]
};

export function MallExperienceView() {
  const { mallId } = useParams();
  const navigate = useNavigate();
  const [mall, setMall] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Navigation State
  const [currentFloor, setCurrentFloor] = useState(1);
  const [currentShopIndex, setCurrentShopIndex] = useState(1);
  const [isInsideStore, setIsInsideStore] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [activeInstruction, setActiveInstruction] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [viewingProducts, setViewingProducts] = useState(false);

  const shopId = currentFloor * 10000 + currentShopIndex;
  const isDemoShop = shopId === DEMO_SHOP_ID;

  // Shop Stats (Simulated)
  const [followers, setFollowers] = useState(0);
  const [reviews, setReviews] = useState(0);
  const [views, setViews] = useState(0);

  // Increment view on entry
  useEffect(() => {
    if (isInsideStore && isDemoShop) {
      setViews(prev => prev + 1);
    }
  }, [isInsideStore, isDemoShop]);

  // Gesture Handling
  const lastTapTime = useRef(0);
  const tapTimeout = useRef<any>(null);

  useEffect(() => {
    const fetchMall = async () => {
      if (!mallId) return;
      try {
        const docRef = doc(db, 'malls', mallId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMall({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMall();
  }, [mallId]);

  const showInstruction = (msg: string) => {
    setActiveInstruction(msg);
    setTimeout(() => setActiveInstruction(null), 1000);
  };

  const handleDragEnd = (_: any, info: any) => {
    if (showOptions) return;
    const threshold = 100;
    const { offset } = info;

    // Inside Store logic
    if (isInsideStore) {
        if (viewingProducts && isDemoShop) {
            // Full Screen Browsing
            if (Math.abs(offset.x) > threshold) {
                if (offset.x < -threshold) { 
                    // Swipe Left -> Next Product
                    if (currentProductIndex < DEMO_SHOP_DATA.products.length - 1) {
                        setCurrentProductIndex(prev => prev + 1);
                    }
                } else if (offset.x > threshold) {
                    // Swipe Right -> Prev Product
                    if (currentProductIndex > 0) {
                        setCurrentProductIndex(prev => prev - 1);
                    } else {
                        // Swipe Right at first product -> Go back to Intro
                        setViewingProducts(false);
                    }
                }
            }
        } else if (!viewingProducts) {
            // Intro Mode -> Swipe Left to Enter Full Screen Browsing
            if (offset.x < -threshold) {
                setViewingProducts(true);
                setCurrentProductIndex(0);
                showInstruction('Бараа үзэх');
            }
        }
        return; 
    }

    // Outside Store
    if (Math.abs(offset.y) > Math.abs(offset.x)) {
      if (offset.y < -threshold) { 
        if (currentFloor > 1) {
          setCurrentFloor(prev => prev - 1);
          showInstruction('Доод Давхар');
        }
      } else if (offset.y > threshold) {
        if (currentFloor < (mall?.floors || 1)) {
          setCurrentFloor(prev => prev + 1);
          showInstruction('Дээд Давхар');
        }
      }
    } 
    else {
      if (offset.x < -threshold) {
        if (currentShopIndex < 10000) {
          setCurrentShopIndex(prev => prev + 1);
          showInstruction('Дараагын');
        }
      } else if (offset.x > threshold) {
        if (currentShopIndex > 1) {
          setCurrentShopIndex(prev => prev - 1);
          showInstruction('Өмнөх');
        }
      }
    }
  };

  const handleInteraction = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapTime.current < DOUBLE_TAP_DELAY) {
      if (tapTimeout.current) clearTimeout(tapTimeout.current);
      setShowOptions(true);
    } 
    lastTapTime.current = now;
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-black text-white">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
    </div>
  );

  return (
    <div className={`h-full relative overflow-hidden select-none touch-none flex flex-col transition-colors duration-500 ${isInsideStore ? 'bg-slate-50' : 'bg-black'}`}>
      {/* Background Layer (Cover Image or Product) */}
      <div className="absolute inset-0 z-0 bg-black">
        <AnimatePresence mode="wait">
            {!isInsideStore ? (
                <motion.img 
                  key={`hall-${shopId}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={isDemoShop ? DEMO_SHOP_DATA.coverImage : `https://picsum.photos/seed/${shopId}/1080/1080`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
            ) : viewingProducts && isDemoShop ? (
                <motion.img 
                  key={`full-prod-${currentProductIndex}`}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  src={DEMO_SHOP_DATA.products[currentProductIndex].image}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
            ) : (
                <motion.div 
                  key={`store-bg-${shopId}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0"
                >
                   <img src={isDemoShop ? DEMO_SHOP_DATA.coverImage : `https://picsum.photos/seed/${shopId}/1080/1080`} className="w-full h-full object-cover opacity-10" referrerPolicy="no-referrer" />
                   <div className="absolute inset-0 bg-white/40" />
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Top HUD (Inside OR Outside) */}
      <div className={`h-[8vh] w-full z-40 flex items-center justify-between px-6 relative shadow-sm transition-colors ${isInsideStore ? 'bg-white/80 backdrop-blur-md border-b border-slate-200' : 'bg-black/60 backdrop-blur-xl border-b border-white/10'}`}>
          <div className="flex items-center gap-2">
              <Store className={`w-4 h-4 ${isInsideStore ? 'text-primary' : 'text-white'}`} />
              <div className={`text-[10px] font-black uppercase tracking-widest ${isInsideStore ? 'text-slate-900' : 'text-white'}`}>
                  {viewingProducts ? `Бараа ${currentProductIndex + 1} / ${DEMO_SHOP_DATA.products.length}` : `${currentFloor}-р давхар · ${currentShopIndex}-р тоот${isDemoShop ? ` · ${DEMO_SHOP_DATA.name}` : ''}`}
              </div>
          </div>
          
          <button 
              onClick={() => {
                if (viewingProducts) setViewingProducts(false);
                else if (isInsideStore) setIsInsideStore(false);
                else navigate('/business');
              }}
              className={`p-1.5 rounded-lg transition-all ${isInsideStore ? 'bg-slate-100 text-slate-400 hover:bg-slate-200' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
              <X className="w-4 h-4" />
          </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative z-30 flex flex-col overflow-hidden">
        {/* Interaction Layer */}
        <motion.div 
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            onClick={handleInteraction}
            className="absolute inset-0 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
        >
            <AnimatePresence mode="wait">
                {isInsideStore && viewingProducts && isDemoShop && (
                    <motion.div 
                        key="full-hud"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-10 left-0 right-0 p-6 pointer-events-none"
                    >
                        <div className="max-w-xs mx-auto text-center">
                            <h3 className="text-white text-xl font-black uppercase italic tracking-tighter drop-shadow-xl leading-tight mb-2">
                                {DEMO_SHOP_DATA.products[currentProductIndex].name}
                            </h3>
                            <div className="inline-block px-10 py-3 bg-primary text-white rounded-full font-black text-lg shadow-2xl">
                                {DEMO_SHOP_DATA.products[currentProductIndex].price}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>

        {isInsideStore && !viewingProducts && (
            <div className="flex-1 flex flex-col p-4 md:p-6 pointer-events-none">
                {isDemoShop ? (
                    <div className="w-full flex flex-col gap-3">
                        {/* Profile Card */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 overflow-hidden">
                            <div className="flex items-center gap-4 p-4">
                                <img
                                    src={DEMO_SHOP_DATA.profileImage}
                                    className="w-16 h-16 rounded-2xl object-cover shadow-md flex-shrink-0 border-2 border-primary/10"
                                    referrerPolicy="no-referrer"
                                />
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-base font-black text-slate-900 uppercase italic tracking-tighter leading-tight">{DEMO_SHOP_DATA.name}</h2>
                                    <p className="text-primary font-black text-[8px] uppercase tracking-[0.2em] mt-0.5">Эзэмшигч: {DEMO_SHOP_DATA.owner}</p>
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <span className="bg-slate-100 text-slate-600 text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">{currentFloor}-р давхар</span>
                                        <span className="bg-slate-100 text-slate-600 text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">{currentShopIndex}-р тоот</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-4 divide-x divide-slate-100 border-t border-slate-100">
                                {[
                                    { label: 'Follower', value: followers },
                                    { label: 'Бараа', value: DEMO_SHOP_DATA.products.length },
                                    { label: 'Үзсэн', value: views },
                                    { label: 'Үнэлгээ', value: reviews },
                                ].map(stat => (
                                    <div key={stat.label} className="py-3 text-center">
                                        <div className="text-sm font-black text-slate-900">{stat.value}</div>
                                        <div className="text-[6px] font-black uppercase text-slate-400 tracking-wider mt-0.5">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 p-3 border-t border-slate-100 pointer-events-auto">
                                <button
                                    onClick={() => setFollowers(prev => prev + 1)}
                                    className="flex-1 py-2.5 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-md shadow-primary/20 active:scale-95 transition-all"
                                >
                                    Follow
                                </button>
                                <button
                                    onClick={() => setReviews(prev => prev + 1)}
                                    className="flex-1 py-2.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl active:scale-95 transition-all"
                                >
                                    Review
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-4 shadow-xl border border-white/60">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Дэлгүүрийн тухай</p>
                            <p className="text-slate-700 text-[11px] leading-relaxed font-medium">
                                {DEMO_SHOP_DATA.description}
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-4 shadow-xl border border-white/60 pointer-events-auto">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2.5">Холбогдох</p>
                            <div className="grid grid-cols-2 gap-2">
                                <ContactLink icon={<Phone />} title="Утас" value={DEMO_SHOP_DATA.phone} />
                                <ContactLink icon={<Globe />} title="Веб" value={DEMO_SHOP_DATA.website} />
                                <ContactLink icon={<Facebook />} title="Facebook" value="HappyBag" />
                                <ContactLink icon={<Instagram />} title="Instagram" value="@happy" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center pointer-events-auto">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center shadow-inner">
                            <Store className="w-8 h-8 text-slate-300" />
                        </div>
                        <div className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs italic">
                            Дэлгүүр доторх мэдээлэл байхгүй байна
                        </div>
                        <button
                            onClick={() => setIsInsideStore(false)}
                            className="bg-slate-900 text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg"
                        >
                            Гарах
                        </button>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Bottom Actions (Outside) */}
      {!isInsideStore && (
        <div className="h-[12vh] w-full bg-black/60 backdrop-blur-xl border-t border-white/10 z-20 flex flex-col items-center justify-center pb-4">
            <div className="w-full max-w-sm grid grid-cols-2 gap-4 px-6">
                <button className="bg-primary text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-tighter shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                    <ShoppingCart className="w-4 h-4" /> Худалдаж Авах
                </button>
                <button className="bg-white/10 text-white border border-white/10 py-3 rounded-2xl font-black text-[10px] uppercase tracking-tighter flex items-center justify-center gap-2">
                    <Key className="w-4 h-4" /> Түрээслэх
                </button>
            </div>
        </div>
      )}

      {/* Option Overlay */}
      <AnimatePresence>
        {showOptions && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
            >
                <div className="w-full max-w-xs space-y-4">
                    <header className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <Store className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase italic">Сонголт</h2>
                    </header>
                    
                    {!isInsideStore ? (
                        <button 
                            onClick={() => {
                                setIsInsideStore(true);
                                setShowOptions(false);
                            }}
                            className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                        >
                            Дэлгүүр лүү орох
                        </button>
                    ) : (
                        <button 
                            onClick={() => {
                                setIsInsideStore(false);
                                setShowOptions(false);
                            }}
                            className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest"
                        >
                            Дэлгүүрээс гарах
                        </button>
                    )}
                    
                    <button 
                        onClick={() => navigate('/business')}
                        className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-900/20"
                    >
                        Маллаас гарах
                    </button>
                    
                    <button 
                        onClick={() => setShowOptions(false)}
                        className="w-full text-white/40 py-2 font-black text-[10px] uppercase tracking-[0.3em]"
                    >
                        Болих
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Instructions HUD - Hide when inside */}
      {!isInsideStore && (
        <div className="absolute bottom-24 right-4 z-20 flex flex-col gap-1.5 opacity-30 hover:opacity-100 transition-opacity">
          <InstructionItem icon={<ArrowUp className="w-2.5 h-2.5" />} text="Доод" />
          <InstructionItem icon={<ArrowDown className="w-2.5 h-2.5" />} text="Дээд" />
          <InstructionItem icon={<ArrowLeft className="w-2.5 h-2.5" />} text="Next" />
          <InstructionItem icon={<ArrowRight className="w-2.5 h-2.5" />} text="Prev" />
        </div>
      )}

      {/* Temporary Notification */}
      <AnimatePresence>
        {activeInstruction && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-primary/20 backdrop-blur-md border border-primary/30 px-6 py-2 rounded-full"
          >
            <span className="text-primary font-black uppercase text-[10px] tracking-widest">{activeInstruction}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ContactLink({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) {
    return (
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:text-primary">
                {icon}
            </div>
            <div className="min-w-0">
                <div className="text-[7px] font-black uppercase text-slate-400 tracking-widest">{title}</div>
                <div className="text-[10px] font-bold text-slate-900 truncate">{value}</div>
            </div>
        </div>
    );
}

function InstructionItem({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
       {icon}
       <span className="text-[8px] font-black text-white/40 uppercase">{text}</span>
    </div>
  );
}
