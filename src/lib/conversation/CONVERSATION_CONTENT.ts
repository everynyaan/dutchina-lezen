// ============================================================
// DUTCHINA CONVERSATION CONTENT
// 8 stories mapped to ranks 0-7 (Iron to Master / B1).
// Source: Olly Richards, Short Stories in Dutch for Beginners
// 25 chapters, 125 comprehension questions, ~500 vocab entries.
// ============================================================

import type { ConversationStory } from './types';

export const STORIES: ConversationStory[] = [
	// ---- RANK 0: De Gekke Loempia ----
	{
		id: 'cs_0',
		rank: 0,
		title: 'De Gekke Loempia',
		chapters: [
			{
				id: 'cc_0_1',
				chapterNumber: 1,
				title: 'Voorbereidingen',
				text: '‘Daniel, kom hier!’, roept Julia. Ze staat bij de voordeur van het huis.\n\n‘Wat is er, Julia?’, antwoord ik.\n\n‘We gaan vandaag naar Nederland! Je bent het toch niet vergeten?’\n\n‘Natuurlijk niet. Ik ben aan het inpakken’, roep ik.\n\nMijn naam is Daniel. Ik ben 24 jaar oud. Julia is mijn zus. Ze is 23. We studeren allebei aan de universiteit. We delen een huis in Londen. Onze ouders heten Arthur en Sara.\n\nJulia en ik maken ons klaar om op reis te gaan. We gaan naar Amsterdam, Nederland. We volgen allebei een studie Nederlands. We kennen de taal al best goed, maar we willen meer leren. Dit komende trimester zijn we uitwisselingsstudent.\n\nIk ben lang, ongeveer 1,90 m. Ik heb best lang bruin haar. Mijn ogen zijn groen en ik heb een brede mond. Ik ben stevig gebouwd. Mijn benen zijn sterk dankzij veel uren op de tennisbaan. Ik ben ook een zeer goede basketbalspeler. Mijn zus Julia heeft ook bruin haar. Haar haar is langer dan dat van mij. Haar ogen zijn niet groen. Zij heeft bruine ogen zoals mijn vader. Ik heb dezelfde kleur ogen als mijn moeder.\n\nMijn ouders werken allebei. Mijn vader is elektricien. Hij werkt bij een groot elektrotechnisch bedrijf. Mijn moeder is schrijfster. Ze heeft ook haar eigen bedrijf. Het verkoopt sciencefictionboeken. Mijn\n\nouders zijn echt geweldig. Ze helpen ons altijd om ons doel te\n\nbereiken. Ze spreken beiden goed Nederlands. Ze spreken vaak Nederlands tegen ons. Zo kunnen Julia en ik meer oefenen. Ze hebben ons echt aangemoedigd om uitwisselingsstudent te worden. We vertrekken vandaag naar Nederland.\n\nMijn vader komt mijn kamer binnen. Hij kijkt me verbaasd aan.\n\nWaarom? Omdat ik nog niet ben aangekleed. ‘Daniel! Waarom ben je niet aangekleed?’, vraagt pa.\n\n‘Aangekleed? Ik ben pas net opgestaan. Ik heb vijf minuten\n\ngeleden gedoucht. Ik ben nog niet eens droog!’\n\n‘Kom! We hebben niet veel tijd. Ik wil je naar de luchthaven\n\nbrengen. Maar ik moet ook naar mijn werk.’\n\n‘Maak je geen zorgen, pa. Ik kleed me nu aan.’\n\n‘Waar is je zus?’\n\n‘Ze is in haar kamer.’\n\nMijn vader gaat de kamer van mijn zus binnen. Hij wil met haar\n\npraten. Hij komt binnen en Julia kijkt hem aan. ‘Oh, hallo pa. Is er iets?’, vraagt Julia.\n\n‘Ja. Je broer kleedt zich nu aan. Dus geef ik dit aan jou.\n\nAlsjeblieft.’ Mijn vader geeft Julia een stapeltje bankbiljetten. ‘Dit is voor jullie beiden.’\n\nJulia is verbaasd. ‘Pa!’ Dit is veel geld!, zegt ze.\n\n‘Je moeder en ik hebben dit geld gespaard. We willen een deel van jullie reis naar Nederland betalen.’\n\n‘Bedankt pa!’, zegt mijn zus. ‘Het zal ons goed helpen. Ik ga het\n\nDaniel vertellen!’\n\nJulia wil naar mij toe gaan. Ze loopt bijna tegen me op. Zij en pa\n\nhebben niet gemerkt dat ik binnenkwam. Mijn vader ziet mij. ‘Oh Daniel, je bent er!’, zegt hij. ‘En je bent aangekleed! Fantastisch!’ Mijn vader wijst naar het geld. ‘Dat geld is voor jullie tweeën. Het is voor de reis.’\n\n‘Bedankt pa. Het zal echt helpen’, antwoord ik. Julia glimlacht.\n\n‘Nu moeten we ons snel klaarmaken’, zegt pa. ‘We moeten naar de luchthaven! Kom!’\n\nNadat we hebben gegeten, vertrekken we. We gaan met de auto van mam op weg naar de luchthaven. Julia is erg nerveus. ‘Julia’, zegt mam. ‘Is alles in orde?’\n\n‘Ik ben erg nerveus’, antwoordt Julia.\n\n‘Waarom?’\n\n‘Ik ken niemand in Nederland. Ik ken dan alleen Daniel.’\n\n‘Maak je geen zorgen’, antwoordt mam. ‘Er zijn veel aardige mensen in Amsterdam. Vooral Arnoud de vriend van Daniel.’\n\n‘Ja, mam. Ik weet zeker dat je gelijk hebt. Maar ik voel me toch nerveus … wat als er iets gebeurt?’\n\n‘Het komt wel goed’, zegt vader.\n\nOp de luchthaven zijn veel mensen aan het inchecken. Veel van hen reizen voor hun werk. Sommigen reizen voor hun plezier. Ik loop naar Julia. Dan vraag ik: ‘Ben je nu wat meer ontspannen?’\n\n‘Ja, Daniel. In de auto was ik erg nerveus.’\n\n‘Ja, dat weet ik. Alles komt in orde. Mijn vriend Arnoud is erg aardig. Hij helpt vaak uitwisselingsstudenten zoals wij.’\n\nOnze ouders geven ons een warme knuffel. Als Julia en ik\n\nvertrekken, zwaaien we elkaargedag. ‘We houden van jullie allebei!’ roepen ze. Dat is het laatste wat we horen. Een uur later stijgt ons vliegtuig op. We zijn op weg naar Amsterdam!',
				summary:
					'Daniel en Julia zijn student. Ze wonen in Londen. Ze studeren Nederlands aan de universiteit. Ze gaan vandaag naar Nederland. Zij gaan als uitwisselingsstudent naar Amsterdam. Hun ouders brengen ze naar de luchthaven. Julia is in de auto erg nerveus. Op de luchthaven wordt ze weer rustig. Zij en Daniel vertrekken naar Nederland.\n\n***',
				vocabulary: [
					{ dutch: 'gek', english: 'crazy' },
					{ dutch: 'loempia', english: 'Indonesian spring roll', article: 'de' },
					{ dutch: 'voorbereiding', english: 'preparation', article: 'de' },
					{ dutch: 'uitwisselingsstudent', english: 'exchange student', article: 'de' },
					{ dutch: 'elektricien', english: 'electrician', article: 'de' },
					{ dutch: 'bedrijf', english: 'company', article: 'het' },
					{ dutch: 'doel', english: 'goal', article: 'het' },
					{ dutch: 'bereiken', english: 'to reach' },
					{ dutch: 'aanmoedigen', english: 'to encourage' },
					{ dutch: 'verbaasd', english: 'surprised' },
					{ dutch: 'douchen', english: 'to shower' },
					{ dutch: 'luchthaven', english: 'airport', article: 'de' },
					{ dutch: 'stapeltje', english: 'small wad of', article: 'het' },
					{ dutch: 'bankbiljet', english: 'bank note', article: 'het' },
					{ dutch: 'sparen', english: 'to save (money)' },
					{ dutch: 'glimlachen', english: 'to smile' },
					{ dutch: 'op weg gaan naar', english: 'to head for, to set off' },
					{ dutch: 'nerveus', english: 'nervous' },
					{ dutch: 'ontspannen', english: 'relaxed' },
					{ dutch: 'knuffel', english: 'hug', article: 'de' },
					{ dutch: 'zwaaien', english: 'to wave' },
					{ dutch: 'gedag', english: 'hello, goodbye' },
					{ dutch: 'opstijgen', english: 'to take off' }
				],
				questions: [
					{
						id: 'cq_0_1_1',
						text: 'Daniel en Julia wonen in ___.',
						options: [
							'Londen in hetzelfde huis',
							'Londen in verschillende huizen',
							'Amsterdam in hetzelfde huis',
							'Amsterdam in verschillende huizen'
						],
						correctIndex: 0
					},
					{
						id: 'cq_0_1_2',
						text: 'De ouders van Daniel en Julia ___.',
						options: [
							'spreken Nederlands, maar zij oefenen niet met hun kinderen',
							'spreken Nederlands en oefenen met hun kinderen',
							'spreken geen Nederlands',
							'wonen niet in Londen'
						],
						correctIndex: 1
					},
					{
						id: 'cq_0_1_3',
						text: 'De vader van Daniel en Julia geeft ze een cadeau voor de reis. Wat is het?',
						options: ['een auto', 'een rit naar de luchthaven', 'een sciencefiction boek', 'geld'],
						correctIndex: 3
					},
					{
						id: 'cq_0_1_4',
						text: 'Tijdens de rit naar de luchthaven voelt Julia zich ___.',
						options: ['verdrietig', 'gelukkig', 'nerveus', 'bang'],
						correctIndex: 2
					},
					{
						id: 'cq_0_1_5',
						text: 'Op de luchthaven zijn er ___.',
						options: [
							'veel vrienden van Daniel',
							'veel zakenmensen',
							'niet veel mensen',
							'veel kinderen'
						],
						correctIndex: 1
					}
				]
			},
			{
				id: 'cc_0_2',
				chapterNumber: 2,
				title: 'Nederland',
				text: 'Ons vliegtuig landt in Amsterdam. Mijn vriend Arnoud wacht op de luchthaven. ‘Hallo Daniel!’, zegt hij. Hij geeft me een stevige knuffel. ‘Ik ben zo blij dat je er bent!’\n\n‘Hoi Arnoud! Het is geweldig om je te zien!’, antwoord ik. Arnoud\n\nkijkt naar mijn zus Julia. Ik stel ze aan elkaar voor. ‘Dit is mijn vriend Arnoud en dit is mijn zus Julia.’\n\nArnoud kust Julia op elke wang. ‘Hallo Julia. Leuk je te\n\nontmoeten!’\n\nMijn zus is erg verlegen. Ze is vooral verlegen als ze nieuwe mensen ontmoet. ‘Hallo … Arnoud’, zegt ze. Haar gezicht wordt\n\nrood. Dan wordt ze stil.\n\n‘Je zus is erg verlegen, hè?’, zegt Arnoud glimlachend tegen me.\n\n‘Ja, dat klopt, maar ze is erg aardig’, zeg ik.\n\nEven later gaan we naar de flat van Arnoud. Daar zullen we het\n\nhele trimester blijven. We nemen een taxi. Na 30 minuten komen we in het centrum van Amsterdam aan. De taxi kost 41 euro en 50 cent.\n\nArnoud zegt dat dit het gebruikelijke tarief is in dit deel van de stad. We betalen in de taxi en stappen uit.\n\nHet is slechts een korte wandeling naar de flat van Arnoud. Het is\n\njuni en het is erg warm. Maar er is een prettige wind die ons afkoelt.\n\nWe komen rond lunchtijd bij de flat aan. Mijn zus en ik hebben erg\n\nveel honger. ‘Arnoud’, zeg ik. ‘Waar kunnen we gaan eten?’\n\n‘Er zijn een paar goede restaurants in de buurt.’\n\n‘Welk soort gerechten hebben ze?’\n\n‘Eén van de restaurants, De Gekke Loempia, heeft fantastische\n\nloempia’s. Ik kan het je erg aanbevelen. Je kan er met de bus naartoe. En er is een ander restaurant met heerlijke vis. Dat is hier om de hoek.’\n\n‘Julia, wil jij een loempia?’, vraag ik mijn zus.\n\n‘Ja, graag! Ik heb zo’n honger!’, antwoordt ze.\n\nArnoud kan niet met ons meegaan. Hij is leraar en hij moet lesgeven. Dus gaan Julia en ik op weg naar het loempiarestaurant. Het is een korte wandeling naar het busstation. ‘Hmm … Wacht even, welke bus gaat naar het loempiarestaurant?’, vraag ik Julia.\n\n‘Dat weet ik niet …’ antwoordt ze. ‘Laten we het aan hem vragen.’ Ze wijst naar een man met een wit overhemd.\n\nWe lopen naar de man toe. Hij glimlacht. ‘Hallo! Kan ik jullie helpen?’\n\n‘Hallo. Hoe komen we bij het restaurant De Gekke Loempia?’, vraag ik.\n\n‘Dat is heel eenvoudig! Bus 35 gaat die kant op. Hij gaat rechtstreeks naar De Gekke Loempia. Er is alleen een klein probleem.’\n\n‘Wat is er?’, vraag ik.\n\n‘Die bus is meestal op dit moment overvol.’\n\n‘Oké. Dank u wel!’, zeggen we.\n\nOp weg naar de bushalte praten Julia en ik met elkaar. De bus vindt ze geen goed idee. ‘Daniel’, zegt ze, ‘laten we gewoon in het visrestaurant gaan eten. Dat is gemakkelijker. Ik wil niet met een overvolle bus mee.’\n\n‘Dat weet ik … maar wacht even! Ik heb een idee. Ik neem de bus naar De Gekke Loempia. Jij gaat naar het visrestaurant.’\n\n‘Waarom?’\n\n‘Op die manier kunnen we de twee restaurants met elkaar\n\nvergelijken.’\n\n‘Oh. Goed idee. Oké. Veel plezier! Ik bel je straks wel op je mobieltje’, roept ze en ze loopt weg.\n\nIk stap in de volgende bus en ik ga zitten. Het openbaar vervoer\n\nin Amsterdam is erg goed. Ik weet dat ik menergenszorgenom hoef te maken. Ik ben erg moe. Ik val snel in slaap. Ik word na een tijdje wakker. De bus is gestopt. Niemand anders dan de chauffeur\n\nzit in de bus. ‘Neem me niet kwalijk’, zeg ik. ‘Waar zijn we?’\n\n‘We zijn in Maastricht aangekomen’, antwoordt hij. ‘Wat zegt u? Maastricht? Zijn we in Maastricht? Hoe kan dat nou?’, zeg ik.\n\n‘Nou, dit is de snelbus. Hij gaat rechtstreeks van Amsterdam naar\n\nMaastricht’, zegt hij tegen me. Ik kan het niet geloven. Ik heb de verkeerde bus genomen. Wat doe ik nu? Ik bedank de chauffeur en stap de bus uit. Dan pak ik mijn mobieltje. Ik wil mijn zus bellen, maar het lukt niet. Mijn batterij is leeg! Ik kijk op mijn horloge. Het is net na vijf uur ‘s middags. Mijn zus weet niet waar ik ben. Ze zal zich\n\necht zorgen maken. Ik moet haar zien te bereiken. Ik zoek een telefooncel!\n\nIk vraag op straat aan een dame waar een telefooncel is. ‘Daar\n\nstaat er één’, zegt ze en wijst. ‘Kijk, daar aan de overkant.’\n\nIk bedank haar en ik ga naar de telefooncel. Maar als ik er ben,\n\nrealiseer ik me nog iets. Julia’s telefoonnummer staat in het\n\ngeheugen van mijn mobiel. Ik kan mijn mobiel niet aanzetten. Eindelijk heb ik een telefoon, maar ik heb geen nummer. Wat nu? Ik denk even na. Dan realiseer ik me weer iets. Ik heb echt honger. Ik heb sinds het ontbijt niets gegeten! Ik besluit om een restaurant te zoeken. Ik kan straks verder over mijn probleem nadenken.\n\nVerderop in de straat vind ik een restaurant. De ober komt naar\n\nmijn tafel. ‘Goedenavond!’, zegt hij heel vrolijk.\n\n‘Goedenavond’, antwoord ik.\n\n‘Wat zal het zijn?’\n\nIk kijk snel naar het menu. ‘Mag ik … een loempia?’ zeg ik in het\n\nNederlands.\n\n‘Pardon? Ik begrijp u niet’, antwoordt hij in het Nederlands.\n\nIk probeer het opnieuw. Mijn Nederlands kan toch niet zo slecht\n\nzijn. ‘Hm … mag ik een loempia?’ Ik wijs als een gek naar het woord loempia op het menu. Dan zeg ik het nog eens in het Engels. Dan glimlacht de ober en zegt in het Engels: ‘Bedankt. Ik kom hier niet vandaan. Ik ben hier pas kort en mijn Nederlands is niet zo goed.’\n\nIk begin heel hard te lachen. Veel mensen in het restaurant\n\ndraaien zich om en kijken. Op dat moment voel ik me opgelaten. Ik\n\nhoefde niet zo hard te lachen. Maar het kan me niet schelen. Het is allemaal teveel. Deze hele situatie is gewoon zo vreemd! Mijn zus en ik wilden samen een loempia gaan eten. En hier zit ik dan een loempia te eten—maar dan wel alleen in Maastricht! En mijn zus weet niet waar ik ben. Het is zo ironisch!\n\nIk eet alles op en betaal de rekening. Dan realiseer ik me mijn situatie. Wat doe ik nu? Mijn mobieltje werkt niet. Er is een telefooncel, maar ik heb het nummer van mijn zuster niet. Wat kan ik doen? Dan weet ik het. Ik kan naar Londen bellen! Ik ken het vaste telefoonnummer van mijn moeder en vader.\n\nIk ga terug naar de telefooncel. Ik bel het nummer van mijn ouders. Het gaat vier keer over. Eindelijk zegt mijn moeder: ‘Hallo?’\n\n‘Hoi mam. Ik ben het, Daniel.’\n\n‘Daniel?’, zegt ze. ‘Hoe gaat het met je? Hoe vind je Amsterdam?’\n\n‘Het is er prima. Hm … mam. Ik heb een probleempje.’\n\n‘Wat is er? Is er iets gebeurd?\n\n‘Nee, mam, maar wil je alsjeblieft Julia bellen? Zeg haar dan dat ik in Maastricht ben. En vertel haar dat de batterij van mijn mobiel leeg is.’\n\n‘In Maastricht? Wat doe je in Maastricht?!’\n\n‘Het is een lang verhaal, mam. Ik vertel je later wel meer.’\n\nWe zeggen elkaar gedag. Ik besluit om een hotelkamer te nemen. Verderop in de straat is er één beschikbaar. Ik kan morgen terug naar Amsterdam. Op dit moment heb ik slaap nodig.\n\nIk betaal met contant geld voor een overnachting. Ik heb geen creditcards bij me. Ik ga naar mijn kamer. Ik trek mijn kleren uit en ga naar bed. Ik doe het licht uit en ga slapen. Ik ben doodmoe. Wat een gekke dag!',
				summary:
					'Daniel en Julia komen in Amsterdam aan. Arnoud, de vriend van Daniel, ontmoet ze op de luchthaven. Ze gaan allemaal naar de flat van Arnoud. Daniel en Julia hebben honger. Arnoud beveelt twee restaurants aan. Julia loopt naar een visrestaurant. Daniel neemt een bus naar een loempiarestaurant. In de bus valt Daniel in slaap. Hij wordt in Maastricht wakker! Zijn telefoon werkt niet. Hij kent het telefoonnummer van zijn zus niet. Uiteindelijk belt hij zijn moeder. Dan overnacht hij in een hotel.\n\n***',
				vocabulary: [
					{ dutch: 'wang', english: 'cheek', article: 'de' },
					{ dutch: 'verlegen', english: 'shy' },
					{ dutch: 'stil', english: 'quiet' },
					{ dutch: 'aardig', english: 'nice' },
					{ dutch: 'gebruikelijk', english: 'usual' },
					{ dutch: 'gerecht', english: 'dish, food', article: 'het' },
					{ dutch: 'aanbevelen', english: 'to recommend' },
					{ dutch: 'overvol', english: 'packed' },
					{ dutch: 'gemakkelijk', english: 'easy' },
					{ dutch: 'vergelijken', english: 'to compare' },
					{ dutch: 'openbaar vervoer', english: 'public transport', article: 'het' },
					{ dutch: '(zich) zorgen maken', english: 'to worry' },
					{ dutch: 'wakker worden', english: 'to wake up' },
					{ dutch: 'Neem me niet kwalijk', english: 'Excuse me' },
					{ dutch: 'rechtstreeks', english: 'direct' },
					{ dutch: 'geheugen', english: 'memory', article: 'het' },
					{ dutch: 'besluiten', english: 'to decide' },
					{ dutch: 'vrolijk', english: 'cheerful, cheerfully' },
					{ dutch: 'als een gek', english: 'like a mad person' },
					{ dutch: 'opgelaten', english: 'embarrassed' },
					{ dutch: 'Het kan me niet schelen', english: 'I don’t care' },
					{ dutch: 'nodig hebben', english: 'to need' },
					{ dutch: 'contant geld', english: 'cash', article: 'het' },
					{ dutch: 'doodmoe', english: 'extremely tired' }
				],
				questions: [
					{
						id: 'cq_0_2_6',
						text: 'Arnoud is ___.',
						options: [
							'iemand die op de luchthaven werkt',
							'een vriend van de ouders van Julia en Daniel',
							'de vriend van Julia',
							'de vriend van Daniel'
						],
						correctIndex: 3
					},
					{
						id: 'cq_0_2_7',
						text: 'Na de flat van Arnoud gaan Julia en Daniel op weg naar ___.',
						options: [
							'een restaurant',
							'de flat van de vriend van Arnoud',
							'het station',
							'Maastricht'
						],
						correctIndex: 0
					},
					{
						id: 'cq_0_2_8',
						text: 'In Amsterdam is het ___',
						options: ['koud', 'warm', 'niet warm of koud', 'alleen warm in het centrum'],
						correctIndex: 1
					},
					{
						id: 'cq_0_2_9',
						text: 'Daniel kan zijn zus niet bereiken omdat ___.',
						options: [
							'de batterij van zijn mobiel leeg is',
							'hij geen geld heeft',
							'er geen telefooncel is',
							'hij zijn mobiel is vergeten'
						],
						correctIndex: 0
					},
					{
						id: 'cq_0_2_10',
						text: 'Daniel brengt de nacht door ___.',
						options: [
							'in een hotel in Amsterdam',
							'in de bus',
							'in een hotel in Maastricht',
							'op de luchthaven'
						],
						correctIndex: 2
					}
				]
			},
			{
				id: 'cc_0_3',
				chapterNumber: 3,
				title: 'De snelweg',
				text: 'Ik word vroeg wakker en ga douchen. Ik bestel wat eten op mijn kamer. Ik heb op dit moment weinig geld. Maar ik heb weer honger dus ik neem de tijd en geniet ervan.\n\nDaarna kleed ik me aan en vertrek. Ik zie op een klok in de hal hoe laat het is. Het is tien uur ‘s ochtends. Ik vraag me af of mam al met Julia heeft gesproken. Mijn zus is vaak nerveus. Ik hoop dat alles goed gaat met haar.\n\nIk ga naar de ingang van het hotel. Terwijl ik het hotel verlaat, vraag ik me af: ‘Hoe kom ik terug in Amsterdam?’ Ik heb het grootste deel van mijn geld aan het hotel uitgegeven. Ik weet niet waar een bank is. Ik kan geen geld van mijn rekening halen. En Julia wacht waarschijnlijkop me. Ik moet snel eenoplossingvinden!\n\nDan zie ik twee werkmannen. Ze dragen dozen naar een\n\nvrachtwagen. Op de vrachtwagen staat een foto met de naam van het bedrijf. Ik kijk wat beter. En ik begin dan heel hard te lachen maar ik stop weer snel. Ik wil me niet weer opgelaten voelen! Ik kan het niet geloven. De foto op de vrachtwagen is van een loempia. Het is een vrachtwagen van het restaurant De Gekke Loempia!\n\nIk stap op één van de werkmannen af. ‘Hallo’, zeg ik.\n\n‘Goedemorgen’, antwoordt hij. ‘Kan ik u helpen?’\n\n‘Werkt u voor dit restaurant in Amsterdam?’, vraag ik hem en ik\n\nwijs naar de foto op de vrachtwagen.\n\n‘Nee, ik ben gewoon vrachtwagenchauffeur’, zegt de man.\n\n‘Kent u het restaurant De Gekke Loempia?’\n\n‘Ja, we brengen er elke week noedels naartoe. Ze zijn voor hun loempia’s, maar ik werk er niet.’\n\nDe chauffeur stapt in de vrachtwagen. Opeens heb ik heb een\n\nidee. ‘Neem me niet kwalijk’, zeg ik.\n\n‘Ja, wat is er?’, antwoordt de chauffeur.\n\n‘Kunt u me meenemen naar Amsterdam?’, vraag ik. ‘Nu?’, zegt hij.\n\n‘Ja’, antwoord ik. ‘Ik heb weinig geld. Ik moet terug naar mijn zus!’ De chauffeur denkt even na. Dan antwoordt hij: ‘Oké dan maar.\n\nStap in de vrachtwagen. Ga tussen de dozen met noedels zitten. En vertel het aan niemand!’\n\n‘Nee hoor, dat doe ik niet. Dank u wel’, zeg ik. ‘Graag gedaan’, zegt hij. Dan zegt hij ook nog: ‘Maar wel snel. Ik moet nu weg. Ik mag niet te laat komen!’\n\nIk klim achterin de vrachtwagen. Ik ga tussen een paar dozen met\n\nnoedels zitten. De chauffeur start de vrachtwagen. We gaan op weg\n\nnaar Amsterdam. Ik vind het een geweldig idee. Een vrachtwagen is sneller dan een bus. Op die manier kan ik wat tijd winnen. En het kost me geen geld. Ik ga lekker achterover zitten om van de rit te genieten.\n\nHet is erg donker achterin de vrachtwagen. Ik zie niets. Ik hoor\n\nalleen maar de motor van de vrachtwagen en de auto’s op de\n\nsnelweg. Dan beweegt erplotseling iets in de vrachtwagen. Er zit nog iemand tussen de dozen met noedels! ‘Hallo?’, zeg ik.\n\nStilte.\n\n‘Wie is daar?’, vraag ik in het Engels. Nog steeds stilte. Ik weet dat\n\ner iemand is. Hij of zij zit tussen de dozen. Ik sta ik op en loop er naartoe. Nou, dat is een verrassing! Het is een oude man. Hij zit verstopt tussen de dozen.\n\n‘Neem me niet kwalijk’, zeg ik. ‘Maar wie bent u?’\n\n‘Laat me alsjeblieft alleen’, antwoordt de man. Hij spreekt perfect\n\nNederlands!\n\n‘Wat doet u hier?’, vraag ik.\n\n‘Ik ben op reis naar Amsterdam.’\n\n‘Weet de chauffeur dat u hier zit?’\n\n‘Nee, dat weet hij niet. Ik ben in de vrachtwagen geklommen terwijl je met hem sprak.’\n\n‘Ik snap het …’ zeg ik.\n\nPlotseling stopt de chauffeur. Hij stapt uit en gaat naar achteren.\n\nDe oude man kijkt me bezorgd aan. ‘Waarom is hij gestopt?’\n\n‘Dat weet ik niet.’\n\nWe horen een geluid bij de achterdeur.\n\n‘Ik moet me verstoppen’, zegt de man.\n\nDe chauffeur klimt de vrachtwagen in. Hij ziet alleen mij. De oude man zit verstopt achter de dozen.\n\n‘Wat is er aan de hand?’ vraagt hij mij.\n\n‘Niets.’\n\n‘Met wie sprak jij?\n\n‘Ik? Niemand. Er is niemand anders hier. Ziet u dat niet?’\n\n‘Luister. We zijn nog niet in Amsterdam. Wees stil. Ik wil geen problemen. Begrepen?’\n\n‘Ik begrijp het’, antwoord ik.\n\nDe chauffeur doet de deur dicht. Hij gaat weer terug. Op hetzelfde moment komt de oude man tussen de dozen vandaan. Hij kijkt me met een glimlach aan. ‘Ik heb geluk gehad dat hij me niet zag!’, zegt hij.\n\n‘Jazeker’, zeg ik. ‘Zeg op. Waarom reist u in een vrachtwagen van Maastricht naar Amsterdam?’\n\n‘Wilt u dat echt weten?’\n\n‘Natuurlijk!’\n\n‘Dan zal ik je mijn verhaal vertellen.’\n\n‘Graag! Het is een lange rit.’\n\nDe oude man vertelt me zijn verhaal. ‘Ik heb een zoon, maar ik heb hem nog nooit ontmoet. Zijn moeder en ik waren vele jaren geleden samen. Het ging niet zo goed tussen ons. Maar ik hield van haar. Toen ging ik naar de Verenigde Staten. Het was voor een baan, maar het werk ging niet goed. Ik kon niet terugkomen.’ Hij stopte even. ‘En toen’, vertelde hij verder, ‘is ze verhuisd. En ik heb haar - en mijn zoon - nooit meer gezien. Laatst heb ik ontdekt waar ze zijn.’\n\n‘In Amsterdam?’\n\n‘Precies.’\n\n‘Hoe oud is uw zoon?’\n\n‘Hij is 24.’\n\n‘Dat is ook mijn leeftijd!’\n\nDe oude man lacht. ‘Wat een toeval!’\n\n‘Jazeker.’\n\nNa een paar minuten stilte sta ik even op. Ik vraag de man: ‘Hoe\n\nheet uw zoon?’\n\n‘Zijn naam is Arnoud. Hij heeft een flat in Amsterdam. Die staat in\n\neen buurt niet ver van het restaurant De Gekke Loempia. Daarom zit ik in deze vrachtwagen van De Gekke Loempia.’\n\nDe man in de vrachtwagen is de vader van mijn vriend Arnoud. Ik\n\nkan het niet geloven!',
				summary:
					'Daniel wordt wakker en eet in zijn hotelkamer in Maastricht. Als hij het hotel verlaat, ziet hij een vrachtwagen. Die hoort bij het restaurant De Gekke Loempia. Daniel vraagt de chauffeur om hem naar Amsterdam terug te brengen. De chauffeur zegt ja. In de vrachtwagen ontmoet Daniel een oude man. De man gaat ook naar Amsterdam. Hij is op zoek naar zijn zoon, Arnoud. De man is de vader van Arnoud, de vriend van Daniel.\n\n***',
				vocabulary: [
					{ dutch: 'ingang', english: 'entrance', article: 'de' },
					{ dutch: 'verlaten', english: 'to leave' },
					{ dutch: 'waarschijnlijk', english: 'probably' },
					{ dutch: 'oplossing', english: 'solution', article: 'de' },
					{ dutch: 'vrachtwagen', english: 'lorry, (*Am. Eng.*) truck', article: 'de' },
					{ dutch: 'wijzen', english: 'to point' },
					{ dutch: 'noedels', english: 'noodles', article: 'de' },
					{ dutch: 'geweldig', english: 'great, fantastic' },
					{ dutch: 'snelweg', english: 'motorway, (*Am. Eng.*) highway or freeway', article: 'de' },
					{ dutch: 'plotseling', english: 'suddenly' },
					{ dutch: 'iets snappen', english: 'to get something, to understand something' },
					{ dutch: 'bezorgd', english: 'concerned, worried' },
					{ dutch: 'verstoppen', english: 'to hide' },
					{ dutch: 'Wat is er aan de hand?', english: 'What is happening? What is the matter?' },
					{ dutch: 'geluk', english: 'luck', article: 'het' },
					{ dutch: 'toeval', english: 'coincidence', article: 'het' }
				],
				questions: [
					{
						id: 'cq_0_3_11',
						text: 'Arnoud is waarschijnlijk rond ___ wakker geworden.',
						options: ['10:15 uur', '10:00 uur', '9:00 uur', '12:15 uur'],
						correctIndex: 2
					},
					{
						id: 'cq_0_3_12',
						text: 'De chauffeur van de vrachtwagen ___.',
						options: [
							'werkt in het hotel',
							'werkt in het restaurant De Gekke Loempia',
							'werkt alleen als chauffeur',
							'werkt voor een ander restaurant'
						],
						correctIndex: 2
					},
					{
						id: 'cq_0_3_13',
						text: 'Daniel ontmoet ___ in de vrachtwagen.',
						options: ['een jongeman', 'een jonge vrouw', 'een andere chauffeur', 'een oude man'],
						correctIndex: 3
					},
					{
						id: 'cq_0_3_14',
						text: 'De persoon in de vrachtwagen is op weg om ___.',
						options: [
							'in De Gekke Loempia te werken',
							'als chauffeur te werken',
							'zijn vader te bezoeken',
							'zijn kind te bezoeken'
						],
						correctIndex: 3
					},
					{
						id: 'cq_0_3_15',
						text: 'De persoon in de vrachtwagen is ___.',
						options: [
							'de vader van Daniel',
							'de vader van Arnoud',
							'de moeder van Julia',
							'de moeder van Daniel'
						],
						correctIndex: 1
					}
				]
			},
			{
				id: 'cc_0_4',
				chapterNumber: 4,
				title: 'De terugkeer',
				text: 'De man en ik praten weinig tijdens de rit naar Amsterdam. Ik zeg niet dat ik zijn zoon misschien ken. Eindelijk arriveert de vrachtwagen van De Gekke Loempia. De chauffeur zet de motor af. De oude man en ik stappen via de achterdeur uit. De oude man verstopt zich tussen de mensen op straat. Ik bedank de chauffeur. ‘Graag gedaan’, zegt hij. ‘Heb een fijne dag!’\n\nIk draai me om. De oude man kijkt naar het restaurant. Eindelijk zijn we bij De Gekke Loempia. We gaan allebei naar binnen. Er is niemand. Het is drie uur ‘s middags. Het is nog te vroeg voor het avondeten.\n\n‘Wat wilt u gaan doen?’, vraag ik de man.\n\n‘Ik heb geen honger’, antwoordt hij. ‘Ik wil naar de flat van mijn zoon. Wilt u met me meegaan?’\n\n‘Jazeker’, antwoord ik.\n\nDe oude man heeft het adres van Arnoud. We nemen zonder te praten bus 35. Dan lopen we naar de flat van Arnoud. Hij weet nog steeds niet dat Arnoud mijn vriend is. Arnoud spreekt niet vaak over zijn vader. Ik weet dat Arnoud en de man elkaar nooit hebben ontmoet.\n\nOp dit moment weet ik niet wat het beste is. Moet ik de man vertellen dat ik Arnoud ken? Of kan ik dat beter niet doen? Tenslotte neem ik een beslissing. Ik zeg niets. Ik wil dat de ontmoeting een grote verrassing is.\n\nWe komen bij de flat aan en lopen door de vooringang. ‘Goedemiddag!’, zegt de receptionist.\n\n‘Goedemiddag’, antwoorden we.\n\nDe oude man gaat naar de receptionist. Hij wil het huisnummer\n\nvan de flat van Arnoud vragen.\n\n‘Laat mij dat maar doen,’ zeg ik.\n\nWe nemen de lift naar de derde verdieping. We stappen uit. We lopen naar de deur van de flat.\n\n‘Dit is het’, zeg ik tegen de oude man.\n\n‘Hoe weet je dat?’, vraagt hij.\n\nTen slotte vertel ik hem alles. Ik zeg hem dat ik Arnoud al jaren\n\nken. Het was gewoon geluk – of het lot – dat hij en ik in dezelfde vrachtwagen zaten. Eerst kan hij het niet geloven! Dan accepteert hij dat het zo moest zijn. Hij kan niet wachten en wil graag zijn zoon zien.\n\nWe bellen aan, maar niemand reageert.\n\n‘Julia? Arnoud?’, roep ik. ‘Is er iemand?’ Alweer antwoordt er\n\nniemand. Ik leg uit dat mijn zus en ik in het appartement logeren. Dan pak ik mijn sleutel en open de deur.\n\n‘Waar zijn ze?’, vraagt de man.\n\n‘Dat weet ik niet. Maar ze komen vast gauw.’\n\nWe gaan de flat in. Ik vind de oplader van mijn mobiele telefoon.\n\nDe volgende 15 minuten laad ik mijn telefoon op. Daarna bel ik mijn zus. De telefoon van Julia gaat één keer over. Ze neemt snel op.\n\n‘Daniel! Eindelijk! Mam heeft gebeld, maar ik was zo bezorgd!’\n\n‘Hallo, Julia. Maak je geen zorgen. Het gaat goed met me. Ik ben\n\nin de flat van Arnoud. Ik heb iemand bij me.’\n\n‘Wie is het?’\n\n‘Nou, dat is een lang verhaal. Kom naar de flat. Waar zijn jullie?’\n\n‘Ik heb vanmorgen met mam gesproken. Ze vertelde me over\n\nMaastricht. Arnoud en ik hebben de hele nacht op je gewacht! We zijn even gaan lunchen. We komen eraan!’\n\n‘Oké. We zullen hier op jullie wachten.’\n\nEen half uur later komen Arnoud en Julia in de flat aan. ‘Hallo\n\nDaniel! We zijn zo blij om je weer te zien!’, zegt Arnoud. Hij draait zich om naar de oude man. ‘En wie bent u?’, vraagt hij.\n\nVoordat de man kan antwoorden, zeg ik: ‘Hm … Arnoud, ik moet\n\nje iets belangrijks vertellen.’\n\n‘Wat is er aan de hand?’, vraagt hij.\n\n‘Arnoud, dit is je vader’, zeg ik.\n\nEerst kijkt Arnoud geschokt. ‘Mijn vader? Dat isonmogelijk!’\n\nDe oude man kijkt hem aan. ‘Ben jij Arnoud?’, zegt hij.\n\n‘Ja dat ben ik. U kunt onmogelijk mijn vader zijn!’, antwoordt Arnoud.\n\n‘Mijn naam is Anton Schuit. En ja, ik ben je vader.’\n\nDe man legt alles uit. Arnoud begrijpt snel dat hij echt zijn vader is. Hij geeft de man een onhandige knuffel. Na zoveel jaar ontmoeten ze elkaar eindelijk. Beide mannen weten niet precies wat ze moeten doen.\n\nUiteindelijk glimlacht Arnoud en zegt: ‘Nou … ik geloof dat we dit\n\nmoeten vieren!’\n\n‘Dat denk ik ook!’, zegt Anton, zijn vader.\n\n‘Zullen we naar De Gekke Loempia gaan?’, zegt Julia.\n\nIk kijk Julia aan. Ik ben verbaasd. ‘Nee! Ik wil geen loempia! Ik wil nooit meer een loempia!’ Zij kijkt me aan en lacht. ‘Ik wil geen stap in de buurt van dat restaurant zetten!’ ga ik door. ‘En ik wil ook heel lang geen voet meer in een bus zetten! Ik wil een pizza!’\n\nZe barsten allemaal in lachen uit. Een beetje later lach ik ook.\n\n‘Wat een gekke dag!’, zeg ik.\n\n‘Ja,’ antwoordt Anton. ‘Wat een gekke dag, zeg dat wel!’',
				summary:
					'Daniel en de oude man komen in Amsterdam aan. Ze gaan naar het restaurant De Gekke Loempia. Er is niemand, omdat het nog vroeg is. Daarna gaan ze naar de flat van Arnoud. Daar is ook niemand. Daniel laadt zijn telefoon op. Hij belt Julia. Ze is met Arnoud in de stad. Julia en Arnoud komen terug naar de flat. Daniel introduceert Arnoud aan zijn vader. Ze besluiten dit te gaan vieren met een diner. Maar Daniel wil geen loempia, hij wil pizza.\n\n***',
				vocabulary: [
					{ dutch: '(zich) omdraaien', english: 'to turn around' },
					{ dutch: 'beslissing', english: 'decision', article: 'de' },
					{ dutch: 'verdieping', english: 'floor', article: 'de' },
					{ dutch: 'lot', english: 'fate', article: 'het' },
					{ dutch: 'oplader', english: 'charger', article: 'de' },
					{ dutch: 'eindelijk', english: 'finally' },
					{ dutch: 'belangrijk', english: 'important' },
					{ dutch: 'geschokt', english: 'taken aback, shocked' },
					{ dutch: 'onmogelijk', english: 'impossible' },
					{ dutch: 'uitleggen', english: 'to explain' },
					{ dutch: 'onhandig', english: 'awkwardly, awkward' },
					{ dutch: 'vieren', english: 'to celebrate' },
					{ dutch: 'in lachen uitbarsten', english: 'to burst out laughing' }
				],
				questions: [
					{
						id: 'cq_0_4_16',
						text: 'De oude man en Daniel gaan eerst naar ___.',
						options: [
							'de flat van Arnoud',
							'een telefooncel',
							'het restaurant De Gekke Loempia',
							'de luchthaven'
						],
						correctIndex: 2
					},
					{
						id: 'cq_0_4_17',
						text: 'Als ze bij de flat aankomen ___.',
						options: [
							'zijn Julia en Arnoud er',
							'is alleen Julia er',
							'is alleen Arnoud er',
							'is niemand er'
						],
						correctIndex: 3
					},
					{
						id: 'cq_0_4_18',
						text: 'Het eerste wat Daniel doet, is ___',
						options: [
							'zijn mobieltje opladen',
							'het avondeten klaarmaken',
							'Arnoud bellen',
							'zijn ouders bellen'
						],
						correctIndex: 0
					},
					{
						id: 'cq_0_4_19',
						text: 'Vervolgens belt Daniel ___.',
						options: ['zijn ouders', 'Arnoud', 'Julia', 'de vrachtwagenchauffeur'],
						correctIndex: 2
					},
					{
						id: 'cq_0_4_20',
						text: 'Voor het diner wil Julia naar ___.',
						options: ['De Gekke Loempia', 'het pizzarestaurant', 'Amsterdam', 'Maastricht'],
						correctIndex: 0
					}
				]
			}
		]
	},
	// ---- RANK 1: Een heel bijzondere excursie ----
	{
		id: 'cs_1',
		rank: 1,
		title: 'Een heel bijzondere excursie',
		chapters: [
			{
				id: 'cc_1_1',
				chapterNumber: 1,
				title: 'Het wezen',
				text: 'Rivier de Geul ligt in het zuiden van Nederland. Hij ligt in een bekende streek die het Geuldal wordt genoemd. Het is een ideale streek voor gezinnen met kinderen. Mensen gaan er vaak naartoe om foto’s te maken. Ze gaan er ook in het zomerseizoen naartoe om van de natuur te genieten.\n\nHet Geuldal is een streek met zeer zacht weer. Het is er vaak bewolkt en de zomers zijn er niet heet. Daarom houden wandelaars van de Geul. Sylvia is één van die wandelaars. Ze woont vlakbij de Geul. Ze houdt van de natuur en ze houdt van wandelen. Ze gaat in juni en juli vaak wandelen. Het weer is dan warm, maar niet te heet.\n\nElk weekend pakt ze haar rugzak in en gaat ze wandelen in de bossen langs de Geul.\n\nSylvia’s goede vriend Joris houdt ook van wandelen. Hij gaat vaak\n\nmet Sylvia mee. Afgelopen weekend besloten ze om in de buurt van de Geul te gaan wandelen. Uiteindelijk werd het een heel bijzondere excursie!\n\nSylvia en Joris ontmoetten elkaar aan het begin van de wandeling.\n\n‘Hoi Sylvia!’ schreeuwde Joris van ver.\n\n‘Hallo Joris!’ antwoordde Sylvia.\n\n‘Ik kom zo!’ riep Joris. Hij rende naar Sylvia toe.\n\n‘Joris, rustig aan. Je maakt je moe.’\n\n‘Maak je geen zorgen, ik heb energiedrankjes bij me voor de wandeling,’ zei Joris. Hij wees naar zijn grote rugzak en lachte.\n\nDe twee waren erg blij elkaar te zien. Ze praatten een beetje. Toen\n\nbegonnen ze aan hun wandeltocht.\n\nNa een paar kilometer veranderde het pad. Het splitste zich in\n\ntwee paden.\n\n‘Welke kant zullen we opgaan?’ vroeg Sylvia. ‘Naar links of naar\n\nrechts?’\n\n‘Laten we naar links gaan,’ antwoordde Joris. ‘Nou, ik … ik denk dat ik liever naar rechts ga.’\n\n‘Waarom?’\n\nSylvia keek naar het bos bij het linkerpad. Toen antwoordde ze: ‘Er\n\nbestaan verhalen over dat pad. Er zijn mensen die daar een groot harig wezen hebben gezien …’\n\n‘Echt waar? Geloof jij die verhalen?’\n\n‘Nou, eh … ik weet het eigenlijk niet. Ik denk dat we links zouden\n\nkunnen gaan …’ zei Sylvia. Ze keek bezorgd.\n\n‘Kom op, Sylvia. Laten we het proberen!’ Joris moedigde haar aan.\n\nSylvia keek hem bezorgd aan. Toen namen ze het linkerpad.\n\nEen uur later volgden Joris en Sylvia het pad nog steeds. Er\n\nwaren overal bomen rond hen. Het was laat in de middag. Sylvia\n\nvroeg Joris: ‘Denk je dat er vreemde wezens in deze bossen zitten?’\n\n‘Ik denk het niet.’\n\n‘Waarom niet?’\n\n‘Nou, ik heb nog nooit een vreemd wezen gezien. Jij wel?’\n\n‘Niet in deze bossen.’\n\n“Oké. Dus dat betekent dat we veilig zijn!’ Sylvia lachte. ‘Ik denk het wel!’\n\nZe wandelden verder.\n\nNa veel kilometers wandelden de twee nog steeds. De zon stond\n\nlaag aan de hemel. Plotseling waren ze het bos uit. Voor hen lag de rivier.\n\nJoris en Sylvia keken om zich heen. Er stond een huis dichtbij de\n\nrivier. Het huis was van hout en het zag er erg oud uit. ‘Kijk eens, Joris,’ riep Sylvia. ‘Kijk, daar!’\n\n‘Waar?’\n\n‘Daar! Daar staat een huis! Het is van hout.’\n\n‘Oh. Ja, dat zie ik. Laten we eens gaan kijken!’\n\n‘Wat zeg je? Maar wat als het bewoond is?’\n\n‘Wees niet bang, Sylvia. Ik weet zeker dat er niemand woont.’\n\nDe twee liepen naar het huis. Voordat ze naar binnen gingen, keken ze om zich heen.\n\n‘Het huis ziet eruit alsof het lang geleden is gebouwd,’ zei Sylvia.\n\n‘Kijk eens hoe de ramen eruit zien! Het glas is erg oud. En het hout is ook echt oud!’\n\n‘Ja,’ antwoordde Joris. ‘Ik denk dat het minstens 50 jaar oud is.\n\nMaar ik vind het niet echt lelijk. Ik vind het best wel mooi.’\n\nJoris keek om zich heen. Plotseling riep hij: ‘Hé Sylvia! Kom even hierheen!’ Vlakbij de rivier lag een bootje. Het was oud en van hout.\n\nHet lag in het water aan de oever. Joris keek Sylvia aan. ‘Laten we instappen!’\n\n‘Ben je gek?’ antwoordde Sylvia. ‘Waarom?’\n\n‘We kunnen een eindje gaan roeien!’\n\n‘Ik weet het niet …’\n\n‘Kom op! Laten we gaan! Het wordt echt leuk!’\n\n‘Oké …’ zei Sylvia. Ze klonk niet echt blij.\n\nSylvia en Joris stapten met hun rugzak in de boot. Ze roeiden langzaam een stukje de rivier af. Sylvia keek om zich heen. ‘Wat is het hier mooi!’ zei ze.\n\n‘Ja, hè! Er staan veel bomen. En we kunnen de zon nog steeds goed zien.’\n\n‘Ik ben zo blij dat we hier naartoe zijn gegaan. Laten we iets eten. Wil jij iets eten?’\n\n‘Natuurlijk! Wat heb je bij je?’\n\nSylvia haalde een paar koekjes en boterhammen uit haar rugzak. Joris haalde de energiedrankjes tevoorschijn.\n\n‘Wat wil jij?’\n\n‘De boterhammen zien er lekker uit …’\n\n‘Hier! Neem maar.’\n\n‘Dank je wel, Sylvia!’\n\nDe twee aten hun boterhammen in het bootje op de rivier.\n\nPlotseling hoorden ze een geluid.\n\n‘Hoorde je dat?’ zei Joris.\n\n‘Ja,’ antwoordde Sylvia. Ze klonk bang.\n\n‘Ik denk dat het uit het huis komt.’\n\n‘Dat denk ik ook!’\n\n‘Laten we gaan kijken!’\n\nSylvia keek Joris verbaasd aan. ‘Meen je dat?’ zei ze.\n\n‘Ja! Kom op!’\n\nJoris en Sylvia roeiden terug naar de oever. Ze deden hun rugzak\n\nop hun rug. Daarna liepen ze langzaam naar het oude houten huis.\n\n‘Sylvia, ik wil het huis in gaan.’\n\n‘Waarom? Ik dacht dat we gingen wandelen? Buiten in de frisse\n\nlucht? Niet in huizen?’\n\n‘Ja, dat is waar. Maar in het bos staan veel interessante dingen. Ik\n\nhou ervan om interessante dingen te ontdekken.’\n\n‘Ik weet het niet zeker …’\n\n‘Kom op! Laten we het huis in gaan,’ zei Joris nog een keer.\n\nUiteindelijk ging Sylvia akkoord.\n\nSylvia en Joris liepen voetje voor voetje naar het huis. Ze deden\n\nde deur open en gingen naar binnen. Alles in het huis was erg oud.\n\nHet was al een lange tijd onbewoond. Overal lag stof.\n\n‘Sylvia, kijk hier eens naar,’ riep Joris. Zijn stem klonk vreemd. ‘Wat zeg je?’\n\n‘Hier, naast het raam.’\n\nSylvia keek. Op de vloer, in het stof, lagen een paar zeer grote\n\nvoetafdrukken.\n\n‘Wat zouden deze voetafdrukken kunnen betekenen?’ vroeg Joris. ‘Ik denk dat het berenvoetafdrukken zijn!’ antwoordde Sylvia.\n\n‘Een beer, Sylvia?! Hier zijn geen beren! De dichtstbijzijnde beren\n\nzijn honderden kilometers hier vandaan!’\n\n‘Dan heb ik geen idee. Maar laten we hier in ieder geval weggaan!’\n\nPlotseling hoorden de twee een geluid in de keuken. Sylvia en Joris renden ernaartoe. Ze konden hun ogen niet geloven. Er stond een groot harig wezen in de keuken! Het draaide zich snel om, ging door de achterdeur en rende weg. Het wezen maakte veel lawaai. Het wezen brak zelfs de deur toen het vertrok!\n\nSylvia en Joris stonden stil. Het wezen verdween in het bos. Sylvia kon niet praten. ‘Wat was dat?’ vroeg Joris. Ze wisten het niet.',
				summary:
					'Sylvia en Joris gaan wandelen in het Geuldal. Ze komen bij de rivier de Geul. Er staat een oud huis bij de rivier en er ligt een boot. Ze gaan met de boot de rivier op. Dan horen ze een geluid. Ze gaan terug en ze lopen het huis binnen. In de keuken zien ze een vreemd wezen. Het wezen rent het huis uit. Het gaat het bos in. Sylvia en Joris weten niet wat het wezen is.\n\n***',
				vocabulary: [
					{ dutch: 'bijzonder', english: 'unusual, special' },
					{ dutch: 'wezen', english: 'creature', article: 'het' },
					{ dutch: 'streek', english: 'area', article: 'de' },
					{ dutch: '(zachte) weer', english: '(mild) weather', article: 'het' },
					{ dutch: 'wandelaar', english: 'hiker', article: 'de' },
					{ dutch: 'rugzak', english: 'rucksack, backpack', article: 'de' },
					{ dutch: 'besluiten', english: 'to decide' },
					{ dutch: 'wandeltocht', english: 'excursion, hike', article: 'de' },
					{ dutch: 'schreeuwen', english: 'to shout' },
					{ dutch: 'vreemd', english: 'strange' },
					{ dutch: 'veilig', english: 'safe' },
					{ dutch: 'hout', english: 'wood', article: 'het' },
					{ dutch: 'bang', english: 'scared' },
					{ dutch: 'raam', english: 'window', article: 'het' },
					{ dutch: 'lelijk', english: 'ugly' },
					{ dutch: 'oever', english: 'river bank', article: 'de' },
					{ dutch: 'roeien', english: 'to row' },
					{ dutch: 'ontdekken', english: 'to discover' },
					{ dutch: 'akkoord gaan', english: 'to agree' },
					{ dutch: 'stof', english: 'dust', article: 'het' },
					{ dutch: 'voetafdruk', english: 'footprint', article: 'de' },
					{ dutch: 'in ieder geval', english: 'in any case' },
					{ dutch: 'lawaai', english: 'noise', article: 'het' },
					{ dutch: 'verdwijnen', english: 'to disappear' }
				],
				questions: [
					{
						id: 'cq_1_1_1',
						text: 'Sylvia en Joris zijn in ___.',
						options: ['Amsterdam', 'het Geuldal', 'Friesland', 'de Kaapse Bossen'],
						correctIndex: 1
					},
					{
						id: 'cq_1_1_2',
						text: 'Ze maken een wandeltocht naar een ___.',
						options: ['rivier', 'strand', 'klein plaatsje', 'stad'],
						correctIndex: 0
					},
					{
						id: 'cq_1_1_3',
						text: 'Terwijl ze over een pad lopen, zien Sylvia en Joris opeens een ___.',
						options: ['klein plaatsje', 'stad', 'winkel', 'huis'],
						correctIndex: 3
					},
					{
						id: 'cq_1_1_4',
						text: 'Als ze de boot op de rivier zien, ___.',
						options: [
							'gaan ze er niet in',
							'slapen ze erin',
							'besluiten ze dat het niet veilig is om erin te gaan',
							'roeien ze een stukje de rivier af'
						],
						correctIndex: 3
					},
					{
						id: 'cq_1_1_5',
						text: 'Op de rivier horen Sylvia en Joris een geluid ___.',
						options: ['in de boot', 'in het huis', 'op de rivier', 'in het bos'],
						correctIndex: 1
					}
				]
			},
			{
				id: 'cc_1_2',
				chapterNumber: 2,
				title: 'De zoektocht',
				text: '‘Zag je dat, Sylvia?’ vroeg Joris.\n\n‘Ja!’ antwoordde Sylvia. Wat was dat?\n\n‘Ik weet het niet! Maar het was heel groot en erg lelijk!’\n\n‘Ja … het was een één of ander wezen!’\n\nJoris keek Sylvia aan en zei, ‘laten we het volgen!’\n\nBen je gek?’ antwoordde Sylvia. ‘Dat doe ik niet!’\n\n‘Kom op! We zijn hier om te verkennen! Laten we het volgen!’\n\n‘Maar Joris! Ik ben er niet zo zeker van …’\n\nJoris en Sylvia verlieten het oude huis. Ze volgden de voetsporen\n\nvan het wezen het bos in. Ze keken om zich heen. Ten slotte zei\n\nJoris, ‘het wezen kan overal zijn. We moeten ons opsplitsen.’\n\n‘Opsplitsen?’ zei Sylvia verbaasd. ‘Ben je gek geworden, Joris? Er\n\nloopt hier een vreemd wezen rond. En we weten niet waar het is!’\n\n‘Dat weet ik,’ antwoordde Joris. ‘Maar we zouden er een foto van\n\nkunnen maken. Dan komen we misschien in het nieuws.’\n\n‘Wat bedoel je?’\n\n‘Vooruit, Sylvia,’ zei Joris. ‘Misschien is het een speciaal dier!\n\nMisschien is het nooit eerder gefotografeerd!’ Hij keek Sylvia aan en zei, ‘Misschien schrijven ze een artikel over ons! Misschien word ik geïnterviewd voor het journaal! We kunnen misschien …’\n\n‘Hou op! Je bent helemaal gek geworden, Joris. Ik zou je niet\n\nmoeten aanmoedigen, maar vooruit dan maar. Laten we ons dan maar opsplitsen.’\n\nJoris ging de ene kant op en Sylvia de andere. Sylvia zag geen\n\nenkel spoor van het wezen. Ze dacht nog eens diep na. Uiteindelijk\n\nkwam ze tot een simpele conclusie. Zij en Joris hadden zich het\n\nwezen ingebeeld. Het was niet echt.\n\nEen paar minuten later zag Sylvia Joris in het bos. Het was bijna donker. Ze vertelde Joris over haar conclusie. Ze vertelde hem dat het wezen niet echt was. Joris ging niet akkoord. Hij wist zeker dat het echt was. Ze moesten het alleen maar bewijzen.\n\nPlotseling zag Joris een struikgewas. Hij wilde gaan kijken of het wezen erin zat. Hij zei tegen Sylvia dat ze moest wachten. Terwijl Joris het struikgewas inging lachte en zwaaide hij.\n\nSylvia wachtte tot Joris eruit kwam. Ze wachtte een paar minuten. Joris kwam niet. Ze wachtte bijna een half uur. Nog steeds geen Joris!\n\nSylvia keek op haar mobiele telefoon. Er was geen ontvangst. Ze kon niet eens om hulp bellen. Op dat moment werd ze bang. Maar ze kon Joris niet zomaar alleen laten!\n\nPlotseling dacht ze: misschien is hij weer naar huis gegaan!\n\nMisschien is dit allemaal een grap!\n\nSylvia liep terug naar het oude huis. Ze keek om zich heen. Nog steeds geen Joris! Zij besloot te wachten. Als hij een grapje maakte, kon zij ook een grapje maken. Ze was van plan normaal te doen. Ze zou doen alsof het geen probleem was dat hij opeens was verdwenen. Ha! Dat zou leuk zijn!\n\nEr stond een oud bed in de woonkamer. Ze ging zitten en haalde een boterham uit haar rugzak. Ze at hem op en dacht na over Joris. Waar was hij? Wat kon ze doen?\n\nTerwijl Sylvia nadacht, werd ze moe. Ze kon niet meer nadenken. Wat een dag! Ik zal gewoon hier op Joris wachten en … Dat was het laatste waar ze aan dacht voordat ze in slaap viel.\n\nSylvia werd de volgende dag vroeg wakker. Joris was er nog steeds niet! Ze hoopte dat alles een droom was. Maar ze wist dat dit niet waar was. Ze maakte zich echt zorgen. Misschien was dit geen grap!\n\nSylvia besloot naar het dichtstbijzijnde dorp te gaan. Ze liep over\n\nhetzelfde pad terug. Eindelijk kwam ze in een klein plaatsje aan. Hoewel het zondag was, liepen er een heleboel mensen rond. Sylvia probeerde haar mobiele telefoon opnieuw. Nog steeds geen ontvangst. Niets! Ze had nu echt een telefoon nodig!\n\nSylvia ging naar een nabijgelegen restaurant. Daar waren veel\n\nmensen. Sylvia wist niet wat ze moest zeggen. Het was een zeer vreemde situatie! Uiteindelijk besloot ze niets te zeggen. Ze ging naar de eigenaar en zei: ‘Hallo. Mag ik uw telefoon even gebruiken?’\n\n‘Natuurlijk. Hij hangt daar aan de muur.’\n\n‘Heel hartelijk bedankt.’\n\nEerst belde Sylvia het nummer van Joris. Zijn mobiel ging niet\n\nover. Misschien was er iets mee? Toen besloot ze het huis van Joris te bellen. De telefoon ging één, twee, drie keer over. Waarom nam niemand op? De broer van Joris was ‘s ochtends gewoonlijk thuis. Vandaag niet. Sylvia belde opnieuw maar er nam niemand op. Ze liet een bericht achter. ‘Waar ben je, Joris!?’ vroeg ze.\n\nSylvia verliet het restaurant. Ze stond een paar minuten op straat\n\nen dacht na. Sylvia was een zelfstandige vrouw. Ze was een persoon die over alles goed nadacht. ‘Goed dan,’ dacht ze. ‘Laten we deze puzzel oplossen! Misschien is hij in het struikgewas\n\nverdwaald geraakt. En toen hij eruit kwam, was ik weg! Dus is hij naar huis gegaan. Dat is de oplossing!’\n\nSylvia moest teruggaan naar het huis van Joris. Ze rende terug\n\nnaar het restaurant en belde een taxi.\n\nNa 30 minuten arriveerde Sylvia bij het huis van Joris. ‘Dat is\n\nnegen euro,’ zei de chauffeur.\n\n‘Hier is tien euro,’ zei Sylvia. ‘Houd het wisselgeld maar!’\n\n‘Dank je wel! Fijne dag verder.’\n\nSylvia stapte uit de taxi en liep naar het huis van Joris. Het huis\n\nwas erg groot en mooi. Het had twee verdiepingen en een tuin. Het\n\nstond in een erg mooie wijk. Er stonden overal grote huizen en winkels. De auto van Joris stond voor het huis geparkeerd. Was Joris binnen? Had hij zijn familie gebeld?\n\nSylvia controleerde haar mobiele telefoon. Ze had nu ontvangst, maar er waren geen berichten. Ze belde Joris opnieuw. Ze liet nog een bericht achter en zei dat ze zich zorgen maakte. Ze vroeg hem om meteen contact met haar op te nemen!\n\nIk begrijp het niet, dacht ze. Joris is met zijn auto naar huis gereden. Dus waarom heeft hij me niet gebeld? Sylvia belde aan bij de voordeur. Er werd niet opengedaan. Ze belde nog drie keer aan, maar er kwam niemand.\n\nSylvia maakte zich zorgen. Ze ging naar het huis van haar twee vriendinnen, Claudia en Veronica. Haar vriendinnen waren ook niet thuis. Ze probeerde te bellen. Hun telefoons stonden uit. Er was zeker iets mis. Ze wist alleen niet wat. Al haar vrienden waren opeens weg!\n\nSylvia wist niet wat ze moest doen. Ze wilde geen contact met de politie opnemen. Ze wist dat Joris veilig was, omdat zijn auto thuis stond. Er waren geen vrienden in de buurt die ze om hulp kon vragen. Sylvia besloot iets te gaan doen. Ze moest Joris zelf gaan zoeken!\n\nSylvia nam weer een taxi terug naar het Geuldal. Ze volgde opnieuw het pad naar het bos vlakbij het huisje. Na een paar minuten zag ze het oude houten huis. Maar deze keer was er een verschil: er was licht in het huis!',
				summary:
					'Sylvia en Joris zijn op zoek naar een vreemd wezen in het bos. Joris verdwijnt. Sylvia gaat naar het oude huis om hem te zoeken. Daar is hij niet. Ze valt in slaap. Ze wordt de volgende dag wakker. Joris is er nog steeds niet. Ze maakt zich zorgen. Ze belt Joris opnieuw. Hij antwoordt niet. Ze gaat naar zijn huis. Ze ziet zijn auto. Maar ze vindt hem en haar vriendinnen niet. Ze gaat uiteindelijk terug naar het oude huis. De lichten in het huis zijn aan.\n\n***',
				vocabulary: [
					{ dutch: 'verkennen', english: 'to explore' },
					{ dutch: '(zich) opsplitsen', english: 'to split up, to separate' },
					{ dutch: 'aanmoedigen', english: 'to encourage' },
					{ dutch: 'zich inbeelden', english: 'to imagine' },
					{ dutch: 'bewijzen', english: 'to prove' },
					{ dutch: 'struikgewas', english: 'thicket, a group of bushes or plants', article: 'het' },
					{ dutch: 'ontvangst', english: 'reception', article: 'de' },
					{ dutch: 'grap', english: 'joke', article: 'de' },
					{ dutch: 'dichtsbijzijnde', english: 'nearest' },
					{ dutch: 'nabijgelegen', english: 'nearby' },
					{ dutch: 'eigenaar', english: 'owner', article: 'de' },
					{ dutch: 'bericht', english: 'message', article: 'het' },
					{ dutch: 'zelfstandig', english: 'independent' },
					{ dutch: 'oplossen', english: 'to solve' },
					{ dutch: 'verdwaald raken', english: 'to get lost' },
					{ dutch: 'wijk', english: 'neighbourhood', article: 'de' },
					{ dutch: 'verschil', english: 'difference', article: 'het' }
				],
				questions: [
					{
						id: 'cq_1_2_6',
						text: 'Sylvia denkt dat het wezen ___.',
						options: ['echt is', 'een grap is', 'Joris is', 'is ingebeeld'],
						correctIndex: 3
					},
					{
						id: 'cq_1_2_7',
						text: 'Later vindt Joris ___.',
						options: [
							'een speciale boom',
							'een ander huis',
							'de auto van Sylvia',
							'een groepje planten'
						],
						correctIndex: 3
					},
					{
						id: 'cq_1_2_8',
						text: 'Sylvia valt in slaap in ___.',
						options: ['het bos', 'de boot op de rivier', 'een bed in het huis', 'het dorp'],
						correctIndex: 2
					},
					{
						id: 'cq_1_2_9',
						text: 'Als Sylvia wakker wordt ___.',
						options: [
							'loopt ze naar een dorp in de buurt',
							'loopt ze naar het bosje',
							'belt ze zijn ouders',
							'belt ze haar ouders'
						],
						correctIndex: 0
					},
					{
						id: 'cq_1_2_10',
						text: 'Als ze terugkeert naar de rivier, ziet Sylvia ___.',
						options: [
							'brand in het huis',
							'lichten in het huis',
							'het wezen in het huis',
							'Joris in het huis'
						],
						correctIndex: 1
					}
				]
			},
			{
				id: 'cc_1_3',
				chapterNumber: 3,
				title: 'De verrassing',
				text: 'Sylvia kon het niet geloven. ‘Er branden lichten in het huis!’ riep ze. Ze volgde het pad naar de rivier. Ze liet haar rugzak achter naast een boom. Sylvia ging naar het huis.\n\nHet was laat in de middag, maar ze zag zeker oranje licht binnen.\n\nZe liep om het huis heen. Ze wilde zien wie er binnen was. Het moest Joris zijn!\n\n‘Hallo?’ schreeuwde ze. ‘Hier ben ik, Sylvia!’ Niemand\n\nantwoordde. Plotseling kwam er een geluid uit het huis. Oké, Joris, dacht Sylvia. Dit is niet leuk meer! Sylvia liep naar de deur en deed hem open. Ze was totaal niet voorbereid op wat ze zag.\n\nIedereen die ze kende was er! Er waren zoveel mensen in het\n\nhuis! Haar moeder was daar, andere familieleden, zelfs haar vriendinnen Claudia en Veronica!\n\n‘Sylvia!’ riep haar moeder. ‘Ik ben zo blij dat je er bent.’\n\n‘Hallo,’ zei Sylvia voorzichtig. Wat gebeurt hier?\n\n‘Nou,’ zei haar moeder. ‘Ga zitten. Ik zal het even uitleggen.’\n\nSylvia ging op het oude bed zitten. ‘Wat is er aan de hand?’ zei ze\n\nuiteindelijk. Iedereen om haar heen keek bezorgd. Niemand zei iets. ‘Waar is papa?’ vroeg ze aan haar moeder.\n\n‘Hij is op zijn werk. Hij komt gauw,’ antwoordde haar moeder.\n\nZe keek de kamer rond. ‘Kan iemand me alsjeblieft vertellen wat\n\ner aan de hand is?’ vroeg ze.\n\nHaar moeder ging staan en begon te praten. ‘We denken dat Joris\n\nverdwenen is. We denken dat hij door een wezen is meegenomen.’\n\n‘Wat zeg je? Hoe weet je dat we een wezen hebben gezien?’\n\n‘Joris heeft ons een bericht gestuurd. Hij zei dat hij hulp nodig had.\n\nEn toen was de batterij van zijn mobieltje leeg. We zijn hier om Joris te vinden.’\n\n‘Nu?’ vroeg Sylvia verbaasd.\n\n‘Ja nu.’\n\nAllemaal pakten ze hun rugzak. Ze deden hun zaklantaarns aan. Ze stonden klaar om op zoek te gaan naar Joris. Ze verlieten in groepjes het huis.\n\nSylvia stopte even bij de deur. Ze bleef daar een tijdje staan. Ik begrijp het gewoon niet, dacht ze. Joris zou niet zomaar alleen ervan door gaan. Hij zou me niet bang willen maken. En waarom stuurde hij een bericht naar mama? Waarom niet naar mij? En waarom zijn al mijn vriendinnen hier? En niet zijn vrienden? Zij schudde haar hoofd. Er klopt iets niet …\n\nEven later keek Sylvia om zich heen. Ze kon geen groepjes meer zien! Ze kon niemand meer zien! ‘Waar zijn jullie?’ riep ze. ‘Hallo? Kan iemand me horen?’ Sylvia liep naar het bos toe. Misschien zijn ze daar allemaal, dacht ze. Terwijl ze liep, pakte ze een zaklantaarn uit haar rugzak. Ze deed hem aan want het werd weer donker.\n\n‘Waar zijn jullie allemaal? Is hier iemand?’ riep ze. Er antwoordde niemand. Ik begrijp het niet, dacht ze. Ze keek om zich heen in het donkere bos. Plotseling draaide ze zich om. Het was beter om in het oude huis te wachten dan in het donker in het bos te lopen!\n\nSylvia ging terug naar het huis en ging weer op het oude bed zitten. Ze wachtte een paar minuten. Er kwam niemand. Plotseling hoorde Sylvia een geluid in de keuken. Ze kwam van het bed af. Ze liep langzaam naar de keuken. Ze probeerde geen geluid te maken. Ze wilde zien wat er aan de hand was. Misschien waren het haar vriendinnen? Of haar moeder? Ze deed de zaklantaarn aan. Toen zag ze het - het wezen! Het was erg lelijk en het kwam op haar af! Sylvia schreeuwde en rende het huis uit.\n\n‘Help!’ Help!’ riep ze. Er was niemand. Ze rende zo snel ze kon. Maar het wezen was sneller dan zij. Het was al snel vlak achter haar. Sylvia draaide zich om om het te zien. Ze viel in paniek op de grond.\n\nZe was erg bang, dus begon ze te schoppen. Het wezen hield haar\n\nbenen vast. Ze kon niet ontsnappen!\n\nSylvia bleef vechten. Maar plotseling stopte het wezen en ging het\n\nstaan. Het stak een hand uit naar Sylvia. Het wilde haar helpen om op te staan! ‘Wat is hier aan de hand?’ dacht Sylvia.\n\nPlotseling zag Sylvia beweging om haar heen. Al haar\n\nvriendinnen en familieleden kwamen uit het bos. Ze hadden hun zaklantaarns aan. Maar ze hadden ook iets anders in hun hand— kaarsen! En ze zongen iets. Ze kende het liedje goed.\n\nOp dat moment begreep Sylvia alles. Het wezen trok zijn kostuum\n\nuit. Het was haar vader! ‘Hartelijk gefeliciteerd met je verjaardag, Sylvia!’ zei hij. Toen zong hij met de anderen mee.\n\n‘Lang zal ze leven!’ zong iedereen om haar heen. Sylvia wist niet\n\nof ze moest lachen of huilen.\n\n‘Papa, was jij het wezen? Was jij het de hele tijd?’ vroeg Sylvia\n\nverbaasd.\n\n‘Ja, schat. Ja, ik was het de hele tijd. Ik vond het leuk die rol te\n\nmogen spelen!’ lachte hij. Toen ging hij verder, ‘we hadden het feest\n\ngisteren gepland. Maar toen gebeurde er iets op het kantoor van je moeder. Dus moesten we het feest tot vandaag uitstellen. Joris had een geweldig plan. Het was zijn idee om je voor de gek te houden. Hij deed dat om je twee dagen naar hier te krijgen.’\n\n‘Echt waar? Ja, hij heeft me zeker voor de gek gehouden,’ zei\n\nSylvia terwijl ze om zich heen keek. ‘En waar is Joris?’\n\nJoris kwam van achter een boom uit. Hij was helemaal schoon en\n\nhij was helemaal veilig.\n\n‘Het spijt me, Sylvia,’ zei Joris. ‘We hebben je flink voor de gek\n\ngehouden. Maar we wilden je een verjaardag geven om nooit te vergeten. En je krijgt echt een geweldig cadeau!’\n\nSylvia’s vader gaf haar een verjaardagskaart.\n\n‘In ruil voor die grap? Dan moet het beslist een geweldig cadeau\n\nzijn!’ zei Sylvia lachend. Ze vouwde de kaart open. Er zaten verschillende papiertjes in. ‘Wat is dit?’ vroeg ze en keek om zich heen.\n\nSylvia’s vriendinnen en familieleden tilden haar op. Ze droegen\n\nhaar naar de voorkant van het huis. ‘We hebben dit oude huis voor je gekocht, schat! Het huis is je verjaardagscadeau!’ zei haar moeder.\n\nSylvia’s vader kwam bij hen staan. ‘We gaan het samen\n\nrestaureren,’voegdehij eraantoe. ‘Het wordt je zomerhuis!’\n\nSylvia begon te lachen. Toen begon ze te huilen van opluchting. Joris was veilig. Zij was veilig. En dit gekke oude huisje was van haar!\n\nEindelijk kon Sylvia weer praten. ‘Nou,’ begon ze, ‘ik wil jullie allemaal bedanken voor de verjaardagsverrassing. En mam, pap, ik kan niet geloven dat dit huis van mij is, dank je wel!’\n\nToen keek ze haar vader en Joris aan. ‘Pap, dat was een hele\n\nvoorstelling. Ik wil het wezen even een belangrijk advies geven. Hij is als bezoeker nooit meer welkom!’ De groep lachte en zong toen nog wat meer. Toen liepen ze het huisje binnen. Het was tijd voor koffie en gebak. Het was ook tijd voor het feestvarken om even goed uit te rusten!',
				summary:
					'Sylvia keert terug naar het huisje om Joris te zoeken. Er brandt licht. Ze gaat naar binnen. Haar familieleden en vriendinnen zijn er. Ze zeggen dat ze er zijn om Joris te zoeken. Sylvia begrijpt het niet. Haar vriendinnen gaan in het bos zoeken. Sylvia denkt na over haar situatie. Ze gaat terug naar het huisje. Daar ziet ze het wezen. Ze rent en hij volgt haar naar het bos. Ze valt en vecht, maar daarna helpt het wezen haar weer opstaan. Het is eigenlijk haar vader! Het wezen is een deel van haar verjaardagsverrassing en het huisje is haar cadeau.\n\n***',
				vocabulary: [
					{ dutch: 'zeker', english: 'definitely' },
					{ dutch: 'voorbereiden', english: 'to prepare' },
					{ dutch: 'voorzichtig', english: 'cautiously' },
					{ dutch: 'uitleggen', english: 'to explain' },
					{ dutch: 'zaklantaarn', english: 'torch, (*Am. Eng*.) flashlight', article: 'de' },
					{ dutch: 'hier klopt iets niet', english: 'something just doesn’t add up' },
					{ dutch: 'schoppen', english: 'to kick' },
					{ dutch: 'ontsnappen', english: 'to escape' },
					{ dutch: 'beweging', english: 'movement', article: 'de' },
					{ dutch: 'kaars', english: 'candle', article: 'de' },
					{ dutch: 'schat', english: 'treasure, darling', article: 'de' },
					{ dutch: 'kantoor', english: 'office', article: 'het' },
					{ dutch: 'iemand voor de gek houden', english: 'to play a trick on someone' },
					{ dutch: 'ruil', english: 'exchange', article: 'de' },
					{ dutch: 'optillen', english: 'to lift' },
					{ dutch: 'restaureren', english: 'to renovate' },
					{ dutch: 'toevoegen', english: 'to add' },
					{ dutch: 'opluchting', english: 'relief', article: 'de' },
					{ dutch: 'voorstelling', english: 'performance', article: 'de' },
					{ dutch: 'feestvarken', english: 'birthday girl (or boy)', article: 'het' }
				],
				questions: [
					{
						id: 'cq_1_3_11',
						text: 'De eerste keer dat Sylvia het huis ingaat, ziet ze ___.',
						options: [
							'Joris',
							'haar vader',
							'bijna al haar vriendinnen en familieleden',
							'het wezen'
						],
						correctIndex: 2
					},
					{
						id: 'cq_1_3_12',
						text: 'Terwijl Sylvia bij de bossen staat na te denken, ___.',
						options: [
							'komt er iets vreemds uit het water',
							'staat haar vader opeens achter haar',
							'ziet ze het wezen',
							'gaan haar vriendinnen weg'
						],
						correctIndex: 3
					},
					{
						id: 'cq_1_3_13',
						text: 'Sylvia besluit ___.',
						options: [
							'naar het struikgewas te gaan om Joris te zoeken',
							'Joris te bellen',
							'om naar het dorp terug te gaan',
							'terug te gaan naar het huisje'
						],
						correctIndex: 3
					},
					{
						id: 'cq_1_3_14',
						text: 'Als Sylvia weer in het huis staat ___.',
						options: [
							'hoort ze een geluid in de keuken',
							'gaat haar mobieltje over',
							'stappen Claudia en Veronica het huis binnen',
							'valt ze in slaap'
						],
						correctIndex: 0
					},
					{
						id: 'cq_1_3_15',
						text: 'Het wezen was ___.',
						options: ['de moeder van Sylvia', 'Joris', 'de vader van Sylvia', 'een echte beer'],
						correctIndex: 2
					}
				]
			}
		]
	},
	// ---- RANK 2: De ridder ----
	{
		id: 'cs_2',
		rank: 2,
		title: 'De ridder',
		chapters: [
			{
				id: 'cc_2_1',
				chapterNumber: 1,
				title: 'Goud',
				text: 'Er was eens, heel lang geleden, een groot koninkrijk. Het was vol interessante mensen, dieren en dingen. Op een dag kwam er een ridder naar het koninkrijk. Hij was helemaal in zwart en wit gekleed. Hij zag er heel sterk uit.\n\nDe ridder kwam naar de belangrijkste stad. Hij stopte op het marktplein. Hij wilde iets kopen. Het was iets wat heel bijzonder was.\n\nHet marktplein was erg groot. Het was vol mensen. Er waren diverse producten te koop. De ridder liep langzaam over het plein. Hij ging direct naar een donkere hoek van de markt. Daar zag hij een handelaar.\n\nDe handelaar had een bijzonder assortiment aan artikelen. De ridder keek naar de producten. ‘Dag handelaar,’ zei hij.\n\n‘Ja, meneer?’\n\n‘Ik ben op zoek naar een toverdrank. Heeft u die?\n\n‘Toverdrank? Nee, hier hebben we geen toverdranken. Geen enkele.’\n\nDe ridder keek de handelaar aan. Toen zei hij, ‘ik denk dat u wel weet wat ik wil.’\n\n‘Oh, ja. Oh … oh … een toverdrank. Hm … wat voor toverdrank?’\n\n‘Een krachtdrank.’\n\nDe handelaar keek om zich heen. Daarna keek hij de ridder aan.\n\n‘Hier heb ik er geen. Tegenwoordig is er niet veel. Het … eh … “product” dat ik moet maken, is moeilijk te vinden.’ De handelaar stopte en keek weer om zich heen. Toen zei hij, ‘ik kan wel wat voor u maken, maar het zal heel duur zijn.’\n\n‘Ik heb goud. Ik heb twee krachtdranken nodig. Hoe lang duurt\n\nhet?’\n\n‘Kom vanavond terug. Dan zijn ze klaar.’ De ridder knikte en liep\n\nweg.\n\nDe ridder liep over het plein. De mensen keken hem aan. Ze\n\nkenden hem niet. Toch was de ridder beroemd. Hij was een\n\nonafhankelijkestrijder. Zijn naam was Lars. Hij reisde van koninkrijk naar koninkrijk. Hij vocht tegen veel mannen. Hij vocht vaak voor koningen.\n\nLars ging een stenen brug over. Toen zag hij het kasteel. Het was\n\nheel groot met hoge muren. Lars kwam aan bij de deur van het\n\nkasteel. Toen werd hij door twee bewakers gestopt. ‘Wie bent u?’ vroeg een van de bewakers.\n\n‘Mijn naam is Lars. Ik wil de koning spreken.’\n\n‘Dat kan niet. Ga nu weg.’\n\nLars keek de bewaker aan. Hij deed een paar stappen terug. Hij\n\nzette zijn tas neer. Er zaten veel ongewone artikelen in de tas. Lars\n\nhaalde een oude rol uit de tas. Hij gaf hem aan de bewaker.\n\n‘Kijk eens naar deze rol. Hij is van de koning,’ zei Lars. De bewaker keek naar de rol. Hij zag er officieel uit. Er stond ook het zegel van de koning op.\n\n‘Prima,’ zei de bewaker. ‘Kom binnen.’\n\nDe ridder stapte naar voren. Hij liep een grote kamer in en\n\nwachtte. De kamer was erg groot en mooi. Er waren diverse\n\nbewakers. Ze keken de ridder achterdochtig aan. Ze wilden weten waarom hij hier was.\n\nAl gauw kwam de koning binnen. Zijn naam was Andur. Hij was\n\ngeheel in het paars gekleed. Paars was de kleur van koningen. Hij droeg goud om zijn armen en hals. ‘Ben jij Lars?’ vroeg koning Andur.\n\n‘Dat ben ik,’ antwoordde Lars. Lars hield de rol omhoog. ‘Ik wil u\n\nspreken.’\n\n‘Ga met me mee,’ zei de koning.\n\nKoning Andur en Lars gingen naar een kleinere kamer. De twee\n\nmannen gingen zitten. De koning bood Lars een koele drank aan. Lars zei: ‘Ja, graag.’\n\n‘Fijn dat u gekomen bent,’ zei de koning tegen Lars. ‘Ik zie dat u mijn boodschap heeft ontvangen.’\n\n‘Ja. Ik hoor ook dat u hulp nodig heeft.’\n\n‘Wat heeft u precies gehoord?’\n\n‘U heeft iemand nodig om een lading goud tevervoeren. Hij moet naar uw broer Arthuren. U heeft een man nodig die u kunt vertrouwen. Ik ben die man.’\n\nDe koning dacht een paar minuten na. Tenslotte zei hij, ‘En waarom zou ik u vertrouwen?’\n\n‘Ik heb u al eens eerder geholpen. Nu zal ik u ook niet verraden.’\n\n‘Oorlog en goud zijn verschillende dingen. En dit is veel geld.’\n\n‘Ik heb geen goud nodig. Ik heb goud.’\n\n‘Waarom bent u dan hier?’\n\n‘Ik hou ervan om te reizen en om nieuwe dingen te ontdekken.’\n\nKoning Andur dacht een ogenblik na. Hij keek achterdochtig. Lars glimlachte. Na een ogenblik zei de koning: ‘Oké, Lars. Breng het goud naar mijn broer. Ik zal het tegen mijn bewakers zeggen.’\n\n‘Dank u wel, koning Andur.’\n\n‘Bedank me nu nog niet. Eerst moet ik van Arthuren horen dat het goud is aangekomen. Dan krijgt u pas uw eigen goud.’\n\nLars verliet het kasteel. Hij liep naar de bewakers toe. Eén van de bewakers riep, ‘Dus u bent weer terug! We hebben het net gehoord. U brengt het goud naar het koninkrijk van Arthuren?’\n\n‘Ja.’\n\n‘Nou dan, goede reis!’ lachte de bewaker. ‘Er zijn veel gevaren op\n\nde weg. U overleeft het niet!’ De andere bewakers lachten mee. Toen werd de bewaker serieus. ‘Mannen,’ riep hij, ‘leg het goud klaar. Ze vertrekken morgen.’\n\nHet was nu avond. De ridder ging terug naar het marktplein. Hij vond de handelaar. ‘Heeft u mijn toverdranken?’ vroeg hij.\n\n‘Ja, hier zijn ze. Het was niet makkelijk! En het was erg duur. Dat\n\nis dan zes stukken goud.’ De ridder keek hem verbaasd aan. Hij gaf hem het goud. De koopman gaf hem de toverdranken. ‘Dank u wel, mijn beste heer,’ zei de koopman. ‘En een fijne dag.’\n\nDe ridder liep zonder iets te zeggen weg.\n\nDe volgende dag kwamen drie bewakers bij Lars. Ze gingen met\n\nde ridder mee op weg. Ze hadden wapens mee. Als het moest stonden ze klaar om te vechten.\n\nDe vier mannen liepen naar de Noorderweg. Die ging recht naar\n\nhet koninkrijk van Arthuren. Bij de weg stonden de paarden met het goud op ze te wachten.\n\nDe hoofdbewaker heette Alfred. Hij draaide zich naar Lars. ‘Bent u\n\nklaar?’ vroeg hij.\n\n‘Ja. We kunnen gaan.’\n\n‘Voordat we vertrekken,’ zei Alfred, ‘moet ik u iets zeggen. Wij zijn\n\nde allerbeste bewakers van de koning. We zullen u onderweg\n\nbeschermen. Maar dit goud is niet van u. Als u het probeert te\n\nstelen, dan vermoorden wij u.’\n\n‘Dat is goed om te weten,’ zei Lars glimlachend. Alfred keek Lars recht in de ogen. ‘Dit is geen grap. Het is waar.’\n\n‘Ik begrijp het. Laten we nu vertrekken.’\n\nDe lading goud lag achterin een rijtuig. Lars keek naar de zakken en glimlachte. De paarden begonnen zich langzaam te bewegen. De groep begon langzaam te lopen.',
				summary:
					'Een ridder die Lars heet reist naar het koninkrijk van koning Andur. Hij koopt twee krachtdranken. Dan gaat hij naar het kasteel. Hij spreekt met de koning. De koning vraagt Lars om goud naar de broer van de koning te brengen. Drie bewakers zullen met de ridder meegaan. De bewakers zullen zorgen dat het goud veilig is. Zij zullen de ridder vermoorden als hij het goud steelt. De groep vertrekt.\n\n***',
				vocabulary: [
					{ dutch: 'ridder', english: 'knight', article: 'de' },
					{ dutch: 'koninkrijk', english: 'kingdom', article: 'het' },
					{ dutch: 'handelaar', english: 'trader', article: 'de' },
					{ dutch: 'toverdrank', english: 'potion', article: 'de' },
					{ dutch: 'kracht', english: 'power', article: 'de' },
					{ dutch: 'tegenwoordig', english: 'these days' },
					{ dutch: 'knikken', english: 'to nod' },
					{ dutch: 'beroemd', english: 'famous' },
					{ dutch: 'onafhankelijk', english: 'independent' },
					{ dutch: 'strijder', english: 'fighter, warrior', article: 'de' },
					{ dutch: 'bewaker', english: 'guard', article: 'de' },
					{ dutch: 'rol', english: 'scroll', article: 'de' },
					{ dutch: 'zegel', english: 'seal, stamp', article: 'het' },
					{ dutch: 'achterdochtig', english: 'suspiciously, suspicious' },
					{ dutch: 'aanbieden', english: 'to offer' },
					{ dutch: 'lading', english: 'load', article: 'de' },
					{ dutch: 'vervoeren', english: 'to transport' },
					{ dutch: 'vertrouwen', english: 'to trust' },
					{ dutch: 'verraden', english: 'to betray' },
					{ dutch: 'oorlog', english: 'war', article: 'de' },
					{ dutch: 'ogenblik', english: 'moment', article: 'het' },
					{ dutch: 'overleven', english: 'to survive' },
					{ dutch: 'beschermen', english: 'to protect' },
					{ dutch: 'vermoorden', english: 'to kill, to murder' },
					{ dutch: 'rijtuig', english: 'wagon, carriage', article: 'het' }
				],
				questions: [
					{
						id: 'cq_2_1_1',
						text: 'Lars is gekleed in ___.',
						options: ['zwart en rood', 'zwart en wit', 'zwart en blauw', 'wit en rood'],
						correctIndex: 1
					},
					{
						id: 'cq_2_1_2',
						text: 'Lars koopt ___.',
						options: [
							'een krachtdrank',
							'twee krachtdranken',
							'een toverdrank om goud te krijgen',
							'twee toverdranken om goud te krijgen'
						],
						correctIndex: 1
					},
					{
						id: 'cq_2_1_3',
						text: 'Bij de deur naar het kasteel spreekt Lars met ___.',
						options: ['de koning', 'een boze handelaar', 'de broer van de koning', 'een bewaker'],
						correctIndex: 3
					},
					{
						id: 'cq_2_1_4',
						text: 'Lars en de bewakers vervoeren ___.',
						options: ['wapens', 'dure toverdranken', 'een lading goud', 'bewakers'],
						correctIndex: 2
					},
					{
						id: 'cq_2_1_5',
						text: 'De groep gaat naar ___.',
						options: [
							'een onbekend koninkrijk',
							'het koninkrijk van de broer van koning Andur',
							'het koninkrijk van koning Andur',
							'het marktplein van het koninkrijk'
						],
						correctIndex: 1
					}
				]
			},
			{
				id: 'cc_2_2',
				chapterNumber: 2,
				title: 'De reis',
				text: 'Lars en de bewakers namen de Noorderweg. Achter hen volgden de paarden en het rijtuig met goud. Na een tijdje zei Alfred, de hoofdbewaker, ‘Lars, wat komen we onderweg tegen?’\n\n‘Het is geen gemakkelijke weg. Hij is heel gevaarlijk,’ antwoordde Lars.\n\n‘Dus, wat zullen we doen?’\n\n‘Nou er lopen heel wat gevaarlijke mannen en dieren over deze\n\nweg. Ik stel voor dat we uit hun buurt blijven. We moeten proberen niet te vechten.’\n\n‘Kun je goed vechten, Lars?’\n\n‘Ik sta erom bekend. Ik kan erg goed vechten.’\n\n‘Dat hoop ik,’ zei Alfred. Ze bleven lopen.\n\nAl gauw gingen de drie mannen over een grote stenen brug. Hij\n\nleek op de brug bij het kasteel van koning Andur.\n\n‘Lars,’ zei Alfred. ‘Deze brug lijkt erg veel op de kasteelbrug.’\n\n‘Ja. jullie hebben hem lang geleden gebouwd.’\n\n‘Hebben wij hem gebouwd?’ zei Alfred verbaasd.\n\n‘Nou, niet jullie persoonlijk. De mensen van jullie koninkrijk. Zij\n\nhebben hem lang geleden gebouwd. Ze hebben hem met een reden gebouwd. Maar dat ga ik je niet nu vertellen.\n\nDe mannen gingen de brug over. Daarna liepen ze een groot bos in. Er stonden heel veel bomen. Maar er waren geen dieren. Het was er zelfs stil.\n\n‘Waarom zijn deze bossen zo stil?’ vroeg Alfred.\n\n‘We zijn nu in De Stille Bossen. Hier zijn geen dieren.’\n\n‘Waarom niet?’\n\n‘Er was hier heel lang geleden een grote veldslag. Het was tussen koning Andur en zijn broer.’\n\nAlfred was jong. Hij wist niets over het gevecht. Hij dacht dat\n\nkoning Andur en koning Arthuren elkaar vertrouwden.\n\n‘Je ziet er verbaasd uit, Alfred,’ zei Lars.\n\n‘Dat ben ik ook,’ antwoordde Alfred.\n\n‘Waarom?’\n\n‘Ik dacht dat de twee broers nooit vochten.’\n\nLars lachte. ‘Ik snap het. Nou, dat deden ze wel. Maar dat was\n\nheel veel jaren geleden.’ Lars hield op met praten. De mannen gingen verder.\n\nHet was erg donker in De Stille Bossen. De bomen waren hoog.\n\nJe kon weinig daglicht zien. Wat later vroeg Alfred, ‘Weet je waar we naartoe gaan, ridder?’\n\n‘Ja. Ik ben hier al eens geweest.’\n\n‘Wanneer?’ vroeg Alfred.\n\n‘Lang geleden.’\n\nLars dacht aan vroeger. Hij herinnerde zich het gevecht tussen\n\nkoning Andur en koning Arthuren. Het was een van de grootste\n\nveldslagen in de geschiedenis. Hiervoor werden de bossen De Dierenbossen genoemd. Maar na het gevecht werden ze De Stille Bossen genoemd.\n\nLars bleef praten. ‘Toen ik jonger was, vocht ik voor koning Andur.\n\nIk was bij het gevecht in deze bossen.’\n\n‘Waar ging dat gevecht om?’\n\n‘Koning Andur begon.’\n\n‘En waarom vocht hij tegen zijn broer?’\n\n‘Koning Andur wilde een fontein in het bos.’\n\nLars wandelde een paar minuten in stilte. Alfred bleef stil, maar hij\n\ndacht na. Hij wilde meer weten over de grote veldslag. Hij had altijd\n\ngedacht dat koning Andur een vreedzame koning was.\n\n‘Mag ik je iets vragen, Lars?’\n\n‘Ja.’\n\n‘Wat voor soort fontein is het eigenlijk?’\n\n‘Wacht maar af, dan zie je het vanzelf,’ was alles wat Lars zei. Lars en Alfred zeiden een uur lang niets. De andere bewakers spraken soms zachtjes. Er waren alleen maar bomen en stilte -\n\nverder niets. Ten slotte kwam de groep bij een meer.\n\n‘We zijn er,’ zei de ridder.\n\n‘Wat is dit?’\n\n‘Heel lang geleden was dit meer een fontein.’\n\n‘De fontein waar het gevecht om ging?’\n\n‘Ja.’\n\nDe bewakers en de ridder liepen naar het meer. Uiteindelijk sprak Lars. ‘Er was hier heel lang geleden een fontein. Er was niet veel water. Lang niet zoveel als nu. Maar het water was toen betoverd. Als je dat water dronk, dan kreeg je een bijzondere kracht.’\n\n‘Wat voor soort kracht?’ vroeg een van de bewakers.\n\n‘Als iemand dat water dronk, dan werd hij of zij heel sterk.’\n\nAlfred vormde een kom met zijn handen. Hij dronk wat water.\n\n‘Het smaakt heel normaal,’ zei hij.\n\n‘Natuurlijk,’ zei Lars. ‘Het is nu gewoon water. Het was heel lang geleden betoverd.’\n\nAlfred droogde zijn handen af en vroeg: ‘Wat gebeurde er precies? Waarom is het water nu niet meer betoverd?’\n\nLars keek hem aan en begon te vertellen. ‘Zowel Andur en\n\nArthuren wilden de macht. Ze zouden er alles voor doen. Op een dag hoorden ze over een toverfontein. Een fontein die mensen sterk maakte. Meteen wilden beide koningen hem hebben. Ze renden het bos in. Toen ze elkaar bij de fontein tegenkwamen begon het gevecht.’\n\n‘Wat deden ze?’ vroeg Alfred.\n\n‘Beide koningen riepen hun soldaten op. De veldslag duurde\n\ndagen, weken en daarna maanden. Het was vreselijk. Tijdens het gevecht dronken de mannen zoveel water als ze konden. Ze wilden sterk zijn om te winnen. Ze lieten hun paarden erin rollen. Ze liepen erdoorheen. Ze baadden erin. Ze gebruikten al het water. Al gauw\n\nraakte het water bevuild. Men kon het niet meer gebruiken.’\n\nHij keek de bewakers aan. ‘Na een tijdje was de fontein\n\nopgedroogd. Het begon te regenen en er kwam een meer. Maar het was geen betoverd water.’\n\nAlfred keek hem aan. ‘Dus dat was het einde van het toverwater?’\n\n‘Niet helemaal,’ zei Lars. Hij keek Alfred ernstig aan. ‘Arthuren had een klein beetje toverwater bewaard. En hij kende een geheim. Je kan toverwater maken. Je hebt er origineel toverwater en tijd voor nodig, maar het is mogelijk.’\n\n‘Dus dat is het geheim …’ begon Alfred.\n\n‘Nou, dat is slechts een deel van het geheim. Ga nu mee. Laten\n\nwe dit bos verlaten.’\n\nDe groep ging weer verder op weg. Al gauw verlieten ze het bos.\n\nDe zon scheen. De bomen waren niet zo hoog. Ze hadden een prachtig uitzicht over het landschap.\n\n‘Waar zijn we?’ vroeg Alfred.\n\n‘We zijn bijna bij het kasteel van Arthuren. Het is goed dat we\n\ngeen gevaar zijn tegengekomen.’\n\nAlfred keek hem aan. ‘Zijn er echt gevaren in die bossen?’ Lars keek achterom. ‘Ja. Waarom denk je dat we overdag hebben gereisd? Ze tonen zich meestal ‘s nachts.’\n\n‘Waarom heb je mij dat niet verteld?’\n\n‘Ik had niet verwacht dat je mee zou komen,’ zei Lars. Hij lachte.\n\nToen zei hij: ‘Oké, laten we gaan.’\n\nDe groep kwam bij een stad. In die stad was een groot kasteel. De\n\nbewakers waren nog nooit in een ander koninkrijk geweest. ‘Is dit het?’ vroeg Alfred.\n\n‘Nou, dit is het koninkrijk. En dat is het kasteel van Arthuren. We\n\nbrengen het goud daar naartoe.’\n\nAlfred stopte. ‘Lars,’ begon hij, ‘er is iets wat ik je niet heb\n\ngevraagd …’\n\n‘Wat is dat?’\n\n‘Waar is dit goud voor? Is het een vorm van belasting?\n\n‘Koning Andur verloor het gevecht om De Stille Bossen. Dus nu moet hij zijn broer om de vijf jaar in goud betalen.’\n\n‘Waarom betaalt hij? Kunnen ze geen vrede sluiten?’\n\n‘Zij hebben vrede gesloten. Maar Arthuren heeft iets wat koning Andur niet heeft. Andur moet het kopen.’\n\nAlfred keek Lars verbaasd aan. ‘Wat heeft Arthuren?’\n\n‘Meer toverwater. Andur koopt het om zijn mensen tevreden te houden. Ze gebruiken het om krachtdranken te maken. Zoals deze twee toverdranken hier.’ Lars toonde de toverdranken die hij had gekocht.\n\n‘Ik heb over de toverdranken gehoord! Werken ze echt?’\n\n‘Jazeker,’ zei Lars. Hi deed de toverdranken weg en keek Alfred aan. ‘Ze werken alleen maar als ze van echt toverwater zijn gemaakt. Ga nu mee. Het is tijd om te gaan.’',
				summary:
					'Lars en de bewakers van koning Andur beginnen aan hun reis. Onderweg vertelt de ridder een verhaal. Andur vocht in een grote veldslag tegen zijn broer Arthuren. De veldslag ging om een fontein met toverwater. Het toverwater gaf de mensen kracht. Tijdens het gevecht raakte het water op. Maar koning Arthuren had nog wel toverwater. Hij verkoopt het aan koning Andur. Andur stuurt goud om voor meer toverwater te betalen.\n\n***',
				vocabulary: [
					{ dutch: 'voorstellen', english: 'to suggest' },
					{ dutch: 'lijken op', english: 'to look like' },
					{ dutch: 'reden', english: 'reason', article: 'de' },
					{ dutch: 'stil', english: 'silent' },
					{ dutch: 'veldslag', english: 'battle', article: 'de' },
					{ dutch: 'gevecht', english: 'to fight', article: 'het' },
					{ dutch: 'geschiedenis', english: 'history', article: 'de' },
					{ dutch: 'fontein', english: 'fountain', article: 'de' },
					{ dutch: 'vreedzaam', english: 'peaceful' },
					{ dutch: 'meer', english: 'lake', article: 'het' },
					{ dutch: 'betoverd', english: 'enchanted, magic' },
					{ dutch: 'macht', english: 'power to rule', article: 'de' },
					{ dutch: 'soldaat', english: 'soldier', article: 'de' },
					{ dutch: 'vreselijk', english: 'terrible' },
					{ dutch: 'baden', english: 'to bathe' },
					{ dutch: 'bevuild', english: 'foul, polluted' },
					{ dutch: 'toverwater', english: 'magic water', article: 'het' },
					{ dutch: 'geheim', english: 'secret', article: 'het' },
					{ dutch: 'ernstig', english: 'seriously' },
					{ dutch: 'tonen', english: 'to show' },
					{ dutch: 'belasting', english: 'tax', article: 'de' },
					{ dutch: 'verliezen', english: 'to lose' },
					{ dutch: 'vrede', english: 'peace', article: 'de' }
				],
				questions: [
					{
						id: 'cq_2_2_6',
						text: 'Lars de ridder ___.',
						options: [
							'weet de weg naar het koninkrijk van Arthuren',
							'weet de weg naar het koninkrijk van Arthuren',
							'vraagt de weg naar het koninkrijk van Arthuren',
							'raakt de weg kwijt naar het koninkrijk van Arthuren'
						],
						correctIndex: 0
					},
					{
						id: 'cq_2_2_7',
						text: '___ op weg naar het koninkrijk van koning Arthuren.',
						options: [
							'Drie bewakers en Lars zijn',
							'Twee bewakers en Lars zijn',
							'Eén bewaker en Lars zijn',
							'Alleen Lars is'
						],
						correctIndex: 0
					},
					{
						id: 'cq_2_2_8',
						text: 'In De Stille Bossen ___.',
						options: [
							'is er nooit iets gebeurd',
							'was er eens een gevecht tussen twee broers',
							'was er eens een oorlog waar niemand van wist',
							'zijn er veel dieren'
						],
						correctIndex: 1
					},
					{
						id: 'cq_2_2_9',
						text: 'De fontein in De Stille Bossen ___.',
						options: [
							'is er nog steeds',
							'heeft nooit bestaan',
							'is nu weg',
							'was altijd een meer'
						],
						correctIndex: 2
					},
					{
						id: 'cq_2_2_10',
						text: 'Als zij uit De Stille Bossen komen ___.',
						options: [
							'is er nog een tweede bos',
							'kan de groep de zee zien',
							'besluit de groep terug te gaan naar het koninkrijk van koning',
							'kan de groep het koninkrijk van koning Arthuren zien'
						],
						correctIndex: 3
					}
				]
			},
			{
				id: 'cc_2_3',
				chapterNumber: 3,
				title: 'Het geheim',
				text: 'Lars, Alfred en de bewakers liepen naar het kasteel van Arthuren. ‘Hoe komen we in het kasteel?’ vroeg Alfred.\n\n‘Door de voordeur,’ zei Lars en hij lachte heel hard. Toen keek hij\n\nAlfred vreemd aan. Alfred bleef stil. Er klopt iets niet, dacht Alfred.\n\nDe groep liep door het platteland. Er waren diverse bomen en\n\nvelden. Ze zagen veel gras. Onderweg kwamen ze veel boeren tegen. De boeren woonden buiten de kasteelmuren. Ze verbouwden voedsel voor het koninkrijk.\n\nEén van de boeren zag de groep. Ze waren vlakbij zijn veld. Hij\n\nstopte met werken en sprak hen aan. ‘Goedemiddag, meneer!’ zei de boer tegen Lars.\n\n‘Goedemiddag,’ riep Lars terug.\n\n‘Waar gaat u naartoe?’\n\n‘Ik ga naar het kasteel. We moeten naar de koning.’ De vrouw van de boer kwam naar hen toe. ‘Wie zijn deze mannen?’ fluisterde ze tegen haar man. Haar man antwoordde niet. Al gauw vroeg de boer: ‘Wie zijn jullie? Ik zie dat jullie paarden een flinke lading dragen.’\n\n‘Koning Andur heeft ons gestuurd. Hij heeft ons een belangrijke\n\nopdracht gegeven.’\n\nDe boer werd stil. Toen sprak hij, ‘ik hoop dat er niets ernstigs is\n\ngebeurd?’ Hij keek Lars bezorgd aan.\n\n‘Nee, maakt u zich geen zorgen,’ antwoordde Lars met een\n\nglimlach. ‘Alles is in orde.’\n\n‘Nou. Goede reis dan maar,’ zei de boer. Hij ging verder met zijn\n\nwerk.\n\nDe groep liep verder door de velden. Alfred draaide zich om naar\n\nde ridder: ‘Het leek alsof ze bang waren,’ zei hij.\n\n‘Dat waren ze.’\n\n‘Maar waarom?’\n\n‘Omdat er een geheim is. Alleen de mensen in dit koninkrijk weten\n\nhet. En ze willen het goed bewaren.’\n\n‘En wat is het? Is het iets gevaarlijks?’\n\nLars antwoordde niet.\n\nAl gauw kwamen de mannen bij een grote stenen brug. Het was in de buurt van het kasteel. Alweer leek hij op de brug bij het kasteel van koning Andur. Er waren twee bewakers op de brug. Een van hen kwam naar hen toe. Hij keek naar Alfred: ‘Zijn jullie de mannen van koning Andur?’\n\n‘Ja. En ik vertegenwoordig de koning,’ antwoordde Alfred. Toen wees hij op Lars. ‘Deze ridder heeft ons tijdens de reis beschermd. De andere twee bewakers horen ook bij ons.’ De bewaker keek naar het rijtuig. Toen vroeg hij: ‘Is dat het goud?’\n\n‘Ja,’ antwoordde Lars. ‘Dat is het goud.’\n\n‘Oké,’ zei de bewaker. ‘U mag erdoor.’\n\nAlfred keek Lars verbaasd aan. ‘Lars lijkt het koninkrijk van Arthuren heel goed te kennen,’ dacht Alfred.\n\nDe bewaker gaf een teken om de deur te openen. Er stond nog een bewaker bij de deur toen ze erdoor gingen. Ze liepen het marktplein van het kasteel op. Er waren veel mensen. Veel van hen waren markthandelaren. Anderen waren boeren.\n\nDe groep liep over het plein. Plotseling keek Alfred verbaasd. ‘Ik ken deze plek,’ zei hij.\n\n‘Het lijkt op het marktplein in het kasteel van koning Andur,’ zei Lars.\n\n‘Ja, het is bijna identiek!’\n\n‘Heel lang geleden waren de twee koninkrijken samen,’ legde Lars uit. ‘Daarom lijken ze zo op elkaar. Maar dat was vóór het grote gevecht. Nu hebben ze geen sociaal contact. De mensen van de twee koninkrijken houden helemaal niet van elkaar.’\n\nDe paarden en het rijtuig naderden de deuren van het kasteel. Het\n\nkasteel zelf leek ook erg op dat van koning Andur. De bouw was zelfs precies dezelfde.\n\nDe andere twee bewakers gingen het goud halen. Lars en Alfred\n\ngingen naar koning Arthuren. Ze gingen de kamers van de koning binnen. Koning Arthuren riep: ‘Welkom in mijn koninkrijk!’\n\n‘Goedemiddag, Majesteit,’ antwoordde Lars. ‘Lars, jij bent het echt! Ik ben zo blij je weer te zien.’\n\nIk ben ook blij u weer te zien, Majesteit.’\n\nAlfred begreep het helemaal niet. Hoe kenden Lars en de koning\n\nelkaar?\n\n‘Heb je het goud gebracht, Lars?’\n\n‘Ja, het is nu van u.’\n\n‘Prima. We kunnen aan ons plan beginnen.’ Alfred keek verbaasd. Wat is dat voor een plan? dacht hij.\n\nLars nam de krachtdranken. Hij had ze meegenomen uit het\n\nkoninkrijk van koning Andur. Hij gaf ze aan koning Arthuren.\n\nArthuren mat zorgvuldig hoeveel drank er was.\n\n‘Wat gebeurt hier?’ vroeg Alfred.\n\nLars en Arthuren keken elkaar aan. Toen sprak Lars. ‘Ik moet je\n\niets vertellen, Alfred,’ begon hij.\n\nHij deed een paar stappen terug. Hij was bang. Hoe kenden Lars\n\nen de koning elkaar? Waarom heeft Lars die krachtdranken gekocht? Koning Arthuren had toverwater. Hij kon ze toch zelf maken!\n\nLars liep naar hem toe. ‘Alfred,’ begon hij opnieuw. ‘In dit koninkrijk\n\nraakte het toverwater al lang geleden op’.\n\n‘Wat zeg je? Weet koning Andur dat?’\n\n‘Nee, dat weet hij niet.’\n\n‘Maar dat moeten we hem vertellen!’ Lars keek Alfred alleen maar aan. Alfred werd achterdochtig. ‘Waarom heb je de krachtdranken aan deze koning gegeven? Het is een daad tegen koning Andur!’\n\n‘Dit zijn een paar van de laatste krachtdranken. Er is geen toverwater meer. Begrijp je dat?’\n\nAlfred knikte.\n\nLars ging verder: ‘Misschien kunnen we wat meer toverwater maken. We zullen deze toverdranken gebruiken in plaats van het originele water.’ Toen zei Lars ook nog: ‘We hebben altijd het originele water gebruikt. Maar dit werkt misschien. Laten we het hopen.’\n\nAlfred was boos. ‘Hebben we het goud voor niets betaald? Je hebt me verraden, Lars!’ riep hij. ‘Je hebt koning Andur verraden!’\n\n‘Ja, ik heb gelogen. Maar ik deed het om de vrede te bewaren,’ zei Lars. ‘Ik wil geen bloed aan mijn handen.’ Hij keek Alfred aan en hoopte dat hij het zou begrijpen.\n\n‘Hoe wordt hiermee de vrede bewaard? Het geheim is dat er geen toverwater meer is. Niemand weet dat nu. Maar binnenkort komt men het te weten. Dan ontdekt Andur dat je het goud hebt gestolen.’\n\nLars glimlachte niet meer. ‘Alfred, koning Andur mag niet ontdekken dat er geen toverwater meer is. Het gevolg is oorlog. Dan is de vrede voorbij. Koning Andur zal Arthuren aanvallen.’\n\n‘Je gaat dus voor Andur met de toverdranken toverwater maken?’ vroeg Alfred.\n\n‘Ja. Alleen maar om de vrede te bewaren.’ Toen voegde Lars eraan toe: ‘Als dat mogelijk is.’\n\nAlfred keek Lars achterdochtig aan. De opmerking maakte hem bezorgd. ‘Wat bedoel je met “als dat mogelijk is”?’\n\nLars keek Alfred aan. Toen sprak hij langzaam. ‘Zoals ik al zei, we\n\nmaken meestal nieuw toverwater uit zuiver toverwater. We mengen toverwater met gewoon water. Het gewone water wordt dan betoverd. Er is geen zuiver toverwater meer. Het originele water is weg.’\n\n‘En?’\n\n‘Nou, we zullen het proberen.’\n\n‘Wat proberen?’\n\n‘We zullen proberen uit deze toverdranken toverwater te maken. In\n\nde toverdranken zit het toverwater. We zullen de toverdranken mengen met gewoon water. Misschien raakt het gewone water dan betoverd.’\n\n‘Misschien? Misschien?’ riep Alfred. ‘En wat als het niet lukt?\n\nZoals u zei, er is geen toverwater meer …’\n\nLars was stil. Een moment later antwoordde koning Arthuren. ‘Als\n\nde toverdrank niet werkt,’ legde hij uit, ‘dan was de slag bij De Stille Bossen niet de laatste. Dan komt er oorlog.’',
				summary:
					'Lars en de bewakers komen in het koninkrijk van koning Arthuren aan. Lars en de koning blijken elkaar te kennen. De ridder geeft de koning twee krachtdranken. Dan vertelt Lars Alfred een groot geheim. Arthuren heeft geen toverwater om te verkopen. Arthuren en Lars zullen proberen meer toverwater te maken. Ze zullen de toverdranken gebruiken. Maar ze weten niet of dit mogelijk is. Arthuren zegt dat als ze geen toverwater meer kunnen maken er oorlog zal komen.\n\n***',
				vocabulary: [
					{ dutch: 'platteland', english: 'countryside', article: 'het' },
					{ dutch: 'boer', english: 'farmer', article: 'de' },
					{ dutch: 'verbouwen', english: 'to grow, cultivate' },
					{ dutch: 'fluisteren', english: 'to whisper' },
					{ dutch: 'opdracht', english: 'task, order', article: 'de' },
					{ dutch: 'bang', english: 'frightened' },
					{ dutch: 'bewaren', english: 'to keep' },
					{ dutch: 'vertegenwoordigen', english: 'to represent' },
					{ dutch: 'teken', english: 'sign', article: 'het' },
					{ dutch: 'Majesteit', english: 'Your Majesty' },
					{ dutch: 'meten', english: 'to measure' },
					{ dutch: 'opraken', english: 'to run out of' },
					{ dutch: 'daad', english: 'act, deed', article: 'de' },
					{ dutch: 'liegen', english: 'to lie' },
					{ dutch: 'aanvallen', english: 'to attack' },
					{ dutch: 'opmerking', english: 'remark', article: 'de' },
					{ dutch: 'zuiver', english: 'pure' },
					{ dutch: 'mengen', english: 'to mix' }
				],
				questions: [
					{
						id: 'cq_2_3_11',
						text: 'De eerste persoon in het koninkrijk die met Lars en de groep spreekt, is ___.',
						options: ['de koning', 'een bewaker', 'een boer', 'de vrouw van een boer'],
						correctIndex: 2
					},
					{
						id: 'cq_2_3_12',
						text: 'Het marktplein in het koninkrijk van Arthuren ___.',
						options: [
							'lijkt helemaal niet op dat van koning Andur',
							'lijkt op dat van koning Andur',
							'is dicht',
							'heeft een toverfontein'
						],
						correctIndex: 1
					},
					{
						id: 'cq_2_3_13',
						text: 'Lars en koning Arthuren ___.',
						options: [
							'vechten met elkaar',
							'kennen elkaar niet',
							'kennen elkaar',
							'werken voor koning Andur'
						],
						correctIndex: 2
					},
					{
						id: 'cq_2_3_14',
						text: 'Lars geeft Arthuren ___.',
						options: ['een wapen', 'een krachtdrank', 'twee krachtdranken', 'een toverfontein'],
						correctIndex: 2
					},
					{
						id: 'cq_2_3_15',
						text: 'Het geheim van het koninkrijk van Arthuren is dat ___.',
						options: [
							'het koninkrijk geen toverwater meer heeft',
							'Koning Andur Arthuren gaat aanvallen',
							'Lars de koning van Arthuren is',
							'het goud niet echt is'
						],
						correctIndex: 0
					}
				]
			}
		]
	},
	// ---- RANK 3: Het horloge ----
	{
		id: 'cs_3',
		rank: 3,
		title: 'Het horloge',
		chapters: [
			{
				id: 'cc_3_1',
				chapterNumber: 1,
				title: 'De legende',
				text: 'Karel was horlogemaker. Hij was in de veertig en alleenstaand. Zijn ouders woonden in Amsterdam. Hij woonde alleen in Zeeuws-\n\nVlaanderen. Hij woonde in een klein huisje in een rustige straat in Breskens.\n\nKarel was een lange magere man, maar hij was erg sterk. Hij had\n\nzijn eigen werkplaats. Hij repareerde horloges. Hij maakte zijn eigen\n\nkwaliteitshorloges. Hij deed ook vaak andere klusjes.\n\nKarel maakte lange dagen. Hij werkte meestal tot erg laat. Zijn\n\nwerkplaats lag vlakbij het strand in Zeeuws-Vlaanderen. Aan het\n\neinde van de dag ging hij vaak naar het strand om zijn benen te\n\nstrekken.\n\nOp een avond kwam Karel een oude vriendin op zijn wandeling tegen. Haar naam was Suzanne. ‘Karel! Hoe gaat het met jou?’ zei ze.\n\n‘Hoi Suzanne. Wat doe jij hier?’\n\n‘Ik wandel een eindje, net als jij,’ lachte Suzanne.\n\n‘Inderdaad. Nou, laten we dan samen een eindje wandelen!’ Karel en Suzanne bleven lang wandelen. Ze praatten over veel dingen. Ze praatten over hun baan en hun familie. Ze praatten over allerlei dingen in het algemeen. Terwijl ze wandelden, vroeg Suzanne, ‘Hoe gaat het met je werk? Werk jij veel?’\n\n‘Ja, ik heb veel werk. Dat maakt mij blij.’\n\n‘Dat is fijn, Karel.’\n\nSuzanne was beveiligingsbeambte. Ze bewaakte de boten bij het strand. Ze vertelde Karel dat ze haar baan leuk vond. Ze zag veel interessante dingen op het strand liggen. En ze had vandaag nog iets gevonden.\n\n‘Karel,’ begon Suzanne. ‘Ik hoopte eigenlijk al dat ik je zou tegenkomen.’\n\n‘Meen je dat?’ antwoordde Karel.\n\n‘Ja. Ik heb iets gevonden. En ik weet niet wat ik ermee moet doen.’\n\n‘Wat heb je gevonden, Suzanne?’\n\nSuzanne pakte een horloge. Het zag er heel oud uit. Het was van zeer goede kwaliteit. ‘Kun je me vertellen wat voor soort horloge dit is?’ vroeg ze.\n\n‘Laat me eens kijken,’ zei Karel.\n\nKarel hield het horloge in zijn hand. Hij bekeek het goed. ‘Ik heb geen idee wat voor soort horloge dit is,’ zei hij ten slotte.\n\nSuzanne was verbaasd. ‘Weet je er niets over te vertellen?’\n\n‘Nou, ik weet dat het een horloge is. Maar het is heel oud. Ik weet alleen niet zeker …’ Hij stopte en keek haar aan. ‘Moet je nu naar je werk, Suzanne?’\n\n‘Nee, mijn dag zit erop.’\n\n‘Laten we naar mijn werkplaats gaan. Ik heb een paar boeken die ons misschien kunnen helpen.’\n\nKarel en Suzanne gingen naar Karels werkplaats. De werkplaats was heel oud. In de werkplaats lagen veel horloges en gereedschap. Het was allemaal deel van Karels werk. Suzanne was nog nooit in de werkplaats geweest. Ze vond het heel interessant. ‘Wauw!’zei ze. ‘Hier liggen veel dingen!’\n\n‘Ja, ik heb veel werk. Ik houd van mijn werk.’\n\n‘Dat is goed, Karel!’\n\nKarel vroeg Suzanne met hem mee te gaan. Ze legde het horloge neer en liep naar een andere kamer. Er waren veel boeken. Ze waren heel groot en heel oud. Veel namen waren moeilijk leesbaar. ‘Wat doen we hier eigenlijk?’ vroeg Suzanne.\n\n‘We zijn op zoek naar informatie’, antwoordde Karel.\n\n‘Informatie over wat?’\n\n‘Over welk soort horloge dit is. Zoiets heb ik nog nooit gezien!’\n\nKarel en Suzanne doorzochten de boeken. Na enkele minuten\n\nvond Suzanne iets. Het stond in een boek over de Caribische Zee. ‘Karel! Luister hier eens naar!’ riep ze.\n\nKarel deed zijn boek dicht en ging naar Suzanne. ‘Wat is er?’\n\n‘Dit is een boek over piraten!’ Karel was erg verbaasd. Een boek over piraten? Waarom zou een piratenboek iets met een horloge te maken hebben? Dat kon toch niet.\n\nSuzanne legde het uit: ‘De titel van het boek is “De Caribische Piraten”. Het gaat over Nederland en de gevechten tegen piraten in de Caribische Zee.’\n\n‘Ik begrijp het nog steeds niet. Wat heeft het met het horloge te\n\nmaken?’\n\n‘Luister,’ zei Suzanne. ‘Volgens het boek was er eens een\n\nberoemde piraat. Hij heette Jan Baert. Hij had een heel bijzonder\n\ntype horloge. Ze zeggen dat het een horloge was met vreemde\n\nkrachten.’\n\n‘Vreemde krachten? Wat voor vreemde krachten?’ vroeg Karel.\n\n‘Men zei dat Baert door de tijd kon reizen.’ Suzanne draaide de\n\nbladzijde om en ging door: ‘Er staat dat het horloge hem hielp om door de tijd te reizen!’\n\nKarel lachte en zei: ‘Dat is gewoon een legende. Een piraat die\n\ndoor de tijd reisde? En met een horloge? Dat kan niet waar zijn!’ Karel lachte.\n\nPrecies op dat moment hoorden ze een geluid in de werkplaats.\n\n‘Wat was dat?’ vroeg Karel.\n\n‘Ik weet het niet,’ antwoordde Suzanne. ‘Laten we eens gaan\n\nkijken!’\n\nDe twee gingen terug naar de werkplaats. Ze keken om zich heen.\n\nHet horloge was weg! ‘Iemand heeft het horloge gestolen!’ riep Karel.\n\n‘Begrijp je het nu? Dat horloge is bijzonder. Het is geen normaal horloge!’ zei Suzanne.\n\nToen ontdekte Karel nog iets. De deur naar de werkplaats stond open. Plotseling hoorde hij voetstappen buiten. Deze renden de straat uit.\n\nKarel keek Suzanne aan en begon te rennen. ‘Kom mee!’ riep hij.\n\nKarel en Suzanne renden de werkplaats uit. Ze gingen naar het strand. Toen ze er waren aangekomen keek Karel naar beneden. Er waren voetstappen in het zand. Zeer diepe en grote voetafdrukken als die van een zwaar gebouwde man.\n\nPlotseling stond Suzanne stil. Ze wees naar een grote man in het zwart gekleed. Hij rende het strand af. ‘Kijk, Karel! Daar is hij!’\n\nschreeuwde ze.\n\nKarel rende de man achterna en schreeuwder, ‘Ho! Stop! Stop nu!’ De man luisterde niet. Hij bleef rennen. Karel wilde dat hij stopte, ‘Stop, nu!’\n\nDe man bleef Karel negeren. Karel rende dus nog sneller.\n\nEindelijk haalde hij de man in. Karel greep hem en ze vielen allebei in het zand. De man schreeuwde heel hard: ‘Laat me los! Ik heb je niets misdaan! Dit is mijn horloge!’\n\nKarel ging staan. Hij bekeek de man even. Wat een type! Zijn\n\nkleren waren niet modern. Ze waren heel ouderwets. Het was een stijl die honderden jaren geleden werd gedragen. Hij had ook een vreemd kapsel. Het was er één van lang geleden.\n\nKarel en Suzanne keken naar de man. Hij stond langzaam op. Hij\n\nveegde het zand van zijn kleren. Hij hield het horloge in zijn rechterhand. Hij keek hen achterdochtig aan. ‘Wat willen jullie van me?’ Waarom kijken jullie me zo aan?’ vroeg hij. De zwaar gebouwde man sprak met een heel ongewoon accent. Zijn Nederlands klonk heel vreemd.\n\nKarel keek hem aan en zei: ‘U hebt mijn horloge gestolen. U liep mijn werkplaats in en nam het mee.’\n\n‘Nee!’ zei de man. ‘Jullie hebben het van mij gestolen! Ik heb het alleen maar teruggenomen! Het is van mij!’\n\nKarel en Suzanne keken elkaar aan. Uiteindelijk vroeg Suzanne\n\naan de zwaar gebouwde man: ‘Wie bent u eigenlijk?’\n\n‘Ik ben Jan Baert. Maar willen jullie mij nu alstublieft laten gaan. Ik\n\nmoet terug naar de 17e eeuw.’',
				summary:
					'Karel is horlogemaker. Hij woont in Zeeuws-Vlaanderen. Op een dag ontmoet hij zijn vriendin Suzanne op het strand. Suzanne heeft een heel oud horloge gevonden. Ze gaan terug naar de werkplaats van Karel om het horloge te bestuderen. In een boek staat dat de piraat Jan Baert het horloge had. Hij gebruikte het om door de tijd te reizen. Plotseling merken Karel en Suzanne dat het horloge weg is. Ze horen voetstappen. Ze gaan een man achterna naar het strand. Karel grijpt hem. De man zegt dat hij de piraat Jan Baert is. Hij wil met het horloge terug in de tijd gaan.\n\n***',
				vocabulary: [
					{ dutch: 'legende', english: 'legend', article: 'de' },
					{ dutch: 'horlogemaker', english: 'watchmaker', article: 'de' },
					{ dutch: 'alleenstaand', english: 'single' },
					{ dutch: 'rustig', english: 'quiet' },
					{ dutch: 'werkplaats', english: 'workshop', article: 'de' },
					{ dutch: 'klusje', english: 'job', article: 'het' },
					{ dutch: 'strand', english: 'beach', article: 'het' },
					{ dutch: '(zijn) benen strekken', english: 'to stretch (one’s) legs' },
					{ dutch: 'beveiligingsbeambte', english: 'security guard', article: 'de' },
					{ dutch: 'bewaken', english: 'to guard' },
					{ dutch: 'gereedschap', english: 'tools', article: 'het' },
					{ dutch: 'piraat', english: 'pirate', article: 'de' },
					{ dutch: 'uitleggen', english: 'to explain' },
					{ dutch: 'bijzonder', english: 'particular' },
					{ dutch: 'vreemde kracht', english: 'strange power', article: 'de' },
					{ dutch: 'bladzijde', english: 'page', article: 'de' },
					{ dutch: 'schreeuwen', english: 'to shout' },
					{ dutch: 'negeren', english: 'to ignore' },
					{ dutch: 'grijpen', english: 'to grab' },
					{ dutch: 'ouderwets', english: 'old-fashioned' },
					{ dutch: 'kapsel', english: 'hairstyle', article: 'het' },
					{ dutch: 'vegen', english: 'to wipe' },
					{ dutch: 'eeuw', english: 'century', article: 'de' }
				],
				questions: [
					{
						id: 'cq_3_1_1',
						text: 'Karel werkt als ___.',
						options: ['horlogemaker', 'beveiligingsbeambte', 'piraat', 'bewaker'],
						correctIndex: 0
					},
					{
						id: 'cq_3_1_2',
						text: 'Aan het eind van de dag vindt Karel het fijn om ___.',
						options: [
							'door de straten van Breskens te wandelen',
							'in zijn werkplaats rond te lopen',
							'langs het strand te wandelen',
							'horloges te bestuderen'
						],
						correctIndex: 2
					},
					{
						id: 'cq_3_1_3',
						text: 'Suzanne is ___ van Karel.',
						options: ['de partner', 'de vrouw', 'de dochter', 'een vriendin'],
						correctIndex: 3
					},
					{
						id: 'cq_3_1_4',
						text: 'Volgens de legende ___.',
						options: [
							'is het horloge lang geleden verdwenen',
							'kan het horloge de tijd aangeven',
							'heeft het horloge vreemde krachten',
							'is het horloge van een beroemde horlogemaker'
						],
						correctIndex: 2
					},
					{
						id: 'cq_3_1_5',
						text: 'Het horloge verdwijnt uit de werkplaats van Karel omdat ___.',
						options: [
							'Suzanne het steelt',
							'een onbekende man het meeneemt',
							'ze het verliezen',
							'ze het op het strand laten liggen'
						],
						correctIndex: 1
					}
				]
			},
			{
				id: 'cc_3_2',
				chapterNumber: 2,
				title: 'Het Caribisch gebied',
				text: 'Karel en Suzanne keken naar de vreemde man voor hen. Na een tijdje sprak Karel weer. ‘De 17e eeuw? Teruggaan? U bedoelt … dat u echt Jan Baert bent?’ vroeg hij. De man zei niets. Hij probeerde het horloge te gebruiken.\n\nKarel kwam wat dichterbij. De man zag eruit als een oude piraat. Hij droeg oude zwarte kleding. De kleding van een piraat uit het Caribisch gebied. Een piraat, zoals de personages in legendes en boeken. Zou het waar kunnen zijn? dacht Karel.\n\nTen slotte keek de man hem aan en antwoordde: ‘Ja, dat ben ik.’ Nu begreep Karel het. Het horloge had echt vreemde krachten. ‘Dus de legende is waar!’ zei hij.\n\n‘Welke legende?’ vroeg Jan.\n\n‘De legende over uw horloge.’\n\nJan keek Karel en Suzanne aan.\n\n‘Hoe weet u van mijn horloge?’ zei hij.\n\nSuzanne antwoordde: ‘Het staat als een legende in ons boek.’\n\n‘In een boek, zegt u?’ zei Jan met een glimlach.\n\n‘Ha! Dus ik ben beroemd! Prima.’\n\n‘Nee … nee, niet u. Alleen uw horloge.’\n\nJan liep over het strand. Hij dacht na. Hij keek naar zijn horloge en zei: ‘Het horloge is van mij. Maar ik heb ‘t niet gekocht. Ik heb het gevonden. Ik heb het van een andere piraat afgepakt.’\n\n‘Een andere piraat?’ zei Karel.\n\n‘Ja, … een dode piraat!’ Jan lachte. Toen werd hij serieus. ‘Ik weet niet wie het was. Niemand weet het. Maar ik heb dit!’ Hij begon weer met het horloge te spelen.\n\nKarel keek Jan aan. Hij probeerde het horloge te gebruiken. Maar\n\nhet werkte niet.\n\nToen begreep Karel ineens iets. Jan Baert had het horloge alleen\n\nmaar gevonden. Hij wist niet hoe het werkte. Jan wist ook niet waarom het horloge zulke vreemde krachten had.\n\nKarel keek de piraat aan en zei: ‘Jan, weet je hoe het horloge\n\nwerkt?’\n\n‘Natuurlijk weet ik dat,’ schreeuwde Jan. Daarna keek hij Karel\n\nweer aan.\n\n‘Goed dan,’ zei hij. ‘Ik weet niet hoe het werkt. Ik denk dat\n\nverschillende factoren een rol spelen. Soms houd ik het in mijn hand en dan ga ik vooruit in de tijd. Zoals hier is gebeurd. En dan, precies zeven uur later, houd ik het weer in mijn hand. En keer ik terug naar mijn tijd. Ik weet niet welke factoren een rol spelen om het te starten of stoppen.’ Jan pauzeerde even.\n\n‘Maar waarom doet u het dan?’\n\n‘Ik wil graag zien hoe alles is veranderd. Er zijn geen piraten meer.\n\nOveral staan alleen maar hoge gebouwen. En wisten jullie dat er nu\n\nvliegmachines zijn? Ongelooflijk!’ Karel en Suzanne lachten. Het\n\nwas allemaal een beetje gek. Jan wist niet veel over de wereld van nu.\n\nJan keek nogmaals naar het horloge. Toen schreeuwde hij: ‘Laat\n\nme nu alleen! Het is bijna tijd. Zes uur en 58 minuten. Binnenkort kan ik terugkeren naar mijn tijd en plaats. Ik mag niet te laat komen!’\n\nKarel en Suzanne keken elkaar aan. ‘Wat vind jij ervan, Suzanne?’\n\nvroeg Karel zachtjes.\n\n‘Wat bedoel je?’\n\n‘Wil je mee naar het 17e-eeuwse Caribisch gebied?’ Suzanne dacht na.\n\n‘Kom mee! Het is vast leuk!’ zei Karel.\n\n‘Rustig, rustig, wacht even!’ Suzanne dacht nog even na. Ten\n\nslotte zei ze: ‘Oké, laten we gaan!’\n\nKarel en Suzanne liepen naar Jan Baert toe en zeiden: ‘We willen\n\nmet u meegaan.’\n\n‘Nee,’ zei Jan.\n\n‘Wat bedoelt u met “Nee”?’ vroeg Karel.\n\n‘Ik bedoel … nee,’ zei Jan. Hij keek Karel alleen maar aan.\n\n‘Maar wij willen ook zien hoe alles is veranderd. Wij kennen de moderne wereld. We willen zien hoe alles was. Net als u wilt zien hoe alles is.’\n\nPlotseling kreeg Jan een vreemde blik in zijn ogen. Het leek alsof hij een nieuw idee had. ‘Oh wacht. Jullie kennen de moderne wereld …’ Hij stopte. ‘Oké. Jullie gaan met me mee. Misschien heb ik een taak voor jullie. Oké?’\n\n‘Oké!’ antwoordde Karel. ‘Dus, moeten we allemaal gewoon het\n\nhorloge aanraken?’\n\n‘Ja. Leg gewoon je handen op het horloge. Maak je klaar! Schiet\n\nop!’\n\nSuzanne, Karel en Jan, allemaal raakten ze het horloge aan. Plotseling werden ze naar het Caribisch gebied in de 17e eeuw getransporteerd. De nacht werd dag en ze zaten in een piratenkamp.\n\nHet proces was verbazingwekkend simpel.\n\nKarel en Suzanne lieten het horloge los. Een aantal piraten keek\n\nhen aan. Eén van de mannen was heel fit en had een donkere huid\n\nen lang haar. Hij ging naar Jan Baert toe. ‘Goedemorgen, kapitein! Eindelijk bent u weer terug!’ En toen keek hij naar Karel en Suzanne en voegde eraan toe, ‘En u hebtgastenmeegebracht?’\n\nJan glimlachte. ‘Ja, Frank. Inderdaad,’ antwoordde hij. Toen keerde hij zich om naar de andere piraten. ‘Luister!’ schreeuwde hij. ‘De mensen hier zijn …’ Jan Baert wachtte even. Hij keek zijn gasten aan en zei: ‘Eh … hoe heten jullie eigenlijk?’\n\n‘Karel en Suzanne,’ antwoordden zij.\n\n‘Juist ja! Mannen! Dit zijn Karel en Suzanne!’\n\nDe piraten hadden weinig belangstelling. Er gebeurden door dat horloge vaak gekke dingen. ‘Ja, Karel en Suzanne …’ ging Jan door met een vreemde glimlach. ‘En ze gaan ons helpen. Ze gaan ons helpen vandaag te winnen.’ Nu hadden de mannen wel interesse. De piraten schreeuwden heel blij.\n\n‘Winnen?’ zei Karel, ‘Wat winnen?’\n\nJan draaide zich naar Karel en Suzanne. Daarna draaide hij zich\n\nweer om naar zijn mannen. ‘Jullie gaan ons helpen het gevecht te winnen, Karel en … eh … Suzanne.’\n\n‘Gevecht?’ riep Suzanne. ‘Welk gevecht?’\n\n‘Het gevecht tegen de Nederlandse schepen.’\n\n‘Wat? Daar had u niets over gezegd!’ zei ze. Jan Baert negeerde hen gewoon. ‘Ga weer aan het werk!’ riep hij tegen zijn mannen. Daarna gingen hij en de piraat, Frank genaamd, naar zijn tent.\n\nKarel en Suzanne bleven alleen achter. Ze keken naar de zee. Er\n\nwaren overal piratenschepen. Een ogenblik later keerde Frank terug. ‘Het spijt me,’ zei hij.\n\n‘Wat? Waarom spijt het je?’ vroeg Suzanne. ‘Omdat Jan gek is.’\n\nSuzanne en Karel keken elkaar aan. ‘Gek?’ vroeg Karel. ‘Gek,’ Frank stopte en keek ze aan. ‘Helemaal.’\n\n‘Oh, is dat zo,’ antwoordde Karel. ‘En waarom zeg je dat?’\n\n‘Omdat … hij denkt dat hij jullie kan gebruiken.’\n\n‘Ons gebruiken?’\n\n‘Jullie gebruiken. Om de Nederlandse schepen tegen te houden.\n\nDe Nederlanders weten van het horloge. Ze hebben er alles voor\n\nover om het van ons af te kunnen pakken. Ze vallen ons elke nacht\n\naan. Jan moet ze tegenhouden. Hij zegt dat jullie kunnen helpen.’\n\nVer weg kon je een gevecht horen. De eerste schepen werden\n\naangevallen. De Nederlanders kwamen eraan! ‘Hoe wil Baert dat wij helpen?’ vroeg Karel.\n\n‘Hij zegt dat jullie weten wat er gaat gebeuren. Jullie leven in de\n\ntoekomst …’\n\n‘Nee, nee, nee. We weten niet wat er gaat gebeuren. We weten\n\nniets van dit gevecht af. We weten alleen iets over het horloge! En zelfs dat is maar een legende!’\n\nFrank keek naar beneden. ‘Jan zal teleurgesteld zijn. Hij zal alles doen om dat horloge te behouden. Als jullie hem niet kunnen helpen, heeft hij jullie niet meer nodig.’ Hij keek hen ernstig aan. ‘Het zou wel eens slecht af kunnen lopen.’\n\nSuzanne en Karel keken elkaar bang aan. ‘Eh . . Wat kunnen we doen?’ vroeg Suzanne.\n\n‘Jullie moeten het horloge stelen,’ legde Frank uit. ‘Als de kapitein het horloge niet heeft, komt er geen gevecht!’\n\n‘Eh … oké. Wanneer?’\n\n‘Vanmiddag vindt er een belangrijk gevecht plaats. Kapitein Baert gaat veel schepen inzetten voor het gevecht. Jullie moeten het horloge van hem afpakken. En dan teruggaan naar jullie tijd en nooit meer terugkomen.’\n\nFrank ging terug naar de tent van Jan. Karel en Suzanne zaten op het strand.\n\n‘Hoe doen we dat? Ik ben maar een horlogemaker. Jij bent een beveiligingsbeambte,’ zei Karel. ‘Hoe kunnen we van een piraat stelen?’\n\n‘Wij moeten een manier bedenken,’ antwoordde Suzanne. ‘Wacht even! Ik heb een idee.’',
				summary:
					'De man op het strand is de piraat Jan Baert. Hij gebruikt het speciale horloge voor tijdreizen. Hij komt zojuist uit de 17e eeuw. Karel en Suzanne gaan met Jan terug naar de 17e eeuw. Als ze aankomen, besluit Jan dat ze hem kunnen helpen. Ze moeten een gevecht winnen. Een andere piraat wil dat Karel en Suzanne het horloge van Jan stelen. Dan hoeft hij er niet langer om te vechten.\n\n***',
				vocabulary: [
					{ dutch: 'gebied', english: 'area of land', article: 'het' },
					{ dutch: 'ongelooflijk', english: 'incredible' },
					{ dutch: 'blik', english: 'look', article: 'de' },
					{ dutch: 'taak', english: 'task', article: 'de' },
					{ dutch: 'aanraken', english: 'to touch' },
					{ dutch: 'opschieten', english: 'to hurry' },
					{ dutch: 'verbazingwekkend', english: 'surprisingly' },
					{ dutch: 'huid', english: 'skin', article: 'de' },
					{ dutch: 'kapitein', english: 'captain', article: 'de' },
					{ dutch: 'toevoegen', english: 'to add' },
					{ dutch: 'gast', english: 'guest', article: 'de' },
					{ dutch: 'belangstelling', english: 'interest', article: 'de' },
					{ dutch: 'gevecht', english: 'battle', article: 'het' },
					{ dutch: 'schip', english: 'ship', article: 'het' },
					{ dutch: 'aanvallen', english: 'to attack' },
					{ dutch: 'toekomst', english: 'future', article: 'de' },
					{ dutch: 'teleurgesteld', english: 'disappointed' },
					{ dutch: 'slecht aflopen', english: 'to get ugly' }
				],
				questions: [
					{
						id: 'cq_3_2_6',
						text: 'Met de kracht van het horloge kunnen mensen ___.',
						options: [
							'door de tijd reizen',
							'alleen naar de 17e eeuw reizen',
							'alleen naar de 21e eeuw reizen',
							'alleen de tijd aangeven'
						],
						correctIndex: 0
					},
					{
						id: 'cq_3_2_7',
						text: 'Jan reist naar de 17e eeuw met ___.',
						options: ['Karel', 'Suzanne', 'Karel en Suzanne', 'Frank'],
						correctIndex: 2
					},
					{
						id: 'cq_3_2_8',
						text: 'Jan wil ___.',
						options: [
							'tegen de Nederlandse schepen vechten',
							'de Nederlandse schepen negeren',
							'in Nederland bij Karel en Suzanne wonen',
							'het horloge aan de Nederlandse kapitein geven'
						],
						correctIndex: 0
					},
					{
						id: 'cq_3_2_9',
						text: 'Jan denkt dat Karel en Suzanne kunnen helpen om ___.',
						options: [
							'hem naar zijn tijd terug te brengen',
							'hem te vertellen wat er tijdens het gevecht zal gebeuren',
							'met de Nederlandse aanvallers te praten',
							'met Frank op het schip te werken'
						],
						correctIndex: 1
					},
					{
						id: 'cq_3_2_10',
						text: 'Frank zegt dat Karel en Suzanne ___.',
						options: [
							'niet terug moeten gaan naar hun tijd',
							'het horloge moeten stelen',
							'tegen de Nederlandse schepen moeten vechten',
							'tegen Jan moeten vechten'
						],
						correctIndex: 1
					}
				]
			},
			{
				id: 'cc_3_3',
				chapterNumber: 3,
				title: 'Het gevecht',
				text: 'Een paar uur later was iedereen klaar voor het gevecht. Jan, Frank, Karel en Suzanne gingen aan boord van het schip van Jan Baert.\n\nHet was erg groot. Het had veel kanonnen. Het was het favoriete\n\nschip van de piraat. Frank was zijn tweede officier. Baert reisde altijd met hem.\n\nBaert stond helemaal boven aan het roer. Frank liet Karel en Suzanne de rest van het schip zien. ‘Wat vinden jullie van onze schoonheid?’ vroeg hij.\n\nSuzanne keek om zich heen en glimlachte. ‘Wauw! Ik sta op een\n\necht piratenschip. Dit is ongelooflijk!’ zei ze.\n\nFrank lachte. ‘Dit is niets,’ zei hij. ‘We zien dit dagelijks.’\n\nFrank bracht Karel en Suzanne terug naar het roer. Het schip was\n\nal in beweging. De wind was een beetje koud. Maar er waren geen wolken. Het enige wat ze konden zien waren het blauwe water van het Caribisch gebied en het strand. Het was prachtig. Toen herinnerde Karel zich wat belangrijk was. Ze gingen een gevecht aan tegen de Nederlanders. Ze moesten iets doen om dit tegen te houden!\n\nJan Baert keek naar de zee. Hij stond nog steeds aan het roer.\n\nKarel en Suzanne keken naar Jan. Maar plotseling hoorden ze de\n\nstem van Frank achter zich. ‘Nou, hoe gaan jullie het aanpakken?’\n\n‘Wat aanpakken?’ antwoordde Karel.\n\n‘Het horloge stelen! Jullie moeten het doen voordat het gevecht\n\nbegint.’\n\n‘Wacht even,’ zei Karel. ‘Dat is nou precies wat ik niet begrijp!\n\nWaarom wil Jan Suzanne en mij hier op het schip hebben? Wij weten niet hoe we moeten vechten!’\n\n‘Ik heb het jullie verteld. Hij denkt dat jullie op de één of andere\n\nmanier de Nederlanders kunnen verslaan.’\n\nKarel keek op. Hij zag Jan. Hij keek ze aan. Zijn blik vertelde ze niets. Hij bleef ze aankijken.\n\n‘Nou, hij heeft het mis,’ zei Karel. ‘We kunnen niet helpen. Ik weet niet wat hij denkt dat we kunnen doen.’\n\n‘Om jullie de waarheid te vertellen,’ zei Frank, ‘ik weet ook niet wat Jan denkt.’\n\n‘En waarom zeg je dat?’ vroeg Suzanne.\n\n‘Kijk eens naar de zee.’\n\nKarel en Suzanne keken. Ze telden tien piratenschepen.\n\n‘Zie je ze? We hebben tien schepen,’ zei Frank.\n\nSuzanne begreep niet wat Frank bedoelde. ‘Ja, we hebben tien schepen. Nou en?’\n\nFrank keek haar alleen maar aan.\n\n‘Oh, ik begrijp het,’ zei ze. ‘We hebben tien schepen maar de Nederlanders hebben er meer, klopt dat?’\n\n‘Ja.’\n\n‘Hoeveel meer?’\n\n‘Zij hebben er dertig.’\n\n‘Dertig?’ schreeuwde Karel. ‘En wij hebben er tien? Jullie zijn helemaal gek!’\n\n‘Daarom wil ik dat hier een eind aan komt. Jullie moeten het horloge stelen. We kunnen dit gevecht niet winnen. Maar Baert geeft niet op. Niet tegen de Nederlanders. Tegen niemand.’\n\n‘Oké. Maar wat kunnen we doen?’ vroeg Karel.\n\n‘We stelen het horloge,’ zei Suzanne plotseling. Ze keek Karel aan. ‘Zoals ik net al zei, ik heb een idee.’\n\nSuzanne legde het plan uit. ‘Je bent toch horlogemaker?’\n\n‘Ja,’ antwoordde Karel.\n\n‘Zeg tegen Jan dat je het gevecht kan winnen. Maar je hebt daarvoor zijn horloge nodig.’\n\n‘En hoe doe ik dat?’\n\n‘Vertel hem dat je weet hoe het werkt. Zeg dat je met de kracht\n\nvan het horloge de Nederlandse schepen kan tegenhouden.’\n\n‘En dan?’\n\n‘Rennen!’\n\n‘Dat is een heel slecht plan,’ zei Karel.\n\n‘Maar het is het enige plan dat we hebben,’ antwoordde Suzanne.\n\nKarel wist dat dat waar was. Ze hadden geen keus. Karel liep naar Jan toe. Er was niet veel tijd meer. De kapitein vertelde zijn mannen wat ze moesten doen.\n\nJan zag Karel. ‘Wat wilt u? Weet u een manier om te winnen?’\n\n‘Eh, ja … ja, ik weet er één. Kom hier. En ik zal het u zeggen.’\n\nDe zwaar gebouwde piraat en Karel liepen weg en lieten de\n\nanderen achter. Frank en Suzanne deden alsof ze niets zagen.\n\n‘Jan, zoals u weet ben ik horlogemaker. Ik wil uw horloge zien.’\n\nDe piraat vond dat duidelijk geen goed idee. ‘Waarom?’\n\n‘Als u het mij laat zien, denk ik dat we het gevecht kunnen\n\nwinnen.’\n\n‘Wat bedoel je?’ vroeg Jan. Hij keek Karel achterdochtig aan. Karel wist niet wat hij moest zeggen. Hij dacht diep na. Toen ging hij verder. ‘Ik denk dat ik weet hoe het werkt,’ loog hij.\n\n‘Nou en?’\n\n‘Als u het mij laat zien, kan ik het veranderen. Ik kan het horloge\n\nveranderen. Het zal ons naar een andere plaats brengen. Een plaats ver van hier. Op die manier hoeven we niet te vechten.’\n\nDe tijd was gekomen. De Nederlandse schepen waren\n\naangekomen. Ze begonnen hun kanonnen af te vuren. De\n\npiratenboten vuurden hun kanonnen terug. De schepen slingerden\n\nheen en weer toen de kanonskogels alles om hen heen raakten. Jan schreeuwde tegen zijn mannen: ‘Vooruit! Blijf vuren! Wij mogen niet verliezen!’\n\nKarel probeerde iets te bedenken. Hij moest het horloge hebben. Zolang Jan het horloge had, zou hij vechten. En zonder het horloge konden hij en Suzanne niet naar Breskens terugkeren.\n\n‘Luister naar me!’ schreeuwde Karel. Jan negeerde hem. De kanonnen van de Nederlandse schepen bleven vuren. ‘Laat het me zien!’ bleef Karel zeggen. ‘Laat me het horloge zien!’ schreeuwde hij. ‘Dan kunnen we het gevecht winnen! We kunnen de Nederlanders verslaan!’\n\nJan keek hem aan. Maar hij bleef het horloge stevig vasthouden. Plotseling kwam er een kanon door het roer. Jan verloor zijn evenwicht. Hij viel. Karel kon nu zijn kans grijpen! Hij greep het horloge van Jan en rende weg. Jan begreep meteen wat er was gebeurd. ‘Stop! Houd die man tegen!’ schreeuwde hij.\n\nDe mannen van Jan begonnen Karel te achtervolgen. Karel\n\ngooide het horloge naar Suzanne. Ze ving het snel en rende weg. Karel rende naar haar toe. Toen zagen ze Jan. Hij kwam op hen af.\n\nDe Nederlandse kanonnen vuurden opnieuw. Jan probeerde Suzanne te pakken. Plotseling hield Frank Jan tegen. Hij hielp Suzanne! Suzanne had het horloge. Karel greep naar het horloge. Jan greep naar het horloge. Frank greep Suzanne om haar te beschermen. Voordat ze het wisten, was het horloge geactiveerd. Het hele groepje reisde vooruit door de tijd. Ze gingen naar de 21ste eeuw!\n\nDe dag werd nacht en ze waren terug op het strand van Breskens. Jan begreep als eerste wat er was gebeurd. Hij zocht naar het horloge. Het was nergens te zien!\n\nToen zag Jan het. Het lag onder de voet van Frank. Hij duwde\n\nFrank weg. Hij raapte het horloge op. Het was stuk. ‘Frank, wat heb je gedaan? Wat heb je gedaan?’ riep Jan.\n\nFrank negeerde hem. Hij keek naar het strand. Toen bekeek hij de stad en de mensen. Het was de eerste keer dat hij in de toekomst was. Het was allemaal nieuw en een beetje vreemd.\n\nJan werd steeds bozer. Hij zei tegen Frank: ‘Wat doen we nu? We kunnen niet terug! Wat doen we?’ Niemand zei iets. Ten slotte sprak Suzanne. ‘Kom mee naar de werkplaats, Jan. Karel zal proberen je horloge te repareren. En als hij het kan repareren, kun je naar huis.\n\nMaar dan moet je het horloge vernietigen. Het is gevaarlijk. Er komen alleen maar problemen van.’\n\n‘Dat doe ik,’ antwoordde Jan.\n\nToen keek Suzanne naar Frank. ‘Ik wil je iets vragen. Je moet\n\nbeloven om Jan te helpen. Hij moet het horloge vernietigen. Zorg\n\nervoor dat hij het niet bewaart. Als het moet, dwing je hem ertoe. Als je het niet vernietigt, dan betekent het ook jouw einde. Is dat begrepen?’\n\n‘Ja, dat doe ik,’ zei Frank. ‘Als ik weer thuis ben, wil ik dat horloge\n\nnooit meer zien!’\n\nTen slotte keek Suzanne naar Karel. ‘En jij!’ zei ze met een\n\nglimlach. ‘Als je weer zo’n gek idee hebt - zoals tijdreizen, dan hoef je mij niet te vragen!’ Karel lachte en ging akkoord.',
				summary:
					'Iedereen gaat aan boord van het schip van Jan om te vechten. Frank zegt tegen Karel dat hij het horloge van Jan snel moet stelen. Karel vraagt Jan om hem het horloge te laten zien. Jan zegt nee. Plotseling vallen de Nederlanders aan. Jan valt. Karel grijpt het horloge en rent weg. Karel, Suzanne, Jan en Frank vechten om het horloge. Het horloge wordt geactiveerd. Ze reizen naar Breskens in de 21e eeuw. Het horloge gaat tijdens de reis stuk. Karel gaat ermee akkoord om het horloge van Jan te repareren. Jan belooft het horloge te vernietigen wanneer hij thuiskomt.\n\n***',
				vocabulary: [
					{ dutch: 'kanon', english: 'cannon', article: 'het' },
					{ dutch: 'tweede officier', english: 'second in command', article: 'de' },
					{ dutch: 'roer', english: 'helm', article: 'het' },
					{ dutch: '(zich) herinneren', english: 'to remember' },
					{ dutch: 'stem', english: 'voice', article: 'de' },
					{ dutch: 'verslaan', english: 'to beat' },
					{ dutch: 'waarheid', english: 'truth', article: 'de' },
					{ dutch: 'doen alsof', english: 'to pretend' },
					{ dutch: 'duidelijk', english: 'clearly' },
					{ dutch: '(af)vuren', english: 'to fire' },
					{ dutch: 'slingeren', english: 'to rock' },
					{ dutch: 'heen en weer', english: 'back and forth' },
					{ dutch: 'raken', english: 'to hit' },
					{ dutch: 'stevig', english: 'tightly' },
					{ dutch: 'evenwicht', english: 'balance', article: 'het' },
					{ dutch: 'vangen', english: 'to catch' },
					{ dutch: 'beschermen', english: 'to protect' },
					{ dutch: 'activeren', english: 'to activate' },
					{ dutch: 'oprapen', english: 'to pick up' },
					{ dutch: 'stuk', english: 'broken' },
					{ dutch: 'boos', english: 'angry' },
					{ dutch: 'vernietigen', english: 'to destroy' },
					{ dutch: 'beloven', english: 'to promise' },
					{ dutch: 'bewaren', english: 'to keep' },
					{ dutch: 'dwingen', english: 'to force' }
				],
				questions: [
					{
						id: 'cq_3_3_11',
						text: 'De piraat die Frank heet, is ___.',
						options: [
							'de neef van Jan',
							'de zoon van Jan',
							'de tweede officier van Jan',
							'gewoon een andere piraat'
						],
						correctIndex: 2
					},
					{
						id: 'cq_3_3_12',
						text: 'Frank zegt tegen Karel dat hij het horloge van Jan moet stelen en ___.',
						options: [
							'tegen Jan moet vechten',
							'terug moet gaan naar de 21e eeuw',
							'naar de 17e eeuw moet reizen',
							'het moet gebruiken om tegen de Nederlanders te vechten'
						],
						correctIndex: 1
					},
					{
						id: 'cq_3_3_13',
						text: 'Als Karel met Jan praat, besluit Jan ___.',
						options: [
							'hem het horloge te geven',
							'hem het horloge niet te geven',
							'het horloge te stelen',
							'te rennen'
						],
						correctIndex: 1
					},
					{
						id: 'cq_3_3_14',
						text: 'Wie wordt uiteindelijk naar Breskens getransporteerd?',
						options: [
							'Karel en Suzanne',
							'Jan en Karel',
							'Jan en Frank',
							'Jan, Karel, Frank en Suzanne'
						],
						correctIndex: 3
					},
					{
						id: 'cq_3_3_15',
						text: 'Karel zal het horloge van Jan alleen repareren als hij belooft ___.',
						options: [
							'terug te gaan naar het Caribisch gebied',
							'het horloge te vernietigen',
							'hem zijn piratenschip te geven',
							'hem het horloge te laten houden'
						],
						correctIndex: 1
					}
				]
			}
		]
	},
	// ---- RANK 4: De kist ----
	{
		id: 'cs_4',
		rank: 4,
		title: 'De kist',
		chapters: [
			{
				id: 'cc_4_1',
				chapterNumber: 1,
				title: 'Den Haag',
				text: 'Er was eens een man die in een dorp in Zuid-Holland woonde. De man was vrij oud. Zijn naam was Wouter. Wouter was nooit getrouwd geweest. Hij had geen kinderen of familie in de buurt. Hij woonde al veel jaren alleen, maar hij was erg aardig. Hij was tegen iedereen altijd heel vriendelijk. Wouter had nooit ver gereisd. Hij had alleen in de buurt van zijn huis in Zuid-Holland gereisd. Hij was niet verder geweest. Nu werd het tijd om iets te doen! Hij had een missie.\n\nWouter had niet veel geld, maar hij was niet arm. Hij had wat geld\n\ngespaard toen hij jonger was. Hij was van plan om dat geld te gebruiken voor zijn missie. Hij moest naar drie verschillende plaatsen gaan. Hij had geld nodig voor eten, hotels en de reis. Hij had een missie. En hij moest hem volbrengen!\n\nEerst reisde Wouter naar Den Haag. Veel mensen keken naar\n\nhem toen hij voorbijliep. Hij had zijn haar in lange tijd niet laten\n\nknippen. Hij had een lange baard. Zijn kleren waren ook erg apart. Hij zag er op straat in de grote stad een beetje anders uit.\n\nWouter kwam aan bij het Westbroekpark. Het was een heel groot\n\npark in Den Haag. Er wandelden veel mensen. Wouter stapte op een jonge man af. De man was ongeveer 25 jaar oud. Hij las een regionale krant. Hij zat tegen een boom. Hij zag er heel kalm uit.\n\nWouter ging naast de man zitten. ‘Goedemiddag,’ zei Wouter. ‘Hallo …’ antwoordde de man. Hij keek Wouter achterdochtig aan.\n\nHij ging door met lezen.\n\n‘Hoe gaat het met je, David?’ zei Wouter.\n\nDe man keek op. Hij was erg verrast. Hoe wist deze vreemde man\n\nzijn naam? Hij bekeek de oude man aandachtig.’ Zei u David?’ vroeg hij.\n\n‘Ja, dat zei ik.’\n\n‘Hoe kent u mijn naam?’\n\n‘Dat kan ik je niet zeggen.’\n\nDavid stopte met lezen en legde de krant weg. Hij keek Wouter aan. Deze keer nog aandachtiger. Hij keek naar de lange baard. Hij probeerde zich hem zonder baard voor te stellen. Niets. Hij had geen idee wie de oude man was.\n\n‘Wat wilt u van me?’ vroeg David. Inmiddels was hij erg achterdochtig geworden.\n\n‘Maak je geen zorgen,’ zei Wouter. ‘Ik wil je geen kwaad doen. Ik ben gekomen om je iets te vertellen.’\n\n‘Ga je gang.’\n\nWouter haalde een foto uit zijn zak. Op de foto stond een kist. Hij\n\nzag er heel oud uit. Het leek of er iets in zat. Iets kostbaars.\n\n‘Wat is dat?’ vroeg David.\n\n‘Weet je niet wat het is?’\n\n‘Het lijkt op een kist. Ik heb hem nog nooit in mijn leven gezien.’\n\nWouter keek David goed aan. Toen wees hij naar de foto. ‘Kijk hier.’\n\nDavid keek. Er zat een slot op de kist. Op het slot stonden drie nullen. ‘Het is een slot.’\n\nJa, en …?’ vervolgde Wouter.\n\n‘En de cijfers ontbreken,’ zei David en keek hem vragend aan.\n\n‘Precies!’ zei Wouter. ‘De cijfers ontbreken alledrie!’ Toen keek hij David goed aan. ‘Ik heb die drie cijfers nodig voor mijn missie,’ zei Wouter.\n\n‘Missie? Welke missie?’\n\n‘Dat kan ik je niet vertellen,’ antwoordde de oude man kalm.\n\nDavid begreep het niet. Hij had geen idee wat de man wilde. Hoe kon hij de man cijfers geven die hij niet kende? Ten slotte zei Wouter: ‘Ik weet zeker dat je één van die cijfers hebt.’\n\n‘Ik weet niet waar je het over hebt.’\n\n‘Denk maar goed na, David. Je moet ergens een oud voorwerp\n\nhebben. Een voorwerp met een cijfer erop?’\n\nDavid dacht goed na. Zo’n voorwerp had hij niet. Daar was hij\n\nzeker van. Toen herinnerde hij zich iets. Hij had wel één voorwerp met een cijfer. Misschien was dat het?\n\n‘Nu je het zegt,’ zei hij opgewonden, ‘misschien heb ik iets! Wacht hier even. Ik ga het halen.’\n\n‘Waar ga je naartoe?’ vroeg Wouter.\n\n‘Naar mijn huis. Ik moet iets halen.’\n\n‘Wacht! Ik ga met je mee.’\n\nDavid keek nogmaals achterdochtig naar de man. De man was\n\noud. Hij leek aardig. Hij verwachtte geen problemen. ‘Oké,’ zei hij. ‘Volg me!’\n\nDavid en Wouter verlieten het park. Ze liepen terug door een klein\n\nstraatje. Daarna namen ze een bus naar Davids huis. Het stond in een ander deel van de stad.\n\nOnderweg vroeg David aan Wouter: ‘Hoe heet u?’\n\n‘Mijn naam is Wouter. Wouter Zijlstra.’\n\n‘En hoe lang bent u al in Den Haag, meneer Zijlstra?’\n\n‘Oh, noem me alsjeblieft Wouter! Je hoeft niet zo formeel te zijn.’\n\n‘Oké, Wouter. Hoelang ben je al in Den Haag?’\n\n‘Ik ben hier al twee uur.’\n\n‘Echt waar? Dat is niet lang.’\n\n‘Ja, maar ik vind het hier mooi! Er zijn hier veel aardige mensen en\n\ninteressante bezienswaardigheden.’\n\n‘Jazeker.’\n\nDe twee mannen bleven praten. Al snel bereikten ze het huis van\n\nDavid. Het huis was klein en netjes. David nam Wouter mee naar de\n\ngarage. David bewaarde daar veel dingen uit zijnverleden. Hij had dingen van toen hij nog een jongen was. Hij had wat oude foto’s. Hij had zelfs een paar oude schoolschriften.\n\n‘Wat zoeken we?’ vroeg Wouter.\n\n‘Ik herinnerde me iets wat ik nog heb. Het zou wel eens het voorwerp kunnen zijn waar je naar zoekt.’\n\n‘Een oud voorwerp? Met een cijfer?’\n\n‘Ja, een oud voorwerp met een cijfer. Wacht even. Ik ga kijken.’\n\nDavid zocht een half uur lang. Wouter probeerde te helpen. David vroeg Wouter om te gaan zitten. Hij wilde het zelf zoeken. Na een uur vond David het voorwerp eindelijk. ‘Kijk, Wouter,’ zei hij opgewonden, ‘ik heb het gevonden!’\n\n‘Wat heb je gevonden?’ vroeg Wouter. Hij stond op en liep naar hem toe. Hij keek David goed aan, ‘Hoe weet je dat ik dat nodig heb?’\n\n‘Ik weet het niet, maar ik heb dit al heel lang. En er staat een cijfer op.’\n\nDavid pakte een oude doek uit. Erin lag een gouden ketting. En aan de binnenkant van de ketting stond een cijfer. ‘Toen je zei dat je iets met een cijfer zocht,’ begon David, ‘herinnerde ik me dit.’\n\n‘Kun je je nog herinneren wie je deze ketting gaf?’\n\n‘Ik weet het niet zeker. Ik heb hem al sinds ik een baby was.’\n\nWouter glimlachte. Hij opende de garagedeur. ‘Waar ga je naartoe?’ vroeg David.\n\n‘Ik ben hier klaar,’ antwoordde Wouter. ‘Onthoud dat cijfer. En lees dit.’ Hij gaf David een brief. Toen liep hij weg.\n\n‘Wacht even! Kom terug! Wil je de ketting niet?’ riep David. Maar Wouter was weg. Hij was door de deuropening verdwenen.\n\nWouter keerde terug naar het centrum van Den Haag. Hij ging naar het station en pakte de trein. Zijn volgende halte was Friesland.',
				summary:
					'Wouter is een oude man uit Zuid-Holland. Hij heeft een missie. Hij heeft een foto van een oude kist. Er zit een slot op de kist. Er ontbreken drie cijfers. Wouter vraagt aan een man die David heet naar de ontbrekende cijfers. Hij zegt dat er één cijfer op een voorwerp staat dat David heeft. David kijkt in zijn garage en vindt iets. Hij laat Wouter een oude ketting zien. Er staat een cijfer in. Wouter zegt dat dit het cijfer is dat hij nodig heeft. Hij geeft David een brief. Dan vertrekt Wouter naar Friesland.\n\n***',
				vocabulary: [
					{ dutch: 'volbrengen', english: 'to complete' },
					{ dutch: 'apart', english: 'strange, unusual' },
					{ dutch: 'eruit zien', english: 'to look like' },
					{ dutch: 'aandachtig', english: 'carefully, attentively' },
					{ dutch: 'zich voorstellen', english: 'to imagine' },
					{ dutch: 'kwaad', english: 'harm', article: 'het' },
					{ dutch: 'ga je gang', english: 'go ahead' },
					{ dutch: 'zak', english: 'pocket', article: 'de' },
					{ dutch: 'kist', english: 'chest', article: 'de' },
					{ dutch: 'kostbaar', english: '(of) value' },
					{ dutch: 'slot', english: 'lock', article: 'het' },
					{ dutch: 'ontbreken', english: 'to lack, to be missing' },
					{ dutch: 'voorwerp', english: 'object', article: 'het' },
					{ dutch: '(zich) herinneren', english: 'to remember' },
					{ dutch: 'opgewonden', english: 'excitedly' },
					{ dutch: 'nogmaals', english: 'again' },
					{ dutch: 'verwachten', english: 'to expect' },
					{ dutch: 'bezienswaardigheid', english: 'place of interest', article: 'de' },
					{ dutch: 'netjes', english: 'neat' },
					{ dutch: 'bewaren', english: 'to keep' },
					{ dutch: 'verleden', english: 'past', article: 'het' },
					{ dutch: 'doek', english: 'piece of cloth', article: 'de' },
					{ dutch: 'ketting', english: 'necklace', article: 'de' }
				],
				questions: [
					{
						id: 'cq_4_1_1',
						text: 'Wouter is ___.',
						options: [
							'een jonge man',
							'een man van in de veertig',
							'een oude man',
							'een jonge jongen'
						],
						correctIndex: 2
					},
					{
						id: 'cq_4_1_2',
						text: 'Wouter spreekt voor het eerst met David ___.',
						options: ['in Friesland', 'in een park', 'op een luchthaven', 'in een garage'],
						correctIndex: 1
					},
					{
						id: 'cq_4_1_3',
						text: 'Wouter toont David een foto van een ___.',
						options: ['kist', 'garage', 'ketting', 'stad'],
						correctIndex: 0
					},
					{
						id: 'cq_4_1_4',
						text: 'David brengt Wouter naar ___.',
						options: ['de luchthaven', 'een taxi', 'Friesland', 'een garage'],
						correctIndex: 3
					},
					{
						id: 'cq_4_1_5',
						text: 'Nadat hij met David heeft gesproken, reist Wouter naar ___.',
						options: ['Zuid-Holland', 'Den Haag', 'Friesland', 'een park'],
						correctIndex: 2
					}
				]
			},
			{
				id: 'cc_4_2',
				chapterNumber: 2,
				title: 'Leeuwarden',
				text: 'Een paar uur later arriveerde Wouter veilig in Friesland. In de stad\n\nLeeuwarden waren veel mensen. Er waren veel spannende dingen om te doen en zien. Maar Wouter had een missie. Hij wist precies waar hij naartoe moest.\n\nWouter stopte een taxi. Hij gaf de chauffeur een plaatselijk adres.\n\nHet lag in een verre buitenwijk van Leeuwarden. Zewerden het\n\neens over de prijs. Na een tijdje kwam hij bij een groot huis aan.\n\nHet huis zag er erg duur uit. De bewoner zorgde er goed voor. Het\n\nwas waarschijnlijk iemand die rijk was. Er lag een hele grote tuin. Er liepen verschillende honden in rond. Het huis had zelfs een tennisbaan!\n\nWouter stond buiten. Hij bleef gewoon een tijdje naar het huis\n\nkijken. Toen klopte hij op de deur. Hij klopte weer en wachtte tot iemand antwoord gaf. ‘Hallo?’ zei hij. Er kwam niemand. Er leek niemand thuis te zijn. De oude man keek om zich heen. Hij besloot te wachten.\n\nWouter haalde de foto van de kist uit zijn jasje. Hij bekeek hem\n\ngoed en glimlachte. Hij deed de foto terug in zijn jasje. Hij wachtte nog even.\n\nWouter hoorde een auto aankomen. Zoals verwacht was het een\n\ndure auto. Er zat een vrouw in. Ze droeg een grote zonnebril. Ze zag\n\nWouter niet. De vrouw drukte op een knop. De garagedeur ging open. De vrouw reed langzaam naar binnen. Ze zag Wouter nog steeds niet. De vrouw drukte weer op de knop. De garagedeur ging langzaam dicht. Wouter zou haar misschien mislopen!\n\n‘Mevrouw, mevrouw! Wacht!’ riep Wouter.\n\nTen slotte zag de vrouw Wouter. Ze stopte onmiddellijk. De\n\ngaragedeur bleef open.\n\n‘Ja? Wie bent u?’ vroeg ze.\n\n‘Kunnen we even praten?’ vroeg Wouter.\n\nDe vrouw keek hem achterdochtig aan. Ze liep de garage uit. Uit de tuin kwam een butler. Hij keek de vrouw aan en zei: ‘Mevrouw Marijnen? Zal ik uw auto even wegzetten?’\n\n‘Ja, Berend. Dank je wel.’\n\n‘Mevrouw Loes Marijnen als ik het goed heb?’ vroeg Wouter.\n\n‘Ja, dat ben ik.’ Loes keek Wouter goed aan.\n\n‘Ik ben gekomen om met u te praten. Het is belangrijk.’\n\n‘Belangrijk? Als het om werk gaat, kunt u beter naar mijn kantoor bellen..’\n\n‘Nee. Geen werk,’ antwoordde Wouter.\n\n‘Wat kan het zijn?’ vroeg Loes. Wouter lachte alleen maar. ‘Nou, wat het ook is, komt u maar met me mee. Komt u mee naar binnen?’\n\nWouter ging met de vrouw mee naar binnen. Het huis was erg groot. Het was echt enorm groot. Het was ook erg mooi. ‘Is dit allemaal van u?’ vroeg Wouter.\n\n‘Ja,’ antwoordde ze. Ik ben professioneel ontwerper. Toen ik 19\n\nwas heb ik mijn eigen bedrijf opgestart.’ Ze stopte en keek rond. ‘Wat zal ik zeggen? Ik heb succes gehad.’\n\n‘Dat zie ik. Wauw! U heeft vast heel hard gewerkt.’\n\n‘Ja. Ik heb erg hard gewerkt.’ Ze begon weer te lopen. ‘Deze kant op, alstublieft.’\n\nWouter en Loes liepen een paar treden omhoog. Ze kwamen bij\n\neen grote deur. De deur was van hout en heel mooi. Het was een traditioneel ontwerp.\n\n‘Is uw huis heel oud?’ vroeg Wouter.\n\nLoes glimlachte. ‘Nee, het is niet oud.’ Maar het is volgens een traditioneel ontwerp gebouwd. Ik heb een heel traditionele smaak.’\n\nLoes deed de deur open. Wouter keek verbaasd om zich heen.\n\nHet was een grote kamer. Het stond vol mooie, dure meubels. Het was ook netjes en schoon.\n\nAl gauw kwam Berend, de butler. Hij bracht thee en koekjes.\n\n‘Meneer …’ zei Berend.\n\n‘Zeg maar Wouter.’\n\n‘Wouter, wat wil je drinken?’\n\n‘Een kopje thee graag. Dank je wel.’\n\nLoes deed haar jasje uit. Het was een erg warme dag. Berend\n\nsprak opnieuw tegen Wouter. ‘Mag ik je jasje?’ Wouter deed zijn jasje uit. Hij gaf het aan de butler. Berend ging de kamer uit en kwam snel terug. Hij gaf Wouter een kopje hete thee. Toen liet hij Loes en Wouter alleen.\n\nLoes en Wouter gingen zitten. Ze keken elkaar aan. ‘Welkom in\n\nmijn huis, Wouter. Mag ik vragen waarom je hier bent?’\n\nWouter dronk wat thee. Toen zette hij zijn kopje op tafel. ‘Ik wil een\n\ncijfer weten,’ zei hij kalm. Net als David was Loes verbaasd.\n\n‘Een cijfer?’ vroeg ze.\n\n‘Ja, een cijfer.’\n\n‘Een specifiek cijfer?’ vroeg Loes.\n\n‘Ja. Het staat op iets wat jij hebt. Probeer het je alsjeblieft te\n\nherinneren.’\n\nLoes dacht een tijdje na. Ze probeerde te begrijpen wat Wouter\n\nbedoelde. In tegenstelling tot David kon ze zich niets herinneren.\n\n‘Ik weet niet wat je bedoelt. Misschien kun je uitleggen …’ Wouter keek om zich heen. Het tweede cijfer moet hier ergens zijn, dacht hij. Natuurlijk, de foto! Hij moest haar de foto laten zien!\n\n‘Kan je butler misschien mijn jasje halen?’ vroeg Wouter. ‘Natuurlijk,’ antwoordde Loes.\n\nBerend verliet de kamer. Enkele seconden later kwam hij terug\n\nmet het jasje van Wouter. Wouter voelde in zijn jasje. Er zaten veel zakken in. Het was moeilijk om de foto te vinden. Het duurde even.\n\nLoes werd ongeduldig.\n\nEindelijk vond hij hem. ‘Hier is hij!’ Wouter lachte. ‘Ik heb hem!\n\nHier hebben we het cijfer voor nodig.’\n\nHij legde de foto van de kist op tafel. Loes pakte de foto. Ze keek\n\ner goed naar. Plotseling herinnerde ze zich iets!\n\n‘Ik weet niet waarom … maar ik denk dat ik me iets herinner,’ zei ze.\n\n‘Denk goed na, Loes, denk goed na,’ zei Wouter.\n\nLoes ging staan. ‘Kom mee, Wouter,’ zei ze. ‘Ik weet niet wie je bent of wat je wilt. Maar door jou moet ik ergens aan denken.’\n\nWouter glimlachte. Hij en Loes verlieten het huis. Ze gingen een klein gebouw in dat ernaast stond. De binnenkant van het gebouw was net een klein privémuseum. Er lagen veel tekeningen,\n\nschilderijen en anderewaardevolle dingen.\n\nVlakbij een mooie tekening vond Loes een klein doosje. Ze maakte het open. Er lag een ketting in. De ketting was net als die van David. Hij was heel oud, maar Loes kon de ketting openen. Ze kon het cijfer aan de binnenkant nog lezen.\n\nLoes gaf de ketting aan Wouter. Hij bekeek hem goed. ‘Oké. Meer heb ik niet nodig,’ zei hij kalm.\n\n‘Ik begrijp het nog steeds niet, Wouter. Wat wil je precies? De kist herinnerde me aan de ketting. Maar ik weet niet waarom. Jij wel? Is dat belangrijk?’\n\nWouter stopte. ‘Ik moet nu gaan, Loes. Vraag alsjeblieft niets meer.’ Hij gaf haar een brief. Toen stopte Wouter en zei: ‘Onthoud het cijfer. En lees dit. Dan begrijp je meer.’\n\nWouter draaide zich om en verliet het huis van Loes. Toen hij vertrok, riep hij: ‘Ik ga naar Amsterdam! Tot gauw, Loes!’\n\nLoes zei niets terug. Ze kon het niet. Ze had geen idee waarom Wouter was gekomen. Ze keek naar de brief. Het leek allemaal heel vreemd, maar toch op één of andere manier belangrijk. Ze wilde liever alles vergeten. Maar de oude man mocht van haar zijn plezier hebben. Langzaam opende ze de brief.',
				summary:
					'Wouter reist naar Leeuwarden. Hij bezoekt een vrouw die Loes heet. Zij woont in een enorm huis. Wouter vertelt Loes over de kist. Hij vraagt haar om zich een cijfer te herinneren. Plotseling herinnert ze zich iets. Ze laat Wouter een oude ketting zien. Er staat een cijfer in. Loes heeft veel vragen. Wouter beantwoordt ze niet. Hij geeft Loes een brief en vertrekt naar Amsterdam. Loes begint de brief te lezen.',
				vocabulary: [
					{ dutch: 'spannend', english: 'exciting' },
					{ dutch: 'buitenwijk', english: 'suburb', article: 'de' },
					{ dutch: 'het eens worden over', english: 'to agree on' },
					{ dutch: 'waarschijnlijk', english: 'probably' },
					{ dutch: 'besluiten', english: 'to decide' },
					{ dutch: 'jasje', english: 'jacket', article: 'het' },
					{ dutch: 'knop', english: 'button', article: 'de' },
					{ dutch: 'mislopen', english: 'to miss, to miss out on' },
					{ dutch: 'kantoor', english: 'office', article: 'het' },
					{ dutch: 'ontwerper', english: 'designer', article: 'de' },
					{ dutch: 'bedrijf', english: 'company', article: 'het' },
					{ dutch: 'trede', english: 'step', article: 'de' },
					{ dutch: 'van hout', english: 'wooden' },
					{ dutch: 'meubels', english: 'furniture' },
					{ dutch: 'in tegenstelling tot', english: 'unlike, in contrast with' },
					{ dutch: 'uitleggen', english: 'to explain' },
					{ dutch: 'ongeduldig', english: 'impatient' },
					{ dutch: 'tekening', english: 'drawing', article: 'de' },
					{ dutch: 'schilderij', english: 'painting', article: 'het' },
					{ dutch: 'waardevol', english: 'valuable' }
				],
				questions: [
					{
						id: 'cq_4_2_6',
						text: 'Het huis van Loes is ___.',
						options: [
							'groot en mooi',
							'klein maar mooi',
							'middelgroot',
							'groot maar niet erg mooi'
						],
						correctIndex: 0
					},
					{
						id: 'cq_4_2_7',
						text: 'De butler heet ___.',
						options: ['Berend', 'Wouter', 'David', 'Loes'],
						correctIndex: 0
					},
					{
						id: 'cq_4_2_8',
						text: 'Loes herinnert zich een cijfer als Wouter ___.',
						options: [
							'praat over het cijfer',
							'haar de foto van de kist toont',
							'praat over de kist',
							'praat over een ketting'
						],
						correctIndex: 1
					},
					{
						id: 'cq_4_2_9',
						text: 'Loes ___.',
						options: [
							'begrijpt niet waarom Wouter een cijfer wil',
							'weet wat Wouter aan het doen is',
							'wil niet dat Wouter haar een brief geeft',
							'kan Wouter niet helpen'
						],
						correctIndex: 0
					},
					{
						id: 'cq_4_2_10',
						text: 'Wouter vertrekt en dan ___.',
						options: [
							'reist hij naar Leeuwarden',
							'reist hij naar Den Haag',
							'rust hij een dag',
							'reist hij naar Amsterdam'
						],
						correctIndex: 3
					}
				]
			},
			{
				id: 'cc_4_3',
				chapterNumber: 3,
				title: 'Amsterdam',
				text: 'Op het station van Leeuwarden kocht Wouter eten voor de reis. Wat hij echt nodig had, was rust. Hij begon moe te worden. Toen herinnerde hij zich iets. Er was nog één persoon die hij moest spreken. Dan pas was zijn missie volbracht!\n\nWouter stapte in de trein. Hij kwam na een paar uur in Amsterdam\n\naan. Zoals gebruikelijk nam hij in de stad een taxi. Ze reden langs het Stedelijk Museum. Wouter kon zien hoe groot het museum was. Hij vroeg de chauffeur: ‘Bent u ooit in het Stedelijk Museum geweest?’\n\n‘Ja. Het is mooi, maar de kunst is heel apart. Het is heel modern.\n\nTe veel vreemde motieven en kleuren … ik houd meer van traditionele kunst.’\n\n‘Ik ook,’ zei Wouter. ‘Ik heb ook liever traditionele dingen.’ Hij keek\n\ntijdens de taxirit uit het raam.\n\nTen slotte kwam Wouter in Amsterdam-Zuid aan. Hij betaalde de\n\nchauffeur en stapte uit. Toen keek hij rond. Er was zoveel te zien. Maar hij moest zich concentreren! Zijn missie was bijna volbracht.\n\nWouter wist niet precies waar het huis van de derde persoon was.\n\nHij sprak een man op straat aan en liet hem het adres zien. ‘Neem\n\nme niet kwalijk. Hoe kom ik daar?’ vroeg hij.\n\n‘Oh, ik weet waar dat is,’ antwoordde de man. ‘Het is naast het\n\nbedrijf voor bootverhuur.’ Hij wees Wouter de weg.\n\n‘Dank u wel!’ riep Wouter en liep verder.\n\nWouter besloot te lopen. Het was gezond om te lopen. Bovendien\n\nwaren er belangrijke dingen aan het gebeuren. Het gaf Wouter de tijd om goed na te denken.\n\nTen slotte kwam Wouter aan bij het bedrijf voor bootverhuur.\n\nErnaast stond een klein huis. Ik hoop dat er deze keer iemand is! dacht hij. Hij herinnerde zich Loes in Leeuwarden. Hij wilde niet wachten. Hij was ook ongeduldig.\n\nWouter klopte op de deur. Een jongeman van ongeveer 25 jaar deed open. Hij leek een beetje op Wouter, maar zonder baard. ‘Hallo!’ zei de man. ‘Wat kan ik voor u doen? Wilt u een boot huren?\n\nMisschien een boottocht boeken?’\n\n‘Nou, nee,’ antwoordde Wouter. ‘Mijn naam is Wouter,’ ging hij verder. ‘Ik wil graag even met u praten, meneer.’\n\n‘U hoeft geen meneer te zeggen! Noem me gewoon Adriaan.’\n\n‘Oké, Adriaan. Kunnen we even samen praten?’\n\n‘Natuurlijk, Wouter. Kom binnen!’\n\nWouter keek om zich heen. Het huis was erg traditioneel en\n\neenvoudig. De eigenaar leek ook traditioneel en eenvoudig. Adriaan\n\ndroeg eenvoudige kleding. Hij had een traditionele smaak. Alles was erg schoon en netjes.\n\n‘Nou?’ zei Adriaan. ‘Je wilde mij spreken?’ Wouter begon te praten. Maar toen zag hij iets. Adriaan had een ring aan zijn vinger. Er stond een cijfer op de ring. Wouter begon te lachen.\n\n‘Wat is er?’ vroeg Adriaan bezorgd.\n\n‘Ik dacht dat het moeilijker zou zijn!’\n\n‘Wat bedoel je?’ zei Adriaan.\n\n‘Die ring van jou … wie heeft hem aan jou gegeven?’\n\n‘Het is een geschenk van jaren geleden. Toen ik nog een jongen was. Ik kan me niet herinneren wie hem mij heeft gegeven. Ik denk dat het hiervoor een ketting is geweest.’\n\nWouter keek naar het cijfer. Hij had alle drie de cijfers gevonden. Zijn missie was volbracht … bijna. Er waren nog een paar dingen die hij moest doen.\n\n‘Adriaan,’ begon Wouter, ‘kijk hier eens.’ Hij liet Adriaan de foto van de kist zien. ‘Deze kist heeft een slot. We hebben drie verschillende cijfers nodig om hem te openen. En drie personen hebben die cijfers. Jij bent één van die personen.’\n\nAdriaan keek hem vreemd aan. Toen vroeg hij: ‘En wat zit er in de\n\nkist?’\n\n‘Dat kan ik je nu niet vertellen.’\n\n‘Maar waarom heb ik één van die cijfers?’\n\n‘Dat kan ik je ook niet vertellen,’ antwoordde Wouter. Hij wilde\n\nniets meer zeggen. Nog niet.\n\nWouter gaf Adriaan een brief en zei: ‘Lees deze brief maar. De\n\ntwee andere mensen hebben identieke brieven. In de brieven staat\n\nwat jullie moeten doen. Ik moet nu gaan. Vertrouw me, ik zie je gauw weer.’ Wouter draaide zich om en vertrok.\n\nAdriaan was zo verbaasd dat hij niet wist wat hij moest doen. Dus\n\nopende hij de brief. Hij las:\n\nBeste Adriaan,\n\nDank voor het lezen van mijn brief. Zoals je weet, heb ik je\n\ngeholpen een cijfer te vinden. Er zijn twee andere personen die een cijfer hebben. Deze cijfers betekenen niets op zichzelf. Maar met de drie cijfers samen kun je een kist in Zuid-Holland openmaken. De kist staat bij mij thuis. Ik zou je willen uitnodigen om daar naartoe te komen. Kom alsjeblieft over drie dagen daar naartoe.\n\nIk heb niets anders te schrijven. Ik verzoek je geen contact met\n\nme proberen op te nemen. Binnenkort zul je weten wie ik ben. Maar vandaag is het niet de dag. Goede reis!\n\nMet vriendelijke groeten,\n\nWouter\n\nDrie dagen later kwamen David, Loes en Adriaan in Zuid-Holland\n\naan. Ze gingen allemaal naar hetzelfde adres zoals in de brief stond.\n\nLoes en Adriaan kwamen als eerste aan. David volgde. ‘Hoi,’ zei\n\nDavid.\n\n‘Hallo,’ zeiden Loes en Adriaan.\n\nAlle drie stopten ze even. Ten slotte vroeg David: ‘Wat doen we\n\nhier eigenlijk?’\n\n‘Heb je de brief gelezen?’ zei Loes opgewonden.\n\n‘Ja,’ antwoordden de mannen.\n\n‘Maar ik heb absoluut geen idee waar dit over gaat,’ voegde David eraan toe.\n\n‘Nou, laten we naar binnen gaan om het te weten te komen,’ zei Loes. Ze klopte op de deur.\n\nWouter deed de deur open. Hij was netjes gekleed. Dit was\n\ntenslotte een heel speciale gelegenheid.‘Hallo,’ zei hij kalm. Toen nodigde hij ze uit binnen te komen en zei: ‘Bedankt voor jullie komst.’\n\nHet huis was erg netjes en eenvoudig. Het was heel traditioneel ingericht. Wouter bood hen thee aan, maar niemand wilde. Ze waren te opgewonden. Uiteindelijk lachte Wouter en zei: ‘Volg mij.’\n\nWouter bracht Adriaan, Loes en David naar een kamer. In het midden stond de kist. Ze renden naar de kist. Ze hadden allemaal hun cijfer. Ze stonden klaar om hem te openen.\n\nDavid begon. Toen zette Loes haar cijfer erin. Als laatste deed Adriaan het ook. Toen hij zijn cijfer erin zette, maakte het slot een geluid. Adriaan maakte de kist open. Hij was helemaal gevuld met allerlei voorwerpen. Bovenop lag er weer een brief.\n\nAdriaan lachte. ‘Ha! Nog een brief? Ik kan het niet geloven!’\n\n‘Wil iemand hem voorlezen?’ zei Loes.\n\n‘Ik zal hem voorlezen,’ zei David\n\nDavid nam de brief uit de kist. Hij las aan de anderen voor:\n\nHallo David, Loes en Adriaan. Heel erg bedankt voor jullie komst.\n\nIk heb jullie om een speciale reden hierheen gehaald. Jullie weten\n\nallemaal dat jullie geadopteerdzijn. Ik heb dat bij het\n\nadoptiebureau gecontroleerd.\n\nDe handen van David trilden. ‘Klopt dat ook voor jullie?’\n\n‘Ja,’ zei Adriaan.\n\n‘Voor mij ook. Lees verder, alsjeblieft,’ zei Loes.\n\nJullie drieën … Jullie zijn broer en zus. Ik ben jullie oom. Jullie moeder was mijn zus. Zij en jullie vader kwamen om bij een ongeluk. Het gebeurde net nadat David werd geboren. Deze voorwerpen zijn van jullie ouders. De kettingen zijn ook van toen.\n\nNa het vreselijke* verlies van jullie ouders was ik nog jullie enige familie. Ik wilde dat wij als traditioneel gezin bij elkaar konden blijven. Maar ik kon niet in mijn eentje voor een baby en twee jonge kinderen zorgen. Ik moest jullie laten adopteren. Ik wilde jullie niet in een *weeshuis stoppen. Ik wilde zeker weten dat jullie lieve ouders hadden. Ik wilde voor jullie het allerbeste. Dus vroeg ik een adoptiebureau om hulp.\n\nNu jullie allemaal volwassen zijn, is de tijd gekomen. Ik wilde jullie\n\ndit vertellen. Jullie hebben meer familie dan wie jullie kennen en van wie jullie houden. Kijk rond. Ik nodig jullie uit om jullie broer, zus en jullie oom, dat ben ik, te ontmoeten!\n\nLiefs,\n\nWouter\n\nDavid, Loes en Adriaan keken elkaar aan. Toen draaiden ze zich\n\nom. Daar stond Wouter—hun oom. Hij keek hen aan en lachte. ‘Ik heb jullie zoveel te vertellen,’ zei hij kalm.',
				summary:
					'Wouter reist naar Amsterdam. Hij komt aan bij het huis van de derde persoon, Adriaan. Adriaan heeft het derde cijfer. Wouter nodigt David, Loes en Adriaan uit om bij hem thuis te komen. Ze komen naar Zuid-Holland. Ze gaan naar het huis van Wouter. Ze willen de kist openmaken. Ze zetten hun cijfers erin. De kist gaat open. Er zit veel in. Er ligt ook een brief in. In de brief staat dat ze broers en zus zijn en dat Wouter hun oom is.\n\n***',
				vocabulary: [
					{ dutch: 'kunst', english: 'art', article: 'de' },
					{ dutch: 'Neem me niet kwalijk', english: 'Excuse me' },
					{ dutch: 'verhuur', english: 'rental', article: 'de' },
					{ dutch: 'boottocht', english: 'boat trip', article: 'de' },
					{ dutch: 'eenvoudig', english: 'plain, modest' },
					{ dutch: 'smaak', english: 'taste', article: 'de' },
					{ dutch: 'vertrouwen', english: 'to trust' },
					{ dutch: 'gelegenheid', english: 'occasion', article: 'de' },
					{ dutch: 'reden', english: 'reason', article: 'de' },
					{ dutch: 'adopteren', english: 'to adopt' },
					{ dutch: 'adoptiebureau', english: 'adoption agency', article: 'het' },
					{ dutch: 'trillen', english: 'to shake' },
					{ dutch: 'ongeluk', english: 'accident', article: 'het' },
					{ dutch: 'geboren worden', english: 'to be born' },
					{ dutch: 'vreselijk', english: 'terrible' },
					{ dutch: 'weeshuis', english: 'orphanage', article: 'het' },
					{ dutch: 'volwassen', english: 'adult' }
				],
				questions: [
					{
						id: 'cq_4_3_11',
						text: 'Wouter reist ___.',
						options: [
							'naar Den Haag en Leeuwarden',
							'alleen naar Leeuwarden',
							'naar Amsterdam en Friesland',
							'alleen naar Amsterdam'
						],
						correctIndex: 2
					},
					{
						id: 'cq_4_3_12',
						text: 'Wouter praat met de taxichauffeur over ___.',
						options: [
							'de familie van de taxichauffeur',
							'de familie van Wouter',
							'een museum',
							'zijn reis naar Amsterdam'
						],
						correctIndex: 2
					},
					{
						id: 'cq_4_3_13',
						text: 'Adriaan woont ___.',
						options: [
							'in de buurt van een park',
							'op een boot',
							'in een klein dorp',
							'bij de rivier'
						],
						correctIndex: 3
					},
					{
						id: 'cq_4_3_14',
						text: 'Uiteindelijk vinden ze in de kist ___.',
						options: [
							'alleen een brief',
							'een brief en wat voorwerpen',
							'een brief van de ouders van de drie personen',
							'geld'
						],
						correctIndex: 3
					},
					{
						id: 'cq_4_3_15',
						text: 'David, Loes en Adriaan zijn ___.',
						options: ['neven en nichten', 'broers en zus', 'vrienden', 'kinderen'],
						correctIndex: 1
					}
				]
			}
		]
	},
	// ---- RANK 5: Onbekend terrein ----
	{
		id: 'cs_5',
		rank: 5,
		title: 'Onbekend terrein',
		chapters: [
			{
				id: 'cc_5_1',
				chapterNumber: 1,
				title: 'Nieuw terrein',
				text: 'Honderden jaren geleden woonden er Vikingen in Noord-Europa.\n\nDeze historische periode staat bekend als het tijdperk van de\n\nVikingen. Hun terrein was koud. Het was niet erg vlak. Er waren\n\noveral bergen. Daarom konden ze niet veel voedsel produceren. Dit\n\nis misschien de reden waarom de Vikingen altijd op zoek waren naar nieuw terrein.\n\nTijdens het Vikingtijdperk was er een plaats die Asglor heette. In\n\nAsglor woonde een jongeman. Hij was iets ouder dan 20 jaar. Hij heette Thoric.\n\nThoric was erg machtig. Hij was lang en zag er heel knap uit. Hij\n\nhad lang bruin haar en een grote neus. Hij had een brede mond en sterke armen en benen.\n\nOp een middag keerde Thoric terug van het jagen. In de plaats Asglor waren veel mensen. De zon scheen. Het was een beetje koud. Op weg naar huis zag Thoric een bekende\n\nontdekkingsreiziger. Zijn naam was Niels. Niels bracht veel tijd\n\nbuiten Asglor door. Hij verkende nieuwe landen. Hij zocht naar\n\nnieuwe locaties om voedsel te verbouwen.\n\nThoric zwaaide naar Niels. ‘Hallo!’ riep hij.\n\n‘Thoric!’ antwoordde Niels.\n\n‘Niels. Blijf je in de buurt?’\n\n‘Ja. Ik blijf hier nog twee nachten.’\n\n‘En waar ga je dan naartoe?’\n\n‘Dat weet ik niet precies. Hoofdman Eskol zegt dat het erg ver weg\n\nis.’\n\nThoric had veel respect voor hoofdman Eskol. Hij was een grote man. Hij had het langste haar dat Thoric ooit had gezien! Hij had ook sterke spieren en hij sprak op een ernstigetoon. Eskol was een heel strenge man. Hij had veel regels en wetten. Soms was hij gemeen. Hoe dan ook, de meeste mensen vonden Eskol een goede leider.\n\n‘Heeft hoofdman Eskol nieuwe plannen?’ vroeg Thoric met\n\nbelangstelling.\n\n‘Ja, maar hij heeft ons er niets over verteld. Hij heeft alleen gezegd dat we nog verder moeten gaan.’\n\nHoofdman Eskol zond vaak expedities uit. Ze gingen dan buiten Asglor op onderzoek uit. Asglor was een klein plaatsje. Het lag naast een paar bergen en een meertje. Bij het meer lag een rivier die naar de zee leidde. In de zomer was er genoeg voedsel. Maar in de winter waren er geen dieren of planten. Er was niet veel voedsel. Tijdens de vorige winter waren mensen gestorven. Hoofdman Eskol wist dat hij snel nieuwe terreinen moest zoeken.\n\n‘Goed nieuws!’ zei Thoric. ‘Ik wil deze winter geen voedseltekort!’\n\n‘Ik ook niet. Mijn gezin moet beter kunnen eten. Ik kan ze niet alleen maar de hele tijd vlees geven.’\n\nThoric had de familie van Niels nog nooit ontmoet. Hij wist alleen dat de vader van Niels een beroemde ontdekkingsreiziger was. ‘Niels, ik moet gaan.’ zei Thoric ten slotte. ‘Ik moet de dieren die ik net heb geschoten schoonmaken. Mijn gezin wil het vlees verkopen.’\n\n‘Oké, jongen. Ik wens je een goede dag.’\n\nThoric ging terug naar zijn huis. Hij sprak met zijn ouders en zus.\n\nZijn familieleden waren boeren. Ze hadden een klein stukje land. Ze\n\nverbouwden een paar gewassen. Ze fokten ook dieren. Ze hielden de vrouwtjes. Ze verkochten de mannetjes. Ze verkochten ook het vlees van Thorics jacht. Ze verdienden geld, maar het was nooit genoeg.\n\nDie nacht kon Thoric niet slapen. Er was teveel om over na te denken. Waar ging hoofdman Eskol heen? Wat was de bedoeling van deze nieuwe expeditie?\n\nTwee dagen later ging Thoric weer op jacht. Er waren steeds\n\nminder dieren. De winter kwam eraan. Het werd steeds moeilijker om iets te vinden om op te schieten!\n\nThoric kwam terug van de jacht. Opnieuw ontmoette hij Niels.\n\nNiels liep snel. ‘Thoric! Kom snel!’ riep hij.\n\n‘Wat is er Niels?’\n\n‘Hoofdman Eskol heeft een vergadering bijeengeroepen. Het hele dorp moet erbij zijn.’\n\n‘Gaat hij ons zijn plannen vertellen?’\n\n‘Waarschijnlijk wel, ja! Ik moet ernaartoe gaan. Breng dat vlees\n\nnaar huis en kom snel!’\n\nThoric bracht het vlees naar huis en liep snel naar de Grote Zaal.\n\nDe Grote Zaal was een heel groot gebouw van hout. De muren\n\nwaren bedekt met afbeeldingen van goden van de Vikingen. De Zaal was het huis van hoofdman Eskol. Hij woonde daar met zijn vrouw en vier kinderen. Alle mensen die zijn familie en het dorp dienden, woonden daar ook.\n\nIn de Grote Zaal werden vaak discussies en vergaderingen\n\ngehouden. Hoofdman Eskol riep dan iedereen bijeen. Iedereen uit het hele dorp kwam dan. Het was het moment waarop belangrijke informatie was te krijgen. En dat is precies wat zij deze keer kregen.',
				summary:
					'Thoric is een jager in het tijdperk van de Vikingen. Hij woont in een plaatsje dat Asglor heet. Hoofdman Eskol is de leider van Asglor. Niels is een ontdekkingsreiziger. Hij zoekt nieuwe terreinen voor hoofdman Eskol. Niels vertelt Thoric dat hoofdman Eskol nieuwe plannen heeft. Eskol wil verder weg verkennen. Hoofdman Eskol roept een vergadering bijeen. Iedereen uit het hele plaatsje komt bijeen om naar het belangrijke nieuws te luisteren.\n\n***',
				vocabulary: [
					{ dutch: 'onbekend', english: 'unknown' },
					{ dutch: 'terrein', english: 'terrain, territory' },
					{ dutch: 'tijdperk', english: 'era, age' },
					{ dutch: 'vlak', english: 'flat' },
					{ dutch: 'berg', english: 'mountain', article: 'de' },
					{ dutch: 'reden', english: 'reason', article: 'de' },
					{ dutch: 'jagen', english: 'hunting', article: 'het' },
					{ dutch: 'ontdekkingsreiziger', english: 'explorer', article: 'de' },
					{ dutch: 'verkennen', english: 'to explore' },
					{ dutch: 'verbouwen', english: 'to grow, cultivate' },
					{ dutch: 'zwaaien', english: 'to wave' },
					{ dutch: 'spier', english: 'muscle', article: 'de' },
					{ dutch: 'ernstig', english: 'serious' },
					{ dutch: 'gemeen', english: 'mean' },
					{ dutch: 'hoe dan ook', english: 'in any case' },
					{ dutch: 'belangstelling', english: 'interest' },
					{ dutch: 'meer', english: 'lake', article: 'het' },
					{ dutch: 'tekort', english: 'shortage', article: 'het' },
					{ dutch: 'boer', english: 'farmer', article: 'de' },
					{ dutch: 'gewas', english: 'crop', article: 'het' },
					{ dutch: 'jacht', english: 'hunt', article: 'de' },
					{ dutch: 'vergadering', english: 'meeting', article: 'de' },
					{ dutch: 'waarschijnlijk', english: 'probably' },
					{ dutch: 'afbeelding', english: 'image', article: 'de' },
					{ dutch: 'dienen', english: 'to serve' }
				],
				questions: [
					{
						id: 'cq_5_1_1',
						text: 'Thoric is ___.',
						options: ['een ontdekkingsreiziger', 'een jager', 'de hoofdman', 'een boer'],
						correctIndex: 1
					},
					{
						id: 'cq_5_1_2',
						text: 'Niels is ___.',
						options: ['een ontdekkingsreiziger', 'een jager', 'de hoofdman', 'een boer'],
						correctIndex: 0
					},
					{
						id: 'cq_5_1_3',
						text: 'Eskol is ___.',
						options: [
							'een ontdekkingsreiziger',
							'de hoofdontdekkingsreiziger',
							'de hoofdman',
							'een boer'
						],
						correctIndex: 2
					},
					{
						id: 'cq_5_1_4',
						text: 'Het dorp Asglor ___.',
						options: [
							'heeft het hele jaar door genoeg voedsel',
							'heeft in de zomer meer voedsel nodig',
							'heeft in de winter meer voedsel nodig',
							'heeft meer jagers nodig'
						],
						correctIndex: 2
					},
					{
						id: 'cq_5_1_5',
						text: 'Niels denkt dat de vergadering waarschijnlijk gaat over ___.',
						options: [
							'Asglors recente voedseltekort',
							'de verkenningsplannen van Niels',
							'Thorics plannen voor de jacht',
							'de plannen voor de ontdekkingsreis van hoofdman Eskol'
						],
						correctIndex: 3
					}
				]
			},
			{
				id: 'cc_5_2',
				chapterNumber: 2,
				title: 'Naar het westen',
				text: 'De vergadering was zoals Thoric had gehoopt. Het ging over hoofdman Eskols strategie voor de volgende expeditie. Het was waar. Eskol wilde verder reizen, veel verder.\n\nHoofdman Eskol vertelde over zijn nieuwe plannen. Hij wilde voorbij de bergen en voorbij het meer gaan. Hij wilde via de rivier naar de zee. Hij wilde de zeeën op om meer land te zoeken. Zijn strategie was om zo ver mogelijk naar het westen te gaan.\n\nDe inwoners van Asglor waren verbaasd, waaronder ook Thoric en Niels. Maar ze waren het allemaal eens met de expeditie. Het bouwen en organiseren begon.\n\nEr ging een maand voorbij. Hij ging heel langzaam voorbij. Het was bijna winter. De inwoners van Asglor wisten dat ze binnenkort meer voedsel nodig zouden hebben. Ze wilden tekorten voorkomen. Hopelijk zou dit de laatste hongerwinter zijn.\n\nNiels leidde het bouwen van de schepen. Ze werden gemaakt van bomen in de buurt van de rivier. Hoofdman Eskol kwam vaak naar de bouwplaats. Hij wilde weten wat de vooruitgang was. ‘Vertel me, Niels,’ zei Eskol, ‘wanneer kunnen we varen? Ik zie dat sommige schepen al op de rivier zijn.’ Toen voegde hij er met een serieuze toon aan toe: ‘We moeten gauw gaan varen.’\n\n‘Ik weet het niet zeker, hoofdman. Misschien over een week? Mogelijk eerder.’\n\n‘Een week? Prima!’\n\n‘Ja, het hout is goed. De materialen zijn sterk. En onze bouwlieden zijn erg competent,’ zei Niels.\n\nDie nacht sprak hoofdman Eskol weer in de Grote Zaal. Het was tijd om te beslissen wie op de schepen zouden gaan. Er was slechts plaats voor 75 mannen. Eén voor één staken mannen hun hand op om mee te gaan. De meesten van hen waren krijgers. De krijgers waren zeer goed getraind. Hun kwaliteiten zouden zeer goed zijn voor de expeditie.\n\nThoric wilde ook gaan. Hoewel hij geen krijger was, kon hij erg\n\ngoed jagen. Voedsel was altijd belangrijk tijdens een expeditie. Thoric stak zijn hand op. ‘U weet maar nooit wat voor voedsel er zal zijn,’ zei Thoric tegen de hoofdman. ‘U hebt jagers nodig. Ik kan overal en op alles jagen,’ zei hij.\n\nHoofdman Eskol keek hem aan en zei: ‘Prima, Thoric. Ga met ons\n\nmee.’\n\nVanaf dat moment kon Thoric niet wachten tot de expeditie begon.\n\nToen de dag aanbrak, waren hoofdman Eskol, Niels, Thoric en de rest van de Vikingen klaar om te varen. Ze vroegen de goden om hen te helpen. Hun vrouwen en families namen afscheid. Eskol gaf de leiding aan zijn vrouw terwijl hij weg was. Zij kwam ook heel wat met de mannen bespreken. Ze moedigde hen ook aan. Het zou een\n\nlange tocht worden.\n\nTen slotte gingen de mannen aan boord van de schepen. De\n\nexpeditie begon.\n\nDe drie schepen reisden eerst naar het westen. Ze waren in\n\nperfecte conditie. Iedereen leek gelukkig. De eerste paar weken gingen probleemloos voorbij.\n\nEnkele weken later maakten de schepen nog steeds goede\n\nvooruitgang. De ontdekkingsreizigers zagen nog geen land, alleen\n\nwater. Ze zagen zelfs geen vogels. Vogels betekenden dat er land in de buurt was.\n\nEen paar Vikingen begonnen hoofdman Eskol vragen te stellen.\n\n‘Hoofdman Eskol, weet u zeker dat er land is in het westen?’ vroeg één man.\n\n‘Ik weet het zeker.’\n\n‘Wat als we het niet kunnen vinden?’\n\nHoofdman Eskol werd boos. ‘Wij zullen niet falen!’ schreeuwde\n\nhij. ‘Er is land in het westen. Iemand heeft me verteld dat het er was. Iemand die het met zijn eigen ogen heeft gezien. Begrijp je dat?\n\nMaak nu dat je weg komt,’ zei de hoofdman. Het gesprek was afgelopen.\n\nEskol was sterk en vastberaden. Hij hield er niet van om veel vragen te moeten beantwoorden. Maar hij wist dat de mannen niet zeker waren of hij gelijkhad. Voor hen was het niet zo duidelijk. Hij besloot om tot de rest van de mannen te spreken. ‘Er is land in het westen!’ riep hij tegen de ontdekkingsreizigers. ‘Ik kan het bewijzen!\n\nBegrijpen jullie mij? Ik heb bewijs!’ Hij hield een klein doek omhoog. Op het doek stonden vreemde afbeeldingen. ‘Iemand heeft dit gemaakt. Jullie moeten me geloven. Ik weet dat het land er is!’\n\nDe Vikingen hielden zich stil en bleven roeien. Maar ze hadden allemaal dezelfde vraag: ‘Wie heeft hoofdman Eskol verteld dat er land was in het westen?’\n\nLater die dag begon het opeens te regenen. De wind werd sterker.\n\nHet water werd ruw. Al snel kwam er een storm zoals ze nog nooit hadden meegemaakt. De schepen hadden het zo moeilijk dat ze bijna niet konden varen. De Vikingen deden er alles aan om de drie schepen bij elkaar te houden.\n\nEindelijk ging de storm liggen. Hoofdman Eskol kon de lucht weer zien. Hij keek waar de schepen waren. Toen werd hij boos. De storm had ze uit de koers gebracht! Eskol wist niet precies waar ze waren. De hoofdman kon het de mannen niet vertellen. Hij kon alleen maar hopen dat hij nog gelijk had. Er moest land zijn als ze naar het westen gingen.\n\nDagen later werd Thoric vroeg wakker. Hij keek naar de lucht. Plotseling zag hij iets. Eerst kon hij het niet geloven! Toen keek hij weer. Ja, ze waren er echt!\n\nThoric rende naar Niels. ‘Niels. Niels! Word wakker!’ schreeuwde hij.\n\n‘Wat is er?’ zei de ontdekkingsreiziger met zijn ogen nog steeds dicht.\n\n‘Er zijn vogels!’\n\n‘Wat?’\n\n‘Er zijn vogels in de lucht! Er is land in de buurt!’\n\nDe ogen van Niels gingen snel open. Hij keek omhoog. Daar, ver\n\nin het westen, zag hij vogels! ‘Het is dus waar!’ riep hij.\n\nNiels stond op. Hij moest dit melden bij de hoofdman. Thoric ging\n\nmet hem mee. ‘Hoofdman Eskol, word wakker!’ schreeuwde Niels.\n\nHoofdman Eskol werd snel wakker. ‘Niels? Thoric? Wat is er\n\ngebeurd?’\n\n‘Er zijn vogels in de lucht!’ riep Niels.\n\n‘Er is land!’ riep Thoric.\n\nHoofdman Eskol stond snel op. Toen schreeuwde hij naar de\n\nmannen: ‘Roeien! Kom op! Wakker worden allemaal! Er is land vlakbij! Roeien!’\n\nDe Vikingen roeiden hard en zagen eindelijk land. Hoofdman\n\nEskol bevalde schepen te stoppen bij eennabijgelegen strand. Het strand was erg lang. Er waren veel bomen en bergen in de buurt. Het was prachtig.\n\nDe Vikingen gingen van boord. Hoofdman Eskol riep de mannen\n\nbij elkaar. Ze vormden kleine groepen. De hoofdman zei tegen één groep: ‘Jullie. Stokken zoeken. Wij hebben vuur nodig.’ Toen keek hij naar Thoric en Niels. ‘We hebben nog maar heel weinig eten over,’ zei hij. ‘We houden het niet lang vol, tenzij we gaan jagen. Schiet een aantal dieren dood.’\n\nThoric en Niels jaagden, maar het voelde niet natuurlijk aan. De\n\nbomen en geluiden waren anders. Zelfs de dieren waren anders. Maar de mannen hadden honger. Daarom doodden ze toch onbekende dieren en aten ze op. Het vlees was anders, maar het was niet slecht.\n\nHoofdman Eskol sprak die avond met de mannen. ‘We hebben nu\n\nvoedsel. En daar zijn we dankbaar voor,’ zei hij tegen hen. ‘Maar nu moeten we gaan verkennen. We moeten zien wat er zich achter het strand bevindt. We moeten weten of we hier het land kunnen bewerken. Als we hier voedsel kunnen verbouwen, komen er meer Vikingen.’\n\nEén van de mannen vroeg: ‘Hoe weten we waar we zijn?\n\nSommige mannen denken dat de storm ons uit koers heeft gebracht.’\n\nHoofdman Eskol was een paar minuten stil. Uiteindelijk zei hij niets. Hij antwoordde niet op de vraag en zei: ‘We moeten deze plaats verkennen. We zullen morgen bij zonsopgang beginnen.’',
				summary:
					'De hoofdman vertelt zijn plan aan het dorp. De expeditie zal naar het westen varen op zee. Thoric en Niels zijn gekozen om op reis te gaan. De expeditie vertrekt. Weken later zijn de mannen bang dat er geen land in het westen is. Hoofdman Eskol toont ze bewijs dat het er wel is. Later op de dag is er een storm. De schepen raken uit koers. Ze vinden eindelijk land. Ze gaan van boord. Ze jagen op voedsel. Ze maken plannen om de volgende dag te gaan verkennen.\n\n***',
				vocabulary: [
					{ dutch: 'vooruitgang', english: 'progress', article: 'de' },
					{ dutch: 'krijger', english: 'warrior', article: 'de' },
					{ dutch: 'afscheid nemen', english: 'to say goodbye' },
					{ dutch: 'tocht', english: 'journey', article: 'de' },
					{ dutch: 'vogel', english: 'bird', article: 'de' },
					{ dutch: 'boos', english: 'angry' },
					{ dutch: 'vastberaden', english: 'determined' },
					{ dutch: 'gelijk hebben', english: 'to be right' },
					{ dutch: 'duidelijk', english: 'clear' },
					{ dutch: 'bewijzen', english: 'to prove' },
					{ dutch: 'bewijs', english: 'evidence', article: 'het' },
					{ dutch: 'geloven', english: 'to believe' },
					{ dutch: 'roeien', english: 'to row' },
					{ dutch: 'ruw', english: 'rough' },
					{ dutch: 'lucht', english: 'sky', article: 'de' },
					{ dutch: 'koers (van een schip)', english: 'course (of a ship)', article: 'de' },
					{ dutch: 'wakker worden', english: 'to wake (up)' },
					{ dutch: 'bevelen', english: 'to order' },
					{ dutch: 'zonsopgang', english: 'sunrise', article: 'de' }
				],
				questions: [
					{
						id: 'cq_5_2_6',
						text: 'Hoeveel Vikingen gaan mee op expeditie?',
						options: ['30', '60', '75', '85'],
						correctIndex: 2
					},
					{
						id: 'cq_5_2_7',
						text: 'Hoeveel schepen zijn er op expeditie?',
						options: ['2', '3', '4', '5'],
						correctIndex: 1
					},
					{
						id: 'cq_5_2_8',
						text: 'Halverwege de reis ___.',
						options: [
							'worden de schepen door andere Vikingen aangevallen',
							'kunnen de schepen niet bij elkaar blijven',
							'beginnen de schepen te zinken',
							'komen de schepen in een zware storm'
						],
						correctIndex: 3
					},
					{
						id: 'cq_5_2_9',
						text: 'Wie ziet als eerste de vogels in de lucht?',
						options: ['Thoric', 'Niels', 'Hoofdman Eskol', 'De vader van Niels'],
						correctIndex: 0
					},
					{
						id: 'cq_5_2_10',
						text: 'In welke volgorde zijn de Vikingen van plan om deze dingen te doen?',
						options: [
							'land verkennen, jagen, voedsel verbouwen',
							'voedsel verbouwen, jagen, land verkennen',
							'jagen, voedsel verbouwen, land verkennen',
							'jagen, land verkennen, voedsel verbouwen'
						],
						correctIndex: 3
					}
				]
			},
			{
				id: 'cc_5_3',
				chapterNumber: 3,
				title: 'Het besluit',
				text: 'De mannen stonden met de zon op. Ze aten nog wat voorraden die over waren van de reis. Ze hadden ook vlees van het jagen. Zodra hij klaar was ging Thoric met hoofdman Eskol praten. ‘Dag hoofdman,’ zei hij.\n\n‘Dag Thoric. Heb je iets nodig?’\n\n‘Ik moet met u praten.’\n\n‘Zeg het maar.’\n\nThoric wilde over één ding iets vragen. ‘Aan het begin van de reis,’\n\nzei hij, ‘waren de mannen onzeker. Ze stelden veel vragen. Ze wisten niet of er land was in het westen. Maar u bent een goede leider geweest. We zijn veilig op dit land aangekomen.’\n\n‘Ja. Wat wil je eigenlijk zeggen, Thoric?’\n\n‘De man die je over het land vertelde. De man die u het bewijs gaf.\n\nWie was dat?’\n\n‘De man die me vertelde dat dit terrein bestaat?’\n\n‘Ja precies.’\n\nHoofdman Eskol keek om zich heen.\n\n‘Wat is er?’ vroeg Thoric.\n\n‘Waar is Niels?’\n\n‘Hij zit te eten, denk ik.’\n\n‘Oké. De man die me hierover vertelde was de vader van Niels.’\n\n‘De vader van Niels?’\n\n‘Ja.’\n\nThoric was erg verbaasd. De geheimzinnige man was de vader van Niels? Maar de vader van Niels was dood. Thoric begreep het niet. ‘Ik dacht dat de vader van Niels op een vorige expeditie was gestorven. En dat was een expeditie naar het oosten,’ zei hij. ‘Hij stierf tijdens een val in de bergen.’\n\n‘Nee. Dat was een leugen. Ik stuurde hem naar het westen. Het was een geheime expeditie. Niemand wist iets.’\n\n‘Hebt u hem naar dit land gestuurd? Alleen?’\n\n‘Nee. Ik stuurde hem met 13 andere mannen naar het westen. Twee mannen stierven onderweg. Acht mannen zijn hier gestorven. De vader van Niels en twee mannen kwamen terug. Ze stierven toen ze aankwamen of kort erna. Het kwam door uitputting. Het was niet mogelijk om ze te redden. Voordat de vader van Niels stierf, vertelde hij me over dit land. Bovendien gaf hij me dit.’\n\nEskol gooide het doek met de afbeeldingen op tafel. Het was een\n\nsoort schrift. Thoric had nog nooit zoiets gezien. Thoric keek naar de hoofdman. Ja, misschien had hoofdman Eskol wel bewijs. Nu. Maar van wat?\n\n‘Hoe wist u dat?’ vroeg Thoric. ‘Waarom hebt u die mannen naar het westen gestuurd? U dacht dat er niets anders was dan de zee.’\n\n‘Ik had een voorgevoel.’\n\n‘U had een voorgevoel? ‘De vader van Niels stierf omdat u een voorgevoel had? Omdat u een risico nam?’ Thoric keek Eskol aan.\n\n‘Als Niels erachter komt, zal hij u nooit vergeven.’\n\nHoofdman Eskol nam Thoric bij de arm. ‘Je mag het Niels niet vertellen. Niels is de beste ontdekkingsreiziger die we hebben. Hij is bijna net zo goed als zijn vader. Hij mag nu niet afgeleid worden. We hebben hem nodig.’\n\nThoric knikte. ‘Begrepen.’\n\n‘Ga nu terug naar de mannen,’ zei de hoofdman. ‘Spreek hier nooit meer over.’\n\nKort daarna pakten de mannen hun wapens op. Ze staken het\n\nstrand over en gingen het bos in. Ze waren klaar voor de strijd. Niels leidde de groep. Het was al erg warm. Ze liepen urenlang.\n\nToen zagen ze onderaan een heuvel iets. Het was een groepje mensen. Je zou zelfs kunnen zeggen dat het een dorp was. Niels zwaaide met zijn hand. De expeditie stopte onmiddellijk.\n\nNiels, Eskol en Thoric keken goed. Het dorp zag er in hun ogen\n\nvreemd uit. De huizen leken vreemd. De mannen, vrouwen en kinderen hadden een donkerdere kleur. Ze hadden vreemde kleren\n\naan. Ze spraken een heel vreemde taal. De mannen wisten niet wat ze hiervan moesten denken.\n\nHoofdman Eskol ging als eerste naar het dorp. De rest van de\n\ngroep volgde. In het begin waren veel mensen bang. Sommigen\n\nrenden weg naar hun huis. Hoofdman Eskol gebaarde rustig. ‘We\n\nzullen jullie geen pijn doen!’ zei hij met zachte stem. Eskol zei de woorden een paar keer. Hij maakte elke keer simpele gebaren.\n\nNa enige tijd verscheen het dorpshoofd voor Eskol. Hij bood\n\nhoofdman Eskol wat te drinken aan. Eskol keek naar de drank. Toen zei het dorpshoofd ‘water’ in de Viking-taal. Eskol keek hem verbaasd aan. De man kende hun taal!\n\nHoofdman Eskol sprak enkele uren met het dorpshoofd. Het\n\ndorpshoofd legde veel uit. Hij had de Vikingtaal van de eerdere expeditie geleerd. Hij had met hen gesproken!\n\nHet dorpshoofd legde toen uit wat er met de mannen was\n\ngebeurd. De lokale mensen hadden de mannen niet gedood. Ze hadden geprobeerd hen te helpen. De mannen accepteerden hun hulp niet en stierven. Sommigen werden door dieren gedood. Sommigen stierven omdat ze het verkeerde voedsel aten.\n\nSommigen stierven aan een ziekte.\n\nNa een gesprek met het dorpshoofd, riep hoofdman Eskol zijn\n\nmannen bij elkaar. Hij zei tegen hen: ‘Heren, ik ben veel te weten gekomen. Het belangrijkste is dat hier al eerder Vikingen zijn geweest. Ze luisterden niet naar de mensen hier. En ze stierven.’ Hij keek al zijn mannen aan. Hij was heel serieus.\n\nEskol ging door: ‘Hij heeft me verteld dat een paar van die\n\nVikingen zijn vertrokken. Ze probeerden terug te gaan naar hun thuisland.’ Hij stopte even. ‘Ik heb die mannen ontmoet,’ zei hij. ‘Ze hebben me over dit land verteld. Ook zij zijn dood. Na de reis zijn ze van uitputting gestorven.’\n\nDe mannen keken elkaar aan. Dus dat is hoe Eskol wist van de\n\nlanden in het westen.\n\nEskol was nog niet klaar. Hij werd erg stil. Toen zei hij: ‘We moeten een besluit nemen. We weten niet waar we nu zitten. De storm heeft ons te ver uit koers gebracht.’ De Vikingse ontdekkingsreizigers waren enkele minuten stil.\n\nToen ging hoofdman Eskol verder: ‘We moeten nu besluiten.\n\nBlijven we hier? Leren we om in deze gemeenschap te leven? Als we dat doen, zullen de mensen in deze gemeenschap ons helpen. Ze zullen ons voedsel geven. Ze zullen het ons leren.’ Hij keek al zijn mannen aan. ‘Of, is het ons doel om naar huis te gaan? En uitputting en de dood te riskeren.’ Hoofdman Eskol keek naar de inwoners van het dorp. ‘Dit zijn goede mensen,’ begon hij. ‘Ze kennen het land. Ze kunnen het bewerken. Ze kunnen er jagen. Ze hebben ons gevraagd te blijven. Voor mij is de keus duidelijk. Ik blijf.’\n\nDe mannen keken hoofdman Eskol aan. Eén van hen riep: ‘Dus we laten onze families gewoon zitten? We zullen onze vrienden nooit meer zien? Dat kunnen we toch niet doen!’\n\nEen andere man riep: ‘Kijk naar onze schepen! De storm heeft ze\n\nzwaar beschadigd! We kunnen niet veilig thuiskomen. Niet met\n\nschepen in deze staat! Ik stem ervoor dat we blijven.’\n\nHoofdman Eskol keek naar zijn mannen ‘Misschien hebben jullie allebei gelijk. Daarom zullen we allemaal een persoonlijke keus moeten maken. Als je wilt vertrekken, ben je vrij om te gaan. Ik zal je niet doen blijven. Als je ervoor kiest om te blijven, ben je welkom. Maar vanaf nu ben ik niet meer jullie hoofdman. Ik ben maar een man zoals jullie.’\n\nIn de dagen erna vormden zich twee groepen. Eén groep was van plan om op het nieuwe terrein te blijven. Ze zouden een nieuwe Vikinggemeenschap opbouwen. De tweede groep zou de minst beschadigde schepen meenemen. Ze zouden proberen om terug naar huis te keren.\n\nEen maand later vertrok de tweede groep. Terwijl ze wegvoeren, sprak Eskol: ‘Het is niet gegaan zoals gepland.’\n\n‘Inderdaad niet,’ antwoordde Niels terwijl hij naar zijn voormalige leider keek. ‘Je wilde ons dorp helpen. Het is anders gelopen dan we dachten. Maar dit is een goede plaats. We kunnen hier wonen.’\n\n‘Ja,’ zei Thoric. ‘Het is interessant. Het is goed om hier op een\n\nnieuw terrein met nieuwe dingen te zijn.’\n\n‘En we kunnen doorgaan met ontdekken,’ ging Niels door. ‘We\n\nkunnen nieuwe en interessante uitdagingen tegenkomen. Maak je geen zorgen. We zullen gelukkig zijn.’ Toen glimlachte hij en zei: ‘Hoofdman.’\n\nDe mannen lachten. Ze waren klaar voor hun volgende expeditie\n\n— het ontdekken van een nieuwe wereld. Een wereld die later Noord-Amerika zou worden genoemd.',
				summary:
					'Thoric vraagt hoofdman Eskol hoe hij van het nieuwe land afwist. Eskol legt uit dat hij jaren geleden een expeditie naar het westen stuurde. Slechts twee mannen keerden terug. Ze stierven van uitputting. Eén van die mannen was de vader van Niels. Hoofdman Eskol en de mannen verkennen dan het nieuwe land. Ze vinden een klein dorp. De lokale hoofdman spreekt de Vikingtaal. Hij legt uit dat de dorpelingen al Vikingen hebben geprobeerd te helpen. De mannen luisterden niet en stierven. Eskol besluit dat elke man voor zichzelf moet kiezen wat hij wil doen. Sommige mannen proberen de gevaarlijke reis terug naar huis te maken. Eskol, Niels en Thoric besluiten te blijven. Ze willen het nieuwe terrein verkennen. Deze landen werden later Noord-Amerika genoemd.\n\n***',
				vocabulary: [
					{ dutch: 'voorraad', english: 'supply, provision', article: 'de' },
					{ dutch: 'geheimzinnig', english: 'mysterious' },
					{ dutch: 'leugen', english: 'lie', article: 'de' },
					{ dutch: 'uitputting', english: 'exhaustion', article: 'de' },
					{ dutch: 'schrift', english: 'writing', article: 'het' },
					{ dutch: 'een voorgevoel hebben', english: 'to have a feeling, premonition' },
					{ dutch: 'vergeven', english: 'to forgive' },
					{ dutch: 'afgeleid', english: 'distracted' },
					{ dutch: 'wapen', english: 'weapon', article: 'het' },
					{ dutch: 'strijd', english: 'battle', article: 'de' },
					{ dutch: 'heuvel', english: 'hill', article: 'de' },
					{ dutch: 'taal', english: 'language', article: 'de' },
					{ dutch: 'gebaren', english: 'to gesture' },
					{ dutch: 'pijn doen', english: 'to hurt' },
					{ dutch: 'stem', english: 'voice', article: 'de' },
					{ dutch: 'ziekte', english: 'disease', article: 'de' },
					{ dutch: 'gemeenschap', english: 'society, community', article: 'de' },
					{ dutch: 'doel', english: 'aim', article: 'het' },
					{ dutch: 'beschadigen', english: 'to damage' },
					{ dutch: 'stemmen', english: 'to vote' },
					{ dutch: 'voormalig', english: 'former' },
					{ dutch: 'uitdaging', english: 'challenge', article: 'de' }
				],
				questions: [
					{
						id: 'cq_5_3_11',
						text: 'Wie heeft hoofdman Eskol verteld over de landen in het westen?',
						options: [
							'De vader van Eskol',
							'De vader van Thoric',
							'De vader van Niels',
							'Het dorpshoofd'
						],
						correctIndex: 2
					},
					{
						id: 'cq_5_3_12',
						text: 'Tijdens het verkennen ontmoet de expeditie ___.',
						options: [
							'Vikingse dieren',
							'een andere groep Vikingen',
							'een groep plaatselijke bewoners',
							'een boerderij'
						],
						correctIndex: 2
					},
					{
						id: 'cq_5_3_13',
						text: 'De Vikingen vormen twee groepen omdat ___.',
						options: [
							'ze honger hebben',
							'ze moeten vechten',
							'ze verschillende dingen willen doen',
							'hun koers is veranderd'
						],
						correctIndex: 2
					},
					{
						id: 'cq_5_3_14',
						text: 'Hoofdman Eskol besluit ___.',
						options: [
							'om terug te gaan naar Noord-Europa',
							'om door te gaan om nog meer andere landen ontdekken',
							'om in het nieuwe land te blijven',
							'om tegen de lokale bevolking te vechten'
						],
						correctIndex: 2
					},
					{
						id: 'cq_5_3_15',
						text: 'Het land in het verhaal heet in de tijd van nu ___',
						options: ['Noorwegen', 'Noord-Amerika', 'het Verenigd Koninkrijk', 'Zuid-Amerika'],
						correctIndex: 1
					}
				]
			}
		]
	},
	// ---- RANK 6: Laura, de onzichtbare vrouw ----
	{
		id: 'cs_6',
		rank: 6,
		title: 'Laura, de onzichtbare vrouw',
		chapters: [
			{
				id: 'cc_6_1',
				chapterNumber: 1,
				title: 'Het incident',
				text: 'Laura is een doorsnee vrouw. Ze is een vrouw van doorsnee lengte. Ze heeft een doorsnee gewicht. Ze heeft een doorsnee baan met een doorsnee inkomen. Ze woont in een middelgroot huis. Ze rijdt in een middelgrote auto. Ze heeft zelfs een middelgrote hond! Kortom, Laura leidt een doorsnee leven.\n\nLaura heeft ook een makkelijk leven - een leven zonder\n\nincidenten. Ze is academisch opgeleid. Ze woont en werkt in\n\nHaarlem. Ze is administratief medewerkster voor een verkoopmanagementteam. Ze gaat vaak erg laat van haar werk naar huis. Ze spreekt nooit negatief over haar bedrijf. Ze is een perfecte medewerkster en ze is zeer professioneel.\n\nLaura vindt het fijn waar ze woont. In het weekend brengt ze graag\n\ntijd door met familie en vrienden. Samen gaan ze vaak naar sportclubs, de film of zelfs naar het theater. En vorige week hebben zij en haar man nog naar een fantastische serie van films gekeken. Maar soms wil Laura wat rust. Daarom gaat ze soms in het weekend de stad uit.\n\nVandaag gaat Laura met haar vrienden, Rik en Sophie, de natuur\n\nin. De vrienden zijn van plan om te barbecueën.\n\nLaura parkeert haar auto bij een park buiten Haarlem. Het is een\n\nprachtig terrein met verschillende bomen. Sophie kijkt om zich heen. ‘Dit is een geweldige plek voor een barbecue!’\n\n‘Daar ben ik het mee eens,’ zegt Rik. ‘Hebben we genoeg te eten\n\nbij ons?’\n\n‘Natuurlijk,’ antwoordt Laura. ‘Ik weet hoeveel je van eten houdt!’\n\nZe lachen allemaal. Dan zegt Laura: ‘Laten we beginnen met koken!’\n\nLaura, Rik en Sophie halen het eten uit de auto. Ze zetten wat muziek aan en bereiden alles voor de barbecue voor. Laura vindt wat takken en maakt een vuurtje. Ze wacht tot het heet wordt. Terwijl ze wacht, controleert Laura haar berichten.\n\n‘Oh nee!’ zegt Laura. Ze heeft een bericht van de directeur op\n\nhaar kantoor. Ze is vergeten iets aan de productieafdeling te posten. Ze hebben het onmiddellijk nodig! Laura heeft net naar een nieuwe baan op de productieafdeling gesolliciteerd. Ze heeft maandag een sollicitatiegesprek. Ze moet dit meteen oplossen!\n\nLaura kijkt naar haar vrienden. Ze houdt haar mobiel omhoog. ‘Hé jongens,’ zegt ze. ‘Ik ben zo terug. Ik moet even naar mijn werk bellen.’\n\n‘Oh, kom op, Laura’, zegt Rik. ‘Je bent altijd aan het werk …’\n\n‘Rik heeft gelijk, Laura,’ voegt Sophie eraan toe.\n\n‘Ik weet ‘t … ik weet ‘t …’ zegt Laura. ‘Maar ik heb een bericht van de directeur ontvangen. En ze is niet erg blij.’\n\nLaura loopt naar een paar bomen die in de buurt staan. Het is avond en het wordt donker. De bomen zijn erg hoog. Ze kan bijna niets zien.\n\nLaura belt naar haar kantoor. Ze spreekt met een andere administratieve medewerker. De assistent vraagt haar even te wachten op de directeur.\n\nTerwijl ze wacht, kijkt Laura om zich heen. Plotseling ziet ze iets. Er schijnt een vreemd licht tussen de bomen! Laura doet haar mobieltje weg. Ze loopt naar het licht toe.\n\nHet licht komt van een prachtige metalen bal. Laura heeft nog\n\nnooit zoiets gezien! De bal is bedekt met mooie patronen. Ze strekt haar hand uit om hem aan te raken. Het metaal is koud. Het voelt prettig aan.\n\nLaura raapt de bal op. Maar dan gaat het licht uit, net zo snel als het aanging. In haar hand voelt de bal heel vreemd. Hij voelt bijna te koud aan. Laura vindt het geen fijn gevoel. Ze laat de bal vallen. Dan gaat ze terug naar de barbecue.\n\nLaura gaat naar haar vrienden toe. Ze praten over haar. ‘Laura\n\nzou haar mobieltje in het weekend moeten uitschakelen,’ zegt Rik.\n\n‘Ik ben het met je eens,’ zegt Sophie. ‘Het is niet goed om zoveel\n\nte werken. Lichaam engeest hebben rust nodig. Ze moet zich soms ontspannen.’\n\nLaura loopt naar ze toe. ‘Hé, hebben jullie het over mij?’ Ze lacht.\n\n‘Oké. Oké. Ik ga me nu ontspannen!’\n\nRik en Sophie zeggen niets. Rik controleert of de barbecue het\n\ngoed doet. Laura’s vrienden negeren haar volledig. Ze kijken niet eens naar haar.\n\n‘Waarom kijken jullie me niet aan?’ vraagt Laura. Ze zwaait naar\n\nRik. Ze houdt haar gezicht vlakbij Sophie. Dan probeert ze ze echt uit. Ze danst om hen heen en zwaait met haar armen. Sophie kijkt om zich heen, maar dan blijven ze haar negeren. Het is net alsof Laura er niet is!\n\nRik en Sophie gaan door met praten over Laura. ‘Ik vraag me af\n\nwaar ze is?’ vraagt Rik. ‘Ze is al heel lang aan de telefoon. Ik maak me zorgen.’\n\n‘Je weet hoe ze is,’ zegt Sophie. ‘Ze bespreekt waarschijnlijk\n\nfinanciële zaken of contracten of zoiets. Ze komt vast zo terug.’\n\nDan realiseert Laura zich iets. Haar vrienden kunnen haar niet\n\nzien! Hoe ongelooflijk het ook is, ze blijkt onzichtbaar te zijn! Het is alsof ze in een tv-serie zit!\n\n‘Oh, wat nu!’ denkt Laura. ‘Ik kan het niet geloven!’ Dan denkt ze,\n\n‘maar hoe komt dit?’ Plotseling zich herinneren Laura zich het\n\nvreemde voorwerp in de bomen. Komt dit door het licht? denkt ze. Ben ik onzichtbaar omdat ik het heb aangeraakt? Ze weet het niet zeker.\n\nLaura weet niet wat ze moet doen. Uiteindelijk neemt ze een\n\nbeslissing. ‘Ik weet niet hoe lang dat licht me zal beïnvloeden,’ zegt ze. ‘Ik ben onzichtbaar! Ik moet ervan genieten!’\n\nLaura kijkt naar haar vrienden. Rik haalt het eten van de\n\nbarbecue. Sophie zet koude frisdranken op tafel. Laura luistert naar hun gesprek.\n\n‘Tja, Rik,’ zegt Sophie. ‘Laura werkt veel, maar dat is normaal. En, ho! Dit is haar grote kans. Op een dag wordt ze misschien bedrijfsvoorzitter!’\n\n‘Ja, maar ze verdient niet genoeg,’ zegt Rik.\n\n‘Dat is waar,’ zegt Sophie. ‘Maar haar salaris wordt vast beter. Ze\n\nzal uiteindelijk wel krijgen wat ze waard is. Ze zullen zich realiseren\n\ndat zij hun beste medewerker is. Wie weet wat ze kan bereiken.’\n\n‘Ja, dat weet ik. Alleen wilde ik dat ze zich meer kon ontspannen.’\n\n‘Ik weet ‘t. Dat wil ik ook,’ zegt Sophie terwijl ze verdergaat met koken. Laura is verbaasd. Ze wist niet hoeveel haar vrienden haar respecteerden. Alles wat ze over haar zeggen is zo aardig! Ze glimlacht blij.\n\nPlotseling verandert de toon van Rik. ‘Nu even serieus,’ zegt hij. ‘Waar is Laura?’\n\n‘Ik weet het echt niet,’ antwoordt Sophie. ‘Laten we haar gaan zoeken.’\n\nLaura’s vrienden zetten de muziek uit. Ze lopen naar de bomen. Ze lopen recht op het vreemde voorwerp af! Het ligt op de grond. Rik is de eerste die het ziet. ‘Kijk Sophie. Wat is dit?’ Hij raapt het op. Hij inspecteert het.\n\nSophie kijkt hem met een vreemde blik aan. ‘Ik weet het niet … maar ik zou het niet aanraken!’\n\nRik kijkt verbaasd op. ‘Je hebt gelijk.’ Hij gooit de bal in de bomen. De twee blijven naar Laura zoeken.\n\nNa een tijdje lopen Rik en Sophie terug naar de plek van de barbecue. Beiden blijven verbaasd staan. Laura’s auto is er niet! Rik kijkt naar Sophie. ‘Wat gebeurt hier? Is dit een één of ander spel?’ vraagt hij.\n\n‘Ik heb geen idee,’ antwoordt Sophie. ‘Totaal geen idee.’',
				summary:
					'Laura is een doorsnee vrouw. Zij is administratief medewerkster in Haarlem. Op een dag rijden Laura en haar vrienden naar de natuur. De vrienden willen barbecueën. Tijdens de barbecue vindt Laura een vreemd voorwerp. Ze raakt het aan en wordt onzichtbaar. Niemand kan haar zien of vinden. Laura gaat terug naar Haarlem. Ze wil genieten van het onzichtbaar te zijn. Haar vrienden maken zich zorgen. Ze bellen de politie.\n\n***',
				vocabulary: [
					{ dutch: 'onzichtbaar', english: 'invisible' },
					{ dutch: 'doorsnee', english: 'average' },
					{ dutch: 'opleiden', english: 'to educate' },
					{
						dutch: 'administratief medewerkster',
						english: 'administrative assistant',
						article: 'de'
					},
					{ dutch: 'kantoor', english: 'office', article: 'het' },
					{ dutch: 'afdeling', english: 'department', article: 'de' },
					{ dutch: 'solliciteren', english: 'to apply for a job' },
					{ dutch: 'bedekken', english: 'to cover' },
					{ dutch: 'uitschakelen', english: 'to switch off' },
					{ dutch: 'lichaam', english: 'body', article: 'het' },
					{ dutch: 'geest', english: 'mind', article: 'de' },
					{ dutch: 'zich ontspannen', english: 'to relax' },
					{ dutch: 'zaak', english: 'matter', article: 'de' },
					{ dutch: 'zich herinneren', english: 'to remember' },
					{ dutch: 'voorwerp', english: 'object', article: 'het' },
					{ dutch: 'beïnvloeden', english: 'to influence' },
					{ dutch: 'voorzitter', english: 'president', article: 'de' },
					{ dutch: 'verdienen', english: 'to earn' },
					{ dutch: 'waard', english: 'worth' },
					{ dutch: 'bereiken', english: 'to reach' },
					{ dutch: 'blik', english: 'look', article: 'de' },
					{ dutch: 'ervaren', english: 'to experience' }
				],
				questions: [
					{
						id: 'cq_6_1_1',
						text: 'Laura werkt als ___.',
						options: ['administratief medewerkster', 'kokkin', 'chauffeuse', 'verkoopster'],
						correctIndex: 0
					},
					{
						id: 'cq_6_1_2',
						text: 'Laura is ___.',
						options: [
							'een heel jong meisje',
							'een vrouw van gemiddelde lengte',
							'een oude vrouw',
							'niet goed beschreven in het verhaal'
						],
						correctIndex: 1
					},
					{
						id: 'cq_6_1_3',
						text: 'De beste vrienden van Laura heten ___.',
						options: ['Ollie en Laura', 'Joop en Sarah', 'Rik en Sophie', 'Jan en Sophie'],
						correctIndex: 2
					},
					{
						id: 'cq_6_1_4',
						text: 'Haar vrienden vinden dat Laura ___.',
						options: [
							'een nieuwe baan moet zoeken',
							'niet genoeg werkt',
							'te veel werkt',
							'een betere werkneemster zou kunnen zijn'
						],
						correctIndex: 2
					},
					{
						id: 'cq_6_1_5',
						text: 'Laura besluit ___.',
						options: [
							'naar Haarlem te gaan om hulp te halen',
							'haar vrienden te bellen',
							'te genieten van haar nieuwe kracht',
							'mensen die ze niet kent af te luisteren'
						],
						correctIndex: 2
					}
				]
			},
			{
				id: 'cc_6_2',
				chapterNumber: 2,
				title: 'De leugen',
				text: 'Laura arriveert in Haarlem. Ze parkeert vlakbij de Warmoesstraat. Ze loopt door het centrum. Niemand ziet haar. Ze kan het niet geloven. Ze lacht stilletjes. ‘Dit is echt fantastisch!’\n\nLaura bedenkt wat ze zal doen. In gedachten maakt ze een lijst met alle dingen die leuk zouden kunnen zijn. Ze begint te lachen. Voor het eerst in haar leven is ze niet meer doorsnee!\n\nLaura vervolgt haar wandeling door de Warmoesstraat. Er zijn daar diverse kleine winkels. Deze avond lopen er veel klanten en winkelpersoneel.\n\nLaura loopt een winkel in. Hoewel mensen haar niet kunnen zien\n\nof horen, kunnen sommigen haar voelen. Ze moet voorzichtig zijn. Ze pakt schoenen en een jurk. Ze kijkt, maar legt ze dan terug. Ze vindt het leuk om onzichtbaar te zijn, maar ze wil niet stelen.\n\nVervolgens gaat Laura naar een populair restaurant. De mensen staan buiten in een lange rij te wachten. Ze loopt er gemakkelijk langs. Ze loopt zo naar binnen. ‘Dit wordt pas leuk!’ denkt ze. Ze vindt het echt heerlijk om ‘De onzichtbare vrouw’ te zijn.\n\nZe blijft een tijdje in het restaurant. Dan heeft Laura een idee. Ze kan naar haar kantoor gaan! Haar manager werkt vandaag. Het zou leuk zijn om te zien wat ze aan het doen is. Vooral als ze niet weet dat Laura er is.\n\nLaura haast zich naar haar kantoor. Ze gaat het gebouw in. Ze\n\nkijkt naar de balie van de veiligheidscontrole. De computerschermen zijn duidelijk te zien. De beveiligingscamera’s filmen haar niet. Ze is veilig!\n\nLaura wacht een minuutje. Er loopt nog een administratieve medewerker het gebouw binnen. Hij gaat naar hetzelfde kantoor. Ze volgt hem tot in de lift. Al snel is ze op de zevende verdieping. Nu moet ze haar manager gaan zoeken.\n\nLaura’s manager, mevrouw Smit, is in het centrale kantoor. Ze\n\npraat met verschillende andere managers. ‘Onze medewerkers werken heel hard,’ zegt ze. ‘Sommigen geven we bonussen.\n\nSommige medewerkers krijgen zelfs aandelen. Maar de meeste\n\nwerknemers krijgen slechts een percentage van onze winst.\n\nTegenwoordig is dat echter niet genoeg. We moeten in dit bedrijf\n\niets veranderen. We moeten het beter doen. Onze werknemers moeten meer geld verdienen.’\n\nLaura kan het niet geloven. Mevrouw Smit vecht voor haar\n\nwerknemers! dacht ze. Ik had nooit gedacht dat dit zou gebeuren!\n\n‘Hier is een voorbeeld,’ vervolgt mevrouw Smit. ‘Ik heb een\n\nmedewerkster. Ze heet Laura. Ze werkt hier al vijf jaar. Ze werkt heel\n\nhard. Ze heeft nooit om salarisverhoging gevraagd. Ze is een goede medewerkster. Maar we kunnen Laura op dit moment niet meer geld betalen. Waarom niet? Omdat de bedrijfswinst deze periode laag is. We hebben al ons geld nodig om zelfs open te blijven. Er moet iets veranderen!’\n\n‘Dit is niet te geloven!’ zegt Laura tegen zichzelf. ‘Mijn manager\n\nheeft net gezegd dat ik een goede medewerkster ben! Tegen iedereen! Dat is goed voor mijn carrière!’ Dan denkt ze het is echter wel jammer van de bedrijfswinst. Maar hoe komt dat eigenlijk? Anton werkt aan dat grote technologieproject. Ik denk dat dat goed zal zijn voor de winst.\n\nLaura wil weten wat er aan de hand is. En dit is het perfecte\n\nmoment om het uit te zoeken. Ze is tenslotte onzichtbaar. Ze kan overal naar binnen!\n\nLaura gaat naar het kantoor van Anton. Anton is manager\n\ncomputerprogrammering. Ik wil zijn ideeën niet stelen, denkt ze. Ik wil gewoon weten waarom het bedrijf geld verliest.\n\nAnton is echt succesvol. Hij begon als verkoopmedewerker. Hij\n\nhaalde altijd zijn verkoopdoelen. Dus hebben ze hem in het managementteam opgenomen. Nu werkt hij aan een groot project. Dat gaat om veel geld. De geldproblemen van het bedrijf zouden binnenkort opgelost moeten zijn.\n\nLaura besluit de dossiers van Anton te bekijken. Ze kan haar manager nog steeds buiten horen praten. ‘Anton, vertel eens,’ begint mevrouw Smit. ‘Ik weet dat je aan dat grote technologieproject werkt. Het is dat project dat is gebaseerd op het netwerkprogramma waar we samen aan hebben gewerkt. Dit project heeft toch potentieel, hè? We kunnen er toch veel geld aan verdienen?’\n\n‘Het spijt me echt heel erg, mevrouw Smit,’ begint Anton. ‘Maar het project is niet te realiseren. Het kost te veel. Het is een enorme investering. En de netwerkprogrammering is zeer geavanceerd. We hebben gewoon niet genoeg technologie.’\n\nTerwijl ze luistert, vindt Laura het projectdossier. Anton heeft veel\n\nonderzoek gedaan. Dat kan ze lezen in zijn documenten. Maar Anton heeft het duidelijk mis. Volgens de documenten heeft het project op dit moment veel potentieel. De technologie is niet zo geavanceerd. Ze bekijkt de documenten opnieuw. Anton liegt. Het project is zeer winstgevend.\n\nWaarom wil Anton het project niet doen? denkt ze. Het is echt een goed project! Waarom liegt hij? Dan ziet ze iets. Het is een ander dossier. Daarin zit een brief. Hij is op het papier van een concurrent getypt!\n\nLaura leest de brief snel. Anton heeft het idee aan de concurrent verkocht. Hij is van plan om zijn baan op te geven en voor hen te gaan werken! Hoe kan hij dat doen? denkt ze. Als we dit project niet krijgen, krijg ik mijn salarisverhoging niet!\n\nLaura besluit dat het tijd is om iets aan Anton te doen! Ze pakt Antons brief van de concurrentie en het projectdossier. Ze laat ze allebei op het bureau van haar manager achter. ‘Zo,’ zegt ze. ‘Mevrouw Smit heeft morgenochtend een leuke verrassing. Anton ook—hopelijk wordt het de politie!’\n\nLaura laat de managers verder vergaderen. Het wordt laat. Ze besluit naar huis te gaan naar haar man. De laatste tijd hebben ze veel ruzie. Ze hadden zelfs vandaag grote ruzie over het werk. Het zou interessant zijn om haar man te zien terwijl ze onzichtbaar is. Misschien kan ze er nog iets van leren!\n\nLaura rijdt naar huis. Ze gaat voorzichtig haar huis in. Als ze\n\nbinnenkomt, hoort ze haar man huilen. ‘Wat is er aan de hand?’ vraagt Laura zich af. Dan hoort ze hem praten.\n\n‘Weet u het zeker, agent?’ zegt hij verdrietig.\n\nGerard, haar man, is aan de telefoon. Hij praat met de politie! Dan\n\nrealiseert Laura zich iets. Formeel wordt ze al uren vermist. Gerard is waarschijnlijk erg bezorgd.\n\nGerard legt de telefoon neer. Hij begint harder te huilen. Dan\n\nrealiseert Laura zich iets. Gerard houdt heel veel van haar. Ze kijkt\n\nhem aan. Ze kan zien dat hij er echt onder lijdt. Laura neemt op dit moment een besluit. Ondanks hun problemen wil ze dat hun relatie in orde komt!\n\nLaura wil haar echtgenoot aanraken. Dan herinnert ze zich dat ze\n\nonzichtbaar is. Hij zal bang worden. Voor de eerste keer denkt Laura goed na over haar situatie. Onzichtbaar zijn is meestal wel leuk. Het heeft voordelen. Ze wil echter niet altijd zo blijven!\n\nMaar hoe kan Laura weer zichtbaar worden? Dan heeft Laura een\n\nidee. Natuurlijk! De metalen bal! denkt ze. Ze moet het voorwerp weer aanraken. Misschien wordt ze dan weer zichtbaar. Ze moet terug naar het park!\n\nLaura stapt in haar auto. Ze rijdt door de straten van Haarlem. Het\n\nis laat. Er zijn niet veel auto’s. Toch rijdt Laura door stille wijken. Een onzichtbare vrouw in een zichtbare auto is moeilijk uit te leggen.\n\nEindelijk arriveert Laura in het park. Sophie en Rik zijn er nog\n\nsteeds. Er zijn echter ook veel andere mensen, inclusief de politie! Wat is er aan de hand? denkt ze.',
				summary:
					'Laura is nog steeds onzichtbaar. Ze gaat naar haar kantoor in Haarlem. Ze luistert naar een vergadering over lage winst. Een medewerker die Anton heet, zegt dat een groot project niet door kan gaan. Laura controleert Antons dossiers. Hij liegt. Hij heeft het idee van het project verkocht. Laura geeft de dossiers van Anton aan haar manager. Daarna kijkt Laura hoe het met haar echtgenoot gaat. Hij is bezorgd om haar. Ze weet nu dat hij veel van haar houdt. Ze wil de metalen bal aanraken. Misschien wordt ze dan weer zichtbaar. Ze rijdt naar het park. Daar gebeurt er echter iets vreemds.\n\n***',
				vocabulary: [
					{ dutch: 'gedachte', english: 'thought', article: 'de' },
					{ dutch: 'vervolgen', english: 'to continue' },
					{ dutch: 'voorzichtig', english: 'careful' },
					{ dutch: 'vervolgens', english: 'next' },
					{ dutch: 'balie', english: 'desk', article: 'de' },
					{ dutch: 'aandeel', english: 'stock', article: 'het' },
					{ dutch: 'winst', english: 'profit', article: 'de' },
					{ dutch: 'tegenwoordig', english: 'these days' },
					{ dutch: 'werknemer', english: 'employee', article: 'de' },
					{ dutch: 'salarisverhoging', english: 'increase in salary', article: 'de' },
					{ dutch: 'investering', english: 'investment', article: 'de' },
					{ dutch: 'onderzoek', english: 'research', article: 'het' },
					{ dutch: 'concurrent', english: 'competitor', article: 'de' },
					{ dutch: 'ruzie', english: 'argument', article: 'de' },
					{ dutch: 'huilen', english: 'to cry' },
					{ dutch: 'lijden', english: 'to suffer' },
					{ dutch: 'voordeel', english: 'advantage', article: 'het' }
				],
				questions: [
					{
						id: 'cq_6_2_6',
						text: 'Laura loopt ___.',
						options: [
							'door de Warmoesstraat',
							'door een park in de buurt van Haarlem',
							'door een winkel in Haarlem',
							'buiten Haarlem'
						],
						correctIndex: 0
					},
					{
						id: 'cq_6_2_7',
						text: 'Laura besluit nadat ze heeft ontdekt dat ze onzichtbaar is ook nog naar ___.',
						options: [
							'haar huis te gaan',
							'haar kantoor te gaan',
							'een klein stadje te gaan',
							'de Warmoesstraat te gaan'
						],
						correctIndex: 1
					},
					{
						id: 'cq_6_2_8',
						text: 'Anton, een manager in het bedrijf van Laura, ___.',
						options: [
							'wil het bedrijf kopen',
							'wil met Laura uitgaan',
							'liegt over het project',
							'denkt dat medewerkers meer geld nodig hebben'
						],
						correctIndex: 2
					},
					{
						id: 'cq_6_2_9',
						text: 'Wat heeft Laura besloten over haar man?',
						options: [
							'Dat ze niet van hem houdt',
							'Dat hij niet van haar houdt',
							'Dat ze hun relatie wil verbeteren',
							'Dat ze hem wil verlaten'
						],
						correctIndex: 2
					},
					{
						id: 'cq_6_2_10',
						text: 'Laura denkt dat ze zichtbaar kan worden door ___.',
						options: [
							'de metalen bal weer aan te raken',
							'de metalen bal stuk te maken',
							'de metalen bal ver weg te brengen',
							'met Anton te praten'
						],
						correctIndex: 0
					}
				]
			},
			{
				id: 'cc_6_3',
				chapterNumber: 3,
				title: 'Het voorwerp',
				text: 'Laura is terug in het kleine park. Er staat een grote menigte van mensen. De politie is er ook. Wat doen al deze mensen hier? Laura denkt na. Dan realiseert ze zich wat er aan de hand is. Ze zijn er vanwege haar!\n\nSophie en Rik staan tussen de mensen. Ze praten in de buurt van een tafel. Laura loopt naar ze toe. Terwijl ze loopt kijkt Laura om zich heen. Iedereen is er bij — Laura’s vrienden, haar familieleden, de politie en vrijwilligers uit Haarlem. Zelfs Gerard komt net aanrijden!\n\n‘Denk eens na, Sophie,’ zegt Rik verdrietig. ‘Waar zou Laura kunnen zijn? Ik bedoel maar, we stonden daar!’\n\n‘Ik heb geen idee,’ antwoordt Sophie. ‘Ze komt vast terug. Het is gewoon zo vreemd …’\n\n‘Ja. Het ene moment is ze aan de telefoon en dan is ze weg!’\n\n‘Ik weet ‘t,’ zegt Sophie. ‘Ik maak me echt zorgen …’\n\nLaura luistert. Ze begint zich te schamen. Ze wil haar vrienden en man geen pijn doen. Ze wil andermans tijd niet verspillen. Ze wil gewoon terug naar de metalen bal. Ze is klaar met het onzichtbaar te zijn!\n\nZe hoort Rik weer. ‘Hé, Sophie. Herinner jij je die metalen bal? Daar bij die bomen?’\n\n‘Ja?’\n\nNou, ik heb een theorie.’\n\nSophie kijkt hem aan. ‘Een theorie?’\n\n‘Ja,’ gaat Rik verder. ‘Wat als er meer achter zit? Wat als hij op Laura een vreemd effect heeft gehad?’\n\nSophie blijft Rik aankijken. Ze lijkt in de war. Maar Laura is niet in\n\nde war. Ze maakt zich zorgen. Ze wil niet dat haar vrienden iets weten. Ze wil gewoon de bal aanraken en zichtbaar worden. Ze wil niets uitleggen!\n\nRik kijkt Sophie goed aan. ‘Misschien is het een speciale bal.\n\nMisschien is Laura er ziek van geworden. Of misschien heeft het haar zelfs ergens naartoe gebracht! Je weet maar nooit …’\n\nSophie schudt haar hoofd. ‘Jij en je theorieën, Rik …’ Dan stopt ze. Er is geen andere verklaring. Misschien …\n\n‘Laat me even nadenken. Laura is in de buurt ervan verdwenen,’\n\nvoegt Rik eraan toe. Ze kijken elkaar aan. Dan zegt Rik: ‘Kom op! Laten we gaan kijken.’\n\nSophie is het daar uiteindelijk mee eens. ‘Oké. Laten we gaan.’ De twee vrienden lopen naar de bomen toe. Oh nee! denkt Laura.\n\nWat als ze de bal meenemen? Of hem aan de politie geven? Laura rent haar vrienden vooruit. Ze moet het voorwerp als eerste vinden!\n\nLaura komt als eerste bij de bomen. Het metalen voorwerp is er\n\nniet! Waar is het? denkt ze. Het moet hier ergens zijn! Ze blijft zoeken.\n\nRik en Sophie komen dichterbij. ‘Hij moet hier ergens zijn! Ik\n\ngooide hem daarheen,’ zegt Rik terwijl hij naar de bomen wijst.\n\nDat is het! denkt Laura. Iemand heeft hem ergens anders\n\nneergelegd! Wat als ze hem verloren hebben? Ik heb die bal nodig! Laura rent naar de plek waar Rik naar toewijst. Rik en Sophie lopen ook naar die plek. Plotseling staat Rik op. Hij heeft het metalen voorwerp in zijn hand! Laura kijkt goed naar het voorwerp. Er is nu helemaal geen licht.\n\nZe weet niet wat dat betekent. Ze moet gewoon een manier\n\nvinden om het voorwerp opnieuw aan te raken. Ze weet dat het haar zichtbaar zal maken.\n\n‘Hé, Sophie. Ik heb hem gevonden!’ roept Rik.\n\nSophie rent naar hem toe. ‘Wauw! Wat is het precies?’ vraagt ze. ‘Ik heb geen idee,’ antwoordt Rik. ‘Hij is rond en van metaal gemaakt. Maar ik weet niet wat hij doet.’\n\n‘Denk je echt dat hij Laura iets heeft gedaan?’\n\n‘Ik denk het eigenlijk niet. Het kan toch niet. Het is gewoon een metalen bal. Jammer van mijn theorie …’ Rik gooit de metalen bal in de bomen. Laura let goed op.\n\n‘Kom op,’ zegt Sophie als ze weglopen. ‘Laten we nu met de politie praten. Misschien moeten we de ziekenhuizen bellen of …’\n\nLaura wacht tot Rik en Sophie vertrokken zijn. Ze wil het voorwerp aanraken. Maar ze wil haar vrienden en haar man geen pijn doen.\n\nAls ze uit het niets verschijnt, zijn ze misschien heel bang!\n\nEindelijk zijn Rik en Sophie weg. Laura gaat naar de bomen. Ze pakt de metalen bal op en raakt hem aan. Eerst voelt ze niets. Dan begint het vreemde object op te lichten. Laura begint te trillen. Het object is opnieuw volledig verlicht. Eindelijk gebeurt er iets! denkt ze.\n\nIneens houdt het trillen op. De metalen bal is nog steeds verlicht. ‘Is dat het? Heeft het gewerkt?’ Laura vraagt het zich af. Ze krijgt snel antwoord. ‘Laura! Laura!’ hoort ze. ‘Ben jij dat?’ Het zijn Sophie en Rik. Ze kunnen haar zien! Ze is zichtbaar!\n\nLaura’s vrienden rennen naar haar toe. Ze heeft het licht nog steeds in haar hand. Oh-oh, denkt ze. Ze laat de bal snel los. Hij gaat langzaam de bomen in. Al snel kan ze hem niet meer zien.\n\n‘Laura, waar ben je geweest?’ roept Rik. Laura draait zich om. Dan zegt Sophie: ‘En wat was dat licht? Het was zo intens! Daardoor hebben we je gevonden!’\n\nLaura weet niet wat ze moet zeggen. De waarheid vertellen zou alles zo moeilijk maken. Niemand zou haar geloven. Een onzichtbare vrouw? Echt waar?!\n\nPlotseling hoort Laura een andere stem vanuit de menigte. Het is Gerard! Hij rent naar Laura toe. Hij geeft haar een stevige knuffel en kust haar. Dan kijkt hij haar in de ogen en zegt: ‘Waar was je? Ik was zo bezorgd!’\n\nLaura is sprakeloos. ‘Ik was in … in … ik …’\n\nMeer stemmen vanuit de menigte roepen om haar. Het is haar\n\nmanager en diverse anderen van het kantoor. Laura kan alle steun niet geloven. Er zijn zoveel mensen om haar te helpen!\n\nDe mensen staan om Laura heen. Ze beginnen allemaal tegelijk te\n\npraten. ‘We waren zo bezorgd!’ herhaalt Gerard.\n\nWaar ben je geweest?’ zegt Rik.\n\n‘Je zal niet geloven wat er op kantoor is gebeurd!’ zegt mevrouw\n\nSmit.\n\nLaura steekt haar arm omhoog. ‘Wacht … wacht … geef me een\n\neven de tijd.’ De groep wordt stil. Laura kijkt om zich heen. ‘Mag ik jullie allereerst bedanken. Enorm bedankt voor al jullie hulp. Ik ben echt blij met al jullie steun.’ Dan vervolgt ze: ‘Ik weet zeker dat jullie je afvragen waar ik was. Nou, de waarheid is …’ Laura pauzeert. Moet ze hen echt de waarheid vertellen? Zouden ze haar geloven? Zouden ze denken dat ze gek was?\n\nLaura begint opnieuw. ‘De waarheid is … dat ik verdwaald was,’\n\nzegt ze dan. ‘Ik was aan het bellen,’ vervolgt Laura. ‘Ik lette niet op waar ik naartoe ging. Plotseling kon ik de weg niet terugvinden.’ Ze glimlacht en zegt: ‘Nogmaals bedankt en welterusten.’\n\nLaura en Gerard lopen naar haar auto. Ze wil naar huis. Ze lopen\n\nlangs Rik en Sophie.\n\n‘Maar hoe zit het met je auto?’ roept Rik. ‘Hij stond er niet meer!\n\nDat hebben we gezien!’\n\n‘En hoe zit het met dat licht?’ vraagt Sophie. ‘Wat was dat?’ En\n\nweet je, we hebben iets in de bomen gezien. Het was een metalen bal en …’\n\nLaura blijft lopen. Misschien moet ze later alles uitleggen, maar nu\n\nniet. Haar ervaring als een onzichtbare vrouw was geweldig! Ze weet nu dat ze aardige vrienden heeft, een goede manager en een geweldige man. Ze heeft ook iets heel belangrijks geleerd; het is geweldig om een doodgewoon doorsnee leven te leiden!',
				summary:
					'Laura is terug in het park. Er staat een grote menigte van mensen. De politie is er ook. Laura ontdekt dat iedereen er is vanwege haar. Sophie en Rik zijn verdrietig omdat Laura was verdwenen. Laura probeert zichtbaar te worden. Ze vindt het metalen voorwerp en raakt het aan. Plotseling kan iedereen haar weer zien. Laura is weer zichtbaar.',
				vocabulary: [
					{ dutch: 'menigte', english: 'crowd', article: 'de' },
					{ dutch: 'vrijwilliger', english: 'volunteer', article: 'de' },
					{ dutch: 'in de war', english: 'confused' },
					{ dutch: 'uitleggen', english: 'to explain' },
					{ dutch: 'schudden', english: 'to shake' },
					{ dutch: 'verklaring', english: 'explanation', article: 'de' },
					{ dutch: 'verschijnen', english: 'to appear' },
					{ dutch: 'trillen', english: 'to shake' },
					{ dutch: 'waarheid', english: 'truth', article: 'de' },
					{ dutch: 'steun', english: 'support', article: 'de' },
					{ dutch: 'verdwalen', english: 'to get lost' },
					{ dutch: 'geweldig', english: 'amazing' }
				],
				questions: [
					{
						id: 'cq_6_3_11',
						text: 'Wie hoort Laura eerst praten in het park?',
						options: [
							'haar manager en haar echtgenoot',
							'haar manager en Rik',
							'haar echtgenoot en Sophie',
							'Rik en Sophie'
						],
						correctIndex: 3
					},
					{
						id: 'cq_6_3_12',
						text: 'In eerste instantie willen haar vrienden ___.',
						options: [
							'naar huis teruggaan',
							'het vreemde voorwerp weer vinden',
							'de politie bellen',
							'Gerard bellen'
						],
						correctIndex: 1
					},
					{
						id: 'cq_6_3_13',
						text: 'Laura wil ___.',
						options: [
							'de bal weggooien',
							'de bal vinden voordat haar vrienden hem vinden',
							'zich tussen de bomen verstoppen',
							'de politie afluisteren'
						],
						correctIndex: 1
					},
					{
						id: 'cq_6_3_14',
						text: 'Laura raakt het object opnieuw aan en ___.',
						options: [
							'trilt en wordt dan weer zichtbaar',
							'blijft onzichtbaar',
							'wordt bang',
							'er gebeurt niets'
						],
						correctIndex: 0
					},
					{
						id: 'cq_6_3_15',
						text: 'Als ze de groep familie en vrienden toespreekt, besluit Laura om ___.',
						options: [
							'de waarheid te vertellen',
							'de waarheid later te vertellen',
							'de waarheid niet te vertellen',
							'iedereen te negeren'
						],
						correctIndex: 2
					}
				]
			}
		]
	},
	// ---- RANK 7: De capsule ----
	{
		id: 'cs_7',
		rank: 7,
		title: 'De capsule',
		chapters: [
			{
				id: 'cc_7_1',
				chapterNumber: 1,
				title: 'De capsule',
				text: 'Het gebeurde veel eeuwen geleden. Het leefklimaat op de aarde was slecht. De mensen hadden ruimte nodig. Ze wilden vrijheid. Daarom begonnen mensen te verhuizen naar andere planeten. Ze begonnen de ene na de andere kolonie op meerdere werelden op te zetten.\n\nIn het begin was er vrede en succes. De verschillende werelden\n\nwaren niet van elkaar gescheiden. Ze werkten als groep samen. Ze\n\nwaren van elkaar afhankelijk.\n\nToen veranderde er iets. Er was een snelle bevolkingsgroei. De\n\nafzonderlijke planeten hadden meer voedsel nodig. Elke kolonie wilde meer voor zichzelf. Toen begonnen de problemen.\n\nOveral ontstonden oorlogen. Politiekeopvattingenen akkoorden\n\nveranderden. Kolonies vochten om land, macht en wapens.\n\nUiteindelijk bleven twee belangrijke keizerrijken over: de ‘Aardbewoners’ en de ‘Kalkianen’. En beide keizerrijken wilden alles voor zichzelf.\n\nDe basis van de regering van de Aardbewoners was op Aarde.\n\nHun hoofdstad was Parijs, in Frankrijk. Politieke ambtenaren ontmoetten elkaar in het parlementsgebouw. Daar bespraken ze zaken zoals wetgeving, economie, energie en oorlog.\n\nDe keizer van de Aardbewoners was een oude man die Valior\n\nheette. Hij werd vele jaren geleden door middel van stemmen tot\n\ndeze rol gekozen. De verkiezingen verliepen niet eerlijk, maar dat was geen probleem voor Valior. Hij had veel oorlogen gevoerd. Hij had er maar een paar verloren. Hij was een keizer die alles deed om te winnen.\n\nOp een dag sprak Valior in het parlementsgebouw met zijn ministers. ‘We moeten ophouden met vechten,’ riep hij. ‘De economie van ons rijk kan geen oorlogen meer aan. Onze mensen hebben honger. Onze steden hebben wegen nodig. Veel Aardbewoners hebben huizen, licht en voedsel nodig.’\n\nEen man die Aldin heette, sprak. Hij was Valiors meest\n\nbetrouwbare minister. ‘Maar sire,’ zei hij, ‘de Kalkianen blijven ons\n\naanvallen. We kunnen hier niet gewoon maar blijven zitten. Dit land\n\nheeft een sterk leger nodig! We moeten onszelf beschermen.’\n\n‘Ik ga daarmee akkoord, maar er is iets wat we kunnen doen. Ik heb iets gedaan dat …’\n\nPlotseling was er veel lawaai buiten de kamer. De deur ging open. Er kwam een bewaker binnen. Hij hield een vrouw vast. Ze vocht en schreeuwde: ‘Laat me gaan! Ik heb een bericht voor de keizer! Laat me gaan!’\n\nKeizer Valior keek naar de deur. ‘Wat gebeurt hier?’ schreeuwde hij. ‘Ik houd een vergadering!’\n\n‘Het spijt me, meneer,’ zei de bewaker. ‘Deze vrouw wil met u praten. Ze zegt dat het belangrijk is.’\n\n‘Oké. Zeg het maar. Wat is er?’ De vrouw werd opeens erg nerveus. Ze had nog nooit met de keizer gesproken. Ze begon langzaam te praten. ‘Mijn … mijn … mijn hoogste keizer, mijn excuses. Maar ik heb nieuws.’\n\n‘Wat voor nieuws?’ vroeg de keizer. Toen zei hij: ‘En wat snel! Dit is een belangrijke vergadering!’\n\n‘Er is een capsule bij mijn boerderij geland, keizer.’\n\n‘Een wat?’\n\n‘Een ruimtecapsule. Ik geloof dat het een Kalkiaanse ruimtecapsule is, keizer.’\n\n‘Hoe weet u dat het een Kalkiaanse capsule is?’\n\n‘Mijn man. Hij heeft tegen de Kalkianen gevochten. Hij heeft er mij over verteld.’ De ministers en de keizer waren stil. Ten slotte vroeg Aldin: ‘Nog een aanval? Vallen ze de hoofdstad aan?’\n\n‘Nee, nee …’ zei de vrouw. ‘De capsule heeft geen wapens. Maar\n\ner zit iets in.’\n\n‘In de capsule?’ zei de keizer. Hij keek de kamer rond. ‘Wat zou\n\nerin kunnen zitten?’\n\n‘Ik weet het niet,’ antwoordde de vrouw. ‘Ik was te nerveus om te\n\nkijken.’\n\nDe keizer riep zijn bewakers. Hij zei dat ze naar die boerderij\n\nmoesten gaan - en snel! De bewakers en de vrouw stapten in een\n\nvoertuig. Minister Aldin ging met hen mee.\n\nOnderweg sprak Aldin met de vrouw. ‘Hoe heet u?’ vroeg hij.\n\n‘Ik heet Kira.’\n\n‘Kira, dat is een mooie naam. Bent u boerin?’\n\n‘Ja, de boerderij is alles wat ik nog heb.’\n\nWoont u er met uw man?’\n\n‘Mijn man is in de oorlog gestorven.’\n\nAldin voelde zich opeens ongemakkelijk. Hij praatte snel over iets anders. ‘Hoe ziet de capsule eruit?’\n\nKira keek hem goed aan. ‘Ik heb liever dat u hem zelf ziet,’ zei ze.\n\nToen draaide ze zich om.\n\n‘Goed dan,’ zei een verbaasde Aldin. De rest van de reis bleven\n\nze stil. Het voertuig kwam bij de boerderij van Kira aan. Aldin en Kira stapten uit. Ze gingen naar de capsule. De bewakers wachtten in het voertuig. Er waren overal sporen in de grond. De capsule lag op zijn kant. Hij was open.\n\n‘Kira, ik dacht dat je niet in de capsule had gekeken,’ zei Aldin.\n\n‘Het spijt me. Ik heb je niet de waarheid verteld. Ik wilde niets\n\nzeggen. Niet voordat iemand anders het zag.’\n\n‘Wat zag?’\n\n‘Kijk.’\n\nAldin naderde langzaam de capsule. Eerst zag hij niets. Toen zag\n\nhij het. In de capsule lag een klein meisje.\n\n‘Het is een kind! Een kind!’ riep hij. Hij keek verbaasd naar Kira.\n\n‘Ja. Dat is waarom ik het niet heb aangeraakt of iets heb gezegd. Ik wist niet wat ik moest doen. Ik wilde een dokter halen, maar …’\n\nJuist! dacht Aldin. Het meisje is bewusteloos. Ze moet misschien\n\nbehandeld worden. Wij hebben hulp nodig! Aldin rende naar het voertuig. Hij zei tegen de bewakers dat ze een dokter moesten bellen. Toen pakte hij het jonge meisje voorzichtig op. Hij nam haar mee het huis van Kira in. Hij legde haar op een bed.\n\nEen half uur later was het meisje nog steeds bewusteloos. Aldin ging ten slotte de kamer uit. Kira ging met hem mee. ‘Vertel me,’ zei Aldin. ‘Weet jij nog iets over de capsule?’\n\n‘Nee … maar het is wel Kalkiaans, hè?’ zei Kira langzaam.\n\n‘Ja.’\n\n‘En het kind?’ vroeg Kira.\n\n‘Ze ziet er ook Kalkiaans uit.’\n\n‘Maar wat doet ze hier? Waarom hebben ze ons een kind gestuurd?’\n\n‘Ik weet het niet,’ antwoordde Aldin. ‘Als ze kan praten, kan ze het ons misschien vertellen.’\n\n‘Is ze echt door de ruimte gereisd?’\n\n‘Ik denk van wel. Hoogstwaarschijnlijk was er een groter ruimteschip. Ze hebben haar waarschijnlijk in de capsule gezet. Daarna hebben ze haar dichtbij de Aarde achtergelaten. Waarschijnlijk is de capsule uit zichzelf hier geland.’\n\nEindelijk hoorden ze een voertuig aankomen. De dokters kwamen eraan. Ze wilden het meisje meteen zien. Aldin en Kira bleven uit de buurt.\n\nHet was laat. Aldin had waarschijnlijk honger. Kira vroeg of hij met haar iets wilde eten.\n\n‘Heb je kinderen, Kira?’ vroeg Aldin terwijl hij at.\n\n‘Nee. Mijn man en ik wilden kinderen. Maar toen kwam de oorlog en …’\n\n‘Het spijt me.’\n\n‘Het geeft niet,’ zei ze en glimlachte verdrietig.\n\nTerwijl hij at keek Aldin rond. Het huis was mooi. Het was schoon\n\nen eenvoudig. Het was het huis van een alleenstaande vrouw.\n\nAldin zag al snel dat Kira naar hem keek. ‘Wilde je me iets vragen,\n\nKira?’ vroeg hij.\n\n‘Ja.’\n\n‘Zeg het maar.’\n\n‘Wat ga je met het meisje doen?’\n\nAldin stopte. Ten slotte vertelde hij haar de waarheid. ‘Ik weet het\n\nniet. Ik weet niet eens waarom ze hier is.’\n\nPlotseling rende één van de dokters de keuken in. ‘Het kleine\n\nmeisje is wakker! Ze kan praten!’',
				summary:
					'Twee keizerrijken voeren oorlog tegen elkaar: de Aardbewoners en de Kalkianen. De keizer van de Aardbewoners vergadert met zijn ministers. Plotseling komt er een vrouw binnen. Ze vertelt dat er een Kalkiaanse capsule bij haar boerderij is geland. Aldin is de meest betrouwbare minister van de keizer. Hij gaat naar de boerderij. In de capsule ontdekt Aldin een klein meisje. Eerst is het meisje bewusteloos. Dan wordt ze wakker.\n\n***',
				vocabulary: [
					{ dutch: 'vrede', english: 'peace', article: 'de' },
					{ dutch: 'scheiden', english: 'to separate' },
					{ dutch: 'afhankelijk van', english: 'dependent on' },
					{ dutch: 'bevolking', english: 'population', article: 'de' },
					{ dutch: 'oorlog', english: 'war', article: 'de' },
					{ dutch: 'opvatting', english: 'opinion', article: 'de' },
					{ dutch: 'keizerrijk', english: 'empire', article: 'het' },
					{ dutch: 'regering', english: 'government', article: 'de' },
					{ dutch: 'ambtenaar', english: 'official', article: 'de' },
					{ dutch: 'wetgeving', english: 'legislation', article: 'de' },
					{ dutch: 'verkiezing', english: 'election', article: 'de' },
					{ dutch: 'betrouwbaar', english: 'trusted' },
					{ dutch: 'aanvallen', english: 'to attack' },
					{ dutch: 'beschermen', english: 'to protect' },
					{ dutch: 'ruimte', english: 'space', article: 'de' },
					{ dutch: 'voertuig', english: 'vehicle', article: 'het' },
					{ dutch: 'ongemakkelijk', english: 'uncomfortable' },
					{ dutch: 'spoor', english: 'mark, track', article: 'het' },
					{ dutch: 'aanraken', english: 'to touch' },
					{ dutch: 'bewusteloos', english: 'unconscious' },
					{ dutch: 'behandelen', english: 'to treat' },
					{ dutch: 'hoogstwaarschijnlijk', english: 'highly likely, probable' }
				],
				questions: [
					{
						id: 'cq_7_1_1',
						text: 'Er is oorlog tussen ___.',
						options: [
							'Aldin en keizer Valior',
							'de Aardbewoners en Kira’s man',
							'de Aardbewoners en de Kalkianen',
							'Kira en keizer Valior'
						],
						correctIndex: 2
					},
					{
						id: 'cq_7_1_2',
						text: 'De keizer vergadert met ___.',
						options: [
							'Aldin en de Kalkianen',
							'zijn ministers',
							'Kira en haar man',
							'het kleine meisje en Aldin'
						],
						correctIndex: 1
					},
					{
						id: 'cq_7_1_3',
						text: 'De vrouw, Kira, vertelt de keizer dat ___.',
						options: [
							'er een klein meisje in haar huis is',
							'er een capsule bij haar boerderij staat',
							'haar man in de oorlog is gestorven',
							'Aldin naar haar huis moet komen'
						],
						correctIndex: 1
					},
					{
						id: 'cq_7_1_4',
						text: 'Het kleine meisje ___.',
						options: [
							'vertelt Aldin eerst over haar wereld',
							'wil eerst niet praten omdat ze verlegen is',
							'huilt eerst veel',
							'kan eerst niet spreken omdat ze bewusteloos is'
						],
						correctIndex: 3
					},
					{
						id: 'cq_7_1_5',
						text: 'Kira biedt Aldin ___ aan.',
						options: ['een koele drank', 'koffie', 'een slaapplaats', 'iets te eten'],
						correctIndex: 3
					}
				]
			},
			{
				id: 'cc_7_2',
				chapterNumber: 2,
				title: 'Het meisje',
				text: 'Het meisje uit de Kalkiaanse capsule was wakker! Iemand moest met haar praten. Aldin was een minister van de keizer. Hij was de beste persoon om het te doen. Hij liep naar de slaapkamer. Kira ging met hem mee. Ze gingen zitten.\n\nHet meisje zag er slaperig uit. Ten slotte vroeg ze langzaam: ‘Waar ben ik?’ Kira en Aldin keken elkaar verbaasd aan. Ze sprak Nederlands!\n\nHet meisje keek om zich heen. Ze zag de bewakers. Plotseling werd ze erg bang. De dokter gaf haar een medicijn om haar te kalmeren. Ze viel snel weer in slaap.\n\nEen uur later gingen de ogen van het meisje open. Ten slotte vroeg ze langzaam: ‘Waar ben ik?’ Toen keek ze naar Aldin. ‘Wie bent u?’ vroeg ze. Haar Nederlands was erg goed.\n\n‘Hallo,’ zei Aldin. ‘Mijn naam is Aldin. Dit is Kira. Wij zijn Aardbewoners. Probeer rustig te blijven. Hij stopte. ‘Hoe voel je je?’\n\n‘Oké,’ antwoordde ze voorzichtig. Ze vertrouwde ze niet.\n\n‘We willen je geen pijn doen,’ zei Aldin.\n\nHet meisje bleef toch bang. Ze gaf geen antwoord.\n\nKira probeerde contact te maken. ‘Hoi,’ zei ze zachtjes. ‘Kun je me vertellen hoe je heet?’\n\n‘Ik heet Maha,’ antwoordde het meisje.\n\n‘Alles komt goed, Maha. Ik heet Kira. En dit is Aldin. Je bent bij mij\n\nthuis. Je bent gewond geraakt. We zorgen voor je.’\n\n‘Ben ik in jullie hoofdstad?’ vroeg het meisje. Ze keek uit het raam. Het was laat. Ze kon niet veel door het glas zien. Ze kon maar een paar bomen en velden zien. ‘Het lijkt niet op een stad,’ zei ze verbaasd.\n\n‘Je bent vlakbij de hoofdstad. Maar niet in de hoofdstad,’\n\nantwoordde Aldin. ‘De keizer is nog ver hier vandaan.’\n\nToen het meisje het woord ‘keizer’ hoorde, werd ze opnieuw bang.\n\n‘Ik wil niet naar huis! Ik ben nu 13. Ik kan mijn eigen beslissingen nemen!’ riep ze.\n\nAldin was verbaasd. Waarom wilde het kind niet naar huis?\n\nWaarom zei ze dat? Er was iets vreemds aan de hand.\n\n‘Waarom wil je niet naar huis?’ vroeg hij.\n\n‘Ik houd niet van Kalkia.’\n\n‘Je houdt niet van Kalkia?’ vroeg Aldin verbaasd. ‘Wat bedoel je?’\n\n‘Ik wil daar niet meer wonen.’\n\n‘Waarom zeg je dat?’\n\n‘Nou, ten eerste is mijn familie nooit thuis.’\n\n‘Ja? En?’\n\n‘Ze negeren me. Ze brengen geen tijd met me door. Ze geven niet\n\nom me.’\n\n‘Dus je familie negeert jou?’ zei Aldin.\n\n‘Ja … al heel lang.’\n\n‘En omdat je eenzaam was, ben je hierheen gekomen?’ vroeg\n\nKira.\n\n‘Ja. Mijn vader werkt altijd. Mijn moeder reist altijd. Ik blijf thuis met\n\nde verzorgers.Mijn vader betaalt ze om voor me te zorgen. Ik houd er niet van om bij ze te zijn.’\n\nAldin begon het te begrijpen. Het meisje was van huis\n\nweggelopen!\n\n‘Een ogenblikje, Maha. Vertel je me dat je je huis hebt verlaten?\n\nDat je bent weggelopen?’\n\nHet meisje sloeg haar ogen neer. ‘Ja,’ antwoordde ze.\n\nAldin stond op. Hij keek neer op het meisje. ‘Neem me niet\n\nkwalijk. Ik moet naar buiten.’\n\nAldin verliet het huis. Kira volgde hem. Hij stond naar de mooie\n\nboerderij van Kira te kijken. Hij dacht na. Hij voelde zich duidelijk een beetje ongemakkelijk.\n\n‘Wat vind jij ervan, Aldin?’ vroeg Kira.\n\n‘Hier klopt iets niet.’\n\n‘Wat bedoel je?’\n\nHet meisje is van huis weggelopen. Maar ze kan geen ruimteschip besturen. Ze is 13.’\n\n‘Ik begrijp het. Iemand heeft haar geholpen.’\n\n‘Ja. Maar wie?’\n\n‘Laten we dat eens gaan uitzoeken.’\n\nAldin en Kira gingen weer naar binnen. Ze liepen de slaapkamer in.\n\n‘Hallo,’ zei Aldin.\n\n‘Hier zijn we weer,’ zei Aldin en glimlachte naar haar.\n\nMaha keek Aldin recht in de ogen aan. ‘Ik ga niet naar huis. Ik wil hier blijven,’ zei ze luid.\n\n‘En waarom wil je hier blijven?’\n\n‘Zoals ik al zei, ik houd niet van mijn verzorgers.’\n\n‘Ik geloof je niet, zei Aldin rustig.\n\n‘Het is de waarheid.’\n\n‘Ja. Maar dat is niet alles, hè?’\n\nZe zuchtte. ‘Ja, er is meer.’\n\n‘Ik dacht het al. Vertel het me.’\n\n‘We verliezen de oorlog. De mensen hebben geen eten. Velen kunnen nergens wonen. Dit kan zo niet langer. Ik ben bang.’\n\nAldin ging naast Maha zitten. Hij keek haar goed aan. ‘Je kunt hier voorlopig blijven,’ legde hij uit. ‘Maar je moet wel begrijpen dat onze twee werelden met elkaar in oorlog zijn.’\n\n‘Dat weet ik,’ zei ze snel. ‘Ik ben 13, geen 6!’\n\nAldin lachte. ‘Dan begrijp je het. Er spelen hier grote factoren\n\nmee,’ zei hij. ‘Dit zou allemaal enorme gevolgen kunnen hebben. Zowel op nationaal als internationaal niveau.’\n\n‘Ja,’ zei Maha terwijl ze naar beneden keek. ‘Maar ze weten nog\n\nsteeds niet waar ik ben!’ voegde ze er snel aan toe. ‘Ik kan gewoon een paar dagen wachten. Daarna kan ik ergens anders naartoe.’\n\nAldin keek haar aan. Het was tijd om erachter te komen hoe het\n\nkind hier naartoe was gekomen. ‘Maha, een capsule gebruiken is geen makkelijke manier van reizen. Je bent hier niet alleen gekomen. Je bent te jong om zonder hulp door de ruimte te reizen.’\n\nMaha keek hem aan. ‘Je hebt gelijk,’ zei ze zachtjes. ‘Ik kan geen\n\nruimteschip besturen.’\n\n‘Wie dan wel?’\n\n‘Dat kan ik je niet zeggen.’\n\nAldin kon erg goed wachten. Als minister was hij gewend om met\n\nmensen te onderhandelen. ‘Maha, we moeten weten wie je heeft geholpen. Als we dat niet weten, kunnen we je niet helpen.’\n\nMaha was stil. Toen sprak ze. ‘Het is … het is …’\n\n‘Maak je geen zorgen. Je bent hier veilig,’ zei Kira zachtjes.\n\nMaha keek hen aan. En toen zei ze het. ‘Het is Valior, jullie keizer.\n\nHij heeft me geholpen.’\n\nAldin stond snel op. Hij keek Maha aan. Toen keek hij naar Kira.\n\nDe bewakers keken hen allemaal aan.\n\n‘Valior?’ zei Aldin. ‘Dat kan niet waar zijn!’\n\nMaha sloeg haar ogen weer neer. ‘Ja dat kan wel. Ik ontving\n\nweken geleden een bericht van hem. Hij zei dat hij wist dat ik weg\n\nwilde. Hij wilde me helpen. Dus liet hij zijn spionnen naar mij zoeken.’\n\n‘Spionnen?’\n\n‘Ja, er zijn veel spionnen van de Aardbewoners op Kalkia.’\n\nAldin legde zijn hand op zijn hoofd. Hij liep de kamer rond. Dus de\n\nkeizer heeft een Kalkiaans kind geholpen om te ontsnappen. Hij kon gewoon niet begrijpen waarom. ‘Dit is ongelooflijk,’ zuchtte hij ten slotte.\n\nEven later sprak Maha opnieuw. ‘Nou, eigenlijk is er nog iets,’ zei\n\nze zachtjes.\n\nAldin draaide zich om en keek naar Maha. Wat zou er nog meer kunnen zijn? dacht hij. Ten slotte vroeg hij: ‘En wat is dat?’\n\nMaha keek hem recht aan. ‘Mijn vader?’\n\n‘Wat is er met je vader?’ vroeg Aldin zachtjes.\n\n‘Mijn vader is de keizer van de Kalkianen.’',
				summary:
					'Het meisje uit de Kalkiaanse capsule wordt wakker. De dokter behandelt het meisje. Het meisje begint te praten. Ze heet Maha. Ze is Kalkiaans. Ze is 13 jaar oud. Eerst zegt Maha dat ze is vertrokken vanwege haar ouders. Later zegt ze iets anders. Ze is bang dat de Kalkianen de oorlog misschien niet zullen overleven. Aldin vraagt hoe Maha naar de aarde kwam. Uiteindelijk vertelt ze hem dat keizer Valior haar heeft geholpen. Dan voegt ze eraan toe dat haar vader de Kalkiaanse keizer is.\n\n***',
				vocabulary: [
					{ dutch: 'kalmeren', english: 'to calm' },
					{ dutch: 'gewond raken', english: 'to be hurt' },
					{ dutch: 'eenzaam', english: 'lonely' },
					{ dutch: 'verzorger', english: 'carer', article: 'de' },
					{ dutch: 'weglopen', english: 'to run away' },
					{ dutch: 'neem me niet kwalijk', english: 'excuse me' },
					{ dutch: 'zuchten', english: 'to sigh' },
					{ dutch: 'gevolg', english: 'consequence', article: 'het' },
					{ dutch: 'gelijk hebben', english: 'to be right' },
					{ dutch: 'onderhandelen', english: 'to negotiate' },
					{ dutch: '(zich) zorgen maken', english: 'to worry' },
					{ dutch: 'ontvangen', english: 'to receive' },
					{ dutch: 'spion', english: 'spy', article: 'de' },
					{ dutch: 'ontsnappen', english: 'to escape' }
				],
				questions: [
					{
						id: 'cq_7_2_6',
						text: 'Maha ___.',
						options: [
							'wil eerst iets eten',
							'is erg nerveus',
							'praat veel',
							'wil met haar vader praten'
						],
						correctIndex: 1
					},
					{
						id: 'cq_7_2_7',
						text: 'Maha legt uit dat zij ___.',
						options: [
							'van huis is weggelopen',
							'gevraagd werd om haar huis te verlaten',
							'terug naar huis wil',
							'niet weet waar haar huis is'
						],
						correctIndex: 0
					},
					{
						id: 'cq_7_2_8',
						text: 'Maha zegt ook dat ___.',
						options: [
							'haar familie heel veel van haar houdt',
							'ze haar ouders niet kent',
							'ze heel veel van haar verzorgers houdt',
							'ze niet gelukkig is bij haar ouders'
						],
						correctIndex: 3
					},
					{
						id: 'cq_7_2_9',
						text: 'Als Aldin vraagt wie haar heeft geholpen, antwoordt Maha dat ___.',
						options: [
							'de Kalkiaanse keizer haar heeft geholpen',
							'Valior persoonlijk naar haar toe is gekomen',
							'er spionnen van de Aardbewoners door Valior zijn gestuurd',
							'Kalkiaanse spionnen haar hebben geholpen'
						],
						correctIndex: 2
					},
					{
						id: 'cq_7_2_10',
						text: 'Waarom zou het problemen geven als het meisje op aarde bleef?',
						options: [
							'Ze is bang.',
							'Ze is de dochter van de Kalkiaanse keizer.',
							'Ze is een Kalkiaanse spion.',
							'Aldin wil niet dat ze naar huis gaat.'
						],
						correctIndex: 1
					}
				]
			},
			{
				id: 'cc_7_3',
				chapterNumber: 3,
				title: 'De waarheid',
				text: 'Aldin kon het niet geloven. Maha was de dochter van de Kalkiaanse\n\nkeizer! Het meisje zou chaos in de wereld kunnen veroorzaken! En alleen maar omdat ze eenzaam was? Omdat ze dacht dat keizer Valior haar problemen begreep? Wat had ze gedaan?!\n\nToen besefte Aldin iets. Het was niet de verantwoordelijkheid\n\nvan het meisje. Ze begreep niet precies wat ze had gedaan. Ze was gewoon verdrietig. En een man die Valior heet, had haar geholpen. Hij was het probleem: de keizer! Hij was verantwoordelijk. Wat was zijn plan? Aldin moest het weten.\n\nAldin verliet Kira’s huis. Hij stapte in een voertuig en reed naar de\n\nhoofdstad. Toen hij daar eenmaal was, ging hij direct naar het kantoor van de keizer. Plotseling hield een bewaker hem tegen. ‘Het is je verboden om naar binnen gaan,’ zei de bewaker.\n\nAldin was verbaasd. ‘Verboden? Ik moet met Valior praten. ‘Weet\n\nje wie ik ben? Ik ben een minister!’\n\n‘Dat zijn de bevelen van de keizer. Geen toegang voor jou, Aldin.’ Aldin vroeg zich af wat hij nu moest doen. Hij moest met keizer Valior praten. Zonder na te denken sloeg Aldin de bewaker op zijn hoofd. De bewaker viel op de grond. Aldin nam het wapen van de bewaker en ging het kantoor van Valior binnen.\n\nDe keizer zat in zijn stoel. Hij zag er moe uit. ‘Aldin, wat wil je?’\n\nzuchtte hij.\n\n‘Waarom wist ik niet van het kind?’\n\n‘Welk kind?’\n\n‘Keizer, ik ben niet dom.’\n\nValior dacht even na. ‘Oké. We doen niet meer alsof. Wat wil je\n\nweten?’\n\n‘Waarom is de dochter van de Kalkiaanse keizer hier? Waarom\n\ndeed je dat?’ Zijn stem werd luider. ‘Het is niet ons beleid om kinderen te gebruiken!’\n\nValior ging staan. Toen schreeuwde hij: ‘Het is niet ons beleid om oorlogen te verliezen!’\n\nAldin keek Valior aan. Toen vroeg hij, ‘Waarom heb je het mij niet verteld?’\n\n‘Er is maar één reden waarom ik je het niet heb verteld.’\n\n‘En wat is die reden?’\n\nDe keizer sloeg de ogen neer. ‘Ik wist dat je het niet zou\n\ngoedkeuren,’ antwoordde hij. ‘Ik wilde niet dat je mijn beslissing zou beïnvloeden.’ Valior had gelijk. Natuurlijk zou Aldin niet willen dat een kind bij een oorlog werd betrokken. Dat kon gewoon niet.\n\n‘Wat ga je met haar doen?’ vroeg Aldin daarna.\n\n‘Met Maha? We gaan voor haar zorgen! Ze is maar een kind,’ zei de keizer.\n\nAldin vertrouwde hem niet. ‘Dat bedoelde ik niet,’ zei hij. ‘Ik bedoelde wat gaat er gebeuren? Wat gaat er gebeuren als de Kalkianen erachter komen? Zullen ze haar kwaad doen?’\n\n‘Dat zijn allemaal goede vragen. Allemaal, stuk voor stuk,’ zei de keizer rustig.\n\nAldin keek de keizer aan. Hij accepteerde geen gemakkelijke antwoorden.\n\nDe keizer begon weer te praten. ‘De Kalkianen weten dat Maha is weggelopen.’ Toen stopte hij. ‘Maar ze weten niet op welke planeet ze zit. Ook weten ze niet dat de spionnen van de Aardbewoners haar hebben geholpen. Dus eigenlijk weten ze niets, begrijp je.’ Hij keek Aldin goed aan. De keizer wilde te weten komen wat Aldin ervan vond.\n\n‘En als ze erachter komen dat je haar hebt geholpen?’\n\n‘Ze kunnen er onmogelijk achter komen. De spionnen zeggen niets. Niemand weet het hier … behalve jij.’\n\nAldin moest even nadenken. ‘Maar waarom?’ vroeg hij. Hij kon de\n\nlogica van de keizer gewoon niet begrijpen. ‘Waarom betrek je er een klein kind bij? Waarom moet je haar bij haar ouders weghalen?’\n\n‘Om wie haar ouders zijn,’ antwoordde Valior. De keizer keek Aldin\n\naan alsof hij dom was. ‘Zie je de voordelen niet? We hebben nu de dochter van de keizer. We kunnen haar gebruiken. Om de Kalkiaanse keizer onder controle te houden. Om de macht. Om alles eigenlijk.’\n\nValior keek Aldin weer voorzichtig aan. Hadden zijn woorden enige\n\ninvloed op wat Aldin dacht? Aldins gezicht liet niets zien.\n\n‘Begrijp je het nu?’ ging hij door. ‘We kunnen Maha gebruiken om\n\nte krijgen wat we willen. Het lot van de Kalkiaanse keizer ligt in onze handen. En dat allemaal omdat zijn domme kleine meisje zich genegeerd voelde!’ Uit Valior kwam een diepe lach. Het was een lach waar Aldin koud van werd.\n\nAldin keek de keizer aan. Hier was de man die Aldin altijd had\n\nvertrouwd. De man die zo belangrijk was voor Aldin. Maar nu voelde\n\nAldin alleen maar afschuw. Valior gebruikte een kind om te krijgen wat hij wilde.\n\nAldin glimlachte en zei: ‘Ik begrijp het nu volkomen, keizer. Zoals u\n\nwilt.’\n\nAldin draaide zich om en verliet het kantoor van de keizer. Hij liep\n\nsnel door de straten van de hoofdstad. Aldin vond het afschuwelijk wat er nu gebeurde. Maar hij kon het niet laten zien. Als de keizer hoorde dat hij tegen hem was, zou Aldin worden gedood. Er was maar één persoon die volgens Aldin hem kon helpen. Eén persoon die de keizer niet kon beïnvloeden. Hij moest met haar praten.\n\nAldin nam een voertuig van de regering. Hij reed snel naar de\n\nboerderij van Kira. Hij klopte op de deur. ‘Kira! Ben je thuis?’\n\nKira deed de deur open. ‘Ja,’ antwoordde ze. ‘Wat is er?’\n\n‘Is het meisje nog hier?’ vroeg Aldin.\n\n‘Ja, waarom? Ze hebben haar nog niet naar de hoofdstad\n\ngebracht.’\n\n‘Prima,’ antwoordde Aldin.\n\n‘Maar er komt nu een voertuig aan’, voegde ze eraan toe.\n\n‘Oh. Nou, we hebben minder tijd dan ik dacht. We moeten opschieten,’ zei hij nerveus. ‘Breng me naar haar toe.’\n\nZe liepen de slaapkamer in. Het meisje sliep rustig. ‘We moeten gaan,’ zei hij.\n\n‘Gaan? Waar naartoe?’ vroeg Kira.\n\nAldin keek om zich heen. Hij kon niemand zien. ‘Waar zijn de bewakers?’\n\n‘Ze zijn bij de capsule.’\n\n‘Prima,’ antwoordde Aldin. ‘Dit is onze kans.’\n\n‘Onze kans?’ vroeg Kira. Ze keek verward.\n\n‘Om Maha weg te halen,’ antwoordde Aldin.\n\nKira ging zitten. Ze keek naar Maha. Het meisje zag er voor het eerst kalmer uit. ‘Wil je Maha weghalen uit de hoofdstad?’\n\n‘Nee, ik wil haar weghalen van deze planeet.’\n\n‘Wat?’ zei Kira. ‘Waarom?’\n\n‘Maha is een verward en eenzaam meisje. Keizer Valior wil Maha alleen gebruiken om de Kalkiaanse keizer te beïnvloeden.’\n\nAldin legde de plannen van Keizer Valior uit. Kira kon het gewoon niet geloven. ‘Begrijp je me nu?’ vroeg Aldin. ‘Ik wil niet dat ze Maha pijn doen. Als wij haar niet thuis brengen maakt ze geen enkele kans.’\n\n‘Wij?’\n\n‘Wij. We moeten haar naar Kalkia brengen. Ik kan het niet alleen, Kira. Ik heb je hulp nodig.’\n\nKira dacht even na. Ze keek naar het kleine meisje. Ze keek daarna uit het raam naar haar boerderij. Ten slotte keek ze Aldin aan en zei: ‘Wat heb ik te verliezen?’\n\nKira vertelde Maha dat ze naar de hoofdstad gingen. Ze stapten allemaal in het voertuig van Aldin. Aldin reed urenlang. Het dichtstbijzijnde ruimtestation was ver weg. Onderweg sliep Maha.\n\nToen ze aankwamen vertelde Aldin de beveiligingsagenten dat ze op een geheime regeringsmissie waren. De bewakers zeiden dat ze het aan niemand zouden vertellen.\n\nKira en Aldin droegen Maha naar het dichtsbijzijnde ruimteschip.\n\nZe verlieten zonder moeite het station. Maha werd wakker toen het ruimteschip opsteeg. Ze was niet gelukkig. Aldin vond het jammer voor haar. Maar hij wist dat ze de juiste beslissing hadden genomen.\n\nDe reis door de ruimte duurde enkele weken. Het ruimteschip\n\nnaderde Kalkia. Aldin zei door de radio: ‘Dit is Aardebewonersschip 12913. Ik moet de Kalkiaanse keizer spreken. Ik ben Minister Aldin van de Aardbewoners.’\n\nDe radio ging aan. ‘Waarom wilt u met onze keizer praten?’ vroeg\n\neen bewaker.\n\n‘We hebben zijn dochter.’\n\nHet werd stil op de radio.\n\nAl gauw zag Aldin een waarschuwing op zijn computerscherm. Er\n\nkwamen Kalkiaanse militaire eenheden aan. Ze bleven in de buurt van het ruimteschip wachten. Plotseling schoot de radio weer aan. ‘Geef ons Maha of je sterft,’ zei een stem.\n\n‘Je gaat ons niet vermoorden,’ zei Aldin met overtuiging. ‘Ik wil met jullie keizer praten.’ Toen voegde hij eraan toe: ‘Nu.’\n\nHet werd weer stil op de radio.\n\nNa enkele minuten klonk er een krachtige stem op de radio: ‘Dit is\n\nde Kalkiaanse keizer.’ Geef me mijn dochter! En toen was hij een paar seconden stil. ‘En dan ik laat jullie leven.’\n\n‘Wij geven jullie Maha onder één voorwaarde, antwoordde Aldin.\n\nZe wachtten.\n\n‘En wat is die?’ zei de stem.\n\n‘Er moet vrede komen tussen de Aarde en Kalkia.’ De keizer was weer een paar seconden stil. ‘Waarom zou ik jullie geloven?’\n\n‘Omdat we je dochter hebben teruggebracht,’ antwoordde Aldin.\n\n‘Omdat ik weet dat de oorlog voor iedereen moeilijk is. Denk aan de economische problemen. Denk aan de honger en pijn. Onze werelden zijn allebei uitgeput. Hier moet een einde aan komen.’\n\nOp de radio werd het weer stil. Eindelijk keerde de stem terug. Hij klonk deze keer zachter. ‘Ik ga akkoord,’ zuchtte de keizer. ‘En ik accepteer jullie voorwaarde. Geef me mijn dochter terug en we zullen voor vrede zorgen.’',
				summary:
					'Aldin spreekt Keizer Valior. Valior wil Maha gebruiken om tegen de Kalkianen te vechten. Aldin is het niet eens met zijn plan. Hij houdt zijn gedachten geheim. Hij keert terug naar de boerderij van Kira. Hij en Kira nemen Maha mee naar een ruimteschip. Ze reizen naar Kalkia. Ze spreken met de Kalkiaanse keizer. Ze willen Maha teruggeven, maar de Kalkiaanse keizer moet eerst akkoord gaan met vrede. De keizer gaat akkoord. Eindelijk eindigt de oorlog.\n\n***',
				vocabulary: [
					{ dutch: 'veroorzaken', english: 'to cause' },
					{ dutch: 'verantwoordelijkheid', english: 'responsibility', article: 'de' },
					{ dutch: 'verboden', english: 'barred, forbidden' },
					{ dutch: 'bevel', english: 'orders', article: 'het' },
					{ dutch: 'beleid', english: 'policy', article: 'het' },
					{ dutch: 'goedkeuren', english: 'to approve' },
					{ dutch: 'betrekken bij', english: 'to involve' },
					{ dutch: 'zorgen (voor)', english: 'to take care (of)' },
					{ dutch: 'afschuw', english: 'disgust', article: 'de' },
					{ dutch: 'waarschuwing', english: 'warning', article: 'de' },
					{ dutch: 'eenheid', english: 'unit', article: 'de' },
					{ dutch: 'overtuiging', english: 'conviction', article: 'de' },
					{ dutch: 'voorwaarde', english: 'condition', article: 'de' },
					{ dutch: 'uitputten', english: 'to exhaust' }
				],
				questions: [
					{
						id: 'cq_7_3_11',
						text: 'Na het verlaten van de boerderij, gaat Aldin naar ___.',
						options: ['een restaurant', 'de capsule', 'de hoofdstad', 'zijn huis'],
						correctIndex: 2
					},
					{
						id: 'cq_7_3_12',
						text: 'Aldin realiseert zich dat Valior, de keizer ___.',
						options: [
							'niet te vertrouwen is',
							'vrede wil',
							'altijd de waarheid spreekt',
							'bevriend is met de Kalkiaanse keizer'
						],
						correctIndex: 0
					},
					{
						id: 'cq_7_3_13',
						text: 'Aldin is van plan om ___.',
						options: [
							'het kind terug te brengen',
							'bij het kind te blijven',
							'het kind te doden',
							'niets te doen'
						],
						correctIndex: 0
					},
					{
						id: 'cq_7_3_14',
						text: 'Maha ___.',
						options: [
							'is blij dat zij naar huis gaat',
							'wil niet op de aarde blijven',
							'wil haar ouders bellen',
							'is niet blij dat zij naar huis gaat'
						],
						correctIndex: 3
					},
					{
						id: 'cq_7_3_15',
						text: 'Als Aldin de Kalkiaanse keizer spreekt, vraagt hij om ___.',
						options: ['geld', 'vrede', 'een baan', 'een kans om op Kalkia te blijven'],
						correctIndex: 1
					}
				]
			}
		]
	}
];

/** Quick lookup for stories by ID */
export const STORY_MAP: Record<string, ConversationStory> = Object.fromEntries(
	STORIES.map((s) => [s.id, s])
);

/** Get the story for a given rank (one story per rank) */
export function getStoryForRank(rank: number): ConversationStory | null {
	return STORIES.find((s) => s.rank === rank) ?? null;
}

/** Get all stories up to and including a given rank */
export function getStoriesUpToRank(rank: number): ConversationStory[] {
	return STORIES.filter((s) => s.rank <= rank);
}
