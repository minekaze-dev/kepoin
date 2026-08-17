import React from 'react';
import { useLanguage } from '../lib/i18n';

export const Terms = () => {
  const { lang } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl p-8 shadow-sm">
        <h1 className="text-[24px] font-extrabold text-gray-900 dark:text-dark-text mb-6">
          {lang === 'id' ? 'Ketentuan Layanan' : 'Terms of Service'}
        </h1>
        
        <div className="space-y-6 text-[14px] text-gray-600 dark:text-dark-muted leading-relaxed">
          <p>
            {lang === 'id' 
              ? 'Selamat datang di Kepoin! Dengan menggunakan layanan kami, Anda menyetujui ketentuan ini. Harap baca dengan seksama.'
              : 'Welcome to Kepoin! By using our service, you agree to these terms. Please read them carefully.'}
          </p>

          <section>
            <h2 className="text-[16px] font-bold text-gray-900 dark:text-dark-text mb-2">
              {lang === 'id' ? '1. Penerimaan Ketentuan' : '1. Acceptance of Terms'}
            </h2>
            <p>
              {lang === 'id'
                ? 'Dengan mengakses atau menggunakan Kepoin, Anda setuju untuk terikat oleh Ketentuan Layanan ini. Jika Anda tidak setuju dengan ketentuan ini, Anda tidak diperkenankan menggunakan layanan kami.'
                : 'By accessing or using Kepoin, you agree to be bound by these Terms of Service. If you do not agree, you may not use our service.'}
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-gray-900 dark:text-dark-text mb-2">
              {lang === 'id' ? '2. Konten Pengguna' : '2. User Content'}
            </h2>
            <p>
              {lang === 'id'
                ? 'Anda bertanggung jawab penuh atas konten yang Anda buat, kirimkan, atau bagikan di Kepoin. Kami tidak mentolerir konten yang melanggar hukum, berbahaya, mengintimidasi, atau bernada kebencian. Kami berhak menghapus konten apa pun yang melanggar panduan komunitas kami.'
                : 'You are responsible for the content you drop, share, and post on Kepoin. We do not tolerate illegal, harmful, or abusive content. We reserve the right to remove any content that violates our guidelines.'}
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-gray-900 dark:text-dark-text mb-2">
              {lang === 'id' ? '3. Privasi' : '3. Privacy'}
            </h2>
            <p>
              {lang === 'id'
                ? 'Privasi Anda sangat penting bagi kami. Silakan tinjau Kebijakan Privasi kami untuk memahami bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.'
                : 'Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and share your information.'}
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-gray-900 dark:text-dark-text mb-2">
              {lang === 'id' ? '4. Perubahan Ketentuan' : '4. Changes to Terms'}
            </h2>
            <p>
              {lang === 'id'
                ? 'Kami dapat mengubah atau memperbarui ketentuan ini sewaktu-waktu. Penggunaan berkelanjutan Anda atas Kepoin setelah pembaruan tersebut merupakan bentuk persetujuan Anda terhadap Ketentuan Layanan yang baru.'
                : 'We may modify these terms at any time. Your continued use of Kepoin after any such changes constitutes your acceptance of the new Terms of Service.'}
            </p>
          </section>

          <p className="pt-4 text-[13px] text-gray-400">
            {lang === 'id' ? 'Terakhir diperbarui: Agustus 2026' : 'Last updated: August 2026'}
          </p>
        </div>
      </div>
    </div>
  );
};
