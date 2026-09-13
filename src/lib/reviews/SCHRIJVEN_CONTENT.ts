// ============================================================
// DUTCHINA SCHRIJVEN CONTENT
// Extracted from NT2 Staatsexamen Schrijven I exam papers.
// Years: 2023, 2024, 2025. 12 tasks per year = 36 total.
//
// Source files: /mnt/project/*Schrijven* (zip archives with
// pre-extracted OCR text). "Hier niet schrijven" noise from
// 2023/2024 OCR has been stripped.
//
// Task types:
//   zinstaak (1-8): Complete a sentence in context, 1-2 sentences
//   deelschrijftaak (9-10): Complete a short message/form, 3-5 sentences
//   korte_schrijftaak (11-12): Write a complete short text, 6-10 sentences
//
// Grading criteria come from the beoordelingsmodel PDFs.
// The boyfriend doesn't need to grade like a real examiner.
// He reads the criteria and makes a Pass/Close/Fail judgment.
// ============================================================

import type { SchrijvenTask, SchrijvenTaskType } from './types';

// ============================================================
// 2025 TASKS
// ============================================================

const TASKS_2025: SchrijvenTask[] = [
	// ---- Zinstaak 1-8 ----
	{
		id: 'sch_2025_1',
		year: 2025,
		taskNumber: 1,
		type: 'zinstaak',
		title: 'Overleg woensdag',
		scenario: 'U werkt bij postbedrijf Servicemail. U stuurt een e-mail naar een collega.',
		partialText:
			'Dag Peter,\n\nVolgende week woensdag hebben wij een overleg. Het overleg is gepland om 13:00 uur. Ik kan dan helaas niet, want ___\n\nIk hoop dat dit geen probleem geeft.\n\nGroeten,',
		gradingCriteria: {
			adequacy:
				'De schrijver geeft een reden waarom hij niet aanwezig kan zijn bij het overleg van woensdag.',
			grammar: 'De schrijver produceert een hoofdzin.'
		},
		maxPoints: 2
	},
	{
		id: 'sch_2025_2',
		year: 2025,
		taskNumber: 2,
		type: 'zinstaak',
		title: 'Opleiding Doktersassistent',
		scenario:
			'U wilt misschien de opleiding Doktersassistent aan ROC Barendrecht volgen. Een doktersassistent helpt de dokter. U stuurt een e-mail naar een vriendin.',
		partialText:
			'Hoi Dina,\n\nIk wil misschien de opleiding Doktersassistent aan ROC Barendrecht volgen. Jij volgt die opleiding nu, toch? Ik wil graag een keer met je afspreken, zodat ___\n\nZou je dat willen? Ik hoor het graag.\n\nGroetjes,',
		gradingCriteria: {
			adequacy:
				'De schrijver beschrijft het doel van de te maken afspraak met betrekking tot de opleiding Doktersassistent.',
			grammar: 'De schrijver produceert een bijzin.'
		},
		maxPoints: 2
	},
	{
		id: 'sch_2025_3',
		year: 2025,
		taskNumber: 3,
		type: 'zinstaak',
		title: 'Koffiemachine kapot',
		scenario:
			"U werkt op de administratie bij kopieerservice Papier Hier. U stuurt een e-mail naar uw collega's.",
		partialText:
			"Hallo collega's,\n\nVandaag is de koffiemachine kapot gegaan. Daarom ___\n\nVanaf maandag is er een nieuwe koffiemachine.\n\nGroeten,",
		gradingCriteria: {
			adequacy: 'De schrijver beschrijft een gevolg van de kapotte koffiemachine.',
			grammar: 'De schrijver produceert een hoofdzin met inversie.'
		},
		maxPoints: 2
	},
	{
		id: 'sch_2025_4',
		year: 2025,
		taskNumber: 4,
		type: 'zinstaak',
		title: 'Klassieke dans',
		scenario:
			'U volgt een dansopleiding aan danscollege Bailar. U schrijft een bericht aan uw medestudenten op de website van danscollege Bailar.',
		partialText:
			'Hoi medestudenten,\n\nIk ben nog niet zo goed in klassieke dans en ik wil graag extra oefenen. Wie heeft er zin om ___\n\nAlvast bedankt voor de reacties.',
		gradingCriteria: {
			adequacy:
				'De schrijver stelt een vraag met betrekking tot het extra willen oefenen met klassieke dans.',
			grammar: "De schrijver produceert een 'te + infinitief'-constructie."
		},
		maxPoints: 2
	},
	{
		id: 'sch_2025_5',
		year: 2025,
		taskNumber: 5,
		type: 'zinstaak',
		title: 'Vergaderkamer reserveren',
		scenario:
			'U werkt op het secretariaat van reclamebureau Recla-you. U stuurt een e-mail naar een collega.',
		partialText:
			'Beste meneer Albahir,\n\nU vroeg mij de kleine vergaderkamer te reserveren voor uw overleg van 10:00 uur met meneer De Vries. Om 10:00 uur is die ruimte helaas al bezet. ___\n\nIk hoor graag wat u van deze oplossing vindt.\n\nMet vriendelijke groet,',
		gradingCriteria: {
			adequacy:
				'De schrijver stelt een oplossing voor met betrekking tot het verzoek voor het reserveren van een vergaderkamer.',
			grammar: 'Geen specifieke opmerkingen.'
		},
		maxPoints: 2
	},
	{
		id: 'sch_2025_6',
		year: 2025,
		taskNumber: 6,
		type: 'zinstaak',
		title: 'Idee overgebleven T-shirts',
		scenario:
			'U volgt de opleiding Modeontwerper aan ROC Ewijk. U stuurt een e-mail naar drie medestudenten met wie u een opdracht hebt gedaan.',
		partialText:
			"Hoi Paul, Abdul en Meryem,\n\nWe zijn nu klaar met de opdracht voor het vak 'T-shirts maken'. Er zijn nog wel veel T-shirts overgebleven. ___\n\nVinden jullie dat een goed idee? Dan kunnen we er wat geld mee verdienen.\n\nGroeten,",
		gradingCriteria: {
			adequacy:
				'De schrijver beschrijft een idee of voorstel om geld te verdienen met de overgebleven T-shirts.',
			grammar: 'Geen specifieke opmerkingen.'
		},
		maxPoints: 2
	},
	{
		id: 'sch_2025_7',
		year: 2025,
		taskNumber: 7,
		type: 'zinstaak',
		title: 'Fietsenwinkel Van Den Bike',
		scenario:
			'U bent eigenaar van fietsenwinkel Van Den Bike. U schrijft een bericht voor de buurtkrant.',
		partialText:
			'Actie!\n\nVolgende week hebben we een nieuwe actie. Wij maken in die week uw fietslicht voor 5 euro! Wilt u gebruikmaken van deze actie? ___\n\nHopelijk tot snel!',
		gradingCriteria: {
			adequacy:
				'De schrijver schrijft wat klanten moeten doen als ze gebruik willen maken van de actie.',
			grammar: 'Geen specifieke opmerkingen.'
		},
		maxPoints: 2
	},
	{
		id: 'sch_2025_8',
		year: 2025,
		taskNumber: 8,
		type: 'zinstaak',
		title: 'Leukste buurtvereniging van Nederland',
		scenario:
			'U bent lid van buurtvereniging UVO in Barendrecht. U plaatst een bericht op de website van de buurtvereniging.',
		partialText:
			"Buurtvereniging UVO heeft meegedaan aan de wedstrijd 'Leukste buurtvereniging van Nederland'. ___\n\nMet dit geld gaan we een groot feest voor onze leden organiseren!\n\nBuurtvereniging UVO",
		gradingCriteria: {
			adequacy:
				"De schrijver doet een mededeling met betrekking tot het winnen van een geldprijs met de wedstrijd 'Leukste buurtvereniging van Nederland'.",
			grammar: 'Geen specifieke opmerkingen.'
		},
		maxPoints: 2
	},

	// ---- Deelschrijftaak 9-10 ----
	{
		id: 'sch_2025_9',
		year: 2025,
		taskNumber: 9,
		type: 'deelschrijftaak',
		title: 'Taalcursussen opleiding Hotelmedewerker',
		scenario:
			'U studeert voor Hotelmedewerker bij ROC Heythuysen. Het ROC doet een onderzoek naar interesse in taalcursussen die als extra vak bij de opleiding gevolgd kunnen worden. Het ROC vraagt studenten Hotelmedewerker een formulier in te vullen. U vult het formulier in.\n\nVul het formulier volledig in. U mag de informatie zelf verzinnen.',
		partialText:
			'Taalcursussen opleiding Hotelmedewerker\n\n1. Welke taalcursus zou u willen volgen? Geef ook aan waarom u voor deze taal kiest.\n2. Hoeveel lessen wilt u per week volgen?\n3. Wat hoopt u te leren tijdens de taalcursus?\n4. Wilt u de cursus liever online of in de klas volgen? Geef minimaal twee redenen.\n5. Wilt u de cursus liever alleen of in een groep volgen? Leg ook uit waarom.\n6. Hebt u eerder een taalcursus gevolgd? Zo ja, welke taal en wat vond u van die cursus? Zo nee, waarom niet?',
		gradingCriteria: {
			adequacy:
				'De tekst wordt beoordeeld als acceptabel wanneer het formulier volledig is ingevuld. Wanneer slechts aan een gedeelte van de opdracht is voldaan, kunnen maximaal 2 punten toegekend worden.',
			grammar:
				'0 punten: veel grammaticale fouten. 1 punt: enkele fouten. 2 punten: nauwelijks of geen fouten. Fouten tegen het woordgeslacht mogen voorkomen.',
			extraAspects:
				'Spelling: 0 = veel spelfouten, 1 = nauwelijks of geen. Woordgebruik: 0 = niet adequaat, 1 = adequaat/sluit goed aan bij het onderwerp.'
		},
		maxPoints: 7
	},
	{
		id: 'sch_2025_10',
		year: 2025,
		taskNumber: 10,
		type: 'deelschrijftaak',
		title: "Uitje met collega's",
		scenario:
			"U werkt als medewerker administratie bij fabriek Maraboe. Ieder jaar gaat u met de afdeling naar een stad. Vorige week was er een uitje naar Amsterdam. Uw leidinggevende wil weten wat u van het uitje vond en welk idee u hebt voor volgend jaar.\n\nU stuurt een e-mail naar uw leidinggevende.\n\nOpdracht:\n- U beschrijft wat u en uw collega's in Amsterdam hebben gedaan.\n- U schrijft welke activiteit in Amsterdam u het leukst vond. U legt ook uit waarom. Deze informatie mag u zelf verzinnen.\n- U schrijft naar welke stad u volgend jaar wilt gaan met uw collega's. U legt ook uit waarom. Deze informatie mag u zelf verzinnen.\n\nHet doel van uw e-mail is uw leidinggevende te informeren over wat u van het uitje met de afdeling vond en wat uw idee is voor een uitje volgend jaar.",
		partialText:
			'Beste Marco,\n\nVorige week was het uitje naar Amsterdam met de afdeling Administratie.\n\n___\n\nVriendelijke groet,',
		gradingCriteria: {
			adequacy:
				"De tekst wordt beoordeeld als acceptabel wanneer de schrijver: beschrijft wat zijn collega's en hij in Amsterdam hebben gedaan; schrijft welke activiteit het leukst was en waarom; schrijft naar welke stad hij volgend jaar wil gaan en waarom. Wanneer slechts aan een gedeelte van de opdracht is voldaan, kunnen maximaal 2 punten toegekend worden.",
			grammar:
				'0 punten: veel grammaticale fouten. 1 punt: enkele fouten. 2 punten: nauwelijks of geen fouten. Fouten tegen het woordgeslacht mogen voorkomen.',
			extraAspects:
				'Spelling: 0 = veel spelfouten, 1 = nauwelijks of geen. Samenhang: 0 = nauwelijks samenhang of inadequaat gebruik van signaalwoorden, 1 = duidelijke samenhang met adequate signaalwoorden. Woordgebruik: 0 = niet adequaat, 1 = adequaat.'
		},
		maxPoints: 8
	},

	// ---- Korte schrijftaak 11-12 ----
	{
		id: 'sch_2025_11',
		year: 2025,
		taskNumber: 11,
		type: 'korte_schrijftaak',
		title: 'Levering bank',
		scenario:
			'U hebt een nieuwe bank besteld bij Mulders Meubelland. U hebt vandaag een bericht van Mulders Meubelland gekregen: uw bank wordt twee maanden later geleverd dan verwacht. U stuurt een reactie naar de klantenservice.\n\nOpdracht:\n- U schrijft welke bank u hebt besteld (denk aan: merk, kleur, etc.). U schrijft ook wanneer u de bank hebt besteld.\n- U schrijft op welke datum de bank eigenlijk geleverd zou moeten worden. U schrijft ook wanneer de bank nu geleverd gaat worden.\n- U schrijft wat u van de late levering vindt. U legt ook uit waarom.\n- U doet een voorstel voor een oplossing. U noemt minimaal twee oplossingen.\n- U schrijft welke oplossing uw voorkeur heeft. U legt ook uit waarom.\n- U schrijft wat u van Mulders Meubelland verwacht.\n\nU mag de informatie zelf verzinnen.\nHet doel van uw e-mail is Mulders Meubelland ervan te overtuigen u een van de oplossingen te bieden voor de late levering van de bank.',
		partialText: 'Geachte heer, mevrouw,\n\n___\n\nMet vriendelijke groet,',
		gradingCriteria: {
			adequacy:
				'De tekst wordt beoordeeld als acceptabel wanneer de schrijver: schrijft welke bank hij besteld heeft en wanneer; schrijft wanneer de bank eigenlijk geleverd zou worden en wanneer nu; schrijft wat hij van de late levering vindt en waarom; minimaal twee oplossingen voorstelt; schrijft welke oplossing zijn voorkeur heeft en waarom; schrijft wat hij van Mulders Meubelland verwacht. Het doel is Mulders Meubelland te overtuigen een oplossing te bieden.',
			grammar:
				'0 punten: veel grammaticale fouten. 1 punt: enkele fouten. 2 punten: nauwelijks of geen fouten. Fouten tegen het woordgeslacht mogen voorkomen.',
			extraAspects:
				'Spelling: 0 = veel spelfouten, 1 = nauwelijks of geen. Samenhang: 0 = nauwelijks samenhang, 1 = duidelijke samenhang. Woordgebruik: 0 = niet adequaat, 1 = adequaat.'
		},
		maxPoints: 8
	},
	{
		id: 'sch_2025_12',
		year: 2025,
		taskNumber: 12,
		type: 'korte_schrijftaak',
		title: 'Stage kledingwinkel',
		scenario:
			'U volgt de opleiding tot verkoper aan ROC Waalwijk. U en een medestudent zijn samen op zoek naar een stageplek in een kledingwinkel. U hebt informatie gevonden over verschillende stagebedrijven.\n\nTabel: Stagebedrijven kledingwinkels\nKledingwinkel | Tessa Boetiek | Frederique | Lena mode\ndag | vrijdag | donderdag | zondag\ntijd | 12:00-20:00 | 10:00-18:00 | 12:00-18:00\nvergoeding | \u20AC120/maand | \u20AC100/maand | \u20AC80/maand\nreistijd | 15 min | 20 min | 35 min\n\nU schrijft een e-mail aan uw medestudent over de stagebedrijven.\n\nOpdracht:\n- U legt uit waarom u schrijft.\n- U schrijft welke drie stagebedrijven u hebt gevonden (gebruik de tabel).\n- U schrijft welk stagebedrijf uw voorkeur heeft. U noemt minimaal twee redenen (gebruik de tabel).\n- U schrijft waarom de andere stagebedrijven minder geschikt zijn. Per stagebedrijf minimaal een reden (gebruik de tabel).\n- U schrijft hoe u en uw medestudent contact kunnen opnemen met het gekozen stagebedrijf. Deze informatie mag u zelf verzinnen.\n\nHet doel is uw medestudent ervan te overtuigen dat het door u gekozen stagebedrijf het meest geschikt is.',
		partialText: 'Hoi Janneke,\n\n___\n\nGroetjes,',
		gradingCriteria: {
			adequacy:
				'De tekst wordt beoordeeld als acceptabel wanneer de schrijver: uitlegt waarom hij schrijft; de drie stagebedrijven beschrijft met de tabel; schrijft welk zijn voorkeur heeft met minimaal twee redenen; schrijft waarom de andere minder geschikt zijn met per stagebedrijf minimaal een reden; schrijft hoe contact op te nemen met het gekozen bedrijf. Het doel is de medestudent te overtuigen dat het gekozen stagebedrijf het meest geschikt is.',
			grammar:
				'0 punten: veel grammaticale fouten. 1 punt: enkele fouten. 2 punten: nauwelijks of geen fouten. Fouten tegen het woordgeslacht mogen voorkomen.',
			extraAspects:
				'Spelling: 0 = veel spelfouten, 1 = nauwelijks of geen. Samenhang: 0 = nauwelijks samenhang, 1 = duidelijke samenhang. Woordgebruik: 0 = niet adequaat, 1 = adequaat.'
		},
		maxPoints: 8
	}
];

