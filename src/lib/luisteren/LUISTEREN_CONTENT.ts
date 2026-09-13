// ============================================================
// LUISTEREN CONTENT
// All NT2 Programma I Luisteren exam content (2023-2025).
// Sourced from official CvTE openbaar examen PDFs.
// Questions with image-only options are excluded (4 total).
// 111 usable questions across 3 exam years.
// ============================================================

import type { LuisterenExam, LuisterenQuestion, Answer } from './types';

// Helper to build a question object concisely
function q(
	year: number,
	opgave: number,
	question: string,
	A: string,
	B: string,
	C: string,
	answer: Answer,
	filename: string
): LuisterenQuestion {
	const ext = filename.split('.').pop() ?? '';
	return {
		id: `${year}-${opgave}`,
		opgave,
		question,
		options: { A, B, C },
		answer,
		filename,
		mediaType: ext === 'webm' ? 'video' : 'audio'
	};
}

// ============================================================
// 2023 EXAM
// 38 questions total, 2 skipped (image-only: opgave 17, 19)
// 36 usable questions
// ============================================================

export const EXAM_2023: LuisterenExam = {
	year: 2023,
	totalQuestions: 38,
	passingScore: 24,
	passages: [
		{
			name: 'Autoverkoper',
			intro: 'Een gesprek met Mark Puijpe, autoverkoper. Linda wil graag een nieuwe auto kopen.',
			mediaType: 'audio',
			introFiles: ['track-2_intro.opus'],
			questions: [
				q(
					2023,
					1,
					'Linda wil graag een nieuwe auto kopen en geen gebruikte auto. Wat zegt Mark hierover?',
					'Een nieuwe auto is betrouwbaarder dan een gebruikte auto.',
					'Een nieuwe, ruime auto is te duur voor Linda.',
					"Hij verkoopt alleen gebruikte auto's, geen nieuwe.",
					'B',
					'track-3.opus'
				),
				q(
					2023,
					2,
					'Mark laat Linda de Volkswagen Golf zien. Welk advies geeft Mark bij het kopen van een auto die veel kilometers heeft gereden?',
					'Denk aan het regelmatig vervangen van onderdelen.',
					'Koop gerust een auto die veel kilometers heeft gereden.',
					'Verzeker je auto extra.',
					'B',
					'track-4.opus'
				),
				q(
					2023,
					3,
					'Bij Volkswagen word je automatisch lid van de ANWB. Aan welke voorwaarde moet je volgens Mark voldoen als je gratis lid wilt blijven van de ANWB?',
					'De auto mag niet ouder dan zes jaar zijn.',
					'De auto mag niet te veel kilometers rijden.',
					'De auto moet bij de garage in onderhoud blijven.',
					'C',
					'track-5.opus'
				),
				q(
					2023,
					4,
					'Welke auto adviseert Mark?',
					'Koop de Golf, want die heeft een betere motor dan de Polo.',
					'Koop de Golf, want die is sneller dan de Polo.',
					'Koop de Polo, want die is veiliger dan de Golf.',
					'A',
					'track-6.opus'
				),
				q(
					2023,
					5,
					'Welke afspraak maken Linda en Mark over het inruilen van haar oude auto?',
					'Als Linda de auto niet kan verkopen, ruilt ze hem in bij de garage.',
					'Linda ruilt de auto in bij de garage, dus ze kan de auto niet zelf verkopen.',
					'Linda verkoopt de auto zelf, dus ze kan de auto niet inruilen bij de garage.',
					'A',
					'track-7.opus'
				)
			]
		},
		{
			name: 'Reisbegeleider',
			intro: 'Een gesprek met Els, reisbegeleider. Zij begeleidt mensen die een groepsreis doen.',
			mediaType: 'audio',
			introFiles: ['track-8_intro.opus'],
			questions: [
				q(
					2023,
					6,
					"'Het zat er al jong in', zegt Els. Wat bedoelt ze daarmee?",
					'Als kind wilde Els al de vakantie regelen.',
					'Als kind wilde Els al graag op reis.',
					'Als kind wilde Els al reisbegeleider worden.',
					'A',
					'track-9.opus'
				),
				q(
					2023,
					7,
					'Wat vertelt Els over de bestemming van haar reizen?',
					'Ze bepaalt zelf naar welke gebieden ze reist met de groep.',
					'Ze krijgt van de organisatie te horen naar welk land ze reist.',
					'Ze overlegt samen met de organisatie waar ze naartoe gaat.',
					'B',
					'track-10.opus'
				),
				q(
					2023,
					8,
					'Wat verwachten de reizigers van een reisbegeleider, volgens Els?',
					'dat die de taal van het land spreekt',
					'dat die iets kan vertellen over het land',
					'dat die rondleidingen geeft',
					'B',
					'track-11.opus'
				),
				q(
					2023,
					9,
					'Wat vond Els het leukste aan haar laatste reis?',
					'Er waren helemaal geen problemen.',
					'Het was een fijne en gezellige groep.',
					'Ze heeft veel ervaring op kunnen doen.',
					'B',
					'track-12.opus'
				)
			]
		},
		{
			name: 'Drogisterij',
			intro:
				'Een les van Mary Radstake, docent aan de drogisterijopleiding. Ze vertelt over het werken in een drogisterij.',
			mediaType: 'audio',
			introFiles: ['track-13_intro.opus'],
			questions: [
				q(
					2023,
					10,
					'Mary Radstake vertelt over de verschillende functies in een drogisterij. Op welke vraag mag een verkoper in de drogisterij antwoord geven?',
					"'Wat kan ik het beste doen om te zorgen dat ik geen maagpijn krijg?'",
					"'Wat kunt u mij vertellen over dit medicijn tegen hoofdpijn?'",
					"'Welk medicijn kan ik het beste nemen tegen pijn in mijn rug?'",
					'B',
					'track-14.opus'
				),
				q(
					2023,
					11,
					'Wat zegt Mary Radstake over het doorsturen van een klant naar een arts?',
					'Alleen de drogist mag een klant naar een arts doorsturen.',
					'De assistent-drogist en de drogist mogen een klant niet naar een arts doorsturen.',
					'De assistent-drogist mag een klant naar een arts doorsturen.',
					'A',
					'track-15.opus'
				),
				q(
					2023,
					12,
					'Welk verschil noemt Mary Radstake tussen Nederlandse en buitenlandse drogisten?',
					'Alleen in Nederland kun je sommige medicijnen ook bij een drogist kopen.',
					'In het buitenland mogen drogisten alle soorten medicijnen verkopen.',
					'Nederlandse drogisten mogen alle soorten medicijnen verkopen.',
					'A',
					'track-16.opus'
				),
				q(
					2023,
					13,
					'Mary Radstake vertelt dat je soms ook op andere plekken dan bij een apotheek of drogist medicijnen kunt kopen. Wat zegt Mary over de verkopers op die plekken?',
					'Ze kunnen verkeerde informatie over de medicijnen geven.',
					'Ze mogen dezelfde medicijnen verkopen als de drogist.',
					'Ze verkopen soms niet goedgekeurde medicijnen.',
					'A',
					'track-17.opus'
				),
				q(
					2023,
					14,
					'Wat vertelt Mary Radstake over het contact met klanten? Het is heel belangrijk dat je ...',
					'de gezondheidsproblemen van de klant altijd serieus neemt',
					'niet met anderen praat over de gezondheidsproblemen van de klant',
					'veel te weten komt over de gezondheidsproblemen die de klant heeft',
					'B',
					'track-18.opus'
				),
				q(
					2023,
					15,
					'Je wilt weten hoe je klanten kunt adviseren bij het kiezen van een cr\u00e8me. Mary Radstake vertelt hoe je dat kunt aanpakken. Welke raad geeft ze?',
					'Luister goed naar wat de klant vertelt over haar wensen.',
					'Volg cursussen over verschillende huidproblemen.',
					'Zorg dat je veel weet over de verschillende cr\u00e8mes.',
					'C',
					'track-19.opus'
				),
				q(
					2023,
					16,
					'Mary Radstake vertelt dat de meeste studenten geen stage lopen bij de opleiding. Waarom lopen de meeste studenten geen stage?',
					'omdat het niet in het studietraject past',
					'omdat hun werkgever dat niet wil',
					'omdat ze al werken bij een drogist',
					'C',
					'track-20.opus'
				)
			]
		},
		{
			name: 'Kringloopwinkel',
			intro:
				'Een gesprek tussen Harma Oenema en Cindy Hopmans. Harma werkt in een kringloopwinkel. Cindy gaat er vrijwilligerswerk doen.',
			mediaType: 'audio',
			introFiles: ['track-21_intro.opus'],
			questions: [
				// opgave 17 SKIPPED (image-only options)
				q(
					2023,
					18,
					'De kleding komt uit een centrale in Arnhem. Wat moeten ze daarna nog in de winkel doen?',
					'Ze moeten de kleding sorteren op prijs.',
					'Ze moeten het prijskaartje aan de kleding hangen.',
					'Ze moeten het weeknummer op het prijskaartje zetten.',
					'C',
					'track-23.opus'
				),
				// opgave 19 SKIPPED (image-only options)
				q(
					2023,
					20,
					'Wat moet Cindy doen in de boekenhoek in de winkel?',
					'de boeken in de winkel aanvullen',
					'de boeken op de presentatietafel zetten',
					'de boeken voor vakanties apart leggen',
					'A',
					'track-25.opus'
				),
				q(
					2023,
					21,
					'Welk advies geeft Harma over het omgaan met klanten?',
					'Breng de zware spullen naar de auto van klanten.',
					'Probeer problemen met klanten zelf op te lossen.',
					'Zorg dat klanten altijd de hulp krijgen die ze vragen.',
					'C',
					'track-26.opus'
				),
				q(
					2023,
					22,
					'Wat zegt Harma over het opruimen en schoonmaken van de winkel?',
					'Er is elke dag iemand anders die moet opruimen en schoonmaken.',
					'Ieder ruimt zijn eigen hoek op en maakt het schoon.',
					'Twee keer per dag wordt de winkel heel goed schoongemaakt.',
					'B',
					'track-27.opus'
				),
				q(
					2023,
					23,
					'Wat doet Harma voor het personeel?',
					'Ze koopt cadeautjes voor de verjaardagen en met Kerstmis.',
					'Ze organiseert een paar keer per jaar een activiteit voor iedereen.',
					"Ze regelt dat ze elke maand met z'n allen ergens koffie gaan drinken.",
					'B',
					'track-28.opus'
				),
				q(
					2023,
					24,
					'Wat zegt Harma over het bezorgen van meubels?',
					'Als klanten extra betalen, worden hun meubels naar hun huis gebracht.',
					'De klanten moeten zelf voor een auto met aanhanger zorgen als ze meubels kopen.',
					'De winkel bezorgt de meubels van alle klanten door heel Nederland.',
					'A',
					'track-29.opus'
				)
			]
		},
		{
			name: 'Stewardess',
			intro:
				'Een gesprek met Guida de Leeuw, stewardess bij de KLM. Angelique Noltee overweegt de opleiding voor stewardess.',
			mediaType: 'audio',
			introFiles: ['track-30_intro.opus'],
			questions: [
				q(
					2023,
					25,
					'Wat maakt het beroep van stewardess pittig, volgens Guida?',
					'de wisselende werktijden',
					'het omgaan met verschillende mensen',
					'het vele zitten tijdens een vlucht',
					'A',
					'track-31.opus'
				),
				q(
					2023,
					26,
					'Wat zegt Guida over het idee dat stewardessen bijna altijd lachen?',
					'Het glimlachen gaat vanzelf omdat ze haar werk leuk en uitdagend vindt.',
					'Het is soms lastig te blijven glimlachen met moeilijke mensen aan boord.',
					'Ze is eraan gewend geraakt te glimlachen zodra ze gaat vliegen.',
					'A',
					'track-32.opus'
				),
				q(
					2023,
					27,
					'Angelique vraagt zich af of Guida vaak een jetlag heeft. Wanneer heeft Guida last van jetlags?',
					'als ze midden op de dag op een bestemming aankomt',
					'als ze steeds op andere momenten moet slapen',
					'eigenlijk nooit, maar ze zal er nooit helemaal aan wennen',
					'C',
					'track-33.opus'
				),
				q(
					2023,
					28,
					'Wat vertelt Guida over het indelen van vrije tijd wanneer je op je bestemming bent?',
					'Het team overlegt hierover en deelt samen de tijd in.',
					'Iedereen kan zijn eigen tijd indelen zoals hij wil.',
					"Je kunt zelf dingen doen, maar het is belangrijk dat collega's weten waar je bent.",
					'B',
					'track-34.opus'
				),
				q(
					2023,
					29,
					'Er zijn cursussen om te leren hoe je met lastige passagiers omgaat. Wat vindt Guida van deze cursussen?',
					"Ze zijn interessant, maar Guida's werk verbetert hierdoor niet.",
					'Ze zijn vooral goed voor mensen die niet veel zelfvertrouwen hebben.',
					'Ze zijn zinvol omdat je dingen leert die je kunt gebruiken in de praktijk.',
					'C',
					'track-35.opus'
				)
			]
		},
		{
			name: 'Burgemeester Zeist',
			intro: 'Een video over Koos Janssen, burgemeester van de gemeente Zeist.',
			mediaType: 'video',
			introFiles: ['track-37_intro1.opus', 'track-38_intro2.webm'],
			questions: [
				q(
					2023,
					30,
					'Wat zegt Koos Janssen over de verdeling tussen werktijd en vrije tijd?',
					'Er is voor hem als burgemeester geen verschil tussen werktijd en vrije tijd.',
					'Hij moet goed blijven opletten dat hij vrije tijd overhoudt.',
					'Mensen willen hem in zijn vrije tijd vaak spreken over het werk.',
					'B',
					'track-40.webm'
				),
				q(
					2023,
					31,
					'Waarom is Koos Janssen burgemeester geworden?',
					'Hij kon als econoom geen baan meer vinden.',
					'Hij kreeg een tip toen hij wethouder was.',
					'Hij werd gevraagd door de burgemeester van Bunnik.',
					'B',
					'track-41.webm'
				),
				q(
					2023,
					32,
					'Wat zegt Koos Janssen over andere functies, zoals minister?',
					'Hij denkt dat het leuker is om burgemeester te zijn.',
					'Hij twijfelt of hij dat soort functies wel goed zou kunnen uitoefenen.',
					"Hij wil in de toekomst graag zo'n serieuze functie hebben.",
					'A',
					'track-42.webm'
				),
				q(
					2023,
					33,
					'Welk verschil tussen de inwoners van Zeist noemt Koos Janssen?',
					'het verschil in hoe hard ze werken',
					'het verschil in hoeveel geld ze hebben',
					'het verschil in welk beroep ze uitoefenen',
					'B',
					'track-43.webm'
				),
				q(
					2023,
					34,
					'Wat zegt Koos Janssen over de financi\u00eble kant van het vak van burgemeester?',
					'Dat is het belangrijkste van zijn werk.',
					'Dat kost hem meer tijd dan zijn andere taken.',
					'Dat vindt hij een leuk onderdeel van zijn functie.',
					'C',
					'track-44.webm'
				),
				q(
					2023,
					35,
					'Wat moet er volgens Koos Janssen nog veranderen in Zeist?',
					'Er moet meer aandacht komen voor de verschillende politieke idee\u00ebn.',
					'Er moet meer aandacht komen voor het vernieuwen van de wegen.',
					'Er moet meer aandacht komen voor mensen die het moeilijk hebben.',
					'C',
					'track-45.webm'
				)
			]
		},
		{
			name: 'Leren presenteren',
			intro: 'Een video met tips voor het geven van een presentatie, door Sanny.',
			mediaType: 'video',
			introFiles: ['track-46_intro.opus'],
			questions: [
				q(
					2023,
					36,
					'Wat vertelt Sanny hier over de voorbereiding van je presentatie?',
					'Leer je presentatie van tevoren helemaal uit je hoofd.',
					'Vertel tijdens je presentatie een paar keer wat je belangrijk vindt.',
					'Zorg ervoor dat het publiek je presentatie leuk vindt.',
					'B',
					'track-47.webm'
				),
				q(
					2023,
					37,
					'Welke tip geeft Sanny hier?',
					'Blijf kijken naar de mensen in de zaal.',
					'Ga niet lopen tijdens je presentatie.',
					'Houd je handen op je rug.',
					'A',
					'track-48.webm'
				),
				q(
					2023,
					38,
					'Welke tip geeft Sanny voor als je heel zenuwachtig bent?',
					'Ga in een andere houding staan.',
					'Let extra op je adem en op je lichaam.',
					'Zorg dat je je presentatie goed kent.',
					'B',
					'track-49.webm'
				)
			]
		}
	]
};

