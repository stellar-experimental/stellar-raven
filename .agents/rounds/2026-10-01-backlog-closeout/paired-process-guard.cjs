// Managed Node descendants stay in their launch group. Record creation before spawn returns.
const cp = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { syncBuiltinESMExports } = require('node:module');
const directory = process.env.PAIRED_PROCESS_REGISTRY;
const generation = process.env.PAIRED_PROCESS_GENERATION;
if (!directory || !generation) throw new Error('the launch process registry is missing');
const originalSpawnSync = cp.spawnSync;
function identity(pid) {
  const result = originalSpawnSync('ps', ['-p', String(pid), '-o', 'pid=,ppid=,pgid=,stat=,lstart='], {
    encoding:'utf8', timeout:1000
  });
  const match = /^\s*(\d+)\s+(\d+)\s+(\d+)\s+(\S+)\s+(.+)$/m.exec(result.stdout ?? '');
  return match ? {pid:+match[1],ppid:+match[2],pgid:+match[3],state:match[4],startedAt:match[5]} : null;
}
function record(value) {
  const finalPath = path.join(directory, `${randomUUID()}.json`);
  const temporaryPath = `${finalPath}.tmp`;
  const fd = fs.openSync(temporaryPath, 'wx', 0o600);
  try { fs.writeFileSync(fd, JSON.stringify({generation,...value}));fs.fsyncSync(fd); }
  finally { fs.closeSync(fd); }
  fs.renameSync(temporaryPath,finalPath);
  const dir = fs.openSync(directory, 'r');
  try { fs.fsyncSync(dir); } finally { fs.closeSync(dir); }
}
const parent = identity(process.pid);
if (!parent) throw new Error('the launch process has no creation identity');
record({kind:'hello',identity:parent,creator:identity(process.ppid)});
const originalSpawn = cp.ChildProcess.prototype.spawn;
cp.ChildProcess.prototype.spawn = function(options) {
  // No managed Node API can create a detached process group.
  options.detached = false;
  const preserved = {
    PAIRED_PROCESS_REGISTRY:directory, PAIRED_PROCESS_GENERATION:generation,
    NODE_OPTIONS:process.env.NODE_OPTIONS
  };
  options.envPairs = (options.envPairs ?? []).filter(pair =>
    !Object.keys(preserved).some(name => pair.startsWith(`${name}=`)));
  for (const [name,value] of Object.entries(preserved)) options.envPairs.push(`${name}=${value}`);
  const result = originalSpawn.call(this, options);
  if (this.pid) record({kind:'child',parent,identity:identity(this.pid),pid:this.pid});
  return result;
};
cp.spawnSync = function(command,args,options) {
  if (!Array.isArray(args)) { options=args;args=[]; }
  const result=originalSpawnSync(command,args,{...options,detached:false,env:{
    ...(options?.env ?? process.env),PAIRED_PROCESS_REGISTRY:directory,
    PAIRED_PROCESS_GENERATION:generation,NODE_OPTIONS:process.env.NODE_OPTIONS
  }});
  if(result.pid) record({kind:'child',parent,identity:identity(result.pid),pid:result.pid});
  return result;
};
for (const name of ['execSync','execFileSync']) {
  const original = cp[name];
  cp[name] = function(command,args,options) {
    if (!Array.isArray(args)) { options=args;args=undefined; }
    const guarded = {...options,detached:false,env:{...(options?.env ?? process.env),
      PAIRED_PROCESS_REGISTRY:directory,PAIRED_PROCESS_GENERATION:generation,NODE_OPTIONS:process.env.NODE_OPTIONS}};
    return args ? original(command,args,guarded) : original(command,guarded);
  };
}
syncBuiltinESMExports();
