import { corpusBlob, type FormStat } from './bankCorpus';

export type LexPos =
	| 'noun'
	| 'verb'
	| 'adj'
	| 'adv'
	| 'prep'
	| 'conj'
	| 'pron'
	| 'det'
	| 'num'
	| 'name'
	| 'other'
	| 'expr';

export interface LexRecord {
	form: string;
	lemma: string;
	pos: LexPos;
	nl?: string;
	en?: string;
	head?: string;
	signal?: boolean;
}

interface Gloss {
	pos: LexPos;
	nl: string;
	en: string;
	head?: string;
}

const SIGNALS: Record<string, Gloss> = {
	omdat: { pos: 'conj', nl: 'geeft een reden in de zin', en: 'because' },
	want: { pos: 'conj', nl: 'geeft een reden in de zin', en: 'because' },
	doordat: { pos: 'conj', nl: 'geeft een reden in de zin', en: 'because' },
	daardoor: { pos: 'adv', nl: 'geeft een gevolg in de zin', en: 'therefore' },
	waardoor: { pos: 'adv', nl: 'geeft een gevolg in de zin', en: 'so that' },
	zodat: { pos: 'conj', nl: 'geeft een gevolg in de zin', en: 'so that' },
	daarom: { pos: 'adv', nl: 'geeft een gevolg in de zin', en: 'therefore' },
	dus: { pos: 'adv', nl: 'geeft een gevolg in de zin', en: 'so' },
	maar: { pos: 'conj', nl: 'geeft een tegenstelling in de zin', en: 'but' },
	echter: { pos: 'adv', nl: 'geeft een tegenstelling in de zin', en: 'however' },
	toch: { pos: 'adv', nl: 'geeft een tegenstelling in de zin', en: 'still' },
	hoewel: { pos: 'conj', nl: 'geeft een tegenstelling in de zin', en: 'although' },
	terwijl: { pos: 'conj', nl: 'geeft een tegenstelling in de zin', en: 'while' },
	ondanks: { pos: 'prep', nl: 'geeft een tegenstelling in de zin', en: 'despite' },
	bovendien: { pos: 'adv', nl: 'voegt een extra punt toe', en: 'moreover' },
	daarnaast: { pos: 'adv', nl: 'voegt een extra punt toe', en: 'also' },
	ook: { pos: 'adv', nl: 'voegt een extra punt toe', en: 'also' },
	als: { pos: 'conj', nl: 'geeft een voorwaarde in de zin', en: 'if' },
	tenzij: { pos: 'conj', nl: 'geeft een voorwaarde in de zin', en: 'unless' },
	mits: { pos: 'conj', nl: 'geeft een voorwaarde in de zin', en: 'provided' },
	behalve: { pos: 'prep', nl: 'haalt iets buiten de regel', en: 'except' },
	niet: { pos: 'adv', nl: 'maakt de zin ontkennend of beperkt', en: 'not' },
	geen: { pos: 'det', nl: 'maakt de zin ontkennend of beperkt', en: 'no' },
	nooit: { pos: 'adv', nl: 'maakt de zin ontkennend of beperkt', en: 'never' },
	alleen: { pos: 'adv', nl: 'beperkt wanneer of hoe ver iets gaat', en: 'only' },
	pas: { pos: 'adv', nl: 'beperkt wanneer of hoe ver iets gaat', en: 'only then' },
	al: { pos: 'adv', nl: 'beperkt wanneer of hoe ver iets gaat', en: 'already' },
	namelijk: { pos: 'adv', nl: 'geeft een uitleg bij de zin', en: 'namely' }
};

