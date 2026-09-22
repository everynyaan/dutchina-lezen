import { PREDICTIVE_YEAR, TRAINING_YEARS, practiceYears, yearStudied } from './mock';
import type { ReadingForkState } from './types';

export interface BookEntry {
	headword: string;
	gloss: string;
	gender?: 'de' | 'het';
	extra?: string;
	example?: string;
}

/** Sheet opens with no remembered word, on A. */
export function openedBook(): { letter: 'A'; headword: null } {
	return { letter: 'A', headword: null };
}

export function bookYearsFor(
	fork: Pick<ReadingForkState, 'satMocks' | 'eval' | 'misses'>,
	questionResults: Record<string, unknown>
): number[] {
	return practiceYears(
		fork.satMocks,
		yearStudied(
			PREDICTIVE_YEAR,
			questionResults,
			fork.eval.results,
			fork.misses.map((miss) => miss.questionId)
		)
	);
}

interface Row {
	years: readonly number[];
	entry: BookEntry;
}

function row(
	years: readonly number[],
	entry: Omit<BookEntry, 'example'> & { example?: string }
): Row {
	return {
		years,
		entry: {
			...entry,
			example:
				entry.example ?? `Noor schrijft het woord ${entry.headword} op een blauwe oefenkaart.`
		}
	};
}

/**
 * Headwords that occur in an open paper. `scholen` is the plural of school
 * (2024 and 2025); looking up geschoold does not find it.
 * 2023-only rows stay out until that paper is unsealed.
 */
