const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const target1 = '<span className="text-[9px] sm:text-[10px] font-medium text-gray-500 uppercase">jawaban</span>';
const repl1 = '<span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider">jawaban</span>';

const target2 = '<span className="text-[9px] sm:text-[10px] font-medium text-gray-400 uppercase">obrolan</span>';
const repl2 = '<span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">obrolan</span>';

const target3 = 'className="flex flex-col items-center sm:items-end text-center sm:text-right"';
const repl3 = 'className="flex flex-row items-center justify-end gap-1.5"';

code = code.split(target1).join(repl1);
code = code.split(target2).join(repl2);
code = code.split(target3).join(repl3);

fs.writeFileSync('src/pages/Home.tsx', code);
console.log("Replaced with split/join");