// ============================================================
// 2024 TASKS
// ============================================================

const TASKS_2024: SchrijvenTask[] = [
	// ---- Zinstaak 1-8 ----
	{
		id: 'sch_2024_1',
		year: 2024,
		taskNumber: 1,
		type: 'zinstaak',
		title: 'Contactgegevens klant',
		scenario:
			'U bent administratief medewerker bij Laptop Wereld. U stuurt een e-mail naar uw collega.',
		partialText:
			'Beste Tyler,\n\nIk heb vorige week een e-mail gestuurd naar onze klant meneer Joos, maar ___\n\nHeb je toevallig een telefoonnummer van hem? Alvast bedankt.\n\nGroeten,',
		gradingCriteria: {
			adequacy:
				'De schrijver beschrijft een tegenstelling die betrekking heeft op de e-mail die naar de klant gestuurd is.',
			grammar: 'De schrijver produceert een hoofdzin.'
		},
		maxPoints: 2
	},
	{
		id: 'sch_2024_2',
		year: 2024,
		taskNumber: 2,
		type: 'zinstaak',
		title: 'Extra lessen voor examen',
		scenario:
			'U volgt een cursus Nederlands bij taalschool NL-leertijd. U hebt over een paar weken een examen Spreken. U stuurt een e-mail naar uw docent.',
		partialText:
			'Beste mevrouw Hoogstraten,\n\nIk ga over een paar weken een examen Spreken doen. Ik wil graag wat extra lessen volgen, zodat ___\n\nKan dat bij u? Ik hoor het graag.\n\nMet vriendelijke groet,',
		gradingCriteria: {
			adequacy: 'De schrijver beschrijft het doel van de extra lessen.',
			grammar: 'De schrijver produceert een bijzin.'
		},
		maxPoints: 2
	},
	{
		id: 'sch_2024_3',
		year: 2024,
		taskNumber: 3,
		type: 'zinstaak',
		title: 'Aanbieding Hotel De Strandloper',
		scenario:
			'U werkt bij de klantenservice van Hotel De Strandloper. U schrijft een bericht op de website.',
		partialText:
			'Aanbieding Hotel De Strandloper\n\nHebt u zin in een paar dagen rust? Wij hebben een fantastische aanbieding! U krijgt 10% korting op uw reservering. Daarnaast ___\n\nGa naar www.destrandloper.nl voor meer informatie.',
		gradingCriteria: {
			adequacy:
				'De schrijver beschrijft een tweede of een aanvullende aanbieding van Hotel De Strandloper.',
			grammar: 'De schrijver produceert een hoofdzin met inversie.'
		},
		maxPoints: 2
	},
	{
		id: 'sch_2024_4',
		year: 2024,
		taskNumber: 4,
		type: 'zinstaak',
		title: 'Verslag Engels',
		scenario:
			'U volgt de opleiding Bedrijfsadministratie aan ROC Lochem. U maakt samen met een medestudent een verslag. U stuurt een e-mail naar deze medestudent.',
		partialText:
			'Beste Edris,\n\nBedankt voor de opzet van het verslag. Het ziet er goed uit! Ik ga morgen proberen om ___\n\nDaarna zal ik het verslag weer naar je terugsturen.\n\nGroetjes,',
		gradingCriteria: {
			adequacy: 'De schrijver beschrijft wat hij morgen gaat proberen te doen met het verslag.',
			grammar: "De schrijver produceert een 'te + infinitief'-constructie."
		},
		maxPoints: 2
	},
	{
		id: 'sch_2024_5',
		year: 2024,
		taskNumber: 5,
		type: 'zinstaak',
		title: 'Bestelling tomaten',
		scenario: 'U bent eigenaar van groentewinkel Janssen. U stuurt een e-mail naar een boer.',
		partialText:
			'Dag Willem,\n\nMaandag zou je weer de tomaten komen brengen. De winkel is helaas aanstaande maandag dicht vanwege een feestdag. ___\n\nDat zou mooi zijn. Ik hoor het graag!\n\nMet vriendelijke groeten,',
		gradingCriteria: {
			adequacy:
				'De schrijver doet een voorstel voor het wijzigen van de dag waarop de tomaten worden geleverd.',
			grammar: 'Geen specifieke opmerkingen.'
		},
		maxPoints: 2
	},
	{
		id: 'sch_2024_6',
		year: 2024,
		taskNumber: 6,
		type: 'zinstaak',
		title: 'Beoordeling mobiele telefoon',
		scenario:
			'U hebt een nieuwe telefoon van het merk Nopei. U geeft uw mening over de telefoon op een website over mobiele telefoons.',
		partialText:
			"Beoordeling mobiele telefoon\n\nIk heb vorige maand de Nopei 705 gekocht. Ik ben best tevreden over deze mobiele telefoon. De telefoon maakt mooie foto's. Er is wel een nadeel: ___\n\nNopei kan dat nog aanpassen.",
		gradingCriteria: {
			adequacy: 'De schrijver noemt een nadeel van de Nopei 705-telefoon.',
			grammar: 'Geen specifieke opmerkingen.'
		},
		maxPoints: 2
	},
	{
		id: 'sch_2024_7',
		year: 2024,
		taskNumber: 7,
		type: 'zinstaak',
		title: 'Bril is gemaakt',
		scenario: 'U werkt bij brillenwinkel Beter Zicht. U stuurt een e-mail naar een klant.',
		partialText:
			'Beste mevrouw Verspoor,\n\nUw bril is weer gemaakt! ___\n\nEen afspraak maken is niet nodig.\n\nMet vriendelijke groet,',
		gradingCriteria: {
			adequacy:
				'De schrijver doet een verzoek of een mededeling met betrekking tot de bril die gemaakt is.',
			grammar: 'Geen specifieke opmerkingen.'
		},
		maxPoints: 2
	},
	{
		id: 'sch_2024_8',
		year: 2024,
		taskNumber: 8,
		type: 'zinstaak',
		title: 'Opleiding Automonteur',
		scenario:
			'U volgt de opleiding Automonteur aan ROC Lijnden. Een automonteur werkt in een garage. U stuurt een e-mail naar uw vriend.',
		partialText:
			'Hoi Odin,\n\nWat vond je van de open dag van de opleiding Automonteur? Je kunt je aanmelden voor de opleiding via www.roclijnden.nl/opendag. Let wel op! ___\n\nNa die datum kun je je niet meer aanmelden.\n\nSucces!\n\nGroetjes,',
		gradingCriteria: {
			adequacy:
				'De schrijver geeft aan tot welke datum Odin zich kan aanmelden voor de opleiding Automonteur.',
			grammar: 'Geen specifieke opmerkingen.'
		},
		maxPoints: 2
	},

	// ---- Deelschrijftaak 9-10 ----
	{
		id: 'sch_2024_9',
		year: 2024,
		taskNumber: 9,
		type: 'deelschrijftaak',
		title: 'Boeken ruilen',
		scenario:
			'U wilt boeken ruilen met mensen uit uw buurt. U schrijft een bericht hierover op de website van het buurtcentrum.\n\nOpdracht:\n- U legt uit waarom u schrijft.\n- U beschrijft minimaal twee voordelen van boeken ruilen.\n- U legt uit welke soort boeken u wilt ruilen (denk aan: kinderboeken, studieboeken, etc.). U legt ook uit waarom u dit soort boeken wilt ruilen.\n- U beschrijft wat de buurtbewoners moeten doen als ze boeken willen ruilen.\n\nU mag de informatie zelf verzinnen.\nHet doel van het bericht is de buurtbewoners te informeren over de mogelijkheid van het ruilen van boeken.',
		partialText: 'Beste buren,\n\n___\n\nGroeten,',
		gradingCriteria: {
			adequacy:
				'De tekst wordt beoordeeld als acceptabel wanneer de schrijver: uitlegt waarom hij schrijft; minimaal twee voordelen van boeken ruilen beschrijft; uitlegt welke soort boeken hij wil ruilen en waarom; beschrijft wat buurtbewoners moeten doen als ze boeken willen ruilen.',
			grammar:
				'0 punten: veel grammaticale fouten. 1 punt: enkele fouten. 2 punten: nauwelijks of geen fouten. Fouten tegen het woordgeslacht mogen voorkomen.',
			extraAspects:
				'Spelling: 0 = veel spelfouten, 1 = nauwelijks of geen. Samenhang: 0 = nauwelijks samenhang, 1 = duidelijke samenhang. Woordgebruik: 0 = niet adequaat, 1 = adequaat.'
		},
		maxPoints: 8
	},
	{
		id: 'sch_2024_10',
		year: 2024,
		taskNumber: 10,
		type: 'deelschrijftaak',
		title: 'Afschaffen jaarlijkse sportdag',
		scenario:
			'U zit in de studentenraad van ROC Boenswijk. De directie heeft dit jaar een plan gemaakt om geld te besparen. In het plan staat dat ze de jaarlijkse sportdag van het ROC willen afschaffen. De studentenraad is het niet eens met dit deel van het plan. U schrijft een e-mail namens de studentenraad naar de directie.\n\nOpdracht:\n- U schrijft waar de studentenraad het niet mee eens is.\n- U legt uit waarom de studentenraad het hier niet mee eens is. U geeft minimaal twee redenen.\n- U noemt minimaal een oplossing om de jaarlijkse sportdag te kunnen behouden.\n- U doet een voorstel voor een gesprek met de directie.\n\nU mag de informatie zelf verzinnen.\nHet doel van de e-mail is de directie ervan te overtuigen het plan voor het afschaffen van de jaarlijkse sportdag niet door te voeren.',
		partialText:
			'Geachte heer, mevrouw,\n\nGraag wil ik namens de studentenraad reageren op het plan om de jaarlijkse sportdag af te schaffen.\n\n___\n\nMet vriendelijke groet,',
		gradingCriteria: {
			adequacy:
				'De tekst wordt beoordeeld als acceptabel wanneer de schrijver: schrijft waar de studentenraad het niet mee eens is; uitlegt waarom met minimaal twee redenen; minimaal een oplossing noemt om de sportdag te behouden; een voorstel doet voor een gesprek met de directie.',
			grammar:
				'0 punten: veel grammaticale fouten. 1 punt: enkele fouten. 2 punten: nauwelijks of geen fouten. Fouten tegen het woordgeslacht mogen voorkomen.',
			extraAspects:
				'Spelling: 0 = veel spelfouten, 1 = nauwelijks of geen. Samenhang: 0 = nauwelijks samenhang, 1 = duidelijke samenhang. Woordgebruik: 0 = niet adequaat, 1 = adequaat.'
		},
		maxPoints: 8
	},

	// ---- Korte schrijftaak 11-12 ----
	{
		id: 'sch_2024_11',
		year: 2024,
		taskNumber: 11,
		type: 'korte_schrijftaak',
		title: 'Wijziging planning transportbedrijf De Graaf',
		scenario:
			'U werkt als medewerker planning bij transportbedrijf De Graaf. Binnenkort viert het bedrijf zijn 25-jarig bestaan. U hebt daarom de planning van chauffeur Andreas eenmalig moeten aanpassen.\n\nTabel 1: Oude planning Andreas\nMa ochtend: Intechno B.V. | Di ochtend: Intechno B.V. | Wo: VRIJ | Do ochtend: Intechno B.V. | Vr ochtend: Intechno B.V.\nMa middag: Digitel | Di middag: VRIJ | Wo: VRIJ | Do middag: Digitel | Vr middag: Digitel\n\nTabel 2: Nieuwe planning Andreas\nMa ochtend: Intechno B.V. | Di ochtend: Intechno B.V. | Wo ochtend: Intechno B.V. | Do ochtend: Intechno B.V. | Vr: FEEST\nMa middag: Digitel | Di middag: VRIJ | Wo middag: Digitel | Do middag: Digitel | Vr: FEEST\n\nOpdracht:\n- U legt uit waarom u schrijft en waarom de planning is veranderd.\n- U beschrijft alle veranderingen in de planning (gebruik tabel 1 en 2).\n- U vraagt akkoord voor de veranderingen.\n- U legt uit wat de chauffeur kan doen als hij het niet eens is (zelf verzinnen).\n- U schrijft wanneer u een reactie verwacht (zelf verzinnen).\n\nHet doel is Andreas te informeren over de veranderingen in de planning. De tabel komt bij uw tekst.',
		partialText: 'Beste Andreas,\n\n___\n\nMet vriendelijke groeten,',
		gradingCriteria: {
			adequacy:
				'De tekst wordt beoordeeld als acceptabel wanneer de schrijver: uitlegt waarom hij schrijft en waarom de planning is veranderd; alle veranderingen beschrijft met de tabellen; akkoord vraagt; uitlegt wat de chauffeur kan doen als hij het niet eens is; schrijft wanneer hij een reactie verwacht. De tabel komt bij de tekst.',
			grammar:
				'0 punten: veel grammaticale fouten. 1 punt: enkele fouten. 2 punten: nauwelijks of geen fouten. Fouten tegen het woordgeslacht mogen voorkomen.',
			extraAspects:
				'Spelling: 0 = veel spelfouten, 1 = nauwelijks of geen. Samenhang: 0 = nauwelijks samenhang, 1 = duidelijke samenhang. Woordgebruik: 0 = niet adequaat, 1 = adequaat.'
		},
		maxPoints: 8
	},
	{
		id: 'sch_2024_12',
		year: 2024,
		taskNumber: 12,
		type: 'korte_schrijftaak',
		title: 'Stage bakker Vonk',
		scenario:
			'U volgt een bakkersopleiding aan ROC Hintham. U loopt stage bij bakker Vonk. De opleiding heeft u gevraagd een tekst over uw stage te schrijven voor nieuwe studenten. De tekst komt op de website van de opleiding.\n\nOpdracht:\n- U legt uit waarom u schrijft.\n- U schrijft bij welke bakker u stage loopt.\n- U schrijft hoelang uw stage duurt (zelf verzinnen).\n- U beschrijft een stagedag bij de bakker.\n- U schrijft wat u leuk vindt aan uw stage en waarom (zelf verzinnen).\n- U schrijft wat u minder leuk vindt aan uw stage en waarom (zelf verzinnen).\n- U schrijft of u de stage aanraadt aan nieuwe studenten en waarom (zelf verzinnen).\n\nHet doel is nieuwe studenten te informeren over uw stage bij bakker Vonk.',
		partialText: 'Stage bakker Vonk\n\n___',
		gradingCriteria: {
			adequacy:
				'De tekst wordt beoordeeld als acceptabel wanneer de schrijver: uitlegt waarom hij schrijft; schrijft bij welke bakker hij stage loopt; schrijft hoelang de stage duurt; een stagedag beschrijft; schrijft wat hij leuk en minder leuk vindt met uitleg; schrijft of hij de stage aanraadt met uitleg. Het doel is nieuwe studenten te informeren.',
			grammar:
				'0 punten: veel grammaticale fouten. 1 punt: enkele fouten. 2 punten: nauwelijks of geen fouten. Fouten tegen het woordgeslacht mogen voorkomen.',
			extraAspects:
				'Spelling: 0 = veel spelfouten, 1 = nauwelijks of geen. Samenhang: 0 = nauwelijks samenhang, 1 = duidelijke samenhang. Woordgebruik: 0 = niet adequaat, 1 = adequaat.'
		},
		maxPoints: 8
	}
];

