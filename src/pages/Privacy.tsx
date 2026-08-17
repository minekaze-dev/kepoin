import React from 'react';
import { useLanguage } from '../lib/i18n';

export const Privacy = () => {
  const { lang } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl p-8 shadow-sm">
        <h1 className="text-[24px] font-extrabold text-gray-900 dark:text-dark-text mb-6">
          {lang === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}
        </h1>
        
        <div className="space-y-6 text-[14px] text-gray-600 dark:text-dark-muted leading-relaxed">
          <p>
            {lang === 'id'
              ? 'Di Kepoin, kami sangat menjaga dan menghormati privasi Anda. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.'
              : 'At Kepoin, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.'}
          </p>

          <section>
            <h2 className="text-[16px] font-bold text-gray-900 dark:text-dark-text mb-2">
              {lang === 'id' ? 'Informasi yang Kami Kumpulkan' : 'Information We Collect'}
            </h2>
            <p>
              {lang === 'id'
                ? 'Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami, seperti saat Anda membuat akun, membuat drop, memberikan jawaban, atau berkomunikasi dengan kami. Informasi ini dapat mencakup nama tampilan, nama pengguna, email, dan konten apa pun yang Anda kirimkan.'
                : 'We collect information you provide directly to us, such as when you create an account, participate in drops, or communicate with us. This may include your username, email address, and any content you submit.'}
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-gray-900 dark:text-dark-text mb-2">
              {lang === 'id' ? 'Cara Kami Menggunakan Informasi Anda' : 'How We Use Your Information'}
            </h2>
            <p>
              {lang === 'id'
                ? 'Kami menggunakan informasi yang dikumpulkan untuk mengoperasikan, memelihara, dan meningkatkan kualitas layanan kami, berkomunikasi dengan Anda, serta memberikan pengalaman yang lebih baik. Kami tidak menjual data pribadi Anda kepada pihak ketiga mana pun.'
                : 'We use the information we collect to operate and improve our services, communicate with you, and personalize your experience. We do not sell your personal data to third parties.'}
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-gray-900 dark:text-dark-text mb-2">
              {lang === 'id' ? 'Keamanan Data' : 'Data Security'}
            </h2>
            <p>
              {lang === 'id'
                ? 'Kami menerapkan langkah-langkah keamanan yang wajar untuk membantu melindungi informasi Anda dari kehilangan, pencurian, penyalahgunaan, akses tanpa izin, pengungkapan, perubahan, dan perusakan.'
                : 'We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.'}
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-gray-900 dark:text-dark-text mb-2">
              {lang === 'id' ? 'Hubungi Kami' : 'Contact Us'}
            </h2>
            <p>
              {lang === 'id'
                ? 'Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami di '
                : 'If you have any questions about this Privacy Policy, please contact us at '}
              <a href="mailto:dropin.tech@gmail.com" className="text-[#12A889] hover:underline">dropin.tech@gmail.com</a>.
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