const CLOSED: Record<string, Gloss> = {
	de: { pos: 'det', nl: 'bepaald lidwoord bij mannelijke of vrouwelijke woorden', en: 'the' },
	het: { pos: 'det', nl: 'bepaald lidwoord bij onzijdige woorden', en: 'the' },
	een: { pos: 'det', nl: 'onbepaald lidwoord bij iets nieuws', en: 'a' },
	en: { pos: 'conj', nl: 'verbindt twee gelijke delen in de zin', en: 'and' },
	van: { pos: 'prep', nl: 'legt een bezit of herkomst vast', en: 'of' },
	je: { pos: 'pron', nl: 'wijst naar de persoon die luistert', en: 'you' },
	jij: { pos: 'pron', nl: 'wijst naar de persoon die luistert', en: 'you' },
	u: { pos: 'pron', nl: 'beleefde vorm voor de persoon die luistert', en: 'you' },
	in: { pos: 'prep', nl: 'legt een plek binnen iets vast', en: 'in' },
	of: { pos: 'conj', nl: 'legt een keuze tussen twee dingen', en: 'or' },
	te: { pos: 'prep', nl: 'staat voor een werkwoord of een doel', en: 'to' },
	met: { pos: 'prep', nl: 'in gezelschap van een persoon of een zaak', en: 'with' },
	dat: { pos: 'conj', nl: 'leidt een bijzin of een aanwijzing in', en: 'that' },
	op: { pos: 'prep', nl: 'boven een vlak of tijdens een genoemd moment', en: 'on' },
	voor: { pos: 'prep', nl: 'legt een doel of een plek vooraan vast', en: 'for' },
	bij: { pos: 'prep', nl: 'legt een plek dichtbij iets vast', en: 'at' },
	dan: { pos: 'adv', nl: 'vergelijkt of noemt een volgend moment', en: 'then' },
	om: { pos: 'prep', nl: 'noemt een doel of een tijdstip', en: 'for' },
	die: { pos: 'pron', nl: 'wijst terug naar een eerder woord', en: 'that' },
	aan: { pos: 'prep', nl: 'legt een richting of een ontvanger vast', en: 'to' },
	er: { pos: 'adv', nl: 'wijst naar een plek of vult de zin', en: 'there' },
	ze: { pos: 'pron', nl: 'wijst naar mensen of dingen al genoemd', en: 'they' },
	naar: { pos: 'prep', nl: 'legt een richting van beweging vast', en: 'to' },
	dit: { pos: 'pron', nl: 'wijst naar iets dichtbij in de tekst', en: 'this' },
	door: { pos: 'prep', nl: 'noemt de oorzaak of de weg', en: 'by' },
	over: { pos: 'prep', nl: 'noemt het onderwerp van de zin of de tekst', en: 'about' },
	meer: { pos: 'adv', nl: 'een grotere hoeveelheid dan eerder', en: 'more' },
	tijdens: { pos: 'prep', nl: 'op hetzelfde moment als iets anders', en: 'during' },
	wanneer: { pos: 'adv', nl: 'vraagt of noemt het moment', en: 'when' },
	zonder: { pos: 'prep', nl: 'zegt dat iets er niet bij is', en: 'without' },
	binnen: { pos: 'prep', nl: 'aan de binnenkant of voor een termijn', en: 'inside' },
	onder: { pos: 'prep', nl: 'lager dan iets of als deel van', en: 'under' },
	volgens: { pos: 'prep', nl: 'zoals iemand zegt of een bron meldt', en: 'according to' },
	tussen: { pos: 'prep', nl: 'in de ruimte of tijd middenin twee punten', en: 'between' },
	uit: { pos: 'prep', nl: 'vanaf de binnenkant naar buiten', en: 'from' },
	tot: { pos: 'prep', nl: 'noemt het einde van een periode of reeks', en: 'until' },
	na: { pos: 'prep', nl: 'later dan een moment dat al genoemd is', en: 'after' },
	zo: { pos: 'adv', nl: 'op deze manier of in deze mate', en: 'so' },
	wel: { pos: 'adv', nl: 'bevestigt iets tegenover een ontkenning', en: 'indeed' },
	nog: { pos: 'adv', nl: 'zegt dat iets blijft of erbij komt', en: 'still' },
	hier: { pos: 'adv', nl: 'op deze plek in de tekst of ruimte', en: 'here' },
	daar: { pos: 'adv', nl: 'op die plek, niet hier', en: 'there' },
	waar: { pos: 'adv', nl: 'vraagt of noemt een plek', en: 'where' },
	wat: { pos: 'pron', nl: 'vraagt of wijst naar een ding', en: 'what' },
	wie: { pos: 'pron', nl: 'vraagt of wijst naar een persoon', en: 'who' },
	hoe: { pos: 'adv', nl: 'vraagt naar de manier waarop', en: 'how' },
	waarom: { pos: 'adv', nl: 'vraagt naar de reden van iets', en: 'why' },
	welke: { pos: 'det', nl: 'vraagt welk exemplaar bedoeld is', en: 'which' },
	deze: { pos: 'det', nl: 'wijst naar iets dichtbij dat al genoemd is', en: 'this' },
	zelf: { pos: 'pron', nl: 'met nadruk op die persoon of die zaak', en: 'self' },
	zich: { pos: 'pron', nl: 'wijst terug naar het onderwerp van de zin', en: 'oneself' },
	zichzelf: { pos: 'pron', nl: 'nadruk op het onderwerp van de zin', en: 'itself' },
	mij: { pos: 'pron', nl: 'de spreker als voorwerp van de zin', en: 'me' },
	me: { pos: 'pron', nl: 'de spreker als voorwerp van de zin', en: 'me' },
	mijn: { pos: 'det', nl: 'iets dat bij de spreker hoort', en: 'my' },
	wij: { pos: 'pron', nl: 'de spreker samen met anderen', en: 'we' },
	we: { pos: 'pron', nl: 'de spreker samen met anderen', en: 'we' },
	ons: { pos: 'det', nl: 'iets dat bij de groep van de spreker hoort', en: 'our' },
	onze: { pos: 'det', nl: 'iets dat bij de groep van de spreker hoort', en: 'our' },
	hun: { pos: 'det', nl: 'iets dat bij een groep anderen hoort', en: 'their' },
	haar: { pos: 'det', nl: 'iets dat bij een vrouw of een zaak hoort', en: 'her' },
	zijn: { pos: 'verb', nl: 'bestaan of een eigenschap hebben', en: 'to be' },
	ik: { pos: 'pron', nl: 'de persoon die spreekt', en: 'I' },
	hij: { pos: 'pron', nl: 'een man of mannelijk woord al genoemd', en: 'he' },
	zij: { pos: 'pron', nl: 'een vrouw of een groep al genoemd', en: 'she' },
	hem: { pos: 'pron', nl: 'een man als voorwerp van de zin', en: 'him' },
	hen: { pos: 'pron', nl: 'een groep mensen als voorwerp', en: 'them' },
	men: { pos: 'pron', nl: 'mensen in het algemeen, niemand in het bijzonder', en: 'one' },
	iets: { pos: 'pron', nl: 'een ding dat niet verder genoemd wordt', en: 'something' },
	niets: { pos: 'pron', nl: 'geen enkel ding', en: 'nothing' },
	alles: { pos: 'pron', nl: 'alle dingen samen, zonder uitzondering', en: 'everything' },
	alle: { pos: 'det', nl: 'de hele groep, zonder uitzondering', en: 'all' },
	elke: { pos: 'det', nl: 'ieder exemplaar apart van de groep', en: 'every' },
	elk: { pos: 'det', nl: 'ieder exemplaar apart van de groep', en: 'each' },
	ieder: { pos: 'det', nl: 'elk exemplaar apart van de hele groep', en: 'each' },
	iedere: { pos: 'det', nl: 'ieder exemplaar apart van de groep', en: 'each' },
	veel: { pos: 'det', nl: 'een grote hoeveelheid van iets', en: 'many' },
	weinig: { pos: 'det', nl: 'een kleine hoeveelheid van iets', en: 'few' },
	sommige: { pos: 'det', nl: 'een deel van de groep, niet allemaal', en: 'some' },
	andere: { pos: 'adj', nl: 'niet dezelfde, een tweede soort', en: 'other' },
	ander: { pos: 'adj', nl: 'niet dezelfde, een tweede soort', en: 'other' },
	nieuwe: { pos: 'adj', nl: 'net begonnen of nog niet oud', en: 'new' },
	nieuw: { pos: 'adj', nl: 'net begonnen of nog niet oud', en: 'new' },
	goede: { pos: 'adj', nl: 'van voldoende of hoge kwaliteit', en: 'good' },
	goed: { pos: 'adj', nl: 'van voldoende of hoge kwaliteit', en: 'good' },
	grote: { pos: 'adj', nl: 'met veel omvang of belang', en: 'large' },
	groot: { pos: 'adj', nl: 'met veel omvang of belang', en: 'large' },
	kleine: { pos: 'adj', nl: 'met weinig omvang', en: 'small' },
	klein: { pos: 'adj', nl: 'met weinig omvang', en: 'small' },
	eerste: { pos: 'adj', nl: 'vooraan in een reeks of volgorde', en: 'first' },
	laatste: { pos: 'adj', nl: 'achteraan in een reeks of volgorde', en: 'last' },
	hele: { pos: 'adj', nl: 'compleet, zonder een deel weg te laten', en: 'whole' },
	heel: { pos: 'adv', nl: 'in sterke mate', en: 'very' },
	erg: { pos: 'adv', nl: 'in sterke mate', en: 'very' },
	altijd: { pos: 'adv', nl: 'op elk moment, zonder uitzondering', en: 'always' },
	soms: { pos: 'adv', nl: 'op sommige momenten, niet steeds', en: 'sometimes' },
	vaak: { pos: 'adv', nl: 'op veel momenten', en: 'often' },
	meestal: { pos: 'adv', nl: 'in de meeste gevallen', en: 'usually' },
	bijna: { pos: 'adv', nl: 'net niet helemaal, dicht bij het eind', en: 'almost' },
	ongeveer: { pos: 'adv', nl: 'niet precies, rond een getal of moment', en: 'about' },
	extra: { pos: 'adj', nl: 'erbij, boven op wat al nodig is', en: 'extra' },
	nodig: { pos: 'adj', nl: 'iets waar je niet zonder kunt', en: 'necessary' },
	mogelijk: { pos: 'adj', nl: 'iets dat kan gebeuren of kan', en: 'possible' },
	belangrijk: { pos: 'adj', nl: 'iets dat veel uitmaakt', en: 'important' },
	duidelijk: { pos: 'adj', nl: 'goed te zien of te begrijpen', en: 'clear' },
	steeds: { pos: 'adv', nl: 'elke keer weer, zonder stop', en: 'constantly' },
	eerst: { pos: 'adv', nl: 'voor de andere dingen', en: 'first' },
	daarna: { pos: 'adv', nl: 'op een later moment in de reeks', en: 'afterwards' },
	nu: { pos: 'adv', nl: 'op dit moment', en: 'now' },
	toen: { pos: 'adv', nl: 'op een moment in het verleden', en: 'then' },
	weer: { pos: 'adv', nl: 'nog een keer, zoals eerder', en: 'again' },
	even: { pos: 'adv', nl: 'voor een korte tijd', en: 'briefly' },
	snel: { pos: 'adj', nl: 'in weinig tijd', en: 'fast' },
	graag: { pos: 'adv', nl: 'met plezier of als wens', en: 'gladly' },
	misschien: { pos: 'adv', nl: 'het kan, maar het is niet zeker', en: 'maybe' },
	natuurlijk: { pos: 'adv', nl: 'zoals te verwachten is', en: 'of course' },
	bijvoorbeeld: { pos: 'adv', nl: 'een concreet geval bij een algemene zin', en: 'for example' },
	per: { pos: 'prep', nl: 'voor elk stuk van een groep of tijd', en: 'per' },
	vanaf: { pos: 'prep', nl: 'beginnend op een genoemd moment of punt', en: 'from' },
	sinds: { pos: 'prep', nl: 'vanaf een moment tot nu', en: 'since' },
	tegen: { pos: 'prep', nl: 'in de richting van of niet eens met', en: 'against' },
	achter: { pos: 'prep', nl: 'aan de andere kant, niet vooraan', en: 'behind' },
	naast: { pos: 'prep', nl: 'dichtbij, aan de zijkant van iets', en: 'beside' },
	rond: { pos: 'prep', nl: 'ongeveer een getal of in een kring', en: 'around' },
	via: { pos: 'prep', nl: 'langs een weg of door een middel', en: 'via' },
	zoals: { pos: 'conj', nl: 'op dezelfde manier als iets anders', en: 'like' },
	ja: { pos: 'other', nl: 'een bevestigend antwoord op een vraag', en: 'yes' },
	uw: { pos: 'det', nl: 'iets dat bij de aangesproken persoon hoort', en: 'your' },
	minder: { pos: 'det', nl: 'een kleinere hoeveelheid dan eerder genoemd', en: 'less' },
	één: { pos: 'det', nl: 'precies enkel exemplaar en niet meer dan dat', en: 'one' },
	af: { pos: 'adv', nl: 'weg van een plek of tot een einde', en: 'off' },
	mee: { pos: 'adv', nl: 'samen met een ander persoon of ding', en: 'along' },
	twee: { pos: 'det', nl: 'het getal na een, een paar', en: 'two' },
	vier: { pos: 'det', nl: 'het getal na drie', en: 'four' },
	vooral: { pos: 'adv', nl: 'meer dan de andere dingen in de zin', en: 'especially' },
	direct: { pos: 'adv', nl: 'meteen, zonder een wachttijd ertussen', en: 'right away' },
	samen: { pos: 'adv', nl: 'met elkaar en niet ieder apart', en: 'together' },
	iemand: { pos: 'pron', nl: 'een persoon die niet bij naam genoemd wordt', en: 'someone' },
	jouw: { pos: 'det', nl: 'iets dat bij de aangesproken persoon hoort', en: 'your' },
	beter: { pos: 'adj', nl: 'van hogere kwaliteit dan iets anders', en: 'better' },
	zwaar: { pos: 'adj', nl: 'met veel gewicht of met veel moeite', en: 'heavy' },
	eigen: { pos: 'adj', nl: 'van jou en niet van een ander', en: 'own' },
	lang: { pos: 'adj', nl: 'met een grote lengte of een lange duur', en: 'long' },
	ziek: { pos: 'adj', nl: 'niet gezond, met een aandoening', en: 'ill' },
	nee: { pos: 'other', nl: 'een ontkennend antwoord op een vraag', en: 'no' },
	juist: { pos: 'adj', nl: 'klopt of is correct op deze plek', en: 'right' },
	gewoon: { pos: 'adj', nl: 'normaal en niet bijzonder of extra', en: 'ordinary' },
	meteen: { pos: 'adv', nl: 'direct en zonder eerst te wachten', en: 'right away' },
	minimaal: { pos: 'adj', nl: 'het kleinste dat nog mag of nodig is', en: 'at least' },
	open: { pos: 'adj', nl: 'niet dicht, zodat je naar binnen kunt', en: 'open' },
	aanwezig: { pos: 'adj', nl: 'op de plek die de tekst noemt', en: 'present' },
	eerder: { pos: 'adv', nl: 'op een moment voor het huidige', en: 'earlier' },
	voordat: { pos: 'conj', nl: 'op een moment voor iets anders gebeurt', en: 'before' },
	vooraf: { pos: 'adv', nl: 'eerder dan de gebeurtenis zelf plaatsvindt', en: 'beforehand' },
	automatisch: { pos: 'adv', nl: 'vanzelf, zonder dat een persoon ingrijpt', en: 'automatically' },
	veilig: { pos: 'adj', nl: 'zonder gevaar voor mensen of spullen', en: 'safe' },
	or: { pos: 'other', nl: 'een Engels woord dat een keuze noemt', en: 'or' },
	volgende: { pos: 'adj', nl: 'het item dat na het huidige item komt', en: 'next' },
	"zo'n": { pos: 'det', nl: 'een onbepaald exemplaar van het volgende woord', en: 'such a' }
};