// ============================================================
// 2023 TASKS
// ============================================================

const TASKS_2023: SchrijvenTask[] = [
	// ---- Zinstaak 1-8 ----
	{
		id: 'sch_2023_1',
		year: 2023,
		taskNumber: 1,
		type: 'zinstaak',
		title: 'Nieuwe computer voor opleiding',
		scenario:
			'U bent op zoek naar een nieuwe computer die u wilt gebruiken voor uw opleiding Administratief medewerker. U stuurt een e-mail naar computerwinkel Computer&Co.',
		partialText:
			'Geachte heer, mevrouw,\n\nVoor mijn opleiding Administratief medewerker wil ik een nieuwe computer kopen. Ik zoek een computer met een groot beeldscherm. Ook ___\n\nWelke computer raadt u mij aan?\n\nMet vriendelijke groet,',
		gradingCriteria: {
			adequacy: 'De schrijver noemt een kenmerk waaraan zijn nieuwe computer moet voldoen.',
			grammar: 'De schrijver produceert een hoofdzin met inversie.'
		},
		maxPoints: 2
	},
	{
		id: 'sch_2023_2',
		year: 2023,
		taskNumber: 2,
		type: 'zinstaak',
		title: 'Laatste werkdag Melvin',
		scenario:
			'U werkt bij tandartspraktijk Diederiksen & Knoops. U stuurt een e-mail naar een collega.',
		partialText:
			'Hoi Trudy,\n\nVolgende maand heeft Melvin zijn laatste werkdag bij ons. Het lijkt me leuk om ___\n\nWil jij me hierbij helpen?\n\nMet vriendelijke groet,',
		gradingCriteria: {
			adequacy: 'De schrijver doet een voorstel met betrekking tot de laatste werkdag van Melvin.',
			grammar: "De schrijver produceert een 'te + infinitief'-constructie."
		},
		maxPoints: 2
	},
	{
		id: 'sch_2023_3',
		year: 2023,
		taskNumber: 3,
		type: 'zinstaak',
		title: 'Vraag over toets',
		scenario:
			'U volgt de opleiding tot kapper aan het ROC van Zeist. U stuurt een e-mail naar uw medestudenten.',
		partialText:
			'Hoi allemaal,\n\nIk heb meneer Kramer vandaag gemaild met onze vraag over de toets van maandag. Ik laat het jullie weten, zodra ___\n\nGroet,',
		gradingCriteria: {
			adequacy: 'De schrijver beschrijft wanneer zijn medestudenten meer van hem horen.',
			grammar: 'De schrijver produceert een bijzin.'
		},
		maxPoints: 2
	},
	{
		id: 'sch_2023_4',
		year: 2023,
		taskNumber: 4,
		type: 'zinstaak',
		title: 'Teruggestuurde rok',
		scenario:
			'U werkt bij de klantenservice van de online kledingwinkel Otterloo. U stuurt een e-mail naar een klant.',
		partialText:
			'Beste mevrouw Janssen,\n\nBedankt voor het terugsturen van de rok. Jammer dat u de rok niet mooi vond. De teruggestuurde rok is helaas kapot, dus ___\n\nWe hopen u hiermee voldoende te hebben ge\u00efnformeerd.\n\nMet vriendelijke groet,',
		gradingCriteria: {
			adequacy:
				'De schrijver beschrijft een gevolg van het feit dat de teruggestuurde rok kapot is.',
			grammar: 'De schrijver produceert een hoofdzin, al dan niet met inversie.'
		},
		maxPoints: 2
	},
	{
		id: 'sch_2023_5',
		year: 2023,
		taskNumber: 5,
		type: 'zinstaak',
		title: 'Opdracht fotografie',
		scenario:
			'U volgt de opleiding fotografie aan ROC Winterswijk. U stuurt een e-mail naar uw vrienden.',
		partialText:
			"Hallo allemaal,\n\nIk moet voor mijn opleiding een aantal foto's maken van mensen met hun muziekinstrument. ___\n\nIk hoor graag van jullie!\n\nGroetjes,",
		gradingCriteria: {
			adequacy:
				"De schrijver stelt een vraag of doet een verzoek met betrekking tot het maken van de foto's.",
			grammar: 'Geen specifieke opmerkingen.'
		},
		maxPoints: 2
	},
	{
		id: 'sch_2023_6',
		year: 2023,
		taskNumber: 6,
		type: 'zinstaak',
		title: 'Sportcentrum U-Move',
		scenario:
			'U werkt bij sportcentrum U-Move. U plaatst een nieuwsbericht op de website van het bedrijf.',
		partialText:
			'LET OP: Vanaf nu elke dag tot 23:00 uur open!\n\nBeste leden,\n\nWe zijn vanaf nu elke dag langer open, tot 23:00 uur. Hebt u hier vragen over? ___\n\nU kunt ons ook telefonisch bereiken op nummer 072 - 3438107.\n\nGroet,\nTeam U-Move',
		gradingCriteria: {
			adequacy:
				'De schrijver doet een mededeling aan de leden van sportcentrum U-Move met betrekking tot het stellen van vragen.',
			grammar: 'Geen specifieke opmerkingen.'
		},
		maxPoints: 2
	},
	{
		id: 'sch_2023_7',
		year: 2023,
		taskNumber: 7,
		type: 'zinstaak',
		title: 'Tips voor vrienden uit Finland',
		scenario:
			'U woont in Leersum. U hebt vrienden in Finland. Uw vrienden gaan binnenkort naar Nederland verhuizen. U plaatst een bericht op een website voor huurhuizen.',
		partialText:
			'Onderwerp: Tips voor vrienden uit Finland\n\nVrienden van mij, uit Finland, komen over twee maanden in Nederland wonen. ___\n\nZe willen daarvoor maximaal \u20AC 900,- per maand betalen.\n\nHeeft iemand tips?',
		gradingCriteria: {
			adequacy:
				'De schrijver geeft aan waar zijn Finse vrienden naar op zoek zijn en waarvoor ze maximaal \u20AC 900 per maand willen betalen.',
			grammar: 'Geen specifieke opmerkingen.'
		},
		maxPoints: 2
	},
	{
		id: 'sch_2023_8',
		year: 2023,
		taskNumber: 8,
		type: 'zinstaak',
		title: 'Tuinshow Nijkerk',
		scenario: "U werkt bij tuincentrum Mikkers. U stuurt een e-mail naar uw collega's.",
		partialText:
			"Beste collega's,\n\nWe hebben over twee weken een uitstapje naar een grote tuinshow in Nijkerk. ___\n\nIedereen zou daarom mee moeten gaan. Hopelijk tot dan!\n\nGroeten,",
		gradingCriteria: {
			adequacy:
				'De schrijver geeft een reden waarom iedereen mee zou moeten gaan met het uitstapje.',
			grammar: 'Geen specifieke opmerkingen.'
		},
		maxPoints: 2
	},

	// ---- Deelschrijftaak 9-10 ----
	{
		id: 'sch_2023_9',
		year: 2023,
		taskNumber: 9,
		type: 'deelschrijftaak',
		title: 'Presentatie Nederlands',
		scenario:
			'U volgt de opleiding Bouwkunde aan ROC De Wielewaal. U stuurt een e-mail naar uw docent over de presentatie Nederlands die u moet geven. U wilt de datum van uw presentatie verzetten.\n\nOpdracht:\n- U schrijft wanneer u de presentatie moet geven.\n- U geeft aan wanneer u de presentatie liever wilt geven.\n- U legt uit waarom het verzetten van de datum belangrijk is voor u.\n- U schrijft wat u verwacht van de docent.\n\nU mag de informatie zelf verzinnen.\nHet doel van de e-mail is uw docent toestemming te vragen de presentatie Nederlands later te doen.',
		partialText:
			'Beste meneer Van Rijn,\n\nIk heb een vraag over mijn presentatie.\n\n___\n\nVriendelijke groet,',
		gradingCriteria: {
			adequacy:
				'De tekst wordt beoordeeld als acceptabel wanneer de schrijver: schrijft wanneer hij de presentatie moet geven; aangeeft wanneer hij liever wil geven; uitlegt waarom het verzetten belangrijk is; schrijft wat hij verwacht van de docent. Het doel is de docent toestemming te vragen.',
			grammar:
				'0 punten: veel grammaticale fouten. 1 punt: enkele fouten. 2 punten: nauwelijks of geen fouten. Fouten tegen het woordgeslacht mogen voorkomen.',
			extraAspects:
				'Spelling: 0 = veel spelfouten, 1 = nauwelijks of geen. Samenhang: 0 = nauwelijks samenhang, 1 = duidelijke samenhang. Woordgebruik: 0 = niet adequaat, 1 = adequaat.'
		},
		maxPoints: 8
	},
	{
		id: 'sch_2023_10',
		year: 2023,
		taskNumber: 10,
		type: 'deelschrijftaak',
		title: "Vragenlijst 'boodschappen doen'",
		scenario:
			'U doet altijd boodschappen bij supermarkt Het Hoekje. De eigenaar van de supermarkt heeft u gevraagd een vragenlijst in te vullen over zijn supermarkt. U vult de vragenlijst in.\n\nVul het formulier volledig in. U mag de informatie zelf verzinnen.',
		partialText:
			"Vragenlijst 'boodschappen doen'\n\n1. Hoeveel keer per week komt u naar supermarkt Het Hoekje?\n2. Hoe komt u naar de supermarkt Het Hoekje (lopend/fiets/auto/bus)? Leg ook uit waarom.\n3. Wat vindt u goed aan supermarkt Het Hoekje? Leg ook uit waarom.\n4. Wat vindt u niet goed aan supermarkt Het Hoekje? Leg ook uit waarom.\n5. Leest u onze reclamefolder? Leg ook uit waarom wel of niet.\n\nBedankt voor het invullen!",
		gradingCriteria: {
			adequacy:
				'De tekst wordt beoordeeld als acceptabel wanneer het formulier volledig is ingevuld. Wanneer slechts aan een gedeelte van de opdracht is voldaan, kunnen maximaal 2 punten toegekend worden.',
			grammar:
				'0 punten: veel grammaticale fouten. 1 punt: enkele fouten. 2 punten: nauwelijks of geen fouten. Fouten tegen het woordgeslacht mogen voorkomen.',
			extraAspects:
				'Spelling: 0 = veel spelfouten, 1 = nauwelijks of geen. Woordgebruik: 0 = niet adequaat, 1 = adequaat.'
		},
		maxPoints: 7
	},

	// ---- Korte schrijftaak 11-12 ----
	{
		id: 'sch_2023_11',
		year: 2023,
		taskNumber: 11,
		type: 'korte_schrijftaak',
		title: 'Stage kraamzorg Spaas',
		scenario:
			'U volgt de opleiding Kraamzorg aan ROC IJmuiden. Als medewerker in de kraamzorg leert en helpt u ouders hun nieuwe baby te verzorgen. U hebt een dag stage gelopen bij kraamzorg Spaas. Tijdens deze stagedag hebt u verschillende taken mogen uitvoeren.\n\nDe stagebegeleider van uw opleiding heeft u gevraagd een verslag te schrijven over uw ervaringen.\n\nOpdracht:\n- U legt uit waarom u schrijft.\n- U beschrijft de stagedag.\n- U legt uit welke taak u het leukst vond en waarom (zelf verzinnen).\n- U legt uit welke taak u minder leuk vond en waarom (zelf verzinnen).\n- U schrijft of u de stage aanraadt aan andere studenten en waarom (zelf verzinnen).\n\nHet doel van het verslag is uw stagebegeleider te informeren over uw ervaringen.',
		partialText: 'Stage kraamzorg Spaas\n\n___',
		gradingCriteria: {
			adequacy:
				'De tekst wordt beoordeeld als acceptabel wanneer de schrijver: uitlegt waarom hij schrijft; de stagedag beschrijft; uitlegt welke taak het leukst was en waarom; uitlegt welke taak minder leuk was en waarom; schrijft of hij de stage aanraadt met uitleg. Het doel is de stagebegeleider te informeren.',
			grammar:
				'0 punten: veel grammaticale fouten. 1 punt: enkele fouten. 2 punten: nauwelijks of geen fouten. Fouten tegen het woordgeslacht mogen voorkomen.',
			extraAspects:
				'Spelling: 0 = veel spelfouten, 1 = nauwelijks of geen. Samenhang: 0 = nauwelijks samenhang, 1 = duidelijke samenhang. Woordgebruik: 0 = niet adequaat, 1 = adequaat.'
		},
		maxPoints: 8
	},
	{
		id: 'sch_2023_12',
		year: 2023,
		taskNumber: 12,
		type: 'korte_schrijftaak',
		title: 'Sollicitatie taxichauffeur',
		scenario:
			'U bent op zoek naar werk als taxichauffeur. Een taxichauffeur vervoert mensen met een auto naar verschillende plekken. U ziet een vacature op de website www.vacatures.nl.\n\nTaxibedrijf Logi zoekt: Taxichauffeur (m/v)\nVoor het vervoeren van mensen in de omgeving Utrecht.\nWerktijden: 09:00 tot 17:00 uur\nSalaris: te bespreken\nInteresse? Stuur een brief naar: mevrouw Groen, Vinkenlaan 254, 5829 BA Utrecht\n\nOpdracht:\n- U schrijft naar welke functie u solliciteert.\n- U legt uit waarom u naar deze functie solliciteert. U noemt minimaal twee redenen.\n- U beschrijft uw werkervaring. U noemt minimaal een voorbeeld.\n- U schrijft waarom u geschikt bent voor deze functie. U noemt minimaal twee redenen.\n- U vraagt om een gesprek.\n\nU mag de informatie zelf verzinnen.\nHet doel van de tekst is het taxibedrijf Logi ervan te overtuigen u uit te nodigen voor een sollicitatiegesprek.',
		partialText: 'Beste mevrouw Groen,\n\n___\n\nMet vriendelijke groet,',
		gradingCriteria: {
			adequacy:
				'De tekst wordt beoordeeld als acceptabel wanneer de schrijver: schrijft naar welke functie hij solliciteert; uitlegt waarom met minimaal twee redenen; zijn werkervaring beschrijft met minimaal een voorbeeld; schrijft waarom hij geschikt is met minimaal twee redenen; om een gesprek vraagt. Het doel is het taxibedrijf te overtuigen hem uit te nodigen.',
			grammar:
				'0 punten: veel grammaticale fouten. 1 punt: enkele fouten. 2 punten: nauwelijks of geen fouten. Fouten tegen het woordgeslacht mogen voorkomen.',
			extraAspects:
				'Spelling: 0 = veel spelfouten, 1 = nauwelijks of geen. Samenhang: 0 = nauwelijks samenhang, 1 = duidelijke samenhang. Woordgebruik: 0 = niet adequaat, 1 = adequaat.'
		},
		maxPoints: 8
	}
];