// ============================================================
// 2024 EXAM
// 38 questions total, 1 skipped (image-only: opgave 17)
// 37 usable questions
// ============================================================

export const EXAM_2024: LuisterenExam = {
	year: 2024,
	totalQuestions: 38,
	passingScore: 26,
	passages: [
		{
			name: 'Hoofdconducteur NS',
			intro:
				'Een gesprek met Grad van den Heuvel, hoofdconducteur bij de NS. Hij werkt Mirjam Mohan in op haar eerste dag als conductrice.',
			mediaType: 'audio',
			introFiles: ['track-2-intro-hoofdconducteur-ns.mp3'],
			questions: [
				q(
					2024,
					1,
					'In de opleiding tot conductrice zal Mirjam veel nieuwe dingen leren. Waar zal zij het meest van leren, volgens Grad?',
					'van alle cursussen die ze moet volgen',
					'van de informatie die ze krijgt over treinroutes',
					'van haar ervaringen tijdens het werk op de trein',
					'C',
					'track-3-opgave-1.mp3'
				),
				q(
					2024,
					2,
					"Conducteurs hebben een apparaatje waarop ze kunnen zien of een treinreis betaald is. Zo'n apparaatje heet een MCL. Waar kunnen conducteurs een MCL nog meer voor gebruiken?",
					'om allerlei persoonlijke informatie over reizigers op te vragen',
					'om reizigers zonder plaatsbewijs een kaartje te geven',
					'om te weten te komen of reizigers vaste klant bij de NS zijn',
					'C',
					'track-4-opgave-2.mp3'
				),
				q(
					2024,
					3,
					'Welke tip heeft Grad voor Mirjam?',
					'Reageer snel als er problemen met reizigers zijn.',
					'Zeg eerlijk tegen reizigers hoe je over iets denkt.',
					'Zorg dat je vooraf geen mening over reizigers hebt.',
					'C',
					'track-5-opgave-3.mp3'
				),
				q(
					2024,
					4,
					'Grad zegt dat oudere treinreizigers soms onzeker zijn. Welk advies geeft hij aan Mirjam?',
					'Help deze reizigers om hun mobiele telefoon te gebruiken.',
					'Stel deze reizigers alleen vragen als ze zelf naar je toe komen.',
					'Toon interesse in deze reizigers, want daar hebben ze behoefte aan.',
					'C',
					'track-6-opgave-4.mp3'
				),
				q(
					2024,
					5,
					'Op sommige dagen reizen grote aantallen mensen met de trein. Wat zegt Grad daarover?',
					'Hij vindt het belangrijk om dan alles goed te regelen.',
					'Hij vindt het gezellig om dan aan het werk te zijn.',
					'Hij vindt het vervelend wat er dan allemaal gebeurt.',
					'C',
					'track-7-opgave-5.mp3'
				),
				q(
					2024,
					6,
					'Grad vertelt over de Veiligheid- en Serviceteams van de NS. Wat doen deze teams, volgens Grad?',
					'Ze helpen de conducteur als er problemen zijn.',
					'Ze regelen extra hulp bij problemen in de trein.',
					'Ze werken bij problemen samen met de politie.',
					'A',
					'track-8-opgave-6.mp3'
				)
			]
		},
		{
			name: 'Mbo-opleiding Gastvrouw',
			intro:
				'Een gesprek met Cecile van Beek, mbo-studente van de opleiding tot zelfstandig werkend gastvrouw. Carlos Gomez overweegt dezelfde opleiding.',
			mediaType: 'audio',
			introFiles: ['track-9-intro-mbo-opleiding-gastvrouw.mp3'],
			questions: [
				q(
					2024,
					7,
					'Cecile vertelt wat je tijdens de opleiding tot zelfstandig gastvrouw leert. Wat moet je als gastvrouw vooral goed kunnen?',
					'goed met mensen omgaan',
					'maaltijden koken',
					'zelfstandig werken',
					'A',
					'track-10-opgave-7.mp3'
				),
				q(
					2024,
					8,
					'Waarom heeft Cecile vooral voor deze opleiding gekozen?',
					'Ze heeft altijd al geweten dat ze afwisselend werk belangrijk vindt.',
					'Ze organiseerde van jongs af aan al etentjes bij haar thuis.',
					'Ze vond het altijd al leuk om contact met gasten te hebben.',
					'C',
					'track-11-opgave-8.mp3'
				),
				q(
					2024,
					9,
					'Wat is het belangrijkste dat Cecile vertelt over haar stage op Mallorca?',
					'Ze heeft geleerd wat het werken in de horeca echt inhoudt.',
					'Ze moest wennen aan het wonen in het buitenland.',
					'Ze vond het zwaar dat de stage zo lang duurde.',
					'A',
					'track-12-opgave-9.mp3'
				),
				q(
					2024,
					10,
					'Wat zegt Cecile over de samenwerking in de horeca?',
					'Samenwerken doe je de hele tijd.',
					'Samenwerken is niet moeilijk.',
					'Samenwerken lukt haar steeds beter.',
					'A',
					'track-13-opgave-10.mp3'
				),
				q(
					2024,
					11,
					'Wat zegt Cecile over het contact met de docenten?',
					'Als je de lessen leuk vindt, werken de docenten graag met je samen.',
					'Als je geluk hebt, krijg je les van enthousiaste docenten.',
					'Als je goed werkt, zijn de docenten meestal heel behulpzaam.',
					'C',
					'track-14-opgave-11.mp3'
				),
				q(
					2024,
					12,
					'Cecile vertelt over het afstuderen. Hoe wordt het afstuderen beoordeeld?',
					'Je moet met je klas een diner bereiden.',
					'Je moet verschillende opdrachten maken.',
					'Je moet vragen over producten beantwoorden.',
					'B',
					'track-15-opgave-12.mp3'
				),
				q(
					2024,
					13,
					'Cecile vertelt over de leuke en minder leuke kanten van de opleiding. Wat vond Cecile het minst leuk aan de opleiding?',
					'opdrachten maken tijdens de vele tussenuren',
					'te weinig gasten tijdens de praktijklessen',
					'verveling tijdens de theorielessen',
					'B',
					'track-16-opgave-13.mp3'
				),
				q(
					2024,
					14,
					'Cecile vertelt dat ze na haar opleiding een bed & breakfast wil beginnen. Wat vindt ze daar vooral leuk aan?',
					'dat ze haar stage-ervaring in de praktijk kan brengen',
					'dat ze haar vriend vaker ziet',
					'dat ze veel contact met de gasten heeft',
					'C',
					'track-17-opgave-14.mp3'
				),
				q(
					2024,
					15,
					'Cecile vertelt dat je een intakegesprek krijgt voordat je aan de opleiding mag beginnen. Welk advies geeft Cecile hierover?',
					'Laat zien dat je enthousiast bent.',
					'Verdiep je goed in de informatie over de opleiding.',
					'Zorg dat je al in de horeca werkt.',
					'A',
					'track-18-opgave-15.mp3'
				)
			]
		},
		{
			name: 'Bakkerij Stoepje',
			intro:
				"Een gesprek met Wilco Lokhorst, marktkoopman. Hij verkoopt brood van Bakkerij 't Stoepje. Sara Potter werkt vandaag voor het eerst als verkoper.",
			mediaType: 'audio',
			introFiles: ['track-19-intro-bakkerij-stoepje.mp3'],
			questions: [
				q(
					2024,
					16,
					"Wat voor brood moet Sara 's ochtends in de oven doen?",
					'alle broodsoorten die worden verkocht in de kraam',
					'alleen de broden die ongebakken zijn meegenomen',
					'alleen de croissants, pizzabroodjes en saucijzenbroodjes',
					'C',
					'track-20-opgave-16.mp3'
				),
				// opgave 17 SKIPPED (image-only options)
				q(
					2024,
					18,
					'Waarom vindt Wilco het belangrijk dat Sara met klanten praat?',
					'omdat klanten dan meer kopen',
					'omdat klanten dan vaker komen',
					'omdat klanten dat graag willen',
					'B',
					'track-22-opgave-18.mp3'
				),
				q(
					2024,
					19,
					'Wat zegt Wilco over de lunchtijd?',
					'De lunchpauze wordt altijd uitbetaald.',
					'Je kunt tussen de middag een uur lunchen.',
					'Van een goede lunch word je weer fit.',
					'C',
					'track-23-opgave-19.mp3'
				),
				q(
					2024,
					20,
					'Soms maken klanten ruzie over wie er aan de beurt is. Welk advies geeft Wilco aan Sara in dat geval?',
					'Blijf rustig en bepaal zelf welke klant je als eerste helpt.',
					'Help eerst de andere klanten die staan te wachten.',
					'Laat die klanten zelf beslissen wie er eerst mag bestellen.',
					'A',
					'track-24-opgave-20.mp3'
				),
				q(
					2024,
					21,
					'Welke tip geeft Wilco aan Sara als ze broodnamen niet kent?',
					'Kijk in het begin vaak op de naambordjes bij de broden.',
					'Oefen met alle broodnamen, zodat je ze snel kent.',
					'Vertel eerlijk aan klanten dat je de namen nog niet goed kent.',
					'C',
					'track-25-opgave-21.mp3'
				),
				q(
					2024,
					22,
					'Wat zegt Wilco over het werk in de winter?',
					'Als het kouder is dan -10 \u00b0C, gaat de marktkraam niet open.',
					'Door extra kachels wordt het niet te koud in de kraam.',
					'Het is fijn om speciale warme kleren aan te trekken.',
					'C',
					'track-26-opgave-22.mp3'
				),
				q(
					2024,
					23,
					'Wat vertelt Wilco over werkdagen in de marktkraam?',
					'De werkdagen zijn erg lang.',
					'Elke week zijn er andere werkdagen.',
					'Er zijn vijf werkdagen per week.',
					'A',
					'track-27-opgave-23.mp3'
				)
			]
		},
		{
			name: 'Huisartsassistent',
			intro:
				'Een gesprek met Lara Carter, huisartsassistent in Amsterdam. Fatima overweegt ook huisartsassistent te worden.',
			mediaType: 'audio',
			introFiles: ['track-28-intro-huisartsassistent.mp3'],
			questions: [
				q(
					2024,
					24,
					"Wat is Lara's hoofdtaak als huisartsassistent?",
					'het assisteren van de huisarts bij medische handelingen',
					'het uitvoeren van de administratie van de huisartspraktijk',
					'het voeren van gesprekken met verschillende pati\u00ebnten',
					'C',
					'track-29-opgave-24.mp3'
				),
				q(
					2024,
					25,
					'Lara vertelt dat ze bij haar in de praktijk verschillende handelingen uitvoert met medische apparaten. Wat doen ze niet bij Lara in de huisartsenpraktijk?',
					'bloedprikken',
					'oren controleren',
					'urine controleren',
					'A',
					'track-30-opgave-25.mp3'
				),
				q(
					2024,
					26,
					'Wie houdt in huisartspraktijken de meeste administratie bij, volgens Lara?',
					'de huisarts',
					'de huisartsassistent',
					'de praktijkmanager',
					'C',
					'track-31-opgave-26.mp3'
				),
				q(
					2024,
					27,
					'Welk advies geeft Lara over het contact met pati\u00ebnten?',
					'Geef niet te veel specifieke informatie, dat is een taak van de huisarts.',
					'Pas je aan de pati\u00ebnt aan en controleer of de pati\u00ebnt je begrijpt.',
					'Volg een van tevoren opgestelde vragenlijst, zodat je geen vragen vergeet.',
					'B',
					'track-33-opgave-27.mp3'
				),
				q(
					2024,
					28,
					'Lara voert vaak telefoongesprekken met pati\u00ebnten. Soms heeft ze agressieve pati\u00ebnten aan de telefoon. Wat doet Lara als pati\u00ebnten agressief zijn aan de telefoon?',
					'Ze belt de pati\u00ebnt op een later moment zelf terug.',
					'Ze negeert het gedrag van de pati\u00ebnt tijdens het gesprek.',
					'Ze vraagt de pati\u00ebnt om eerst rustig te worden.',
					'C',
					'track-34-opgave-28.mp3'
				),
				q(
					2024,
					29,
					'Wat vindt Lara fijn in het contact met de huisarts?',
					'Ze kan goed communiceren met de huisarts.',
					'Ze kan taken overnemen van de huisarts.',
					'Ze kan veel vragen van de huisarts beantwoorden.',
					'A',
					'track-35-opgave-29.mp3'
				),
				q(
					2024,
					30,
					'Een huisartsassistent kan doorgroeien naar een praktijkondersteuner. Wat voor werk doe je als praktijkondersteuner, volgens Lara?',
					'Je begeleidt pati\u00ebnten bij hun ziekte.',
					'Je stelt diagnoses bij pati\u00ebnten.',
					'Je voert behandelingen uit bij pati\u00ebnten.',
					'A',
					'track-36-opgave-30.mp3'
				)
			]
		},
		{
			name: 'Beeldhouwer houten beelden',
			intro:
				'Een interview met Will Schropp, beeldhouwer van houten beelden. TV Midden interviewt Will voor een programma over kunstenaars uit de regio.',
			mediaType: 'video',
			introFiles: [
				'track-38-intro-1-beeldhouwer-houten-beelden.mp3',
				'track-39-intro-2-beeldhouwer-houten-beelden.webm'
			],
			questions: [
				q(
					2024,
					31,
					'Will vertelt waarom hij zich met kunst en beeldhouwen is gaan bezighouden. Wat vertelt hij hierover?',
					'Hij had al jong geleerd hoe hij beelden moest maken.',
					'Hij had in zijn jeugd al veel aandacht voor natuur en kunst.',
					'Hij had ouders die zelf ook als kunstenaar werkten.',
					'B',
					'track-41-opgave-31.webm'
				),
				q(
					2024,
					32,
					'Will heeft eerst een ander beroep gehad voor hij beeldhouwer werd. Wat zegt hij hierover?',
					'Hij kende geen opleiding waarmee je beeldhouwer kon worden.',
					'Hij wilde er eerst voor zorgen dat hij een vast inkomen had.',
					'Hij wist niet zeker of hij het vak van beeldhouwer wel leuk zou vinden.',
					'B',
					'track-42-opgave-32.webm'
				),
				q(
					2024,
					33,
					'Met welke soort hout werkt Will het liefst?',
					'Hij kiest graag voor zeldzame houtsoorten.',
					'Hij vindt heel veel soorten hout fijn om mee te werken.',
					'Hij werkt eigenlijk al lang met dezelfde soort hout.',
					'B',
					'track-43-opgave-33.webm'
				),
				q(
					2024,
					34,
					'Hoe komt Will op een idee voor een beeld?',
					'Door er in gedachten veel mee bezig te zijn.',
					'Door gewoon met een beeld te beginnen.',
					"Door veel te lezen over bepaalde thema's.",
					'A',
					'track-44-opgave-34.webm'
				),
				q(
					2024,
					35,
					'Waarom werkt Will het liefste buiten?',
					'Dat vindt hij beter voor de kwaliteit van zijn beelden.',
					'Dat vindt hij handig en gezonder voor zichzelf.',
					'Dat vindt hij prettig vanwege de grotere werkplek.',
					'B',
					'track-45-opgave-35.webm'
				),
				q(
					2024,
					36,
					'Wat vertelt Will over beelden die hij in opdracht voor anderen maakt?',
					'Die maakt hij alleen voor goede bekenden.',
					'Die moeten passen bij de mensen voor wie ze zijn.',
					'Die zijn voor hem minder speciaal dan zijn eigen beelden.',
					'B',
					'track-46-opgave-36.webm'
				),
				q(
					2024,
					37,
					'Will maakt houten beelden van jassen. Wat vertelt Will over zijn eerste beeld van een jas?',
					'Dat kwam eigenlijk toevallig op een tentoonstelling terecht.',
					'Dat maakte hij voor mensen die hij bij zijn studie ontmoette.',
					'Dat ziet hij nu nog steeds als zijn beste werk.',
					'A',
					'track-47-opgave-37.webm'
				),
				q(
					2024,
					38,
					'Een tentoonstelling of expositie is een plek waar kunstenaars hun kunst kunnen laten zien aan het publiek. Wat zegt Will over de tentoonstellingen waar zijn beelden staan?',
					'Daar doet hij alleen aan mee om beroemd te worden.',
					'Die vindt hij vooral leuk omdat hij graag reist.',
					'Die waardeert hij door wie hij daar allemaal tegenkomt.',
					'C',
					'track-48-opgave-38.webm'
				)
			]
		}
	]
};

