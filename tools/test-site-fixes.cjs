const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert'),cp=require('child_process');
const root=path.resolve(__dirname,'..'),s=fs.readFileSync(path.join(root,'script.js'),'utf8');
const between=(a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));
const math=vm.createContext({});vm.runInContext(between('function calculateComparisonValue(', 'investmentFields.calculate?.addEventListener'),math);
const now=new Date(2026,8,13);
assert.equal(math.calculateComparisonValue(2026,1000,100,0,now),1900);
const expected=1000*Math.pow(1.08,8/12)+100*(Math.pow(1.08,9/12)-1)/(Math.pow(1.08,1/12)-1);
assert(Math.abs(math.calculateComparisonValue(2026,1000,100,.08,now)-expected)<1e-8);
assert(math.calculateComparisonValue(2026,0,100,.08,now)<900*Math.pow(1.08,8/12));
const fields={btc:{value:'0.001'},sats:{value:''},usd:{value:''},note:{textContent:''}};
const c=vm.createContext({converterFields:fields,converterLock:false,liveBtcPrice:null,livePriceCheckedAt:null,numberFormatter:new Intl.NumberFormat('en-US'),priceFormatter:new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0})});
vm.runInContext(between('function validPositiveNumber(', 'async function loadBitcoinPrice(')+between('function updateConverter(source)', 'converterFields.btc?.addEventListener'),c);
c.updateConverter('btc');assert.equal(fields.sats.value,'100000');assert.equal(fields.usd.value,'');assert(fields.usd.disabled);assert(fields.note.textContent.includes('unavailable'));
c.liveBtcPrice=50000;c.livePriceCheckedAt=new Date();c.updateConverter('btc');assert.equal(fields.usd.value,'50.00');assert.equal(fields.usd.disabled,false);
fields.sats.value='0';c.updateConverter('sats');assert.equal(fields.btc.value,'0');assert.equal(fields.usd.value,'0.00');
fields.usd.value='100';c.updateConverter('usd');assert.equal(fields.sats.value,'200000');assert.equal(fields.btc.value,'0.002');
fields.btc.value='-1';c.updateConverter('btc');assert(fields.note.textContent.includes('non-negative'));assert.equal(fields.usd.value,'');
fields.btc.value='1e30';c.updateConverter('btc');assert(fields.note.textContent.includes('exact satoshi range'));assert.equal(c.converterLock,false);
const p=fs.readFileSync(path.join(root,'planning-calculators.html'),'utf8');const start=p.indexOf('function debtMonths('),end=p.indexOf('function update()',start);const debt=vm.createContext({});vm.runInContext(p.slice(start,end),debt);
assert.equal(debt.debtMonths(0,20,0),0);assert.equal(debt.debtMonths(1000,0,100),10);assert.equal(debt.debtMonths(600,0,1),600);assert.equal(debt.debtMonths(601,0,1),null);assert.equal(debt.debtMonths(1000,12,10),null);
let scripts=0,inline=0;const files=cp.execFileSync('git',['ls-files'],{cwd:root,encoding:'utf8'}).split(/\r?\n/);
for(const file of files){if(file.endsWith('.js')){new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});scripts++;}if(file.endsWith('.html'))for(const m of fs.readFileSync(path.join(root,file),'utf8').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(/\bsrc=|application\/ld\+json|type="module"/i.test(m[1])||!m[2].trim())continue;new vm.Script(m[2],{filename:file});inline++;}}
assert(!s.includes('let liveBtcPrice = 119783'));assert(!s.includes('fallbackChartPrices'));
const headers=fs.readFileSync(path.join(root,'_headers'),'utf8');assert(headers.includes("connect-src 'self' https://mempool.space https://api.coingecko.com"));
console.log(JSON.stringify({mathAndFailureCases:'passed',externalScriptsParsed:scripts,inlineScriptsParsed:inline}));

async function checkAsyncDataStates(){
 const quote=vm.createContext({liveBtcPrice:119783,livePriceCheckedAt:null,priceRequest:null,fetchJson:async()=>({USD:50000}),renderInvestmentPerformance(){},updateConverter(){}});
 vm.runInContext(between('function validPositiveNumber(', 'function formatAge('),quote);
 await quote.loadBitcoinPrice();assert.equal(quote.liveBtcPrice,50000);assert(quote.livePriceCheckedAt);
 quote.fetchJson=async()=>({USD:-1});await quote.loadBitcoinPrice();assert.equal(quote.liveBtcPrice,null);assert.equal(quote.livePriceCheckedAt,null);
 quote.fetchJson=async()=>{throw Error('offline')};await quote.loadBitcoinPrice();assert.equal(quote.liveBtcPrice,null);assert.equal(quote.priceRequest,null);
 const pending=[],rendered=[];const chartFields={panel:{},buttons:[],line:{setAttribute(k,v){this[k]=v}},area:{setAttribute(k,v){this[k]=v}},price:{},range:{},low:{},high:{},change:{}};
 const chart=vm.createContext({chartFields,chartRequestId:0,fetchJson:()=>new Promise(resolve=>pending.push(resolve)),renderPriceChart:(prices,label)=>rendered.push(label)});
 vm.runInContext(between('function validPositiveNumber(', 'async function loadBitcoinPrice(')+between('function rangeLabel(', '\nchartFields.buttons.forEach'),chart);
 const old=chart.loadPriceChart('7'),latest=chart.loadPriceChart('30');pending[1]({prices:[[1,10],[2,11]]});await latest;pending[0]({prices:[[1,8],[2,9]]});await old;assert.deepEqual(rendered,['Last 30 days']);
 const invalid=chart.loadPriceChart('1');pending[2]({prices:[]});await invalid;assert.equal(chartFields.line.d,'');assert.equal(chartFields.price.textContent,'Unavailable');assert(chartFields.range.textContent.includes('data unavailable'));
 console.log('Quote validation, offline behavior, empty charts, and out-of-order chart responses passed.');
}
checkAsyncDataStates().catch(error=>{console.error(error);process.exitCode=1;});
