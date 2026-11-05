const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const script=fs.readFileSync(path.join(__dirname,'..','script.js'),'utf8');
const between=(a,b)=>script.slice(script.indexOf(a),script.indexOf(b,script.indexOf(a)));
let stored='["<img src=x onerror=alert(1)>",42,null]';
const output={innerHTML:''};
const ctx=vm.createContext({storageKey:'test',readingListOutput:output,readStoredValue:()=>stored});
vm.runInContext(between('function escapeHTML(', 'function scoreDestination(')+between('function getSavedReading(', 'document.querySelectorAll("[data-save-reading]")'),ctx);
ctx.renderSavedReading();
assert(output.innerHTML.includes('&lt;img'));
assert(!output.innerHTML.includes('<img'));
assert.equal(ctx.getSavedReading().length,1);
for(const value of ['null','{}','false','"wrong type"','broken json']){
 stored=value;ctx.renderSavedReading();assert.equal(output.innerHTML,'No saved articles yet.');
}
console.log('Saved-reading checks passed: HTML escaping, mixed types, malformed JSON and non-array storage.');
