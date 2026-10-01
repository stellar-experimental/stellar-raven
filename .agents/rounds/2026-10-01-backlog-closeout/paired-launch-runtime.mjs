import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { closeSync, fsyncSync, openSync, writeFileSync, readFileSync, readdirSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { randomUUID, createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

export const CLEANUP_TIMEOUT_MS = 10_000;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function syncDirectory(directory) {
  const fd = openSync(directory, "r");
  try { fsyncSync(fd); } finally { closeSync(fd); }
}

export function reserveInvocation({ directory, planSha256, phase, stdoutPath, stderrPath }) {
  assert.match(planSha256, /^[a-f0-9]{64}$/);
  assert.match(phase, /^[a-zA-Z][a-zA-Z0-9]*$/);
  const markerPath = path.join(directory, `${phase}.started.json`);
  const marker = openSync(markerPath, "wx", 0o600);
  try {
    writeFileSync(marker, `${JSON.stringify({
      schema: "qa-paired-launch-start-v1", planSha256, phase,
      startedAt: new Date().toISOString(), operatorPid: process.pid
    }, null, 2)}\n`);
    fsyncSync(marker);
  } finally { closeSync(marker); }
  syncDirectory(directory);
  // Keep the marker even if opening an output fails before the child starts.
  const fds = [];
  try {
    fds.push(openSync(stdoutPath, "wx", 0o600));
    fds.push(openSync(stderrPath, "wx", 0o600));
    syncDirectory(directory);
  } catch (error) {
    for (const fd of fds) closeSync(fd);
    throw error;
  }
  return {
    markerPath,
    stdio: ["ignore", ...fds],
    close() {
      for (const fd of fds.splice(0)) {
        try { fsyncSync(fd); } finally { closeSync(fd); }
      }
    }
  };
}

function remainingTimeout(deadlineMs) {
  if (deadlineMs === undefined) return 1_000;
  const remaining = deadlineMs - Date.now();
  if (remaining <= 0) throw new Error("launch cleanup exceeded its fixed deadline");
  return Math.min(1_000, remaining);
}

export function processTable(deadlineMs) {
  const text = execFileSync("ps", ["-axo", "pid=,ppid=,pgid=,stat=,lstart="], {
    encoding: "utf8", timeout: remainingTimeout(deadlineMs), maxBuffer: 8 * 1024 * 1024
  });
  return text.split(/\r?\n/).filter(Boolean).map((line) => {
    const match = /^\s*(\d+)\s+(\d+)\s+(\d+)\s+(\S+)\s+(.+)$/.exec(line);
    if (!match) throw new Error("cannot parse the process ownership table");
    return { pid: Number(match[1]), ppid: Number(match[2]), pgid: Number(match[3]),
      state: match[4], startedAt: match[5] };
  });
}

export function assertListenersStopped(ports, { deadlineMs } = {}) {
  for (const port of ports) {
    try {
      execFileSync("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-Fp"], {
        encoding: "utf8", timeout: remainingTimeout(deadlineMs)
      });
    } catch (error) {
      if (error.status === 1 && !error.stdout && !error.stderr) continue;
      throw error;
    }
    throw new Error(`listener ${port} remains active; retain the worktrees`);
  }
}

export const PROCESS_GUARD = fileURLToPath(new URL('./paired-process-guard.cjs',import.meta.url));
export const processGuardSha256 = () => createHash('sha256').update(readFileSync(PROCESS_GUARD)).digest('hex');

export class OwnedProcesses {
  constructor({ journalPath, timeoutMs = CLEANUP_TIMEOUT_MS, listeners = [],
    checkListeners = assertListenersStopped, readProcesses = processTable, signalGroup = process.kill } = {}) {
    Object.assign(this,{journalPath,timeoutMs,listeners,checkListeners,readProcesses,signalGroup});
    this.guardSha256 = processGuardSha256();
    this.registry = journalPath ? `${journalPath}.children` : mkdtempSync(path.join(os.tmpdir(),'paired-process-registry-'));
    if (journalPath) mkdirSync(this.registry,{mode:0o700});
    this.groups = new Map();
    this.identities = new Map();
    this.creations = new Map();
    this.retiredGroups = [];
    this.records = new Set();
    this.unresolved = new Map();
    this.stopping = false;
    this.monitorError = null;
    this.cleanup = {complete:false,unresolved:[],listeners:[]};
    this.monitor = setInterval(() => {
      if (this.stopping) return;
      try { this.capture(); } catch (error) { this.monitorError = error; }
    },100);
    this.monitor.unref();
  }

  persist() {
    if (!this.journalPath) return;
    writeFileSync(this.journalPath, `${JSON.stringify({
      schema:'qa-paired-launch-processes-v2',operatorPid:process.pid,
      groups:[...this.groups.values()],retiredGroups:this.retiredGroups,
      identities:[...this.identities.values()],cleanup:this.cleanup
    },null,2)}\n`,{mode:0o600});
  }

  ingestRecords(deadlineMs) {
    const pending = readdirSync(this.registry).filter(name => name.endsWith('.json') && !this.records.has(name))
      .map(name => {
        remainingTimeout(deadlineMs);
        return {name,...JSON.parse(readFileSync(path.join(this.registry,name),'utf8'))};
      });
    let changed = true;
    while (changed) {
      changed = false;
      for (const item of pending) {
        remainingTimeout(deadlineMs);
        if (this.records.has(item.name)) continue;
        const group = [...this.groups.values()].find(group => group.generation === item.generation);
        if (!group) continue;
        const known = item.kind === 'hello' ? this.identities.get(item.identity?.pid) : this.identities.get(item.parent?.pid);
        const createdHello = item.kind === 'hello' && this.creations.get(item.identity?.pid) === item.generation;
        const creator = item.kind === 'hello' ? this.identities.get(item.creator?.pid) : null;
        const ancestorHello = creator?.generation === item.generation && creator?.startedAt === item.creator?.startedAt &&
          item.creator?.pgid === group.pgid;
        if (!createdHello && !ancestorHello && (!known || known.generation !== item.generation ||
          known.startedAt !== (item.kind === 'hello' ? item.identity?.startedAt : item.parent?.startedAt))) continue;
        if (item.kind === 'child') this.creations.set(item.pid,item.generation);
        if (item.identity) {
          if (item.identity.pgid !== group.pgid) {
            this.unresolved.set(item.identity.pid,{...item.identity,reason:'a descendant left its verified launch group'});
          } else {
            this.identities.set(item.identity.pid,{...item.identity,generation:item.generation});
          }
        }
        this.records.add(item.name);changed=true;
      }
    }
  }

  capture(deadlineMs) {
    this.ingestRecords(deadlineMs);
    const table = this.readProcesses(deadlineMs);
    for (const row of table) {
      const known=this.identities.get(row.pid);
      if(known?.startedAt===row.startedAt && known.pgid!==row.pgid && !row.state.startsWith('Z')) {
        this.unresolved.set(row.pid,{...row,reason:'a recorded process left its verified group'});
      }
    }
    let changed = true;
    while (changed) {
      changed = false;
      for (const row of table) {
        const parent = this.identities.get(row.ppid);
        const liveParent = table.find(item => item.pid === row.ppid && item.startedAt === parent?.startedAt);
        const group = this.groups.get(row.pgid);
        if (!this.identities.has(row.pid) && parent && liveParent?.pgid === group?.pgid && group && parent.generation === group.generation) {
          this.identities.set(row.pid,{...row,generation:group.generation});changed=true;
        }
      }
    }
    for (const [pgid,group] of this.groups) {
      if (group.exited && !this.liveMembers(table,group).length) {
        this.retiredGroups.push(group);this.groups.delete(pgid);
      }
    }
    for (const retired of this.retiredGroups) {
      if (!this.groups.has(retired.pgid)) {
        for (const row of this.liveMembers(table,retired)) {
          this.unresolved.set(row.pid,{...row,reason:'a retired process-group number was reused'});
        }
      }
    }
    this.persist();return table;
  }

  spawn(command, {cwd,env=process.env,stdio='ignore',name='child'} = {}) {
    if (this.stopping) throw new Error('launch cleanup has started; no new child may start');
    assert.equal(processGuardSha256(),this.guardSha256,'the process guard changed; stop the launch');
    const generation = randomUUID();
    const nodeOptions = `${env.NODE_OPTIONS ?? ''} --require ${JSON.stringify(PROCESS_GUARD)}`.trim();
    const child = spawn(command[0],command.slice(1),{cwd,stdio,detached:true,env:{...env,
      NODE_OPTIONS:nodeOptions,PAIRED_PROCESS_REGISTRY:this.registry,PAIRED_PROCESS_GENERATION:generation,
      PAIRED_PROCESS_GUARD:PROCESS_GUARD}});
    const group = {pgid:child.pid,generation,name,exited:false};
    if (child.pid) {this.groups.set(child.pid,group);this.creations.set(child.pid,generation);}
    const completion = new Promise((resolve,reject) => {
      child.once('error',error => {group.exited=true;reject(error);});
      child.once('exit',(code,signal) => {group.exited=true;resolve({code,signal});});
    });
    completion.catch(()=>{});
    if (child.pid) {
      const row = this.readProcesses().find(item => item.pid === child.pid);
      if (row) this.identities.set(row.pid,{...row,generation});
      this.capture();
    }
    return {child,completion};
  }

  liveMembers(table, group) {
    return table.filter(row => row.pgid === group.pgid && !row.state.startsWith('Z'));
  }

  checkOwnership(members, group) {
    let verified = true;
    for (const row of members) {
      const known = this.identities.get(row.pid);
      if (!known || known.startedAt !== row.startedAt || known.generation !== group.generation) {
        this.unresolved.set(row.pid,{...row,reason:'process-group ownership is unknown'});verified=false;
      }
    }
    return verified;
  }

  signalGroups(signal, deadlineMs) {
    const table = this.capture(deadlineMs);
    for (const group of this.groups.values()) {
      const members = this.liveMembers(table,group);
      if (!members.length || !this.checkOwnership(members,group)) continue;
      try { this.signalGroup(-group.pgid,signal); } catch (error) { if (error.code !== 'ESRCH') throw error; }
    }
  }

  verifiedLive(table) {
    return [...this.groups.values()].filter(group => {
      const members = this.liveMembers(table,group);
      return members.length && this.checkOwnership(members,group);
    });
  }

  finishCleanup(deadline) {
    const listenerErrors = [];
    for (const port of this.listeners) {
      try { this.checkListeners([port],{deadlineMs:deadline}); }
      catch (error) { listenerErrors.push({port,reason:error.message}); }
    }
    this.cleanup = {complete:!this.unresolved.size && !listenerErrors.length && !this.monitorError,
      unresolved:[...this.unresolved.values()],listeners:listenerErrors,
      errors:this.monitorError ? [this.monitorError.message] : []};
    this.persist();
    if (!this.cleanup.complete) throw new Error(`cleanup requires manual action; retain worktrees: ${JSON.stringify(this.cleanup)}`);
  }

  failedCleanup(error) {
    this.cleanup={complete:false,unresolved:[...this.unresolved.values(),
      ...[...this.groups.values()].map(group=>({pgid:group.pgid,reason:'termination is not verified'}))],
      listeners:this.listeners.map(port=>({port,reason:'listener termination is not verified'})),errors:[error.message]};
    this.persist();
    return new Error(`cleanup requires manual action; retain worktrees: ${JSON.stringify(this.cleanup)}`);
  }

  async stop() {
    this.stopping = true;
    const deadline = Date.now()+this.timeoutMs;
    const killAt = Date.now()+Math.floor(this.timeoutMs/2);
    try {
      this.signalGroups('SIGTERM',deadline);
      let killed = false;
      while (this.verifiedLive(this.capture(deadline)).length) {
        if (!killed && Date.now()>=killAt) {this.signalGroups('SIGKILL',deadline);killed=true;}
        await delay(50);
      }
    } catch(error) {throw this.failedCleanup(error);}
    this.finishCleanup(deadline);
  }

  async stopServers() { await this.stop();this.stopping=false; }

  emergencyStop() {
    this.stopping=true;
    const deadline=Date.now()+this.timeoutMs;
    try {
      this.signalGroups('SIGKILL',deadline);
      while(this.verifiedLive(this.capture(deadline)).length) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,50);
      }
    } catch(error) {throw this.failedCleanup(error);}
    this.finishCleanup(deadline);
  }

  dispose() {
    clearInterval(this.monitor);
    if (!this.journalPath) rmSync(this.registry,{recursive:true,force:true});
  }
}