const ROWS: readonly Row[] = [
	row([2024], {
		headword: 'abonnement',
		gender: 'het',
		extra: 'abonnementen',
		gloss: 'Je betaalt vooraf en mag daarna een periode iets gebruiken.'
	}),
	row([2023, 2024], {
		headword: 'aandacht',
		gender: 'de',
		gloss: 'Je let goed op iets en laat je niet afleiden.'
	}),
	row([2025], {
		headword: 'aanleiding',
		gender: 'de',
		gloss: 'De gebeurtenis waardoor iets begint.'
	}),
	row([2023, 2025], {
		headword: 'aanwezigheid',
		gender: 'de',
		gloss: 'Je bent er zelf, niet op een andere plek.'
	}),
	row([2025], {
		headword: 'advertentie',
		gender: 'de',
		extra: 'advertenties',
		gloss: 'Een korte tekst die iets wil verkopen of iemand zoekt.'
	}),
	row([2025], {
		headword: 'adviescentrum',
		gender: 'het',
		gloss: 'Een plek waar je om raad kunt vragen.'
	}),
	row([2024], {
		headword: 'afdeling',
		gender: 'de',
		extra: 'afdelingen',
		gloss: 'Een deel van een bedrijf met een eigen taak.'
	}),
	row([2025], {
		headword: 'alarmsignaal',
		gender: 'het',
		gloss: 'Een hard geluid dat gevaar meldt.'
	}),
	row([2024], {
		headword: 'arbeidsovereenkomst',
		gender: 'de',
		gloss: 'Een schriftelijke afspraak over je werk en je loon.'
	}),
	row([2024], {
		headword: 'autosport',
		gender: 'de',
		gloss: 'Rijden met racewagens als sport.'
	}),
	row([2024], {
		headword: 'bakkerij',
		gender: 'de',
		extra: 'bakkerijen',
		gloss: 'Een bedrijf dat brood en gebak maakt.'
	}),
	row([2025], {
		headword: 'belkaart',
		gender: 'de',
		gloss: 'Een kaart met telefoonnummers die bij een school horen.'
	}),
	row([2025], {
		headword: 'bedrijfshulpverlener',
		gender: 'de',
		gloss: 'Iemand op het werk die helpt bij brand of een ongeluk.'
	}),
	row([2024], {
		headword: 'beurs',
		gender: 'de',
		gloss: 'Een grote markt waar bedrijven hun spullen laten zien.'
	}),
	row([2025], {
		headword: 'bouwsector',
		gender: 'de',
		gloss: 'Alle bedrijven die huizen en gebouwen maken.'
	}),
	row([2023], {
		headword: 'boekhouder',
		gender: 'de',
		extra: 'boekhouders',
		gloss: 'Iemand die het geld van een bedrijf bijhoudt.'
	}),
	row([2023], {
		headword: 'buddyzorg',
		gender: 'de',
		gloss: 'Vrijwilligers die een maatje zijn voor iemand die hulp nodig heeft.'
	}),
	row([2025], {
		headword: 'calamiteit',
		gender: 'de',
		extra: 'calamiteiten',
		gloss: 'Een ernstig ongeluk of een brand.'
	}),
	row([2025], {
		headword: 'communicatiemiddel',
		gender: 'het',
		gloss: 'Iets waarmee mensen een boodschap doorgeven, zoals een telefoon.'
	}),
	row([2024], {
		headword: 'contract',
		gender: 'het',
		extra: 'contracten',
		gloss: 'Een afspraak op papier waar beide kanten zich aan houden.'
	}),
	row([2025], {
		headword: 'cursusgeld',
		gender: 'het',
		gloss: 'Geld dat je betaalt om lessen te volgen.'
	}),
	row([2024], {
		headword: 'diefstal',
		gender: 'de',
		gloss: 'Iemand neemt iets weg dat niet van hem is.'
	}),
	row([2024], {
		headword: 'discipline',
		gender: 'de',
		gloss: 'Je houdt je aan regels en geeft niet snel op.'
	}),
	row([2025], {
		headword: 'dienstrooster',
		gender: 'het',
		gloss: 'Een lijst die zegt wanneer je moet werken.'
	}),
	row([2023], {
		headword: 'dolfijn',
		gender: 'de',
		extra: 'dolfijnen',
		gloss: 'Een slim dier in zee dat met een blaasgat ademt.'
	}),
	row([2024], {
		headword: 'doorzettingsvermogen',
		gender: 'het',
		gloss: 'Je gaat door, ook als het moeilijk is.'
	}),
	row([2023], {
		headword: 'dyslexie',
		gender: 'de',
		gloss: 'Moeite met lezen en schrijven die niet van luiheid komt.'
	}),
	row([2025], {
		headword: 'endorfinen',
		gloss: 'Stoffen in je lijf die je rustiger kunnen maken.'
	}),
	row([2023], {
		headword: 'examenreglement',
		gender: 'het',
		gloss: 'De officiële regels voor hoe een examen verloopt.'
	}),
	row([2025], {
		headword: 'formulier',
		gender: 'het',
		extra: 'formulieren',
		gloss: 'Een papier met vakken die je invult.'
	}),
	row([2025], {
		headword: 'gelukshormonen',
		gloss: 'Stoffen in je lijf die een prettig gevoel geven.'
	}),
	row([2023], {
		headword: 'handwoordenboek',
		gender: 'het',
		gloss: 'Een klein boek met woorden en een korte uitleg, dat je in de hand houdt.'
	}),
	row([2023], {
		headword: 'herkansing',
		gender: 'de',
		extra: 'herkansingen',
		gloss: 'Een nieuwe kans om een toets te doen die je niet haalde.'
	}),
	row([2025], {
		headword: 'herstellen',
		extra: 'hersteld',
		gloss: 'Iets was kapot en je maakt het weer heel.'
	}),
	row([2023, 2024, 2025], {
		headword: 'informatie',
		gender: 'de',
		gloss: 'Feiten die je ergens leest of hoort.'
	}),
	row([2023, 2025], {
		headword: 'initiatief',
		gender: 'het',
		gloss: 'Je begint zelf, niemand hoeft je te duwen.'
	}),
	row([2025], {
		headword: 'instructeur',
		gender: 'de',
		gloss: 'Iemand die jou een vak leert, zoals autorijden.'
	}),
	row([2025], {
		headword: 'internet',
		gender: 'het',
		gloss: 'Het netwerk waarmee je op een computer feiten opzoekt.'
	}),
	row([2023, 2024], {
		headword: 'jongeren',
		gloss: 'Mensen die nog niet oud zijn.'
	}),
	row([2023, 2024], {
		headword: 'kwaliteit',
		gender: 'de',
		gloss: 'Hoe goed iets is gemaakt of gedaan.'
	}),
	row([2025], {
		headword: 'lestijden',
		gloss: 'De uren waarop lessen beginnen en eindigen.'
	}),
	row([2025], {
		headword: 'loopbaan',
		gender: 'de',
		gloss: 'Het pad van banen dat je in je leven volgt.'
	}),
	row([2024], {
		headword: 'maatregelen',
		gloss: 'Stappen die je neemt om een probleem kleiner te maken.'
	}),
	row([2023, 2024, 2025], {
		headword: 'medewerker',
		gender: 'de',
		extra: 'medewerkers',
		gloss: 'Iemand die bij een bedrijf werkt.'
	}),
	row([2025], {
		headword: 'noodsituatie',
		gender: 'de',
		gloss: 'Een moment waarop direct gevaar is.'
	}),
	row([2025], {
		headword: 'nooduitgang',
		gender: 'de',
		gloss: 'Een deur die je alleen gebruikt als je snel weg moet.'
	}),
	row([2023], {
		headword: 'notulen',
		gloss: 'Het verslag van wat er in een vergadering is gezegd.'
	}),
	row([2025], {
		headword: 'omscholing',
		gender: 'de',
		gloss: 'Je leert een ander beroep dan je eerst had.'
	}),
	row([2023], {
		headword: 'ondernemingsraad',
		gender: 'de',
		gloss: 'Een groep werknemers die met de directie over het bedrijf praat.'
	}),
	row([2024, 2025], {
		headword: 'ongeoorloofd',
		gloss: 'Niet toegestaan, zonder geldige reden.'
	}),
	row([2025], {
		headword: 'overuren',
		gloss: 'Uren die je werkt boven je normale rooster.'
	}),
	row([2025], {
		headword: 'overwerk',
		gender: 'het',
		gloss: 'Werk dat je doet buiten je gewone uren.'
	}),
	row([2025], {
		headword: 'pensioen',
		gender: 'het',
		gloss: 'Geld dat je krijgt als je stopt met werken omdat je ouder bent.'
	}),
	row([2025], {
		headword: 'personeelsadviseur',
		gender: 'de',
		gloss: 'Iemand die het bedrijf helpt met vragen over werknemers.'
	}),
	row([2025], {
		headword: 'plattegrond',
		gender: 'het',
		gloss: 'Een tekening van een gebouw of terrein van bovenaf.'
	}),
	row([2023], {
		headword: 'rekenmachine',
		gender: 'de',
		gloss: 'Een apparaat dat sommen voor je uitrekent.'
	}),
	row([2023, 2024, 2025], {
		headword: 'rekening',
		gender: 'de',
		gloss: 'Een bedrag dat je nog moet betalen, of een overzicht daarvan.'
	}),
	row([2025], {
		headword: 'reglement',
		gender: 'het',
		gloss: 'Een lijst met regels die ergens gelden.'
	}),
	row([2024], {
		headword: 'rijbewijs',
		gender: 'het',
		gloss: 'Het document dat zegt dat je een auto mag besturen.'
	}),
	row([2025], {
		headword: 'rijksoverheid',
		gender: 'de',
		gloss: 'De regering en de ministeries van het land.'
	}),
	row([2024], {
		headword: 'saucijzenbroodjes',
		gloss: 'Warm gebak met een rolletje gekruid vlees erin.'
	}),
	row([2024, 2025], {
		headword: 'scholen',
		gender: 'de',
		gloss: 'Gebouwen waar leerlingen les krijgen.'
	}),
	row([2023, 2024, 2025], {
		headword: 'school',
		gender: 'de',
		extra: 'scholen',
		gloss: 'Een gebouw waar je les krijgt.'
	}),
	row([2025], {
		headword: 'schooljaar',
		gender: 'het',
		gloss: 'De periode waarin de lessen van een jaar lopen.'
	}),
	row([2023, 2024, 2025], {
		headword: 'stage',
		gender: 'de',
		gloss: 'Werken bij een bedrijf om een vak te leren, naast je lessen.'
	}),
	row([2025], {
		headword: 'stagebedrijf',
		gender: 'het',
		gloss: 'Het bedrijf waar je stage loopt.'
	}),
	row([2025], {
		headword: 'stilzitter',
		gender: 'de',
		gloss: 'Iemand die blijft zitten en niets onderneemt.'
	}),
	row([2024, 2025], {
		headword: 'techniek',
		gender: 'de',
		gloss: 'Kennis over machines en hoe dingen werken.'
	}),
	row([2025], {
		headword: 'timmerman',
		gender: 'de',
		gloss: 'Iemand die van hout meubels, daken of kozijnen maakt.'
	}),
	row([2025], {
		headword: 'toegangspoortjes',
		gloss: 'Smalle poortjes waar je een pas moet scannen om binnen te komen.'
	}),
	row([2025], {
		headword: 'traanklieren',
		gloss: 'Kliertjes bij je ogen die vocht maken als je huilt.'
	}),
	row([2024], {
		headword: 'uitdaging',
		gender: 'de',
		extra: 'uitdagingen',
		gloss: 'Een moeilijke taak die je toch wilt halen.'
	}),
	row([2025], {
		headword: 'uitzonderingen',
		gloss: 'Gevallen waarin een regel niet geldt.'
	}),
	row([2025], {
		headword: 'veiligheid',
		gender: 'de',
		gloss: 'De toestand waarin je geen gevaar loopt.'
	}),
	row([2024, 2025], {
		headword: 'verzuim',
		gender: 'het',
		gloss: 'Je bent niet op je werk of op school terwijl je er wel moest zijn.'
	}),
	row([2025], {
		headword: 'visionpas',
		gender: 'de',
		gloss: 'Een pas waarmee de school ziet dat je binnen bent.'
	}),
	row([2024], {
		headword: 'voertaal',
		gender: 'de',
		gloss: 'De taal die mensen op een plek met elkaar spreken.'
	}),
	row([2023], {
		headword: 'vrijwilligerswerk',
		gender: 'het',
		gloss: 'Werk dat je doet zonder loon, omdat je wilt helpen.'
	}),
	row([2023, 2024, 2025], {
		headword: 'werkgever',
		gender: 'de',
		extra: 'werkgevers',
		gloss: 'De persoon of het bedrijf dat jou betaalt voor je werk.'
	}),
	row([2024], {
		headword: 'werknemer',
		gender: 'de',
		extra: 'werknemers',
		gloss: 'Iemand die voor een werkgever werkt.'
	}),
	row([2024], {
		headword: 'werkstress',
		gender: 'de',
		gloss: 'Spanning die je van je werk krijgt.'
	}),
	row([2025], {
		headword: 'whatsapp',
		gloss: 'Een dienst om korte berichten op je telefoon te sturen.'
	}),
	row([2025], {
		headword: 'whatsappgroep',
		gender: 'de',
		gloss: 'Een gesprek met meerdere mensen in een berichtenapp.'
	}),
	row([2024, 2025], {
		headword: 'zekerheid',
		gender: 'de',
		gloss: 'Je weet dat iets blijft, zoals vast werk of vast inkomen.'
	}),
	row([2023, 2024], {
		headword: 'ziekteverzuim',
		gender: 'het',
		gloss: 'Dagen waarop werknemers ziek thuisblijven.'
	}),
	row([2025], {
		headword: 'ziektewet',
		gender: 'de',
		gloss: 'Een regeling voor loon als je door ziekte niet kunt werken.'
	})
];

