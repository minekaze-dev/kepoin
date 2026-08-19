import React, { useState, useEffect } from 'react';
import { Sparkles, Compass, MessageCircle, Trophy, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { storage } from '../lib/storage';

interface OnboardingModalProps {
  onComplete?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const { lang } = useLanguage();

  useEffect(() => {
    const needsOnboarding = localStorage.getItem('kepoin_needs_onboarding') === 'true';
    const isLoggedIn = storage.getIsLoggedIn();
    if (needsOnboarding && isLoggedIn) {
      setIsOpen(true);
    }
  }, []);

  const handleFinish = () => {
    localStorage.removeItem('kepoin_needs_onboarding');
    setIsOpen(false);
    if (onComplete) onComplete();
  };

  if (!isOpen) return null;

  const steps = [
    {
      title: lang === 'id' ? 'Selamat Datang di Kepoin! 🎉' : 'Welcome to Kepoin! 🎉',
      subtitle: lang === 'id' ? 'Platform interaktif sosial media tempat kamu bisa tanya jawab, polling, dan berbagi opini seru.' : 'Interactive social platform where you can ask, poll, and share exciting opinions.',
      icon: <Sparkles className="w-12 h-12 text-white" />,
      gradient: 'from-[#12A889] via-[#0D9488] to-[#0284C7]',
      illustrationBg: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
      features: [
        lang === 'id' ? '✨ Berinteraksi dengan komunitas aktif' : '✨ Interact with an active community',
        lang === 'id' ? '🔥 Temukan topik trending setiap hari' : '🔥 Discover trending topics daily',
        lang === 'id' ? '🌟 Ekspresikan dirimu secara autentik' : '🌟 Express yourself authentically'
      ]
    },
    {
      title: lang === 'id' ? 'Buat Drop & Polling Seru 📝' : 'Create Drops & Polls 📝',
      subtitle: lang === 'id' ? 'Bagikan pertanyaan, foto, lagu, angka, atau pilihan ganda ("This or That") ke seluruh pengguna.' : 'Share questions, photos, songs, numbers, or choices ("This or That") with everyone.',
      icon: <Compass className="w-12 h-12 text-white" />,
      gradient: 'from-[#0D9488] via-[#0284C7] to-[#4F46E5]',
      illustrationBg: 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400',
      features: [
        lang === 'id' ? '📸 Unggah foto & momen seru' : '📸 Upload photos & cool moments',
        lang === 'id' ? '🎵 Bagikan lagu favoritmu' : '🎵 Share your favorite songs',
        lang === 'id' ? '🗳️ Buat voting pilihan ganda interaktif' : '🗳️ Create interactive poll choices'
      ]
    },
    {
      title: lang === 'id' ? 'Voting & Diskusi Obrolan 💬' : 'Vote & Chat Discussions 💬',
      subtitle: lang === 'id' ? 'Berikan suaramu pada setiap Drop dan ikuti diskusi seru di kolom obrolan secara real-time. Selamat bergabung di Kepoin!' : 'Cast your vote on every Drop and join exciting discussions in real-time chat. Welcome to Kepoin!',
      icon: <MessageCircle className="w-12 h-12 text-white" />,
      gradient: 'from-[#0284C7] via-[#4F46E5] to-[#7C3AED]',
      illustrationBg: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
      features: [
        lang === 'id' ? '📊 Lihat hasil statistik voting instan' : '📊 View instant vote statistics',
        lang === 'id' ? '💬 Kirim komentar & tanggapan menarik' : '💬 Send comments & interesting replies',
        lang === 'id' ? '🚀 Selamat bergabung di Kepoin!' : '🚀 Welcome to Kepoin!'
      ]
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-dark-surface rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-dark-border">
        
        {/* Top Header Gradient Bar */}
        <div className={`h-2.5 w-full bg-gradient-to-r ${currentStep.gradient} transition-all duration-500`} />

        {/* Close / Skip button */}
        <button
          onClick={handleFinish}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-dark-text p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border transition-colors cursor-pointer z-10"
          title={lang === 'id' ? 'Lewati Tutorial' : 'Skip Tutorial'}
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8">
          {/* Step Icon with Gradient Background */}
          <div className="flex justify-center mb-6">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${currentStep.gradient} flex items-center justify-center shadow-lg shadow-teal-500/20 transform transition-transform hover:scale-105 duration-300`}>
              {currentStep.icon}
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="text-center space-y-2 mb-6">
            <h3 className="text-xl sm:text-2xl font-extrabold text-charcoal dark:text-dark-text tracking-tight">
              {currentStep.title}
            </h3>
            <p className="text-[13px] sm:text-[14px] text-gray-600 dark:text-dark-muted max-w-md mx-auto leading-relaxed">
              {currentStep.subtitle}
            </p>
          </div>

          {/* Feature Bullets */}
          <div className="bg-gray-50 dark:bg-dark-bg/60 rounded-xl p-4 mb-8 space-y-2.5 border border-gray-100 dark:border-dark-border">
            {currentStep.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-[13px] font-medium text-gray-700 dark:text-dark-text">
                <span className="w-2 h-2 rounded-full bg-[#12A889]" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Progress Dots & Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setStep(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    step === idx 
                      ? 'w-6 bg-gradient-to-r from-[#12A889] to-[#0D9488]' 
                      : 'w-2 bg-gray-200 dark:bg-dark-border hover:bg-gray-300'
                  }`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-[13px] font-bold text-gray-600 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-border rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft size={15} />
                  <span>{lang === 'id' ? 'Kembali' : 'Back'}</span>
                </button>
              )}

              {step < steps.length - 1 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-5 py-2.5 text-[13px] font-bold text-white bg-gradient-to-r from-[#12A889] via-[#0D9488] to-[#0284C7] hover:opacity-95 shadow-md shadow-teal-500/25 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>{lang === 'id' ? 'Lanjut' : 'Next'}</span>
                  <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="px-6 py-2.5 text-[13px] font-bold text-white bg-gradient-to-r from-[#12A889] via-[#0D9488] to-[#0284C7] hover:opacity-95 shadow-lg shadow-teal-500/30 rounded-xl transition-all cursor-pointer flex items-center gap-2 transform hover:scale-[1.02]"
                >
                  <span>{lang === 'id' ? 'Mulai Jelajahi Sekarang 🚀' : 'Explore Now 🚀'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
