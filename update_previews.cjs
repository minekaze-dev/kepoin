const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const startStr = '{/* Previews */}';
const endStr = '{/* Right Sidebar */}';

const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf('<div className="flex flex-col items-center sm:items-end justify-center min-w-[60px] sm:min-w-[70px] shrink-0 gap-1 border-l border-gray-100 dark:border-dark-border pl-3 sm:pl-4">');

if (startIdx > -1 && endIdx > -1) {
  const replacement = `
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
                           {drop.settings?.options?.slice(0, 3).map((v, i) => {
                             const count = responses.filter(r => r.content === v).length;
                             return (
                             <div key={i} className="w-10 h-12 sm:w-12 sm:h-14 rounded-lg bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border flex flex-col items-center justify-center font-bold text-[10px] sm:text-[11px] text-gray-700 dark:text-dark-text shrink-0 text-center px-1 overflow-hidden">
                                <span className="truncate w-full">{v}</span>
                                <span className="text-[9px] text-gray-400 font-medium">{count >= 1000 ? (count/1000).toFixed(1) + 'K' : count}</span>
                             </div>
                             );
                           })}
                           {responses.length > 0 && (
                           <div className="w-10 h-12 sm:w-12 sm:h-14 rounded-lg bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-dark-border flex items-center justify-center font-bold text-[10px] text-gray-500 shrink-0">
                              +{responses.length}
                           </div>
                           )}
                        </div>
                      ) : drop.type === 'SONG' ? (
                         <div className="flex gap-1.5">
                           {responses.slice(0, 3).map((r, i) => (
                             <div key={i} className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-200 overflow-hidden shadow-xs shrink-0 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 text-[20px]">
                               🎵
                             </div>
                           ))}
                           {responses.length > 3 && (
                           <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-100 dark:bg-dark-bg flex items-center justify-center font-bold text-[11px] text-gray-500 border border-gray-200 shrink-0">
                              +{responses.length - 3}
                           </div>
                           )}
                         </div>
                      ) : drop.type === 'NUMBER' ? (
                         <div className="flex gap-1.5">
                           {responses.slice(0, 3).map((r, i) => {
                             let val = String(r.content);
                             if (Number(r.content) >= 1000) val = (Number(r.content)/1000).toFixed(0) + 'K';
                             return (
                             <div key={i} className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border flex flex-col items-center justify-center font-bold text-[12px] sm:text-[13px] text-gray-700 dark:text-dark-text shrink-0 text-center px-1 overflow-hidden">
                                {val}
                             </div>
                             );
                           })}
                           {responses.length > 3 && (
                           <div className="w-10 h-12 sm:w-12 sm:h-14 rounded-lg bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-dark-border flex items-center justify-center font-bold text-[10px] text-gray-500 shrink-0">
                              +{responses.length - 3}
                           </div>
                           )}
                         </div>
                      ) : (
                        <div className="flex gap-1.5">
                           {responses.slice(0, 2).map((r, i) => (
                             <div key={i} className="w-14 h-12 sm:w-16 sm:h-14 rounded-lg bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border flex flex-col p-1.5 shrink-0 overflow-hidden text-[9px] sm:text-[10px] text-gray-500 dark:text-dark-muted font-medium line-clamp-3 leading-tight break-words text-left">
                                {r.content?.toString()}
                             </div>
                           ))}
                           {responses.length > 2 && (
                           <div className="w-10 h-12 sm:w-12 sm:h-14 rounded-lg bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-dark-border flex items-center justify-center font-bold text-[10px] text-gray-500 shrink-0">
                              +{responses.length - 2}
                           </div>
                           )}
                        </div>
                      )}
                    </div>

                    `;
  code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
  fs.writeFileSync('src/pages/Home.tsx', code);
  console.log('Previews updated successfully.');
} else {
  console.log('Not found');
}
