import type { GrammarChapter } from './types';

export const GRAMMAR_CONTENT: GrammarChapter[] = [
	{
		n: 1,
		id: 'word-order',
		title: 'Word Order',
		blurb:
			'Where the verb sits is half the battle — nail these three patterns and Dutch starts to click.',
		tone: 'rose',
		cards: [
			{
				id: 'g_word_order_v2',
				title: 'V2: Verb Second',
				formulaTone: 'rose',
				formula: [
					{ text: 'onderwerp', variant: 'subject' },
					{ text: 'werkwoord', variant: 'verb' },
					{ text: 'rest' }
				],
				example: {
					nl: 'Ik drink elke dag koffie.',
					en: 'I drink coffee every day.'
				},
				trap: {
					title: 'Slot two, not word two',
					body: 'The finite verb is always the second grammatical element, not the second word. "Elke dag" is one time slot even though it is two words — so "Ik drink elke dag koffie" is still V2. Counting words instead of slots is the classic trap.'
				}
			},
			{
				id: 'g_word_order_inversion',
				title: 'Inversion',
				formulaTone: 'rose',
				formula: [
					{ text: 'rest' },
					{ text: 'werkwoord', variant: 'verb' },
					{ text: 'onderwerp', variant: 'subject' },
					{ text: 'rest' }
				],
				example: {
					nl: 'Morgen ga ik naar school.',
					en: 'Tomorrow I am going to school.'
				},
				trap: {
					title: 'Subject flips after the verb',
					body: 'When anything other than the subject opens the sentence (time, place, etc.), the verb stays in slot two and the subject flips right after it. English-habit writers keep subject first and produce "Morgen ik ga naar school" — wrong.'
				}
			},
			{
				id: 'g_word_order_subclause',
				title: 'Sub-Clauses: Verb to the End',
				formulaTone: 'rose',
				formula: [
					{ text: 'omdat' },
					{ text: 'onderwerp', variant: 'subject' },
					{ text: 'rest' },
					{ text: 'werkwoord', variant: 'verb' }
				],
				example: {
					nl: 'Ik blijf thuis omdat ik ziek ben.',
					en: 'I am staying home because I am sick.'
				},
				trap: {
					title: 'After omdat, the verb goes last',
					body: 'After conjunctions like omdat, dat, als, and terwijl, the conjugated verb jumps to the end of its clause instead of staying in V2. Learners keep it second and write "omdat ik ben ziek" — it has to be "omdat ik ziek ben."'
				}
			}
		]
	},
	{
		n: 2,
		id: 'present-tense',
		title: 'Present Tense',
		blurb: 'How verbs change for ik, jij, and hij — plus the two irregulars you cannot avoid.',
		tone: 'lavender',
		cards: [
			{
				id: 'g_present_stem',
				title: 'The Stem Rule',
				formulaTone: 'lavender',
				formula: [
					{ text: 'ik', variant: 'subject' },
					{ text: 'woon', variant: 'verb' },
					{ text: 'rest' },
					{ text: 'en' },
					{ text: 'jij', variant: 'subject' },
					{ text: 'woont', variant: 'verb' },
					{ text: 'rest' }
				],
				example: {
					nl: 'Ik woon in Utrecht en jij woont in Rotterdam.',
					en: 'I live in Utrecht and you live in Rotterdam.'
				},
				trap: {
					title: 'Ik never takes -t',
					body: 'Ik always takes the bare stem — no -t — even when it feels incomplete. Jij, hij, zij, and het add -t to the stem. Over-generalizing gives you "Ik woont," which is always wrong.'
				}
			},
			{
				id: 'g_present_jij_inversion',
				title: 'Jij Inversion Drops the -t',
				formulaTone: 'lavender',
				formula: [
					{ text: 'woon', variant: 'verb' },
					{ text: 'jij', variant: 'subject' },
					{ text: 'rest' }
				],
				example: {
					nl: 'Woon jij in Rotterdam?',
					en: 'Do you live in Rotterdam?'
				},
				trap: {
					title: 'Woon jij, never woont jij',
					body: 'The moment jij (or je) lands right after the verb — questions or after a fronted element — the verb loses its -t and reverts to the bare stem. This is specific to jij/je; hij, zij, and het keep the -t even inverted: "Woont hij hier?"'
				}
			},
			{
				id: 'g_present_hebben_zijn',
				title: 'Hebben and Zijn',
				formulaTone: 'lavender',
				formula: [
					{ text: 'hij/zij', variant: 'subject' },
					{ text: 'heeft', variant: 'verb' },
					{ text: 'rest' },
					{ text: 'en' },
					{ text: 'zij', variant: 'subject' },
					{ text: 'is', variant: 'verb' }
				],
				example: {
					nl: 'Hij heeft een zus en zij is arts.',
					en: 'He has a sister and she is a doctor.'
				},
				trap: {
					title: 'Irregular all the way',
					body: 'Hebben and zijn break the stem-plus-t pattern in the hij/zij/het form: it is heeft, not hebt, and is, not zijnt. Learn the full set: ik heb, ik ben; jij hebt, jij bent; hij heeft, hij is.'
				}
			}
		]
	},
	{
		n: 3,
		id: 'perfect-tense',
		title: 'Perfect Tense',
		blurb: 'Talk about the past with hebben or zijn plus a participle parked at the end.',
		tone: 'teal',
		cards: [
			{
				id: 'g_perfect_participle_end',
				title: 'Hebben/Zijn … Participle at the End',
				formulaTone: 'teal',
				formula: [
					{ text: 'onderwerp', variant: 'subject' },
					{ text: 'heb', variant: 'verb' },
					{ text: 'rest' },
					{ text: 'gelezen', variant: 'verb' }
				],
				example: {
					nl: 'Ik heb een boek gelezen.',
					en: 'I have read a book.'
				},
				trap: {
					title: 'Participle flies to the end',
					body: 'Unlike English "have read a book," the Dutch participle does not stay glued next to hebben or zijn — it flies to the very end of the clause, past objects and adverbs. "Ik heb gelezen een boek" is English order, not Dutch.'
				}
			},
			{
				id: 'g_perfect_kofschip',
				title: 'The Kofschip Rule: -d or -t?',
				formulaTone: 'teal',
				formula: [
					{ text: 'ge-' },
					{ text: 'werk', variant: 'verb' },
					{ text: '+t' },
					{ text: '(of -d)', variant: 'ghost' }
				],
				example: {
					nl: 'Ik heb de hele dag gewerkt.',
					en: 'I worked the whole day.'
				},
				trap: {
					title: 'Check the stem, not the infinitive',
					variant: 'tip',
					body: 'Look at the stem’s last letter, not the infinitive’s -en. The stem of werken is werk, ending in k — one of the kofschip consonants (t, k, f, s, ch, p) — so the ending is -t: gewerkt. Anything else takes -d, e.g. wonen → woon → gewoond. Checking the infinitive ending is the usual mistake.'
				}
			},
			{
				id: 'g_perfect_zijn',
				title: 'Verbs That Take Zijn',
				formulaTone: 'teal',
				formula: [
					{ text: 'onderwerp', variant: 'subject' },
					{ text: 'ben', variant: 'verb' },
					{ text: 'rest' },
					{ text: 'gegaan', variant: 'verb' }
				],
				example: {
					nl: 'Ik ben gisteren naar Amsterdam gegaan.',
					en: 'I went to Amsterdam yesterday.'
				},
				trap: {
					title: 'Motion and change take zijn',
					body: 'Verbs of motion or change of state (gaan, komen, worden, blijven, sterven, groeien) take zijn, not hebben. Hypercorrecting to "Ik heb gegaan" is the classic error.'
				}
			}
		]
	},
	{
		n: 4,
		id: 'separable-verbs',
		title: 'Separable Verbs',
		blurb:
			'Prefixes that split, reattach, and hide ge- in the middle — the three moves that matter.',
		tone: 'peach',
		cards: [
			{
				id: 'g_sep_prefix_splits',
				title: 'The Prefix Splits Off',
				formulaTone: 'peach',
				formula: [
					{ text: 'onderwerp', variant: 'subject' },
					{ text: 'bel', variant: 'verb' },
					{ text: 'rest' },
					{ text: 'op' }
				],
				example: {
					nl: 'Ik bel je morgen op.',
					en: 'I will call you tomorrow.'
				},
				trap: {
					title: 'Prefix flies to the end',
					body: 'In a main clause the conjugated verb and its prefix separate — the prefix lands at the very end. Keeping it glued like the infinitive produces "Ik opbel je morgen," which is wrong.'
				}
			},
			{
				id: 'g_sep_subclause_reattach',
				title: 'Sub-Clauses: It Reattaches',
				formulaTone: 'peach',
				formula: [
					{ text: 'dat' },
					{ text: 'onderwerp', variant: 'subject' },
					{ text: 'rest' },
					{ text: 'opbelt', variant: 'verb' }
				],
				example: {
					nl: 'Ik weet dat hij mij morgen opbelt.',
					en: 'I know that he will call me tomorrow.'
				},
				trap: {
					title: 'Only main clauses split',
					body: 'Inside a sub-clause the verb moves to the end (normal sub-clause rule) and the prefix reattaches into one word — opbelt, not split. It also stays glued after a modal or in any infinitive ("hij moet opbellen"). It only ever splits in a conjugated main clause.'
				}
			},
			{
				id: 'g_sep_ge_middle',
				title: 'Ge- Goes in the Middle',
				formulaTone: 'peach',
				formula: [{ text: 'op' }, { text: 'ge-' }, { text: 'beld', variant: 'verb' }],
				example: {
					nl: 'Ik heb je gisteren opgebeld.',
					en: 'I called you yesterday.'
				},
				trap: {
					title: 'op-ge-beld, never geopbeld',
					body: 'The ge- of the participle does not sit at the front of the whole verb — it slots between the prefix and the stem: op-ge-beld. "Geopbeld" is the form learners invent and never say.'
				}
			}
		]
	},
	{
		n: 5,
		id: 'modals',
		title: 'Modals',
		blurb:
			'Kunnen, moeten, mogen, willen, and zullen all drag a bare infinitive to the very end of the clause.',
		tone: 'rose',
		cards: [
			{
				id: 'g_modals_bare_inf',
				title: 'Modal Plus Bare Infinitive',
				formulaTone: 'rose',
				formula: [
					{ text: 'onderwerp', variant: 'subject' },
					{ text: 'moet', variant: 'verb' },
					{ text: 'rest' },
					{ text: 'werken', variant: 'verb' }
				],
				example: {
					nl: 'Ik moet vandaag werken.',
					en: 'I have to work today.'
				},
				trap: {
					title: 'Bare infinitive, always last',
					body: 'The second verb is a fully bare infinitive — no -t, no te, nothing conjugated — and it always sits at the very end, after everything else. English order "Ik moet werken vandaag" puts the infinitive too early. The same rule applies to every modal — kunnen, moeten, mogen, willen, and zullen all pair with a bare infinitive parked at the very end, no exceptions.'
				}
			},
			{
				id: 'g_modals_questions',
				title: 'Still Last, Even in Questions',
				formulaTone: 'rose',
				formula: [
					{ text: 'kun', variant: 'verb' },
					{ text: 'je', variant: 'subject' },
					{ text: 'rest' },
					{ text: 'komen', variant: 'verb' }
				],
				example: {
					nl: 'Kun je morgen komen?',
					en: 'Can you come tomorrow?'
				},
				trap: {
					title: 'Inversion does not move the infinitive',
					body: 'Even with inversion, the bare infinitive does not move — it stays at the very end, after other clause content like "morgen." Dropping it right after the modal ("Kun je komen morgen?") is the English habit.'
				}
			}
		]
	},
	{
		n: 6,
		id: 'negation',
		title: 'Negation',
		blurb: 'Geen for indefinite nouns, niet for everything else — two tools, clear jobs.',
		tone: 'lavender',
		cards: [
			{
				id: 'g_neg_geen',
				title: 'Geen for Indefinite Nouns',
				formulaTone: 'lavender',
				formula: [
					{ text: 'onderwerp', variant: 'subject' },
					{ text: 'heb', variant: 'verb' },
					{ text: 'geen' },
					{ text: 'tijd' }
				],
				example: {
					nl: 'Ik heb geen tijd.',
					en: 'I do not have time.'
				},
				trap: {
					title: 'Not "niet tijd"',
					body: 'Geen replaces een, or the absent article, in front of an indefinite noun. Reaching for niet instead produces "Ik heb niet tijd" or "Ik heb niet een tijd" — both wrong. It has to be geen.'
				}
			},
			{
				id: 'g_neg_niet',
				title: 'Niet for Everything Else',
				formulaTone: 'lavender',
				formula: [
					{ text: 'onderwerp', variant: 'subject' },
					{ text: 'versta', variant: 'verb' },
					{ text: 'het' },
					{ text: 'niet' }
				],
				example: {
					nl: 'Ik versta het niet.',
					en: 'I do not understand it.'
				},
				trap: {
					title: 'Niet moves earlier than you think',
					body: 'Niet negates verbs, definite nouns, adjectives, and whole ideas — everything geen does not cover. Its default spot is near the end of the clause, but it moves earlier in front of adjectives, prepositional phrases, and separable prefixes: "Ik bel je niet op," not "Ik bel je op niet."'
				}
			}
		]
	},
	{
		n: 7,
		id: 'de-het-adjectives',
		title: 'De/Het & Adjectives',
		blurb:
			'When the adjective takes -e before the noun — and the one neat exception for het-words.',
		tone: 'teal',
		cards: [
			{
				id: 'g_adj_de_words',
				title: 'De-Words: Always -e',
				formulaTone: 'teal',
				formula: [{ text: 'een' }, { text: 'grote' }, { text: 'hond' }],
				example: {
					nl: 'Ik zie een grote hond.',
					en: 'I see a big dog.'
				},
				trap: {
					title: 'No bare-adjective escape for de-words',
					body: 'De-words take -e on the adjective no matter what — definite or indefinite makes no difference. There is no bare-adjective exception for de-words the way there is for het-words. "Een groot hond" is never right.'
				}
			},
			{
				id: 'g_adj_het_definite',
				title: 'Het-Words: -e When Definite',
				formulaTone: 'teal',
				formula: [{ text: 'het' }, { text: 'grote' }, { text: 'huis' }],
				example: {
					nl: 'Het grote huis staat op de hoek.',
					en: 'The big house stands on the corner.'
				},
				trap: {
					title: 'Definite het still takes -e',
					body: 'With het plus definite, the adjective still takes -e, same as de-words — "het grote huis," not "het groot huis." The no-e exception only applies to the indefinite singular case (next card).'
				}
			},
			{
				id: 'g_adj_exception',
				title: 'The Exception: No -e',
				formulaTone: 'teal',
				formula: [{ text: 'een' }, { text: 'klein', variant: 'ghost' }, { text: 'huis' }],
				example: {
					nl: 'Ik woon in een klein huis.',
					en: 'I live in a small house.'
				},
				trap: {
					title: 'Only indefinite singular het',
					body: 'This is the one place the -e disappears: singular, indefinite, het-word. "Een klein huis," not "een kleine huis." Learners over-apply the de-word rule and add -e everywhere.'
				}
			}
		]
	},
	{
		n: 8,
		id: 'er',
		title: 'Er',
		blurb: 'Four jobs for one tiny word — dummy subject, place, quantity, and preposition glue.',
		tone: 'peach',
		cards: [
			{
				id: 'g_er_existential',
				title: 'Existential Er',
				formulaTone: 'peach',
				formula: [
					{ text: 'er' },
					{ text: 'ligt', variant: 'verb' },
					{ text: 'een boek', variant: 'subject' },
					{ text: 'rest' }
				],
				example: {
					nl: 'Er ligt een boek op tafel.',
					en: 'There is a book on the table.'
				},
				trap: {
					title: 'Indefinite subjects need dummy er',
					body: 'Whenever the grammatical subject is indefinite and nothing else opens the sentence, Dutch needs a dummy er up front — you cannot start with the verb ("Ligt een boek op tafel"). The same dummy er stands in for a missing subject in passives: "Er wordt hier Nederlands gesproken."'
				}
			},
			{
				id: 'g_er_locative',
				title: 'Locative Er',
				formulaTone: 'peach',
				formula: [
					{ text: 'onderwerp', variant: 'subject' },
					{ text: 'woon', variant: 'verb' },
					{ text: 'er' },
					{ text: 'rest' }
				],
				example: {
					nl: 'Woon je in Delft? Ja, ik woon er al vijf jaar.',
					en: 'Do you live in Delft? Yes, I have lived there for five years.'
				},
				trap: {
					title: 'Er stands in for the place',
					body: 'Er stands in for a place already on the table — you cannot just drop it ("Ik woon al vijf jaar," missing the place) or keep repeating the place name once it is established. Once Delft is mentioned, er takes over.'
				}
			},
			{
				id: 'g_er_quantitative',
				title: 'Quantitative Er',
				formulaTone: 'peach',
				formula: [
					{ text: 'onderwerp', variant: 'subject' },
					{ text: 'heb', variant: 'verb' },
					{ text: 'er' },
					{ text: 'twee' }
				],
				example: {
					nl: 'Heb je broers? Ik heb er twee.',
					en: 'Do you have brothers? I have two.'
				},
				trap: {
					title: 'Numbers need er',
					body: 'When you answer with just a number, Dutch cannot drop "of them" the way English does — you need the er. "Ik heb twee" on its own sounds incomplete; it has to be "Ik heb er twee."'
				}
			},
			{
				id: 'g_er_prepositional',
				title: 'Prepositional Er',
				formulaTone: 'peach',
				formula: [
					{ text: 'onderwerp', variant: 'subject' },
					{ text: 'schrijf', variant: 'verb' },
					{ text: 'ermee' }
				],
				example: {
					nl: 'Heb je een pen? Ja, ik schrijf ermee.',
					en: 'Do you have a pen? Yes, I write with it.'
				},
				trap: {
					title: 'Never "met het"',
					body: 'Dutch cannot use a bare preposition plus het or dat for a thing — the preposition fuses onto er instead: ermee, erop, eraan. "Met het" is English thinking; Dutch glues them together.'
				}
			}
		]
	},
	{
		n: 9,
		id: 'pronunciation',
		title: 'Pronunciation',
		blurb:
			'A few sound traps that trip English ears — ui, ei/ij, the hard g, and final consonants.',
		tone: 'rose',
		cards: [
			{
				id: 'g_pron_ui_eu',
				title: 'Ui vs Eu',
				formulaTone: 'rose',
				formula: [{ text: 'ui' }, { text: 'eu' }],
				example: {
					nl: 'Ik koop een leuke trui.',
					en: 'I am buying a nice sweater.'
				},
				trap: {
					title: 'Round further forward for ui',
					body: 'Both are rounded vowels absent from English and easy to flatten into the same sound. Round the lips more, further forward, for ui than for eu — and do not substitute an English "oy" or "ur" for either.'
				}
			},
			{
				id: 'g_pron_ij_ei',
				title: 'Ij and Ei Sound Identical',
				formulaTone: 'rose',
				formula: [{ text: 'ij' }, { text: 'ei' }],
				example: {
					nl: 'Mijn ei is klein.',
					en: 'My egg is small.'
				},
				trap: {
					title: 'Same sound, different spelling',
					body: 'Ij and ei are pronounced exactly the same, like English "eye," despite the different spelling. Spelling gives no clue which one a given word uses — it is memorized per word.'
				}
			},
			{
				id: 'g_pron_g_sch',
				title: 'Hard G, and Sch Is Not Sj',
				formulaTone: 'rose',
				formula: [{ text: 'g/ch' }, { text: 'sch' }],
				example: {
					nl: 'Ik ga graag naar school.',
					en: 'I like going to school.'
				},
				trap: {
					title: 'Rasp, not English g or sh',
					body: 'Dutch g and ch is a rasp from the back of the throat, not a hard English g. Word-initial sch is that same rasp glued after an s — it is not the soft "sh" of Dutch sj, which only shows up in loanwords and diminutives like sjaal.'
				}
			},
			{
				id: 'g_pron_devoicing_vw',
				title: 'Final Devoicing, V and W',
				formulaTone: 'rose',
				formula: [{ text: 'hond-hont' }, { text: 'v' }, { text: 'w' }],
				example: {
					nl: 'Mijn hond drinkt vers water.',
					en: 'My dog drinks fresh water.'
				},
				trap: {
					title: 'Hond sounds like "hont"',
					body: 'A final b or d devoices to p or t, so hond is said "hont" — do not fully voice it like English. And Dutch v and w invert English intuition: v is a soft, breathy f-ish sound, while w sits close to an English v, not a rounded English w.'
				}
			}
		]
	}
];
