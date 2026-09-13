// ============================================================
// DUTCHINA PARTICLE ENGINE v2
// Canvas-based celebration effects. Designed to make rank-ups
// feel like a casino jackpot, not a notification.
// ============================================================

export interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number;
	maxLife: number;
	size: number;
	color: string;
	type: 'circle' | 'rect' | 'star';
	rotation: number;
	rotationSpeed: number;
	gravity: number;
	friction: number;
	isShell?: boolean;
	burstColors?: string[];
	shellDelay?: number; // frames to wait before launching
}

export type EffectType = 'confetti' | 'fireworks' | 'sparkles' | 'coinBurst' | 'miniConfetti';

const CASINO_COLORS = [
	'#414a63', // lavender-deep
	'#d1678f', // rose-deep
	'#fec1b6', // peach
	'#7abcc4', // teal
	'#939fbc', // lavender
	'#f3a6ba', // rose
	'#3d3550', // ink
	'#e1e4ec' // lavender tint (28% mix over white)
];

const GOLD_COLORS = ['#9c4a37', '#d1678f', '#f3a6ba', '#fec1b6']; // peach-deep, rose-deep, rose, peach

function pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
	return min + Math.random() * (max - min);
}

// ============================================================
// CONFETTI: Big burst for tier-up. 80 spinning rectangles.
// ============================================================
function spawnConfetti(w: number, h: number): Particle[] {
	const p: Particle[] = [];
	const cx = w / 2;
	const cy = h * 0.38;

	for (let i = 0; i < 80; i++) {
		const angle = rand(0, Math.PI * 2);
		const speed = rand(4, 12);
		p.push({
			x: cx + rand(-40, 40),
			y: cy + rand(-20, 20),
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed - 5,
			life: 1,
			maxLife: 1,
			size: rand(5, 10),
			color: pick(CASINO_COLORS),
			type: 'rect',
			rotation: rand(0, Math.PI * 2),
			rotationSpeed: rand(-0.2, 0.2),
			gravity: 0.1,
			friction: 0.985
		});
	}
	return p;
}

// ============================================================
// MINI CONFETTI: Lighter version for missions. 30 pieces.
// ============================================================
function spawnMiniConfetti(w: number, h: number): Particle[] {
	const p: Particle[] = [];
	const cx = w / 2;
	const cy = h * 0.35;

	for (let i = 0; i < 30; i++) {
		const angle = rand(0, Math.PI * 2);
		const speed = rand(3, 7);
		p.push({
			x: cx + rand(-25, 25),
			y: cy + rand(-15, 15),
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed - 3,
			life: 1,
			maxLife: 1,
			size: rand(4, 7),
			color: pick(CASINO_COLORS),
			type: 'rect',
			rotation: rand(0, Math.PI * 2),
			rotationSpeed: rand(-0.15, 0.15),
			gravity: 0.08,
			friction: 0.98
		});
	}
	return p;
}

// ============================================================
// FIREWORKS: 7 shells per wave, staggered launches. Each burst
// is 60 particles + 15 trailing sparkles. Loops until dismissed.
// ============================================================
function spawnFireworks(w: number, h: number): Particle[] {
	const p: Particle[] = [];
	const shellCount = 7;

	for (let s = 0; s < shellCount; s++) {
		const targetX = w * rand(0.1, 0.9);
		const targetY = h * rand(0.08, 0.4);
		const startX = w * rand(0.2, 0.8);
		const colors = [pick(CASINO_COLORS), pick(CASINO_COLORS), pick(CASINO_COLORS)];

		const delay = Math.floor(s * 12 + rand(0, 6));

		p.push({
			x: startX,
			y: h + 10,
			vx: (targetX - startX) / 45,
			vy: -(h - targetY + 10) / 45,
			life: 1,
			maxLife: 1,
			size: 3,
			color: colors[0],
			type: 'circle',
			rotation: 0,
			rotationSpeed: 0,
			gravity: 0,
			friction: 1,
			isShell: true,
			burstColors: colors,
			shellDelay: delay
		});
	}
	return p;
}

function spawnBurst(x: number, y: number, colors: string[]): Particle[] {
	const p: Particle[] = [];
	const count = 60;

	for (let i = 0; i < count; i++) {
		const angle = (Math.PI * 2 * i) / count + rand(-0.2, 0.2);
		const speed = rand(1.5, 7);
		p.push({
			x,
			y,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			life: 1,
			maxLife: 1,
			size: rand(2, 5),
			color: pick(colors),
			type: 'circle',
			rotation: 0,
			rotationSpeed: 0,
			gravity: 0.04,
			friction: 0.975
		});
	}

	// Sparkle trail particles (stars that linger)
	for (let i = 0; i < 15; i++) {
		const angle = rand(0, Math.PI * 2);
		const speed = rand(0.5, 2.5);
		p.push({
			x: x + rand(-5, 5),
			y: y + rand(-5, 5),
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed - 0.5,
			life: 1,
			maxLife: 1,
			size: rand(2, 4),
			color: '#d1678f', // rose-deep
			type: 'star',
			rotation: rand(0, Math.PI),
			rotationSpeed: rand(-0.03, 0.03),
			gravity: 0.01,
			friction: 0.99
		});
	}

	return p;
}

