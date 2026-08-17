const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// I need to find the section between `{trendingTab === 'trending' ? (` and `)}      {/* Small Discover CTA */}`
const startIdx = code.indexOf("{trendingTab === 'trending' ? (");
const endIdx = code.indexOf("{/* Small Discover CTA */}");

if (startIdx > -1 && endIdx > -1) {
  const replacement = `
          <div className="flex flex-col gap-4">
            {(trendingTab === 'trending' ? trendingList : newList).slice(0, 10).map((drop, idx) => {
              const user = storage.getUserById(drop.ownerId);
              const responses = storage.getResponses(drop.id);
              const talks = getTotalTalks(drop.id);
              const { photos, extraCount } = getTrendingPreview(drop);
              
              const isTrending = trendingTab === 'trending';
              const rank = idx + 1;
              const dropDate = new Date(drop.createdAt);
              const now = new Date();
              const diffHours = Math.round((now.getTime() - dropDate.getTime()) / (1000 * 60 * 60));
              const timeString = diffHours < 1 ? 'baru saja' : \`\${diffHours} jam yang lalu\`;
              
              // time left
              const expiry = new Date(drop.expiresAt);
              const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const timeLeftString = daysLeft > 0 ? \`\${daysLeft} Hari tersisa\` : 'Berakhir';

              return (
                <div key={drop.id} className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:shadow-md transition-shadow relative group overflow-hidden">
                  {/* Left: Vote / Rank block */}
                  <div className="flex flex-row sm:flex-col items-center justify-center gap-1 sm:gap-0 min-w-[40px] shrink-0 text-gray-400">
                    <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 hover:text-orange-500 cursor-pointer text-orange-500" />
                    <span className="font-extrabold text-[13px] sm:text-[15px] text-gray-900 dark:text-white">
                      {responses.length >= 1000 ? (responses.length/1000).toFixed(1) + 'K' : responses.length}
                    </span>
                    <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 hover:text-orange-500 cursor-pointer" />
                  </div>

                  {/* Middle: Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={\`/drop/\${drop.slug}\`} className="block">
                      <h3 className="text-[15px] sm:text-[16px] font-bold text-gray-900 dark:text-white leading-snug mb-1 truncate">
                        {drop.prompt}
                      </h3>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] text-gray-500 dark:text-dark-muted font-medium mb-3 truncate">
                        <span className="hover:text-orange-500 cursor-pointer transition-colors shrink-0">
                           @{user?.username?.replace('@','') || 'someone'}
                        </span>
                        <span>•</span>
                        <span className="shrink-0">{timeString}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-dark-text border border-gray-200 dark:border-dark-border">
                          {drop.type === 'PHOTO' ? '📸 Foto' : 
                           drop.type === 'TEXT' ? '📝 Teks' : 
                           drop.type === 'NUMBER' ? '🔢 Angka' : 
                           drop.type === 'CHOICE' ? '🗳️ Pilihan' : 
                           drop.type === 'SONG' ? '🎵 Lagu' : 
                           drop.type === 'PLACE' ? '📍 Lokasi' : drop.type}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-bold text-orange-500">
                          {timeLeftString}
                        </span>
                      </div>
                    </Link>
                  </div>

                  {/* Right: Previews & Stats */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 mt-3 sm:mt-0">
                    {/* Previews */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {drop.type === 'PHOTO' && photos.length > 0 ? (
                        <>
                          {photos.slice(0, 3).map((url, i) => (
                            <div key={i} className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-200 overflow-hidden shadow-xs border border-white/50 shrink-0">
                              <img src={url} className="w-full h-full object-cover" onError={(e) => { (e.target).src = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=100&h=100&fit=crop'; }} />
                            </div>
                          ))}
                          {extraCount > 0 && (
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-100 dark:bg-dark-bg flex items-center justify-center font-bold text-[11px] text-gray-600 border border-gray-200 shrink-0">
                              +{extraCount}
                            </div>
                          )}
                        </>
                      ) : drop.type === 'CHOICE' ? (
                        <div className="flex gap-1.5">
                           {[18, 22, 25].map((v, i) => (
                             <div key={i} className="w-10 h-12 sm:w-12 sm:h-14 rounded-lg bg-gray-50 border border-gray-200 flex flex-col items-center justify-center font-bold text-[10px] text-gray-500 shrink-0">
                                {v}K
                             </div>
                           ))}
                           <div className="w-10 h-12 sm:w-12 sm:h-14 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-[10px] text-gray-500 shrink-0">
                              +{responses.length}
                           </div>
                        </div>
                      ) : drop.type === 'SONG' ? (
                         <div className="flex gap-1.5">
                           {['https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=100&h=100&fit=crop', 'https://images.unsplash.com/photo-1493225457124-a1a2a5956092?w=100&h=100&fit=crop', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop'].map((v, i) => (
                             <div key={i} className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-200 overflow-hidden shadow-xs shrink-0">
                               <img src={v} className="w-full h-full object-cover" />
                             </div>
                           ))}
                           <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-[11px] text-gray-500 border border-gray-200 shrink-0">
                              +{responses.length}
                           </div>
                         </div>
                      ) : (
                        <div className="flex gap-1.5">
                           {[1, 2].map((v, i) => (
                             <div key={i} className="w-14 h-12 sm:w-16 sm:h-14 rounded-lg bg-gray-50 border border-gray-200 flex flex-col p-1.5 shrink-0 overflow-hidden text-[8px] text-gray-400">
                                {responses[i]?.content?.toString().substring(0, 30) || '...'}
                             </div>
                           ))}
                           <div className="w-10 h-12 sm:w-12 sm:h-14 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-[10px] text-gray-500 shrink-0">
                              +{responses.length}
                           </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center sm:items-end justify-center min-w-[60px] sm:min-w-[70px] shrink-0 gap-1 border-l border-gray-100 dark:border-dark-border pl-3 sm:pl-4">
                      <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
                        <span className="font-extrabold text-[12px] sm:text-[14px] text-gray-900 dark:text-white">
                          {responses.length >= 1000 ? (responses.length/1000).toFixed(1) + 'K' : responses.length}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-medium text-gray-500 uppercase">jawaban</span>
                      </div>
                      <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
                        <span className="font-extrabold text-[11px] sm:text-[12px] text-gray-700 dark:text-gray-300">
                          {talks}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-medium text-gray-500 uppercase">obrolan</span>
                      </div>
                    </div>

                    <div className="hidden sm:block">
                      <button className="text-gray-300 hover:text-gray-600 p-1">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
      `;

  code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
  fs.writeFileSync('src/pages/Home.tsx', code);
  console.log("Feed Tabs replaced successfully.");
} else {
  console.log("Could not find start or end markers for Feed Tabs.");
}
