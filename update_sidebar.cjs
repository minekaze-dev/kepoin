const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const startStr = '{/* Right Sidebar */}';
const endStr = '{/* Delete Confirmation Modal */}';
const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf(endStr);

if (startIdx > -1 && endIdx > -1) {
  const replacement = `
      {/* Right Sidebar */}
      <div className="hidden lg:flex w-[280px] shrink-0 flex-col gap-6 sticky top-4">
        {/* Widget 1: This or That */}
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <span className="text-[14px]">💡</span>
            <h3 className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-dark-muted">
              THIS OR THAT
            </h3>
          </div>
          <p className="text-[15px] font-bold text-gray-900 dark:text-dark-text mb-5 leading-snug relative z-10">
            {dailyItem.prompt}
          </p>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[13px] text-gray-500 dark:text-dark-muted font-medium">
              {(voteCounts.a + voteCounts.b).toLocaleString('id-ID')} jawaban
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
            {trendingList.slice(0, 3).map((drop, idx) => {
              const responses = storage.getResponses(drop.id);
              const { photos } = getTrendingPreview(drop);
              return (
                <Link key={drop.id} to={\`/drop/\${drop.slug}\`} className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-11 h-11 rounded-lg bg-gray-50 dark:bg-dark-bg overflow-hidden shrink-0 border border-gray-100 dark:border-dark-border flex items-center justify-center">
                     {drop.type === 'PHOTO' && photos.length > 0 ? (
                       <img src={photos[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                     ) : (
                       <span className="text-[18px]">
                         {drop.type === 'PHOTO' ? '📸' : 
                          drop.type === 'TEXT' ? '📝' : 
                          drop.type === 'NUMBER' ? '🔢' : 
                          drop.type === 'CHOICE' ? '🗳️' : 
                          drop.type === 'SONG' ? '🎵' : 
                          drop.type === 'PLACE' ? '📍' : drop.type}
                       </span>
                     )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-900 dark:text-dark-text leading-tight mb-1 truncate group-hover:text-orange-500 transition-colors">
                      {drop.prompt}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-dark-muted font-medium">
                      <span className="text-gray-900 dark:text-dark-text font-bold">
                        {responses.length >= 1000 ? (responses.length/1000).toFixed(1) + 'K' : responses.length}
                      </span> jawaban
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      
      `;
  code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
  fs.writeFileSync('src/pages/Home.tsx', code);
  console.log('Sidebar updated successfully.');
} else {
  console.log('Not found');
}
