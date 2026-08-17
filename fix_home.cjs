const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');
code = code.replace('{/* Delete Confirmation Modal */}', '</div>\n\n      {/* Delete Confirmation Modal */}');
fs.writeFileSync('src/pages/Home.tsx', code);
