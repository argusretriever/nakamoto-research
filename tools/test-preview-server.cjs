const { spawn } = require('node:child_process');
const http = require('node:http'), path = require('node:path'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..'), port = 18083;
const child = spawn(process.execPath, ['serve.js'], {cwd: root, env: {...process.env, PORT: String(port)}, windowsHide: true, stdio: ['ignore','pipe','pipe']});
const request = (p,header) => new Promise((resolve,reject) => {
  http.get({hostname:'127.0.0.1',port,path:p}, res => {res.resume();res.on('end',()=>resolve(header?res.headers[header]:res.statusCode));}).on('error',reject);
});
(async () => {
 try {
  await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('Server start timed out')),10000);child.stdout.once('data',()=>{clearTimeout(timeout);resolve()});child.once('error',reject);child.once('exit',code=>reject(Error(`Server exited ${code}`)));});
  assert.equal(await request('/%ZZ'),400);
  assert.equal(await request('/'),200, 'server must survive malformed URL');
  assert.equal(await request('/money-library/'),200);
  assert.equal(await request('/.git/config'),403);
  assert.equal(await request('/%2e%2e/nakamoto-research-elsewhere/private.txt'),403);
  assert.equal(await request('/does-not-exist.html'),404);
  assert.equal(await request('/manifest.webmanifest','content-type'),'application/manifest+json; charset=utf-8');
  console.log('Preview server: malformed URLs, continued availability, directory indexes, hidden files and traversal checks passed.');
 } finally {child.kill();}
})().catch(error=>{console.error(error);process.exitCode=1;});
