const fs = require('fs');
const p = 'd:\\RelayOS\\src\\app\\dashboard\\workspaces\\[workspaceId]\\memory-chat\\page.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Replace the broken regex in renderInline
console.log('Before fixes:');
console.log('has bad regex:', c.includes('/(**[^*]+**)/'));
console.log('has dupe:', c.includes('function formatTimefunction formatTime'));

c = c.replace('text.split(/(**[^*]+**)/g)', 'text.split(/(\\*\\*[^*]+\\*\\*)/g)');
c = c.replace('function formatTimefunction formatTime(ts?: number)', 'function formatTime(ts?: number)');

fs.writeFileSync(p, c, 'utf8');
console.log('After fixes:');
const v = fs.readFileSync(p, 'utf8');
console.log('has bad regex:', v.includes('/(**[^*]+**)/'));
console.log('has dupe:', v.includes('function formatTimefunction formatTime'));
const lines = v.split('\n');
console.log('Line 69:', JSON.stringify(lines[68]));
console.log('Line 77:', JSON.stringify(lines[77]));
