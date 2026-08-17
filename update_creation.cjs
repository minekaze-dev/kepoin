const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const startStr = '<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">';
const endStr = '{/* CHOICE options configuration if CHOICE is selected */}';
const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf(endStr);

if (startIdx > -1 && endIdx > -1) {
  const replacement = `
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {[
                { type: 'PHOTO', icon: '📸', label: t.create.types.PHOTO },
                { type: 'TEXT', icon: '✍️', label: t.create.types.TEXT },
                { type: 'NUMBER', icon: '🔢', label: t.create.types.NUMBER },
                { type: 'PLACE', icon: '📍', label: t.create.types.PLACE },
                { type: 'SONG', icon: '🎵', label: t.create.types.SONG || 'Music' },
                { type: 'CHOICE', icon: '🗳️', label: t.create.types.CHOICE || 'Choice' },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => setSelectedType(item.type as ResponseType)}
                  className={\`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] border transition-all whitespace-nowrap shrink-0
                    \${selectedType === item.type 
                      ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500 text-orange-600 dark:text-orange-500 font-medium shadow-sm' 
                      : 'bg-white dark:bg-dark-surface border-gray-100 dark:border-dark-border text-gray-600 dark:text-dark-muted hover:border-gray-200 dark:hover:border-dark-muted'}
                  \`}
                >
                  <span className="text-[14px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
              
              <div className="w-px h-6 bg-gray-200 dark:bg-dark-border mx-1 shrink-0 hidden sm:block"></div>
              
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[13px] font-medium text-gray-500 dark:text-dark-muted whitespace-nowrap">{t.home.expirations} :</span>
                <select 
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="bg-transparent border-none text-[13px] font-medium text-gray-700 dark:text-dark-text outline-none cursor-pointer hover:text-charcoal dark:hover:text-dark-text transition-colors"
                >
                  <option value="1 hour" className="dark:bg-dark-surface">{t.create.exp.h1}</option>
                  <option value="1 day" className="dark:bg-dark-surface">{t.create.exp.d1}</option>
                  <option value="3 days" className="dark:bg-dark-surface">{t.create.exp.d3}</option>
                </select>
              </div>

              {/* Quick Settings */}
              <div className="flex items-center gap-4 shrink-0">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={quickSettings.allowAnonymous}
                    onChange={(e) => setQuickSettings({...quickSettings, allowAnonymous: e.target.checked})}
                    className="w-3.5 h-3.5 accent-orange-500 rounded"
                  />
                  <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-600 transition-colors uppercase tracking-wider">{t.create.allowAnon}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={quickSettings.allowTalks}
                    onChange={(e) => setQuickSettings({...quickSettings, allowTalks: e.target.checked})}
                    className="w-3.5 h-3.5 accent-orange-500 rounded"
                  />
                  <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-600 transition-colors uppercase tracking-wider">{t.create.allowTalks}</span>
                </label>
              </div>
            </div>

            `;
  code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
  fs.writeFileSync('src/pages/Home.tsx', code);
  console.log('Categories updated successfully.');
} else {
  console.log('Not found');
}
