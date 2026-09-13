<script lang="ts">
	import { getGameContext } from '$lib/state/context';
	import { currentGateFromState, type GateId } from '$lib/gates/gates';
	import { WORD_POOL } from '$lib/data/wordPool';
	import { getRank, RANKS } from '$lib/data/ranks';
	import { createFight, generateRound, checkAnswer, applyAnswer } from '$lib/boss/engine';
	import { BOSS_HP, BOSS_NAMES, TYPE_LABELS, DAMAGE, BOSS_TIMER } from '$lib/boss/constants';
	import type { BossFightState, BossQuestion, BossRoundChoice } from '$lib/boss/types';
	import {
		playBossHit,
		playBossAttack,
		playBossWin,
		playBossLoss,
		playImpactCrunch,
		playPainSting,
		startBossTension,
		updateBossTension,
		stopBossTension,
		playRealmEntry
	} from '$lib/sound/bossAudio';
	import { startBossMusic, stopBossMusic } from '$lib/sound/bossMusic';
	import { playSfx } from '$lib/sound/sfx';
	import { getBossArt, PLAYER_ART } from '$lib/boss/bossArt';
	import { startLoop, stopLoop } from '$lib/effects/effectStore';
	import { setKuromiVisible } from '$lib/kuromi/visibility.svelte';
	import RealmThreshold from '$lib/components/boss/RealmThreshold.svelte';
	import { beforeNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import Doodle from '$lib/components/art/Doodle.svelte';
	import Character from '$lib/components/art/Character.svelte';
	import Icon from '$lib/icons/Icon.svelte';

	const ctx = getGameContext();

	// Realm threshold enter/exit wipe (presentation-only; not fight state)
	let thresholdPhase = $state<'enter' | 'exit' | null>('enter');
	let reducedMotionNav = $state(false);
	let exitingProgrammatically = false; // plain var, re-entrancy guard

	onMount(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotionNav = mq.matches;
		const onChange = () => {
			reducedMotionNav = mq.matches;
		};
		mq.addEventListener('change', onChange);
		if (!reducedMotionNav) {
			setTimeout(() => {
				thresholdPhase = null;
			}, 450);
		} else {
			thresholdPhase = null;
		}
		return () => mq.removeEventListener('change', onChange);
	});

	beforeNavigate((nav) => {
		if (exitingProgrammatically) return;
		if (reducedMotionNav) return;
		if (!nav.to) return;
		if (nav.to.route.id === nav.from?.route.id) return;
		nav.cancel();
		thresholdPhase = 'exit';
		const targetUrl = nav.to.url;
		const targetPath = `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
		setTimeout(() => {
			exitingProgrammatically = true;
			// resolve() satisfies base-path + eslint no-navigation-without-resolve
			goto(resolve(targetPath as '/')).finally(() => {
				exitingProgrammatically = false;
			});
		}, 400);
	});

	type View = 'catalogue' | 'prefight' | 'vs_intro' | 'fighting' | 'result';
	let view = $state<View>('catalogue');
	let selectedBossRank = $state(0);

	// Hide Kuromi FAB during an active fight so it doesn't cover combat UI.
	// Restore on leave-fighting and on unmount (cleanup).
	$effect(() => {
		setKuromiVisible(view !== 'fighting');
		return () => {
			setKuromiVisible(true);
		};
	});

	// Sparring mode. When true, the fight is identical in every way
	// (questions, art, OST, mechanics) but carries NO progression
	// stakes: endFight skips all economy (LP, rank, boss stats,
	// missions, achievements). Only the current-rank OFFICIAL fight
	// awards LP. Locked and already-defeated bosses are sparred.
	let sparring = $state(false);

	// Fight state
	let fight = $state<BossFightState | null>(null);
	let roundChoice = $state<BossRoundChoice | null>(null);
	let chosenQuestion = $state<BossQuestion | null>(null);
	let answerPhase = $state<'choose' | 'answer' | 'feedback'>('choose');
	let lastAnswerCorrect = $state(false);
	let productionInput = $state('');
	let selectedOptionIndex = $state(-1);
	let shaking = $state(false);

	// Attack animation state
	let showPlayerAttack = $state(false);
	let showBossAttack = $state(false);

	// Sprite state for pixel art bosses
	let bossSprite = $state<'main' | 'damage' | 'victory'>('main');
	let playerSprite = $state<'main' | 'damage' | 'victory'>('main');

	// Derived: current boss art config
	let bossArt = $derived(getBossArt(selectedBossRank));

	// Timer state
	let timerMax = $state(0);
	let timerRemaining = $state(0);
	let timerIntervalId: ReturnType<typeof setInterval> | null = null;

	// Clean up timer and music on component destroy
	$effect(() => {
		return () => {
			clearTimer();
			stopBossMusic();
		};
	});

	// Result
	let resultType = $state<'won' | 'lost'>('won');
	let resultLpDelta = $state(0);

	function ranksOpenAtGate(gate: GateId): number[] {
		const out: number[] = [];
		if (gate >= 1) out.push(0, 1);
		if (gate >= 2) out.push(2, 3);
		if (gate >= 3) out.push(4, 5);
		if (gate >= 4) out.push(6, 7);
		return out;
	}

	function skillTestLabel(rank: number): string {
		if (rank <= 1) return rank === 0 ? 'First words · test I' : 'First words · test II';
		if (rank <= 3) return rank === 2 ? 'Everyday Dutch · test I' : 'Everyday Dutch · test II';
		if (rank <= 5) return rank === 4 ? 'Real sentences · test I' : 'Real sentences · test II';
		return rank === 6 ? 'B1 · test I' : 'B1 · test II';
	}

	function getBossState(rank: number): 'locked' | 'available' | 'defeated' {
		const open = ranksOpenAtGate(currentGateFromState(ctx.state));
		if (!open.includes(rank)) return 'locked';
		if (rank <= ctx.state.boss.rankDefeated) return 'defeated';
		return 'available';
	}

	function selectBoss(rank: number, spar = false) {
		selectedBossRank = rank;
		sparring = spar;
		view = 'prefight';
	}

	function startFight() {
		fight = createFight(selectedBossRank);
		answerPhase = 'choose';
		chosenQuestion = null;
		roundChoice = null;
		selectedOptionIndex = -1;
		productionInput = '';
		showPlayerAttack = false;
		showBossAttack = false;
		bossSprite = 'main';
		playerSprite = 'main';
		view = 'vs_intro';
		playSfx('session_start');
		playRealmEntry();
		// Start music immediately (requires user gesture context, can't be delayed)
		startBossMusic(getBossArt(selectedBossRank).soundtrack);
		setTimeout(() => {
			view = 'fighting';
			nextRound();
			startBossTension();
		}, 2500);
	}

	function nextRound() {
		if (!fight || fight.status !== 'fighting') return;
		answerPhase = 'choose';
		chosenQuestion = null;
		selectedOptionIndex = -1;
		productionInput = '';
		showPlayerAttack = false;
		showBossAttack = false;
		bossSprite = 'main';
		playerSprite = 'main';
		roundChoice = generateRound(fight, WORD_POOL);
		if (!roundChoice) endFight('won');
	}

	function startTimer() {
		const limit = BOSS_TIMER[selectedBossRank];
		if (!limit) return;
		clearTimer();
		timerMax = limit;
		timerRemaining = limit;
		timerIntervalId = setInterval(() => {
			timerRemaining -= 0.1;
			if (timerRemaining <= 0) {
				timerRemaining = 0;
				clearTimer();
				handleTimerExpiry();
			}
		}, 100);
	}

	function clearTimer() {
		if (timerIntervalId) {
			clearInterval(timerIntervalId);
			timerIntervalId = null;
		}
	}

	function handleTimerExpiry() {
		if (!chosenQuestion || !fight || answerPhase !== 'answer') return;
		submitAnswer('__TIMER_EXPIRED__');
	}

	function chooseQuestion(question: BossQuestion) {
		chosenQuestion = question;
		answerPhase = 'answer';
		productionInput = '';
		selectedOptionIndex = -1;
		startTimer();
	}

	function submitAnswer(answer: string) {
		if (!chosenQuestion || !fight || answerPhase !== 'answer') return;
		clearTimer();
		const correct = checkAnswer(chosenQuestion, answer);
		lastAnswerCorrect = correct;
		answerPhase = 'feedback';

		if (correct) {
			showPlayerAttack = true;
			setTimeout(() => {
				showPlayerAttack = false;
			}, 800);
			// Sprite swap: boss takes damage
			bossSprite = 'damage';
			setTimeout(() => {
				if (bossSprite === 'damage') bossSprite = 'main';
			}, 800);
			// Delay state change so HP drains as projectile arrives
			setTimeout(() => {
				if (!fight || !chosenQuestion) return;
				fight = applyAnswer(fight, true, chosenQuestion.damage, chosenQuestion.wordId);
				playBossHit();
				playImpactCrunch();
				if (fight) updateBossTension((fight.bossHp / fight.bossMaxHp) * 100);
			}, 350);
		} else {
			showBossAttack = true;
			setTimeout(() => {
				showBossAttack = false;
			}, 800);
			// Sprite swap: player takes damage
			playerSprite = 'damage';
			setTimeout(() => {
				if (playerSprite === 'damage') playerSprite = 'main';
			}, 800);
			setTimeout(() => {
				if (!fight || !chosenQuestion) return;
				fight = applyAnswer(fight, false, chosenQuestion.damage, chosenQuestion.wordId);
				playBossAttack();
				playPainSting();
				shaking = true;
				setTimeout(() => {
					shaking = false;
				}, 400);
			}, 350);
		}

		setTimeout(
			() => {
				if (!fight) return;
				if (fight.status === 'won') endFight('won');
				else if (fight.status === 'lost') endFight('lost');
				else nextRound();
			},
			correct ? 1500 : 2200
		);
	}

	function handleOptionClick(index: number) {
		if (!chosenQuestion?.options || answerPhase !== 'answer') return;
		selectedOptionIndex = index;
		submitAnswer(chosenQuestion.options[index]);
	}

	function handleProductionSubmit() {
		if (!chosenQuestion || answerPhase !== 'answer') return;
		submitAnswer(productionInput);
	}

	function handleProductionKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') handleProductionSubmit();
	}

	function endFight(result: 'won' | 'lost') {
		clearTimer();
		stopBossTension();
		stopBossMusic();
		resultType = result;
		resultLpDelta = 0; // sparring shows no LP; overridden in the economy block

		// Set victory sprites + celebration SFX. Cosmetic — identical
		// whether official or sparring; the fight experience is the same.
		if (result === 'won') {
			playerSprite = 'victory';
			playBossWin();
			startLoop('fireworks');
		} else {
			bossSprite = 'victory';
			playBossLoss();
		}

		// ECONOMY — official fights only. A sparring match carries no
		// progression stakes: no LP, no rank change, no boss stats, no
		// mission progress, no achievement progress.
		if (!sparring) {
			ctx.state.boss.attempts++;
			ctx.updateMissions('boss_attempt', 1);

			if (result === 'won') {
				ctx.state.boss.wins++;
				if (selectedBossRank > ctx.state.boss.rankDefeated) {
					ctx.state.boss.rankDefeated = selectedBossRank;
				}
				const lpResult = ctx.applyLpEvent({ type: 'boss_win', tier: ctx.state.tier });
				resultLpDelta = lpResult.delta;
			} else {
				ctx.state.boss.losses++;
				const lpResult = ctx.applyLpEvent({ type: 'boss_loss' });
				resultLpDelta = lpResult.delta;
			}
		}

		view = 'result';
	}

	function backToCatalogue() {
		clearTimer();
		stopBossTension();
		stopBossMusic();
		stopLoop();
		view = 'catalogue';
		sparring = false;
		fight = null;
		roundChoice = null;
		chosenQuestion = null;
	}

	function tryAgain() {
		clearTimer();
		stopBossTension();
		stopBossMusic();
		stopLoop();
		view = 'prefight';
		fight = null;
	}

	let bossRankDef = $derived(getRank(selectedBossRank));
	let hpPercent = $derived(fight ? Math.max(0, (fight.bossHp / fight.bossMaxHp) * 100) : 100);
</script>

<div class="boss-page" class:shaking>
	<RealmThreshold phase={thresholdPhase} />

	<!-- ============================================ -->
	<!-- CATALOGUE VIEW                               -->
	<!-- ============================================ -->
	{#if view === 'catalogue'}
		<div class="page-header">
			<Character who="kuromi" mood="pixel" size={28} animated={false} alt="" />
			<h2 class="page-title">SKILL TESTS</h2>
			<Doodle name="spark-sparkle-26" size={24} color="var(--color-orchid-soft)" tilt={-6} />
			<Doodle
				name="circle-round-mark-30"
				size={18}
				color="var(--color-orchid)"
				tilt={8}
				class="jit-5"
			/>
		</div>
		<div class="catalogue">
			{#each RANKS as rankDef (rankDef.rank)}
				{@const bState = getBossState(rankDef.rank)}
				{@const hp = BOSS_HP[rankDef.rank] ?? 50}
				{@const art = getBossArt(rankDef.rank)}
				{@const cardArt = art.coverImage ?? art.mainImage}
				<div
					class="boss-card"
					class:locked={bState === 'locked'}
					class:available={bState === 'available'}
					class:defeated={bState === 'defeated'}
					class:has-art={!!cardArt}
					style="--rank-color: var({rankDef.colorVar})"
				>
					{#if bState === 'defeated'}
						<div class="ribbon jit-2">&#10003;</div>
					{/if}
					<div class="boss-card-text">
						<div class="boss-rank-label">{skillTestLabel(rankDef.rank)}</div>
						<div class="boss-card-name">{BOSS_NAMES[rankDef.rank]}</div>
						<div class="boss-card-hp">{hp} HP</div>
						{#if bState === 'locked'}
							<div class="boss-card-status">
								<span class="lock-badge jit-3">
									<Icon name="lock" size={14} color="var(--color-realm-line)" />
								</span>
								Locked — spar to practice
							</div>
							<button
								class="boss-btn spar-btn tappable"
								onclick={() => {
									playSfx('button_tap');
									selectBoss(rankDef.rank, true);
								}}>SPAR</button
							>
						{:else if bState === 'available'}
							<button
								class="boss-btn fight-btn tappable"
								onclick={() => {
									playSfx('button_tap');
									selectBoss(rankDef.rank, false);
								}}>FIGHT</button
							>
						{:else}
							<button
								class="boss-btn spar-btn tappable"
								onclick={() => {
									playSfx('button_tap');
									selectBoss(rankDef.rank, true);
								}}>SPAR</button
							>
						{/if}
					</div>
					{#if cardArt}
						<div class="boss-card-art">
							<img src={cardArt} alt={BOSS_NAMES[rankDef.rank]} />
							<div class="boss-card-art-fade"></div>
						</div>
					{/if}
				</div>
			{/each}
			<div class="catalogue-flourish" aria-hidden="true">
				<Doodle
					name="swirl-loops-97"
					size={22}
					color="var(--color-orchid-soft)"
					tilt={-4}
					class="jit-a"
				/>
			</div>
		</div>

		<!-- ============================================ -->
		<!-- PRE-FIGHT VIEW                               -->
		<!-- ============================================ -->
	{:else if view === 'prefight'}
		<div class="prefight" style="--rank-glow: var({bossRankDef.colorVar})">
			<div class="prefight-glow"></div>
			{#if sparring}
				<span class="realm-chip jit-a">SPARRING</span>
			{/if}
			<div class="prefight-boss-visual">
				<img src={bossArt.mainImage} alt={BOSS_NAMES[selectedBossRank]} class="prefight-sprite" />
				<span class="prefight-doodle-spark" aria-hidden="true">
					<Doodle
						name="spark-sparks-sparkle-stars-30"
						size={28}
						color="var(--color-orchid-soft)"
						tilt={-10}
					/>
				</span>
			</div>
			<h2 class="boss-name-prefight">
				{BOSS_NAMES[selectedBossRank]}
			</h2>
			<div class="boss-rank-info">{skillTestLabel(selectedBossRank)}</div>
			<div class="prefight-matchup">
				<div class="prefight-stat">
					<span class="stat-value-big">{BOSS_HP[selectedBossRank]}</span>
					<span class="stat-label">BOSS HP</span>
				</div>
				<div class="prefight-vs-wrap">
					<div class="prefight-vs-divider">VS</div>
					<Doodle
						name="swirl-arrow-6"
						size={22}
						color="var(--color-orchid)"
						tilt={14}
						class="jit-6"
					/>
				</div>
				<div class="prefight-stat">
					<span class="stat-value-big player-accent">3</span>
					<span class="stat-label">
						YOUR STRIKES
						<Doodle
							name="pulse-heart-rate"
							size={16}
							color="var(--color-orchid-soft)"
							tilt={-5}
							class="jit-c"
						/>
					</span>
				</div>
			</div>
			{#if BOSS_TIMER[selectedBossRank]}
				<div class="prefight-timer-warning">
					<span class="timer-icon">&#9202;</span>
					{BOSS_TIMER[selectedBossRank]}s per question
				</div>
			{/if}
			<button class="fight-start-btn tappable" onclick={startFight}>
				<span class="fight-btn-text">FIGHT</span>
			</button>
			<button class="back-link tappable" onclick={backToCatalogue}>Back to Catalogue</button>
		</div>

		<!-- ============================================ -->
		<!-- VS INTRO                                     -->
		<!-- ============================================ -->
	{:else if view === 'vs_intro'}
		<div class="vs-screen" style="--rank-glow: var({bossRankDef.colorVar})">
			<div class="vs-flash"></div>
			<div class="vs-combatant vs-player-side">
				<img src={PLAYER_ART.main} alt="Domi" class="vs-sprite" />
				<div class="vs-combatant-name player-accent">DOMI</div>
			</div>
			<div class="vs-label-container">
				<div class="vs-label">VS</div>
			</div>
			<div class="vs-combatant vs-boss-side">
				<img src={bossArt.mainImage} alt={BOSS_NAMES[selectedBossRank]} class="vs-sprite" />
				<div class="vs-combatant-name">
					{BOSS_NAMES[selectedBossRank]}
				</div>
			</div>
		</div>

		<!-- ============================================ -->
		<!-- FIGHTING VIEW (ARENA)                        -->
		<!-- ============================================ -->
	{:else if view === 'fighting' && fight}
		<div class="fight-screen" style="--rank-glow: var({bossRankDef.colorVar})">
			<!-- HUD: streak / lives -->
			<div class="hud-row">
				<div class="hud-chip jit-b">
					<Icon name="fire" size={14} color="var(--color-orchid)" />
					<span class="hud-chip-value">{ctx.state.practiceDays}</span>
					<span class="hud-chip-label">STREAK</span>
				</div>
				<div class="hud-chip hud-chip-lives jit-c">
					{#each Array.from({ length: fight.maxStrikes }, (_, idx) => idx) as i (i)}
						<Icon
							name="crown"
							size={14}
							color={i < fight.playerStrikes ? 'var(--color-orchid)' : 'var(--color-realm-line)'}
						/>
					{/each}
				</div>
				<Doodle
					name="spark-sparkle-26"
					size={16}
					color="var(--color-orchid-soft)"
					tilt={8}
					class="jit-6"
				/>
			</div>

			<!-- ARENA -->
			<div class="arena" class:arena-danger={fight.playerStrikes === 1}>
				<!-- Background scene (per-boss arena) -->
				<img src={bossArt.arena} alt="" class="arena-bg" />
				<div class="arena-bg-overlay"></div>

				<!-- Player side -->
				<div class="arena-left" class:player-hit={showBossAttack}>
					<img
						src={playerSprite === 'damage'
							? PLAYER_ART.damage
							: playerSprite === 'victory'
								? PLAYER_ART.victory
								: PLAYER_ART.main}
						alt="Domi"
						class="arena-sprite arena-sprite-player"
					/>
					<div class="kuromi-reactor-corner jit-4">
						<Character who="kuromi" mood="pixel" size={32} animated={false} alt="" />
					</div>
				</div>

				<!-- Projectile lane -->
				<div class="projectile-lane">
					{#if showPlayerAttack}
						<div class="projectile player-bolt"></div>
					{/if}
					{#if showBossAttack}
						<div class="projectile boss-slash"></div>
					{/if}
				</div>

				<!-- Boss side -->
				<div class="arena-right" class:boss-hurt={showPlayerAttack}>
					<img
						src={bossSprite === 'damage'
							? bossArt.damageImage
							: bossSprite === 'victory'
								? bossArt.victoryImage
								: bossArt.mainImage}
						alt={BOSS_NAMES[selectedBossRank]}
						class="arena-sprite arena-sprite-boss"
					/>
				</div>
			</div>

			<!-- BOSS HP BAR -->
			<div class="boss-hp-panel">
				<div class="boss-hp-row">
					<div class="boss-hp-name">
						{BOSS_NAMES[selectedBossRank]}
					</div>
					<Doodle
						name="pulse-heart-rate"
						size={16}
						color="var(--color-orchid-soft)"
						tilt={-6}
						class="jit-3"
					/>
					<div class="boss-hp-numbers">{fight.bossHp}/{fight.bossMaxHp}</div>
				</div>
				<div class="boss-hp-track">
					<div class="boss-hp-fill" style="width: {hpPercent}%"></div>
				</div>
			</div>

			<!-- TIMER BAR (ranks 3+) -->
			{#if timerMax > 0 && (answerPhase === 'answer' || answerPhase === 'feedback')}
				{@const pct = Math.max(0, (timerRemaining / timerMax) * 100)}
				<div class="timer-row">
					<div class="timer-bar-outer">
						<div
							class="timer-bar-inner"
							class:timer-warn={timerRemaining > 0 && timerRemaining < timerMax * 0.35}
							class:timer-danger={timerRemaining > 0 && timerRemaining < timerMax * 0.15}
							style="width: {pct}%"
						></div>
					</div>
					<span
						class="timer-text"
						class:timer-warn-text={timerRemaining > 0 && timerRemaining < timerMax * 0.35}
						class:timer-danger-text={timerRemaining > 0 && timerRemaining < timerMax * 0.15}
						>{Math.ceil(timerRemaining)}</span
					>
				</div>
			{/if}

			<!-- QUESTION PANEL -->
			<div class="question-stage">
				<img
					src={bossSprite === 'damage' ? bossArt.damageImage : bossArt.mainImage}
					alt=""
					class="question-stage-boss"
					aria-hidden="true"
				/>
				<div class="question-panel">
					{#if answerPhase === 'choose' && roundChoice}
						<div class="choice-label">Choose your attack</div>
						<div class="choice-cards">
							<button
								class="choice-card tappable"
								onclick={() => chooseQuestion(roundChoice!.optionA)}
							>
								<div class="choice-damage">{DAMAGE[roundChoice.optionA.type]}</div>
								<div class="choice-damage-label">DMG</div>
								<div class="choice-type">{TYPE_LABELS[roundChoice.optionA.type].name}</div>
								<div class="choice-desc">{TYPE_LABELS[roundChoice.optionA.type].desc}</div>
							</button>
							<button
								class="choice-card tappable"
								onclick={() => chooseQuestion(roundChoice!.optionB)}
							>
								<div class="choice-damage">{DAMAGE[roundChoice.optionB.type]}</div>
								<div class="choice-damage-label">DMG</div>
								<div class="choice-type">{TYPE_LABELS[roundChoice.optionB.type].name}</div>
								<div class="choice-desc">{TYPE_LABELS[roundChoice.optionB.type].desc}</div>
							</button>
						</div>
					{/if}

					{#if (answerPhase === 'answer' || answerPhase === 'feedback') && chosenQuestion}
						<div class="question-area">
							<span class="realm-chip question-type-badge">
								{TYPE_LABELS[chosenQuestion.type].name} &middot; {chosenQuestion.damage} DMG
							</span>

							{#if chosenQuestion.type === 'production'}
								<div class="question-prompt-label">Type the Dutch word for:</div>
								<div class="question-prompt">{chosenQuestion.prompt}</div>
								{#if answerPhase === 'answer'}
									<div class="production-input-row">
										<input
											type="text"
											class="production-input"
											lang="nl"
											placeholder="Type the Dutch word..."
											bind:value={productionInput}
											onkeydown={handleProductionKeydown}
										/>
										<button
											class="submit-btn tappable"
											onclick={handleProductionSubmit}
											disabled={productionInput.trim().length === 0}>GO</button
										>
									</div>
								{:else}
									<div class="feedback-row">
										{#if lastAnswerCorrect}
											<div class="feedback correct-feedback">
												<Icon name="check" size={18} color="var(--color-orchid)" />
												HIT!
											</div>
										{:else}
											<div class="feedback wrong-feedback">
												<Icon name="xmark" size={18} color="#ffffff" />
												MISS! Answer: <strong>{chosenQuestion.correctAnswer}</strong>
											</div>
										{/if}
									</div>
								{/if}
							{:else}
								{#if chosenQuestion.type === 'sentence_completion'}
									<div class="question-prompt-label">Fill in the blank:</div>
								{:else if chosenQuestion.type === 'transformation'}
									<div class="question-prompt-label">Rewrite the sentence:</div>
								{:else if chosenQuestion.type === 'error_identification'}
									<div class="question-prompt-label">Find the error:</div>
								{:else}
									<div class="question-prompt-label">What does this mean?</div>
								{/if}
								<div class="question-prompt">{chosenQuestion.prompt}</div>
								{#if chosenQuestion.options}
									<div class="options">
										{#each chosenQuestion.options as option, i (i)}
											{@const isSelected = selectedOptionIndex === i}
											{@const isCorrect = i === chosenQuestion.correctIndex}
											{@const showCorrect = answerPhase === 'feedback' && isCorrect}
											{@const showWrong = answerPhase === 'feedback' && isSelected && !isCorrect}
											<button
												class="option-btn tappable"
												class:correct={showCorrect}
												class:wrong={showWrong}
												class:dimmed={answerPhase === 'feedback' && !isSelected && !isCorrect}
												onclick={() => handleOptionClick(i)}
												disabled={answerPhase === 'feedback'}
											>
												<span class="option-btn-text">{option}</span>
												{#if showCorrect}
													<Icon name="check" size={16} color="var(--color-orchid)" />
												{:else if showWrong}
													<Icon name="xmark" size={16} color="#ffffff" />
												{/if}
											</button>
										{/each}
									</div>
								{/if}
							{/if}

							{#if answerPhase === 'feedback'}
								<div
									class="damage-floater"
									class:hit={lastAnswerCorrect}
									class:miss={!lastAnswerCorrect}
								>
									{#if lastAnswerCorrect}+{chosenQuestion.damage} DMG{:else}STRIKE!{/if}
								</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- ============================================ -->
		<!-- RESULT VIEW                                  -->
		<!-- ============================================ -->
	{:else if view === 'result'}
		<div class="result-screen" style="--rank-glow: var({bossRankDef.colorVar})">
			{#if resultType === 'won'}
				<div class="result-glow won-glow"></div>
				<div class="result-card">
					<div class="result-visual">
						<img src={PLAYER_ART.victory} alt="Domi wins!" class="result-sprite" />
						<div class="result-kuromi-reactor jit-4">
							<Character who="kuromi" mood="excited" size={56} animated={true} alt="" />
						</div>
					</div>
					<div class="result-stamp-wrap">
						<h2 class="result-stamp won-stamp">VICTORY</h2>
						<span class="result-doodle-spark" aria-hidden="true">
							<Doodle
								name="spark-sparkle-26"
								size={24}
								color="var(--color-orchid)"
								tilt={-8}
								class="jit-2"
							/>
						</span>
						<span class="result-doodle-stars" aria-hidden="true">
							<Doodle
								name="spark-sparks-sparkle-stars-30"
								size={22}
								color="var(--color-orchid-soft)"
								tilt={12}
								class="jit-5"
							/>
						</span>
					</div>
					<div class="result-boss-name">
						{BOSS_NAMES[selectedBossRank]}
					</div>
					{#if sparring}
						<span class="result-lp-chip">SPARRING</span>
					{:else}
						<span class="result-lp-chip">Badge earned</span>
					{/if}
					<button
						class="fight-start-btn tappable"
						onclick={() => {
							playSfx('button_tap');
							backToCatalogue();
						}}>Continue</button
					>
				</div>
			{:else}
				<div class="result-glow lost-glow"></div>
				<div class="result-card">
					<div class="result-visual">
						<img
							src={bossArt.victoryImage}
							alt={BOSS_NAMES[selectedBossRank]}
							class="result-sprite"
						/>
						<div class="result-kuromi-reactor jit-4">
							<Character who="kuromi" mood="defeated" size={56} animated={true} alt="" />
						</div>
					</div>
					<div class="result-stamp-wrap">
						<h2 class="result-stamp lost-stamp">YOU FELL</h2>
						<span class="result-doodle-swirl" aria-hidden="true">
							<Doodle
								name="swirl-loops-97"
								size={22}
								color="var(--color-orchid-soft)"
								tilt={-6}
								class="jit-a"
							/>
						</span>
						<span class="result-doodle-thoughts" aria-hidden="true">
							<Doodle
								name="thoughts-dreams-clouds-thought-bubble-11"
								size={20}
								color="var(--color-orchid-soft)"
								tilt={8}
								class="jit-3"
							/>
						</span>
					</div>
					{#if sparring}
						<span class="result-lp-chip">SPARRING</span>
					{:else}
						<span class="result-lp-chip">Just a test</span>
					{/if}
					<button
						class="fight-start-btn tappable"
						onclick={() => {
							playSfx('button_tap');
							tryAgain();
						}}>Try Again</button
					>
					<button class="back-link tappable" onclick={backToCatalogue}>Back to Catalogue</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.boss-page {
		background: var(--color-realm-bg);
		min-height: 100%;
		border-radius: 18px;
		padding: 0.5rem 0.75rem;
	}
	.boss-page.shaking {
		animation: screenShake 0.4s ease;
	}
	@keyframes screenShake {
		0%,
		100% {
			transform: translateX(0);
		}
		10% {
			transform: translateX(-8px) rotate(-1deg);
		}
		20% {
			transform: translateX(7px) rotate(0.8deg);
		}
		30% {
			transform: translateX(-6px) rotate(-0.5deg);
		}
		40% {
			transform: translateX(5px);
		}
		50% {
			transform: translateX(-3px);
		}
		60% {
			transform: translateX(2px);
		}
	}

	/* Player-accent: split by context (body-size vs large-text). No cyan. */
	.stat-value-big.player-accent {
		/* orchid text: 36px/700, AA large-text OK */
		color: var(--color-orchid);
	}
	.vs-combatant-name.player-accent {
		/* body-size 15px/700 — orchid fails AA; white only */
		color: #ffffff;
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin-bottom: 16px;
		flex-wrap: wrap;
	}
	.page-title {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		letter-spacing: -0.02em;
		/* orchid text: 20px/700, AA large-text OK */
		color: var(--color-orchid);
		text-align: center;
		margin: 0;
	}

	/* =============================== */
	/* CATALOGUE                       */
	/* =============================== */
	.catalogue {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.catalogue-flourish {
		display: flex;
		justify-content: center;
		padding: 4px 0 8px;
	}
	.boss-card {
		position: relative;
		background: color-mix(in srgb, var(--color-realm-panel) 78%, transparent);
		border: 1px solid var(--color-realm-line);
		border-radius: 22px;
		overflow: hidden;
		display: flex;
		min-height: 80px;
	}
	.boss-card.has-art {
		min-height: 120px;
	}
	/* Exactly one glowing hero card: the available fight target */
	.boss-card.available {
		border: 2px solid var(--color-orchid);
		box-shadow:
			var(--shadow-offset-realm),
			inset 0 0 16px color-mix(in srgb, var(--color-orchid) 30%, transparent);
	}
	.boss-card.locked {
		opacity: 0.65;
	}
	.boss-card.defeated {
		border: 1px solid var(--color-realm-line);
	}
	.boss-card-text {
		flex: 1;
		padding: 16px 18px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		z-index: 1;
	}
	.ribbon {
		position: absolute;
		top: 10px;
		right: 14px;
		font-size: var(--text-title);
		/* orchid text: 20px/700, AA large-text OK */
		color: var(--color-orchid);
		font-weight: 700;
		z-index: 2;
	}
	.boss-card.has-art .ribbon {
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
	}
	.boss-rank-label {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.1em;
		/* --rank-color kept on the card for possible non-text accents; never drive text */
		color: #ffffff;
	}
	.boss-card-name {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		color: #ffffff;
		letter-spacing: -0.02em;
	}
	.boss-card-hp {
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 600;
		color: #ffffff;
	}
	.boss-card-status {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: var(--text-small);
		color: #ffffff;
		font-style: italic;
	}
	.lock-badge {
		display: inline-flex;
		flex-shrink: 0;
	}
	.boss-btn {
		align-self: flex-start;
		padding: 8px 24px;
		border-radius: 999px;
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		letter-spacing: 0.08em;
		cursor: pointer;
		transition: all 0.15s ease;
		-webkit-tap-highlight-color: transparent;
		margin-top: 4px;
	}
	.fight-btn {
		background: var(--color-orchid);
		color: var(--color-realm-bg);
		border: 2px solid var(--color-orchid);
		box-shadow: var(--shadow-offset-realm);
	}
	.fight-btn:hover {
		background: var(--color-orchid-soft);
		border-color: var(--color-orchid-soft);
	}
	/* Sparring buttons (locked + defeated) — flat so FIGHT stays the CTA */
	.spar-btn {
		background: transparent;
		color: #ffffff;
		border: 1px solid var(--color-realm-line);
	}
	.spar-btn:hover {
		background: color-mix(in srgb, #ffffff 8%, transparent);
		border-color: color-mix(in srgb, #ffffff 35%, var(--color-realm-line));
	}
	.boss-card-art {
		position: relative;
		width: 45%;
		min-width: 140px;
		flex-shrink: 0;
	}
	.boss-card-art img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.boss-card-art-fade {
		position: absolute;
		inset: 0;
		background: linear-gradient(to right, var(--color-realm-panel) 0%, transparent 40%);
	}

	/* =============================== */
	/* PRE-FIGHT                       */
	/* =============================== */
	.prefight {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		padding-top: 24px;
		overflow: hidden;
	}
	.prefight-glow {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 300px;
		height: 300px;
		border-radius: 50%;
		background: var(--color-orchid);
		opacity: calc(0.08 * var(--glow-multiplier, 1));
		filter: blur(60px);
		pointer-events: none;
		/* One-shot entrance only — no idle infinite loop */
		animation: prefightGlowIn 0.5s ease-out both;
	}
	@keyframes prefightGlowIn {
		from {
			opacity: 0;
			transform: translateX(-50%) scale(0.9);
		}
		to {
			opacity: calc(0.08 * var(--glow-multiplier, 1));
			transform: translateX(-50%) scale(1.1);
		}
	}
	/* orchid-soft on realm-panel = 4.42:1 (< 4.5 AA body); white text + orchid border */
	.realm-chip {
		z-index: 1;
		background: color-mix(in srgb, var(--color-realm-panel) 85%, transparent);
		border: 1px solid var(--color-orchid);
		border-radius: 999px;
		padding: 4px 12px;
		font-size: var(--text-micro);
		font-weight: 700;
		color: #ffffff;
		letter-spacing: 0.06em;
		font-family: var(--font-display);
	}
	.prefight-boss-visual {
		position: relative;
		margin: 8px 0;
		z-index: 1;
		animation: prefightBossIn 0.6s ease-out;
	}
	.prefight-doodle-spark {
		position: absolute;
		top: -4px;
		right: -18px;
	}
	@keyframes prefightBossIn {
		from {
			transform: scale(0.7) translateY(20px);
			opacity: 0;
		}
		to {
			transform: scale(1) translateY(0);
			opacity: 1;
		}
	}
	.prefight-sprite {
		height: 200px;
		width: auto;
		object-fit: contain;
	}
	.boss-name-prefight {
		font-family: var(--font-display);
		font-size: 32px;
		font-weight: 700;
		letter-spacing: -0.02em;
		text-align: center;
		z-index: 1;
		margin: 0;
		color: #ffffff;
	}
	.boss-rank-info {
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 600;
		color: #ffffff;
		letter-spacing: 0.06em;
		z-index: 1;
	}
	.prefight-matchup {
		display: flex;
		align-items: center;
		gap: 20px;
		margin: 12px 0;
		z-index: 1;
	}
	.prefight-stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}
	.stat-value-big {
		font-family: var(--font-display);
		font-size: 36px;
		font-weight: 700;
	}
	.stat-value-big:not(.player-accent) {
		/* orchid text: 36px/700, AA large-text OK */
		color: var(--color-orchid);
	}
	.stat-label {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.1em;
		color: #ffffff;
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
	.prefight-vs-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}
	.prefight-vs-divider {
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		color: #ffffff;
		letter-spacing: 0.1em;
	}
	.prefight-timer-warning {
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 600;
		letter-spacing: 0.06em;
		color: #ffffff;
		z-index: 1;
	}
	.timer-icon {
		font-size: var(--text-base);
	}
	.fight-start-btn {
		padding: 14px 52px;
		background: var(--color-orchid);
		border: 2px solid var(--color-orchid);
		border-radius: 999px;
		color: var(--color-realm-bg);
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		letter-spacing: 0.08em;
		cursor: pointer;
		transition: all 0.15s ease;
		-webkit-tap-highlight-color: transparent;
		margin-top: 8px;
		z-index: 1;
		position: relative;
		overflow: hidden;
		box-shadow: var(--shadow-offset-realm);
	}
	.fight-start-btn::before {
		content: '';
		position: absolute;
		inset: -3px;
		border-radius: 999px;
		background: var(--color-orchid-soft);
		opacity: 0;
		/* One-shot entrance pulse — no idle infinite loop */
		animation: btnPulseIn 0.6s ease-out both;
		pointer-events: none;
	}
	@keyframes btnPulseIn {
		0% {
			opacity: 0.18;
			transform: scale(1);
		}
		100% {
			opacity: 0;
			transform: scale(1.04);
		}
	}
	.fight-btn-text {
		position: relative;
		z-index: 1;
	}
	.fight-start-btn:hover {
		background: var(--color-orchid-soft);
		border-color: var(--color-orchid-soft);
	}
	.fight-start-btn:active {
		transform: scale(var(--press-scale));
	}
	.back-link {
		background: none;
		border: none;
		color: color-mix(in srgb, #ffffff 75%, transparent);
		font-size: var(--text-small);
		cursor: pointer;
		padding: 8px;
		text-decoration: underline;
		text-underline-offset: 3px;
		z-index: 1;
	}

	/* =============================== */
	/* VS INTRO                        */
	/* =============================== */
	.vs-screen {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		height: 50vh;
		overflow: hidden;
	}
	.vs-flash {
		position: fixed;
		inset: 0;
		background: var(--color-orchid);
		animation: vsFlash 0.3s ease-out forwards;
		pointer-events: none;
		z-index: 10;
	}
	@keyframes vsFlash {
		0% {
			opacity: 0.25;
		}
		100% {
			opacity: 0;
		}
	}
	.vs-combatant {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}
	.vs-boss-side {
		animation: vsFromRight 0.7s ease-out 0.2s both;
	}
	.vs-player-side {
		animation: vsFromLeft 0.7s ease-out 0.2s both;
	}
	.vs-sprite {
		height: 130px;
		width: auto;
		object-fit: contain;
	}
	.vs-combatant-name {
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		letter-spacing: 0.08em;
		color: #ffffff;
	}
	.vs-label-container {
		z-index: 5;
	}
	.vs-label {
		font-family: var(--font-display);
		font-size: 56px;
		font-weight: 700;
		letter-spacing: 0.1em;
		/* orchid text: 56px/700, AA large-text OK — sole retro flourish this pass */
		color: var(--color-orchid);
		-webkit-text-stroke: 1px var(--color-realm-bg);
		text-shadow:
			2px 0 0 color-mix(in srgb, var(--color-realm-bg) 70%, transparent),
			-2px 0 0 color-mix(in srgb, var(--color-realm-bg) 70%, transparent),
			0 2px 0 color-mix(in srgb, var(--color-realm-bg) 70%, transparent),
			0 -2px 0 color-mix(in srgb, var(--color-realm-bg) 70%, transparent),
			0 3px 0 color-mix(in srgb, var(--color-realm-bg) 60%, transparent);
		animation: vsLabelIn 0.5s ease-out 0.5s both;
	}
	@keyframes vsFromLeft {
		from {
			transform: translateX(-80px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
	@keyframes vsFromRight {
		from {
			transform: translateX(80px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
	@keyframes vsLabelIn {
		from {
			transform: scale(3);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	/* =============================== */
	/* ARENA                           */
	/* =============================== */
	.fight-screen {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.arena {
		position: relative;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		padding: 14px 8px 10px;
		min-height: 280px;
		background: color-mix(in srgb, var(--color-realm-panel) 70%, transparent);
		border: 1px solid var(--color-realm-line);
		border-radius: 22px;
		box-shadow:
			var(--shadow-offset-realm),
			inset 0 0 20px color-mix(in srgb, var(--color-orchid) 14%, transparent);
		overflow: hidden;
	}
	.arena-danger {
		border-color: var(--color-orchid);
		box-shadow:
			var(--shadow-offset-realm),
			0 0 18px color-mix(in srgb, var(--color-orchid) 45%, transparent);
	}

	.arena-bg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		z-index: 0;
	}
	.arena-bg-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--color-realm-bg) 35%, transparent) 0%,
			color-mix(in srgb, var(--color-realm-bg) 72%, transparent) 100%
		);
		z-index: 1;
	}

	/* HUD chip row (LP / streak / lives) — static glow only, no idle pulse */
	.hud-row {
		display: flex;
		gap: 8px;
		margin-bottom: 10px;
		flex-wrap: wrap;
	}
	.hud-chip {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		background: color-mix(in srgb, var(--color-realm-panel) 80%, transparent);
		border: 1px solid var(--color-orchid);
		border-radius: 999px;
		padding: 5px 12px;
		box-shadow: 0 0 10px color-mix(in srgb, var(--color-orchid) 22%, transparent);
		font-family: var(--font-display);
	}
	.hud-chip-value {
		color: #ffffff;
		font-size: var(--text-small);
		font-weight: 700;
	}
	.hud-chip-label {
		color: color-mix(in srgb, white 75%, transparent);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.06em;
	}
	.hud-chip-lives {
		gap: 4px;
	}

	.arena-left {
		position: relative;
		z-index: 3;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		transition: transform 0.3s ease;
	}
	.kuromi-reactor-corner {
		position: absolute;
		bottom: -6px;
		left: -10px;
		pointer-events: none;
		line-height: 0;
		filter: drop-shadow(0 0 6px color-mix(in srgb, var(--color-orchid) 45%, transparent));
	}
	.arena-left.player-hit {
		animation: playerRecoil 0.5s ease;
	}
	@keyframes playerRecoil {
		0%,
		100% {
			transform: translateX(0);
		}
		20% {
			transform: translateX(-12px);
		}
		40% {
			transform: translateX(6px);
		}
		60% {
			transform: translateX(-3px);
		}
	}

	.arena-right {
		position: relative;
		z-index: 3;
		flex-shrink: 0;
		transition: all 0.3s ease;
	}
	.arena-right.boss-hurt {
		animation: bossRecoil 0.5s ease;
	}
	@keyframes bossRecoil {
		0%,
		100% {
			transform: translateX(0) scale(1);
			filter: brightness(1);
		}
		20% {
			transform: translateX(8px) scale(0.95);
			filter: brightness(2);
		}
		50% {
			filter: brightness(1.5) saturate(0.5);
		}
	}

	/* =============================== */
	/* BOSS HP PANEL (below arena)     */
	/* =============================== */
	.boss-hp-panel {
		background: color-mix(in srgb, var(--color-realm-panel) 78%, transparent);
		border: 1px solid var(--color-realm-line);
		border-radius: 22px;
		padding: 12px 16px;
		box-shadow: none;
	}
	.boss-hp-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 8px;
	}
	.boss-hp-name {
		font-family: var(--font-display);
		font-size: var(--text-title);
		font-weight: 700;
		letter-spacing: -0.02em;
		color: #ffffff;
	}
	.boss-hp-numbers {
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		color: #ffffff;
	}
	.boss-hp-track {
		height: 18px;
		background: var(--color-realm-bg);
		border: 1px solid var(--color-realm-line);
		border-radius: 999px;
		overflow: hidden;
	}
	.boss-hp-fill {
		height: 100%;
		border-radius: 999px;
		background: linear-gradient(90deg, var(--color-orchid) 0%, var(--color-orchid-soft) 100%);
		transition: width 0.6s ease;
	}

	/* Pixel art arena sprites */
	.arena-sprite {
		object-fit: contain;
	}
	.arena-sprite-player {
		height: 150px;
		width: auto;
	}
	.arena-sprite-boss {
		height: 180px;
		width: auto;
	}

	/* Projectile lane */
	.projectile-lane {
		position: relative;
		flex: 1;
		min-width: 40px;
		height: 80px;
	}
	.projectile {
		position: absolute;
		top: 50%;
		pointer-events: none;
	}
	.player-bolt {
		left: 0;
		width: 24px;
		height: 6px;
		background: var(--color-orchid);
		border-radius: 3px;
		box-shadow:
			0 0 6px var(--color-orchid),
			0 0 14px var(--color-orchid-soft);
		transform: translateY(-50%);
		animation: boltFly 0.5s ease-in forwards;
	}
	@keyframes boltFly {
		0% {
			left: 0%;
			opacity: 0.9;
		}
		70% {
			left: 75%;
			opacity: 1;
			transform: translateY(-50%) scaleX(1.5);
		}
		100% {
			left: 90%;
			opacity: 0;
			transform: translateY(-50%) scaleX(0.5);
		}
	}
	.boss-slash {
		right: 0;
		width: 30px;
		height: 4px;
		background: var(--color-orchid);
		border-radius: 2px;
		box-shadow:
			0 0 6px var(--color-orchid),
			0 0 14px var(--color-orchid-soft);
		transform: translateY(-50%) rotate(-15deg);
		animation: slashFly 0.45s ease-in forwards;
	}
	@keyframes slashFly {
		0% {
			right: 0%;
			opacity: 0.9;
		}
		70% {
			right: 70%;
			opacity: 1;
			transform: translateY(-50%) rotate(-15deg) scaleX(1.3);
		}
		100% {
			right: 85%;
			opacity: 0;
			transform: translateY(-50%) rotate(-15deg) scaleX(0.5);
		}
	}

	/* Timer bar — realm glassy chrome; intensity (not hue) signals urgency */
	.timer-row {
		display: flex;
		align-items: center;
		gap: 8px;
		background: color-mix(in srgb, var(--color-realm-panel) 78%, transparent);
		border: 1px solid var(--color-realm-line);
		border-radius: 999px;
		padding: 8px 12px;
	}
	.timer-bar-outer {
		flex: 1;
		height: 10px;
		background: var(--color-realm-bg);
		border: 1px solid var(--color-realm-line);
		border-radius: 999px;
		overflow: hidden;
	}
	.timer-bar-inner {
		height: 100%;
		border-radius: 999px;
		background: var(--color-orchid-soft);
		transition: width 0.1s linear;
	}
	.timer-bar-inner.timer-warn {
		background: var(--color-orchid);
	}
	.timer-bar-inner.timer-danger {
		background: var(--color-orchid);
		animation: timerPulse 0.5s ease-in-out infinite alternate;
	}
	@keyframes timerPulse {
		from {
			opacity: 0.7;
		}
		to {
			opacity: 1;
		}
	}
	.timer-text {
		font-family: var(--font-display);
		font-size: var(--text-small);
		font-weight: 700;
		color: #ffffff;
		min-width: 22px;
		text-align: right;
	}
	/* warn: orchid-soft on translucent panel ~4.89:1 AA body OK */
	.timer-warn-text {
		color: var(--color-orchid-soft);
	}
	/* danger: orchid on translucent panel ~4.23:1 < 4.5 — use white */
	.timer-danger-text {
		color: #ffffff;
	}

	/* =============================== */
	/* QUESTION PANEL                  */
	/* =============================== */
	.question-stage {
		position: relative;
	}
	.question-stage-boss {
		position: absolute;
		top: -60px;
		right: -10px;
		height: 220px;
		width: auto;
		object-fit: contain;
		opacity: 0.22;
		filter: grayscale(0.25) brightness(0.9);
		pointer-events: none;
		z-index: 0;
		-webkit-mask-image: linear-gradient(to bottom, black 55%, transparent 100%);
		mask-image: linear-gradient(to bottom, black 55%, transparent 100%);
	}
	:global(.question-panel) {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 12px;
		background: color-mix(in srgb, var(--color-realm-panel) 82%, transparent);
		border: 2px solid var(--color-orchid);
		border-radius: 22px;
		padding: 18px;
		box-shadow:
			var(--shadow-offset-realm),
			inset 0 0 20px color-mix(in srgb, var(--color-orchid) 18%, transparent);
	}

	.choice-label {
		font-family: var(--font-display);
		font-size: var(--text-small); /* 14px body — white, not orchid */
		font-weight: 700;
		letter-spacing: 0.12em;
		color: #ffffff;
		text-align: center;
		text-transform: uppercase;
	}
	.choice-cards {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}
	.choice-card {
		background: var(--color-realm-bg);
		border: 2px solid var(--color-realm-line);
		border-radius: 18px;
		padding: 18px 10px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		cursor: pointer;
		transition: all 0.15s ease;
		-webkit-tap-highlight-color: transparent;
	}
	.choice-card:hover {
		border-color: var(--color-orchid);
		background: color-mix(in srgb, var(--color-realm-panel) 60%, var(--color-realm-bg));
	}
	.choice-card:active {
		transform: scale(var(--press-scale));
		box-shadow:
			0 0 0 3px color-mix(in srgb, var(--color-orchid) 55%, transparent),
			0 0 16px color-mix(in srgb, var(--color-orchid) 45%, transparent);
	}
	.choice-damage {
		font-family: var(--font-display);
		font-size: 28px; /* large-text-orchid: 28px/700 */
		font-weight: 700;
		color: var(--color-orchid);
		line-height: 1;
	}
	.choice-damage-label {
		font-family: var(--font-display);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.1em;
		color: #ffffff;
		opacity: 0.85;
	}
	.choice-type {
		font-family: var(--font-display);
		font-size: var(--text-micro); /* body/label — white, not orchid */
		font-weight: 700;
		letter-spacing: 0.06em;
		color: #ffffff;
		margin-top: 4px;
	}
	.choice-desc {
		font-size: var(--text-micro);
		color: color-mix(in srgb, white 80%, transparent);
		text-align: center;
	}

	.question-area {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 10px;
		animation: panelSlideIn 0.3s ease-out;
	}
	@keyframes panelSlideIn {
		from {
			transform: translateY(12px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	:global(.question-type-badge) {
		align-self: center;
	}
	.question-prompt-label {
		font-family: var(--font-display);
		font-size: var(--text-small); /* 14px body — white, not orchid */
		font-weight: 700;
		letter-spacing: 0.08em;
		color: #ffffff;
		text-transform: uppercase;
	}
	.question-prompt {
		font-size: var(--text-title);
		font-weight: 600;
		color: #ffffff;
		line-height: 1.4;
		background: var(--color-realm-bg);
		border: 1px solid var(--color-realm-line);
		border-radius: 16px;
		padding: 14px 16px;
		white-space: pre-line;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.option-btn {
		width: 100%;
		padding: 12px 16px;
		background: var(--color-realm-bg);
		border: 1px solid var(--color-realm-line);
		border-radius: 999px;
		color: #ffffff;
		font-family: var(--font-sans);
		font-size: var(--text-lead);
		font-weight: 500;
		text-align: left;
		cursor: pointer;
		transition: all 0.15s ease;
		-webkit-tap-highlight-color: transparent;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}
	.option-btn-text {
		flex: 1;
		min-width: 0;
	}
	.option-btn:hover:not(:disabled) {
		border-color: var(--color-orchid);
		background: color-mix(in srgb, var(--color-realm-panel) 55%, var(--color-realm-bg));
	}
	.option-btn:active:not(:disabled) {
		box-shadow:
			0 0 0 3px color-mix(in srgb, var(--color-orchid) 55%, transparent),
			0 0 14px color-mix(in srgb, var(--color-orchid) 40%, transparent);
	}
	.option-btn.correct {
		border-color: var(--color-orchid);
		background: color-mix(in srgb, var(--color-orchid) 16%, var(--color-realm-bg));
		box-shadow: 0 0 14px color-mix(in srgb, var(--color-orchid) 40%, transparent);
		color: #ffffff;
	}
	.option-btn.wrong {
		border-color: var(--color-realm-line);
		background: color-mix(in srgb, var(--color-realm-line) 30%, var(--color-realm-bg));
		color: color-mix(in srgb, white 70%, transparent);
		box-shadow: none;
	}
	.option-btn.dimmed {
		opacity: 0.4;
	}
	.option-btn:disabled {
		cursor: default;
	}

	.production-input-row {
		display: flex;
		gap: 8px;
	}
	.production-input {
		flex: 1;
		padding: 12px 16px;
		background: var(--color-realm-bg);
		border: 1px solid var(--color-realm-line);
		border-radius: 999px;
		color: #ffffff;
		font-family: var(--font-sans);
		font-size: var(--text-lead);
		outline: none;
	}
	.production-input:focus {
		border-color: var(--color-orchid);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-orchid) 30%, transparent);
	}
	.production-input::placeholder {
		color: color-mix(in srgb, white 55%, transparent);
	}
	.submit-btn {
		padding: 12px 22px;
		background: var(--color-orchid);
		border: 2px solid var(--color-orchid);
		border-radius: 999px;
		color: var(--color-realm-bg);
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		letter-spacing: 0.08em;
		cursor: pointer;
	}
	.submit-btn:hover:not(:disabled) {
		background: var(--color-orchid-soft);
		border-color: var(--color-orchid-soft);
	}
	.submit-btn:disabled {
		opacity: 0.4;
		cursor: default;
	}

	.feedback-row {
		display: flex;
		justify-content: center;
	}
	.feedback {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-weight: 700;
		padding: 12px 22px;
		border-radius: 999px;
		text-align: center;
		border: 1px solid var(--color-realm-line);
	}
	.correct-feedback {
		color: #ffffff;
		background: color-mix(in srgb, var(--color-orchid) 18%, var(--color-realm-bg));
		border-color: var(--color-orchid);
		box-shadow: 0 0 14px color-mix(in srgb, var(--color-orchid) 40%, transparent);
	}
	.wrong-feedback {
		color: color-mix(in srgb, white 75%, transparent);
		background: color-mix(in srgb, var(--color-realm-line) 30%, var(--color-realm-bg));
		border-color: var(--color-realm-line);
		box-shadow: none;
	}
	.wrong-feedback strong {
		color: #ffffff;
	}

	.damage-floater {
		position: absolute;
		top: -10px;
		right: 16px;
		font-family: var(--font-display);
		font-size: var(--text-title); /* 20px/700 — large-text-orchid ok for hit */
		font-weight: 700;
		animation: floatUp 1.2s ease-out forwards;
		pointer-events: none;
	}
	.damage-floater.hit {
		color: var(--color-orchid); /* 20px/700 large-text-orchid */
	}
	.damage-floater.miss {
		color: #ffffff;
	}
	@keyframes floatUp {
		0% {
			opacity: 1;
			transform: translateY(0);
		}
		100% {
			opacity: 0;
			transform: translateY(-40px);
		}
	}

	/* =============================== */
	/* RESULT                          */
	/* =============================== */
	.result-screen {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		padding-top: 24px;
		overflow: hidden;
	}
	.result-card {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		width: 100%;
		max-width: 420px;
		text-align: center;
	}
	.result-glow {
		position: absolute;
		top: 10%;
		left: 50%;
		transform: translateX(-50%);
		width: 300px;
		height: 300px;
		border-radius: 50%;
		filter: blur(60px);
		pointer-events: none;
	}
	.won-glow {
		background: var(--color-orchid);
		/* One-shot entrance only — no idle infinite loop */
		animation: resultGlowIn 0.5s ease-out both;
	}
	.lost-glow {
		background: var(--color-orchid);
		/* One-shot entrance only — no idle infinite loop */
		animation: resultGlowIn 0.5s ease-out both;
	}
	@keyframes resultGlowIn {
		from {
			opacity: 0;
			transform: translateX(-50%) scale(0.9);
		}
		to {
			opacity: calc(0.08 * var(--glow-multiplier, 1));
			transform: translateX(-50%) scale(1.1);
		}
	}
	.result-visual {
		position: relative; /* anchors the corner reactor */
		margin-bottom: 4px;
		z-index: 1;
		animation: resultVisualIn 0.5s ease-out;
	}
	@keyframes resultVisualIn {
		from {
			transform: scale(0.6);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}
	.result-sprite {
		height: 180px;
		width: auto;
		object-fit: contain;
	}
	.result-kuromi-reactor {
		position: absolute;
		bottom: -8px;
		right: -12px;
		pointer-events: none;
		line-height: 0;
		filter: drop-shadow(0 0 8px color-mix(in srgb, var(--color-orchid) 50%, transparent));
	}
	.result-boss-name {
		font-family: var(--font-display);
		font-size: 24px;
		font-weight: 700;
		letter-spacing: -0.02em;
		text-align: center;
		z-index: 1;
		color: #ffffff;
	}
	.result-stamp-wrap {
		position: relative;
		z-index: 1;
	}
	.result-stamp {
		font-family: var(--font-display);
		font-size: 32px;
		font-weight: 700;
		letter-spacing: -0.02em;
		padding: 10px 28px;
		border: 3px solid;
		border-radius: 16px;
		transform: rotate(-5deg);
		animation: stampIn 0.4s ease-out;
		z-index: 1;
		margin: 0;
	}
	.won-stamp {
		/* 32px/700 — large-text-orchid OK */
		color: var(--color-orchid);
		border-color: var(--color-orchid);
		background: color-mix(in srgb, var(--color-orchid) 18%, var(--color-realm-bg));
	}
	.lost-stamp {
		/* muted/grey loss language — quieter than won-stamp */
		color: #ffffff;
		border-color: var(--color-realm-line);
		background: color-mix(in srgb, var(--color-realm-line) 30%, var(--color-realm-bg));
	}
	@keyframes stampIn {
		from {
			transform: rotate(-5deg) scale(3);
			opacity: 0;
		}
		to {
			transform: rotate(-5deg) scale(1);
			opacity: 1;
		}
	}
	.result-doodle-spark {
		position: absolute;
		top: -10px;
		right: -18px;
		pointer-events: none;
		line-height: 0;
	}
	.result-doodle-stars {
		position: absolute;
		bottom: -6px;
		left: -16px;
		pointer-events: none;
		line-height: 0;
	}
	.result-doodle-swirl {
		position: absolute;
		top: -8px;
		right: -14px;
		pointer-events: none;
		line-height: 0;
	}
	.result-doodle-thoughts {
		position: absolute;
		bottom: -4px;
		left: -12px;
		pointer-events: none;
		line-height: 0;
	}
	.result-lp-chip {
		display: inline-flex;
		align-items: center;
		background: color-mix(in srgb, var(--color-realm-panel) 85%, transparent);
		border: 2px solid var(--color-orchid);
		border-radius: 999px;
		padding: 8px 20px;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-title); /* 20px/700 — large-text-orchid OK */
		color: var(--color-orchid);
		box-shadow: 0 0 14px color-mix(in srgb, var(--color-orchid) 35%, transparent);
	}
</style>
