import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2, QrCode } from 'lucide-react';
import axios from 'axios';

function CyberGrid() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="pgrid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#3b82f6" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pgrid)" />
    </svg>
  );
}

export function CyberCityPaymentView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [checking, setChecking] = useState(false);
  const [success, setSuccess] = useState(false);

  // State passed from CyberCityView (no React components — only plain values)
  const {
    paymentInfo,
    selectedTypeId, selectedTypeName, selectedTypePrice,
    ccid, ccrn, ccbd,
    fullName, username, birthday,
  } = (state || {}) as any;

  if (!paymentInfo) {
    navigate('/cyber-city');
    return null;
  }

  const handleConfirm = async () => {
    setChecking(true);
    try {
      const res = await axios.get(`/api/qpay/check?invoiceId=${paymentInfo.invoice_id}`);
      const rows = res.data?.rows || [];
      const paid = rows.some((r: any) => r.payment_status === 'PAID');
      if (paid) {
        // Save citizen to Firestore
        try {
          await addDoc(collection(db, 'cyberCitizens'), {
            userId: user?.uid || null,
            fullName, username, birthday,
            ccid, ccrn, ccbd,
            citizenType: selectedTypeId,
            citizenName: selectedTypeName,
            monthlyFee: selectedTypePrice,
            paymentStatus: 'paid',
            createdAt: serverTimestamp(),
          });
        } catch (e) { console.warn('Firestore:', e); }
        setSuccess(true);
        setTimeout(() => navigate('/cyber-city/home', {
          state: {
            citizen: {
              ccid,
              username,
              fullName,
              citizenType: selectedTypeId,
              citizenName: selectedTypeName,
            },
          },
        }), 2200);
      } else {
        alert('Төлбөр баталгаажаагүй байна. Дахин шалгана уу.');
      }
    } catch {
      alert('Шалгахад алдаа гарлаа.');
    } finally {
      setChecking(false);
    }
  };

  const banks = paymentInfo.urls || [];

  return (
    <div className="fixed inset-0 bg-[#030712] flex flex-col overflow-hidden">
      <CyberGrid />
      <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
        <button type="button" onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-xs font-black uppercase tracking-widest">
          <ArrowLeft className="w-3.5 h-3.5" /> Буцах
        </button>
        <div className="text-center">
          <p className="text-white/40 text-[9px] uppercase tracking-[0.3em] font-black">Төлбөр</p>
          <p className="text-white font-black text-sm">{selectedTypeName}</p>
        </div>
        <div className="w-16" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* Left: QR */}
        <div className="flex flex-col items-center justify-center px-6 py-4 md:w-1/2 md:border-r md:border-white/5">
          <p className="text-white/30 text-[10px] uppercase tracking-widest font-black mb-4">QR Код Уншуулах</p>
          {paymentInfo.qr_image ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 18 }}
              className="bg-white p-4 rounded-3xl shadow-2xl shadow-blue-500/10"
            >
              <img
                src={`data:image/png;base64,${paymentInfo.qr_image}`}
                alt="QPay QR"
                className="w-48 h-48 md:w-56 md:h-56"
              />
            </motion.div>
          ) : (
            <div className="w-48 h-48 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
              <QrCode className="w-16 h-16 text-white/20" />
            </div>
          )}
          <div className="mt-5 text-center">
            <p className="text-white font-black text-2xl">{selectedTypePrice?.toLocaleString()}₮</p>
            <p className="text-white/30 text-xs mt-1">/сар</p>
          </div>
        </div>

        {/* Right: Banks */}
        <div className="flex flex-col md:w-1/2 overflow-hidden">
          <p className="text-white/30 text-[10px] uppercase tracking-widest font-black text-center pt-4 pb-3 shrink-0">
            Банкны Апп-аар Төлөх
          </p>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="grid grid-cols-4 md:grid-cols-3 gap-2.5">
              {banks.map((bank: any, i: number) => (
                <motion.a
                  key={bank.name}
                  href={bank.link}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, scale: 0.7, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.04, type: 'spring', damping: 16, stiffness: 300 }}
                  whileHover={{ scale: 1.08, y: -3 }}
                  whileTap={{ scale: 0.92 }}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/8 hover:border-blue-400/30 transition-all"
                >
                  {bank.logo ? (
                    <img
                      src={bank.logo}
                      alt={bank.name}
                      className="w-10 h-10 rounded-xl object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-300 font-black text-[10px]">{bank.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                  )}
                  <span className="text-white/60 text-[8px] font-black uppercase tracking-wide text-center leading-tight line-clamp-2">
                    {bank.name}
                  </span>
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Confirm button */}
      <div className="relative z-10 px-5 pb-8 pt-4 shrink-0">
        <motion.button
          type="button"
          onClick={handleConfirm}
          disabled={checking}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full max-w-lg mx-auto flex items-center justify-center gap-3 py-4 rounded-2xl bg-blue-500 hover:bg-blue-400 disabled:opacity-60 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/30 transition-colors"
        >
          {checking
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><CheckCircle2 className="w-5 h-5" /> Баталгаажуулах</>
          }
        </motion.button>
      </div>

      {/* Success overlay */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-[#030712] flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 14, stiffness: 200 }}
              className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mb-6"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-white font-black text-3xl mb-2"
            >
              Амжилттай!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/40 text-sm"
            >
              Cyber City рүү нэвтэрч байна...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
