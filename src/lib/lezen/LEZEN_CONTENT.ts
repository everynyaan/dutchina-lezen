// ============================================================
// LEZEN CONTENT - NT2 Programma I (2023-2025)
// 105 questions, 18 passages. Text inline for sentence-level TTS.
// Official source: CvTE Openbaar examen Lezen I beoordelingsmodellen
// 2023–2025 (passage list + antwoordsleutel). Option stems belong in
// the tekst-/opgavenboekje — most items here still only have A–C.
// ============================================================

import { examsWithSupplied } from './suppliedPapers';
import type { LezenExam, LezenQuestion, LezenAnswer } from './types';

function q(
	year: number,
	vraag: number,
	question: string,
	options: Record<string, string>,
	answer: LezenAnswer
): LezenQuestion {
	return { id: `lezen-${year}-${vraag}`, vraag, question, options, answer };
}

export const LEZEN_2025: LezenExam = {
	year: 2025,
	totalQuestions: 35,
	passingScore: 24,
	passages: [
		{
			name: 'Ruud wordt rij-instructeur',
			slug: 'ruud-rij-instructeur',
			intro:
				'Deze tekst komt van een website over werken en gezondheid. De tekst gaat over de omscholing van Ruud.',
			text: 'Ruud wordt rij-instructeur\n\nRuud Kaag is timmerman en al sinds zijn 17e werkzaam in de bouwsector. Zijn beroep als timmerman heeft hij 45 jaar uitgevoerd. Binnenkort stopt hij echter bij zijn huidige werkgever. Ondertussen volgt hij een opleiding tot rij-instructeur. Een hele omslag op die leeftijd, maar voor Ruud was er geen andere optie. “Mijn lichaam wil niet meer. Op dit moment zit ik in de ziektewet, ik heb last van mijn botten.” Ruud kreeg bij zijn omscholing hulp van zowel werkgever Jeurissen als van adviescentrum Valedo.\n\nGrip op eigen loopbaan\n\nRuud nam het initiatief tot omscholing zelf. “Voor de kerst zei ik tegen mijn vrouw: het gaat niet meer. Ik las op internet een advertentie voor een opleiding tot rij-instructeur. De cursus startte begin dit jaar. Toen ben ik ook in gesprek gegaan met Joke Hermans, personeelsadviseur bij Jeurissen, met de mededeling dat ik binnenkort wil stoppen. Ik ga dan met vervroegd pensioen. Maar ik ben geen stilzitter, dus mijn baan als rij-instructeur doe ik er gewoon naast.” Joke noemt Ruud een prachtig voorbeeld van iemand die regie pakt op zijn loopbaan. “Ondanks dat Ruud ons wat later in het proces heeft betrokken, hebben we alsnog een traject in gang kunnen zetten.” Joke zocht contact met Valedo en legde hen de situatie voor. Zij zochten contact met Ruud, er werden gesprekken gevoerd en vragenlijsten ingevuld. “Valedo heeft mij goed geadviseerd. Ik krijg een deel van de opleiding betaald en dat is mooi meegenomen”, aldus Ruud. Ook krijgt hij van zijn huidige werkgever onder andere de examendagen cadeau. Joke: “Ruud heeft altijd goed voor Jeurissen gezorgd, natuurlijk zorgen wij nu het nodig is ook goed voor Ruud. Wij gunnen Ruud nog een plezierig werkzaam leven.”\n\nDenk op tijd na over je toekomst\n\nRuud vindt het een goede zaak dat mensen in de sector regelmatig medisch onderzocht worden. “Dat geldt zeker voor de zware beroepen.” Het adviesgesprek is volgens Ruud een goede aanvulling op het medisch onderzoek. “Denk zo vroeg mogelijk na of je je werk over 20 jaar nog kunt uitvoeren. Zo niet, ga iets anders doen, nu het nog kan. Hoe eerder je je ervan bewust bent, hoe beter. Ik heb een collega van 35 jaar, die al geopereerd is aan zijn rug. Hij moet nog zeker 30 jaar, maar houdt dat in dit beroep waarschijnlijk niet vol. Voor de zware beroepen is dat niet te doen. Ik heb 45 jaar gewerkt als timmerman en dat merk ik nu.”\n\nBewustwording\n\nWaar volgens Ruud nog winst is te behalen, is mensen bewust maken van de mogelijkheden. “Het is een zaak van opletten en nadenken over je eigen gezondheid. Daar is nog wel winst in te behalen. Ik heb collega’s die er lacherig over doen, die denken dat het niet voor hen geldt. Ook is niet iedereen in staat om te leren. Ik merk zelf ook dat het op deze leeftijd lastig is. Maar als je heel goed je best doet, lukt het echt wel.” Joke complimenteert Ruud voor het feit dat hij deze stap heeft genomen. “Heel veel medewerkers in de leeftijdscategorie van Ruud zijn afwachtend. Het zijn mensen die met 15, 16 jaar zijn begonnen met werken in de bouw. Een tijd waarin er geen Arbowetgeving was. Ze hebben altijd fysiek werk gedaan, in de veronderstelling dat ze na 40 dienstjaren kunnen stoppen. Die leeftijd schuift steeds verder op. Ook Ruud wilde én moest door, maar kon dat niet meer in zijn huidige werk. Zijn omscholing heeft tot een prachtige samenwerking geleid.”',
			questions: [
				q(
					2025,
					1,
					'Wat voor organisatie is Jeurissen?',
					{
						A: 'de instelling waar Ruud zijn opleiding tot rij-instructeur volgt',
						B: 'de rijschool waar Ruud binnenkort zal gaan werken',
						C: 'het bedrijf waar Ruud momenteel als timmerman werkt'
					},
					'C'
				),
				q(
					2025,
					2,
					'Wat vindt Ruud van medische onderzoeken in de bouwsector?',
					{
						A: 'Hij vindt de onderzoeken bijzonder nuttig voor mensen die zwaar werk doen.',
						B: 'Hij vindt het lastig dat jonge werknemers niet vaak genoeg onderzocht worden.',
						C: 'Hij vindt medische onderzoeken minder belangrijk dan adviesgesprekken.'
					},
					'A'
				),
				q(
					2025,
					3,
					'Wat wil Ruud duidelijk maken met het voorbeeld van zijn collega van 35 jaar?',
					{
						A: 'dat er mensen zijn die geen ander werk kunnen vinden',
						B: 'dat mensen beter geen beroep in de bouw kunnen kiezen',
						C: 'dat mensen zware beroepen soms niet lang kunnen uitoefenen'
					},
					'C'
				),
				q(
					2025,
					4,
					'Wat vindt Ruud ervan dat hij nieuwe dingen moet leren tijdens zijn omscholing?',
					{
						A: 'Het is even volhouden, maar met hard werken lukt het hem.',
						B: 'Het is lang geleden dat hij moest leren, maar hij vindt het makkelijk.',
						C: 'Hij vindt het leuk, maar hij vindt zichzelf er eigenlijk te oud voor.'
					},
					'A'
				),
				q(
					2025,
					5,
					'Waarin verschilt Ruud van andere mensen met een zwaar beroep, volgens Joke Hermans?',
					{
						A: 'Ruud heeft vrij lang gewacht voor hij zich liet omscholen.',
						B: 'Ruud is later dan gemiddeld begonnen met zijn beroep.',
						C: 'Ruud is zelf in actie gekomen om ander werk te vinden.'
					},
					'C'
				),
				q(
					2025,
					6,
					'Wat is het doel van deze tekst?',
					{
						A: 'de lezer enthousiast maken over omscholing door een voorbeeld te geven',
						B: 'de lezer laten beseffen dat een omscholing meestal veel tijd en moeite kost',
						C: 'de lezer uitleggen dat niet iedereen zich zomaar kan laten omscholen'
					},
					'A'
				)
			]
		},
		{
			name: 'Een potje huilen',
			slug: 'een-potje-huilen',
			intro: 'Deze tekst komt van een website over gezondheid.',
			text: 'Een potje huilen\n\nHuilen wordt in onze Westerse maatschappij meestal niet zo gewaardeerd. Het wordt vaak gezien als een teken van zwakte, dus die tranen kun je maar beter inhouden. In Japan kijken veel mensen heel anders tegen huilen aan. Huilen wordt daar soms zelfs aangemoedigd om stress en spanning los te laten. Zo heb je er speciale huilclubs waar je naar huilfilms kunt kijken. Lees verder voor een paar leuke weetjes over huilen en een kleine ode aan een traantje op zijn tijd.\n\nAlleen mensen huilen van emotie\n\nDieren hebben ook traanklieren, maar je zal ze niet zien huilen van emotie. De traanklieren bij dieren zitten er om stofjes en bacteriën uit de ogen te spoelen. De traanklieren van mensen kunnen door verschillende dingen worden geactiveerd, bijvoorbeeld als rook of de damp van gesneden uien de traanklieren irriteert. Ook als er iets in je oog komt, wordt er meteen traanvocht geproduceerd om het oog zo snel mogelijk schoon te spoelen. Maar huilen van emotie, dat is iets wat alleen wij mensen doen. Zo kun je huilen van verdriet, woede of schaamte, maar ook als je overweldigd bent door gevoelens van geluk en vreugde of als je heel veel fysieke pijn hebt. Zien huilen doet soms ook huilen, de sterke emotie van een ander raakt dan je eigen emoties.\n\nHuilen als communicatiemiddel\n\nHuilen heeft evolutionair gezien een heel duidelijke communicatiefunctie. Pasgeboren baby’s zijn volledig afhankelijk van hun ouders, en door naast te schreeuwen ook te huilen komt de boodschap duidelijk aan: Help mij, ik ben hulpeloos! Gedragswetenschappers geven aan dat huilen bij volwassenen ook die functie heeft. Als anderen je zien huilen, geeft dat een duidelijk signaal af dat je hulp nodig hebt. Vaak word je dan ook snel getroost als je in het openbaar huilt.\n\nVrouwen huilen meer dan mannen\n\nVrouwen huilen gemiddeld zo’n twintig tot vijftig keer per jaar en mannen maar zo’n vijf tot twintig keer. Als je dat op een heel leven bekijkt, is dat voor vrouwen 16 maanden huilen! Het is maar goed dat die huilbuien in tussenpozen komen, want je zou er compleet van uitdrogen. Dat vrouwen meer huilen heeft te maken met de verschillende hormonen die mannen en vrouwen aanmaken. Zo hebben mannen meer testosteron in hun lichaam, wat een soort drempel vormt om te huilen. Vrouwen hebben juist door de aanwezigheid van het hormoon prolactine een lagere drempel om te huilen. Ook zijn de traanbuizen (kleine buisjes die de tranen afvoeren) van mannen kleiner dan die van vrouwen, waardoor ze moeilijker kunnen huilen.\n\nWaarom lucht huilen zo op?\n\nIedereen weet hoe huilen kan opluchten. Soms loop je al een tijd rond met een knoop in je maag, of ben je boos of verdrietig. Veel mensen zullen wel herkennen dat je soms niet eens precies weet waarom je huilt, maar dat je juist vaak tijdens het huilen erachter komt wat je nou precies dwarszit. Het is wel bijzonder om te weten dat tranen veroorzaakt door irritatie van de ogen een heel andere samenstelling hebben dan tranen van emotie. Die laatste bevatten namelijk hormonen met een pijnstillende werking zoals prolactine, corticotropine en leucine. Ook komen er tijdens het huilen in het lichaam zelf gelukshormonen vrij, zoals endorfinen, die je kalm maken.\n\nHuilen mag!\n\nHet is jammer dat huilen zo vaak als een teken van zwakte wordt gezien, zeker mannen worden geacht altijd maar sterk te zijn en niet te huilen. Eigenlijk zonde, want als je lange tijd je gevoelens onderdrukt en niet huilt als je wel de behoefte hebt, dan raak je het contact met je emoties een stuk kwijt. Natuurlijk hoef je nu niet meteen om elk wissewasje in huilen uit te barsten, maar loop je een beetje op je tenen of heb je veel stress? Kijk eens of het je lukt een potje te huilen.',
			questions: [
				q(
					2025,
					7,
					'Wat is het verschil tussen dieren en mensen als het om huilen gaat?',
					{
						A: 'Bij pijnlijke ogen maken mensen veel sneller traanvocht aan dan dieren.',
						B: 'Dieren huilen alleen bij lichamelijke pijn, mensen ook bij vervelende ervaringen.',
						C: 'Mensen huilen door positieve of negatieve gevoelens, dieren doen dat niet.'
					},
					'C'
				),
				q(
					2025,
					8,
					'Wat zegt de schrijver over pasgeboren baby’s die huilen?',
					{
						A: 'Bij hen heeft huilen dezelfde functie als bij huilende volwassenen.',
						B: 'Voor hen heeft huilen meer nut dan wanneer volwassenen huilen.',
						C: 'Zij worden als ze in het openbaar huilen sneller getroost door hun ouders.'
					},
					'A'
				),
				q(
					2025,
					9,
					'Waarom huilen vrouwen meer dan mannen?',
					{
						A: 'alleen door verschillen in hormonen tussen mannen en vrouwen',
						B: 'alleen door verschillen in de traanbuizen van mannen en vrouwen',
						C: 'zowel door verschillen in hormonen als door verschillen in traanbuizen'
					},
					'C'
				),
				q(
					2025,
					10,
					'Wat voor functie hebben gelukshormonen, volgens de tekst?',
					{
						A: 'Ze helpen lichamelijke pijn te verminderen.',
						B: 'Ze verwijderen endorfine uit het lichaam.',
						C: 'Ze zorgen ervoor dat je rustiger wordt.'
					},
					'C'
				),
				q(
					2025,
					11,
					'Welke zin vat de mening van de schrijver het beste samen?',
					{
						A: 'Huilen is gezond, dus het is niet erg om het soms te doen.',
						B: 'Huilen is nuttig, maar alleen als je je slecht voelt of pijn hebt.',
						C: 'Pas op met huilen, want mensen kunnen het als zwakte zien.'
					},
					'A'
				),
				q(
					2025,
					12,
					'Wat is het doel van deze tekst?',
					{
						A: 'de lezer informeren over verschillende feiten over huilen',
						B: 'de lezer vertellen wanneer het gepast is om te huilen',
						C: 'de lezer waarschuwen voor de effecten van huilen'
					},
					'A'
				)
			]
		},
		{
			name: 'Verkopen is een vak',
			slug: 'verkopen-is-een-vak',
			intro:
				'Deze tekst komt uit een studieboek voor opleidingen tot verkoper in een kledingwinkel.',
			text: "Verkopen is een vak\n\nWat wil jouw klant?\n\nHoe goed je product ook is, als je geen klanten in je winkel krijgt, moet je bedrijf uiteindelijk de deuren sluiten. Je moet dus weten waarom een klant naar jouw winkel komt. En wat jij er aan kunt doen om te zorgen dat de klant tevreden is. Het is belangrijk dat je weet wat de klant wil en hoe je hem of haar het beste helpt.\n\nHet juiste moment\n\nAls je wilt weten wat je klant zoekt, is het natuurlijk het makkelijkst om het direct te vragen: 'Waar kan ik u mee helpen?'. Maar de meeste klanten willen eerst even rondkijken en voelen zich juist opgejaagd als je dat direct zou vragen. Moeilijk, want er zijn ook klanten die precies weten wat ze willen en juist wel willen dat je ze snel helpt. Hoe bepaal je nu het moment waarop jij kunt helpen?\n\nGoed kijken\n\nAls je goed kijkt, kun je vaak wel zien wat iemand wil. En je kunt jezelf daar ook in trainen. Als iemand gehaast je winkel binnenkomt, is het waarschijnlijk een klant die weet wat hij wil en kun je direct op hem af stappen. Maar gaat iemand op zijn gemak rondneuzen en alles bekijken, dan wil deze klant waarschijnlijk een middagje ontspannen winkelen en kun je hem dus de tijd geven. Je ziet vanzelf wanneer hij jouw hulp zou kunnen gebruiken. Let maar eens op als iemand bij een rek met winterjassen staat. Dat betekent nog niet dat hij ook echt een winterjas wil kopen. Maar als je ziet dat hij uitgebreid aan de stof voelt en nieuwsgierig naar het prijskaartje kijkt, weet je bijna zeker dat hij geïnteresseerd is. Dan is het tijd om op hem af te stappen en te kijken of je hem kunt helpen.\n\nEen deskundig en zakelijk advies\n\nHet is belangrijk om je klant op het juiste moment aan te spreken. Maar wát je gaat zeggen is nog belangrijker. Want een klant verwacht niet alleen dat je weet waar alles ligt, maar dat je hem ook kunt adviseren. Je stelt eerst gerichte vragen om erachter te komen wat hij wil en waarom. Pas dan weet je wat zijn koopwens is en kun je hem een goed advies geven. Het kan daarbij handig zijn een product alvast te laten zien of te demonstreren. Hierdoor kan een klant zijn vraag vaak nauwkeuriger formuleren.\n\nArgumenten op maat\n\nOm een goed advies te geven is het dus belangrijk te weten wat je klant wil. De ene klant is bijvoorbeeld op zoek naar de laagste prijs, terwijl de andere klant juist de service of de zekerheid van garantie belangrijk vindt. Iedereen heeft zijn eigen wensen. Je steekt dus nooit een standaardverhaal af maar past je verkoopargumenten aan de klant aan. Want door jouw kennis van het assortiment weet jij waar de klant de voordelen vindt die hij zoekt, zodat hij tevreden de deur uit gaat.\n\nService maakt het verschil\n\nHet is natuurlijk geweldig als je klant tevreden de deur uit gaat. Maar het is nog belangrijker dat hij ook weer terugkomt. Hoe zorg je dat iemand niet naar de concurrent gaat maar vaste klant in jouw winkel wordt? Natuurlijk speelt een goede prijs-kwaliteitverhouding een belangrijke rol. Maar daarin ben je niet uniek. Wat maakt jouw bedrijf wel bijzonder? Dat is de goede service. Veel consumenten vinden service het allerbelangrijkst. Welke extra service biedt jouw bedrijf? Worden mensen snel en vriendelijk geholpen? Kunnen ze zonder problemen ruilen? Geeft jullie garantieregeling extra zekerheid? Kunnen jullie de artikelen snel thuis bezorgen? Of kunnen jullie alles makkelijk en snel zelf repareren? Het is belangrijk dat je weet welke service jouw bedrijf kan bieden. Maar vergeet niet dat jouw vriendelijke houding het meest bijdraagt aan een goed imago.\n\nElke klacht geeft informatie\n\nHoe goed je ook je best doet, er zijn altijd klanten die ontevreden zijn. Soms over het product, soms over de service. Je moet dan hopen dat de klant de moeite neemt om terug te komen met zijn klacht. Anders zul je nooit weten dat er een probleem is en kun je er niets aan doen. Want van fouten kun je leren en het biedt je de kans de relatie te herstellen. Als de klacht terecht is, kan je bedrijf bijvoorbeeld de service verbeteren, de voorlichting aan klanten aanpassen of het inkoopbeleid veranderen. Iedere klacht geeft dus belangrijke informatie die je heel serieus moet nemen.\n\nNeem klager en klacht serieus\n\nNatuurlijk is het niet leuk als er een klacht binnenkomt. De klant is dan ontevreden en het vertrouwen in jouw bedrijf heeft een deuk opgelopen. Maar je kunt het vertrouwen weer terugwinnen. Het is dan heel erg belangrijk dat je de klant serieus neemt. Als hij teleurgesteld binnenkomt en zijn boosheid op jou afreageert, is dat soms moeilijk. Maar sta niet te snel klaar met je oordeel. Blijf vooral rustig zodat je er achter komt waarom hij een klacht heeft. Het is belangrijk dat je hem netjes en serieus behandelt. Want alleen een tevreden klant zorgt voor positieve reclame.",
			questions: [
				q(
					2025,
					13,
					'Een klant komt een kledingwinkel binnen. De verkoper groet de klant. Wanneer kan de verkoper het beste naar de klant toe gaan om hem te helpen?',
					{
						A: 'nadat de klant heeft laten merken dat hij hulp wil',
						B: 'nadat de klant zelf om hulp heeft gevraagd',
						C: 'zo snel mogelijk nadat de klant is binnengekomen'
					},
					'A'
				),
				q(
					2025,
					14,
					'Een klant in een kledingwinkel zoekt een nieuwe broek. De klant wil hulp van de verkoper. Waar moet de verkoper mee beginnen?',
					{
						A: 'met het geven van advies over enkele broeken die de klant mooi vindt',
						B: 'met het geven van informatie over enkele broeken die de klant mooi vindt',
						C: 'met het stellen van vragen om te beoordelen wat voor broek de klant wil'
					},
					'C'
				),
				q(
					2025,
					15,
					"Onder het kopje 'Service maakt het verschil' staan veel vragen. Wat wil de schrijver hiermee duidelijk maken?",
					{
						A: 'dat het belangrijk is om klanten een goede service te bieden',
						B: 'dat het belangrijk is om vragen van klanten te beantwoorden',
						C: 'dat het belangrijk is om vriendelijk te blijven tegen klanten'
					},
					'A'
				),
				q(
					2025,
					16,
					'Voor een verkoper is het belangrijk om tevreden klanten te hebben met een positief beeld van de winkel. Wat is het belangrijkste om dat te kunnen bereiken?',
					{
						A: 'een eerlijk advies',
						B: 'een goed product tegen een lage prijs',
						C: 'een vriendelijke houding'
					},
					'C'
				),
				q(
					2025,
					17,
					'Hoe moet een verkoper omgaan met ontevreden klanten die terugkomen om te klagen?',
					{
						A: 'Hij moet hun klachten serieus nemen zodat ze weer tevreden vertrekken.',
						B: 'Hij moet klagende klanten gelijk geven zodat ze met een tevreden gevoel vertrekken.',
						C: 'Hij moet ontevreden klanten proberen te overtuigen dat hun klachten onterecht zijn.'
					},
					'A'
				),
				q(
					2025,
					18,
					'Wat is het doel van deze tekst?',
					{
						A: 'de lezer duidelijk maken dat verkopen een mooi maar moeilijk vak is',
						B: 'de lezer uitleggen hoe een verkoper het beste met klanten kan omgaan',
						C: 'de lezer vermaken met leuke ervaringen van klanten en verkopers'
					},
					'B'
				)
			]
		},
		{
			name: 'Overuren',
			slug: 'overuren',
			intro:
				'Deze tekst is een deel uit de arbeidsvoorwaarden in de metaalindustrie. De tekst gaat over overuren.',
			text: 'Overuren\n\nOverwerk is werktijd die buiten het dienstrooster (de voor u geldende dagelijkse werktijd) valt. Overwerk wordt extra beloond. Er is echter wel een aantal regels en uitzonderingen. Deze zijn:\n• De individuele werktijd in de metaalindustrie is 8 uren per dag. De werktijden worden vastgelegd in uw dienstrooster. Uren die u werkt buiten het dienstrooster, maar binnen de 8 werkuren per dag, worden ‘verschoven uren’ genoemd. Daarvoor gelden andere toeslagen.\n• Er is geen beloning als u slechts een enkele keer maximaal een half uur overwerkt, direct aansluitend op het normale werk. Bijvoorbeeld het afmaken van een klus, als dit af en toe voorkomt. Als u overwerkt tot 24.00 uur na een volle werkdag hoeft u de eerste 11 uren na het overwerk niet te werken. Als er binnen die 11 uren gewone werktijd gepland staat in het dienstrooster, moet de werkgever deze gewone werktijd echter wel betalen!\n\nOverwerk verplicht in de metaalindustrie?\n\nDe werkgever mag u verplichten om over te werken tot 10 uur per vier weken, maar moet altijd rekening houden met uw persoonlijke omstandigheden. Overwerk boven de 10 uur per vier weken kan alleen worden verplicht in het geval van calamiteiten. Met calamiteiten wordt bijvoorbeeld bedoeld:\n• boetes;\n• schade voor opdrachtgevers/derden of het eigen bedrijf. Als er geen sprake is van een calamiteit, mag u overwerk boven de 10 uur per vier weken dus weigeren. Voor bepaalde werknemers geldt de verplichting tot overwerk in elk geval niet, namelijk:\n• als u jonger bent dan 18 jaar;\n• als u om gezondheidsredenen geen overwerk kan/mag verrichten. Als u 55 jaar of ouder bent, kan u verplicht worden tot maximaal 5 uren overwerk in een periode van vier weken.\n\nBetaling van overuren in de metaalindustrie\n\nAls u overwerkt kan u kiezen hoe u de overuren wil laten vergoeden. Dat kan op verschillende manieren: 1) uren kunnen in geld worden vergoed; 2) uren kunnen met een maximum van 10 dagen per jaar in vrije tijd worden vergoed. De opname van de vrije tijd gebeurt in overleg met uw werkgever; 3) in overleg met uw werkgever kunnen meer dan 10 dagen per jaar ingezet worden als vrije tijd.',
			questions: [
				q(
					2025,
					19,
					'In het dienstrooster van Joseph staan werktijden van 7.00 tot 15.00 uur. Vandaag moet hij van 8.00 tot 16.00 uur werken. Valt dit onder overwerk?',
					{
						A: 'Ja, want het laatste uur valt buiten zijn dienstrooster.',
						B: 'Nee, want deze werkuren tellen als verschoven uren.',
						C: "Misschien, als zo'n verandering vaker voor gaat komen."
					},
					'B'
				),
				q(
					2025,
					20,
					'Marly moet na een volle werkdag tot 24.00 uur overwerken. Volgens het dienstrooster moet ze de volgende ochtend om 7.00 uur weer beginnen. Wat gebeurt er nu?',
					{
						A: 'Ze hoeft de dag na het overwerk niet te werken.',
						B: 'Ze mag pas na 11 uren van rust weer gaan werken.',
						C: 'Ze moet gewoon om 7.00 uur beginnen met werken.'
					},
					'B'
				),
				q(
					2025,
					21,
					'Claire is 56 jaar en heeft een goede gezondheid. Ze wil liever niet overwerken. Wat kan haar werkgever doen?',
					{
						A: 'De werkgever kan Claire niet verplichten om over te werken.',
						B: 'De werkgever kan Claire verplichten om 5 uur per vier weken over te werken.',
						C: 'De werkgever kan Claire verplichten om 10 uur per vier weken over te werken.',
						D: 'De werkgever kan Claire altijd verplichten om over te werken.'
					},
					'B'
				),
				q(
					2025,
					22,
					'Pawel heeft 8 overuren gemaakt. Wat gebeurt er met die overuren?',
					{
						A: 'De overuren worden vergoed in geld.',
						B: 'De overuren worden vergoed in vrije tijd.',
						C: 'Hij mag zelf kiezen of de overuren worden vergoed in vrije tijd of in geld.'
					},
					'C'
				),
				q(
					2025,
					23,
					'Wat is het doel van deze tekst?',
					{
						A: 'de lezer overtuigen van het belang van overwerken',
						B: 'de lezer uitleggen wat de regels voor overwerk zijn',
						C: "de lezer waarschuwen voor de risico's van overwerken"
					},
					'B'
				)
			]
		},
		{
			name: 'De buurt-whatsapp',
			slug: 'buurt-whatsapp',
			intro:
				'Deze tekst komt van een nieuwssite en gaat over speciale WhatsApp-groepen voor buren.',
			text: "De buurt-whatsapp\n\nWhatsApp is één van de populairste diensten die mensen op hun telefoon gebruiken om berichten uit te wisselen met vrienden en familie. Steeds vaker wordt WhatsApp ook gebruikt door groepen met een serieuzer doel. De buurt-whatsapp dient zo’n serieus doel. Buurt-whatsapp groeit snel in Nederland: er zijn inmiddels zo'n 7300 groepen. Deze speciale whatsappgroepen zijn vaak bedoeld om verdachte situaties te melden aan buurtgenoten. Mitra van de Kuilen is beheerder van een buurt-whatsapp in Middenbeemster. Zo'n 70 van de 115 huishoudens in haar wijk zijn lid. “Sommige buurtbewoners willen er niet in. Soms omdat ze ruzie hebben met hun buren of andere wijkbewoners en niet met hen in een groep willen zitten. Anderen zijn sowieso meer op zichzelf.”\n\nGevoel van veiligheid\n\nTea Rukavina nam tien jaar geleden het initiatief voor de buurt-whatsappgroepen. Aanleiding was een poging tot inbraak bij haar thuis. “De politie kwam gelukkig snel. Die zijn natuurlijk een zoektocht gestart. Maar wat kon ik doen om de buurt snel te informeren over mogelijke gevaren? Zo is de buurt-whatsapp begonnen.” De appgroep lijkt te voorzien in een behoefte. “Het kan het gevoel van veiligheid stimuleren”, zegt Habib Wajid, onderzoeker en adviseur op het gebied van sociale media en maatschappelijke veiligheid. “Maar er zijn ook allerlei groepen waarbij de appgroep het gevoel van onveiligheid juist vergroot.”\n\nGevaren van de buurt-whatsapp\n\nWajid vertelt over situaties waarbij alle nieuwelingen in een dorp continu werden gevolgd via een buurt-whatsapp. En eentje waarbij leden van de whatsappgroep massaal achter een vermoedelijke inbreker aangingen. “Het is niet verantwoord als mensen zelf politie gaan spelen”, zegt Wajid. Het kan ook andere onrust veroorzaken. Bijvoorbeeld als een doodgewone glazenwasser wordt aangezien voor een inbreker, en de hele buurt in rep en roer is. Of wanneer oplettende buurtbewoners het geheime liefdesleven van een buurman onthullen, omdat ze zo vaak een vreemde auto voor zijn huis zien.\n\nDe zin en onzin van buurt-whatsapp\n\nEn dan zijn er nog de ruzies en irritaties die ontstaan omdat lang niet ieder lid zich aan de spelregels van de buurt-whatsapp houdt. “Dan doen ze bijvoorbeeld een oproep voor hun vermiste kat”, vertelt beheerder Van de Kuilen. “Ook verzoeken om de vuilniszakken buiten te zetten, worden niet altijd gewaardeerd. Een buurt-whatsapp is niet bedoeld voor oproepjes, dus af en toe grijp ik in. Dan speel ik even de politieagent”, zegt Van de Kuilen. “Sommige mensen storen zich er niet aan, maar je ziet ook meteen dat mensen onmiddellijk de groep verlaten. Die hebben geen zin in overbodige berichten.”",
			questions: [
				q(
					2025,
					24,
					'Wat is de bedoeling van buurt-whatsapp, volgens de tekst?',
					{
						A: 'dat buren elkaar kunnen helpen als er een ruzie is',
						B: 'dat buren elkaar leuke berichten kunnen sturen',
						C: 'dat buren elkaar waarschuwen als ze iets niet vertrouwen'
					},
					'C'
				),
				q(
					2025,
					25,
					'Tea Rukavina begon een buurt-whatsapp nadat er bij haar thuis bijna was ingebroken. Waarom deed ze dat?',
					{
						A: 'Ze wilde de buurt uitleggen wat de politie nu ging doen.',
						B: 'Ze wilde de buurt vragen of zij iets bijzonders hadden gezien.',
						C: 'Ze wilde de buurt waarschuwen voor inbrekers in de wijk.'
					},
					'C'
				),
				q(
					2025,
					26,
					'Soms gaan mensen uit een buurt-whatsappgroep zelf achter een vermoedelijke inbreker aan. Vindt Habib Wajid dat goed?',
					{
						A: 'Ja, want dat vergroot de veiligheid in de buurt.',
						B: 'Nee, het is niet verstandig als mensen dit zelf doen.',
						C: 'Alleen als ze zeker weten dat het inbrekers zijn.'
					},
					'B'
				),
				q(
					2025,
					27,
					'Wanneer grijpt beheerder Mitra van de Kuilen in?',
					{
						A: 'als buren onverwacht de groep hebben verlaten',
						B: 'als buren overbodige berichten naar de groep sturen',
						C: 'als buren vervelend op een oproep van iemand reageren'
					},
					'B'
				),
				q(
					2025,
					28,
					'Wat is het doel van deze tekst?',
					{
						A: 'de lezer adviseren om voorzichtig te zijn in een buurt-whatsapp',
						B: 'de lezer informeren over voor- en nadelen van een buurt-whatsapp',
						C: 'de lezer overhalen om een eigen buurt-whatsapp te starten'
					},
					'B'
				)
			]
		},
		{
			name: 'Algemene informatie Vision College',
			slug: 'vision-college',
			intro: 'Deze tekst komt van de website van het Vision College.',
			text: 'Algemene informatie Vision College\n\nAanwezigheid\n\nOnder Lestijden vind je de tijden waarbinnen de lessen bij het Vision College plaatsvinden. Tussen de start van de eerste les op maandag en het eind van de laatste les op vrijdag moet je dus voor school beschikbaar zijn, behalve in de schoolvakanties. Aan het begin van het schooljaar ontvangt elke student een belkaart. Wanneer je niet op school of stage aanwezig kunt zijn, dien je dit voor 09.00 uur ’s ochtends te melden bij het Onderwijsservicebureau (OSB) van jouw sector (via het nummer dat op de belkaart staat) en indien van toepassing ook bij je stagebedrijf. De reden van je absentie wordt geregistreerd. Als je aanwezig moet zijn, maar wegblijft zonder geldige reden en/of zonder dit te melden, ziet de school dit als ongeoorloofd verzuim. De school neemt dan direct contact met jou op. Om je aanwezigheid te melden, gebruik je de Visionpas. Je scant je pas bij de toegangspoortjes bij de ingang. Hierdoor registreer je dat je in het gebouw aanwezig bent. Bij aanvang van de les registreert de docent of je aanwezig bent. Je bent dan pas officieel aanwezig bij de juiste onderwijsactiviteit.\n\nBereikbaarheid\n\nZorg ervoor dat de school altijd over een correct telefoonnummer en adres van jezelf en van een contactpersoon beschikt. In geval van nood kunnen we direct contact met jou en/of met je contactpersoon opnemen. Wijzigingen dien je schriftelijk door te geven aan de Studentenadministratie. Je kunt het wijzigingsformulier bij de Studentenadministratie ophalen en ingevuld weer afgeven. Het wijzigen van telefoonnummer of e-mailadres kan ook via Selfservice EduArte. Gebruik ICE op je mobiele telefoon (ICE = in case of emergency) zodat, in geval van nood, hulpverleners contact op kunnen nemen met jouw contactpersonen.\n\nCalamiteit\n\nEen calamiteit is een situatie die gevaarlijk kan zijn, bijvoorbeeld een brand. Als er een calamiteit is, word je gewaarschuwd door een alarmsignaal. Handel dan als volgt:\n▪ Ga zo snel mogelijk via de dichtstbijzijnde nooduitgang naar de verzamelplaats.\n▪ Gebruik geen lift.\n▪ Blijf op de verzamelplaats totdat je toestemming krijgt om weer naar binnen te gaan.\n▪ Volg de aanwijzingen van de bedrijfshulpverleners altijd op. Bedrijfshulpverleners zijn medewerkers die je begeleiden bij een calamiteit. Je herkent ze aan een felgeel of oranje hes met de letters BHV. Zie je dat er ergens brand is of dat een andere gevaarlijke situatie zich voordoet en heb je nog geen alarmsignaal gehoord, waarschuw dan een conciërge of de receptie. In alle ruimtes hangt een kaart met ‘Richtlijnen bij Brand/Ongevallen’. Bij de blusapparatuur in de gangen hangt een plattegrond met de ontruimingsroute bij calamiteiten. Is de situatie naar jouw mening zó gevaarlijk dat er echt sprake is van een noodsituatie, dan kun je zelf het alarmsignaal starten. Daarvoor hangen in alle gebouwen melders (rode kastjes met een knop). Of je belt toestel 100 (via een vaste telefoon) of 8888 (via je mobiele telefoon).\n\nCursusgeld\n\nJe moet wettelijk cursusgeld betalen als je een BBL-opleiding volgt en op 1 augustus 18 jaar of ouder bent. Je moet ook wettelijk cursusgeld betalen als je een deeltijd-vavo-opleiding volgt (voor vavo is geen leeftijdsbepaling van toepassing). De overheid stelt de hoogte van het cursusgeld jaarlijks opnieuw vast. Voor komend schooljaar is dit:\n▪ € 236,00 voor niveau 1 of 2\n▪ € 573,00 voor niveau 3 of 4 Ook vavo-studenten die een opleiding volgen van minder dan 29 lesuren en via de rijksoverheid bekostigd worden, moeten wettelijk cursusgeld betalen: € 30,- per lesuur. Over de betaling ontvang je een AcceptEmail van het Vision College. Op onze website en op de ELO staat het financieel reglement. Lees dit zorgvuldig door!\n\nDe factuur klopt niet\n\nAls je vindt dat de factuur niet klopt, kun je binnen 14 dagen na de factuurdatum een brief sturen naar de Financiële administratie: Vision College\nFinanciële administratie\nTeam debiteuren\nPostbus 30\n1800 AA Alkmaar\ndebiteuren@visioncollege.nl\n\nVermeld altijd je naam, geboortedatum, studentennummer en het factuurnummer.\n\nBetalen moet!\n\nJe bent zelf verantwoordelijk voor de betaling. Als je niet betaalt, kan de school een incassobureau inschakelen.\n\nDerdenmachtiging\n\nBij BBL wordt het cursusgeld door sommige werkgevers vergoed. Als je werkgever je cursusgeld wil betalen, moet er per schooljaar een derdenmachtiging ingevuld worden. Deze moet zowel door de werkgever als door jezelf getekend worden. Na ontvangst van de derdenmachtiging wordt de factuur op naam van de werkgever gezet. Een derdenmachtiging kun je aanvragen bij Team debiteuren. Als de derdenmachtiging niet ondertekend door de school wordt ontvangen, blijf je zelf verantwoordelijk voor de betaling.\n\nCursusgeld terugkrijgen\n\nAls je tussentijds met de opleiding stopt, kun je het cursusgeld geheel of gedeeltelijk alleen terugkrijgen als jij:\n▪ je uitschrijft vóór je eerste lesdag (geheel);\n▪ je vóór 1 oktober van dit jaar laat uitschrijven;\n▪ vóór 1 mei van het komende jaar je diploma haalt en de school verlaat (niet van toepassing bij vavo);\n▪ van een BBL-opleiding overstapt naar een BOL-opleiding (je gaat dan wel lesgeld betalen);\n▪ van een deeltijd-vavo-opleiding overstapt naar een voltijd-vavo-opleiding (je gaat dan wel lesgeld betalen);\n▪ in geval van bijzondere familieomstandigheden, zoals ernstige ziekte of overlijden, tussentijds met de opleiding moet stoppen. Lees de voorwaarden in het financieel reglement. Als je overstapt naar een opleiding met een ander cursusgeldtarief, dan kan het verschil worden verrekend. Teruggave gaat niet automatisch. Je moet het altijd zelf aanvragen bij Team debiteuren via het formulier "aanvraag terugbetaling cursusgeld".\n\nVragen? Ga naar Team debiteuren (in Alkmaar).\n\nDecaan\n\nDe sectoren Economie, Gezondheidszorg, Welzijn & Entree en Handel & Dienstverlening hebben een of meer decanen of voorlichters. Bij een decaan of voorlichter kun je terecht als je:\n▪ meer wilt weten over de opleidingen binnen je sector en je kansen op werk erna;\n▪ meer wilt weten over vervolgopleidingen, de kosten ervan en de mogelijkheden erna;\n▪ je wilt laten uitschrijven;\n▪ je wilt laten overschrijven naar een andere opleiding;\n▪ doorverwezen wilt worden naar Studie Informatie Punt (STIP). Bij de sector Techniek ga je hiervoor naar je mentor.\n\nEHBO\n\nElke locatie van het Vision College heeft EHBO-hulpmiddelen. Een pleister nodig of andere E(erste) H(ulp) B(ij) O(ngelukken)? Ga of bel naar de receptie of een conciërge! Als spoedeisende hulp nodig is, bel je toestel 100 (via een vaste telefoon). Bij een ongeval help je de gewonde persoon naar de receptie. Als je de gewonde persoon niet kunt of durft te verplaatsen, blijf je altijd bij hem of haar en laat je iemand anders de receptie of conciërge waarschuwen. Vraag of diegene wel daarna terugkomt om te vertellen wat er moet gebeuren. Volg altijd de instructies op van de EHBO’er of de bedrijfshulpverlener.\n\nUitjes\n\nBij een aantal opleidingen worden uitjes georganiseerd. Als deze deel uitmaken van het lesprogramma is deelname verplicht en zijn er geen kosten aan verbonden. Daarnaast kunnen er ook uitjes worden georganiseerd die niet tot het lesprogramma behoren. Voor deze uitjes betaal je apart via de webshop van het Vision College. De kosten worden in dit geval niet uit het lesgeld of het cursusgeld betaald.\n\nVisionpas\n\nJe hebt een Visionpas nodig als je een opleiding volgt. Met de Visionpas:\n▪ krijg je toegang tot de gebouwen van het Vision College (je houdt hem vlak bij de lezer in de toegangspoortjes);\n▪ kun je binnen de gebouwen laten zien wie je bent als hier door een docent, conciërge of (beveiligings)medewerker naar gevraagd wordt;\n▪ kun je je legitimeren bij examens;\n▪ registreer je je bij het OLC;\n▪ kun je jouw kluisje openen (in Purmerend met een sleutel);\n▪ kun je prints en kopieën maken met een print-/kopieer-/scanapparaat;\n▪ kunnen wij registreren of je in een onderwijsruimte aanwezig bent.\n\nHoe krijg je een Visionpas?\n\nJe kunt de pas krijgen bij het Passenbureau (in Alkmaar en Heerhugowaard naast de receptie en in Hoorn tegenover de receptie). Nieuwe studenten: de pas wordt gemaakt nadat je bent ingeschreven. Het kan enkele dagen duren voordat je de pas kunt ophalen. Hier krijg je bericht van. Intussen kun je een tijdelijke pas aanvragen. Als je al bij het Vision College ingeschreven staat: meestal kun je de pas al ophalen op dezelfde dag dat je hem aanvraagt. De pas blijft eigendom van het Vision College.\n\nHoe krijg je een tijdelijke Visionpas?\n\nAls je nog op je Visionpas wacht, maar wel het gebouw in moet kunnen, kun je een tijdelijke pas ophalen bij het Passenbureau. Het Onderwijsservicebureau van jouw sector heeft aan het Passenbureau een lijst aangeleverd van studenten die tijdelijk doorgelaten mogen worden en tot welke datum. Het Passenbureau zorgt ervoor dat deze pas voor je klaar ligt.\n\nJe Visionpas doet het niet\n\nHet kan zijn dat het toegangspoortje een enkele keer niet op je pas reageert. Meld je dan bij het Passenbureau of ga naar een beveiligingsmedewerker of conciërge, deze zijn altijd in de buurt en kunnen je helpen. Het kan ook zijn dat je pas zelf defect is. Dan kun je hem bij het Passenbureau ruilen voor een nieuwe. Als de pas door je eigen schuld defect is, moet je de kosten van de nieuwe pas zelf betalen: € 5,- administratiekosten en € 5,- voor het pasje.\n\nJe bent je Visionpas vergeten\n\nJe kunt een tijdelijke pas krijgen voor een dag. Aan het einde van de dag zijn je Visionpas en de tijdelijke pas geblokkeerd. Je betaalt daarvoor € 5,- administratiekosten. Als je de tijdelijke pas weer terugbrengt, wordt je Visionpas weer gedeblokkeerd.\n\nJe bent je Visionpas kwijt\n\nJe kunt bij het Passenbureau een nieuwe pas aanvragen. Hiervoor betaal je € 5,- administratiekosten en € 5,- voor het pasje. Als je eenmaal een vervangend pasje hebt aangevraagd, kan het oude pasje niet meer worden gebruikt.\n\nJe Visionpas wordt misbruikt\n\nBij misbruik van de Visionpas wordt deze ingenomen en/of ongeldig gemaakt. Degene op wiens naam de pas stond kan een vervangende pas aanvragen. Dit is ter beoordeling van de locatiemanager.\n\nJe hebt je Visionpas niet meer nodig\n\nLever de pas in bij het Passenbureau. De pas wordt overigens automatisch ongeldig als je bij het Vision College wordt uitgeschreven.\n\nVragen\n\nMet (andere) vragen over de Visionpas kun je terecht bij het Passenbureau (naast/tegenover de receptie).\n\nJe foto\n\nOp de Visionpas staat je foto. Deze foto wordt gemaakt door het Passenbureau. Vanwege identificatie, onder andere tijdens examens, mag de foto niet beschadigd zijn!',
			questions: [
				q(
					2025,
					29,
					'Je kunt niet op school komen. Wat moet je doen?',
					{
						A: 'Dit ’s ochtends melden bij het Onderwijsservicebureau.',
						B: 'Dit ’s ochtends melden bij je docent.',
						C: 'Dit de dag ervoor al melden bij het Onderwijsservicebureau.'
					},
					'A'
				),
				q(
					2025,
					30,
					'Hoe weet de school dat je op school bent?',
					{
						A: 'doordat je je Visionpas bij de ingang scant',
						B: 'doordat de docent controleert of je er bent',
						C: 'op allebei deze manieren'
					},
					'C'
				),
				q(
					2025,
					31,
					'Er is brand op school. De bedrijfshulpverlener is er nog niet. Wat doe je?',
					{
						A: 'Je belt de brandweer.',
						B: 'Je gaat naar de verzamelplaats.',
						C: 'Je waarschuwt de conciërge of receptie.'
					},
					'C'
				),
				q(
					2025,
					32,
					'Wie moet er cursusgeld betalen?',
					{
						A: 'iedereen die bij het Vision College studeert',
						B: 'studenten die een bepaald type opleiding volgen',
						C: 'studenten van 18 jaar en ouder'
					},
					'B'
				),
				q(
					2025,
					33,
					'Hoeveel cursusgeld betaalt een vavo-student die 25 lesuren per week volgt en door de rijksoverheid wordt bekostigd?',
					{ A: '€ 236,00', B: '€ 573,00', C: '€ 750,00' },
					'C'
				),
				q(
					2025,
					34,
					'Je vergeet je Visionpas thuis. Je gaat naar school en krijgt een tijdelijke pas. Aan het einde van de dag lever je de tijdelijke pas weer in. Hoeveel kost je dat?',
					{ A: '€ 5,-', B: '€ 10,-', C: 'niets' },
					'A'
				),
				q(
					2025,
					35,
					'Je hebt op school een ongeluk gehad en kunt niet meer lopen. Je collega-student gaat hulp halen. Wat doe jij?',
					{
						A: 'Je belt de receptie.',
						B: 'Je wacht op dezelfde plek.',
						C: 'Je zoekt een EHBO-doos.'
					},
					'B'
				)
			]
		}
	]
};