// ============================================================
// PRACTICE TASKS (Scaffolded, Ranks 0-2)
// Simpler prompts that build toward NT2 B1 level.
// Graded by boyfriend same as exam tasks.
// ============================================================

const TASKS_PRACTICE: SchrijvenTask[] = [
	// ---- RANK 0: Very basic. Simple sentences, informal. ----
	{
		id: 'sch_p_0_1',
		year: 0,
		rank: 0,
		taskNumber: 1,
		type: 'zinstaak',
		title: 'Jezelf voorstellen',
		scenario: 'Je schrijft een bericht aan een nieuwe buurvrouw.',
		partialText: 'Hallo!\n\nIk ben je nieuwe buurman/buurvrouw. ___\n\nTot snel!',
		gradingCriteria: {
			adequacy:
				'De schrijver stelt zichzelf voor: naam, waar hij/zij woont, en eventueel wat hij/zij doet (werk of studie).',
			grammar:
				'De schrijver produceert minimaal 3 zinnen met correct gebruik van het werkwoord "zijn" en "wonen".'
		},
		maxPoints: 2
	},
	{
		id: 'sch_p_0_2',
		year: 0,
		rank: 0,
		taskNumber: 2,
		type: 'zinstaak',
		title: 'Boodschappenlijstje',
		scenario: 'Je stuurt een berichtje naar je huisgenoot over boodschappen.',
		partialText: 'Hoi,\n\nIk ga naar de supermarkt. Wij hebben ___ nodig.\n\nTot straks!',
		gradingCriteria: {
			adequacy: 'De schrijver noemt minimaal 3 dingen die nodig zijn uit de supermarkt.',
			grammar: 'De schrijver gebruikt correct de lidwoorden (de/het) of "geen" bij de producten.'
		},
		maxPoints: 2
	},
	{
		id: 'sch_p_0_3',
		year: 0,
		rank: 0,
		taskNumber: 3,
		type: 'zinstaak',
		title: 'Niet naar het feest',
		scenario: 'Een vriend(in) nodigt je uit voor een feest. Je kunt niet komen.',
		partialText:
			'Hoi!\n\nBedankt voor de uitnodiging, maar ik kan helaas niet komen, want ___\n\nVeel plezier!',
		gradingCriteria: {
			adequacy: 'De schrijver geeft een reden waarom hij/zij niet kan komen.',
			grammar: 'De schrijver produceert een hoofdzin met "want" gevolgd door een reden.'
		},
		maxPoints: 2
	},
	{
		id: 'sch_p_0_4',
		year: 0,
		rank: 0,
		taskNumber: 4,
		type: 'zinstaak',
		title: 'Mijn huisdier',
		scenario: 'Je schrijft een kort berichtje over je huisdier aan een vriend(in).',
		partialText: 'Hoi!\n\nIk heb een nieuw huisdier! ___\n\nGroetjes!',
		gradingCriteria: {
			adequacy:
				'De schrijver beschrijft het huisdier: wat voor dier het is, hoe het heet, en hoe het eruitziet.',
			grammar: 'De schrijver gebruikt correct "hebben" en bijvoeglijke naamwoorden.'
		},
		maxPoints: 2
	},
	{
		id: 'sch_p_0_5',
		year: 0,
		rank: 0,
		taskNumber: 5,
		type: 'deelschrijftaak',
		title: 'Mijn weekend',
		scenario: 'Je schrijft een berichtje aan een klasgenoot over je weekend.',
		partialText: 'Hoi!\n\nMijn weekend was ___\n\nEn jij? Wat heb jij gedaan?\n\nGroetjes!',
		gradingCriteria: {
			adequacy: 'De schrijver beschrijft minimaal 2 activiteiten van het weekend.',
			grammar: 'De schrijver gebruikt het werkwoord correct in de tegenwoordige of verleden tijd.'
		},
		maxPoints: 3
	},
	{
		id: 'sch_p_0_6',
		year: 0,
		rank: 0,
		taskNumber: 6,
		type: 'deelschrijftaak',
		title: 'De weg vragen',
		scenario:
			'Je bent verdwaald. Je stuurt een berichtje naar een vriend(in) die in de buurt woont.',
		partialText:
			'Hoi!\n\nIk ben in de buurt van het station, maar ik kan jouw huis niet vinden. ___\n\nTot zo!',
		gradingCriteria: {
			adequacy: 'De schrijver vraagt om hulp met de route en beschrijft waar hij/zij nu is.',
			grammar:
				'De schrijver gebruikt correct vraagzinnen en plaatsaanduidingen (bij, naast, op, in).'
		},
		maxPoints: 3
	},

	// ---- RANK 1: Informal but more structure needed. ----
	{
		id: 'sch_p_1_1',
		year: 0,
		rank: 1,
		taskNumber: 1,
		type: 'zinstaak',
		title: 'Plantjes water geven',
		scenario: 'Je gaat een week op vakantie. Je stuurt een berichtje naar je buurman.',
		partialText:
			'Hoi Jan,\n\nIk ga volgende week op vakantie. Zou je misschien mijn plantjes water willen geven? ___\n\nAlvast bedankt!\n\nGroetjes,',
		gradingCriteria: {
			adequacy:
				'De schrijver legt uit wanneer hij/zij weggaat en terugkomt, en waar de sleutel is of hoe de buurman binnen kan komen.',
			grammar:
				'De schrijver gebruikt correct een tijdsaanduiding en het modale werkwoord "kunnen" of "willen".'
		},
		maxPoints: 2
	},
	{
		id: 'sch_p_1_2',
		year: 0,
		rank: 1,
		taskNumber: 2,
		type: 'zinstaak',
		title: 'Afspraak verplaatsen',
		scenario: 'Je hebt een afspraak met een vriend(in) op donderdag, maar dat lukt niet meer.',
		partialText:
			'Hoi!\n\nOnze afspraak van donderdag kan ik helaas niet meer halen. ___\n\nIs dat goed?\n\nGroetjes,',
		gradingCriteria: {
			adequacy:
				'De schrijver geeft een reden waarom donderdag niet lukt en stelt een andere dag of tijd voor.',
			grammar:
				'De schrijver gebruikt correct een bijzin met "omdat" of "want" en een voorstel met "kunnen".'
		},
		maxPoints: 2
	},
	{
		id: 'sch_p_1_3',
		year: 0,
		rank: 1,
		taskNumber: 3,
		type: 'deelschrijftaak',
		title: 'Klacht over lawaai',
		scenario: 'Je buurman maakt elke avond veel lawaai. Je schrijft hem een vriendelijk berichtje.',
		partialText:
			'Beste buurman,\n\n___\n\nIk hoop dat we hier samen een oplossing voor kunnen vinden.\n\nMet vriendelijke groet,',
		gradingCriteria: {
			adequacy:
				'De schrijver beschrijft het probleem (lawaai), wanneer het gebeurt, en vraagt beleefd of de buurman er iets aan kan doen.',
			grammar:
				'De schrijver gebruikt beleefdheidsvormen en correcte zinsbouw met minimaal 4 zinnen.'
		},
		maxPoints: 3
	},
	{
		id: 'sch_p_1_4',
		year: 0,
		rank: 1,
		taskNumber: 4,
		type: 'deelschrijftaak',
		title: 'Cadeau-advies',
		scenario:
			'Een vriend(in) is jarig. Je stuurt een berichtje naar een andere vriend om samen een cadeau te kiezen.',
		partialText:
			'Hoi!\n\nWeet je dat Anna volgende week jarig is? ___\n\nLaat me weten wat je denkt!\n\nGroetjes,',
		gradingCriteria: {
			adequacy:
				'De schrijver doet minimaal 2 suggesties voor een cadeau en vraagt om de mening van de ander.',
			grammar:
				'De schrijver gebruikt correct de vergrotende trap of "leuker dan" / "beter dan" bij het vergelijken.'
		},
		maxPoints: 3
	},
	{
		id: 'sch_p_1_5',
		year: 0,
		rank: 1,
		taskNumber: 5,
		type: 'deelschrijftaak',
		title: 'Recept delen',
		scenario: 'Je hebt een lekker gerecht gemaakt. Een vriend(in) vraagt om het recept.',
		partialText:
			'Hoi!\n\nJe vroeg om mijn recept. Hier is het:\n\n___\n\nSmakelijk eten!\n\nGroetjes,',
		gradingCriteria: {
			adequacy:
				'De schrijver noemt de ingrediënten en beschrijft de stappen om het gerecht te maken.',
			grammar:
				'De schrijver gebruikt correct de gebiedende wijs (imperatief) of infinitief bij de stappen.'
		},
		maxPoints: 3
	},
	{
		id: 'sch_p_1_6',
		year: 0,
		rank: 1,
		taskNumber: 6,
		type: 'korte_schrijftaak',
		title: 'Mijn favoriete plek',
		scenario:
			'Je schrijft een kort stukje voor de nieuwsbrief van je buurt over je favoriete plek in de stad.',
		partialText: 'Mijn favoriete plek in de stad\n\n___',
		gradingCriteria: {
			adequacy:
				'De schrijver beschrijft een plek: waar het is, hoe het eruitziet, waarom het zijn favoriete plek is, en wat je er kunt doen.',
			grammar:
				'De schrijver produceert minimaal 5 zinnen met correct gebruik van bijvoeglijke naamwoorden en plaatsvoorzetsels.',
			extraAspects: 'Samenhang: de tekst leest als een geheel en niet als losse zinnen.'
		},
		maxPoints: 5
	},

	// ---- RANK 2: Semi-formal, bridging to B1. ----
	{
		id: 'sch_p_2_1',
		year: 0,
		rank: 2,
		taskNumber: 1,
		type: 'zinstaak',
		title: 'Sportschool opzeggen',
		scenario: 'Je wilt je abonnement bij de sportschool opzeggen. Je stuurt een e-mail.',
		partialText:
			'Geachte heer/mevrouw,\n\nIk wil graag mijn abonnement opzeggen, omdat ___\n\nKunt u bevestigen dat het abonnement stopt?\n\nMet vriendelijke groet,',
		gradingCriteria: {
			adequacy: 'De schrijver geeft een reden voor de opzegging.',
			grammar: 'De schrijver produceert een bijzin met "omdat" en correct werkwoord aan het einde.'
		},
		maxPoints: 2
	},
	{
		id: 'sch_p_2_2',
		year: 0,
		rank: 2,
		taskNumber: 2,
		type: 'zinstaak',
		title: 'Pakketje kwijt',
		scenario:
			'Je hebt online iets besteld, maar het pakketje is niet aangekomen. Je stuurt een e-mail naar de webwinkel.',
		partialText:
			'Geachte heer/mevrouw,\n\nOp 15 maart heb ik een bestelling geplaatst (ordernummer: 45231). Het pakketje zou vorige week aankomen, maar ___\n\nKunt u dit uitzoeken?\n\nMet vriendelijke groet,',
		gradingCriteria: {
			adequacy:
				'De schrijver beschrijft het probleem: het pakketje is niet aangekomen en/of er is iets anders misgegaan.',
			grammar: 'De schrijver gebruikt correct de voltooide tijd en een tijdsaanduiding.'
		},
		maxPoints: 2
	},
	{
		id: 'sch_p_2_3',
		year: 0,
		rank: 2,
		taskNumber: 3,
		type: 'deelschrijftaak',
		title: 'Ziekmelding',
		scenario: 'Je bent ziek en kunt vandaag niet naar je werk. Je stuurt een e-mail naar je baas.',
		partialText:
			'Beste mevrouw de Vries,\n\n___\n\nIk hoop morgen weer te kunnen komen.\n\nMet vriendelijke groet,',
		gradingCriteria: {
			adequacy:
				'De schrijver meldt zich ziek, beschrijft kort wat er aan de hand is, en geeft aan wat er met eventuele afspraken of taken moet gebeuren.',
			grammar:
				'De schrijver gebruikt correct de tegenwoordige en voltooide tijd en ten minste een modale constructie (kunnen, moeten).'
		},
		maxPoints: 3
	},
	{
		id: 'sch_p_2_4',
		year: 0,
		rank: 2,
		taskNumber: 4,
		type: 'deelschrijftaak',
		title: 'Cursus aanbevelen',
		scenario:
			'Je hebt een cursus gevolgd die je erg leuk vond. Een collega overweegt dezelfde cursus te volgen. Je stuurt een e-mail.',
		partialText:
			'Hoi Thomas,\n\nIk hoorde dat je de cursus overweegt. ___\n\nIk hoop dat dit helpt!\n\nGroetjes,',
		gradingCriteria: {
			adequacy:
				'De schrijver beschrijft wat de cursus inhoudt, waarom het leuk/nuttig was, en geeft advies aan de collega.',
			grammar:
				'De schrijver gebruikt correct de voltooide tijd om over de ervaring te vertellen en een adviesvorm (zou, moeten, aanraden).'
		},
		maxPoints: 3
	},
	{
		id: 'sch_p_2_5',
		year: 0,
		rank: 2,
		taskNumber: 5,
		type: 'korte_schrijftaak',
		title: 'Klacht restaurant',
		scenario:
			'Je bent gisteren in een restaurant geweest. Het eten was slecht en de bediening was onvriendelijk. Je schrijft een klachtbrief aan het restaurant.',
		partialText:
			'Geachte heer/mevrouw,\n\n___\n\nIk verwacht een reactie.\n\nMet vriendelijke groet,',
		gradingCriteria: {
			adequacy:
				'De schrijver beschrijft wanneer het bezoek was, wat er mis was met het eten en/of de bediening, en wat hij/zij verwacht (excuses, compensatie).',
			grammar:
				'De schrijver gebruikt correct de verleden tijd en voltooide tijd, en formeel taalgebruik.',
			extraAspects:
				'Samenhang: logische opbouw van klacht. Woordgebruik: passend bij een formele brief.'
		},
		maxPoints: 5
	},
	{
		id: 'sch_p_2_6',
		year: 0,
		rank: 2,
		taskNumber: 6,
		type: 'korte_schrijftaak',
		title: 'Uitnodiging buurtfeest',
		scenario: 'Je organiseert een buurtfeest. Je schrijft een uitnodiging voor alle buren.',
		partialText:
			'Beste buren,\n\n___\n\nWe hopen jullie allemaal te zien!\n\nGroetjes van het buurtcomité',
		gradingCriteria: {
			adequacy:
				'De schrijver noemt: wat het feest is, wanneer en waar het is, wat er te doen is (activiteiten, eten/drinken), en of buren iets mee moeten nemen.',
			grammar:
				'De schrijver gebruikt correct de toekomende tijd (gaan/zullen) en uitnodigende zinnen.',
			extraAspects:
				'Samenhang: de uitnodiging leest als een geheel met alle praktische informatie. Woordgebruik: vriendelijk en enthousiast.'
		},
		maxPoints: 5
	}
];

// ============================================================
// EXPORTS
// ============================================================

export const TASKS: SchrijvenTask[] = [
	...TASKS_PRACTICE,
	...TASKS_2025,
	...TASKS_2024,
	...TASKS_2023
];

export function getTasksByYear(year: number): SchrijvenTask[] {
	return TASKS.filter((t) => t.year === year);
}

export function getTasksByRank(rank: number): SchrijvenTask[] {
	return TASKS.filter((t) => t.year === 0 && t.rank === rank);
}

export function getTasksByType(type: SchrijvenTaskType): SchrijvenTask[] {
	return TASKS.filter((t) => t.type === type);
}

export function getTaskById(id: string): SchrijvenTask | undefined {
	return TASKS.find((t) => t.id === id);
}
