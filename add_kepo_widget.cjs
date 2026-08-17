const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const anchor = '</div>\n        </div>\n      </div>\n      \n    </div>\n  );\n}';
const widget = `
        {/* Widget 3: Orang Lagi Kepo */}
        <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-dark-muted">
              👀 ORANG LAGI KEPO
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3 text-[13px] font-medium text-gray-600 dark:text-dark-muted">
                <span className="text-[16px]">📸</span>
                <span><strong className="text-gray-900 dark:text-dark-text group-hover:text-orange-500 transition-colors">38</strong> sedang lihat Foto</span>
              </div>
            </div>
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3 text-[13px] font-medium text-gray-600 dark:text-dark-muted">
                <span className="text-[16px]">🎵</span>
                <span><strong className="text-gray-900 dark:text-dark-text group-hover:text-orange-500 transition-colors">27</strong> sedang cari Lagu</span>
              </div>
            </div>
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3 text-[13px] font-medium text-gray-600 dark:text-dark-muted">
                <span className="text-[16px]">🔢</span>
                <span><strong className="text-gray-900 dark:text-dark-text group-hover:text-orange-500 transition-colors">19</strong> sedang jawab Angka</span>
              </div>
            </div>
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3 text-[13px] font-medium text-gray-600 dark:text-dark-muted">
                <span className="text-[16px]">💬</span>
                <span><strong className="text-gray-900 dark:text-dark-text group-hover:text-orange-500 transition-colors">42</strong> sedang ngobrol</span>
              </div>
            </div>
          </div>
        </div>
`;

// Let's find the closing tags of the right sidebar.
const sidebarEnd = '</div>\n      </div>\n    </div>\n  );\n}';

// We can just find "{/* Widget 2: Lagi Ramai */}" and find the end of that widget.
const startSearch = code.indexOf('{/* Widget 2: Lagi Ramai */}');
if (startSearch > -1) {
  let depth = 0;
  let widgetEnd = -1;
  const subcode = code.substring(startSearch);
  let i = 0;
  // find first <div
  while (i < subcode.length) {
    if (subcode.substr(i, 4) === '<div') { depth++; }
    else if (subcode.substr(i, 5) === '</div') {
      depth--;
      if (depth === 0) {
        widgetEnd = startSearch + i + 6;
        break;
      }
    }
    i++;
  }
  if (widgetEnd > -1) {
    code = code.substring(0, widgetEnd) + '\n' + widget + '\n' + code.substring(widgetEnd);
    fs.writeFileSync('src/pages/Home.tsx', code);
    console.log("Kepo Widget added");
  } else {
    console.log("Could not find end of widget 2");
  }
} else {
  console.log("Widget 2 not found");
}

