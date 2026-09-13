// ============================================================
// DUTCHINA BOSS FIGHT: HANDCRAFTED QUESTIONS
// Transformation and error_identification questions per rank.
// These require curated content (not auto-generated from WORD_POOL).
// Ranks 0-1 excluded (too basic for grammar-based questions).
//
// Sources: Quist & Strik (Beginner's Dutch Grammar),
//          Fenoulhet (Dutch in 3 Months), Donaldson (Essential Grammar),
//          Oosterhoff (Modern Dutch Grammar).
// ============================================================

export interface HandcraftedQuestion {
	id: string;
	rank: number;
	type: 'transformation' | 'error_identification';
	/** The prompt shown to Domi */
	prompt: string;
	/** Four options, one correct */
	options: string[];
	/** Index of the correct option in options[] */
	correctIndex: number;
}

export const HANDCRAFTED_QUESTIONS: HandcraftedQuestion[] = [
	// ============================================================
	// RANK 2: Present tense, pronouns, hebben/zijn
	// ============================================================

	// -- Transformation (8) --
	{
		id: 'tf_2_1',
		rank: 2,
		type: 'transformation',
		prompt: 'Verander het onderwerp naar "hij":\nIk werk in Amsterdam.',
		options: [
			'Hij werkt in Amsterdam.',
			'Hij werk in Amsterdam.',
			'Hij werken in Amsterdam.',
			'Hij werkten in Amsterdam.'
		],
		correctIndex: 0
	},
	{
		id: 'tf_2_2',
		rank: 2,
		type: 'transformation',
		prompt: 'Verander het onderwerp naar "wij":\nJij leest een boek.',
		options: [
			'Wij leest een boek.',
			'Wij lezen een boek.',
			'Wij leezen een boek.',
			'Wij lees een boek.'
		],
		correctIndex: 1
	},
	{
		id: 'tf_2_3',
		rank: 2,
		type: 'transformation',
		prompt: 'Verander het onderwerp naar "jij":\nIk schrijf een brief.',
		options: [
			'Jij schrijf een brief.',
			'Jij schrijven een brief.',
			'Jij schrijft een brief.',
			'Jij schrijvt een brief.'
		],
		correctIndex: 2
	},
	{
		id: 'tf_2_4',
		rank: 2,
		type: 'transformation',
		prompt: 'Maak een vraag:\nJij hebt een auto.',
		options: [
			'Hebt jij een auto?',
			'Heb jij een auto?',
			'Hebt je een auto?',
			'Heeft jij een auto?'
		],
		correctIndex: 1
	},
	{
		id: 'tf_2_5',
		rank: 2,
		type: 'transformation',
		prompt: 'Verander het onderwerp naar "zij" (enkelvoud):\nHij is moe.',
		options: ['Zij ben moe.', 'Zij is moe.', 'Zij zijn moe.', 'Zij bent moe.'],
		correctIndex: 1
	},
	{
		id: 'tf_2_6',
		rank: 2,
		type: 'transformation',
		prompt: 'Verander het onderwerp naar "jullie":\nIk heb een hond.',
		options: [
			'Jullie hebt een hond.',
			'Jullie heeft een hond.',
			'Jullie hebben een hond.',
			'Jullie heb een hond.'
		],
		correctIndex: 2
	},
	{
		id: 'tf_2_7',
		rank: 2,
		type: 'transformation',
		prompt: 'Verander "ik" naar "hij":\nIk geef haar een cadeau.',
		options: [
			'Hij geef haar een cadeau.',
			'Hij geeft haar een cadeau.',
			'Hij geven haar een cadeau.',
			'Hij geeven haar een cadeau.'
		],
		correctIndex: 1
	},
	{
		id: 'tf_2_8',
		rank: 2,
		type: 'transformation',
		prompt: 'Verander naar een vraag met inversie:\nHij komt morgen.',
		options: ['Komt hij morgen?', 'Komt hem morgen?', 'Hij komt morgen?', 'Komen hij morgen?'],
		correctIndex: 0
	},

	// -- Error Identification (8) --
	{
		id: 'ei_2_1',
		rank: 2,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Hij wonen in Utrecht."',
		options: ['wonen → woont', 'Hij → Hem', 'in → op', 'Utrecht → utrecht'],
		correctIndex: 0
	},
	{
		id: 'ei_2_2',
		rank: 2,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Wij bent studenten."',
		options: ['Wij → Wij zijn', 'studenten → student', 'bent → zijn', 'Wij → Zij'],
		correctIndex: 2
	},
	{
		id: 'ei_2_3',
		rank: 2,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Jij heb een mooie fiets."',
		options: ['mooie → mooi', 'heb → hebt', 'een → het', 'fiets → fietsen'],
		correctIndex: 1
	},
	{
		id: 'ei_2_4',
		rank: 2,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Zij geeft hem een boek."',
		options: ['geeft → geven', 'hem → hij', 'een → het', 'Geen fout'],
		correctIndex: 3
	},
	{
		id: 'ei_2_5',
		rank: 2,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Ik leest elke dag de krant."',
		options: ['elke → elk', 'de → het', 'leest → lees', 'krant → kranten'],
		correctIndex: 2
	},
	{
		id: 'ei_2_6',
		rank: 2,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Hij geven mij een appel."',
		options: ['mij → me', 'geven → geeft', 'een → de', 'appel → appels'],
		correctIndex: 1
	},
	{
		id: 'ei_2_7',
		rank: 2,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Spreek jij Nederlands?"',
		options: ['Spreek → Spreekt', 'jij → je', 'Nederlands → nederlands', 'Geen fout'],
		correctIndex: 3
	},
	{
		id: 'ei_2_8',
		rank: 2,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Zij hebben veel geld en zij is blij."',
		options: ['hebben → heeft', 'veel → weinig', 'is → zijn', 'geld → gelds'],
		correctIndex: 2
	},

	// ============================================================
	// RANK 3: Modals, present perfect, imperfect
	// ============================================================

	// -- Transformation (8) --
	{
		id: 'tf_3_1',
		rank: 3,
		type: 'transformation',
		prompt: 'Zet in de voltooide tijd (present perfect):\nIk werk vandaag thuis.',
		options: [
			'Ik heb vandaag thuis gewerkt.',
			'Ik heb vandaag thuis werken.',
			'Ik ben vandaag thuis gewerkt.',
			'Ik heb vandaag thuis gewerkd.'
		],
		correctIndex: 0
	},
	{
		id: 'tf_3_2',
		rank: 3,
		type: 'transformation',
		prompt: 'Zet in de voltooide tijd:\nZij fietst naar school.',
		options: [
			'Zij is naar school gefietst.',
			'Zij heeft naar school gefietst.',
			'Zij is naar school fietsen.',
			'Zij heeft naar school gefietsd.'
		],
		correctIndex: 0
	},
	{
		id: 'tf_3_3',
		rank: 3,
		type: 'transformation',
		prompt: 'Zet in de verleden tijd (imperfect):\nIk maak het eten klaar.',
		options: [
			'Ik maakde het eten klaar.',
			'Ik maakte het eten klaar.',
			'Ik heb het eten klaargemaakt.',
			'Ik miek het eten klaar.'
		],
		correctIndex: 1
	},
	{
		id: 'tf_3_4',
		rank: 3,
		type: 'transformation',
		prompt: 'Zet in de verleden tijd:\nHij schrijft een boek.',
		options: [
			'Hij schrijfde een boek.',
			'Hij schrijfte een boek.',
			'Hij schreef een boek.',
			'Hij geschreven een boek.'
		],
		correctIndex: 2
	},
	{
		id: 'tf_3_5',
		rank: 3,
		type: 'transformation',
		prompt: 'Voeg het modale werkwoord "moeten" toe:\nIk ga naar de dokter.',
		options: [
			'Ik moet naar de dokter gaan.',
			'Ik moet naar de dokter ga.',
			'Ik moeten naar de dokter gaan.',
			'Ik moet ga naar de dokter.'
		],
		correctIndex: 0
	},
	{
		id: 'tf_3_6',
		rank: 3,
		type: 'transformation',
		prompt: 'Zet in de voltooide tijd:\nWij eten in een restaurant.',
		options: [
			'Wij hebben in een restaurant eten.',
			'Wij zijn in een restaurant gegeten.',
			'Wij hebben in een restaurant gegeten.',
			'Wij hebben in een restaurant geëten.'
		],
		correctIndex: 2
	},
	{
		id: 'tf_3_7',
		rank: 3,
		type: 'transformation',
		prompt: 'Voeg "kunnen" toe:\nZij spreken goed Nederlands.',
		options: [
			'Zij kunnen goed Nederlands spreken.',
			'Zij kan goed Nederlands spreken.',
			'Zij kunnen goed Nederlands spreekt.',
			'Zij kunnt goed Nederlands spreken.'
		],
		correctIndex: 0
	},
	{
		id: 'tf_3_8',
		rank: 3,
		type: 'transformation',
		prompt: 'Zet in de verleden tijd:\nWij bellen onze ouders.',
		options: [
			'Wij belden onze ouders.',
			'Wij belde onze ouders.',
			'Wij bellden onze ouders.',
			'Wij gebeld onze ouders.'
		],
		correctIndex: 0
	},

	// -- Error Identification (8) --
	{
		id: 'ei_3_1',
		rank: 3,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Ik heb naar school gefietst."',
		options: ['heb → ben', 'gefietst → gefiets', 'naar → aan', 'Geen fout'],
		correctIndex: 0
	},
	{
		id: 'ei_3_2',
		rank: 3,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Hij heeft gisteren geloopt."',
		options: ['heeft → is', 'geloopt → gelopen', 'gisteren → gister', 'Hij → Hem'],
		correctIndex: 1
	},
	{
		id: 'ei_3_3',
		rank: 3,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Wij moesten vroeg op moeten staan."',
		options: ['moesten vroeg → moesten', 'moeten staan → staan', 'op → om', 'moesten → moeten'],
		correctIndex: 1
	},
	{
		id: 'ei_3_4',
		rank: 3,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Zij werkde bij een bank."',
		options: ['werkde → werkte', 'bij → in', 'Zij → Ze', 'een → de'],
		correctIndex: 0
	},
	{
		id: 'ei_3_5',
		rank: 3,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Hij kan goed zwemmen."',
		options: ['kan → kon', 'goed → goedt', 'zwemmen → zwemt', 'Geen fout'],
		correctIndex: 3
	},
	{
		id: 'ei_3_6',
		rank: 3,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Ik heb een brief geschrijft."',
		options: ['heb → ben', 'geschrijft → geschreven', 'een → de', 'brief → brieven'],
		correctIndex: 1
	},
	{
		id: 'ei_3_7',
		rank: 3,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Zij zijn naar Parijs gereisd."',
		options: ['zijn → hebben', 'gereisd → gereisd', 'naar → in', 'Geen fout'],
		correctIndex: 3
	},
	{
		id: 'ei_3_8',
		rank: 3,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Hij wou graag een biertje drinkt."',
		options: ['wou → wilde', 'drinkt → drinken', 'graag → graags', 'een → het'],
		correctIndex: 1
	},

	// ============================================================
	// RANK 4: Separable verbs, reflexive, imperative, future
	// ============================================================

	// -- Transformation (8) --
	{
		id: 'tf_4_1',
		rank: 4,
		type: 'transformation',
		prompt: 'Zet in de voltooide tijd:\nIk bel mijn moeder op.',
		options: [
			'Ik heb mijn moeder opgebeld.',
			'Ik heb mijn moeder opbellen.',
			'Ik heb mijn moeder gebeld op.',
			'Ik ben mijn moeder opgebeld.'
		],
		correctIndex: 0
	},
	{
		id: 'tf_4_2',
		rank: 4,
		type: 'transformation',
		prompt: 'Zet in de toekomst met "zullen":\nIk koop een nieuwe auto.',
		options: [
			'Ik zal een nieuwe auto kopen.',
			'Ik zal een nieuwe auto koopt.',
			'Ik zullen een nieuwe auto kopen.',
			'Ik zal een nieuwe auto gekocht.'
		],
		correctIndex: 0
	},
	{
		id: 'tf_4_3',
		rank: 4,
		type: 'transformation',
		prompt: 'Maak een bevel (imperatief):\nJij ruimt je kamer op.',
		options: ['Ruim op je kamer!', 'Ruim je kamer op!', 'Ruimt je kamer op!', 'Je ruim kamer op!'],
		correctIndex: 1
	},
	{
		id: 'tf_4_4',
		rank: 4,
		type: 'transformation',
		prompt: 'Voeg het reflexieve werkwoord correct in:\nIk (zich wassen) elke ochtend.',
		options: [
			'Ik was me elke ochtend.',
			'Ik was mij elke ochtend.',
			'Ik was zich elke ochtend.',
			'Ik mij was elke ochtend.'
		],
		correctIndex: 0
	},
	{
		id: 'tf_4_5',
		rank: 4,
		type: 'transformation',
		prompt: 'Zet in de voltooide tijd:\nZij trekt haar jas aan.',
		options: [
			'Zij heeft haar jas aangetrokken.',
			'Zij heeft haar jas aangetrekken.',
			'Zij is haar jas aangetrokken.',
			'Zij heeft haar jas getrokken aan.'
		],
		correctIndex: 0
	},
	{
		id: 'tf_4_6',
		rank: 4,
		type: 'transformation',
		prompt: 'Zet in de toekomst met "gaan":\nWij eten vanavond buiten.',
		options: [
			'Wij gaan vanavond buiten eten.',
			'Wij gaan vanavond buiten eet.',
			'Wij gaat vanavond buiten eten.',
			'Wij gaen vanavond buiten eten.'
		],
		correctIndex: 0
	},
	{
		id: 'tf_4_7',
		rank: 4,
		type: 'transformation',
		prompt: 'Verander het onderwerp naar "zij" (enkelvoud):\nIk vergis me nooit.',
		options: [
			'Zij vergist haar nooit.',
			'Zij vergist zich nooit.',
			'Zij vergis zich nooit.',
			'Zij vergissen zich nooit.'
		],
		correctIndex: 1
	},
	{
		id: 'tf_4_8',
		rank: 4,
		type: 'transformation',
		prompt: 'Zet in de verleden tijd:\nHij maakt het licht aan.',
		options: [
			'Hij maakte het licht aan.',
			'Hij maakde het licht aan.',
			'Hij aanmaakte het licht.',
			'Hij heeft het licht aanmaakt.'
		],
		correctIndex: 0
	},

	// -- Error Identification (8) --
	{
		id: 'ei_4_1',
		rank: 4,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Hij heeft de deur opengemaakt."',
		options: ['heeft → is', 'opengemaakt → opgemaakt', 'de → het', 'Geen fout'],
		correctIndex: 3
	},
	{
		id: 'ei_4_2',
		rank: 4,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Zij wast haar elke ochtend."',
		options: ['haar → zich', 'wast → waste', 'elke → elk', 'ochtend → morgen'],
		correctIndex: 0
	},
	{
		id: 'ei_4_3',
		rank: 4,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Ik heb mijn vriend gebeld op."',
		options: ['heb → ben', 'gebeld op → opgebeld', 'mijn → mij', 'vriend → vrienden'],
		correctIndex: 1
	},
	{
		id: 'ei_4_4',
		rank: 4,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Zullen wij morgen naar het strand gaan?"',
		options: ['Zullen → Zouden', 'het → de', 'gaan → gaat', 'Geen fout'],
		correctIndex: 3
	},
	{
		id: 'ei_4_5',
		rank: 4,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Ga jij zitten alsjeblieft!"',
		options: ['Ga → Gaat', 'Ga jij → Ga', 'zitten → zit', 'alsjeblieft → alstublieft'],
		correctIndex: 1
	},
	{
		id: 'ei_4_6',
		rank: 4,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Wij zullen morgen vroeg vertrekken."',
		options: ['zullen → zouden', 'vroeg → vroegs', 'vertrekken → vertrekt', 'Geen fout'],
		correctIndex: 3
	},
	{
		id: 'ei_4_7',
		rank: 4,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Hij trekt zich jas aan."',
		options: ['trekt → trek', 'zich → zijn', 'aan → uit', 'jas → jassen'],
		correctIndex: 1
	},
	{
		id: 'ei_4_8',
		rank: 4,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Ik heb me vergist in de datum."',
		options: ['heb → ben', 'vergist → vergissen', 'de → het', 'Geen fout'],
		correctIndex: 3
	},

	// ============================================================
	// RANK 5: Er (all uses), prepositions, negation
	// ============================================================

	// -- Transformation (8) --
	{
		id: 'tf_5_1',
		rank: 5,
		type: 'transformation',
		prompt: 'Vervang "in het park" door "er":\nIk loop in het park.',
		options: ['Ik loop er.', 'Ik er loop.', 'Er loop ik.', 'Ik loop het er.'],
		correctIndex: 0
	},
	{
		id: 'tf_5_2',
		rank: 5,
		type: 'transformation',
		prompt: 'Maak negatief:\nIk heb een auto.',
		options: [
			'Ik heb niet een auto.',
			'Ik heb geen auto.',
			'Ik niet heb een auto.',
			'Ik geen heb auto.'
		],
		correctIndex: 1
	},
	{
		id: 'tf_5_3',
		rank: 5,
		type: 'transformation',
		prompt: 'Maak negatief:\nHij werkt vandaag.',
		options: [
			'Hij niet werkt vandaag.',
			'Hij werkt geen vandaag.',
			'Hij werkt vandaag niet.',
			'Hij werkt niet vandaag.'
		],
		correctIndex: 2
	},
	{
		id: 'tf_5_4',
		rank: 5,
		type: 'transformation',
		prompt: 'Gebruik "er" als voorlopig onderwerp:\nEen man staat bij de deur.',
		options: [
			'Er staat een man bij de deur.',
			'Daar staat een man bij de deur.',
			'Een man er staat bij de deur.',
			'Er een man staat bij de deur.'
		],
		correctIndex: 0
	},
	{
		id: 'tf_5_5',
		rank: 5,
		type: 'transformation',
		prompt:
			'Vervang "op de tafel" door het juiste voornaamwoordelijk bijwoord:\nHet boek ligt op de tafel.',
		options: [
			'Het boek ligt erop.',
			'Het boek ligt op er.',
			'Het boek er ligt op.',
			'Het boek erop ligt.'
		],
		correctIndex: 0
	},
	{
		id: 'tf_5_6',
		rank: 5,
		type: 'transformation',
		prompt: 'Maak negatief:\nZij heeft zin in koffie.',
		options: [
			'Zij heeft niet zin in koffie.',
			'Zij heeft geen zin in koffie.',
			'Zij heeft zin in geen koffie.',
			'Zij geen heeft zin in koffie.'
		],
		correctIndex: 1
	},
	{
		id: 'tf_5_7',
		rank: 5,
		type: 'transformation',
		prompt: 'Verander de voorzetselgroep naar "er + voorzetsel":\nIk denk aan mijn vakantie.',
		options: ['Ik denk er aan.', 'Ik denk eraan.', 'Ik er denk aan.', 'Ik erom denk.'],
		correctIndex: 1
	},
	{
		id: 'tf_5_8',
		rank: 5,
		type: 'transformation',
		prompt: 'Maak negatief:\nWij gaan naar het feest.',
		options: [
			'Wij gaan naar het feest niet.',
			'Wij gaan geen naar het feest.',
			'Wij gaan niet naar het feest.',
			'Wij niet gaan naar het feest.'
		],
		correctIndex: 2
	},

	// -- Error Identification (8) --
	{
		id: 'ei_5_1',
		rank: 5,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Er zijn veel mensen niet in de trein."',
		options: ['niet → geen', 'Er zijn veel → Er zijn niet veel', 'de → het', 'Geen fout'],
		correctIndex: 1
	},
	{
		id: 'ei_5_2',
		rank: 5,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Ik heb niet geld."',
		options: ['niet → geen', 'heb → heeft', 'geld → gelds', 'Geen fout'],
		correctIndex: 0
	},
	{
		id: 'ei_5_3',
		rank: 5,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Zij denkt er over na."',
		options: ['er over → erover', 'denkt → denken', 'na → aan', 'Geen fout'],
		correctIndex: 0
	},
	{
		id: 'ei_5_4',
		rank: 5,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Er staat een hond in de tuin."',
		options: ['staat → staan', 'in → op', 'de → het', 'Geen fout'],
		correctIndex: 3
	},
	{
		id: 'ei_5_5',
		rank: 5,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Hij wacht op de bus niet."',
		options: ['niet moet voor "op de bus"', 'op → voor', 'wacht → wachten', 'de → het'],
		correctIndex: 0
	},
	{
		id: 'ei_5_6',
		rank: 5,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Ik hou niet van koffie."',
		options: ['niet → geen', 'van → voor', 'hou → houd', 'Geen fout'],
		correctIndex: 3
	},
	{
		id: 'ei_5_7',
		rank: 5,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Hoeveel kinderen zijn daar? Daar zijn er drie."',
		options: ['daar → er', 'er drie → drie', 'zijn → is', 'Geen fout'],
		correctIndex: 0
	},
	{
		id: 'ei_5_8',
		rank: 5,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Zij gaat niet met de trein naar haar werk."',
		options: ['niet → geen', 'de → het', 'naar → tot', 'Geen fout'],
		correctIndex: 3
	},

	// ============================================================
	// RANK 6: Word order (V2), subclauses, conjunctions
	// ============================================================

	// -- Transformation (8) --
	{
		id: 'tf_6_1',
		rank: 6,
		type: 'transformation',
		prompt: 'Begin de zin met "Morgen":\nIk ga naar de markt.',
		options: [
			'Morgen ik ga naar de markt.',
			'Morgen ga ik naar de markt.',
			'Morgen gaan ik naar de markt.',
			'Ik ga morgen naar de markt.'
		],
		correctIndex: 1
	},
	{
		id: 'tf_6_2',
		rank: 6,
		type: 'transformation',
		prompt: 'Combineer met "omdat":\nHij blijft thuis. Hij is ziek.',
		options: [
			'Hij blijft thuis, omdat hij ziek is.',
			'Hij blijft thuis, omdat hij is ziek.',
			'Hij blijft thuis, omdat is hij ziek.',
			'Hij blijft thuis omdat hij ziek ben.'
		],
		correctIndex: 0
	},
	{
		id: 'tf_6_3',
		rank: 6,
		type: 'transformation',
		prompt: 'Combineer met "dat":\nIk denk. Hij komt morgen.',
		options: [
			'Ik denk dat hij morgen komt.',
			'Ik denk dat hij komt morgen.',
			'Ik denk dat morgen hij komt.',
			'Ik denk hij dat morgen komt.'
		],
		correctIndex: 0
	},
	{
		id: 'tf_6_4',
		rank: 6,
		type: 'transformation',
		prompt: 'Begin de zin met "Gisteren":\nWij hebben Nederlands gestudeerd.',
		options: [
			'Gisteren wij hebben Nederlands gestudeerd.',
			'Gisteren hebben wij Nederlands gestudeerd.',
			'Gisteren hebben gestudeerd wij Nederlands.',
			'Gisteren wij Nederlands hebben gestudeerd.'
		],
		correctIndex: 1
	},
	{
		id: 'tf_6_5',
		rank: 6,
		type: 'transformation',
		prompt: 'Combineer met "als":\nHet regent. Ik neem een paraplu mee.',
		options: [
			'Als het regent, neem ik een paraplu mee.',
			'Als het regent, ik neem een paraplu mee.',
			'Als regent het, neem ik een paraplu mee.',
			'Als het regent neem ik, een paraplu mee.'
		],
		correctIndex: 0
	},
	{
		id: 'tf_6_6',
		rank: 6,
		type: 'transformation',
		prompt: 'Combineer met "want":\nIk ga naar bed. Ik ben moe.',
		options: [
			'Ik ga naar bed, want ik moe ben.',
			'Ik ga naar bed, want ben ik moe.',
			'Ik ga naar bed, want ik ben moe.',
			'Ik ga naar bed, want moe ik ben.'
		],
		correctIndex: 2
	},
	{
		id: 'tf_6_7',
		rank: 6,
		type: 'transformation',
		prompt: 'Begin de zin met "Soms":\nZij leest een boek in de tuin.',
		options: [
			'Soms zij leest een boek in de tuin.',
			'Soms leest zij een boek in de tuin.',
			'Soms een boek leest zij in de tuin.',
			'Soms lees zij een boek in de tuin.'
		],
		correctIndex: 1
	},
	{
		id: 'tf_6_8',
		rank: 6,
		type: 'transformation',
		prompt: 'Combineer met "toen":\nIk was jong. Ik woonde in Rotterdam.',
		options: [
			'Toen ik was jong, woonde ik in Rotterdam.',
			'Toen ik jong was, woonde ik in Rotterdam.',
			'Toen ik jong was, ik woonde in Rotterdam.',
			'Toen was ik jong, woonde ik in Rotterdam.'
		],
		correctIndex: 1
	},

	// -- Error Identification (8) --
	{
		id: 'ei_6_1',
		rank: 6,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Morgen ik ga naar de dokter."',
		options: ['ik ga → ga ik', 'de → het', 'naar → voor', 'Morgen → Morgenvroeg'],
		correctIndex: 0
	},
	{
		id: 'ei_6_2',
		rank: 6,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Ik weet dat hij is ziek."',
		options: ['weet → weten', 'is ziek → ziek is', 'dat → wat', 'hij → hem'],
		correctIndex: 1
	},
	{
		id: 'ei_6_3',
		rank: 6,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Hij komt niet, want hij heeft geen tijd."',
		options: ['niet → niks', 'geen → niet', 'heeft → hebt', 'Geen fout'],
		correctIndex: 3
	},
	{
		id: 'ei_6_4',
		rank: 6,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Omdat ik ben moe, ga ik naar bed."',
		options: ['ben moe → moe ben', 'ga → gaan', 'naar → in', 'ik → mij'],
		correctIndex: 0
	},
	{
		id: 'ei_6_5',
		rank: 6,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Vorig jaar wij zijn naar Spanje geweest."',
		options: ['wij zijn → zijn wij', 'geweest → gegaan', 'naar → in', 'Vorig → Vorige'],
		correctIndex: 0
	},
	{
		id: 'ei_6_6',
		rank: 6,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Ik ga naar huis, maar eerst eet ik iets."',
		options: ['maar → want', 'eet ik → ik eet', 'iets → niets', 'Geen fout'],
		correctIndex: 3
	},
	{
		id: 'ei_6_7',
		rank: 6,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Als je moe bent, je moet slapen."',
		options: ['je moet → moet je', 'moe → moeë', 'slapen → slaap', 'Als → Wanneer'],
		correctIndex: 0
	},
	{
		id: 'ei_6_8',
		rank: 6,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Hoewel het koud is, draagt hij geen jas."',
		options: ['koud → koude', 'draagt → draag', 'geen → niet', 'Geen fout'],
		correctIndex: 3
	},

	// ============================================================
	// RANK 7: Passive, conditional, formal/informal, advanced verbs
	// ============================================================

	// -- Transformation (8) --
	{
		id: 'tf_7_1',
		rank: 7,
		type: 'transformation',
		prompt: 'Zet in de lijdende vorm (passief):\nDe kok maakt het eten.',
		options: [
			'Het eten wordt door de kok gemaakt.',
			'Het eten is door de kok gemaakt.',
			'Het eten maakt door de kok.',
			'Het eten wordt de kok gemaakt.'
		],
		correctIndex: 0
	},
	{
		id: 'tf_7_2',
		rank: 7,
		type: 'transformation',
		prompt: 'Zet in de conditionalis:\nIk ga naar het feest.',
		options: [
			'Ik zou naar het feest gaan.',
			'Ik zal naar het feest gaan.',
			'Ik zou naar het feest ga.',
			'Ik zouden naar het feest gaan.'
		],
		correctIndex: 0
	},
	{
		id: 'tf_7_3',
		rank: 7,
		type: 'transformation',
		prompt: 'Maak formeel (u-vorm):\nKun je me helpen?',
		options: ['Kunt u me helpen?', 'Kan u mij helpen?', 'Kunt u mij helpen?', 'Kun u me helpen?'],
		correctIndex: 2
	},
	{
		id: 'tf_7_4',
		rank: 7,
		type: 'transformation',
		prompt: 'Zet in de lijdende vorm (verleden tijd):\nDe politie arresteerde de dief.',
		options: [
			'De dief werd door de politie gearresteerd.',
			'De dief is door de politie gearresteerd.',
			'De dief wordt door de politie gearresteerd.',
			'De dief was door de politie gearresteerd.'
		],
		correctIndex: 0
	},
	{
		id: 'tf_7_5',
		rank: 7,
		type: 'transformation',
		prompt: 'Zet in de conditionalis verleden:\nIk heb dat niet gezegd.',
		options: [
			'Ik zou dat niet gezegd hebben.',
			'Ik zou dat niet hebben gezegt.',
			'Ik had dat niet zou gezegd.',
			'Ik zou dat niet zeggen hebben.'
		],
		correctIndex: 0
	},
	{
		id: 'tf_7_6',
		rank: 7,
		type: 'transformation',
		prompt: 'Maak formeel:\nHeb je zin om mee te gaan?',
		options: [
			'Heeft u zin om mee te gaan?',
			'Hebt u zin om mee te gaan?',
			'Heb u zin om mee te gaan?',
			'Heeft je zin om mee te gaan?'
		],
		correctIndex: 0
	},
	{
		id: 'tf_7_7',
		rank: 7,
		type: 'transformation',
		prompt: 'Zet in de lijdende vorm:\nMen spreekt hier Nederlands.',
		options: [
			'Hier wordt Nederlands gesproken.',
			'Hier is Nederlands gesproken.',
			'Hier wordt Nederlands spreken.',
			'Nederlands wordt hier spreken.'
		],
		correctIndex: 0
	},
	{
		id: 'tf_7_8',
		rank: 7,
		type: 'transformation',
		prompt: 'Maak een onwerkelijke conditie:\nIk heb geen geld. Ik koop die auto niet.',
		options: [
			'Als ik geld had, zou ik die auto kopen.',
			'Als ik geld heb, koop ik die auto.',
			'Als ik geld zou, had ik die auto gekopen.',
			'Als ik geld had, koop ik die auto.'
		],
		correctIndex: 0
	},

	// -- Error Identification (8) --
	{
		id: 'ei_7_1',
		rank: 7,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Het boek wordt door de student gelezen."',
		options: ['wordt → is', 'door → van', 'gelezen → leest', 'Geen fout'],
		correctIndex: 3
	},
	{
		id: 'ei_7_2',
		rank: 7,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"De brief werd door hem geschrijft."',
		options: ['werd → wordt', 'geschrijft → geschreven', 'door → van', 'hem → hij'],
		correctIndex: 1
	},
	{
		id: 'ei_7_3',
		rank: 7,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Als ik rijk was, zou ik een boot kopen."',
		options: ['was → zou zijn', 'zou → zal', 'kopen → kocht', 'Geen fout'],
		correctIndex: 3
	},
	{
		id: 'ei_7_4',
		rank: 7,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Kunt u mij vertelt wat er is gebeurd?"',
		options: ['Kunt → Kan', 'vertelt → vertellen', 'mij → me', 'gebeurd → gebeurt'],
		correctIndex: 1
	},
	{
		id: 'ei_7_5',
		rank: 7,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Het huis is in 1920 gebouwd."',
		options: ['is → werd', 'gebouwd → gebouwen', 'in → op', 'Geen fout'],
		correctIndex: 3
	},
	{
		id: 'ei_7_6',
		rank: 7,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Ik zou graag een kopje koffie willen besteld."',
		options: ['zou → zal', 'besteld → bestellen', 'willen → wil', 'graag → gaarne'],
		correctIndex: 1
	},
	{
		id: 'ei_7_7',
		rank: 7,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Meneer, wilt u even wachten alstublieft?"',
		options: ['wilt → wil', 'even → effen', 'Meneer → meneer', 'Geen fout'],
		correctIndex: 3
	},
	{
		id: 'ei_7_8',
		rank: 7,
		type: 'error_identification',
		prompt: 'Welke fout zit in deze zin?\n"Er werden veel fouten door de leerlingen maakt."',
		options: ['werden → zijn', 'maakt → gemaakt', 'door → van', 'veel → vele'],
		correctIndex: 1
	}
];

/**
 * Get handcrafted questions filtered by rank and type.
 */
export function getHandcraftedQuestions(
	rank: number,
	type: 'transformation' | 'error_identification'
): HandcraftedQuestion[] {
	return HANDCRAFTED_QUESTIONS.filter((q) => q.rank === rank && q.type === type);
}
