const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const targetStr = `                    <div className="flex flex-col items-center sm:items-end justify-center min-w-[60px] sm:min-w-[70px] shrink-0 gap-1 border-l border-gray-100 dark:border-dark-border pl-3 sm:pl-4">
                      <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
                        <span className="font-extrabold text-[12px] sm:text-[14px] text-gray-900 dark:text-white">
                          {responses.length >= 1000 ? (responses.length/1000).toFixed(1) + 'K' : responses.length}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-medium text-gray-500 uppercase">jawaban</span>
                      </div>
                      <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
                        <span className="font-extrabold text-[11px] sm:text-[12px] text-gray-700 dark:text-gray-300">
                          {totalTalks}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-medium text-gray-400 uppercase">obrolan</span>
                      </div>
                    </div>`;

const replacementStr = `                    <div className="flex flex-col items-center sm:items-end justify-center min-w-[60px] sm:min-w-[90px] shrink-0 gap-1.5 border-l border-gray-100 dark:border-dark-border pl-3 sm:pl-4">
                      <div className="flex flex-row items-center justify-end gap-1">
                        <span className="font-extrabold text-[13px] sm:text-[15px] text-gray-900 dark:text-white">
                          {responses.length >= 1000 ? (responses.length/1000).toFixed(1) + 'K' : responses.length}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider">jawaban</span>
                      </div>
                      <div className="flex flex-row items-center justify-end gap-1">
                        <span className="font-extrabold text-[11px] sm:text-[13px] text-gray-700 dark:text-gray-300">
                          {totalTalks}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">obrolan</span>
                      </div>
                    </div>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/pages/Home.tsx', code);
  console.log("Alignment fixed");
} else {
  // Let's try replacing with regex or indexOf
  const startIdx = code.indexOf('<div className="flex flex-col items-center sm:items-end text-center sm:text-right">');
  if (startIdx > -1) {
    console.log("Found partially, could be formatting differences.");
  } else {
    console.log("Could not find target string.");
  }
}
