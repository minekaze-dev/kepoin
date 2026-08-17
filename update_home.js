const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// Replace everything inside the Feed Tabs with a simple list
const startMarker = "{trendingTab === 'trending' ? (";
const endMarker = "}          </div>        </section>      )}";

// wait, let's find exact bounds for replacement
