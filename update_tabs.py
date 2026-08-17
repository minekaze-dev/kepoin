import os

with open('src/pages/Home.tsx', 'r') as f:
    code = f.read()

start_str = '<div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-border pb-3">'
end_str = '<Link to="/discover" className="text-[13px] font-semibold text-orange-600 hover:underline">'

start_idx = code.find(start_str)
end_idx = code.find(end_str)

if start_idx != -1 and end_idx != -1:
    replacement = """<div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-border pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTrendingTab('newest')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold transition-all cursor-pointer ${
                  trendingTab === 'newest'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text'
                }`}
              >
                <span>{lang === 'id' ? 'BARU' : 'NEW'}</span>
              </button>
              <button
                onClick={() => setTrendingTab('trending')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold transition-all cursor-pointer ${
                  trendingTab === 'trending'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text'
                }`}
              >
                <span>{lang === 'id' ? 'TRENDING' : 'TRENDING'}</span>
              </button>
            </div>
            """
    code = code[:start_idx] + replacement + code[end_idx:]
    with open('src/pages/Home.tsx', 'w') as f:
        f.write(code)
    print("Tabs updated successfully.")
else:
    print("Not found")
