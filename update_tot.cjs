const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const startStr = '{/* Widget 1: This or That */}';
const endStr = '{/* Widget 2: Lagi Ramai */}';
const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf(endStr);

if (startIdx > -1 && endIdx > -1) {
  const replacement = `
        {/* Widget 1: This or That */}
        <div className="bg-orange-500 rounded-xl p-5 shadow-lg relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <span className="text-[14px]">💡</span>
            <h3 className="text-[11px] font-black uppercase tracking-wider text-white/90">
              THIS OR THAT
            </h3>
          </div>
          <p className="text-[15px] font-bold text-white mb-5 leading-snug relative z-10">
            {dailyItem.prompt}
          </p>
          
          <div className="space-y-2 mb-4 relative z-10">
            {!votedOption ? (
              <>
                <button 
                  onClick={() => handleVote('a')}
                  className="w-full bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl py-2.5 px-4 text-[13px] font-bold transition-colors text-left flex justify-between items-center"
                >
                  <span>{dailyItem.optionA}</span>
                </button>
                <button 
                  onClick={() => handleVote('b')}
                  className="w-full bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl py-2.5 px-4 text-[13px] font-bold transition-colors text-left flex justify-between items-center"
                >
                  <span>{dailyItem.optionB}</span>
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <div className="w-full bg-white/10 border border-white/20 rounded-xl p-3 relative overflow-hidden">
                   <div 
                     className="absolute top-0 left-0 bottom-0 bg-white/20" 
                     style={{ width: \`\${Math.round((voteCounts.a / (voteCounts.a + voteCounts.b)) * 100)}%\` }}
                   />
                   <div className="relative z-10 flex justify-between items-center text-[13px] font-bold">
                     <span>{dailyItem.optionA} {votedOption === 'a' && '✓'}</span>
                     <span>{Math.round((voteCounts.a / (voteCounts.a + voteCounts.b)) * 100)}%</span>
                   </div>
                </div>
                <div className="w-full bg-white/10 border border-white/20 rounded-xl p-3 relative overflow-hidden">
                   <div 
                     className="absolute top-0 left-0 bottom-0 bg-white/20" 
                     style={{ width: \`\${Math.round((voteCounts.b / (voteCounts.a + voteCounts.b)) * 100)}%\` }}
                   />
                   <div className="relative z-10 flex justify-between items-center text-[13px] font-bold">
                     <span>{dailyItem.optionB} {votedOption === 'b' && '✓'}</span>
                     <span>{Math.round((voteCounts.b / (voteCounts.a + voteCounts.b)) * 100)}%</span>
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between relative z-10">
            <span className="text-[12px] text-white/80 font-medium">
              {(voteCounts.a + voteCounts.b).toLocaleString('id-ID')} jawaban
            </span>
          </div>
        </div>

        `;
  
  code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
  fs.writeFileSync('src/pages/Home.tsx', code);
  console.log("This or That Widget updated");
} else {
  console.log("Could not find This or That widget");
}