// ============================================================
// 2025 EXAM
// 39 questions total, 1 skipped (image-only: opgave 1)
// 38 usable questions
// ============================================================

export const EXAM_2025: LuisterenExam = {
	year: 2025,
	totalQuestions: 39,
	passingScore: 26,
	passages: [
		{
			name: 'Helicon',
			intro:
				'Een gesprek met Rob de Vrijer, decaan bij Helicon, een school met natuuropleidingen. Carlo Sabano overweegt een natuuropleiding.',
			mediaType: 'audio',
			introFiles: ['track-2_intro.opus'],
			questions: [
				// opgave 1 SKIPPED (image-only options)
				q(
					2025,
					2,
					'Wat vertelt Rob de Vrijer over de arbeidskansen na de opleiding Eco & Wildlife Studies?',
					'De kans op een baan is groter als je veel talen spreekt.',
					'Er is voldoende werk te vinden in het buitenland.',
					'Je moet zelf goed je best doen om een baan te vinden.',
					'C',
					'track-4_opgave-2.opus'
				),
				q(
					2025,
					3,
					'Na de opleiding Eco & Wildlife Studies kun je met dieren gaan werken. Wat vertelt Rob de Vrijer hierover?',
					'Je kunt afhankelijke dieren leren om zichzelf te beschermen.',
					'Je kunt verzwakte dieren helpen weer gezond te worden.',
					'Je kunt wilde dieren begeleiden in het zoeken naar voedsel.',
					'B',
					'track-5_opgave-3.opus'
				),
				q(
					2025,
					4,
					'Wat vertelt Rob de Vrijer over de natuurvakken bij Bos- en Natuurbeheer en bij Eco & Wildlife Studies?',
					'Bij Eco & Wildlife Studies zijn er meer natuurvakken.',
					'De inhoud van de natuurvakken is bij beide studies hetzelfde.',
					'Er worden per studie andere voorbeelden gegeven.',
					'C',
					'track-6_opgave-4.opus'
				),
				q(
					2025,
					5,
					'Wat vertelt Rob de Vrijer over stage lopen bij de opleiding Bos- en Natuurbeheer?',
					'Het is voor studenten verplicht om tijdens de studie een keer stage te lopen in het buitenland.',
					'Studenten lopen vooral stage in Nederland, maar een stage in het buitenland komt ook voor.',
					'Veel studenten lopen liever stage in het buitenland dan in Nederland.',
					'B',
					'track-7_opgave-5.opus'
				)
			]
		},
		{
			name: 'Autoluwe straat',
			intro:
				'Een interview met Janine van der Deure. Janine heeft samen met de mensen uit haar straat gezorgd voor een autoluwe straat.',
			mediaType: 'audio',
			introFiles: ['track-8_intro.opus'],
			questions: [
				q(
					2025,
					6,
					'Waarom was er overlast in de straat van Janine?',
					'De maximale snelheid van 80 kilometer per uur was veel te hoog.',
					'De straat was niet geschikt voor verkeer in twee richtingen.',
					"Er reden veel auto's door de straat en ze reden best hard.",
					'C',
					'track-9_opgave-6.opus'
				),
				q(
					2025,
					7,
					'Wat heeft Janine eerst gedaan?',
					'bij de gemeente gevraagd wat de plannen voor de straat waren',
					'mensen gesproken die al eerder een straat hadden verbeterd',
					'steun gezocht bij de mensen uit de straat',
					'C',
					'track-10-_opgave-7.opus'
				),
				q(
					2025,
					8,
					'Janine ging met een groepje aan de slag. Wat vertelt Janine over de taakverdeling in het groepje?',
					'De groep heeft eerst vergaderd over wie wat ging doen.',
					'Iedereen deed de dingen die bij hem of haar pasten.',
					'Iemand had de leiding en verdeelde de taken.',
					'B',
					'track-11_opgave-8.opus'
				),
				q(
					2025,
					9,
					'Janine ging bij mensen in de straat langs om handtekeningen te verzamelen. Welk voordeel hiervan noemt Janine?',
					'Het werd op die manier steeds duidelijker wat er met de straat moest gebeuren.',
					'Ze heeft op die manier veel geleerd over het overtuigen van mensen.',
					'Ze kreeg op die manier meer contact met de mensen uit de straat.',
					'C',
					'track-12-_opgave-9.opus'
				),
				q(
					2025,
					10,
					'Wat vindt Janine van het resultaat van de actie van de buurt?',
					'Ze is blij omdat het er goed uitziet en het veiliger is geworden.',
					'Ze is opgelucht dat de automobilisten ook positief zijn over het resultaat.',
					'Ze is overal tevreden over behalve over het smaller worden van de straat.',
					'A',
					'track-13-_opgave-10.opus'
				),
				q(
					2025,
					11,
					'Wat vertelt Janine over het parkeren in de straat?',
					'Vroeger was er alleen plaats voor bewoners, nu ook voor bezoekers.',
					'Vroeger was er meer plaats om te parkeren, maar nu is het groener.',
					'Vroeger was het makkelijk om te parkeren, nu is dat erg lastig.',
					'B',
					'track-14-_opgave-11.opus'
				),
				q(
					2025,
					12,
					'Wat is het advies van Janine aan anderen die hun straat autoluw willen maken?',
					'Blijf goed luisteren naar de idee\u00ebn van anderen.',
					'Werk samen met mensen om je doel te bereiken.',
					'Zorg ervoor dat het proces niet te langzaam gaat.',
					'B',
					'track-15-_opgave-12.opus'
				),
				q(
					2025,
					13,
					'Wanneer is een straat geschikt om autoluw te maken, volgens Janine?',
					'als er nog geen autoluwe straten in de buurt zijn',
					'als er veel mensen wonen die vaak buiten zijn',
					'als het een drukke verbindingsweg is',
					'B',
					'track-16-_opgave-13.opus'
				)
			]
		},
		{
			name: 'Functioneringsgesprek',
			intro:
				'Een gesprek tussen Rolf en zijn leidinggevende. Rolf werkt als vertegenwoordiger bij een snoepjesfabriek.',
			mediaType: 'audio',
			introFiles: ['track-17_intro.opus'],
			questions: [
				q(
					2025,
					14,
					'Hoe is het afgelopen jaar gegaan, volgens Rolf?',
					'Goed, maar hij wil beter leren onderhandelen.',
					'Goed, maar hij wil graag vaker naar Engeland.',
					'Goed, maar hij wil zijn Engels verbeteren.',
					'C',
					'track-18_opgave-14.opus'
				),
				q(
					2025,
					15,
					'Wat is belangrijk voor Rolf als hij een cursus Engels gaat volgen?',
					'dat de inhoud van de cursus aansluit bij zijn werk',
					'dat hij niet te veel verschillende dingen moet leren',
					'dat hij ook woorden leert die hij op vakantie kan gebruiken',
					'A',
					'track-19_opgave-15.opus'
				),
				q(
					2025,
					16,
					'Welk probleem heeft Rolf in de samenwerking met zijn collega Wim?',
					'Wim geeft niet toe dat hij erg slordig werkt.',
					'Wim levert offertes te laat en met fouten aan.',
					'Wim werkt liever voor anderen dan voor Rolf.',
					'B',
					'track-20_opgave-16.opus'
				),
				q(
					2025,
					17,
					'Wat zegt Rolf over de werkdruk?',
					'Met name het autorijden vindt hij erg vermoeiend.',
					'Tijdens zijn zakenreizen werkt hij veel uren per dag.',
					'Zijn klanten in Engeland verwachten erg veel van hem.',
					'B',
					'track-21_opgave-17.opus'
				),
				q(
					2025,
					18,
					'Rolf wil in de toekomst meer leiding gaan geven. Waarom denkt hij dat hij daar geschikt voor is?',
					"Hij heeft al vaak collega's begeleid.",
					'Hij kan goed toezicht houden.',
					"Zijn collega's zijn positief over hem.",
					'C',
					'track-22_opgave-18.opus'
				)
			]
		},
		{
			name: 'Museumsuppoost',
			intro:
				'Een gesprek met Erik van Katswaarde, al 17 jaar lang suppoost in een museum. Marcia Willems schrijft een artikel over bijzondere beroepen.',
			mediaType: 'audio',
			introFiles: ['track-23_intro.opus'],
			questions: [
				q(
					2025,
					19,
					'Wat zegt Erik over het museum waarin hij werkt?',
					'Het is een nieuw gebouw, met telkens andere verzamelingen.',
					'Het is een oud gebouw, met ontzettend veel verzamelingen.',
					'Het is een verbouwd gebouw, met alleen oude verzamelingen.',
					'B',
					'track-24_opgave-19.opus'
				),
				q(
					2025,
					20,
					'Wat vertelt Erik over het gebouw?',
					'Het licht in het gebouw komt vooral van buiten.',
					'Het licht in het gebouw komt vooral van grote lampen.',
					'In het gebouw zijn weinig ramen en er is dus weinig licht.',
					'A',
					'track-25_opgave-20.opus'
				),
				q(
					2025,
					21,
					'Waarom vindt Erik rondleiden zo leuk?',
					'omdat hij dan even kan doen alsof hij in een andere tijd leeft',
					'omdat hij nog elke dag verrast wordt door de bijzondere objecten',
					'omdat hij steeds weer andere mensen met andere vragen ontmoet',
					'C',
					'track-26_opgave-21.opus'
				),
				q(
					2025,
					22,
					'Wat vertelt Erik over zijn werkrooster?',
					'Hij heeft hetzelfde werkrooster als alle andere medewerkers: van 8 tot 5 uur.',
					'Hij heeft korte werkdagen en kan daardoor zijn werk goed doen.',
					'Hij werkt op vaste tijden en daardoor is zijn werk soms wat saai.',
					'B',
					'track-27_opgave-22.opus'
				),
				q(
					2025,
					23,
					'Welke tip heeft Erik voor iemand die wil solliciteren op een baan als suppoost?',
					'Je moet het niet erg vinden om ook wel eens saai werk te doen.',
					'Je moet informatie over het museum willen bestuderen.',
					'Je moet vooral graag als beveiliger willen werken.',
					'B',
					'track-28_opgave-23.opus'
				)
			]
		},
		{
			name: 'Personal trainer',
			intro:
				'Een gesprek met Charlotte, personal trainer. Suzan overweegt een opleiding voor personal trainer.',
			mediaType: 'audio',
			introFiles: ['track-29_intro.opus'],
			questions: [
				q(
					2025,
					24,
					'Welk werk mag je doen als je fitnesstrainer A bent?',
					'fitnessapparaten onderhouden',
					'groepstrainingen geven',
					'stagiaires begeleiden',
					'B',
					'track-30_opgave-24.opus'
				),
				q(
					2025,
					25,
					'Suzan denkt dat ze meerdere keren in de week moet sporten voor een betere conditie. Welke tip geeft Charlotte?',
					'Doe vooral krachttraining.',
					'Geef je spieren voldoende rust.',
					'Train niet te lang achter elkaar.',
					'B',
					'track-31_opgave-25.opus'
				),
				q(
					2025,
					26,
					'Waar moet je rekening mee houden als je een goede personal trainer wilt zijn?',
					'Probeer geen blessures te krijgen.',
					'Wees klantvriendelijk.',
					'Zorg dat je fit bent.',
					'C',
					'track-32_opgave-26.opus'
				),
				q(
					2025,
					27,
					'Voor zowel fitnesstrainer A als voor B is het kennen van alle spiergroepen belangrijk. Wat moet je nog meer weten om fitnesstrainer B te worden, volgens Charlotte?',
					'hoe je de fitnessapparaten moet onderhouden',
					'hoe je \u00e9\u00e9n op \u00e9\u00e9n iemand moet begeleiden',
					'hoe je een trainingsschema maakt voor groepen',
					'B',
					'track-33_opgave-27.opus'
				),
				q(
					2025,
					28,
					'Tijdens de opleiding leer je veel over training geven. Waar gaat de theorie nog meer over?',
					"hoe je omgaat met collega's",
					'wanneer je je klanten het best kunt motiveren',
					'wat je moet doen om meer klanten te krijgen',
					'C',
					'track-34_opgave-28.opus'
				),
				q(
					2025,
					29,
					'Charlotte vertelt dat je tijdens de opleiding een verslag moet maken. Waar gaat dat verslag over?',
					'over de gehele begeleiding van een klant',
					'over de gehele opleiding',
					'over de gehele stageperiode',
					'A',
					'track-35_opgave-29.opus'
				),
				q(
					2025,
					30,
					'Als je de opleiding voor personal trainer doet, loop je stage op een sportschool. Waar moet deze sportschool aan voldoen?',
					'De sportschool moet bij de opleiding bekend zijn.',
					'De sportschool moet bij een vereniging zijn aangesloten.',
					'De sportschool moet genoeg klanten hebben met wie je kunt werken.',
					'B',
					'track-36_opgave-30.opus'
				),
				q(
					2025,
					31,
					'Charlotte zegt: "Dan heb je de kans dat het ook een lastige klant gaat worden." Welke tip geeft Charlotte om te zorgen dat de klant niet lastig wordt?',
					'Bepaal zelf het doel voor de klant.',
					'Houd rekening met wat de klant wil.',
					'Plan verschillende sporten in met de klant.',
					'B',
					'track-37_opgave-31.opus'
				),
				q(
					2025,
					32,
					'Suzan wil weten wat ze moet doen als ze klaar is met de opleiding. Wat kun je volgens Charlotte het best eerst doen?',
					'bepalen of je je in een bepaalde sport wilt specialiseren',
					'bepalen of je zelfstandig of voor een sportschool wilt werken',
					'bepalen welke klanten je wilt gaan trainen',
					'C',
					'track-38_opgave-32.opus'
				)
			]
		},
		{
			name: 'Onderwijsassistente',
			intro:
				'Een gesprek met Marije Gimbergh, onderwijsassistente op een basisschool. Chantal overweegt dezelfde opleiding.',
			mediaType: 'video',
			introFiles: ['track-40_intro1.opus', 'track-41_intro2.webm'],
			questions: [
				q(
					2025,
					33,
					'Waarom koos Marije voor de opleiding Sociaal Pedagogisch Medewerker niveau 3?',
					'Ze hoefde niet direct een richting te kiezen.',
					'Ze wilde niet meer in de zorg werken.',
					'Ze wilde nog geen stage lopen.',
					'A',
					'track-43_opgave-33.webm'
				),
				q(
					2025,
					34,
					'Hoe wordt pre-teaching op de school van Marije georganiseerd?',
					'Bepaalde leerlingen krijgen extra tijd om de les zelfstandig voor te bereiden.',
					'De leerkracht geeft voor de les extra uitleg aan bepaalde leerlingen.',
					'Marije leest vooraf met bepaalde leerlingen de lesstof door.',
					'C',
					'track-44_opgave-34.webm'
				),
				q(
					2025,
					35,
					'Marije vertelt dat geduldig zijn een belangrijke vaardigheid is voor een onderwijsassistente. Wat is nog meer belangrijk, volgens Marije?',
					'Je moet positief blijven als iets niet lukt.',
					'Je moet snel kunnen verzinnen hoe je problemen aanpakt.',
					'Je moet weten hoe je ervoor zorgt dat kinderen doen wat je zegt.',
					'B',
					'track-45_opgave-35.webm'
				),
				q(
					2025,
					36,
					'Hoe weet Marije wat ze met een leerling moet doen?',
					'De leerkracht geeft aan haar door wat de ouders graag willen voor hun kinderen.',
					'De leerkracht geeft aan haar door wat er in de vergadering is besloten.',
					'De leerkracht geeft aan haar door wat hij heeft bedacht voor de leerlingen.',
					'C',
					'track-46_opgave-36.webm'
				),
				q(
					2025,
					37,
					'Marije praat over hoge werkdruk. Wat zegt Marije over werkdruk?',
					"Haar collega's moeten heel veel werk doen.",
					"Haar collega's proberen hier iets aan te doen.",
					"Haar collega's zijn hieraan gewend.",
					'A',
					'track-47_opgave-37.webm'
				),
				q(
					2025,
					38,
					'Wat houdt Marije bij in haar administratie?',
					'Ze schrijft voor de leerkracht op hoe het met de leerlingen gaat.',
					'Ze schrijft voor de leerlingen op wat hun resultaten zijn.',
					'Ze schrijft voor zichzelf op wat ze heeft gedaan.',
					'C',
					'track-48_opgave-38.webm'
				),
				q(
					2025,
					39,
					'Wat vindt Marije het leukste aan onderwijsassistente zijn?',
					'Doordat ze op verschillende scholen werkt, reist ze veel.',
					'Door haar inzet snappen de kinderen de lesstof beter.',
					'Leerlingen zijn blij met de hulp die ze van haar krijgen.',
					'B',
					'track-49_opgave-39.webm'
				)
			]
		}
	]
};

// ============================================================
// ALL EXAMS
// ============================================================

export const LUISTEREN_EXAMS: LuisterenExam[] = [EXAM_2025, EXAM_2024, EXAM_2023];

/** Get all questions across all exams, flat */
export function getAllQuestions(): LuisterenQuestion[] {
	return LUISTEREN_EXAMS.flatMap((exam) => exam.passages.flatMap((p) => p.questions));
}

/** Get exam by year */
export function getExamByYear(year: number): LuisterenExam | undefined {
	return LUISTEREN_EXAMS.find((e) => e.year === year);
}