const VERBS: Record<string, Gloss> = {
	zijn: { pos: 'verb', nl: 'bestaan of een eigenschap hebben', en: 'to be' },
	hebben: { pos: 'verb', nl: 'iets bij je houden of al bezitten', en: 'to have' },
	worden: { pos: 'verb', nl: 'van toestand veranderen of passief zijn', en: 'to become' },
	kunnen: { pos: 'verb', nl: 'in staat zijn of mogen', en: 'can' },
	moeten: { pos: 'verb', nl: 'verplicht zijn om iets te doen', en: 'must' },
	mogen: { pos: 'verb', nl: 'toestemming hebben om iets te doen', en: 'may' },
	willen: { pos: 'verb', nl: 'iets graag doen of hebben', en: 'to want' },
	zullen: { pos: 'verb', nl: 'iets in de toekomst of als plan', en: 'will' },
	gaan: { pos: 'verb', nl: 'zich verplaatsen of iets beginnen', en: 'to go' },
	komen: { pos: 'verb', nl: 'naar een plek toe bewegen', en: 'to come' },
	doen: { pos: 'verb', nl: 'een handeling uitvoeren', en: 'to do' },
	maken: { pos: 'verb', nl: 'iets nieuws tot stand brengen', en: 'to make' },
	geven: { pos: 'verb', nl: 'iets aan een ander laten krijgen', en: 'to give' },
	nemen: { pos: 'verb', nl: 'iets pakken of een keuze maken', en: 'to take' },
	zien: { pos: 'verb', nl: 'met je ogen waarnemen', en: 'to see' },
	kijken: { pos: 'verb', nl: 'je ogen op iets richten', en: 'to look' },
	horen: { pos: 'verb', nl: 'met je oren waarnemen', en: 'to hear' },
	zeggen: { pos: 'verb', nl: 'woorden uitspreken tegen iemand', en: 'to say' },
	vragen: { pos: 'verb', nl: 'iemand om informatie of om hulp verzoeken', en: 'to ask' },
	weten: { pos: 'verb', nl: 'informatie in je hoofd hebben', en: 'to know' },
	denken: { pos: 'verb', nl: 'iets in je hoofd overwegen', en: 'to think' },
	vinden: { pos: 'verb', nl: 'iets tegenkomen of een mening hebben', en: 'to find' },
	blijven: { pos: 'verb', nl: 'op dezelfde plek of in dezelfde toestand', en: 'to stay' },
	staan: { pos: 'verb', nl: 'rechtop op een plek zijn', en: 'to stand' },
	zitten: { pos: 'verb', nl: 'op een stoel of plek neer zijn', en: 'to sit' },
	liggen: { pos: 'verb', nl: 'horizontaal ergens op rusten', en: 'to lie' },
	lopen: { pos: 'verb', nl: 'zich te voet verplaatsen', en: 'to walk' },
	werken: { pos: 'verb', nl: 'betaalde taken uitvoeren', en: 'to work' },
	leren: { pos: 'verb', nl: 'kennis of een vaardigheid opnemen', en: 'to learn' },
	lezen: { pos: 'verb', nl: 'geschreven tekst begrijpen', en: 'to read' },
	schrijven: { pos: 'verb', nl: 'woorden op papier of scherm zetten', en: 'to write' },
	bellen: { pos: 'verb', nl: 'iemand via de telefoon spreken', en: 'to call' },
	mailen: { pos: 'verb', nl: 'een bericht via e-mail sturen', en: 'to email' },
	sturen: { pos: 'verb', nl: 'iets of iemand ergens heen laten gaan', en: 'to send' },
	halen: { pos: 'verb', nl: 'iets gaan pakken of een niveau bereiken', en: 'to fetch' },
	zetten: { pos: 'verb', nl: 'iets op een plek plaatsen', en: 'to put' },
	leggen: { pos: 'verb', nl: 'iets horizontaal neerleggen', en: 'to lay' },
	houden: { pos: 'verb', nl: 'iets niet loslaten of organiseren', en: 'to hold' },
	laten: { pos: 'verb', nl: 'toestaan dat iemand anders iets doet', en: 'to let' },
	krijgen: { pos: 'verb', nl: 'iets ontvangen van een ander', en: 'to get' },
	betalen: { pos: 'verb', nl: 'geld geven voor iets', en: 'to pay' },
	kosten: { pos: 'verb', nl: 'een bepaald bedrag vragen', en: 'to cost' },
	helpen: { pos: 'verb', nl: 'iemand steunen bij een taak', en: 'to help' },
	gebruiken: { pos: 'verb', nl: 'iets inzetten voor een doel', en: 'to use' },
	volgen: { pos: 'verb', nl: 'achter iemand aan gaan of een cursus doen', en: 'to follow' },
	beginnen: { pos: 'verb', nl: 'met iets starten', en: 'to start' },
	stoppen: { pos: 'verb', nl: 'met iets ophouden', en: 'to stop' },
	kiezen: { pos: 'verb', nl: 'een optie uit meerdere pakken', en: 'to choose' },
	beslissen: { pos: 'verb', nl: 'een keuze vastleggen', en: 'to decide' },
	melden: { pos: 'verb', nl: 'iemand informeren over een feit', en: 'to report' },
	vertellen: { pos: 'verb', nl: 'een verhaal of uitleg geven', en: 'to tell' },
	uitleggen: { pos: 'verb', nl: 'iets begrijpelijk maken voor een ander', en: 'to explain' },
	afspreken: { pos: 'verb', nl: 'samen een moment of regel vastleggen', en: 'to agree' },
	aanvragen: { pos: 'verb', nl: 'officieel om iets vragen', en: 'to apply' },
	invullen: { pos: 'verb', nl: 'gegevens op een formulier zetten', en: 'to fill in' },
	opzoeken: { pos: 'verb', nl: 'informatie ergens gaan vinden', en: 'to look up' },
	controleren: { pos: 'verb', nl: 'nakijken of iets klopt', en: 'to check' },
	regelen: { pos: 'verb', nl: 'iets organiseren zodat het loopt', en: 'to arrange' },
	wonen: { pos: 'verb', nl: 'ergens je huis hebben', en: 'to live' },
	verhuizen: { pos: 'verb', nl: 'naar een ander huis gaan', en: 'to move' },
	wachten: { pos: 'verb', nl: 'blijven tot iets gebeurt', en: 'to wait' },
	proberen: { pos: 'verb', nl: 'een poging doen', en: 'to try' },
	lukken: { pos: 'verb', nl: 'goed aflopen of slagen', en: 'to succeed' },
	gebeuren: { pos: 'verb', nl: 'plaatsvinden, zonder dat iemand het plant', en: 'to happen' },
	bestaan: { pos: 'verb', nl: 'aanwezig zijn of uit losse delen opgebouwd zijn', en: 'to exist' },
	betekenen: { pos: 'verb', nl: 'een bepaalde zin of waarde hebben', en: 'to mean' },
	lijken: { pos: 'verb', nl: 'de indruk geven dat iets zo is', en: 'to seem' },
	voelen: { pos: 'verb', nl: 'een lichamelijke of emotionele gewaarwording hebben', en: 'to feel' },
	zoeken: { pos: 'verb', nl: 'proberen iets te vinden', en: 'to search' },
	sluiten: { pos: 'verb', nl: 'dichtmaken of een overeenkomst afronden', en: 'to close' },
	openen: { pos: 'verb', nl: 'openmaken of officieel starten', en: 'to open' },
	voorzien: { pos: 'verb', nl: 'geven wat iemand nodig heeft', en: 'to provide' },
	aanbieden: { pos: 'verb', nl: 'iets beschikbaar stellen aan een ander', en: 'to offer' },
	aanmelden: { pos: 'verb', nl: 'je officieel opgeven voor iets', en: 'to sign up' },
	afmelden: { pos: 'verb', nl: 'laten weten dat je niet komt', en: 'to cancel' },
	opstaan: { pos: 'verb', nl: 'uit bed of uit een stoel omhoog komen', en: 'to get up' },
	meedoen: { pos: 'verb', nl: 'samen met anderen ergens aan meewerken', en: 'to join in' },
	nakijken: { pos: 'verb', nl: 'controleren of iets klopt', en: 'to check' },
	doorlezen: { pos: 'verb', nl: 'een tekst van begin tot eind lezen', en: 'to read through' },
	huilen: { pos: 'verb', nl: 'tranen laten lopen uit verdriet of pijn', en: 'to cry' },
	hoeven: { pos: 'verb', nl: 'niet verplicht zijn om iets te doen', en: 'need to' },
	gelden: { pos: 'verb', nl: 'van toepassing zijn op dit geval', en: 'to apply' },
	informeren: { pos: 'verb', nl: 'iemand nieuws of een uitleg geven', en: 'to inform' },
	dienen: { pos: 'verb', nl: 'iets moeten doen volgens een regel', en: 'must do' }
};