export async function withLaunchCleanup(action, options = {}) {
  const manager = new OwnedProcesses(options);
  let stopPromise;
  const stop = () => stopPromise ??= manager.stop();
  const emergency = () => {
    try { manager.emergencyStop(); } catch (error) {
      process.stderr.write(`cleanup failed: ${error.message}\n`);
      process.exitCode = 1;
    }
  };
  const interrupt = (signal) => {
    manager.stopping = true;
    void stop().then(() => process.exit(signal === "SIGINT" ? 130 : 143), (error) => {
      process.stderr.write(`cleanup failed: ${error.message}\n`); process.exit(1);
    });
  };
  const onInt = () => interrupt("SIGINT");
  const onTerm = () => interrupt("SIGTERM");
  // Install handlers before action can start any process.
  process.on("exit", emergency);
  process.on("SIGINT", onInt);
  process.on("SIGTERM", onTerm);
  try {
    return await action(manager);
  } finally {
    try { await stop(); } finally {
      manager.dispose();
      process.off("exit", emergency);
      process.off("SIGINT", onInt);
      process.off("SIGTERM", onTerm);
    }
  }
}

export async function runReservedInvocation({ command, cwd, env, manager, ...reservationOptions }) {
  const reservation = reserveInvocation(reservationOptions);
  try {
    const { completion } = manager.spawn(command, {
      cwd, env, name: reservationOptions.phase, stdio: reservation.stdio
    });
    return await completion;
  } finally { reservation.close(); }
}
