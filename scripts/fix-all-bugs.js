const fs = require('fs');
const p = 'd:\\RelayOS\\src\\app\\dashboard\\workspaces\\[workspaceId]\\memory-chat\\page.tsx';
let c = fs.readFileSync(p, 'utf8');

console.log('=== Checking current issues ===');
console.log('has bad regex:', c.includes('/(**[^*]+**)/'));
console.log('has dupe formatTime:', c.includes('function formatTimefunction formatTime'));

c = c.replace('text.split(/(**[^*]+**)/g)', 'text.split(/(\\*\\*[^*]+\\*\\*)/g)');
c = c.replace('function formatTimefunction formatTime(ts?: number)', 'function formatTime(ts?: number)');
fs.writeFileSync(p, c, 'utf8');
console.log('After fix 1+2:');
const v = fs.readFileSync(p, 'utf8');
console.log('has bad regex:', v.includes('/(**[^*]+**)/'));
console.log('has dupe formatTime:', v.includes('function formatTimefunction formatTime'));
