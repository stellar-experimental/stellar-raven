# Item 1.4: timer launch test (agentpc, 2026-11-17)

Lead: Claude Opus 5.5, agentpc `t1rs`.

## What was checked

- `loginctl show-user tyler -p Linger`: `Linger=yes`, so user timers run with nobody logged in.
- A one-shot user timer, `raven-dated-test.timer`, was set two minutes ahead with `Persistent=true`.
  Its service ran the installed launcher, `~/.local/share/raven-dated/launch-dated-lead.sh 1.4
  timertest`, with `RAVEN_DATED_TEST=1`. That mode uses a scratch folder and a three-step brief
  with no git.
- The launcher started `claude --model opus --effort high --dangerously-skip-permissions` under
  `hc run --bg --no-parent`. This is the same line the dated leads use. The folder was new and
  untrusted.
- The test lane wrote its UTC time and identity to a file and sent the file's path to `t1rs`.

## Results

| Run | Fired (UTC) | Lane | Parent | Lane reply | Notes |
|---|---|---|---|---|---|
| 1 | 02:20:00 | `t1rt` | none (`null`) | 02:20:05, path received by `t1rs` | `hc run` gave no `first_message` field, because the task is claude's argv prompt. The first launcher's re-send fallback could have sent the task twice, so it was replaced (run 2). |
| 2 | 02:21:00 | `t1rw` | none (`null`) | 02:21:05, path received by `t1rs` | Fixed launcher: status `live`, then `done` 9 s later. No start-up dialog appeared. The launcher logged success and sent its own notice. |

- Both test lanes were killed and removed.
- The test units and the scratch folder were deleted.
- The logs stay at `~/.local/state/raven-dated/1.4-test1.log`, `1.4-test2.log` and
  `1.4-test2-RESULT.md`.

Run 2's launcher log:

```
2026-11-17T02:21:00Z start item=1.4 slug=timertest
2026-11-17T02:21:00Z hc run: {"address":"t1rw","agent":"systemd-run","cwd":"/home/tyler/code/raven-wt/np-1.4-timertest","name":"np-1-4-lead","state":"live","turn":0}
2026-11-17T02:21:00Z check 1: status live
2026-11-17T02:21:09Z check 2: status done
2026-11-17T02:21:09Z lead t1rw (np-1-4-lead) running in /home/tyler/code/raven-wt/np-1.4-timertest
```

## Not tested

- A reboot before a fire time. `Persistent=true` fires a missed one-shot timer at the next boot.
  The `hc` core is a transient unit that the `hc` CLI starts. That it restarts on the first `hc`
  call after a boot is assumed, not observed.
- A start-up dialog. None appeared with `--dangerously-skip-permissions` in a new folder. The
  launcher still answers the bypass warning (`down enter`) and a trust prompt (`enter`) when the
  lane shows `blocked`.

## Installed timers

`systemctl --user list-timers --all` after install:

```
NEXT LEFT LAST PASSED UNIT ACTIVATES
Mon 2026-11-23 18:00:00 UTC 6 days - - raven-dated-2.1.timer raven-dated-2.1.service
Mon 2026-11-30 06:00:00 UTC 1 week 6 days - - raven-dated-2.2a.timer raven-dated-2.2a.service
Tue 2026-12-01 06:00:00 UTC 2 weeks 0 days - - raven-dated-2.2b.timer raven-dated-2.2b.service
Fri 2026-12-04 06:00:00 UTC 2 weeks 3 days - - raven-dated-2.2c.timer raven-dated-2.2c.service
```

The unit sources are in [dated/units/](dated/units/), and the installed copies are in `~/.config/systemd/user/`.