const DEFAULT_YEARS: readonly number[] = TRAINING_YEARS;

function visible(row: Row, years: readonly number[]): boolean {
	return row.years.some((year) => years.includes(year));
}

export function bookEntries(years: readonly number[] = DEFAULT_YEARS): BookEntry[] {
	return ROWS.filter((row) => visible(row, years)).map((row) => row.entry);
}

/** Headwords she can open while 2023 stays sealed. */
export const entries: BookEntry[] = bookEntries();

export function normalizeLookup(raw: string): string {
	return raw.toLowerCase().replace(/[^\p{L}]+/gu, '');
}

export function wordsForLetter(letter: string, years: readonly number[] = DEFAULT_YEARS): BookEntry[] {
	const initial = letter.toLocaleLowerCase('nl').charAt(0);
	return bookEntries(years)
		.filter((entry) => entry.headword.toLocaleLowerCase('nl').startsWith(initial))
		.sort((a, b) => a.headword.localeCompare(b.headword, 'nl'));
}

/** Exact headword after lowercasing and stripping punctuation. Does not stem. */
export function entryFor(headword: string, years: readonly number[] = DEFAULT_YEARS): BookEntry | null {
	const key = normalizeLookup(headword);
	if (!key) return null;
	return bookEntries(years).find((entry) => normalizeLookup(entry.headword) === key) ?? null;
}