const NOUNS: Record<string, [string, string, string?]> = {
	mens: ['een persoon', 'a person'],
	mensen: ['meer dan een persoon', 'people'],
	jaar: ['een periode van twaalf maanden', 'a year'],
	dag: ['een periode van vierentwintig uur', 'a day'],
	dagen: ['meer dan een etmaal', 'days'],
	week: ['een periode van zeven dagen', 'a week'],
	weken: ['meer dan een periode van zeven dagen', 'weeks'],
	uur: ['een periode van zestig minuten', 'an hour'],
	tijd: ['het verloop van momenten', 'time'],
	werk: ['betaalde taken of een baan', 'work'],
	baan: ['betaald werk bij een organisatie', 'a job'],
	school: ['een plek waar je leert', 'a school'],
	opleiding: ['een leertraject voor een beroep', 'a course'],
	cursus: ['een reeks lessen over een onderwerp', 'a course'],
	examen: ['een officiële toets aan het eind', 'an exam'],
	student: ['iemand die een opleiding volgt', 'a student'],
	leerling: ['iemand die op school leert', 'a pupil'],
	docent: ['iemand die lesgeeft', 'a teacher'],
	collega: ['iemand met wie je samenwerkt', 'a colleague'],
	werkgever: ['de organisatie of persoon die je betaalt', 'an employer'],
	medewerker: ['iemand die bij een organisatie werkt', 'an employee'],
	klant: ['iemand die iets koopt of afneemt', 'a customer'],
	gast: ['iemand die op bezoek komt', 'a guest'],
	kind: ['een jong persoon', 'a child'],
	kinderen: ['meer dan een jong persoon', 'children'],
	ouder: ['een vader of moeder', 'a parent'],
	geld: ['middel om te betalen', 'money'],
	kosten: ['het bedrag dat je moet betalen', 'costs'],
	prijs: ['het bedrag dat iets kost', 'a price'],
	euro: ['de munt waarmee je betaalt', 'euro'],
	abonnement: ['een vast contract voor een dienst', 'a subscription'],
	regel: ['een afspraak over wat mag of moet', 'a rule'],
	voorwaarde: ['iets dat eerst waar moet zijn', 'a condition'],
	reden: ['waarom iets gebeurt', 'a reason'],
	vraag: ['een zin waarmee je iets wilt weten', 'a question'],
	antwoord: ['wat je terugzegt op een vraag', 'an answer'],
	tekst: ['een stuk geschreven taal', 'a text'],
	zin: ['een groep woorden met een punt', 'a sentence'],
	woord: ['een klein stuk taal met een betekenis', 'a word'],
	brief: ['een geschreven bericht aan iemand', 'a letter'],
	bericht: ['een korte mededeling', 'a message'],
	afspraak: ['een vastgelegd moment of een regel', 'an appointment'],
	gesprek: ['praten tussen twee of meer mensen', 'a conversation'],
	informatie: ['feiten die je kunt gebruiken', 'information'],
	contact: ['verbinding met een ander persoon', 'contact'],
	hulp: ['steun bij een taak', 'help'],
	probleem: ['iets dat niet goed loopt', 'a problem'],
	oplossing: ['een manier om een probleem te stoppen', 'a solution'],
	situatie: ['de omstandigheden op een moment', 'a situation'],
	voorbeeld: ['een concreet geval bij een regel', 'an example'],
	groep: ['een aantal mensen of dingen samen', 'a group'],
	team: ['een groep die samen een taak doet', 'a team'],
	buurt: ['de omgeving rond je huis', 'a neighbourhood'],
	huis: ['het gebouw waar je woont', 'a house'],
	ruimte: ['een kamer of beschikbare plek', 'a room'],
	stad: ['een grote plaats met veel inwoners', 'a city'],
	land: ['een staat of het platteland', 'a country'],
	straat: ['een weg tussen huizen', 'a street'],
	water: ['de vloeistof die je drinkt', 'water'],
	zorg: ['hulp bij gezondheid of welzijn', 'care'],
	arts: ['iemand die zieken behandelt', 'a doctor'],
	sport: ['lichaamsbeweging volgens regels', 'sport'],
	fiets: ['een voertuig met twee wielen', 'a bike'],
	auto: ['een motorvoertuig op de weg', 'a car'],
	trein: ['een voertuig op rails', 'a train'],
	boek: ['een gebonden set bladzijden om te lezen', 'a book'],
	taal: ['het systeem van woorden van een land', 'a language'],
	plan: ['een voorgenomen reeks stappen', 'a plan'],
	recht: ['wat je volgens de regels mag', 'a right'],
	plicht: ['wat je volgens de regels moet', 'a duty'],
	dienst: ['werk dat je voor een ander doet', 'a service'],
	formulier: ['een papier of scherm met velden', 'a form'],
	aanvraag: ['een officieel verzoek', 'an application'],
	besluit: ['een vastgelegde keuze', 'a decision'],
	beleid: ['de vaste lijn van een organisatie', 'a policy'],
	wet: ['een officiële regel van de overheid', 'a law'],
	pas: ['een kaart die toegang of identiteit geeft', 'a pass'],
	kaart: ['een klein document of een plattegrond', 'a card'],
	nummer: ['een getal dat iets aanwijst', 'a number'],
	naam: ['het woord waarmee iemand of iets heet', 'a name'],
	adres: ['de plek waar iemand woont of werkt', 'an address'],
	mail: ['een bericht via de computer', 'an email'],
	telefoon: ['een apparaat om iemand te bellen', 'a phone'],
	internet: ['het netwerk voor digitale informatie', 'the internet'],
	website: ['een verzameling pagina’s op internet', 'a website'],
	afval: ['spullen die je weggooit', 'waste'],
	spullen: ['dingen die je gebruikt of bezit', 'things'],
	kantoor: ['de plek waar administratief werk gebeurt', 'an office'],
	vergadering: ['een bijeenkomst om iets te bespreken', 'a meeting'],
	pauze: ['een korte stop tijdens werk of les', 'a break'],
	vakantie: ['een periode vrij van werk of school', 'a holiday'],
	ziekte: ['een aandoening waardoor je niet gezond bent', 'an illness'],
	verzuim: ['niet komen terwijl je wel moet komen', 'absence'],
	gezondheid: ['de toestand van je lichaam', 'health'],
	onderzoek: ['een systematische zoektocht naar feiten', 'research'],
	resultaat: ['wat er uit een actie komt', 'a result'],
	doel: ['wat je wilt bereiken', 'a goal'],
	mening: ['wat iemand persoonlijk vindt', 'an opinion'],
	feit: ['iets dat vaststaat', 'a fact'],
	kans: ['een mogelijkheid dat iets lukt', 'a chance'],
	keuze: ['wat je kiest uit meerdere opties', 'a choice'],
	moment: ['een kort punt in de tijd', 'a moment'],
	periode: ['een aaneengesloten stuk tijd', 'a period'],
	bedrag: ['een som geld', 'an amount'],
	korting: ['een lager bedrag dan de normale prijs', 'a discount'],
	huur: ['geld voor het gebruik van een huis', 'rent'],
	contract: ['een schriftelijke afspraak die bindt', 'a contract'],
	taak: ['werk dat iemand moet doen', 'a task'],
	functie: ['een rol of baan binnen een organisatie', 'a role'],
	leiding: ['de mensen die sturen, of een buis', 'management'],
	beheerder: ['iemand die iets beheert of administreert', 'an admin'],
	bewoner: ['iemand die ergens woont', 'a resident'],
	buurtgenoot: ['iemand uit dezelfde buurt', 'a neighbour'],
	politie: ['de dienst die de openbare orde bewaakt', 'the police'],
	overheid: ['de staat en haar diensten', 'the government'],
	bedrijf: ['een organisatie die producten of diensten levert', 'a company'],
	organisatie: ['een groep mensen met een gezamenlijk doel', 'an organisation'],
	instelling: ['een officiële organisatie met een taak', 'an institution'],
	sector: ['een deel van de economie of samenleving', 'a sector'],
	beroep: ['het werk waarvoor je bent opgeleid', 'a profession'],
	ervaring: ['wat je al hebt meegemaakt of gedaan', 'experience'],
	kennis: ['wat je weet', 'knowledge'],
	vaardigheid: ['iets dat je kunt doen', 'a skill'],
	niveau: ['de hoogte of de moeilijkheidsgraad', 'a level'],
	eis: ['iets dat verplicht is', 'a requirement'],
	grens: ['de lijn waar iets ophoudt', 'a limit'],
	gevaar: ['iets dat schade kan doen', 'a danger'],
	veiligheid: ['de toestand zonder gevaar', 'safety'],
	privacy: ['het recht om persoonlijke zaken af te schermen', 'privacy'],
	ruzie: ['een boos conflict tussen mensen', 'a quarrel'],
	irritatie: ['lichte boosheid over iets', 'irritation'],
	gevoel: ['een emotie of lichamelijke gewaarwording', 'a feeling'],
	lichaam: ['het fysieke geheel van een mens', 'a body'],
	hoofd: ['het bovenste deel van het lichaam', 'a head'],
	hand: ['het deel van de arm waarmee je pakt', 'a hand'],
	oog: ['het deel waarmee je ziet', 'an eye'],
	man: ['een volwassen mannelijk persoon', 'a man'],
	vrouw: ['een volwassen vrouwelijk persoon', 'a woman'],
	jongere: ['een jonge persoon, vaak nog geen volwassene', 'a young person'],
	volwassene: ['iemand die niet meer een kind is', 'an adult'],
	punt: ['een specifiek onderwerp of een stip', 'a point'],
	plek: ['een plaats waar iets of iemand is', 'a place'],
	plaats: ['een plek of een woonkern', 'a place'],
	deel: ['een stuk van een groter geheel', 'a part'],
	stap: ['een beweging of een fase in een proces', 'a step'],
	lijn: ['een lange smalle vorm of een vaste koers', 'a line'],
	soort: ['een type binnen een grotere groep', 'a kind'],
	zaak: ['een ding of een officiële kwestie', 'a matter'],
	wereld: ['de aarde of een groot domein van het leven', 'the world'],
	leven: ['het bestaan van een mens of een dier', 'a life'],
	wijk: ['een deel van een stad of een dorp', 'a district'],
	lid: ['iemand die bij een groep hoort', 'a member'],
	burger: ['een inwoner met rechten en plichten', 'a citizen'],
	pagina: ['een bladzijde van een tekst of site', 'a page'],
	les: ['een bijeenkomst waarin iemand iets leert', 'a lesson'],
	toets: ['een korte controle van kennis', 'a test'],
	cijfer: ['een getal dat een resultaat aangeeft', 'a grade'],
	diploma: ['een bewijs dat je een opleiding hebt gehaald', 'a diploma'],
	sollicitatie: ['een verzoek om een baan te krijgen', 'an application'],
	vacature: ['een open plek voor een nieuwe werknemer', 'a vacancy'],
	salaris: ['het geld dat je voor werk ontvangt', 'a salary'],
	rooster: ['een schema van tijden en taken', 'a schedule'],
	kandidaat: ['iemand die meedoet aan een selectie of toets', 'a candidate'],
	lezer: ['iemand die een tekst leest', 'a reader'],
	gebruik: ['het inzetten van iets voor een doel', 'use'],
	keer: ['een moment waarop iets gebeurt', 'a time'],
	kamer: ['een ruimte in een huis of een gebouw', 'a room'],
	buddy: ['een vaste persoon die jou helpt', 'a buddy'],
	leidinggevende: ['iemand die het werk van anderen stuurt', 'a manager'],
	werknemer: ['iemand die in loondienst werkt', 'an employee'],
	'buurt-whatsapp': ['een app-groep van mensen uit dezelfde buurt', 'a neighbourhood chat'],
	advies: ['een tip over wat je het beste kunt doen', 'advice'],
	geluid: ['wat je met je oren kunt horen', 'sound'],
	verschil: ['wat twee dingen niet hetzelfde maakt', 'a difference'],
	klacht: ['een melding dat iets niet in orde is', 'a complaint'],
	stand: ['de huidige toestand of een behaalde score', 'a standing'],
	begin: ['het startpunt van een tekst of een plan', 'a start'],
	minuut: ['een periode van zestig seconden', 'a minute'],
	bezoeker: ['iemand die ergens op bezoek komt', 'a visitor'],
	autosportklas: ['een schoolgroep die zich met autosport bezighoudt', 'a racing class', 'klas'],
	maand: ['een periode van ongeveer dertig dagen', 'a month'],
	service: ['hulp of bediening voor een klant', 'service'],
	servicebalie: ['de balie waar je hulp of informatie vraagt', 'a service desk', 'balie'],
	bakkerij: ['een winkel waar brood en gebak worden gemaakt', 'a bakery'],
	onderdeel: ['een stuk van een groter geheel', 'a part'],
	ruil: ['het omwisselen van iets voor iets anders', 'an exchange'],
	timmerman: ['iemand die van hout meubels of gebouwen maakt', 'a carpenter'],
	bouwsector: ['het deel van de economie dat gebouwen maakt', 'construction']
};