export const LEZEN_2024: LezenExam = {
	year: 2024,
	totalQuestions: 35,
	passingScore: 24,
	passages: [
		{
			name: 'Bakkerij',
			slug: 'bakkerij',
			intro:
				'Deze tekst gaat over werken bij de bakkerij van Marké. Marké is een winkel waar onder andere eten, speelgoed en kleding wordt verkocht.',
			text: 'Bakkerij\n\nRuim 250 medewerkers van onze centrale bakkerij in Utrecht en onze zes decentrale bakkerijen in het hele land werken met veel liefde en op traditionele wijze aan onze taarten, snacks en andere bakkerijproducten, zodat die altijd vers in de winkels staan. Het gebak dat in de Marké-filialen wordt verkocht, wordt in onze eigen bakkerijen gemaakt. In zes vestigingen in het land wordt op traditionele manier het Marké-gebak geproduceerd en vervolgens aan de filialen geleverd. Onze klanten verwachten elke dag opnieuw vers gebak dat met liefde is gemaakt. Om dat voor elkaar te krijgen, zijn onze bakkers continu aan het kijken hoe we de kwaliteit van succesnummers als de tompouce, de appelkruimeltaart en onze saucijzenbroodjes verder kunnen verbeteren.\n\nKantoor\n\nIn Utrecht hebben we onze grootste vestiging. Hier bevindt zich het kantoor van de bakkerijdirectie en ondersteunende diensten, de centrale bakkerij en één van de zes decentrale bakkerijen. Vanuit kantoor wordt de organisatie aangestuurd of ondersteund door de volgende afdelingen:\n• Bij de proefbakkerij worden nieuwe producten ontwikkeld. Hier zijn onze creatieve mensen bezig met nieuwe smaken en recepten.\n• De afdeling inkoop zorgt dat alle ingrediënten en verpakkingsmaterialen aanwezig zijn, zodat de bakkerijen zich hier niet druk om hoeven te maken.\n• Het bedrijfsbureau maakt de planningen en zorgt onder andere dat ons interne systeem goed blijft draaien. Ook doen zij projecten om de verschillende processen te verbeteren.\n• De afdeling kwaliteit bewaakt de hygiëne en kwaliteit in de bakkerijen.\n• De afdeling administratie zorgt dat de administratie op orde is.\n• De afdeling personeelszaken zorgt dat de personele zaken goed geregeld worden.\n\nCentrale bakkerij\n\nDe centrale bakkerij in Utrecht is het centrum van de organisatie. Hier worden de producten gemaakt die in de decentrale bakkerijen als basis dienen voor alle soorten gebak. In de centrale bakkerij hebben we drie afdelingen; de afdeling ‘korstgebak’ waar bijvoorbeeld saucijzenbroodjes worden gemaakt, de deegafdeling waar onder andere appeltaarten worden gemaakt en de beslagafdeling waar de basis voor bijvoorbeeld de fototaarten wordt gemaakt. In deze bakkerij wordt op een industriële manier gewerkt. Door techniek in te zetten kunnen we per uur wel 1500 appeltaarten maken of 6000 minitaartjes! Heb je gevoel voor techniek, vind je het leuk om met machines te werken en heb je affiniteit met gebak, dan is dit de plek voor jou. Op de afdelingen word je intern opgeleid. Je leert om het proces van ingrediënt tot taart te volgen en bij te sturen, om zo een goede kwaliteit te garanderen. Je wordt hierbij begeleid door ervaren collega’s en evalueert regelmatig met de leidinggevenden. In de centrale bakkerij wordt van 5.00 uur tot 23.00 uur gewerkt. Af en toe wordt ook ’s nachts doorgewerkt.\n\nDecentrale bakkerij\n\nIn onze decentrale bakkerijen start je om 7.00 uur om de bestellingen voor die dag te produceren. Dat is meestal rond 17.00 uur klaar. Vooral op vrijdag is dat een klus; de meeste feestjes worden toch in het weekend gevierd. Regelmatig zoeken wij in de bakkerij nieuwe (parttime) medewerkers die het leuk vinden om samen met collega’s een mooi product te maken. Als nieuwe medewerker start je met eenvoudige werkzaamheden. Als dit goed gaat, leer je steeds meer, zoals crème draaien, slagroom spuiten of gebak decoreren. Als het gebak is gemaakt, moet het verdeeld worden over de winkels. Dit gebeurt in de uitzetkoeling. Bij dit werk moet je je hoofd erbij houden. Ten slotte leveren onze chauffeurs het gebak bij de winkels af. Zij starten tussen 2.00 en 4.00 uur om voor openingstijd alle winkels bevoorraad te hebben. Bij dit werk kan het goed van pas komen als je zelfstandig en stressbestendig bent.\n\nUitdagende werkomgeving\n\nBij de bakkerij-organisatie zijn we regelmatig op zoek naar ambitieuze mensen met een bakkerij-achtergrond of ervaring in het werken met voedingsmiddelen. Wij bieden een uitdagende werkomgeving met mogelijkheden om door te groeien. Hiervoor zijn verschillende mogelijkheden binnen de bakkerij-organisatie, maar ook een overstap naar andere bedrijfsonderdelen van Marké is mogelijk. Ben je geïnteresseerd, stuur dan je cv naar ons op en wij laten je zo spoedig mogelijk weten of wij een passende baan voor je hebben.\n\nStage\n\nVolg je een opleiding beroepsbegeleidend leren (BBL-opleiding) voor bakker? Er zijn bij onze bakkerijen mogelijkheden om werk en school te combineren. Door je opleiding te combineren met werken bij Marké kun je het vak in de praktijk leren.',
			questions: [
				q(
					2024,
					1,
					'Waar worden de basisproducten voor het gebak gemaakt?',
					{
						A: 'in de centrale bakkerij in Utrecht',
						B: 'in de decentrale bakkerijen',
						C: 'in de proefbakkerij'
					},
					'A'
				),
				q(
					2024,
					2,
					'Wanneer worden er in de centrale bakkerij producten gemaakt?',
					{
						A: 'alleen overdag',
						B: 'overdag en soms ook ’s nachts',
						C: 'dag en nacht, de bakkerij is altijd open'
					},
					'B'
				),
				q(
					2024,
					3,
					'Wat is een kenmerk van het werk in de centrale bakkerij?',
					{
						A: 'Er wordt door de bakkers op traditionele wijze gebak gemaakt.',
						B: 'Er wordt met machines gewerkt.',
						C: 'Nieuwe producten worden er ontwikkeld.'
					},
					'B'
				),
				q(
					2024,
					4,
					'In de decentrale bakkerij worden nieuwe medewerkers intern opgeleid. Hoe gaat dat?',
					{
						A: 'Ze beginnen met eenvoudig werk en krijgen steeds meer taken.',
						B: 'Ze leren het vak bij een ervaren bakker die hen begeleidt.',
						C: 'Ze worden door de leidinggevende beoordeeld en bijgestuurd.'
					},
					'A'
				),
				q(
					2024,
					5,
					'Wat doet de afdeling inkoop?',
					{
						A: 'Het maakt de werkplanningen.',
						B: 'Het koopt grondstoffen en verpakkingen in.',
						C: 'Het ontwikkelt nieuwe producten.'
					},
					'B'
				),
				q(
					2024,
					6,
					'Wat is het doel van deze tekst?',
					{
						A: 'de lezer enthousiast maken om bij de bakkerij te komen werken',
						B: 'de lezer informeren over hoe het gebak bij Marké wordt gemaakt',
						C: 'de lezer vertellen over de verschillende soorten gebak bij Marké'
					},
					'A'
				)
			]
		},
		{
			name: 'De beursstand',
			slug: 'beursstand',
			intro:
				"Deze tekst komt uit een studieboek. Hij gaat over de 'beursstand': een plek op een beurs. Een beurs is een evenement waar bedrijven zich kunnen presenteren.",
			text: 'De beursstand\n\nOp een beurs moeten de aanbieders ruimte huren van de organisator. In die ruimte komt een stand. Een stand kan allerlei vormen aannemen, van een kraampje op een handelsmarkt tot een zaal binnen een publieksbeurs. Een stand moet worden ontworpen en ingericht, net als een winkel. De stand is je visitekaartje. Hij moet er uitnodigend uitzien en in het oog springen. Hoe je een stand inricht, hangt ook af van het soort stand. Een tussenstand in een rij geeft minder mogelijkheden dan een hoekstand (aan het eind van de rij) of een kopstand (dwars op de rij). De meeste mogelijkheden biedt een eilandstand: een afgescheiden ruimte met looppaden er omheen. Die heeft meer ruimte en is dus duurder. Het simpelste ‘eiland’ maak je door een rondje van kraampjes, maar het kan ook met houten vloerdelen, diverse kraampjes en looppaden. Hoe groot de stand moet zijn hangt niet alleen af van het budget, maar ook van het verwachte aantal bezoekers. Het productaanbod kan ook eisen aan de afmetingen stellen. Wil je aan catering doen, dan is ook wat meer ruimte nodig.\n\nMet de organisator overleg je waar de stand precies komt: op welk deel van de beurs? Je zorgt voor een logische keus op thema. Is de ligging gunstig ten opzichte van faciliteiten zoals toiletten, horeca en de ingang en uitgang? Het inrichten van een stand kun je uitbesteden aan een standbouwer, een gespecialiseerde onderneming. Inrichten is een vak apart. Het is ook belangrijk: een slecht gepresenteerde stand trekt weinig publiek, deelname aan de beurs is dan weggegooid geld.\n\nEntree\n\nDe entree van je stand moet open zijn. Ook al zet je een paar wanden om een stand, mensen moeten naar binnen kunnen kijken en makkelijk naar binnen kunnen lopen.\n\nZitruimte\n\nEr moet ruimte zijn voor mensen om een poosje te kunnen blijven. Bij een kraampje zet je stoelen of barkrukken. Op een ‘pleintje’ binnen een eilandstand kun je zithoeken maken met lees- en demonstratiemateriaal. Komen er gezinnen, zorg dan voor een speelhoek voor kinderen. Dan geef je de ouders de tijd en ruimte om te doen waar ze voor kwamen. Zorg ook voor ruimte om rustig met klanten te overleggen. Ook al ziet je stand er ‘open’ uit, hij moet wel duidelijk afgescheiden zijn van andere stands. Wil je binnenkomen? Graag, maar ga niet te snel weer weg.\n\nVerlichting\n\nVerlichting is belangrijk. Net als bij winkels is de algemene regel: niet te veel licht bij de entree, daar houden mensen niet van. Mensen kijken onbewust naar verlichte gedeeltes, dus je wilt meer licht achterin of in het centrum. Het soort product bepaalt het soort licht: sieraden vragen om warm licht, kleding vraagt om licht dat de kleuren goed laat zien. Je kunt hulpmaterialen gebruiken, zoals posters. Ook foto’s, filmpjes en een digitale presentatie kunnen nuttig zijn.\n\nRouting\n\nOok bij een kleine stand is routing belangrijk: in welke richting lopen de mensen? Wat zien ze het eerst? In een grotere eilandstand zorg je ervoor dat de mensen in een logische looprichting langs alle onderdelen komen. Deelname aan een beurs is vaak een flinke investering. Dat is het natuurlijk alleen waard als je veel bezoekers trekt. Dus zorg voor een goede voorbereiding: laat je zakelijke kennissen weten dat je er zult zijn! Dat verhoogt straks je opbrengst. Bedrijven kunnen de klanten er vast op wijzen door een nieuwsbrief rond te sturen. Met het weggeven van toegangskaarten voor de beurs maak je een goede indruk. Als jouw bedrijf een tijdschrift voor klanten heeft, schrijf je er vast een artikel over.',
			questions: [
				q(
					2024,
					7,
					'Welk type stand biedt de meeste mogelijkheden voor de inrichting?',
					{ A: 'de eilandstand', B: 'de hoekstand', C: 'de kopstand' },
					'A'
				),
				q(
					2024,
					8,
					'De tekst noemt vier dingen die bepalen hoe groot een stand moet zijn. Welk van onderstaande hoort daar NIET bij?',
					{ A: 'het budget', B: 'de locatie op de beurs', C: 'het verwachte aantal bezoekers' },
					'B'
				),
				q(
					2024,
					9,
					'Hoe moet de verlichting van een beursstand zijn?',
					{
						A: 'Bij de entree moet het meeste licht zijn om mensen naar binnen te trekken.',
						B: 'Het licht moet overal gelijk zijn zodat mensen alles goed kunnen zien.',
						C: 'Achterin de stand of in het centrum van de stand moet meer licht zijn dan bij de entree.'
					},
					'C'
				),
				q(
					2024,
					10,
					'Wat is een goede voorbereiding op deelname aan een beurs?',
					{
						A: 'Je maakt zakelijke afspraken met andere deelnemers aan de beurs.',
						B: 'Je nodigt je zakelijke relaties van tevoren uit om de beurs te bezoeken.',
						C: 'Je vraagt aan je zakelijke relaties of ze gratis toegangskaarten willen.'
					},
					'B'
				),
				q(
					2024,
					11,
					'Wat is het doel van deze tekst?',
					{
						A: 'de lezer informeren over het inrichten van een beursstand',
						B: 'de lezer overtuigen van het nut van deelname aan een beurs',
						C: 'de lezer waarschuwen voor de kosten van een beurs'
					},
					'A'
				)
			]
		},
		{
			name: 'Verzuim op het werk',
			slug: 'verzuim-op-het-werk',
			intro:
				'Deze tekst komt van een website voor mensen met een eigen bedrijf. De tekst gaat over verzuim. Verzuim is het niet aanwezig zijn op het werk.',
			text: "Verzuim op het werk\n\nVerzuim door je werknemers kan jou als ondernemer veel geld kosten. Lees welke vormen van verzuim er zijn, wat je kunt doen om verzuim te voorkomen en hoe je de financiële risico’s zo goed mogelijk afdekt. Het meest voorkomende soort verzuim is ziekteverzuim. We spreken van ziekteverzuim als een werknemer zijn arbeidsovereenkomst niet kan nakomen wegens aantoonbare medische redenen. Er zijn verschillende vormen van ziekteverzuim te onderscheiden.\n\n1. Kortdurend ziekteverzuim\n\nWerknemers zijn soms ziek, daar kan geen werkgever omheen. Gaat het bijvoorbeeld om een simpel griepje of een verkoudheid, dan is de werknemer meestal snel weer beter. Bij zulk kortdurend ziekteverzuim blijft de schade voor je bedrijf beperkt tot een paar dagen loondoorbetaling en de kosten van eventuele vervanging. Vervelend, maar doorgaans een ondernemersrisico waar je vooraf rekening mee houdt. Let op: sommige cao’s bieden de mogelijkheid om twee wachtdagen in te stellen. Je hoeft een zieke werknemer de eerste twee ziektedagen dan niet door te betalen. Controleer dit in je cao.\n\n2. Frequent kortdurend (ziekte)verzuim\n\nKortdurend verzuim kan echter ook andere oorzaken hebben dan een ziekte. Bijvoorbeeld: een zwakke gezondheid, werkstress, een conflict op het werk of privéproblemen. In die gevallen bestaat het risico dat een werknemer zich vaker ziek zal melden. Dit heet frequent kortdurend ziekteverzuim. Onderzoek heeft aangetoond dat deze vorm van verzuim vaak leidt tot langdurig verzuim. Het is daarom zaak dit tijdig te signaleren, de oorzaken op te sporen en maatregelen te nemen. Als meerdere werknemers binnen een afdeling zich geregeld ziek melden, kan dit bijvoorbeeld duiden op een slechte werksfeer. Soms volstaat een goed gesprek om de ruzies uit te praten, of is een kleine aanpassing in het werk al voldoende om de oorzaak van werkstress bij een werknemer weg te nemen. Als een werknemer zo vaak kortdurend verzuimt dat dit slecht is voor je bedrijfsvoering, kun je hem eventueel ontslaan.\n\n3. Langdurend ziekteverzuim\n\nAls een werknemer kortdurend verzuimt, hoef je als werkgever maar weinig verplicht te regelen. Het belangrijkste is de loondoorbetaling en de ziektemelding bij de arbo- of bedrijfsarts. Het wordt anders als een werknemer zes weken of langer ziek is. Dit heet langdurend ziekteverzuim. Je krijgt dan te maken met de Wet verbetering poortwachter. Deze wet schrijft voor dat je samen met je werknemer met hulp van een verzuimbedrijf een plan moet maken om je werknemer opnieuw te laten beginnen met werken. Dit heet een re-integratietraject. Jouw bedrijf moet de kosten voor het re-integratietraject betalen. Daarbij komen nog de kosten van de loondoorbetaling van minimaal 70 procent van het loon gedurende maximaal twee jaar. In bepaalde cao's staat zelfs dat je het eerste jaar 100 procent van het loon moet betalen. Ook maak je kosten voor vervanging van de medewerker. Deze kosten kunnen erg hoog zijn. De werkgeversrisico’s bij ziekteverzuim zijn dus groot, zeker als het re-integratietraject lang duurt of niet het gewenste resultaat heeft en je werknemer in de WIA (Wet werk en inkomen naar arbeidsvermogen) terechtkomt. Het is verstandig om je als ondernemer goed te laten adviseren over deze risico’s. Een goede ziekteverzuimverzekering vergoedt (een gedeelte van) het loon dat je moet doorbetalen bij ziekte van personeel en biedt vaak dienstverlening bij het voorkomen en verminderen van verzuim. Als een arbodienst is opgenomen in het verzekeringspakket, dan kan die in samenwerking met jou een zieke werknemer vanaf de eerste verzuimdag begeleiden.\n\n4. Ongeoorloofd verzuim\n\nHet kan voorkomen dat een werknemer zonder toestemming niet komt werken, soms zelfs zonder dit te melden. Dit heet ongeoorloofd verzuim of 'zwart' verzuim. Een werknemer komt bijvoorbeeld te laat terug van vakantie, neemt zonder jouw toestemming deel aan een stakingsbijeenkomst of blijkt in de gevangenis te zitten. Anders dan bij ziekte geldt in zo’n geval de regel ‘geen arbeid, geen loon’. Je hoeft de werknemer geen salaris te betalen, want hij komt zijn arbeidsovereenkomst niet na. Als werkgever zul je in zo’n geval eerst proberen met je werknemer in contact te komen en om uitleg vragen of hem verzoeken alsnog op het werk te verschijnen. Als dit niet lukt, kun je ontslag overwegen. De kans dat de rechter hiermee akkoord gaat is echter klein. Je kunt een werknemer in zo’n geval pas ontslaan als hij al eerder gewaarschuwd is voor ongeoorloofd verzuim of ander verkeerd gedrag. Dit geldt ook voor een werknemer in gevangenschap, tenzij het strafbare feit waarvoor hij in de gevangenis zit een relatie heeft tot het werk.\n\nVerzuim in kleuren\n\nEr wordt ook wel gesproken over wit, zwart en grijs verzuim. Wat is dat nu precies?\n\nWit verzuim: Je werknemer kan niet werken omdat hij echt ziek is.\n\nZwart verzuim: Je werknemer meldt zich onterecht ziek, bijvoorbeeld omdat hij op vakantie is.\n\nGrijs verzuim: Je werknemer is bijvoorbeeld licht verkouden en kan eigenlijk wel werken, maar meldt zich toch ziek.\n\nVerzuim door een sportongeval\n\nSporten is gezond en vermindert over het algemeen het arbeidsverzuim van werknemers. Werknemers kunnen tijdens het sporten echter wel geblesseerd raken, waardoor ze enige tijd niet kunnen werken. Zij mogen zich in zo’n geval gewoon ziek melden. Jij als werkgever moet dit als een normale ziekmelding behandelen: je meldt je werknemer binnen vier dagen ziek bij de bedrijfsarts en betaalt het loon gewoon door. Als je werknemer herhaaldelijk geblesseerd raakt bij het sporten en hierdoor meermalen verzuimt, heb je als werkgever het recht hem formeel hierop te wijzen en hem te vragen met de sport te stoppen. Je kunt de werknemer echter niet ontslaan wegens herhaaldelijk verzuim door een sportongeval.",
			questions: [
				q(
					2024,
					12,
					'Wanneer spreken we van langdurend ziekteverzuim?',
					{
						A: 'als een werknemer drie weken of langer ziek is',
						B: 'als een werknemer zes weken of langer ziek is',
						C: 'als een werknemer een half jaar of langer ziek is'
					},
					'B'
				),
				q(
					2024,
					13,
					'Wat moet de werkgever betalen als een werknemer langdurig ziek is?',
					{
						A: 'alleen de kosten van het re-integratietraject',
						B: 'het volledige loon en een vervangende werknemer',
						C: 'het loon (deels), kosten voor re-integratie en vervanging'
					},
					'C'
				),
				q(
					2024,
					14,
					'Een werknemer meldt zich vaak ziek. Aan welke mogelijke oorzaak wordt in de tekst NIET gerefereerd?',
					{ A: 'een chronische aandoening', B: 'een conflict op het werk', C: 'werkstress' },
					'A'
				),
				q(
					2024,
					15,
					"Op welke manier kan een werkgever ontdekken dat er sprake is van 'grijs verzuim'?",
					{
						A: 'De werkgever laat een bedrijfsarts de werknemer controleren.',
						B: 'De werkgever schakelt een incassobureau in.',
						C: 'Dit staat niet in de tekst.'
					},
					'C'
				),
				q(
					2024,
					16,
					'Een werknemer is voor de tweede keer geblesseerd geraakt bij het voetballen en kan daarom niet werken. Wat kan de werkgever doen?',
					{
						A: 'De werkgever kan de werknemer ontslaan.',
						B: 'De werkgever kan de werknemer formeel vragen om te stoppen met voetballen.',
						C: 'De werkgever kan weigeren het loon door te betalen.'
					},
					'B'
				),
				q(
					2024,
					17,
					'Wat is het doel van deze tekst?',
					{
						A: 'de lezer adviseren over het omgaan met verzuim als werkgever',
						B: 'de lezer informeren over de rechten van werknemers bij verzuim',
						C: 'de lezer waarschuwen dat werknemers zich niet onterecht ziek moeten melden'
					},
					'A'
				)
			]
		},
		{
			name: 'Met deze opleiding heb je echt een voorsprong',
			slug: 'autosportklas',
			intro: 'Deze tekst komt uit een tijdschrift over mbo-opleidingen.',
			text: 'Met deze opleiding heb je echt een voorsprong\n\nDe autosportklas van Newton College is een extra traject voor studenten van de opleiding motorvoertuigentechniek. Alleen de beste studenten van de richting technisch specialist niveau 4 komen in aanmerking. Zij mogen een jaar lang – één raceseizoen – het onderhoud van de wagens doen en in de weekenden mee naar racewedstrijden.\n\nDefensie\n\nDe Tilburgse autosportklas bestaat al veel langer, sinds 1988. Inmiddels heeft de school vier eigen racewagens en staan coureurs in de rij om in de Newton-auto’s te mogen racen. De auto’s worden beschikbaar gesteld door het ministerie van Defensie. Dat hoopt met de autosportklas jongeren warm te maken voor een technische opleiding, en mogelijk een carrière bij Defensie. ‘Maar het is niet zo dat wij nou mensen opleiden voor Defensie’, verduidelijkt docent Bernardo Marelis. Samen met Kate Bitar leidt hij de raceklas. ‘Het is meer een manier om te laten zien dat een technische opleiding leuk en spannend kan zijn.’\n\nAlleen de beste studenten komen daarvoor in aanmerking. ‘Het zijn er nu dertien. We hebben vier auto’s, en het heeft geen zin om met meer dan vier studenten aan één auto te sleutelen.’ Hoe Marelis en Bitar de studenten selecteren? ‘Alleen goede cijfers zijn niet genoeg. Doorzettingsvermogen, discipline en motivatie zijn zeker zo belangrijk. We laten studenten een brief schrijven waarin ze hun motivatie moeten toelichten. We kijken naar resultaten. Maar ook belangrijk zijn onze gesprekken met de mentoren van studenten. Zij kunnen vaak het beste inschatten of iemand geschikt is. Tijdens races draait het om teamwerk. Je moet goed in teams kunnen werken om te kunnen functioneren in de autosportklas.’\n\nVolgens Bitar is het ontwikkelen van dit traject voor excellente studenten niet de grootste uitdaging. De grootste uitdaging is om het vol te houden, in dit geval ook financieel. ‘Tot nu toe zijn we daar steeds weer in geslaagd, maar het is elk jaar spannend.’ Het raceteam is afhankelijk van sponsoren. Ook Newton College zelf steekt er geld in, omdat het raceteam ook een visitekaartje voor de school is.\n\nEnthousiasme\n\nAbel (17) en Hussam (18) volgen de autosport-opleiding. Hussam zat aanvankelijk op niveau 3, ‘maar toen ik hoorde van de autosportklas, heb ik mijn best gedaan om toch niveau 4 te halen.’ Hij is duidelijk enthousiast. Marelis: ‘Studenten zijn hier soms om tien uur ’s avonds nog op de werkplaats. Dan komt de beveiliging ons vertellen dat ze weg moeten, omdat het alarm erop gaat. Niks mee te maken, zeggen die studenten dan, morgen hebben we een race en de auto’s moeten helemaal klaar zijn.’ Abel: ‘Het staat mooi op je cv als je de autosportklas hebt gedaan. Ik wil wel verder in de race-branche en als je deze opleiding hebt gedaan, heb je echt een voorsprong.’\n\nUitbreiding\n\nHet is onhandig dat het raceseizoen één kalenderjaar loopt, waardoor het extra jaar raceklas noodgedwongen is uitgesmeerd over twee schooljaren: het tweede en het derde jaar. Dat is de enige mogelijkheid, omdat studenten anders later in hun opleiding in de knel komen met stages. Dat betekent dat studenten na hun jaar race-ervaring weer inschuiven bij de opleiding motorvoertuigentechniek. Een andere lastigheid: dit traject is bedoeld als extra traject binnen een bestaande opleiding. Maar als het aan Newton ligt, wordt de autosportklas een op zichzelf staand traject, in plaats van een plusklas binnen de opleiding motorvoertuigentechniek. Lauren Ramos, opleidingsmanager Sector Techniek & Vormgeving, wil onderzoeken wat de mogelijkheden zijn om de autosportklas niet te beperken tot één raceseizoen, maar bijvoorbeeld uit te breiden naar drie seizoenen. ‘We krijgen deze vraag van zowel de studenten als de leerbedrijven.’ Ook wil Ramos bezien in hoeverre de autosportklas zich ook op andere disciplines kan gaan richten. ‘Waarom zouden we bijvoorbeeld geen circuitwedstrijden gaan rijden? Het is de moeite waard hier eens goed naar te kijken.’\n\nInternationalisering\n\nHet traject van de autosportklas moet bij voorkeur tweetalig zijn. Marelis: ‘Want de voertaal in de racewereld is Engels. En onze studenten kunnen dan doorstromen: de enige hbo-opleiding in Europa voor monteurs in de racewereld zit in Engeland.’ Studenten in de autosportklas gaan nu al regelmatig naar het buitenland. Elk jaar zijn er verschillende excursies naar de motorbeurs in Keulen of een trip naar Engeland om daar te bekijken hoe bekende racemerken als M-Sport, Prodrive Le Mans-auto’s en WRC Rally-auto’s het doen. Maar dichter bij huis is natuurlijk ook genoeg te leren. ‘Zo zijn wij regelmatig te gast bij Proflex, het bedrijf dat schokdempers levert aan de rally Parijs-Dakar. Op hun beurt sturen bedrijven hun vakspecialisten naar Tilburg, om hier gastlessen te verzorgen. Zo blijven we op de hoogte van de motorsportbranche en weten we wat de arbeidsmarkt van ons verwacht’, besluit Marelis. ‘Maar het meest leren de studenten in de praktijk, tijdens de races. Elk foutje wordt meteen afgestraft, dat is enorm leerzaam. Alleen wanneer iedereen optimaal presteert, kan het gemeenschappelijke doel worden bereikt: het winnen van de race.’',
			questions: [
				q(
					2024,
					18,
					'Wat is het doel van het ministerie van Defensie met de autosportklas?',
					{
						A: 'jongeren enthousiast maken voor een technische opleiding',
						B: 'jongeren opleiden voor een baan bij Defensie',
						C: 'jongeren laten zien hoe leuk racen is'
					},
					'A'
				),
				q(
					2024,
					19,
					'Wat is het belangrijkste selectiecriterium voor de autosportklas?',
					{
						A: 'goede cijfers',
						B: 'motivatie en doorzettingsvermogen',
						C: 'technische vaardigheden'
					},
					'B'
				),
				q(
					2024,
					20,
					'Waarom is het een uitdaging om de autosportklas in stand te houden?',
					{
						A: 'Er zijn niet genoeg studenten die zich aanmelden.',
						B: 'Het is elk jaar onzeker of er voldoende geld is.',
						C: 'Het is moeilijk om geschikte docenten te vinden.'
					},
					'B'
				),
				q(
					2024,
					21,
					'Waarom besloot Hussam om van niveau 3 naar niveau 4 te gaan?',
					{
						A: 'Alleen niveau 4 studenten mogen meedoen aan de autosportklas.',
						B: 'Zijn docent adviseerde hem om naar niveau 4 te gaan.',
						C: 'Met niveau 4 heeft hij meer kans op een baan.'
					},
					'A'
				),
				q(
					2024,
					22,
					'Waarom loopt het extra jaar autosportklas over twee schooljaren?',
					{
						A: 'omdat de autosportklas te veel lesstof heeft voor een jaar',
						B: 'omdat het raceseizoen een kalenderjaar duurt',
						C: 'omdat studenten anders te weinig tijd voor stages hebben'
					},
					'B'
				),
				q(
					2024,
					23,
					'Waarom zou de autosportklas tweetalig moeten zijn?',
					{
						A: 'Veel studenten in de autosportklas zijn buitenlands.',
						B: 'In de racewereld wordt voornamelijk Engels gesproken.',
						C: 'De excursies zijn naar het buitenland.'
					},
					'B'
				),
				q(
					2024,
					24,
					'Wat is het doel van deze tekst?',
					{
						A: 'de lezer enthousiast maken over de autosportklas van Newton College',
						B: 'de lezer informeren over de voor- en nadelen van de autosportklas',
						C: 'de lezer overtuigen om een technische opleiding te gaan doen'
					},
					'A'
				)
			]
		},
		{
			name: 'Arbeidsmarkt: jongere op zoek naar zekerheid, oudere naar uitdaging',
			slug: 'arbeidsmarkt',
			intro:
				'Dit krantenartikel gaat over de verschillen in wensen tussen jongeren en ouderen bij het zoeken naar werk.',
			text: 'Arbeidsmarkt: jongere op zoek naar zekerheid, oudere naar uitdaging\n\nJonge sollicitanten vinden arbeidsvoorwaarden belangrijker dan de inhoud van hun toekomstige werk. Ze zoeken vooral stabiliteit en zekerheid. Lichamelijk actief werk is de enige inhoudelijke wens uit hun top 5. Ouderen zoeken eerder naar uitdagend werk. Dit blijkt uit onderzoek van adviesbureau Arda onder 1200 werkzoekenden (m/v) van alle leeftijden. Onderzoeker Samir van Veen vroeg hun wat ze belangrijk vinden in een baan. Hij onderzocht 19 aandachtspunten waaronder het salaris en het maken van carrière. De resultaten zijn soms verrassend.\n\nInteresse in werk\n\nOnder de werkzoekenden zeggen jongeren eerder dan ouderen interesse in hun werk te verliezen. Van de jongeren tot 24 jaar vindt 26 procent creatief denken belangrijk, terwijl van de 45-plussers 59 procent dat juist het allerbelangrijkst vindt. Maar liefst 70 procent van de jongeren noemt zekerheid en stabiliteit als grootste wens. In de top 5 van de 45-plussers komt die wens niet eens voor. Van Veen: “We denken al gauw dat vooral jongeren willen bijdragen aan vernieuwing en creativiteit. Het zijn echter eerder ouderen die dat belangrijk vinden. Onder werklozen is het voor 50-plussers vaak heel lastig om werk te vinden. Toch willen juist zij zich ontwikkelen. Ook denken we vaak dat jongeren eerder risico’s willen nemen dan ouderen. Maar het tegenovergestelde is waar.”\n\nFinanciële basis\n\nVera Tames van ouderenuitzendbureau Plustalent gelooft niet dat ouderen ambitieuzer zijn dan jongeren. Veel 45-plussers hebben een financiële basis. Dat maakt het eenvoudiger om te zeggen dat ze creatief bezig willen zijn. Tames: “Ouderen voelen zich op hun vijftigste te fit om niets te doen. Na een werkloos jaar is thuis hun tuintje wel weer netjes en hun schuur geverfd. Vaak gaan ze dan doen wat ze écht willen. Waar ouderen al een carrière achter zich hebben, staan jongeren aan de start.”\n\nBang voor toekomst\n\nMarcia Bregman van vakbond FNV: “Jongeren zijn bang voor de toekomst. Ze maken zich zorgen: de wereld verandert misschien niet, maar de arbeidsmarkt wel. Een vast contract heb je niet zomaar. Werkgevers kunnen steeds gemakkelijker van hun werknemers af. Als je een huis of kinderen wilt, wordt zekerheid belangrijker.”\n\nAvontuurlijke karakter\n\nVan Veen adviseert werkgevers die zoeken naar jong personeel om rekening te houden met de uitkomsten van zijn onderzoek: “Je bereikt jonge werkzoekenden niet door alleen maar het avontuurlijke karakter van een baan te benadrukken.”\n\nTop 5 wensen bij het zoeken naar werk\n\nJongeren tot 24 jaar\n1. zekerheid en stabiliteit\n2. fysiek actief zijn\n3. aandacht\n4. balans privé en werk\n5. financiële beloning\n\nOuderen vanaf 45 jaar\n1. creatief denken\n2. analyseren\n3. concrete resultaten\n4. beïnvloeden\n5. kwaliteit',
			questions: [
				q(
					2024,
					25,
					'Wat vinden jongeren het belangrijkst bij het zoeken naar werk?',
					{ A: 'een goed salaris', B: 'lichamelijk actief werk', C: 'zekerheid en stabiliteit' },
					'C'
				),
				q(
					2024,
					26,
					'Wat is een verrassende uitkomst van het onderzoek?',
					{
						A: 'Jongeren zijn meer op zoek naar zekerheid dan ouderen.',
						B: 'Ouderen willen meer verdienen dan jongeren.',
						C: 'Jongeren vinden salaris belangrijker dan de inhoud van het werk.'
					},
					'A'
				),
				q(
					2024,
					27,
					'Waarom vinden ouderen creativiteit belangrijker dan jongeren, volgens Vera Tames?',
					{
						A: 'Ouderen hebben meer werkervaring en dus meer ideeën.',
						B: 'Ouderen hebben al een financieel fundament en kiezen dus eerder voor inhoud.',
						C: 'Ouderen zijn ambitieuzer dan jongeren.'
					},
					'B'
				),
				q(
					2024,
					28,
					'Waarom zijn jongeren bang voor de toekomst, volgens Marcia Bregman?',
					{
						A: 'De wereld verandert te snel voor hen.',
						B: 'Het is voor jongeren steeds moeilijker om een vast contract te krijgen.',
						C: 'Jongeren vinden geen baan die bij hen past.'
					},
					'B'
				),
				q(
					2024,
					29,
					'Wat adviseert Van Veen aan werkgevers die jong personeel zoeken?',
					{
						A: 'benadruk het avontuurlijke karakter van de baan',
						B: 'bied een goed salaris en veel vakantiedagen',
						C: 'bied zekerheid en stabiliteit'
					},
					'C'
				),
				q(
					2024,
					30,
					'Wat is het doel van deze tekst?',
					{
						A: 'de lezer informeren over de verschillende wensen van jongere en oudere werkzoekenden',
						B: 'de lezer overtuigen dat jongeren betere werknemers zijn dan ouderen',
						C: 'de lezer adviseren hoe je het beste werk kunt zoeken'
					},
					'A'
				)
			]
		},
		{
			name: 'Abonnement Wonderrijk',
			slug: 'abonnement-wonderrijk',
			intro: 'Deze tekst staat op de website van Wonderrijk, een groot attractiepark.',
			text: 'Abonnement Wonderrijk\n\nMet een abonnement kun je zo vaak als je wilt ons pretpark bezoeken. Dat worden nóg meer ritjes in allerlei attracties voor jong en oud. Vanaf 6 bezoeken per jaar is een abonnement voordeliger dan losse entreekaartjes en voor kinderen t/m 3 jaar is het abonnement helemaal gratis. Een abonnement is altijd minimaal 12 maanden geldig vanaf de dag van aankoop. In welke periode van het jaar je een abonnement koopt, maakt dus niet uit. Een pasfoto meenemen is niet nodig als de abonnementhouder er zelf bij is. Er wordt dan bij de kassa een foto genomen.\n\nVOORWAARDEN ABONNEMENT\n\n1. Abonnement algemeen en toegang tot het park\n\n1.1 Breng het abonnement bij elk parkbezoek mee. Bij de hoofdingang dien je je abonnement persoonlijk te overhandigen aan de controleur. Deze controleert of je pas geldig is. Bovendien wordt aan de hand van de foto op het abonnement gecontroleerd of je daadwerkelijk de abonnementhouder bent. Hoewel jouw gegevens als abonnementhouder geregistreerd staan, wordt de toegang geweigerd als je het abonnement niet kan tonen.\n\n1.2 Als bij visuele controle blijkt dat je op de foto, welke je op je abonnement wenst te plaatsen, niet duidelijk herkenbaar bent, heeft Wonderrijk de bevoegdheid je te vragen een nieuwe foto te laten maken bij de Gastenservice. De mening van de Wonderrijk is hierbij bepalend.\n\n1.3 Een abonnement is strikt persoonlijk en niet overdraagbaar. Het is niet mogelijk om abonnementen tijdens de vaste of minimale looptijd om te zetten in een andere abonnementsvorm. Per persoon kan slechts één abonnement aangeschaft worden.\n\n1.4 Als abonnementhouder kun je gebruikmaken van enkele voordelen. Deze voordelen en de voorwaarden hiervan zijn terug te vinden op www.wonderrijk.com/abonnementen.\n\n1.5 Bij oneigenlijk gebruik van het abonnement en/of wangedrag in het park, wordt het abonnement door Wonderrijk in beslag genomen of geblokkeerd. Bij inbeslagname of blokkering van het abonnement wordt het abonnementsgeld niet teruggegeven.\n\n1.6 Eenieder voor wie of door wie een abonnement wordt aangeschaft bij de Gastenservice, dient zich te legitimeren.\n\n1.7 Kinderen tot en met 3 jaar mogen het park gratis bezoeken en hebben de mogelijkheid een gratis abonnement aan te schaffen (zie 2.1).\n\n1.8 Bij het betreden van het park is het Parkreglement van toepassing. Het Parkreglement hangt ter inzage bij de hoofdingang en is te lezen op www.wonderrijk.com/voorwaarden.\n\n2. Abonnementen tegen lager tarief\n\n2.1 Kinderen tot 4 jaar\n\nIndien een ouder/voogd abonnementhouder is, dan bestaat de mogelijkheid een gratis abonnement aan te schaffen voor kinderen tot en met 3 jaar. Het abonnement start vanaf datum aanschaf en eindigt op dezelfde datum als het abonnement van de ouder/voogd of – indien eerder - wanneer het kind 4 jaar wordt.\n\n2.2 Kinderen die 4 jaar worden\n\nVoor kinderen die 4 jaar worden kan soms een speciaal 4-jarigenabonnement worden gekocht. Dat is een abonnement met een lager tarief dan een normaal abonnement. Dit kan alleen worden gekocht indien ouder/voogd een jaarabonnement heeft en dit direct bij aanschaf volledig betaald heeft. Dit abonnement start vanaf de vierde verjaardag en eindigt tegelijk met het abonnement van de ouder/voogd.\n\n2.3 Aanschaf abonnement minderjarigen\n\nIndien de abonnementhouder onder de 18 jaar is, dient een ouder of voogd tevens te tekenen en aanwezig te zijn bij het moment van aanschaf bij de Gastenservice.\n\n2.4 60+’ers\n\nAls 60+’er kom je in aanmerking voor een abonnement tegen een lager tarief.\n\n3. Parkeerabonnement\n\n3.1 Als je onbeperkt wilt parkeren gedurende de looptijd van je abonnement, kun je kiezen voor een parkeerabonnement.\n\n3.2 Het parkeerabonnement geeft de persoon met een geldig rijbewijs de mogelijkheid gebruik te maken van het parkeerterrein voor één auto per dag, uitsluitend in combinatie met een parkbezoek.\n\n3.3 De eigenaar van het parkeerabonnement dient bij gebruik zelf aanwezig te zijn.\n\n3.4 Een parkeerabonnement geeft bij grote drukte geen voorrang of garantie op een parkeerplaats. Indien er geen parkeerplaats (meer) beschikbaar is, kun je je abonnementsgeld niet terugvragen.\n\n3.5 Het is niet toegestaan het parkeerabonnement uit te lenen aan derden of anders te gebruiken dan volgens hierboven genoemde voorwaarden.\n\n3.6 Je dient de aanwijzingen van de dienstdoende parkeerwachters op te volgen.\n\n3.7 Parkeren met een parkeerabonnement is enkel toegestaan tijdens de reguliere openingstijden van het attractiepark.\n\n3.8 Wanneer je een parkeerabonnement hebt aangeschaft, is deze verwerkt in je abonnementspas. Bij het verlaten van het parkeerterrein kun je gebruik maken van alle slagbomen. Wanneer je je abonnementspas voor de scanner houdt, gaat de slagboom omhoog.\n\n3.9 Het parkeerabonnement is alleen geldig in combinatie met een parkbezoek. Het oprijden van het parkeerterrein is niet meer toegestaan vanaf één uur voor sluitingstijd van het attractiepark. Kijk voor de actuele openingstijden op www.wonderrijk.com.\n\n4. Geldigheid en duur abonnement\n\n4.1 Je sluit het abonnement af voor één jaar. Heb je het abonnement in één keer betaald? Dan stopt het na een jaar automatisch. Indien je een abonnement met maandelijkse betaling hebt afgesloten, loopt het abonnement na het eerste jaar door voor onbepaalde tijd. Hierna is het abonnement tegen de laatste dag van de lopende kalendermaand op te zeggen. Er geldt een opzegtermijn van één kalendermaand. De dag van aanschaf geldt als eerste dag van het abonnement. Voor kinderen tot 4 jaar geldt een aangepaste minimale looptijd van het abonnement (zie voorwaarden artikel 2.1).\n\n4.2 Het abonnement is enkel geldig tijdens de reguliere openingstijden van het attractiepark. Deze tijden zijn te vinden op www.wonderrijk.com/openingstijden.\n\n4.3 Voor ieder kalenderjaar geldt dat Wonderrijk maximaal veertien dagen per jaar, in de maanden januari, februari, maart, november en december, mag gebruiken voor bedrijfsevenementen. Op deze dagen is je abonnement niet geldig. Deze dagen worden minimaal drie maanden voorafgaand aan de betreffende dagen door Wonderrijk gepubliceerd op www.wonderrijk.com/abonnementen. Houd de website hiervoor in de gaten.\n\n4.4 Bij verlies of diefstal van je abonnement dien je hiervan direct melding te maken via telefoonnummer +31 116 53 7447. Om misbruik uit te sluiten, wordt je abonnement direct geblokkeerd.\n\n4.5 In het geval van verlies, diefstal of beschadiging kun je een kopie van je abonnement aanvragen bij de Gastenservice van Wonderrijk. De administratiekosten voor een kopie bedragen € 7,- per abonnement.\n\n5. Opzegging\n\n5.1 Na het verstrijken van de minimale looptijd van een abonnement dat per maand betaald wordt, wordt dit abonnement automatisch omgezet in een abonnement voor onbepaalde tijd, dus zonder einddatum. Vervolgens geldt een opzegtermijn van één kalendermaand.\n\n5.2 Opzeggen kan door het opzegformulier op www.wonderrijk.com/abonnementen in te vullen, te ondertekenen en te e-mailen naar abonnementen@wonderrijk.com of ingevuld en ondertekend per post te versturen naar Wonderrijk, Postbus 12, 5570 AA Bloemenoord, onder vermelding van “opzegging abonnement”, het abonnementsnummer en je adresgegevens. Opzegging is tevens mogelijk bij de Gastenservice.\n\n6. Prijs/wijzigingen\n\nWonderrijk kan de prijs van je abonnement aanpassen. Deze wijziging wordt pas doorgevoerd wanneer de minimale looptijd van twaalf maanden is verstreken. Wanneer je abonnement daarna per kalendermaand opzegbaar is, word je minimaal één maand van te voren geïnformeerd. Tevens kunnen de abonnementsvoorwaarden worden gewijzigd.\n\n7. Privacystatement\n\nDe door jou verstrekte gegevens zullen door Wonderrijk volgens de Wet Bescherming Persoonsgegevens worden behandeld. Kijk voor meer informatie op www.wonderrijk.com/privacy.\n\n8. Meer weten?\n\nVoor meer informatie over abonnementen op Wonderrijk kun je bellen met +31 116 53 7447, e-mailen naar abonnementen@wonderrijk.com of je kan de Gastenservice bij de hoofdentree bezoeken. De Gastenservice is geopend tijdens de openingstijden van Wonderrijk.',
			questions: [
				q(
					2024,
					31,
					'Op welke manier kun je een abonnement NIET opzeggen?',
					{ A: 'bij de Gastenservice', B: 'per e-mail', C: 'telefonisch' },
					'C'
				),
				q(
					2024,
					32,
					'Jan heeft een abonnement in een keer betaald. Na een jaar wil hij zijn abonnement verlengen. Wat moet hij doen?',
					{
						A: 'Hij hoeft niets te doen, het abonnement loopt automatisch door.',
						B: 'Hij moet een nieuw abonnement kopen.',
						C: 'Hij moet het abonnement verlengen bij de Gastenservice.'
					},
					'B'
				),
				q(
					2024,
					33,
					'Fatima is 62 jaar. Zij wil een abonnement kopen bij de Gastenservice. Wat moet zij meenemen?',
					{
						A: 'een legitimatiebewijs',
						B: 'een legitimatiebewijs en een pasfoto',
						C: 'een pasfoto'
					},
					'A'
				),
				q(
					2024,
					34,
					'Wanneer mag je NIET parkeren met een parkeerabonnement?',
					{
						A: 'als het parkeerterrein bijna vol is',
						B: 'kort voor sluitingstijd van het park',
						C: 'op dagen dat het park gesloten is voor bedrijfsevenementen'
					},
					'B'
				),
				q(
					2024,
					35,
					'Wat gebeurt er als je een abonnement met maandelijkse betaling hebt en de eerste 12 maanden zijn voorbij?',
					{
						A: 'Het abonnement stopt automatisch.',
						B: 'Het abonnement loopt door en je kunt het per maand opzeggen.',
						C: 'Je krijgt een herinnering om het abonnement te verlengen.'
					},
					'B'
				)
			]
		}
	]
};

