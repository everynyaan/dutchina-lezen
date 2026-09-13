import house from './svg/house.svg?raw';
import shuffle from './svg/shuffle.svg?raw';
import rectangleHistory from './svg/rectangle-history.svg?raw';
import bookOpenCover from './svg/book-open-cover.svg?raw';
import bookSparkles from './svg/book-sparkles.svg?raw';
import swords from './svg/swords.svg?raw';
import penLine from './svg/pen-line.svg?raw';
import mugSaucer from './svg/mug-saucer.svg?raw';
import listCheck from './svg/list-check.svg?raw';
import bullseye from './svg/bullseye.svg?raw';
import calendarCheck from './svg/calendar-check.svg?raw';
import fire from './svg/fire.svg?raw';
import crown from './svg/crown.svg?raw';
import bolt from './svg/bolt.svg?raw';
import headphones from './svg/headphones.svg?raw';
import xmark from './svg/xmark.svg?raw';
import chevronLeft from './svg/chevron-left.svg?raw';
import chevronRight from './svg/chevron-right.svg?raw';
import chevronDown from './svg/chevron-down.svg?raw';
import chevronUp from './svg/chevron-up.svg?raw';
import arrowRight from './svg/arrow-right.svg?raw';
import gear from './svg/gear.svg?raw';
import volumeHigh from './svg/volume-high.svg?raw';
import volumeSlash from './svg/volume-slash.svg?raw';
import play from './svg/play.svg?raw';
import pause from './svg/pause.svg?raw';
import rotateLeft from './svg/rotate-left.svg?raw';
import eye from './svg/eye.svg?raw';
import lock from './svg/lock.svg?raw';
import magnifyingGlass from './svg/magnifying-glass.svg?raw';
import trashCan from './svg/trash-can.svg?raw';
import check from './svg/check.svg?raw';
import expand from './svg/expand.svg?raw';
import cloudSlash from './svg/cloud-slash.svg?raw';
import download from './svg/download.svg?raw';

export type IconName =
	| 'house'
	| 'shuffle'
	| 'rectangle-history'
	| 'book-open-cover'
	| 'book-sparkles'
	| 'swords'
	| 'pen-line'
	| 'mug-saucer'
	| 'list-check'
	| 'bullseye'
	| 'calendar-check'
	| 'fire'
	| 'crown'
	| 'bolt'
	| 'headphones'
	| 'xmark'
	| 'chevron-left'
	| 'chevron-right'
	| 'chevron-down'
	| 'chevron-up'
	| 'arrow-right'
	| 'gear'
	| 'volume-high'
	| 'volume-slash'
	| 'play'
	| 'pause'
	| 'rotate-left'
	| 'eye'
	| 'lock'
	| 'magnifying-glass'
	| 'trash-can'
	| 'check'
	| 'expand'
	| 'cloud-slash'
	| 'download';

export const ICON_WEIGHT: Record<IconName, 'duotone' | 'light'> = {
	house: 'duotone',
	shuffle: 'duotone',
	'rectangle-history': 'duotone',
	'book-open-cover': 'duotone',
	'book-sparkles': 'duotone',
	swords: 'duotone',
	'pen-line': 'duotone',
	'mug-saucer': 'duotone',
	'list-check': 'duotone',
	bullseye: 'duotone',
	'calendar-check': 'duotone',
	fire: 'duotone',
	crown: 'duotone',
	bolt: 'duotone',
	headphones: 'duotone',
	xmark: 'light',
	'chevron-left': 'light',
	'chevron-right': 'light',
	'chevron-down': 'light',
	'chevron-up': 'light',
	'arrow-right': 'light',
	gear: 'light',
	'volume-high': 'light',
	'volume-slash': 'light',
	play: 'light',
	pause: 'light',
	'rotate-left': 'light',
	eye: 'light',
	lock: 'light',
	'magnifying-glass': 'light',
	'trash-can': 'light',
	check: 'light',
	expand: 'light',
	'cloud-slash': 'light',
	download: 'light'
};

/** Strip vendor <defs><style>...</style></defs> so inlined duotone SVGs do not leak global CSS. */
function stripDuotoneDefs(svg: string): string {
	return svg.replace(/<defs>\s*<style>[\s\S]*?<\/style>\s*<\/defs>/, '');
}

const rawByName: Record<IconName, string> = {
	house,
	shuffle,
	'rectangle-history': rectangleHistory,
	'book-open-cover': bookOpenCover,
	'book-sparkles': bookSparkles,
	swords,
	'pen-line': penLine,
	'mug-saucer': mugSaucer,
	'list-check': listCheck,
	bullseye,
	'calendar-check': calendarCheck,
	fire,
	crown,
	bolt,
	headphones,
	xmark,
	'chevron-left': chevronLeft,
	'chevron-right': chevronRight,
	'chevron-down': chevronDown,
	'chevron-up': chevronUp,
	'arrow-right': arrowRight,
	gear,
	'volume-high': volumeHigh,
	'volume-slash': volumeSlash,
	play,
	pause,
	'rotate-left': rotateLeft,
	eye,
	lock,
	'magnifying-glass': magnifyingGlass,
	'trash-can': trashCan,
	check,
	expand,
	'cloud-slash': cloudSlash,
	download
};

export const ICON_SVG: Record<IconName, string> = Object.fromEntries(
	(Object.keys(rawByName) as IconName[]).map((name) => [
		name,
		ICON_WEIGHT[name] === 'duotone' ? stripDuotoneDefs(rawByName[name]) : rawByName[name]
	])
) as Record<IconName, string>;
