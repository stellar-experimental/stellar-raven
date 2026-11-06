"""Compile live Docs event snippets without network simulation or transactions.
Run: python3 research/audits/2026-11-05-improvements/docs-rust-recheck.py /tmp/docs-rust-recheck
Then: cargo test --offline --manifest-path /tmp/docs-rust-recheck/Cargo.toml --workspace
Requires cached soroban-sdk 29.0.1 (omit --offline to fetch public crates).
Only the explicit fixture directory is written. The served test body is unchanged.
"""
import pathlib,re,sys,urllib.request
root=pathlib.Path(sys.argv[1]).resolve();root.mkdir(parents=True,exist_ok=True)
assert not root.is_relative_to(pathlib.Path.cwd()), 'Use an external /tmp fixture directory to avoid repository test discovery.'
def blocks(path):
 req=urllib.request.Request('https://developers.stellar.org/docs/'+path+'.md',headers={'User-Agent':'Raven-truth-review/1.0'})
 with urllib.request.urlopen(req,timeout=30)as r:text=r.read().decode()
 return re.findall(r'```rust[^\n]*\n([\s\S]*?)```',text)
test=blocks('build/guides/testing/test-contract-events')[0]
mint=next(b for b in blocks('learn/migrate/evm/solidity-and-rust-advanced-concepts')if 'contractevent' in b)
fees=next(b for b in blocks('build/guides/fees/analyzing-smart-contract-cost')if 'contractevent' in b)
setup='''use soroban_sdk::{contract, contractimpl, contractevent, symbol_short, Env, IntoVal};
#[contract] pub struct IncrementContract;
#[contractevent(topics = ["COUNTER", "increment"], data_format = "single-value")]
pub struct IncrementEvent { pub count: u32 }
#[contractimpl] impl IncrementContract {
 pub fn increment(env: Env) -> u32 {
  let n:u32=env.storage().instance().get(&symbol_short!("COUNT")).unwrap_or(0)+1;
  env.storage().instance().set(&symbol_short!("COUNT"),&n);
  IncrementEvent{count:n}.publish(&env);n
 }
}
#[cfg(test)] mod tests { use super::*; use soroban_sdk::{vec, testutils::Events};
'''
(root/'Cargo.toml').write_text('[workspace]\nresolver="2"\nmembers=["events","mint","fees"]\n')
for name,code in [('events',setup+test+'\n}\n'),('mint',mint),('fees',fees)]:
 p=root/name;(p/'src').mkdir(parents=True,exist_ok=True)
 (p/'Cargo.toml').write_text('[package]\nname="docs-'+name+'"\nversion="0.1.0"\nedition="2021"\n[dependencies]\nsoroban-sdk={version="=29.0.1",features=["testutils"]}\n')
 (p/'src/lib.rs').write_text(code)
print('Extracted current served snippets into',root)