const IRREG: Record<string, string> = {
	is: 'zijn',
	ben: 'zijn',
	bent: 'zijn',
	was: 'zijn',
	waren: 'zijn',
	geweest: 'zijn',
	heeft: 'hebben',
	heb: 'hebben',
	had: 'hebben',
	hadden: 'hebben',
	gehad: 'hebben',
	wordt: 'worden',
	werd: 'worden',
	werden: 'worden',
	geworden: 'worden',
	kan: 'kunnen',
	kon: 'kunnen',
	konden: 'kunnen',
	gekund: 'kunnen',
	kunt: 'kunnen',
	kun: 'kunnen',
	hebt: 'hebben',
	maakt: 'maken',
	gemaakt: 'maken',
	hoeft: 'hoeven',
	geldt: 'gelden',
	uren: 'uur',
	minuten: 'minuut',
	bezoekers: 'bezoeker',
	gebeurt: 'gebeuren',
	hoort: 'horen',
	dient: 'dienen',
	ga: 'gaan',
	zet: 'zetten',
	geluid: 'geluid',
	gewone: 'gewoon',
	maanden: 'maand',
	onderdelen: 'onderdeel',
	vóór: 'voor',
	moet: 'moeten',
	moest: 'moeten',
	moesten: 'moeten',
	mag: 'mogen',
	mocht: 'mogen',
	mochten: 'mogen',
	wil: 'willen',
	wou: 'willen',
	wilde: 'willen',
	wilden: 'willen',
	zal: 'zullen',
	zou: 'zullen',
	zouden: 'zullen',
	gaat: 'gaan',
	ging: 'gaan',
	gingen: 'gaan',
	gegaan: 'gaan',
	komt: 'komen',
	kwam: 'komen',
	kwamen: 'komen',
	gekomen: 'komen',
	doet: 'doen',
	deed: 'doen',
	deden: 'doen',
	gedaan: 'doen',
	geeft: 'geven',
	gaf: 'geven',
	gaven: 'geven',
	gegeven: 'geven',
	ziet: 'zien',
	zag: 'zien',
	zagen: 'zien',
	gezien: 'zien',
	neemt: 'nemen',
	nam: 'nemen',
	namen: 'nemen',
	genomen: 'nemen',
	loopt: 'lopen',
	liep: 'lopen',
	liepen: 'lopen',
	gelopen: 'lopen',
	kijkt: 'kijken',
	keek: 'kijken',
	gekeken: 'kijken',
	zegt: 'zeggen',
	zei: 'zeggen',
	gezegd: 'zeggen',
	vraagt: 'vragen',
	gevraagd: 'vragen',
	weet: 'weten',
	wist: 'weten',
	geweten: 'weten',
	vindt: 'vinden',
	vond: 'vinden',
	gevonden: 'vinden',
	blijft: 'blijven',
	bleef: 'blijven',
	gebleven: 'blijven',
	staat: 'staan',
	stond: 'staan',
	gestaan: 'staan',
	zit: 'zitten',
	zat: 'zitten',
	gezeten: 'zitten',
	ligt: 'liggen',
	lag: 'liggen',
	gelegen: 'liggen',
	werkt: 'werken',
	gewerkt: 'werken',
	leest: 'lezen',
	las: 'lezen',
	gelezen: 'lezen',
	schrijft: 'schrijven',
	schreef: 'schrijven',
	geschreven: 'schrijven',
	krijgt: 'krijgen',
	kreeg: 'krijgen',
	gekregen: 'krijgen',
	houdt: 'houden',
	hield: 'houden',
	gehouden: 'houden',
	laat: 'laten',
	liet: 'laten',
	gelaten: 'laten',
	slaat: 'slaan',
	sloeg: 'slaan',
	geslagen: 'slaan',
	eet: 'eten',
	at: 'eten',
	gegeten: 'eten',
	drinkt: 'drinken',
	dronk: 'drinken',
	gedronken: 'drinken',
	slaapt: 'slapen',
	sliep: 'slapen',
	geslapen: 'slapen'
};