// ============================================================
// SPARKLES: Floating stars for achievements. 25 pieces.
// ============================================================
function spawnSparkles(w: number, h: number): Particle[] {
	const p: Particle[] = [];
	const cx = w / 2;
	const cy = h * 0.35;

	for (let i = 0; i < 25; i++) {
		p.push({
			x: cx + rand(-80, 80),
			y: cy + rand(-50, 50),
			vx: rand(-0.5, 0.5),
			vy: rand(-1.2, -0.3),
			life: 1,
			maxLife: 1,
			size: rand(3, 6),
			color: pick(['#fec1b6', '#3d3550', '#414a63', '#939fbc']), // peach, ink, lavender-deep, lavender
			type: 'star',
			rotation: rand(0, Math.PI),
			rotationSpeed: rand(-0.04, 0.04),
			gravity: 0,
			friction: 0.995
		});
	}
	return p;
}

// ============================================================
// COIN BURST: Gold coins for LP events. 20 pieces.
// ============================================================
function spawnCoinBurst(w: number, h: number): Particle[] {
	const p: Particle[] = [];
	const cx = w / 2;
	const cy = h * 0.3;

	for (let i = 0; i < 20; i++) {
		const angle = rand(-Math.PI * 0.85, -Math.PI * 0.15);
		const speed = rand(4, 9);
		p.push({
			x: cx + rand(-25, 25),
			y: cy,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			life: 1,
			maxLife: 1,
			size: rand(5, 8),
			color: pick(GOLD_COLORS),
			type: 'circle',
			rotation: 0,
			rotationSpeed: 0,
			gravity: 0.12,
			friction: 0.975
		});
	}
	return p;
}

// ============================================================
// DRAW HELPERS
// ============================================================

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
	const spikes = 4;
	const outerR = size;
	const innerR = size * 0.35;
	ctx.beginPath();
	for (let i = 0; i < spikes * 2; i++) {
		const r = i % 2 === 0 ? outerR : innerR;
		const angle = (Math.PI * i) / spikes - Math.PI / 2;
		ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
	}
	ctx.closePath();
	ctx.fill();
}

// ============================================================
// ENGINE
// ============================================================

export interface ParticleEngine {
	fire: (effect: EffectType) => void;
	update: () => void;
	draw: (ctx: CanvasRenderingContext2D) => void;
	hasParticles: () => boolean;
	/** Returns burst positions from the last update, then clears them. */
	popBursts: () => { x: number; y: number }[];
}

export function createParticleEngine(w: number, h: number): ParticleEngine {
	const particles: Particle[] = [];
	let pendingBursts: { x: number; y: number; colors: string[] }[] = [];
	let recentBursts: { x: number; y: number }[] = [];

	function fire(effect: EffectType): void {
		switch (effect) {
			case 'confetti':
				particles.push(...spawnConfetti(w, h));
				break;
			case 'miniConfetti':
				particles.push(...spawnMiniConfetti(w, h));
				break;
			case 'fireworks':
				particles.push(...spawnFireworks(w, h));
				break;
			case 'sparkles':
				particles.push(...spawnSparkles(w, h));
				break;
			case 'coinBurst':
				particles.push(...spawnCoinBurst(w, h));
				break;
		}
	}

	function update(): void {
		// Process pending bursts, track them for audio
		recentBursts = [];
		for (const burst of pendingBursts) {
			particles.push(...spawnBurst(burst.x, burst.y, burst.colors));
			recentBursts.push({ x: burst.x, y: burst.y });
		}
		pendingBursts = [];

		for (let i = particles.length - 1; i >= 0; i--) {
			const p = particles[i];

			// Shell with delay: count down before launching
			if (p.isShell && p.shellDelay && p.shellDelay > 0) {
				p.shellDelay--;
				continue;
			}

			// Active shell: rise toward target, then burst
			if (p.isShell) {
				p.life -= 0.02;
				p.x += p.vx;
				p.y += p.vy;
				// Slow down as it rises
				p.vy *= 0.995;

				if (p.life <= 0 || p.vy > -0.5) {
					pendingBursts.push({
						x: p.x,
						y: p.y,
						colors: p.burstColors || CASINO_COLORS
					});
					particles.splice(i, 1);
				}
				continue;
			}

			// Normal particle physics
			p.vx *= p.friction;
			p.vy *= p.friction;
			p.vy += p.gravity;
			p.x += p.vx;
			p.y += p.vy;
			p.rotation += p.rotationSpeed;

			// Slower life drain for longer-lasting effects
			const lifeRate = p.type === 'star' ? 0.008 : 0.009;
			p.life -= lifeRate;

			if (p.life <= 0 || p.y > h + 30) {
				particles.splice(i, 1);
			}
		}
	}

	function draw(ctx: CanvasRenderingContext2D): void {
		for (const p of particles) {
			// Skip shells that haven't launched yet
			if (p.isShell && p.shellDelay && p.shellDelay > 0) continue;

			const alpha = Math.max(0, Math.min(1, p.life));
			ctx.globalAlpha = alpha;
			ctx.fillStyle = p.color;

			if (p.type === 'rect') {
				ctx.save();
				ctx.translate(p.x, p.y);
				ctx.rotate(p.rotation);
				ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.55);
				ctx.restore();
			} else if (p.type === 'star') {
				ctx.save();
				ctx.translate(p.x, p.y);
				ctx.rotate(p.rotation);
				drawStar(ctx, 0, 0, p.size);
				ctx.restore();
			} else {
				// Shell trail glow
				if (p.isShell) {
					ctx.shadowBlur = 12;
					ctx.shadowColor = p.color;
				}
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
				ctx.fill();
				if (p.isShell) {
					ctx.shadowBlur = 0;
				}
			}
		}
		ctx.globalAlpha = 1;
	}

	function hasParticles(): boolean {
		return particles.length > 0 || pendingBursts.length > 0;
	}

	function popBursts(): { x: number; y: number }[] {
		const bursts = recentBursts;
		recentBursts = [];
		return bursts;
	}

	return { fire, update, draw, hasParticles, popBursts };
}
