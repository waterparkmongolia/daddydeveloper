import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { motion } from 'motion/react';
import { Plus, Building, Layers, Image as ImageIcon, ArrowLeft, Upload, X } from 'lucide-react';

export function AdminMallView() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // Limit to 0.5MB for Base64 storage
        alert('Зургийн хэмжээ хэтэрхий том байна (Max 0.5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateMall = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (profile?.role !== 'admin') return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await addDoc(collection(db, 'malls'), {
        name: formData.get('name'),
        floors: Number(formData.get('floors')),
        coverImage: previewImage || formData.get('coverImage') || 'https://picsum.photos/seed/mall/800/600',
        createdBy: profile.uid,
        createdAt: serverTimestamp(),
      });
      alert('Малл амжилттай үүсгэгдлээ!');
      navigate('/business');
    } catch (error) {
      console.error(error);
      alert('Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto px-4 py-8 pb-32">
      <div className="max-w-xl mx-auto">
        <button 
          onClick={() => navigate('/business')}
          className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-6 font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Буцах
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-10"
        >
          <header className="mb-8">
            <h1 className="text-2xl font-black text-[#0f172a] mb-2 uppercase tracking-tight">Малл Үүсгэх</h1>
            <p className="text-sm text-gray-500 font-medium italic">Шинэ бизнес бүртгэж, виртуал орчныг бэлдэх</p>
          </header>

          <form onSubmit={handleCreateMall} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest flex items-center gap-2">
                <Building className="w-3 h-3" /> Маллын Нэр
              </label>
              <input 
                name="name" 
                required 
                placeholder="Жишээ: Sunday Plaza"
                className="w-full bg-gray-50 border border-border-base rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest flex items-center gap-2">
                <Layers className="w-3 h-3" /> Давхарын Тоо
              </label>
              <input 
                name="floors" 
                type="number" 
                required 
                min="1" 
                max="100"
                placeholder="Жишээ: 8"
                className="w-full bg-gray-50 border border-border-base rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest flex items-center gap-2">
                <ImageIcon className="w-3 h-3" /> Маллын Ковер
              </label>
              
              <div className="mt-2 space-y-4">
                {previewImage ? (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-100 shadow-inner group">
                    <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />
                    <button 
                      type="button"
                      onClick={() => setPreviewImage(null)}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-video border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all text-gray-400 hover:text-primary group"
                  >
                    <Upload className="w-8 h-8 transition-transform group-hover:-translate-y-1" />
                    <span className="text-xs font-bold uppercase tracking-wider">Зураг оруулах</span>
                  </button>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">Эсвэл URL оруулж болно</span>
                  <input 
                    name="coverImage" 
                    placeholder="https://..."
                    className="w-full bg-gray-50 border border-border-base rounded-xl px-4 py-2 text-xs font-bold outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm uppercase tracking-tighter shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
            >
              {loading ? 'Уншиж байна...' : 'Малл Үүсгэх'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
