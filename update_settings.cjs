const fs = require('fs');
let code = fs.readFileSync('src/pages/Settings.tsx', 'utf-8');

const startStr = '<section className="space-y-4">\n          <h2 className="text-[16px] font-bold uppercase tracking-wider text-gray-400">About</h2>\n          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl p-6 shadow-sm space-y-4">';

const startStrAlt = '<section className="space-y-4">\n          <h2 className="text-[16px] font-bold uppercase tracking-wider text-gray-400">About</h2>';

const endStr = '</section>\n\n        {isLoggedIn';

const startIdx = code.indexOf('<section className="space-y-4">\n          <h2 className="text-[16px] font-bold uppercase tracking-wider text-gray-400">About</h2>');

const subcode = code.substring(startIdx);
const endIdxLocal = subcode.indexOf('</section>') + 10;
const endIdx = startIdx + endIdxLocal;

if (startIdx > -1 && endIdx > -1) {
  const replacement = `
        <section className="space-y-4">
          <h2 className="text-[16px] font-bold uppercase tracking-wider text-gray-400">About</h2>
          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center text-[14px] mb-2">
              <span className="font-black text-orange-600 dark:text-orange-500">Kepoin</span>
              <span className="text-gray-400 dark:text-dark-muted font-bold text-[11px] uppercase tracking-wider">Version 1.0</span>
            </div>
            <div className="space-y-3 text-[13px] text-gray-600 dark:text-dark-muted leading-relaxed">
              <p>Kepoin adalah tempat untuk bertanya, berbagi, dan melihat jawaban dari orang lain.</p>
              <p>Dibuat sederhana, ringan, dan tanpa harus selalu serius. Karena terkadang, hal kecil yang kita tanyakan justru menghasilkan sesuatu yang menarik.</p>
              <p className="font-bold text-gray-900 dark:text-dark-text pt-2">Tanya sesuatu. Lihat apa jawabannya.</p>
            </div>
          </div>
        </section>`;
  
  code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
  fs.writeFileSync('src/pages/Settings.tsx', code);
  console.log("Settings about section updated successfully");
} else {
  console.log("Could not find about section");
}
