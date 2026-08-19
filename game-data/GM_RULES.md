# GM_ENGINE — Full Mirror

Source: Google Sheets `GM_ENGINE`
Synced: 2026-08-20 JST

This file intentionally includes current FOCUS, BEAT, DEFER, CLUE, UNKNOWN, COUNTER and NEXT entries as well as the core rules.

## Current operating state

- META GME001 / active / locked / core / GM engine purpose — Generate forward motion and convergence. Do not solve stagnation by endlessly adding hooks. / Use every turn/scene as GM operating rules.
- FOCUS F001 / active / locked / 1 / V004 escort Adel — Current objective: protect Adel until he safely reaches his contact point in this town. / On safe arrival: V004 progress=10/10, then Fulfill Your Vow.
- BEAT B001 / active / locked / 1 / Town gate scrutiny — Adel and White Gold are entering as well-born traveler + maid. Merchant-like observer directly asked White Gold her name. / End this beat by entry, refusal/detention, or a meaningful forced alternative. Then advance toward contact point; do not linger at gate.
- FOCUS F002 / active / unfixed / 2 / Town gate observer — Identity, motive and affiliation are not yet fixed. / Resolve, merge with an existing hook, or close before creating another scene-local mystery.
- FOCUS F003 / active / locked / 3 / Adel decoy / assassination plot — Established broader context: Adel is serving as a decoy amid a plot against the princess. / May generate the next major arc only through consequences/revelations naturally reached at or after the contact point.

## Deferred/background threads

- DEFER D001 / unresolved / locked / background / Wagon attackers — Unresolved existing thread. / Do not foreground unless current gate/contact-point events reconnect to it.
- DEFER D002 / unresolved / locked / background / Guard testimony — Guard remains recovering in the southern village and may later rejoin. / Do not interrupt current arc merely to service this hook.
- DEFER D003 / unresolved / locked / background / Pursuer identity / survival — Earlier pursuer outcome beyond being out of action remains unresolved. / Only revive if causally useful and consistent; never casually respawn.
- DEFER D004 / background / locked / background / City/faction politics — State-building and inter-city politics exist as world background. / Bring forward only when current fiction reaches an institution/person tied to it.

## Established clues

- CLUE C001 / established / locked / scene / Gate checks — Guards are checking travelers more carefully than expected. / May support later conclusions; does not itself prove whom they seek.
- CLUE C002 / established / locked / scene / Observer behavior — Merchant-like man watches travelers' faces and whispers to guards. / Observation only; affiliation remains unfixed.
- CLUE C003 / established / locked / scene / Adel's assessment — Adel said the observer is not a town local. / Treat as Adel's assessment, not objective truth until confirmed.

## Open unknowns

- UNKNOWN U001 / open / unfixed / scene / Observer identity — Who is the gate observer, and what does he want? / Can be oracle/causally determined later; once determined, change Lock to locked.
- UNKNOWN U002 / open / unfixed / scene / Purpose of gate scrutiny — Whether the unusual scrutiny specifically concerns Adel, another target, or ordinary local trouble is not fixed. / Resolve or merge during/after B001; do not preserve ambiguity just to prolong suspense.

## Rules

- R001 Foreground cap — Keep at most 3 foreground story threads. Everything else is deferred/background. Before foregrounding a fourth, resolve, merge, or defer one.
- R002 No hook spam — Do not create a new major unresolved hook merely to make something happen. A new major hook must directly arise from the current consequence and also advance, close, or merge an existing foreground thread.
- R003 Meaningful beat test — A played beat must advance the objective, advance/resolve a foreground hook, impose a meaningful consequence, or reveal useful information. If none applies, compress/skip the beat.
- R004 Convergence trigger — Track consecutive meaningful beats that produce no objective progress and no hook advancement/closure. After 2 such beats, the next beat must converge via reveal, consequence, arrival, decision point, or closure; it may not add another side branch.
- R005 Scene mystery cap — Keep at most 2 unresolved scene-local UNKNOWN items. Before adding a third, resolve, merge, or defer one.
- R006 Canon lock — Established facts cannot be silently rewritten. Unfixed truths may remain undecided until needed. Once an unfixed truth is determined in play/oracle, mark it locked and preserve it.
- R007 Reveal integrity — A major twist should connect to at least 2 established facts/clues when claiming earlier causality. If not supported, present it as newly discovered/newly occurring information; do not pretend it was foreshadowed.
- R008 No infinite mastermind ladder — Do not reveal a higher hidden mastermind just to extend the story. A higher-level antagonist requires prior evidence or an already-established intermediary relationship.
- R009 Side-event rule — Side events must connect to a foreground thread or resolve within the same scene. No multi-scene detour solely for atmosphere or novelty.
- R010 Current-vow priority — V004 must not be delayed by unrelated content. Once the gate beat resolves, compress toward the contact point unless a genuinely meaningful obstacle or discovery intervenes.
- R011 Oracle commitment — When several plausible branches exist and no established fact selects one, use an oracle/GM random choice instead of endlessly preserving options. If the result determines a truth, record it and lock it.
- R012 Quest generation — New quests should emerge from consequences, revelations, NPC needs, or discovered opportunities at natural boundaries. Offer/foreground at most 1 new major quest at a time; do not build a queue of random quests.
- R013 Arc closure first — When an arc/vow completion condition is achieved, resolve its progress move/mechanics before launching the next major arc. Do not postpone closure for an extra twist.
- R014 Player/GM boundary — Player exclusively controls White Gold's speech, voluntary actions, choices, thoughts and feelings. GM controls world, NPCs, events, mechanics and consequences. GM may act aggressively on the world, but never choose White Gold's voluntary response.
- R015 Skip mundane transitions — Turn number is a log index, not a pacing unit. Routine travel, exits, meals and sleep are compressed unless meaningful. Play only where something changes or can genuinely go wrong.

## Runtime counters / next obligation

- CT001 Stall counter = 0 — Consecutive meaningful beats with no objective progress and no foreground-hook advancement/closure. Increment only when applicable; reset to 0 on progress/advance/closure. At 2, R004 activates for next beat.
- CT002 Scene-local unknown count = 2 — U001 observer identity; U002 purpose of gate scrutiny. Do not exceed 2 under R005.
- NEXT N001 — Resolve B001 from White Gold's answer and the NPC/world response. Do not introduce an unrelated third mystery. After B001, move toward Adel's contact point; if no meaningful uncertainty exists, time-skip there.
- NOTE N002 — The system is a guardrail, not a prewritten plot. It should preserve surprise while forcing branches to merge, resolve, or become relevant. User should not need to maintain this sheet manually.
