const fs = require('fs');
let code = fs.readFileSync('src/pages/Settings.tsx', 'utf-8');

const accountHeader = '<h2 className="text-[16px] font-bold uppercase tracking-wider text-gray-400">{t.settings.account}</h2>';
const startIdx = code.indexOf(accountHeader);
if (startIdx > -1) {
  const sectionStart = code.lastIndexOf('<section', startIdx);
  const nextSection = code.indexOf('<section', startIdx);
  if (sectionStart > -1 && nextSection > -1) {
    code = code.substring(0, sectionStart) + code.substring(nextSection);
    fs.writeFileSync('src/pages/Settings.tsx', code);
    console.log("Account section removed");
  } else {
    console.log("Could not find section boundaries");
  }
} else {
  console.log("Could not find account header");
}