const EXPRESSIONS: [string, string, string][] = [
	['in de knel komen', 'in een lastige situatie raken zonder uitweg', 'get stuck'],
	['in de knel', 'vastzitten in een lastige situatie', 'in trouble'],
	['voorzien in een behoefte', 'geven wat iemand nodig heeft', 'provide for'],
	['voorzien in', 'geven wat nodig is aan iemand', 'provide for'],
	['op zichzelf', 'liever met weinig contact met anderen', 'by yourself']
];

const TEMPLATES: Record<string, string[]> = {
	noun: [
		'een persoon of een zaak uit het gewone leven',
		'iets dat je in het dagelijks leven tegenkomt'
	],
	verb: [
		'iets doen of laten gebeuren in deze situatie',
		'een handeling die iemand in de tekst uitvoert'
	],
	adj: ['een eigenschap van een persoon of een zaak', 'zegt hoe een persoon of een zaak is'],
	adv: ['zegt hoe of wanneer iets in de zin gebeurt', 'een bepaling van manier of tijd'],
	prep: [
		'legt een relatie tussen twee delen van de zin',
		'verbindt een woord met een plek of tijd'
	],
	conj: ['verbindt delen van de zin met elkaar', 'koppelt twee zinnen of woordgroepen'],
	pron: [
		'wijst naar een persoon of een zaak in de tekst',
		'staat in de plaats van een eerder woord'
	],
	det: [
		'staat bij een zelfstandig naamwoord en wijst het aan',
		'bepaalt welk exemplaar bedoeld is'
	],
	other: [
		'een klein woord met een rol in deze zin',
		'helpt de zin lopen zonder zelf een zaak te noemen'
	],
	expr: [
		'een vaste woordgroep met een eigen betekenis',
		'betekent iets anders dan de losse woorden'
	]
};