export const LEZEN_2023: LezenExam = {
	year: 2023,
	totalQuestions: 35,
	passingScore: 23,
	passages: [
		{
			name: 'Vijf fabels over mbo-opleidingen van Ameda',
			slug: 'vijf-fabels',
			intro:
				'Deze tekst staat op de website van onderwijsinstelling Ameda. Je kan bij Ameda een thuisstudie doen. Deze tekst gaat over de mbo-opleidingen van Ameda.',
			text: 'Vijf fabels over mbo-opleidingen van Ameda\n\nVoor het mbo heb je alleen je handen nodig, geen hersens.\n\nI Niet waar. Bij Ameda vind je 29 erkende mbo-opleidingen die je perfect voorbereiden op het bedrijfsleven, variërend van boekhouder en kinderleidster tot dierenartsassistent en beveiliger. Je leert allerlei taken uit te voeren. Kies je bijvoorbeeld voor de opleiding Dierenartsassistent? Dan leer je niet alleen alles over operatie-instrumenten en de hygiëne bij operaties; je doet ook communicatieve vaardigheden op en je leert onder meer bepaalde receptiewerkzaamheden uitvoeren. De mbo-opleidingen van Ameda bereiden je dus voor op alle aspecten van een beroep!\n\nBij Ameda zit tussen onderwijs en praktijk een wereld van verschil.\n\nII Onjuist! Ameda bepaalt samen met het bedrijfsleven aan welke eisen bepaalde opleidingen moeten voldoen en over welke inzichten, kennis en vaardigheden je aan het einde van de opleiding moet beschikken. Doordat het onderwijs en de praktijk juist wél goed op elkaar aansluiten, heb je als mbo-student nadat je je diploma hebt behaald een heel grote kans om supersnel een baan te vinden. Dat is ook logisch, want tijdens je opleiding word je uitstekend voorbereid op de praktijk!\n\nAmeda-studenten zijn een nummer, ze krijgen geen individuele begeleiding.\n\nIII Zeker niet! Een Ameda-opleiding is ingericht als individueel leertraject. Kies je voor een mbo-opleiding van Ameda, dan krijg je tijdens je opleiding professionele begeleiding van deskundige docenten uit het vakgebied. Zij geven je feedback en kijken je huiswerkopdrachten na, doorgaans binnen 48 uur. En heb je vragen? Dan kun je natuurlijk ook altijd bij je docent terecht. En vind je het fijn om met je medestudenten van gedachten te wisselen? Dat kan via Ameda Campus, de digitale leeromgeving van Ameda!\n\nEen mbo-diploma van Ameda is niet erkend.\n\nIV Echt niet! Alle mbo-opleidingen van Ameda:\n- staan onder toezicht van de Inspectie van het Onderwijs;\n- zijn geregistreerd bij het Centraal Register Beroepsopleidingen (CREBO);\n- zijn erkend door het ministerie van Onderwijs, Cultuur en Wetenschap (OC&W). Mbo-opleidingen van Ameda vallen onder de Wet Educatie en Beroepsonderwijs (WEB). Dit houdt in dat het door de minister erkende opleidingen zijn, die geheel voldoen aan de kwaliteitseisen die de overheid aan officiële mbo-opleidingen stelt. Een mbo-diploma van Ameda heeft dus exact dezelfde waarde als dat van bijvoorbeeld een ROC. Jaarlijks volgen ruim 5000 studenten een mbo-opleiding bij Ameda. Dit maakt Ameda tot één van de grootste mbo-opleiders van Nederland!\n\nBij Ameda loop je geen stage.\n\nV Niet waar! De beroepspraktijkvorming (BPV) vormt een belangrijk onderdeel van je opleiding. Tijdens de stage pas je de opgedane theorie toe in de praktijk van je toekomstige beroep. Hierdoor doe je bepaalde vaardigheden op die je alleen in de praktijk kunt leren en krijg je een uitstekend beeld van de dagelijkse gang van zaken van je (toekomstige) beroep! Tijdens de BPV word je intensief begeleid door een praktijkbegeleider, een ervaren medewerker van het bedrijf waar je werkt. Bovendien krijg je door Ameda ook een BPV-begeleider toegewezen. De BPV-begeleider geeft jou en je praktijkbegeleider tussentijds feedback en advies!',
			questions: [
				q(
					2023,
					1,
					'Wat is het doel van deze tekst?',
					{
						A: 'de lezer overtuigen dat Ameda goed onderwijs biedt',
						B: 'de lezer informeren over de opleidingen bij Ameda',
						C: 'de lezer uitleggen hoe de mbo-opleidingen in Nederland zijn geregeld'
					},
					'A'
				),
				q(
					2023,
					2,
					'Wat is het belangrijkste verschil tussen Ameda en een ROC?',
					{
						A: 'Ameda biedt meer begeleiding.',
						B: 'Ameda biedt ook thuisonderwijs aan.',
						C: 'Er is geen verschil in de waarde van het diploma.'
					},
					'C'
				),
				q(
					2023,
					3,
					'Wat is een BPV-begeleider?',
					{
						A: 'een begeleider van Ameda die de student en het stagebedrijf ondersteunt',
						B: 'een begeleider van het stagebedrijf die de student begeleidt',
						C: 'een docent van Ameda die de student lesgeeft'
					},
					'A'
				),
				q(
					2023,
					4,
					'Wat is Ameda Campus?',
					{
						A: 'een gebouw waar studenten les krijgen',
						B: 'een online omgeving om met medestudenten te communiceren',
						C: 'een organisatie die stageplaatsen regelt'
					},
					'B'
				),
				q(
					2023,
					5,
					'Wat wordt in de tekst beweerd over de opleiding Dierenartsassistent?',
					{
						A: 'De opleiding leert je alleen medische vaardigheden.',
						B: 'De opleiding bereidt je voor op verschillende taken.',
						C: 'De opleiding duurt langer dan andere mbo-opleidingen.'
					},
					'B'
				)
			]
		},
		{
			name: 'De rol van de ondernemingsraad',
			slug: 'ondernemingsraad',
			intro:
				'Deze tekst komt uit een studieboek. De tekst gaat over een ondernemingsraad in een bedrijf.',
			text: 'De rol van de ondernemingsraad\n\nTaken\n\nEen ondernemingsraad (OR) bestaat uit werknemers die namens het personeel overleg voeren met de werkgever. Zij overleggen over het ondernemingsbeleid en de personeelsbelangen. De OR moet de wensen van de werknemers aan de werkgever duidelijk maken. Daar hoort bijvoorbeeld bij:\n• werkoverleg bevorderen;\n• zorgen voor goede arbeidsomstandigheden;\n• zorgen voor de naleving van voorschriften op het gebied van de arbeidsvoorwaarden, arbeidstijden en rusttijden;\n• interne milieuzorg;\n• gelijke behandeling van vrouwen en mannen;\n• inschakeling van werknemers met een beperking.\n\nOverlegvergadering\n\nMinstens twee keer per jaar bespreken de OR en de werkgever in de overlegvergadering de algemene gang van zaken van de onderneming. De werkgever deelt mee welke belangrijke besluiten hij voorbereidt over financiën of de organisatie en spreekt met de OR af wanneer en hoe de OR in de besluitvorming wordt betrokken.\n\nSchriftelijke afspraken\n\nDe OR en de werkgever hebben ruimte om eigen afspraken te maken. Deze afspraken kunnen bijvoorbeeld gaan over de nadere uitwerking van wettelijke verplichtingen of over het toekennen van extra bevoegdheden en/of voorzieningen. De afspraken moeten schriftelijk worden vastgelegd, bijvoorbeeld in een apart document (de ondernemingsovereenkomst) of in goedgekeurde notulen van de overlegvergadering.\n\nAchterban raadplegen\n\nDe OR kan bij belangrijke kwesties de werknemers van het bedrijf (de achterban van de OR) raadplegen. De werkgever dient de OR in staat te stellen de werknemers van het bedrijf te raadplegen en dient dus ook de werknemers in de gelegenheid te stellen hieraan mee te werken.\n\nBevoegdheden\n\nDe OR heeft vier bevoegdheden, namelijk:\n• adviesrecht\n• instemmingsrecht\n• initiatiefrecht\n• informatierecht\n\nAdviesrecht\n\nDe werkgever moet een adviesaanvraag schriftelijk aan de OR voorleggen. Hij moet dit tijdig doen zodat het advies van de OR echt van invloed kan zijn op het besluit. De werkgever moet de OR om advies vragen als hij:\n• een belangrijk besluit wil nemen, zoals bij financiële en organisatorische zaken (bijvoorbeeld over een grote investering, een fusie of andere vorm van samenwerking met een andere onderneming of sluiting van -een deel van- de onderneming);\n• een ingrijpende technologische voorziening wil invoeren of wijzigen;\n• belangrijke milieumaatregelen wil treffen;\n• een belangrijk krediet wil geven aan een andere onderneming of zich garant stelt voor een grote schuld van een andere onderneming;\n• bestuurders wil benoemen of ontslaan. De OR kan het oneens zijn met de plannen van de werkgever. De OR krijgt dan een maand de tijd om de zaak voor te leggen aan de Ondernemingskamer van het gerechtshof te Amsterdam. Die beoordeelt of het besluit redelijk is. De Ondernemingskamer kan de werkgever verplichten het besluit in te trekken of de gevolgen ervan ongedaan te maken.\n\nInstemmingsrecht\n\nIn bepaalde gevallen moet een werkgever instemming verkrijgen van de OR, dat wil zeggen dat de OR toestemming geeft voor het besluit. De werkgever moet de OR instemming vragen voor het vaststellen, wijzigen of intrekken van:\n• regelingen voor werktijden, vakantie, arbeidsomstandigheden, personeelsopleidingen, personeelsbeoordelingen;\n• regels voor het aanstellen, bevorderen of ontslaan van medewerkers;\n• een beloningssysteem of functiewaarderingssysteem;\n• een personeelsvolgsysteem of registratiesysteem;\n• de registratie van, omgang met en bescherming van persoonsgegevens;\n• regelingen voor ziekteverzuim. Als de OR niet instemt met een besluit van de werkgever, kan de werkgever de bedrijfscommissie om hulp vragen. Heeft dit geen resultaat, dan kan de werkgever de kantonrechter toestemming vragen voor zijn besluit. De kantonrechter geeft alleen toestemming als:\n• de beslissing van de ondernemingsraad onredelijk is;\n• de werkgever zijn besluit neemt vanwege zwaarwegende redenen. De werkgever kan de regeling niet invoeren zonder de instemming van de OR of de toestemming van de kantonrechter.\n\nInitiatiefrecht\n\nDe OR mag op eigen initiatief de werkgever voorstellen doen over alle sociale, organisatorische, financiële en economische zaken van de onderneming. Voordat de werkgever over het voorstel beslist, moet hij minstens één keer met de OR overleggen. Na dit overleg moet de werkgever zo snel mogelijk schriftelijk en gemotiveerd aan de OR meedelen of hij het voorstel overneemt.\n\nInformatierecht\n\nDe werkgever heeft de plicht ongevraagd informatie te geven over de jaarrekening, het sociaal jaarverslag en beleidsplannen. Daarnaast moet de werkgever alle informatie geven waar de OR om vraagt. Dat wil zeggen: als de OR die informatie nodig heeft om zijn taak te kunnen uitvoeren. Wil de werkgever de informatie niet geven, dan kan de OR de bedrijfscommissie vragen te bemiddelen.',
			questions: [
				q(
					2023,
					6,
					'Hoe vaak moet de werkgever met de OR vergaderen over de gang van zaken?',
					{ A: 'elke maand', B: 'minimaal twee keer per jaar', C: 'vier keer per jaar' },
					'B'
				),
				q(
					2023,
					7,
					'De werkgever wil een nieuw personeelsvolgsysteem invoeren. Wat moet hij doen?',
					{
						A: 'advies vragen aan de OR',
						B: 'de OR informeren over zijn plannen',
						C: 'instemming vragen aan de OR'
					},
					'C'
				),
				q(
					2023,
					8,
					'De OR is het niet eens met een belangrijk besluit van de werkgever. Wat kan de OR doen?',
					{
						A: 'de bedrijfscommissie om hulp vragen',
						B: 'de zaak voorleggen aan de Ondernemingskamer',
						C: 'het besluit tegenhouden door niet in te stemmen'
					},
					'B'
				),
				q(
					2023,
					9,
					'De werkgever wil een belangrijke regeling invoeren. De OR stemt niet in. De werkgever vraagt de kantonrechter om toestemming. Wanneer geeft de kantonrechter toestemming?',
					{
						A: 'als de OR geen goede reden heeft om niet in te stemmen',
						B: 'als de werkgever bewijst dat de regeling nodig is',
						C: 'allebei'
					},
					'C'
				),
				q(
					2023,
					10,
					'Wat is het initiatiefrecht van de OR?',
					{
						A: 'De OR mag de werkgever voorstellen doen over alles wat met de onderneming te maken heeft.',
						B: 'De OR mag zelf beslissingen nemen over het personeelsbeleid.',
						C: 'De OR mag zelf vergaderingen organiseren met het personeel.'
					},
					'A'
				),
				q(
					2023,
					11,
					'Wat is het doel van deze tekst?',
					{
						A: 'de lezer informeren over de rechten en taken van een ondernemingsraad',
						B: 'de lezer overtuigen van het belang van een ondernemingsraad',
						C: 'de lezer uitleggen hoe je een ondernemingsraad opricht'
					},
					'A'
				)
			]
		},
		{
			name: 'Maakt geld ons gelukkig?',
			slug: 'maakt-geld-ons-gelukkig',
			intro:
				'Dit artikel uit een tijdschrift gaat over de vraag of we ons gelukkiger gaan voelen als we rijker worden.',
			text: 'MAAKT GELD ONS GELUKKIG?\n\nRijker, dus gelukkiger?\n\nWie rijker wordt, wordt gelukkiger. Maar als een samenleving als geheel meer gaat verdienen, wordt daar niemand gelukkiger van. Bijvoorbeeld Amerikanen, Japanners en Europeanen werden in de afgelopen vijftig jaar gemiddeld veel rijker maar niet gelukkiger. Dat geldt dus ook voor Nederlanders. Dit blijkt uit onderzoek naar het verband tussen rijkdom en mate van geluksgevoel. Professor Richard Layard van de London School of Economics dook in psychologie-, sociologie- én economiestudies om deze onderzoeksresultaten nader te verklaren.\n\nGewenning\n\nEen verklaring is gewenning: we gaan een betere levensstandaard al gauw als gewoon ervaren. Een verbetering maakt ons voor even gelukkig, maar dat effect verdwijnt snel. In een Nederlandse woning eind jaren zestig van de vorige eeuw was centrale verwarming een luxe. Intussen vinden we dit al lang normaal, of zelfs een noodzaak.\n\nVergelijken met buren\n\nEen tweede en veel belangrijkere verklaring vond professor Layard in onze neiging om onze eigen situatie te vergelijken met die van anderen. Aan studenten werd gevraagd waaraan ze de voorkeur zouden geven: aan € 50.000 per jaar terwijl anderen de helft kregen, of aan € 100.000 per jaar terwijl anderen twee keer zoveel ontvingen. De meerderheid koos voor het eerste. Ze kregen liever het lagere bedrag zolang dat meer was dan wat anderen ontvingen. We vinden een vergelijking van onze inkomsten met die van anderen belangrijker dan ons feitelijke inkomen op zich. Onze tevredenheid over een inkomensverbetering verdwijnt zodra we horen dat een collega nog meer salarisverhoging krijgt. Maar we worden er ook niet gelukkiger van als we met z’n allen meer gaan werken om meer te kunnen verdienen en uitgeven. Erger nog: dat kan ons zelfs ongelukkiger maken.\n\nVrije tijd\n\nAan dezelfde studenten werd ook gevraagd om te kiezen tussen twee weken vrij terwijl anderen slechts één week kregen, ofwel vier weken vrij terwijl anderen acht weken kregen. Ditmaal koos een duidelijke meerderheid voor het laatste. We wedijveren over ons inkomen, maar niet over onze vrije tijd.',
			questions: [
				q(
					2023,
					12,
					'Wat is de belangrijkste conclusie van het onderzoek van professor Layard?',
					{
						A: 'Als een hele samenleving rijker wordt, worden de mensen niet gelukkiger.',
						B: 'Rijke mensen zijn altijd gelukkiger dan arme mensen.',
						C: 'Vrije tijd maakt mensen gelukkiger dan geld.'
					},
					'A'
				),
				q(
					2023,
					13,
					"Wat wordt bedoeld met 'gewenning' in deze tekst?",
					{
						A: 'dat mensen hun geld steeds sneller uitgeven',
						B: 'dat mensen een hogere levensstandaard snel normaal gaan vinden',
						C: 'dat mensen wennen aan het vergelijken met anderen'
					},
					'B'
				),
				q(
					2023,
					14,
					'De studenten kozen liever € 50.000 als anderen de helft kregen, dan € 100.000 als anderen twee keer zoveel ontvingen. Wat laat dit zien?',
					{
						A: 'dat mensen niet om geld geven',
						B: 'dat mensen liever minder hebben als ze daarmee meer hebben dan anderen',
						C: 'dat studenten niet goed kunnen rekenen'
					},
					'B'
				),
				q(
					2023,
					15,
					'Hoe verschillen de antwoorden van de studenten over geld en vrije tijd?',
					{
						A: 'Bij geld kiezen ze voor relatief meer dan anderen, bij vrije tijd voor absoluut meer.',
						B: 'Bij geld zijn ze onverschillig, bij vrije tijd kiezen ze altijd voor meer.',
						C: 'Bij geld en vrije tijd kiezen ze allebei voor relatief meer dan anderen.'
					},
					'A'
				),
				q(
					2023,
					16,
					'Wat is het doel van deze tekst?',
					{
						A: 'de lezer adviseren hoe hij gelukkiger kan worden',
						B: 'de lezer informeren over de relatie tussen geld en geluk',
						C: 'de lezer waarschuwen voor de nadelen van rijkdom'
					},
					'B'
				)
			]
		},
		{
			name: 'Emma is dolfijnentrainer',
			slug: 'emma-dolfijnentrainer',
			intro:
				'Deze tekst gaat over het werk van een dolfijnentrainer in het Dolfinarium. Het Dolfinarium is een dierenpark met zeedieren.',
			text: 'Emma is dolfijnentrainer\n\nSommige mensen hebben van die beroepen waarvan je denkt: wat gaaf! In deze rubriek laten we deze mensen aan het woord over hun carrière. Deze keer Emma. Zij is dolfijnentrainer! Emma (28) heeft een niet veelvoorkomende, maar dol-fijne baan. En dit keer vrij letterlijk! Al 4 jaar werkt zij met veel liefde als dolfijnentrainer. “Ondanks dat ik het altijd in mijn achterhoofd heb gehad, had ik nooit verwacht dat ik in dit wereldje terecht zou komen. Totdat ik een oproep zag om mee te doen aan een wedstrijd bij het Dolfinarium.” Ze schreef zich in, kwam en won. “Ik moest acteren, me voorstellen aan de jury, oefenen met een vliegsysteem en nadat ik ook nog een zwem- en fitheidstest had gedaan, had ik gewoon gewonnen! Daarna ging het heel snel. Ik kreeg de kans om daar te werken, en pakte deze kans dan ook met beide handen aan.”\n\nBijzondere baan\n\nAlhoewel ze denkt dat je met een opleiding als Dierenverzorging de meeste kans maakt om dolfijnentrainer te worden, heeft de enthousiaste dierenliefhebber veel verschillende opleidingen gedaan. “Behalve iets met dieren”, zegt ze lachend. “Een gerichte opleiding tot dolfijnentrainer bestaat er niet. Het is geluk hebben en ik ben er plotseling en totaal onverwacht ingerold.” Wat natuurlijk niet betekent dat ze niet dolblij is met deze baan. De Harderwijkse betitelt haar baan als heel bijzonder. “Er zijn maar weinig dolfijnentrainers en het is heel speciaal om één op één met het dier te zijn. Zowel in, als buiten de show. De dolfijnen moeten jou vertrouwen, en als ze jou écht vertrouwen, geven ze zich helemaal over. Die vertrouwensband is echt iets moois!” Ook haar omgeving is te spreken over haar bijzondere baan. “Iedereen reageert enthousiast. Op een verjaardagsfeestje reageren gasten die er niet vanaf weten meestal verbaasd, omdat je het gewoon niet zo vaak hoort. Voor je het weet zijn we dan een uur over mijn baan als dolfijnentrainer aan het praten.”\n\nWerken als dolfijnentrainer\n\n“Hoe mijn werkdag eruitziet hangt ervan af of het Dolfinarium open of dicht is, en van hoeveel shows we hebben als het park open is. Meestal begin ik de dag met voorbereiden. Dit houdt in dat ik begin met schoonmaken, de vis ga snijden, alle attributen klaarleg voor de show en soms hebben we nog een training van tevoren. Na de show loop ik een rondje langs de mensen die meestal even een praatje willen maken of met je op de foto willen. Vervolgens verzamel ik alles weer en bereid ik me voor op de volgende show. Men denkt vaak dat ik alleen maar in het water lig, maar dit is totaal niet zo. Er gebeurt juist veel eromheen.” Behalve allerlei trainingen en voorbereidingen, is Emma ook druk met de dolfijnen zelf. “Elke dag kijken we hoe het gaat met de dieren, ze worden nauwlettend in de gaten gehouden qua gezondheid. Dit doen we door middel van speciale trainingen, door hun temperatuur op te meten en ze te wegen; we zijn altijd druk met ze.”\n\nEen leuke show\n\nOm een goede dolfijnentrainer te zijn moet je dan ook veel in huis hebben. Je bent een bezig bijtje en een echte teamspeler. “Je werkt altijd in een team, dus dat is een vereiste. Behalve dat moet je fysiek in orde, sportief, enthousiast, een dierenliefhebber en een entertainer zijn. Oh, en je moet niet vies zijn van vis, want daar ruik je de hele dag naar.” Ondanks dat Emma niet echt een nadeel ervaart van haar baan, vindt ze de vis toch wel een minpuntje. Ook geeft ze aan dat het lichamelijk best zwaar is. “Je moet een goede conditie hebben. Iedereen ziet een leuke show: je geeft een teken en het dier doet het. Maar zo werkt het niet. Er zit een hele theorie en veel werk achter!”\n\nWel of niet zielig?\n\nDe discussie over dieren in gevangenschap is ons niet ontgaan, dus vroegen we de mening van Emma. Want hoe denkt zij hierover? “Ik vind het zeker niet zielig voor de dieren. Ze doen niks wat ze niet willen. Als ze iets niet leuk vinden, zwemmen ze weg of laten ze duidelijk merken het niet te willen. En als dat zo is, dan gaan we de dieren ook niet in een bepaalde positie duwen. Ook merken we dat ze gelukkig zijn. De dolfijnen paren en krijgen baby’s, en dat is een teken dat ze goed in hun vel zitten. Daarbij worden de dieren in het Dolfinarium veel ouder dan hun soortgenoten in het wild! Zo is de gemiddelde leeftijd waarop een dolfijn overlijdt in het Dolfinarium 25, terwijl dit gemiddelde in het wild rond de 17 ligt”. Emma legt uit dat de dolfijnen geen natuurlijke vijanden hebben en zich vrij kunnen bewegen. Daarnaast is het ook belangrijk om veel liefde voor de dieren te voelen en alles met veel plezier te doen. En dat doen ze! “Al mijn collega’s hebben liefde voor het vak en zodra een dolfijn gaat bevallen, staat het hele team paraat. Al is dit midden in de nacht.”\n\nVan bevalling tot blooper\n\n“Ik maak hier zoveel bijzondere en leuke dingen mee. Tja, van een bevalling tot een blunder! Ik ben vrij onhandig van mezelf en val heel vaak. Dit overkomt me ook vaak tijdens de show. Ach, ik zit er niet mee. Ik probeer gewoon te blijven lachen. Dat is het allerbelangrijkste.” En lachen doet ze veel. Zo veel, dat ze voorlopig ook nog niet weg wil. “Zolang ik het hier leuk vind, blijf ik dit voorlopig nog even doen. Het ligt er een beetje aan hoelang ik dit volhoud. De meesten stoppen rond hun 35e omdat je toch dagelijks voorstellingen geeft en het werk veel energie kost. Ik hoop sowieso in de dierenwereld te blijven werken, maar voor nu hoop ik nog een hele tijd hier te mogen werken.”',
			questions: [
				q(
					2023,
					17,
					'Hoe is Emma dolfijnentrainer geworden?',
					{
						A: 'Ze heeft een opleiding Dierenverzorging gedaan.',
						B: 'Ze heeft een wedstrijd bij het Dolfinarium gewonnen.',
						C: 'Ze heeft gesolliciteerd op een vacature.'
					},
					'B'
				),
				q(
					2023,
					18,
					'Wat vindt Emma het bijzonderst aan haar baan?',
					{
						A: 'de shows die ze geeft',
						B: 'de vertrouwensband met de dolfijnen',
						C: 'het werken in een team'
					},
					'B'
				),
				q(
					2023,
					19,
					'Wat is volgens Emma een nadeel van haar baan?',
					{ A: 'de geur van vis', B: 'het fysiek zware werk', C: 'allebei' },
					'C'
				),
				q(
					2023,
					20,
					'Waarom vindt Emma het niet zielig voor de dolfijnen?',
					{
						A: 'De dolfijnen krijgen veel liefde en aandacht.',
						B: 'De dolfijnen doen niks wat ze niet willen en zijn gelukkig.',
						C: 'De dolfijnen zijn in het Dolfinarium veiliger dan in het wild.'
					},
					'B'
				),
				q(
					2023,
					21,
					'Hoelang denkt Emma nog als dolfijnentrainer te werken?',
					{ A: 'tot haar 35e', B: 'zolang ze het leuk vindt', C: 'ze weet het niet' },
					'B'
				),
				q(
					2023,
					22,
					'Wat is het doel van deze tekst?',
					{
						A: 'de lezer enthousiast maken voor het beroep van dolfijnentrainer',
						B: 'de lezer informeren over het werk en leven van een dolfijnentrainer',
						C: 'de lezer overtuigen dat dolfijnen in het Dolfinarium goed worden behandeld'
					},
					'B'
				)
			]
		},
		{
			name: 'Maak het verschil, word buddy!',
			slug: 'word-buddy',
			intro:
				"Deze tekst komt uit een folder over vrijwilligerswerk en gaat over buddy's. Wat doet een buddy, hoe word je buddy, wat mag je als buddy verwachten en wat wordt van jou als buddy verwacht?",
			text: "Maak het verschil, word buddy!\n\nOnze cliënten hebben een ernstige beperking of zijn langdurig ziek. Zij zoeken een buddy die hen steunt op vrijwillige basis. Deze tekst schetst wat een cliënt van een buddy verwacht en andersom: wat een buddy van een cliënt kan verwachten. “Door mijn ziekte is het spontane van mijn leven af. Toch wil ik er het beste van maken. Ik wil léven. Mijn man heeft een drukke baan. Om toch nog zoveel mogelijk te kunnen doen, zijn hulp en gezelschap van mijn buddy erg fijn.” Aan het woord is Margot. Zij heeft een ernstige chronische ziekte. Zij weet als geen ander dat een buddy een groot verschil maakt voor de kwaliteit van leven.\n\nWat doet een buddy?\n\nEen buddy helpt zijn cliënt zoveel mogelijk uit zijn leven te halen. De cliënt stelt een doel waar hij met hulp van de buddy naartoe werkt. Dit kan gaan om het vergroten van het sociale netwerk of het accepteren van de ziekte. Soms wil de cliënt zijn verhaal kwijt, een andere keer wil hij op pad. De buddy is er om hem te steunen, als maatje. Deze sociaal-emotionele ondersteuning aan iemand met een chronische of levensbedreigende ziekte of beperking, verleent de buddy op vrijwillige basis. De steun wordt verleend gedurende een afgesproken periode. In eerste instantie wordt een buddy voor een jaar gekoppeld aan een cliënt.\n\nOntstaan\n\nBuddyzorg is ontstaan in de jaren tachtig voor mensen met hiv en aids. De professionele gezondheidszorg was in die tijd niet voorbereid op het aantal mensen met deze – toen nog nieuwe ziekte. Buddy’s boden daarom hun sociaal-emotionele zorg aan. Tegenwoordig doen ook mensen met hele andere levensbedreigende ziektes of ernstige aandoeningen een beroep op buddyzorg. Mensen met kanker, spierziekten of niet-aangeboren hersenletsel bijvoorbeeld. Ook de aard van de steun veranderde. Buddyzorg ontstond als begeleiding bij het sterven, maar tegenwoordig is de zorg veel meer gericht op hulp bij het verder leven.\n\nOrganisatie\n\nDe organisatie van buddyzorg is ondergebracht bij Steunpunt Informele Zorg, onderdeel van de Vrijwilligerscentrale. Iedereen kan een aanvraag doen voor buddyzorg. De coördinator van Steunpunt Informele Zorg ondersteunt de buddy in zijn werkzaamheden en houdt kennismakingsgesprekken met nieuwe cliënten.\n\nProfiel\n\nBuddy's vormen een divers gezelschap. Mannen, vrouwen, jongeren, ouderen, homo’s en hetero’s met ieder hun eigen achtergrond. Wat hen bindt, is dat ze zich inzetten voor een ander. Buddyzorg stelt wel als voorwaarde dat buddy's minimaal 21 jaar zijn. Veel cliënten hebben immers al behoorlijk wat meegemaakt. Dat vraagt om een buddy met levenservaring.\n\nPraktisch\n\nBuddy's hebben minimaal een dagdeel in de week tijd voor hun cliënt. Ze nemen deel aan de verplichte basistraining en periodieke bijeenkomsten. Ze verlenen buddyzorg op vrijwillige basis. Eventuele kosten worden betaald. Daarnaast krijgt elke buddy € 25,- per maand vanaf het moment dat hij is gekoppeld aan een cliënt.\n\nTraining\n\nOm te zorgen dat buddy's goed voorbereid aan het werk gaan, krijgen ze een meerdaagse training. In die training ligt het accent op persoonlijk functioneren en zelfkennis. Daarnaast is er aandacht voor verliesverwerking, voor het aangeven van grenzen en voor diverse vaardigheden, waaronder communiceren. Tijdens de training wordt bovendien getoetst of de buddy binnen het profiel past. De conclusie wordt open en eerlijk met de kandidaat besproken, ook wanneer hij niet geschikt blijkt.\n\nBegeleiding\n\nBuddyzorg is niet zomaar vrijwilligerswerk. De situatie van de cliënt is door zijn ziekte en omstandigheden niet alledaags. Dat dit indruk maakt en invloed heeft op de buddy, is onvermijdelijk. Buddy's kunnen daarom altijd een beroep doen op de coördinator. Ook zijn er bijeenkomsten in groepsverband. Op deze momenten kunnen buddy's hun verhaal kwijt en elkaar inspireren en ondersteunen. Dat maakt niet alleen dat buddy's hun werk met plezier kunnen blijven doen, maar zorgt ook voor persoonlijke ontwikkeling en groei.",
			questions: [
				q(
					2023,
					23,
					'Hoe lang wordt een buddy in eerste instantie aan een cliënt gekoppeld?',
					{ A: 'een half jaar', B: 'een jaar', C: 'twee jaar' },
					'B'
				),
				q(
					2023,
					24,
					'Waarvoor is buddyzorg oorspronkelijk ontstaan?',
					{
						A: 'voor mensen met hiv en aids',
						B: 'voor mensen met kanker',
						C: 'voor ouderen die eenzaam zijn'
					},
					'A'
				),
				q(
					2023,
					25,
					'Wat is veranderd aan buddyzorg sinds het begin?',
					{
						A: "Buddy's krijgen nu een betere opleiding.",
						B: 'Buddyzorg is nu meer gericht op hulp bij het leven dan bij het sterven.',
						C: 'Buddyzorg is nu alleen voor mensen met een chronische ziekte.'
					},
					'B'
				),
				q(
					2023,
					26,
					"Waarom moeten buddy's minimaal 21 jaar oud zijn?",
					{
						A: 'Dat is een wettelijke eis.',
						B: 'Jongere mensen hebben er geen tijd voor.',
						C: 'Er is levenservaring nodig.'
					},
					'C'
				),
				q(
					2023,
					27,
					'Wat gebeurt er als tijdens de training blijkt dat een kandidaat niet geschikt is als buddy?',
					{
						A: 'De kandidaat wordt afgewezen en krijgt een andere functie.',
						B: 'Dit wordt open met de kandidaat besproken.',
						C: 'De kandidaat moet de training nog een keer doen.'
					},
					'B'
				),
				q(
					2023,
					28,
					'Wat is het doel van deze tekst?',
					{
						A: 'de lezer informeren over buddyzorg en enthousiasmeren om buddy te worden',
						B: 'de lezer overtuigen dat buddyzorg beter is dan professionele zorg',
						C: 'de lezer uitleggen wat een buddy verdient en hoe je buddy wordt'
					},
					'A'
				)
			]
		},
		{
			name: 'Examenreglement',
			slug: 'examenreglement',
			intro: 'In deze tekst staan de examenregels die gelden bij Rosarius Opleidingen.',
			text: 'Examenreglement\n\nHet is belangrijk dat iedereen die bij de examens van Rosarius Opleidingen is betrokken goed wordt geïnformeerd. Deze examenwijzer is bedoeld voor docenten, examenleiders en examenkandidaten van Rosarius Opleidingen. De examenwijzer bestaat uit een algemeen gedeelte waarin afspraken en regels over de examens zijn opgenomen. Daarnaast wordt aandacht besteed aan specifieke informatie per opleiding.\n\n1 Algemeen\n\n1.1 Toelatingseisen\n\nRosarius Opleidingen heeft géén open toelating tot de examens. Deelname is alleen voor de cursisten van Rosarius Opleidingen. Voor het volgen van de opleidingen gelden geen eisen ten aanzien van de vooropleiding van de kandidaat.\n\n1.2 Identificatie\n\nBij deelname aan een van onze opleidingen moet bij de start van de opleiding een kopie van het identiteitsbewijs van de kandidaat worden ingeleverd. Bij het examen moeten de kandidaten een origineel identiteitsbewijs kunnen tonen.\n\n1.3 Benodigdheden voor de kandidaten tijdens het examen\n\nVoor de schriftelijke examens hebben de kandidaten nodig:\n- schrijfgerei, zoals een pen of een potlood;\n- extra papier voor het maken van notities;\n- een rekenmachine bij rekenen. Indien het noodzakelijk is dat hiervan wordt afgeweken, dan zal dit vooraf aan de docent en de kandidaten worden verteld. Voor de examinering van de praktijkvaardigheden op de computer worden er computers van het opleidingsinstituut gebruikt. Documenten die nodig zijn voor het examen worden aangeleverd op losse gegevensdragers (bijvoorbeeld usb-sticks).\n\n2 Procedures examens\n\n2.1 Examenleider\n\nTijdens het examen is een examenleider aanwezig. De examenleider is iemand van Rosarius Opleidingen. Deze persoon is verantwoordelijk voor de goede gang van zaken op de locatie zelf (tafels uit elkaar, rust, aanwezigheid van de benodigde materialen, etc.). Hij moet objectief beoordelen of het examen naar behoren verloopt. Hij controleert of alle examenopgaven teruggaan naar de onderwijsinstelling (ook de niet-gebruikte). Wanneer gebruik gemaakt is van papier voor het maken van notities, dan moet dat door de examenleider worden ingenomen en samen met de examens worden teruggestuurd naar Rosarius Opleidingen.\n\nFrauduleus handelen\n\nDe examenleider mag kandidaten die voor, tijdens en/of na het examen aantoonbaar frauduleus hebben gehandeld, uitsluiten van verdere deelneming aan het examen. Onder frauduleus handelen wordt verstaan: het handelen van een kandidaat dat erop gericht is een juiste beoordeling van zijn inzicht en vaardigheden onmogelijk te maken. De examenleider brengt de kandidaat op de hoogte van zijn bevindingen. Het werk van de betrokken kandidaat wordt niet beoordeeld en er wordt geen resultaat verstrekt.\n\n2.2 De kandidaat\n\nDe kandidaat dient ruim voor de start van het examen aanwezig te zijn, zodat het examen op het aangegeven tijdstip kan starten. Bij te laat komen beslist de examenleider of de kandidaat alsnog mag starten met het examen. Het is de kandidaat niet toegestaan het examenlokaal binnen 50 minuten na de start te verlaten. Na aanvang van het examen tot en met het verlaten van de examenruimte in verband met beëindiging van het examen is het de kandidaat niet toegestaan:\n- andere hulpmiddelen te gebruiken dan de uitdrukkelijk toegestane hulpmiddelen;\n- contact te hebben met de medekandidaten;\n- mobiele telefoons te gebruiken of ingeschakeld te hebben;\n- te roken. Na afloop van het examen dient de kandidaat de uitwerking van het examen, alle daartoe verstrekte informatie en gemaakte notities in te leveren bij de examenleider.\n\n3 Beoordeling en normering\n\nDe uitwerkingen van de schriftelijke examens worden door één persoon beoordeeld met inachtneming van de beoordelingsnormen zoals die aangegeven zijn in de uitwerking van de examens. Een tweede beoordelaar wordt willekeurig gekozen. De normering van de praktijkvaardigheidsexamens op de computer wordt bepaald door de instantie die de examens aanlevert. De beoordeling van de examens wordt uitgedrukt in een geheel cijfer zonder decimalen. Bij de afronding dient het decimaal 5 of hoger naar boven en het decimaal 4 of lager naar beneden te worden afgerond. Indien een examen door twee mensen is beoordeeld, is het gemiddelde van de twee cijfers na afronding het eindresultaat.\n\n4 Inhoud diploma’s en eindbeoordeling\n\n4.1 Inhoud diploma telefoniste/receptioniste\n\nHet schriftelijke examen telefoniste/receptioniste bestaat uit de onderdelen:\n- Telefoneren (waaronder Nederlands)\n- Kantoorvaardigheden (waaronder Nederlands) Het examen praktijkvaardigheden omvat:\n- Word\n- Algemene computervaardigheid Voor het behalen van het diploma dient de kandidaat gemiddeld minimaal het cijfer 6 te hebben. Dat betekent een minimum puntentotaal van 24. Daarbij moet ook aan de volgende voorwaarden worden voldaan:\n- Geen van de resultaten mag lager zijn dan 5.\n- Er mag maximaal 1 verliespunt zijn behaald.\n- Bij typevaardigheid moeten minstens 130 aanslagen per minuut worden behaald.\n\n4.2 Inhoud diploma administratief medewerker\n\nOm te kunnen deelnemen aan de examens voor administratief medewerker, moeten de 4 onderdelen van telefoniste/receptioniste eerst zijn gemaakt.\n- Het aanvullende schriftelijke examen voor administratief medewerker bestaat uit rekenvaardigheid.\n- Het examen praktijkvaardigheden betreft Excel. Voor het behalen van het diploma dient de kandidaat gemiddeld minimaal het cijfer 6 te hebben. Dat betekent een minimum puntentotaal van 36. Daarbij moet ook aan de volgende voorwaarden worden voldaan:\n- Geen van de resultaten mag lager zijn dan 4.\n- Er mogen maximaal 2 verliespunten zijn behaald.\n\n4.3 Inhoud diploma financieel administratief medewerker\n\nOm te kunnen deelnemen aan de examens voor financieel administratief medewerker, moet eerst het onderdeel administratief medewerker met goed gevolg zijn afgelegd.\n- Het aanvullende schriftelijke examen voor financieel administratief medewerker bestaat uit Boekhouden.\n- Het examen praktijkvaardigheden betreft Computerboekhouden. Voor het behalen van het diploma dient de kandidaat gemiddeld minimaal het cijfer 6 te hebben. Dat betekent een minimum puntentotaal van 12. Geen van de resultaten mag lager zijn dan 5.\n\n4.4 Inhoud diploma secretaresse\n\nOm te kunnen deelnemen aan de examens voor secretaresse, moet eerst het onderdeel administratief medewerker met goed gevolg zijn afgelegd. Het aanvullende schriftelijke examen voor secretaresse bestaat uit:\n- Zakelijk Nederlands\n- Zakelijk Engels\n- Notuleren Voor het behalen van het diploma dient de kandidaat gemiddeld minimaal het cijfer 6 te hebben. Dat betekent een minimum puntentotaal van 18. Geen van de resultaten mag lager zijn dan 5.\n\n4.5 Diploma\n\nIndien de kandidaat is geslaagd, dan ontvangt hij/zij een diploma. Wanneer de kandidaat een onvoldoende heeft behaald, ontvangt de kandidaat een herexamenreglement om de kandidaat te informeren over de herkansingsmogelijkheden. Indien een kandidaat zijn examenwerk wenst in te zien, dan dient de kandidaat hiervoor een afspraak te maken met het hoofdkantoor van Rosarius Opleidingen. Het werk kan tot vier weken na de examenuitslag op het hoofdkantoor van Rosarius Opleidingen worden ingezien.\n\n5 Herkansingsregeling\n\nIndien een kandidaat niet voldoet aan de gestelde voorwaarden voor het behalen van een diploma, dan mag hij voor één van de onderdelen kosteloos een herexamen afleggen, ongeacht het cijfer dat voor dit onderdeel is behaald. Ook wanneer herkansing niet zal leiden tot het behalen van het diploma heeft de cursist recht op een herkansing. Dit kan leiden tot een beter resultaat op de beoordelingslijst. Kosteloze herkansingen dienen binnen 3 maanden na de aanvankelijke examendatum van het onderdeel te zijn benut. Voor herkansingen na deze periode worden kosten in rekening gebracht.\n\n6 Bezwaar en beroep\n\nEen kandidaat kan tegen de uitslag van een examen bezwaar maken. De kandidaat dient daarvoor binnen twee weken na bekendmaking van de uitslag zijn inhoudelijke argumenten betreffende het examen schriftelijk duidelijk te maken bij het management van Rosarius Opleidingen. Aan het indienen van een bezwaarschrift zijn kosten verbonden. De uitwerkingen en/of prestaties van de kandidaat worden voor zover mogelijk opnieuw beoordeeld. Het management neemt de geuite bezwaren en de herbeoordeling met motivering van de oorspronkelijke corrector(en) in overweging. Het resultaat dat voortvloeit uit de herbeoordeling wordt in plaats gesteld van het oorspronkelijke resultaat. Dit houdt in dat het resultaat niet alleen omhoog maar ook omlaag kan gaan of gelijk blijft. De kandidaat wordt schriftelijk op de hoogte gesteld van het besluit op zijn bezwaar. Het resultaat dat wordt vastgesteld na behandeling van het bezwaarschrift is bindend.\n\n7 Bijzondere gevallen\n\nIn bijzondere gevallen kan het management besluiten dat een kandidaat op een andere wijze één of meer examens aflegt. Onder bijzondere gevallen wordt verstaan:\n- Medische indicatie waaruit blijkt dat de kandidaat het examen onmogelijk schriftelijk kan afleggen. Hierbij is een mondeling examen mogelijk. Een schriftelijke verklaring van een deskundige is hiervoor noodzakelijk.\n- Dyslexie: Kandidaten met een dyslexieverklaring hebben recht op 30 minuten extra examentijd. Op verzoek kan een A3-versie van het examen met vergrote tekst worden aangeleverd.\n- Nederlands is niet de eerste taal. Wanneer de kandidaat korter dan vijf jaar in Nederland verblijft, heeft hij recht op 30 minuten extra examentijd. Hij mag ook een Nederlands handwoordenboek gebruiken.\n- Problemen met motoriek: de kandidaat mag gebruik maken van een computer van Rosarius Opleidingen om het examen uit te werken. Een schriftelijke verklaring van een deskundige is hiervoor noodzakelijk. Om in aanmerking te komen voor een of meer van bovenstaande aanpassingen, moet een schriftelijk verzoek worden ingediend bij het hoofdkantoor van Rosarius Opleidingen. In dit verzoek moet duidelijk worden aangegeven welke aanpassing gewenst is en wat daarvoor de reden is. Dit moet bij voorkeur gepaard gaan met een schriftelijke verklaring van een deskundige.',
			questions: [
				q(
					2023,
					29,
					'Wie mag deelnemen aan de examens van Rosarius Opleidingen?',
					{
						A: 'alleen cursisten van Rosarius Opleidingen',
						B: 'iedereen die zich aanmeldt',
						C: 'iedereen met de juiste vooropleiding'
					},
					'A'
				),
				q(
					2023,
					30,
					'De kandidaat komt te laat bij het examen. Wat gebeurt er?',
					{
						A: 'De kandidaat mag niet meer deelnemen.',
						B: 'De examenleider beslist of de kandidaat mag starten.',
						C: 'De kandidaat mag starten maar krijgt geen extra tijd.'
					},
					'B'
				),
				q(
					2023,
					31,
					'Wanneer mag een kandidaat het examenlokaal verlaten?',
					{ A: 'na 30 minuten', B: 'na 50 minuten', C: 'pas als het examen is afgelopen' },
					'B'
				),
				q(
					2023,
					32,
					'Een kandidaat wil het diploma administratief medewerker halen. Zijn resultaten zijn: 7, 8, 6, 5, 4, 6. Haalt hij het diploma?',
					{
						A: 'Ja, want het gemiddelde is hoog genoeg.',
						B: 'Nee, want een van de resultaten is lager dan 4.',
						C: 'Nee, want er zijn meer dan 2 verliespunten.'
					},
					'C'
				),
				q(
					2023,
					33,
					'Een kandidaat is het niet eens met de uitslag van het examen. Wat kan er gebeuren na herbeoordeling?',
					{
						A: 'Het cijfer kan alleen omhoog gaan.',
						B: 'Het cijfer kan omhoog of omlaag gaan.',
						C: 'Het cijfer blijft hetzelfde.'
					},
					'B'
				),
				q(
					2023,
					34,
					'Een kandidaat woont vier jaar in Nederland en Nederlands is niet zijn eerste taal. Welk recht heeft hij bij het examen?',
					{
						A: 'Hij krijgt 30 minuten extra tijd.',
						B: 'Hij mag een woordenboek gebruiken.',
						C: 'Allebei.'
					},
					'C'
				),
				q(
					2023,
					35,
					'Wat is het doel van deze tekst?',
					{
						A: 'de lezer informeren over de examenregels van Rosarius Opleidingen',
						B: 'de lezer overtuigen om een opleiding bij Rosarius te volgen',
						C: 'de lezer uitleggen hoe examens in Nederland worden afgenomen'
					},
					'A'
				)
			]
		}
	]
};

/** Loaded papers only. A supplied 2021 or 2022 file is appended after its key checks out. */
export const LEZEN_EXAMS: LezenExam[] = examsWithSupplied([LEZEN_2025, LEZEN_2024, LEZEN_2023]);
