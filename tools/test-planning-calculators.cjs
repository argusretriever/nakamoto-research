const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'..','planning-calculators.html'),'utf8');
const script=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(x=>x[1]).find(x=>x.includes('function debtMonths('));
const definitions={breakeven:{fixed:'1000',profit:'50'},savings:{income:'2500',savings:'500'},mortgage:{income:'3000',payment:'900'},compound:{start:'1000',rate:'5',years:'10'},emergency:{costs:'1200',months:'6'},debt:{balance:'3000',apr:'19',payment:'250'},yield:{rent:'1200',price:'250000',costs:'2500'}};
const cards=Object.entries(definitions).map(([type,values])=>{
 const inputs=Object.fromEntries(Object.entries(values).map(([field,value])=>[field,{value,dataset:{field},addEventListener(event,callback){this[event]=callback}}]));
 const output={textContent:''};
 return {dataset:{calc:type},inputs,output,querySelectorAll:()=>Object.values(inputs),querySelector:s=>s==='[data-output]'?output:inputs[s.match(/data-field="([^"]+)"/)?.[1]]};
});
vm.runInNewContext(script,{document:{querySelectorAll:()=>cards}});
const card=type=>cards.find(x=>x.dataset.calc===type);
function set(type,field,value){const c=card(type);c.inputs[field].value=value;c.inputs[field].input();return c.output.textContent;}
assert.equal(card('breakeven').output.textContent,'20 sales to break even.');
assert.equal(card('savings').output.textContent,'20% savings rate.');
assert.equal(card('mortgage').output.textContent,'30% of income.');
assert.match(card('compound').output.textContent,/1,629/);
assert.match(card('emergency').output.textContent,/7,200/);
assert.match(card('yield').output.textContent,/4.8%/);
assert.match(set('breakeven','profit','0'),/Add profit/);
assert.match(set('compound','rate','-150'),/cannot be below -100%/);
set('compound','years','0.5');assert(!/NaN/.test(card('compound').output.textContent));
set('compound','years','1');assert.match(set('compound','rate','-100'),/future value: 0\./);
assert.match(set('compound','start','-1'),/non-negative/);
assert.match(set('compound','start',''),/finite number/);
set('compound','start','1e308');set('compound','rate','100');assert.match(set('compound','years','100'),/supported calculation range/);
set('compound','start','1000');set('compound','rate','5');assert.match(set('compound','years','10'),/1,629/);
assert.match(set('savings','income','1e-308'),/supported calculation range/);
console.log('Planning calculators passed: normal results, invalid rates, negative/empty inputs, overflow, zero denominator and recovery.');
