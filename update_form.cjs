const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// 1. Remove the checkboxes from the main row
const checkboxesCode = `
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
              </div>`;

if (code.includes(checkboxesCode)) {
  code = code.replace(checkboxesCode, '');
} else {
  // Try to find it loosely
  const qStart = code.indexOf('{/* Quick Settings */}');
  const qEnd = code.indexOf('</div>', code.indexOf('allowTalks}</span>') + 10) + 6;
  if (qStart > -1 && qEnd > -1) {
    code = code.substring(0, qStart) + code.substring(qEnd);
  } else {
    console.log("Could not remove checkboxes");
  }
}

// 2. Insert checkboxes above the description
const descStart = '{/* Small description for response category & curiosity duration */}';
const newCheckboxes = `
            {/* Quick Settings (Checkboxes) */}
            <div className="flex items-center gap-6 px-1 pt-3 pb-2 border-t border-gray-100/70 dark:border-dark-border/50">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={quickSettings.allowAnonymous}
                    onChange={(e) => setQuickSettings({...quickSettings, allowAnonymous: e.target.checked})}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                  <span className="text-[12px] font-bold text-gray-500 group-hover:text-gray-700 dark:text-dark-muted dark:group-hover:text-dark-text transition-colors uppercase tracking-wider">{t.create.allowAnon}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={quickSettings.allowTalks}
                    onChange={(e) => setQuickSettings({...quickSettings, allowTalks: e.target.checked})}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                  <span className="text-[12px] font-bold text-gray-500 group-hover:text-gray-700 dark:text-dark-muted dark:group-hover:text-dark-text transition-colors uppercase tracking-wider">{t.create.allowTalks}</span>
                </label>
            </div>
            
            `;

if (code.includes(descStart)) {
  // Wait, I need to remove the top border from the desc since I put it on the checkboxes?
  // Let's just insert it before descStart
  // And maybe remove the border-t from the desc
  code = code.replace(descStart, newCheckboxes + descStart);
  code = code.replace('border-t border-gray-100/70 dark:border-dark-border/50', '');
  fs.writeFileSync('src/pages/Home.tsx', code);
  console.log("Checkboxes moved successfully");
} else {
  console.log("Could not find desc section");
}
