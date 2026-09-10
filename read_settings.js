const fs = require('fs');
const lines = fs.readFileSync('lib/settings-context.tsx', 'utf8').split('\n');
let i = lines.findIndex(l => l.includes('export interface AppSettings'));
if (i > -1) {
  for(let j=i+20; j<=i+35; j++) console.log(j + ": " + lines[j]);
}
let k = lines.findIndex(l => l.includes('const defaultSettings: AppSettings'));
if (k > -1) {
  for(let j=k+20; j<=k+35; j++) console.log(j + ": " + lines[j]);
}
