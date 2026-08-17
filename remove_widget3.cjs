const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const startStr = '{/* Widget 3: Orang Lagi Kepo */}';
const endStr = '</div>\\n      \\n      {/* Delete Confirmation Modal */}';

const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf('{/* Delete Confirmation Modal */}');

if (startIdx > -1 && endIdx > -1) {
    code = code.substring(0, startIdx) + code.substring(endIdx);
    fs.writeFileSync('src/pages/Home.tsx', code);
    console.log("Widget 3 removed.");
} else {
    console.log("Could not find Widget 3.");
}