const EN_FOR: Record<string, string> = {
	noun: 'a thing',
	verb: 'to do',
	adj: 'a trait',
	adv: 'how',
	prep: 'a link',
	conj: 'a link',
	pron: 'someone',
	det: 'a word',
	other: 'a word',
	expr: 'a phrase',
	name: 'a name',
	num: 'a number'
};

function wordCount(value: string): number {
	return value.trim().split(/\s+/).filter(Boolean).length;
}

function containsLemma(nl: string, lemma: string): boolean {
	const escaped = lemma.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return new RegExp(`(?:^|[^\\p{L}\\p{N}])${escaped}(?:$|[^\\p{L}\\p{N}])`, 'iu').test(nl);
}

function clean(value: string): string {
	return value.replaceAll('—', ' ').replaceAll('–', ' ').replace(/\s+/g, ' ').trim();
}

function glossOk(nl: string, en: string, lemma: string): boolean {
	const n = wordCount(nl);
	const e = wordCount(en);
	return (
		n >= 5 &&
		n < 16 &&
		e >= 1 &&
		e <= 3 &&
		!containsLemma(nl, lemma) &&
		!nl.includes('—') &&
		!nl.includes('–') &&
		!en.includes('—')
	);
}

function pickTemplate(pos: LexPos, lemma: string): Gloss {
	const list = TEMPLATES[pos] ?? TEMPLATES.other;
	for (const nl of list) {
		const en = EN_FOR[pos] ?? 'a word';
		if (glossOk(nl, en, lemma)) return { pos, nl, en };
	}
	const fallback = 'betekenis die bij de context van de tekst past';
	if (glossOk(fallback, 'a word', lemma)) return { pos: 'other', nl: fallback, en: 'a word' };
	return { pos: 'other', nl: 'rol van dit teken binnen de geschreven zin', en: 'a word' };
}

function nounEntry(key: string): Gloss | null {
	const row = NOUNS[key];
	if (!row) return null;
	return { pos: 'noun', nl: row[0], en: row[1], head: row[2] };
}

function padNl(nl: string, lemma: string): string {
	let next = clean(nl);
	const pads = ['in deze context', 'voor de lezer'];
	for (const pad of pads) {
		if (wordCount(next) >= 5) break;
		if (containsLemma(pad, lemma)) continue;
		next = clean(`${next} ${pad}`);
	}
	return next;
}

function knownGloss(lemma: string): Gloss | null {
	const raw = SIGNALS[lemma]
		? { ...SIGNALS[lemma] }
		: VERBS[lemma]
			? { ...VERBS[lemma] }
			: CLOSED[lemma]
				? { ...CLOSED[lemma] }
				: nounEntry(lemma);
	if (!raw) return null;
	return { ...raw, nl: padNl(raw.nl, lemma), en: clean(raw.en) };
}

const NOUN_SUFFIXES: [string, string, string][] = [
	['heden', 'een eigenschap of een toestand van iets', 'a quality'],
	['ingen', 'een handeling of het resultaat daarvan', 'an action'],
	['aties', 'een proces of een officiële stap', 'a process'],
	['ties', 'een proces of een officiële stap', 'a process'],
	['heid', 'een eigenschap of een toestand van iets', 'a quality'],
	['ing', 'een handeling of het resultaat daarvan', 'an action'],
	['atie', 'een proces of een officiële stap', 'a process'],
	['tie', 'een proces of een officiële stap', 'a process'],
	['schap', 'een groep mensen of een vaste toestand', 'a group'],
	['lijk', 'een eigenschap die bij het grondwoord past', 'a trait'],
	['baar', 'mogelijk om te doen of om te ondergaan', 'possible'],
	['ster', 'iemand die een rol of een taak heeft', 'a person'],
	['aar', 'iemand die een rol of een taak heeft', 'a person']
];

function suffixGloss(lemma: string): Gloss | null {
	for (const [suffix, nl, en] of NOUN_SUFFIXES) {
		if (!lemma.endsWith(suffix) || lemma.length < suffix.length + 3) continue;
		const pos: LexPos = suffix === 'lijk' || suffix === 'baar' ? 'adj' : 'noun';
		if (!glossOk(nl, en, lemma)) continue;
		return { pos, nl, en };
	}
	if (
		lemma.endsWith('er') &&
		lemma.length > 6 &&
		glossOk('iemand die een rol of een taak heeft', 'a person', lemma)
	) {
		return { pos: 'noun', nl: 'iemand die een rol of een taak heeft', en: 'a person' };
	}
	if (
		(lemma.endsWith('je') || lemma.endsWith('tje') || lemma.endsWith('pje')) &&
		lemma.length > 4 &&
		glossOk('een klein of informeel exemplaar van iets', 'a small one', lemma)
	) {
		return { pos: 'noun', nl: 'een klein of informeel exemplaar van iets', en: 'a small one' };
	}
	return null;
}

function hasNounShape(form: string): boolean {
	return NOUN_SUFFIXES.some(
		([suffix]) => form.endsWith(suffix) && form.length >= suffix.length + 3
	);
}

function headOf(lemma: string): { head: string; gloss: Gloss } | null {
	const keys = Object.keys(NOUNS).sort((a, b) => b.length - a.length);
	for (const head of keys) {
		if (head.length < 4) continue;
		if (lemma.length <= head.length) continue;
		if (!lemma.endsWith(head)) continue;
		const gloss = nounEntry(head);
		if (!gloss) continue;
		const padded = padNl(gloss.nl, lemma);
		if (!glossOk(padded, gloss.en, lemma)) continue;
		return { head, gloss: { ...gloss, nl: padded, head } };
	}
	return null;
}

const SEP_PREFIX = [
	'achter',
	'binnen',
	'buiten',
	'tegen',
	'terug',
	'boven',
	'onder',
	'over',
	'door',
	'voor',
	'weer',
	'aan',
	'af',
	'bij',
	'mee',
	'na',
	'om',
	'op',
	'uit',
	'toe',
	'in'
];

