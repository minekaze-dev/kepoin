const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// Replace top wrapper
code = code.replace(
  '<div className="space-y-7">',
  '<div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">\\n      <div className="flex-1 min-w-0 space-y-7 w-full">'
);

// Add Right Sidebar
const sidebarHTML = `
      </div>
      
      {/* Right Sidebar */}
      <div className="hidden lg:flex w-[320px] shrink-0 flex-col gap-6 sticky top-4">
        {/* Widget 1: Kepoin Hari Ini */}
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <span className="text-[14px]">💡</span>
            <h3 className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-dark-muted">
              KEPOIN HARI INI
            </h3>
          </div>
          <p className="text-[15px] font-bold text-gray-900 dark:text-dark-text mb-5 leading-snug relative z-10">
            Apa hal kecil yang bikin kamu senang hari ini?
          </p>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[13px] text-gray-500 dark:text-dark-muted font-medium">
              342 jawaban
            </span>
            <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-200 dark:border-orange-500/20 cursor-pointer hover:bg-orange-100 transition-colors">
              <span className="text-[14px] font-bold">→</span>
            </div>
          </div>
        </div>

        {/* Widget 2: Lagi Ramai */}
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-dark-muted">
              LAGI RAMAI 🔥
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-11 h-11 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                 <img src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&h=100&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-900 dark:text-dark-text leading-tight mb-1 truncate group-hover:text-orange-500 transition-colors">
                  Bubur diaduk vs tidak diaduk?
                </p>
                <p className="text-[11px] text-gray-500 dark:text-dark-muted font-medium">
                  <span className="text-gray-900 dark:text-dark-text font-bold">1.2K</span> jawaban
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-11 h-11 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                 <img src="https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=100&h=100&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-900 dark:text-dark-text leading-tight mb-1 truncate group-hover:text-orange-500 transition-colors">
                  Kopi susu atau americano?
                </p>
                <p className="text-[11px] text-gray-500 dark:text-dark-muted font-medium">
                  <span className="text-gray-900 dark:text-dark-text font-bold">842</span> jawaban
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-11 h-11 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center bg-blue-50 text-blue-500">
                 <span className="text-[20px]">📱</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-900 dark:text-dark-text leading-tight mb-1 truncate group-hover:text-orange-500 transition-colors">
                  HP sekarang berapa %?
                </p>
                <p className="text-[11px] text-gray-500 dark:text-dark-muted font-medium">
                  <span className="text-gray-900 dark:text-dark-text font-bold">621</span> jawaban
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 3: Orang Lagi Kepo */}
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-dark-muted">
              ORANG LAGI KEPO
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center shrink-0">
                <span className="text-[16px]">📸</span>
              </div>
              <div className="flex-1 min-w-0 text-[12px] text-gray-600 dark:text-dark-muted font-medium truncate">
                <span className="font-bold text-gray-900 dark:text-dark-text">38</span> sedang lihat Foto
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center shrink-0">
                <span className="text-[16px]">🎵</span>
              </div>
              <div className="flex-1 min-w-0 text-[12px] text-gray-600 dark:text-dark-muted font-medium truncate">
                <span className="font-bold text-gray-900 dark:text-dark-text">27</span> sedang cari Lagu
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
                <span className="text-[16px]">🔢</span>
              </div>
              <div className="flex-1 min-w-0 text-[12px] text-gray-600 dark:text-dark-muted font-medium truncate">
                <span className="font-bold text-gray-900 dark:text-dark-text">19</span> sedang jawab Angka
              </div>
            </div>
          </div>
        </div>

      </div>
      
      {/* Delete Confirmation Modal */}
`;

code = code.replace('{/* Delete Confirmation Modal */}', sidebarHTML);

fs.writeFileSync('src/pages/Home.tsx', code);
console.log("Layout replaced successfully.");