function participleLemma(form: string, forms: Set<string>): string | null {
	let body = form;
	let prefix = '';
	for (const sep of SEP_PREFIX) {
		if (form.startsWith(`${sep}ge`) && form.length > sep.length + 4) {
			prefix = sep;
			body = form.slice(sep.length);
			break;
		}
	}
	if (!body.startsWith('ge') || body.length < 5) return null;
	if (!/[dt]$/.test(body) && !body.endsWith('en')) return null;
	const stem = body.slice(2).replace(/(en|d|t)$/, '');
	for (const inf of [`${prefix}${stem}en`, `${prefix}${stem}n`, `${stem}en`]) {
		if (forms.has(inf) || knownGloss(inf)) return IRREG[inf] ?? inf;
	}
	if (stem.length > 2) return `${prefix}${stem}en`;
	return null;
}

function lemmatize(form: string, forms: Set<string>): string {
	if (IRREG[form]) return IRREG[form];
	if (knownGloss(form)) return form;
	const part = participleLemma(form, forms);
	if (part) return part;
	if (form.endsWith('dt') && form.length > 4) {
		const inf = `${form.slice(0, -1)}en`;
		return IRREG[inf] ?? inf;
	}
	if (form.endsWith('en') && form.length > 5) {
		const stem = form.slice(0, -2);
		const stemE = `${stem}e`;
		if (knownGloss(stemE)) return stemE;
		if (knownGloss(stem) || hasNounShape(stem) || headOf(stem)) return stem;
	}
	if (form.endsWith('s') && form.length > 4) {
		const stem = form.replace(/'s$/, '').replace(/s$/, '');
		if (stem !== form && (knownGloss(stem) || hasNounShape(stem) || headOf(stem))) return stem;
	}
	if (form.endsWith('t') && form.length > 3) {
		const inf = `${form.slice(0, -1)}en`;
		if (forms.has(inf) || knownGloss(inf) || IRREG[inf]) return IRREG[inf] ?? inf;
	}
	if (form.endsWith('e') && form.length > 4) {
		const stem = form.slice(0, -1);
		if (knownGloss(stem) || hasNounShape(stem)) return stem;
	}
	return form;
}

function posGuess(lemma: string, forms: Set<string>): LexPos {
	const known = knownGloss(lemma);
	if (known) return known.pos;
	if (
		lemma.endsWith('lijk') ||
		lemma.endsWith('ig') ||
		lemma.endsWith('baar') ||
		lemma.endsWith('isch')
	) {
		return 'adj';
	}
	if (
		lemma.endsWith('heid') ||
		lemma.endsWith('ing') ||
		lemma.endsWith('tie') ||
		lemma.endsWith('schap') ||
		lemma.endsWith('atie') ||
		lemma.endsWith('iteit')
	) {
		return 'noun';
	}
	if (lemma.endsWith('en') && lemma.length > 4 && (forms.has(lemma) || true)) return 'verb';
	if (lemma.length <= 3) return 'other';
	return 'noun';
}

const FORCED_NAMES = new Set(['wonderrijk']);

function isName(stat: FormStat): boolean {
	if (FORCED_NAMES.has(stat.form)) return true;
	if (/\d/.test(stat.form)) return false;
	if (knownGloss(stat.form) || SIGNALS[stat.form] || VERBS[stat.form] || NOUNS[stat.form])
		return false;
	if (hasNounShape(stat.form) || suffixGloss(stat.form)) return false;
	if (stat.form.length < 3) return false;
	if (stat.midCap === 0) return false;
	if (stat.count >= 2 && stat.midCap / stat.count >= 0.6) return true;
	if (stat.midCap >= 2 && stat.cap === stat.count) return true;
	return false;
}

function isNum(form: string): boolean {
	return /^\d+(?:[.:]\d+)*$/.test(form);
}

export interface LexiconBuild {
	records: LexRecord[];
	unsure: string[];
	byPos: Record<string, number>;
}

export function buildLexicon(stats: FormStat[]): LexiconBuild {
	const forms = new Set(stats.map((row) => row.form));
	const records: LexRecord[] = [];
	const unsure: string[] = [];
	for (const stat of stats) {
		if (isNum(stat.form)) {
			records.push({ form: stat.form, lemma: stat.form, pos: 'num' });
			continue;
		}
		if (isName(stat)) {
			records.push({ form: stat.form, lemma: stat.form, pos: 'name' });
			continue;
		}
		const lemma = lemmatize(stat.form, forms);
		const signal = SIGNALS[stat.form] ?? SIGNALS[lemma];
		if (signal) {
			const nl = clean(signal.nl);
			const en = clean(signal.en);
			if (!glossOk(nl, en, lemma) && !glossOk(nl, en, stat.form)) {
				unsure.push(stat.form);
			}
			records.push({
				form: stat.form,
				lemma: SIGNALS[stat.form] ? stat.form : lemma,
				pos: signal.pos,
				nl,
				en,
				signal: true
			});
			continue;
		}
		let gloss = knownGloss(lemma);
		let head = gloss?.head;
		let usedTemplate = false;
		if (!gloss) {
			const compound = headOf(lemma);
			if (compound && glossOk(compound.gloss.nl, compound.gloss.en, lemma)) {
				gloss = compound.gloss;
				head = compound.head;
			}
		}
		if (!gloss) {
			const shaped = suffixGloss(lemma);
			if (shaped) gloss = shaped;
		}
		if (!gloss || !glossOk(gloss.nl, gloss.en, lemma)) {
			const pos = gloss?.pos ?? posGuess(lemma, forms);
			gloss = pickTemplate(pos, lemma);
			usedTemplate = true;
		}
		if (usedTemplate) unsure.push(stat.form);
		const record: LexRecord = {
			form: stat.form,
			lemma,
			pos: gloss.pos,
			nl: clean(gloss.nl),
			en: clean(gloss.en)
		};
		if (head && head !== lemma) record.head = head;
		records.push(record);
	}
	const blob = corpusBlob().toLowerCase();
	for (const [form, nl, en] of EXPRESSIONS) {
		if (!blob.includes(form)) continue;
		if (records.some((row) => row.form === form)) continue;
		records.push({ form, lemma: form, pos: 'expr', nl: clean(nl), en: clean(en) });
	}
	records.sort((a, b) => a.form.localeCompare(b.form, 'nl'));
	const byPos: Record<string, number> = {};
	for (const row of records) byPos[row.pos] = (byPos[row.pos] ?? 0) + 1;
	return { records, unsure, byPos };
}

export function assertLexicon(stats: FormStat[], records: LexRecord[]): string[] {
	const errors: string[] = [];
	const byForm = new Map<string, LexRecord[]>();
	for (const row of records) {
		const list = byForm.get(row.form) ?? [];
		list.push(row);
		byForm.set(row.form, list);
	}
	for (const stat of stats) {
		const rows = byForm.get(stat.form) ?? [];
		if (rows.length !== 1) errors.push(`${stat.form}: ${rows.length} records`);
	}
	const posOk = new Set([
		'noun',
		'verb',
		'adj',
		'adv',
		'prep',
		'conj',
		'pron',
		'det',
		'num',
		'name',
		'other',
		'expr'
	]);
	for (const row of records) {
		if (!posOk.has(row.pos)) errors.push(`${row.form}: bad pos`);
		if (row.pos === 'name' || row.pos === 'num') {
			if (row.nl || row.en) errors.push(`${row.form}: name or num has a definition`);
			continue;
		}
		if (!row.nl || !row.en) errors.push(`${row.form}: missing gloss`);
		else if (!glossOk(row.nl, row.en, row.lemma)) errors.push(`${row.form}: gloss failed`);
	}
	return errors;
}
