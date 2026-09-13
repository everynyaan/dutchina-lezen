import type { DailyRead } from './types';

export const READ_CONTENT: DailyRead[] = [
	// ── phrase-pack ─────────────────────────────────────────────
	{
		id: 'r001',
		tag: 'phrase-pack',
		title: 'Bij de dokter',
		titleEn: 'At the doctor',
		lines: [
			{
				nl: 'Ik heb al een week last van mijn keel.',
				en: "I've had a sore throat for a week already."
			},
			{
				nl: 'Waar doet het precies pijn?',
				en: 'Where exactly does it hurt?'
			},
			{
				nl: 'Ik voel me misselijk sinds gisteren.',
				en: "I've felt nauseous since yesterday."
			},
			{
				nl: 'Mag ik een recept voor de apotheek?',
				en: 'Could I get a prescription for the pharmacy?'
			},
			{
				nl: 'Wanneer krijg ik de uitslag?',
				en: 'When will I get the results?'
			}
		],
		note: 'Keep symptoms short and concrete; Dutch GPs like a clear list.'
	},
	{
		id: 'r002',
		tag: 'phrase-pack',
		title: 'Aan de telefoon',
		titleEn: 'On the phone',
		lines: [
			{
				nl: 'Met Anna, goedemorgen.',
				en: 'Anna speaking, good morning.'
			},
			{
				nl: 'Spreek ik met de heer De Vries?',
				en: 'Am I speaking with Mr de Vries?'
			},
			{
				nl: 'Een momentje, ik verbind u door.',
				en: "One moment, I'll put you through."
			},
			{
				nl: 'Hij is nu niet bereikbaar.',
				en: "He can't be reached right now."
			},
			{
				nl: 'Zal ik hem een berichtje doorgeven?',
				en: 'Shall I pass a message on to him?'
			}
		],
		note: 'Answering with "Met + name" is the standard Dutch phone greeting.'
	},
	{
		id: 'r003',
		tag: 'phrase-pack',
		title: 'Excuses maken',
		titleEn: 'Apologising',
		lines: [
			{
				nl: 'Sorry, dat was niet de bedoeling.',
				en: "Sorry, that wasn't what I meant."
			},
			{
				nl: 'Het spijt me echt van de vertraging.',
				en: "I'm really sorry about the delay."
			},
			{
				nl: 'Pardon, mag ik even langs?',
				en: 'Excuse me, may I slip past?'
			},
			{
				nl: 'Ik had dat beter moeten checken.',
				en: 'I should have double-checked that.'
			},
			{
				nl: 'Laat me dat goedmaken.',
				en: 'Let me make that up to you.'
			}
		]
	},
	{
		id: 'r004',
		tag: 'phrase-pack',
		title: 'Kleine praatjes',
		titleEn: 'Small talk',
		lines: [
			{
				nl: 'Hoe was je weekend?',
				en: 'How was your weekend?'
			},
			{
				nl: 'Wat doe jij de laatste tijd?',
				en: 'What have you been up to lately?'
			},
			{
				nl: 'Leuk je eindelijk eens te zien.',
				en: 'Nice to finally see you for once.'
			},
			{
				nl: 'Het is best druk op het werk.',
				en: "It's pretty busy at work."
			},
			{
				nl: 'Zullen we snel weer afspreken?',
				en: 'Shall we make plans again soon?'
			}
		],
		note: 'Weekend chat is the safest small-talk opener in Dutch workplaces.'
	},
	{
		id: 'r005',
		tag: 'phrase-pack',
		title: 'Netjes klagen',
		titleEn: 'Complaining politely',
		lines: [
			{
				nl: 'Pardon, dit is niet wat ik besteld heb.',
				en: "Excuse me, this isn't what I ordered."
			},
			{
				nl: 'Zou u hier even naar willen kijken?',
				en: 'Would you mind taking a look at this?'
			},
			{
				nl: 'De soep is helaas koud.',
				en: 'Unfortunately the soup is cold.'
			},
			{
				nl: 'Mag ik iets anders in plaats hiervan?',
				en: 'May I have something else instead?'
			},
			{
				nl: 'Ik wil graag een klacht indienen.',
				en: "I'd like to file a complaint."
			}
		]
	},
	{
		id: 'r006',
		tag: 'phrase-pack',
		title: 'In de supermarkt',
		titleEn: 'At the supermarket',
		lines: [
			{
				nl: 'Waar vind ik de zuivelafdeling?',
				en: 'Where can I find the dairy section?'
			},
			{
				nl: 'Heeft u dit ook in een grotere verpakking?',
				en: 'Do you have this in a larger pack as well?'
			},
			{
				nl: 'Mag ik met pin betalen?',
				en: 'Can I pay by card?'
			},
			{
				nl: 'Heeft u een tasje voor me?',
				en: 'Do you have a bag for me?'
			},
			{
				nl: 'Geldt de actieprijs alleen vandaag?',
				en: 'Does the sale price only apply today?'
			}
		],
		note: 'Bags are rarely free; expect to buy one or bring your own.'
	},
	{
		id: 'r007',
		tag: 'phrase-pack',
		title: 'Op een feestje',
		titleEn: 'At a birthday party',
		lines: [
			{
				nl: 'Van harte gefeliciteerd met je verjaardag!',
				en: 'Happy birthday — all the best!'
			},
			{
				nl: 'Wat een leuke taart heb je gemaakt.',
				en: 'What a lovely cake you made.'
			},
			{
				nl: 'Mag ik een stukje cake?',
				en: 'May I have a piece of cake?'
			},
			{
				nl: 'Hoe oud word je eigenlijk vandaag?',
				en: 'How old are you turning today, actually?'
			},
			{
				nl: 'Bedankt voor de uitnodiging, het was super.',
				en: 'Thanks for the invite — it was great.'
			}
		],
		note: 'At Dutch birthdays you often congratulate everyone present, not only the host.'
	},
	{
		id: 'r008',
		tag: 'phrase-pack',
		title: 'De weg vragen',
		titleEn: 'Asking for directions',
		lines: [
			{
				nl: 'Pardon, weet u waar het station is?',
				en: 'Excuse me, do you know where the station is?'
			},
			{
				nl: 'Ga rechtdoor en dan de tweede straat links.',
				en: 'Go straight ahead and then take the second street on the left.'
			},
			{
				nl: 'Is het nog ver lopen vanaf hier?',
				en: 'Is it still a long walk from here?'
			},
			{
				nl: 'Ligt de bibliotheek hier in de buurt?',
				en: 'Is the library around here?'
			},
			{
				nl: 'Dank u wel voor de uitleg.',
				en: 'Thank you for the directions.'
			}
		]
	},
	{
		id: 'r009',
		tag: 'phrase-pack',
		title: 'Tijdens het gesprek',
		titleEn: 'At a job interview',
		lines: [
			{
				nl: 'Vertel eens iets over jezelf.',
				en: 'Tell us a bit about yourself.'
			},
			{
				nl: 'Waarom wil je graag bij ons werken?',
				en: 'Why would you like to work with us?'
			},
			{
				nl: 'Ik spreek redelijk goed Nederlands.',
				en: 'I speak Dutch reasonably well.'
			},
			{
				nl: 'Wanneer kan ik beginnen?',
				en: 'When could I start?'
			},
			{
				nl: 'Heeft u nog vragen over mijn cv?',
				en: 'Do you have any other questions about my CV?'
			}
		]
	},
	{
		id: 'r010',
		tag: 'phrase-pack',
		title: 'In de trein',
		titleEn: 'On the train',
		lines: [
			{
				nl: 'Is deze stoel nog vrij?',
				en: 'Is this seat still free?'
			},
			{
				nl: 'Gaat deze trein naar Utrecht Centraal?',
				en: 'Does this train go to Utrecht Centraal?'
			},
			{
				nl: 'Mag ik even langs u?',
				en: 'May I get past you for a moment?'
			},
			{
				nl: 'Waar moet ik overstappen?',
				en: 'Where do I need to change trains?'
			},
			{
				nl: 'Mijn ov-chipkaart doet het niet.',
				en: "My public-transport card isn't working."
			}
		],
		note: 'Quiet coaches are marked stiltezone — keep phone calls out of them.'
	},
	{
		id: 'r011',
		tag: 'phrase-pack',
		title: 'In het café',
		titleEn: 'At a café',
		lines: [
			{
				nl: 'Mag ik de menukaart zien?',
				en: 'May I see the menu?'
			},
			{
				nl: 'Voor mij een cappuccino, graag.',
				en: "I'll have a cappuccino, please."
			},
			{
				nl: 'Is dit gerecht vegetarisch?',
				en: 'Is this dish vegetarian?'
			},
			{
				nl: 'Kunnen we de rekening krijgen?',
				en: 'Could we get the bill?'
			},
			{
				nl: 'Zal ik pinnen of contant betalen?',
				en: 'Shall I pay by card or in cash?'
			}
		]
	},
	{
		id: 'r012',
		tag: 'phrase-pack',
		title: 'Plannen maken',
		titleEn: 'Making plans',
		lines: [
			{
				nl: 'Heb je zin om vrijdag wat te doen?',
				en: 'Do you feel like doing something on Friday?'
			},
			{
				nl: 'Laten we rond half acht afspreken.',
				en: "Let's meet around half past seven."
			},
			{
				nl: 'Past het jou beter in de middag?',
				en: 'Does the afternoon work better for you?'
			},
			{
				nl: 'Ik stuur je straks de locatie.',
				en: "I'll send you the location in a bit."
			},
			{
				nl: 'Tot dan, ik kijk ernaar uit!',
				en: 'See you then — looking forward to it!'
			}
		],
		note: 'Dutch plans often land weeks ahead; vague "sometime" invites rarely work.'
	},
	{
		id: 'r013',
		tag: 'phrase-pack',
		title: 'Bij de apotheek',
		titleEn: 'At the pharmacy',
		lines: [
			{
				nl: 'Ik kom dit recept ophalen.',
				en: "I'm here to pick up this prescription."
			},
			{
				nl: 'Heeft u dit medicijn op voorraad?',
				en: 'Do you have this medicine in stock?'
			},
			{
				nl: 'Hoe vaak moet ik dit innemen?',
				en: 'How often should I take this?'
			},
			{
				nl: 'Mag ik het met de maaltijd slikken?',
				en: 'Can I take it with a meal?'
			},
			{
				nl: 'Moet ik mijn verzekeringspas laten zien?',
				en: 'Do I need to show my insurance card?'
			}
		]
	},
	{
		id: 'r014',
		tag: 'phrase-pack',
		title: 'Met de buren',
		titleEn: 'With the neighbours',
		lines: [
			{
				nl: 'Hallo, wij zijn jullie nieuwe buren.',
				en: 'Hi, we are your new neighbours.'
			},
			{
				nl: 'Mag ik je even iets vragen over de buurt?',
				en: 'May I ask you something quick about the neighbourhood?'
			},
			{
				nl: 'Het was gisteren best hard, sorry hoor.',
				en: 'It was pretty loud yesterday — sorry about that.'
			},
			{
				nl: 'Kunnen jullie de pakketjes aannemen?',
				en: 'Could you take in any parcels for us?'
			},
			{
				nl: 'Fijne avond verder!',
				en: 'Have a nice rest of your evening!'
			}
		]
	},
	{
		id: 'r015',
		tag: 'phrase-pack',
		title: 'Op het gemeentehuis',
		titleEn: 'At the town hall',
		lines: [
			{
				nl: 'Ik heb een afspraak voor een uittreksel.',
				en: 'I have an appointment for an extract from the register.'
			},
			{
				nl: 'Welke documenten moet ik meenemen?',
				en: 'Which documents do I need to bring?'
			},
			{
				nl: 'Hoe lang duurt de behandeling?',
				en: 'How long does processing take?'
			},
			{
				nl: 'Kan ik dit ook digitaal regelen?',
				en: 'Can I also arrange this online?'
			},
			{
				nl: 'Waar kan ik een nummer trekken?',
				en: 'Where can I take a ticket number?'
			}
		],
		note: 'Many gemeente services need DigiD; book ahead when you can.'
	},

	// ── culture ─────────────────────────────────────────────────
	{
		id: 'r016',
		tag: 'culture',
		title: 'Koffietijd op kantoor',
		titleEn: 'Coffee time at work',
		lines: [
			{
				nl: 'Rond half elf houden veel kantoren koffietijd.',
				en: 'Around half past ten, many offices take coffee time.'
			},
			{
				nl: 'Collega’s drinken koffie en eten vaak een koekje.',
				en: 'Colleagues drink coffee and often have a biscuit.'
			},
			{
				nl: 'Het is een vast moment om even bij te praten.',
				en: 'It is a fixed moment to catch up briefly.'
			},
			{
				nl: 'Soms staat er fruit of een stuk cake klaar.',
				en: 'Sometimes fruit or a piece of cake is laid out.'
			}
		],
		note: 'Skipping koffietijd can look antisocial more than efficient.'
	},
	{
		id: 'r017',
		tag: 'culture',
		title: 'Drie oktober in Leiden',
		titleEn: '3 October in Leiden',
		lines: [
			{
				nl: 'Op 3 oktober viert Leiden het Leidens Ontzet.',
				en: 'On 3 October, Leiden celebrates the Relief of Leiden.'
			},
			{
				nl: 'In 1574 werd de stad ontzet tijdens de Tachtigjarige Oorlog.',
				en: 'In 1574 the city was relieved during the Eighty Years’ War.'
			},
			{
				nl: 'Mensen eten dan haring met witte broodjes.',
				en: 'People then eat herring with soft white rolls.'
			},
			{
				nl: 'Er is een kermis en een feestelijke optocht door de stad.',
				en: 'There is a fair and a festive parade through the city.'
			}
		],
		note: 'Locals treat 3 October almost like a second New Year’s Eve.'
	},
	{
		id: 'r018',
		tag: 'culture',
		title: 'Betalen met Tikkie',
		titleEn: 'Paying with Tikkie',
		lines: [
			{
				nl: 'Tikkie is een app om snel geld te vragen.',
				en: 'Tikkie is an app for requesting money quickly.'
			},
			{
				nl: 'Na een diner stuurt iemand vaak één tikkie naar de groep.',
				en: 'After dinner someone often sends one payment request to the group.'
			},
			{
				nl: 'Je opent de link en betaalt via je eigen bankapp.',
				en: 'You open the link and pay through your own banking app.'
			},
			{
				nl: 'Contant geld zie je daardoor steeds minder.',
				en: 'As a result you see cash less and less.'
			}
		]
	},
	{
		id: 'r019',
		tag: 'culture',
		title: 'De verjaardagskalender',
		titleEn: 'The birthday calendar',
		lines: [
			{
				nl: 'In veel huizen hangt een verjaardagskalender op de wc.',
				en: 'In many homes a birthday calendar hangs on the toilet door.'
			},
			{
				nl: 'Daar schrijf je de namen van familie en vrienden op.',
				en: 'You write family and friends’ names on it there.'
			},
			{
				nl: 'Zo vergeet je geen verjaardag in de drukte.',
				en: 'That way you do not forget a birthday in the rush.'
			},
			{
				nl: 'Gasten lezen hem soms stiekem tijdens een bezoek.',
				en: 'Guests sometimes secretly read it during a visit.'
			}
		],
		note: 'Yes, the bathroom door is the classic spot — odd but practical.'
	},
	{
		id: 'r020',
		tag: 'culture',
		title: 'Fietsen in de stad',
		titleEn: 'Cycling in the city',
		lines: [
			{
				nl: 'Nederland heeft overal fietspaden naast de weg.',
				en: 'The Netherlands has cycle paths beside the road almost everywhere.'
			},
			{
				nl: '’s Avonds moet je licht voeren op je fiets.',
				en: 'In the evening you must use lights on your bike.'
			},
			{
				nl: 'Rechts heeft vaak voorrang, ook op de fiets.',
				en: 'Traffic from the right often has priority, also on a bike.'
			},
			{
				nl: 'Op de stoep fietsen mag meestal niet.',
				en: 'Cycling on the pavement is usually not allowed.'
			}
		]
	},
	{
		id: 'r021',
		tag: 'culture',
		title: 'Agenda en plannen',
		titleEn: 'Diaries and planning',
		lines: [
			{
				nl: 'Nederlanders plannen afspraken vaak weken vooruit.',
				en: 'Dutch people often schedule meet-ups weeks ahead.'
			},
			{
				nl: 'Zomaar langskomen zonder te bellen voelt onbeleefd.',
				en: 'Dropping by without calling feels impolite.'
			},
			{
				nl: 'In de agenda staat werk, sport en ook sociale tijd.',
				en: 'The diary holds work, sport, and social time too.'
			},
			{
				nl: '“Even kijken in mijn agenda” is een vaste zin.',
				en: '“Let me check my diary” is a set phrase.'
			}
		]
	},
	{
		id: 'r022',
		tag: 'culture',
		title: 'Hagelslag op brood',
		titleEn: 'Chocolate sprinkles on bread',
		lines: [
			{
				nl: 'Hagelslag zijn kleine chocoladekorrels voor op brood.',
				en: 'Hagelslag are tiny chocolate sprinkles for on bread.'
			},
			{
				nl: 'Je smeert eerst boter, anders vallen ze eraf.',
				en: 'You butter the bread first, or they fall off.'
			},
			{
				nl: 'Volwassenen eten het gewoon bij het ontbijt.',
				en: 'Adults eat it as a normal breakfast.'
			},
			{
				nl: 'Er is pure, melk en zelfs vruchtenhagelslag.',
				en: 'There is dark, milk, and even fruit-flavoured sprinkles.'
			}
		]
	},
	{
		id: 'r023',
		tag: 'culture',
		title: 'Sinterklaas in december',
		titleEn: 'Sinterklaas in December',
		lines: [
			{
				nl: 'Sinterklaas komt half november per stoomboot aan.',
				en: 'Sinterklaas arrives mid-November by steamboat.'
			},
			{
				nl: 'Op 5 december vieren veel gezinnen pakjesavond.',
				en: 'On 5 December many families celebrate gift evening.'
			},
			{
				nl: 'Kinderen zetten hun schoen klaar met een wortel.',
				en: 'Children put out their shoe with a carrot.'
			},
			{
				nl: 'Gedichten en surprises horen bij de cadeautjes.',
				en: 'Poems and handmade joke gifts go with the presents.'
			}
		],
		note: 'Pakjesavond is the main gift night; 6 December is less central now.'
	},
	{
		id: 'r024',
		tag: 'culture',
		title: 'Oranje op Koningsdag',
		titleEn: 'Orange on King’s Day',
		lines: [
			{
				nl: 'Koningsdag valt op 27 april, de verjaardag van de koning.',
				en: 'King’s Day falls on 27 April, the king’s birthday.'
			},
			{
				nl: 'Iedereen loopt in oranje kleren door de stad.',
				en: 'Everyone walks through town in orange clothes.'
			},
			{
				nl: 'Op de vrijmarkt mag je spullen vanaf de stoep verkopen.',
				en: 'At the free market you may sell things from the pavement.'
			},
			{
				nl: 'In Amsterdam is het extra druk op de grachten.',
				en: 'In Amsterdam it is especially crowded on the canals.'
			}
		]
	},
	{
		id: 'r025',
		tag: 'culture',
		title: 'Nederlandse directheid',
		titleEn: 'Dutch directness',
		lines: [
			{
				nl: 'Nederlanders zeggen vaak meteen wat ze denken.',
				en: 'Dutch people often say what they think straight away.'
			},
			{
				nl: 'Een korte “nee” is meestal geen belediging.',
				en: 'A short “no” is usually not an insult.'
			},
			{
				nl: 'Feedback op het werk klinkt soms hard voor buitenlanders.',
				en: 'Workplace feedback can sound harsh to foreigners.'
			},
			{
				nl: 'Duidelijkheid telt zwaarder dan zachte omwegen.',
				en: 'Clarity counts more than soft detours.'
			}
		],
		note: 'Direct is usually meant as efficient, not unkind.'
	},
	{
		id: 'r026',
		tag: 'culture',
		title: 'Doe maar gewoon',
		titleEn: 'Just act normal',
		lines: [
			{
				nl: '“Doe maar gewoon, dan doe je al gek genoeg.”',
				en: '“Just act normal — that’s crazy enough already.”'
			},
			{
				nl: 'De uitspraak waarschuwt tegen opscheppen en poeha.',
				en: 'The saying warns against showing off and fuss.'
			},
			{
				nl: 'Bescheidenheid scoort vaak hoger dan snelle roem.',
				en: 'Modesty often scores higher than quick fame.'
			},
			{
				nl: 'Je ziet het terug in kleding, auto’s en gesprekken.',
				en: 'You see it in clothes, cars, and conversations.'
			}
		]
	},
	{
		id: 'r027',
		tag: 'culture',
		title: 'Borrelen na het werk',
		titleEn: 'Drinks after work',
		lines: [
			{
				nl: 'Borrelen is informeel napraten met een drankje.',
				en: 'Borrelen is informal chatting with a drink.'
			},
			{
				nl: 'Vaak staan er nootjes, kaas of bitterballen bij.',
				en: 'There are often nuts, cheese, or bitterballen with it.'
			},
			{
				nl: 'Het kan op kantoor zijn of in een café om de hoek.',
				en: 'It can be at the office or in a café around the corner.'
			},
			{
				nl: 'Je hoeft niet lang te blijven; een halfuur telt al mee.',
				en: 'You need not stay long; half an hour already counts.'
			}
		]
	},
	{
		id: 'r028',
		tag: 'culture',
		title: 'De vla in de winkel',
		titleEn: 'Custard in the shop',
		lines: [
			{
				nl: 'Vla is een zachte pudding uit een pak in de koelkast.',
				en: 'Vla is a soft custard from a carton in the fridge.'
			},
			{
				nl: 'In de supermarkt is er een hele rij smaken.',
				en: 'In the supermarket there is a whole row of flavours.'
			},
			{
				nl: 'Vanille, chocolade en boerenvla zijn klassiekers.',
				en: 'Vanilla, chocolate, and farm-style vla are classics.'
			},
			{
				nl: 'Veel mensen gieten vla over een schaaltje fruit.',
				en: 'Many people pour vla over a bowl of fruit.'
			}
		]
	},
	{
		id: 'r029',
		tag: 'culture',
		title: 'Statiegeld op flessen',
		titleEn: 'Bottle deposits',
		lines: [
			{
				nl: 'Op veel flessen en blikjes zit statiegeld.',
				en: 'Many bottles and cans carry a deposit.'
			},
			{
				nl: 'Je brengt ze terug naar een automaat in de winkel.',
				en: 'You return them to a machine in the shop.'
			},
			{
				nl: 'Met het bonnetje krijg je het geld terug bij de kassa.',
				en: 'With the receipt you get the money back at the till.'
			},
			{
				nl: 'Kleine flesjes en blikjes vallen er inmiddels ook onder.',
				en: 'Small bottles and cans are included by now as well.'
			}
		]
	},
	{
		id: 'r030',
		tag: 'culture',
		title: 'Gordijnen open ’s avonds',
		titleEn: 'Curtains open at night',
		lines: [
			{
				nl: 'In Nederland blijven gordijnen ’s avonds vaak open.',
				en: 'In the Netherlands curtains often stay open in the evening.'
			},
			{
				nl: 'Van buiten zie je de lamp en de eettafel staan.',
				en: 'From outside you can see the lamp and the dining table.'
			},
			{
				nl: 'Het idee is: we hebben niets te verbergen.',
				en: 'The idea is: we have nothing to hide.'
			},
			{
				nl: 'In steden sluiten steeds meer mensen ze toch.',
				en: 'In cities more and more people close them anyway.'
			}
		]
	},

	// ── grammar-bite ────────────────────────────────────────────
	{
		id: 'r031',
		tag: 'grammar-bite',
		title: 'Tijd vooraan, werkwoord om',
		titleEn: 'Time first, verb flips',
		lines: [
			{
				nl: 'Morgen ga ik naar huis.',
				en: 'Tomorrow I am going home.'
			},
			{
				nl: 'Vandaag werk ik vanuit huis.',
				en: 'Today I am working from home.'
			},
			{
				nl: 'Gisteren at zij alleen pizza.',
				en: 'Yesterday she only ate pizza.'
			},
			{
				nl: 'Volgende week kom ik langs.',
				en: 'Next week I will drop by.'
			}
		],
		formula: {
			tone: 'rose',
			beads: [
				{ text: 'Morgen', variant: 'default' },
				{ text: 'ga', variant: 'verb' },
				{ text: 'ik', variant: 'subject' },
				{ text: 'naar huis', variant: 'default' }
			]
		},
		note: 'Front anything but the subject and the finite verb stays in slot two.'
	},
	{
		id: 'r032',
		tag: 'grammar-bite',
		title: 'Er als plaatshouder',
		titleEn: 'Er as placeholder',
		lines: [
			{
				nl: 'Er zijn twee boeken op tafel.',
				en: 'There are two books on the table.'
			},
			{
				nl: 'Er staat een auto voor de deur.',
				en: 'There is a car in front of the door.'
			},
			{
				nl: 'Er ligt sneeuw in de tuin.',
				en: 'There is snow lying in the garden.'
			},
			{
				nl: 'Er is nog soep over.',
				en: 'There is still some soup left.'
			}
		],
		formula: {
			tone: 'lavender',
			beads: [
				{ text: 'Er', variant: 'default' },
				{ text: 'zijn', variant: 'verb' },
				{ text: 'twee boeken', variant: 'subject' },
				{ text: 'op tafel', variant: 'default' }
			]
		},
		note: 'Er holds the empty first slot so the real subject can follow the verb.'
	},
	{
		id: 'r033',
		tag: 'grammar-bite',
		title: 'Scheidbare werkwoorden',
		titleEn: 'Separable verbs',
		lines: [
			{
				nl: 'Ik bel je straks op.',
				en: "I'll call you later."
			},
			{
				nl: 'Zij doet het licht uit.',
				en: 'She turns the light off.'
			},
			{
				nl: 'Wij komen morgen bij je langs.',
				en: 'We will drop by tomorrow.'
			},
			{
				nl: 'Hij doet zijn jas aan in de gang.',
				en: 'He puts his coat on in the hall.'
			}
		],
		formula: {
			tone: 'teal',
			beads: [
				{ text: 'Ik', variant: 'subject' },
				{ text: 'bel', variant: 'verb' },
				{ text: 'je straks', variant: 'default' },
				{ text: 'op', variant: 'default' }
			]
		},
		note: 'In a main clause the prefix parks at the end: opbellen → bel … op.'
	},
	{
		id: 'r034',
		tag: 'grammar-bite',
		title: 'Perfectum met hebben',
		titleEn: 'Perfect tense with hebben',
		lines: [
			{
				nl: 'Ik heb de film gisteren gezien.',
				en: 'I saw the film yesterday.'
			},
			{
				nl: 'Zij heeft een lange brief geschreven.',
				en: 'She has written a long letter.'
			},
			{
				nl: 'Wij hebben pizza besteld.',
				en: 'We ordered pizza.'
			},
			{
				nl: 'Heb jij je huiswerk al gemaakt?',
				en: 'Have you done your homework already?'
			}
		],
		formula: {
			tone: 'peach',
			beads: [
				{ text: 'Ik', variant: 'subject' },
				{ text: 'heb', variant: 'verb' },
				{ text: 'de film', variant: 'default' },
				{ text: 'gezien', variant: 'default' }
			]
		},
		note: 'Most everyday actions take hebben + past participle at the end.'
	},
	{
		id: 'r035',
		tag: 'grammar-bite',
		title: 'Perfectum met zijn',
		titleEn: 'Perfect tense with zijn',
		lines: [
			{
				nl: 'Hij is naar Amsterdam gegaan.',
				en: 'He has gone to Amsterdam.'
			},
			{
				nl: 'Ik ben gisteren laat thuisgekomen.',
				en: 'I got home late yesterday.'
			},
			{
				nl: 'Zij is vorig jaar arts geworden.',
				en: 'She became a doctor last year.'
			},
			{
				nl: 'Wij zijn te laat aangekomen.',
				en: 'We arrived too late.'
			}
		],
		formula: {
			tone: 'rose',
			beads: [
				{ text: 'Hij', variant: 'subject' },
				{ text: 'is', variant: 'verb' },
				{ text: 'naar Amsterdam', variant: 'default' },
				{ text: 'gegaan', variant: 'default' }
			]
		},
		note: 'Motion and change-of-state verbs usually pick zijn, not hebben.'
	},
	{
		id: 'r036',
		tag: 'grammar-bite',
		title: 'Vergelijkingen maken',
		titleEn: 'Making comparisons',
		lines: [
			{
				nl: 'Deze tas is goedkoper dan die.',
				en: 'This bag is cheaper than that one.'
			},
			{
				nl: 'Hij is groter dan zijn broer.',
				en: 'He is taller than his brother.'
			},
			{
				nl: 'Ik vind thee lekkerder dan koffie.',
				en: 'I find tea tastier than coffee.'
			},
			{
				nl: 'Dit huis is meer geschikt voor ons.',
				en: 'This house is more suitable for us.'
			}
		],
		formula: {
			tone: 'lavender',
			beads: [
				{ text: 'Deze tas', variant: 'subject' },
				{ text: 'is', variant: 'verb' },
				{ text: 'goedkoper', variant: 'default' },
				{ text: 'dan die', variant: 'default' }
			]
		},
		note: 'Short adjectives take -er; longer ones use meer. Compare with dan.'
	},
	{
		id: 'r037',
		tag: 'grammar-bite',
		title: 'Modaal plus infinitief',
		titleEn: 'Modal plus infinitive',
		lines: [
			{
				nl: 'Ik wil morgen vrij nemen.',
				en: 'I want to take tomorrow off.'
			},
			{
				nl: 'Je moet harder studeren voor het examen.',
				en: 'You have to study harder for the exam.'
			},
			{
				nl: 'Mag ik hier even parkeren?',
				en: 'May I park here for a moment?'
			},
			{
				nl: 'Wij kunnen je vanavond helpen.',
				en: 'We can help you this evening.'
			}
		],
		formula: {
			tone: 'teal',
			beads: [
				{ text: 'Ik', variant: 'subject' },
				{ text: 'wil', variant: 'verb' },
				{ text: 'morgen vrij', variant: 'default' },
				{ text: 'nemen', variant: 'default' }
			]
		},
		note: 'The modal is finite in slot two; the main verb waits as infinitive at the end.'
	},
	{
		id: 'r038',
		tag: 'grammar-bite',
		title: 'Betrekkelijke bijzinnen',
		titleEn: 'Relative clauses',
		lines: [
			{
				nl: 'De man die daar staat, is mijn buurman.',
				en: 'The man who is standing there is my neighbour.'
			},
			{
				nl: 'Het boek dat ik las, was spannend.',
				en: 'The book that I read was exciting.'
			},
			{
				nl: 'De fiets die ik kocht, is blauw.',
				en: 'The bike that I bought is blue.'
			},
			{
				nl: 'Ken jij de vrouw die hier werkt?',
				en: 'Do you know the woman who works here?'
			}
		],
		formula: {
			tone: 'peach',
			beads: [
				{ text: 'De man', variant: 'subject' },
				{ text: 'die', variant: 'default' },
				{ text: 'daar staat', variant: 'verb' },
				{ text: 'is mijn buurman', variant: 'default' }
			]
		},
		note: 'Die for de-words and people; dat for het-words. Verb goes to the clause end.'
	},
	{
		id: 'r039',
		tag: 'grammar-bite',
		title: 'Om te plus infinitief',
		titleEn: 'Om te plus infinitive',
		lines: [
			{
				nl: 'Ik ga naar de winkel om brood te kopen.',
				en: 'I am going to the shop to buy bread.'
			},
			{
				nl: 'Zij belt om te vragen of je komt.',
				en: 'She is calling to ask whether you are coming.'
			},
			{
				nl: 'Hij leert Nederlands om hier te werken.',
				en: 'He is learning Dutch in order to work here.'
			},
			{
				nl: 'We stoppen even om koffie te drinken.',
				en: 'We stop briefly to drink coffee.'
			}
		],
		formula: {
			tone: 'rose',
			beads: [
				{ text: 'om', variant: 'default' },
				{ text: 'brood', variant: 'default' },
				{ text: 'te', variant: 'default' },
				{ text: 'kopen', variant: 'verb' }
			]
		},
		note: 'Purpose after a main action: om + (object) + te + infinitive.'
	},
	{
		id: 'r040',
		tag: 'grammar-bite',
		title: 'Kleine verkleinwoordjes',
		titleEn: 'Diminutives',
		lines: [
			{
				nl: 'Wil je een kopje thee?',
				en: 'Would you like a little cup of tea?'
			},
			{
				nl: 'Er staat een huisje achter in de tuin.',
				en: 'There is a little house at the back of the garden.'
			},
			{
				nl: 'Geef het kindje even een hand.',
				en: 'Give the little child a hand for a moment.'
			},
			{
				nl: 'Neem nog een stukje cake mee.',
				en: 'Take another little piece of cake with you.'
			}
		],
		formula: {
			tone: 'lavender',
			beads: [
				{ text: 'een', variant: 'default' },
				{ text: 'kop', variant: 'default' },
				{ text: '-je', variant: 'default' },
				{ text: 'thee', variant: 'ghost' }
			]
		},
		note: 'Diminutives end in -je/-tje/-pje/-kje/-etje and are always het-words.'
	},
	{
		id: 'r041',
		tag: 'grammar-bite',
		title: 'Niet of geen',
		titleEn: 'Niet versus geen',
		lines: [
			{
				nl: 'Ik heb geen tijd vandaag.',
				en: 'I have no time today.'
			},
			{
				nl: 'Ik werk niet op zondag.',
				en: 'I do not work on Sunday.'
			},
			{
				nl: 'Zij wil geen koffie, dank je.',
				en: 'She does not want coffee, thank you.'
			},
			{
				nl: 'Hij komt vanavond niet mee.',
				en: 'He is not coming along this evening.'
			}
		],
		formula: {
			tone: 'teal',
			beads: [
				{ text: 'Ik', variant: 'subject' },
				{ text: 'heb', variant: 'verb' },
				{ text: 'geen', variant: 'default' },
				{ text: 'tijd', variant: 'default' }
			]
		},
		note: 'Geen replaces een/any before a noun; niet negates verbs, adjectives, and the rest.'
	},
	{
		id: 'r042',
		tag: 'grammar-bite',
		title: 'Bijzin: werkwoord achteraan',
		titleEn: 'Subclause: verb at the end',
		lines: [
			{
				nl: 'Ik blijf thuis omdat ik ziek ben.',
				en: 'I am staying home because I am ill.'
			},
			{
				nl: 'Zij zegt dat hij later komt.',
				en: 'She says that he is coming later.'
			},
			{
				nl: 'Als het regent, neem ik de bus.',
				en: 'If it rains, I take the bus.'
			},
			{
				nl: 'Ik weet niet of zij er is.',
				en: 'I do not know whether she is there.'
			}
		],
		formula: {
			tone: 'peach',
			beads: [
				{ text: 'omdat', variant: 'default' },
				{ text: 'ik', variant: 'subject' },
				{ text: 'ziek', variant: 'default' },
				{ text: 'ben', variant: 'verb' }
			]
		},
		note: 'After omdat, dat, als, of… the finite verb moves to the clause end.'
	},
	{
		id: 'r043',
		tag: 'grammar-bite',
		title: 'Wederkerende werkwoorden',
		titleEn: 'Reflexive verbs',
		lines: [
			{
				nl: 'Ik was me elke ochtend.',
				en: 'I wash (myself) every morning.'
			},
			{
				nl: 'Hij schaamt zich voor de fout.',
				en: 'He is ashamed of the mistake.'
			},
			{
				nl: 'Voel je je al een beetje beter?',
				en: 'Do you feel a bit better already?'
			},
			{
				nl: 'Wij haasten ons naar het station.',
				en: 'We are hurrying to the station.'
			}
		],
		formula: {
			tone: 'rose',
			beads: [
				{ text: 'Ik', variant: 'subject' },
				{ text: 'was', variant: 'verb' },
				{ text: 'me', variant: 'default' },
				{ text: 'elke ochtend', variant: 'default' }
			]
		},
		note: 'Match the reflexive: me/je/zich/ons/je/zich with the subject.'
	},
	{
		id: 'r044',
		tag: 'grammar-bite',
		title: 'Ja-nee vragen',
		titleEn: 'Yes-no questions',
		lines: [
			{
				nl: 'Woon jij in Rotterdam?',
				en: 'Do you live in Rotterdam?'
			},
			{
				nl: 'Heb je honger?',
				en: 'Are you hungry?'
			},
			{
				nl: 'Komt zij vanavond ook?',
				en: 'Is she coming this evening too?'
			},
			{
				nl: 'Is dit jouw tas?',
				en: 'Is this your bag?'
			}
		],
		formula: {
			tone: 'lavender',
			beads: [
				{ text: 'Woon', variant: 'verb' },
				{ text: 'jij', variant: 'subject' },
				{ text: 'in Rotterdam', variant: 'default' },
				{ text: '?', variant: 'ghost' }
			]
		},
		note: 'Finite verb first, then subject. With jij the -t on the verb drops: woon jij.'
	},
	{
		id: 'r045',
		tag: 'grammar-bite',
		title: 'Gebiedende wijs zachtjes',
		titleEn: 'Soft imperatives',
		lines: [
			{
				nl: 'Kom maar binnen.',
				en: 'Do come in.'
			},
			{
				nl: 'Wacht even, alsjeblieft.',
				en: 'Wait a moment, please.'
			},
			{
				nl: 'Doe rustig aan met die tas.',
				en: 'Take it easy with that bag.'
			},
			{
				nl: 'Kijk eens hier op het scherm.',
				en: 'Have a look here on the screen.'
			}
		],
		formula: {
			tone: 'teal',
			beads: [
				{ text: 'Kom', variant: 'verb' },
				{ text: 'maar', variant: 'default' },
				{ text: 'binnen', variant: 'default' },
				{ text: 'eens', variant: 'ghost' }
			]
		},
		note: 'Maar, eens, even and toch soften a bare command into everyday speech.'
	},

	// ── word-story ──────────────────────────────────────────────
	{
		id: 'r046',
		tag: 'word-story',
		title: 'Het woord gezellig',
		titleEn: 'The word gezellig',
		lines: [
			{
				nl: 'Het was een gezellige avond bij jullie thuis.',
				en: 'It was a warm, sociable evening at your place.'
			},
			{
				nl: 'Wat zit je daar gezellig te lezen in de zon.',
				en: 'How nicely you are sitting there reading in the sun.'
			},
			{
				nl: 'Kom gezellig even langs na je werk.',
				en: 'Come drop by for a nice visit after work.'
			},
			{
				nl: 'Alleen eten in die grote zaal is niet gezellig.',
				en: 'Eating alone in that big hall is not pleasant.'
			}
		],
		note: 'Gezellig covers cosy, social, and “nice atmosphere” — not just “fun”.'
	},
	{
		id: 'r047',
		tag: 'word-story',
		title: 'Het woord lekker',
		titleEn: 'The word lekker',
		lines: [
			{
				nl: 'De tomatensoep is echt lekker vandaag.',
				en: 'The tomato soup is really tasty today.'
			},
			{
				nl: 'Lekker geslapen vannacht?',
				en: 'Did you sleep well last night?'
			},
			{
				nl: 'Ik ga lekker vroeg naar bed.',
				en: "I'm going to bed nice and early."
			},
			{
				nl: 'Blijf jij lekker zitten, ik haal koffie.',
				en: 'You just stay put — I’ll get coffee.'
			}
		]
	},
	{
		id: 'r048',
		tag: 'word-story',
		title: 'Het woordje even',
		titleEn: 'The little word even',
		lines: [
			{
				nl: 'Mag ik even je pen lenen?',
				en: 'May I borrow your pen for a second?'
			},
			{
				nl: 'Wacht even, ik ben er zo.',
				en: 'Hang on a moment — I’ll be right there.'
			},
			{
				nl: 'Even kijken wat er op de planning staat.',
				en: 'Just let me check what’s on the schedule.'
			},
			{
				nl: 'We zijn er even tussenuit dit weekend.',
				en: 'We’re away for a short break this weekend.'
			}
		],
		note: 'Even almost always softens a request into “just briefly”.'
	},
	{
		id: 'r049',
		tag: 'word-story',
		title: 'Het woordje hoor',
		titleEn: 'The particle hoor',
		lines: [
			{
				nl: 'Ik kom zo, hoor.',
				en: "I'm coming in a sec, alright."
			},
			{
				nl: 'Dat is best duur, hoor.',
				en: "That's pretty expensive, you know."
			},
			{
				nl: 'Nee hoor, geen probleem.',
				en: 'No no, no problem at all.'
			},
			{
				nl: 'Tot morgen hoor!',
				en: 'See you tomorrow then!'
			}
		],
		note: 'Hoor is a spoken softener: reassurance, mild warning, or friendly close.'
	},
	{
		id: 'r050',
		tag: 'word-story',
		title: 'Het woordje toch',
		titleEn: 'The particle toch',
		lines: [
			{
				nl: 'Je komt toch vanavond?',
				en: 'You are coming this evening, right?'
			},
			{
				nl: 'Het is toch koud buiten zonder jas.',
				en: "It is cold outside without a coat, isn't it."
			},
			{
				nl: 'Doe het toch maar op die manier.',
				en: 'Go ahead and do it that way after all.'
			},
			{
				nl: 'Waarom lach je toch zo hard?',
				en: 'Why on earth are you laughing so hard?'
			}
		]
	},
	{
		id: 'r051',
		tag: 'word-story',
		title: 'Het werkwoord doen',
		titleEn: 'The verb doen',
		lines: [
			{
				nl: 'Wat doe je dit weekend?',
				en: 'What are you doing this weekend?'
			},
			{
				nl: 'Doe de deur even dicht, alsjeblieft.',
				en: 'Shut the door for a moment, please.'
			},
			{
				nl: 'Dat doet pijn als ik buk.',
				en: 'That hurts when I bend down.'
			},
			{
				nl: 'Doe maar alsof je thuis bent.',
				en: 'Just act as if you are at home.'
			},
			{
				nl: 'Hoe doet hij dat altijd zo snel?',
				en: 'How does he always manage that so fast?'
			}
		]
	},
	{
		id: 'r052',
		tag: 'word-story',
		title: 'Het werkwoord halen',
		titleEn: 'The verb halen',
		lines: [
			{
				nl: 'Ik ga even brood bij de bakker halen.',
				en: "I'm just going to get bread from the baker."
			},
			{
				nl: 'Hij haalde een hoog cijfer voor wiskunde.',
				en: 'He got a high mark for maths.'
			},
			{
				nl: 'Kun jij de kinderen van school halen?',
				en: 'Can you pick the children up from school?'
			},
			{
				nl: 'Dat haalt toch niks uit op dit moment.',
				en: "That won't make any difference right now."
			}
		]
	},
	{
		id: 'r053',
		tag: 'word-story',
		title: 'Het woord zin',
		titleEn: 'The word zin',
		lines: [
			{
				nl: 'Ik heb zin in een warme chocomel.',
				en: 'I feel like a hot chocolate.'
			},
			{
				nl: 'Wat is de zin van dit lange verhaal?',
				en: 'What is the point of this long story?'
			},
			{
				nl: 'Schrijf de eerste zin nog een keer over.',
				en: 'Copy the first sentence one more time.'
			},
			{
				nl: 'Het heeft geen zin om hier te wachten.',
				en: 'There is no point in waiting here.'
			}
		]
	},
	{
		id: 'r054',
		tag: 'word-story',
		title: 'Het woord leuk',
		titleEn: 'The word leuk',
		lines: [
			{
				nl: 'Wat een leuk cadeau heb je uitgezocht.',
				en: 'What a nice present you picked out.'
			},
			{
				nl: 'Ik vind haar best leuk als collega.',
				en: 'I quite like her as a colleague.'
			},
			{
				nl: 'Leuk je weer te zien na zo lang.',
				en: 'Nice to see you again after so long.'
			},
			{
				nl: 'Dat klinkt als een leuk plan voor zondag.',
				en: 'That sounds like a fun plan for Sunday.'
			}
		]
	},
	{
		id: 'r055',
		tag: 'word-story',
		title: 'Het werkwoord gaan',
		titleEn: 'The verb gaan',
		lines: [
			{
				nl: 'Ik ga straks naar de markt.',
				en: "I'm going to the market in a bit."
			},
			{
				nl: 'Hoe gaat het met je nieuwe baan?',
				en: 'How is your new job going?'
			},
			{
				nl: 'Het gaat zo regenen, voel maar.',
				en: "It's about to rain — just feel it."
			},
			{
				nl: 'Gaat dat lukken voor vrijdag?',
				en: 'Will that work out by Friday?'
			},
			{
				nl: 'Die oude broek gaat echt niet meer.',
				en: 'Those old trousers really won’t do any more.'
			}
		]
	},
	{
		id: 'r056',
		tag: 'word-story',
		title: 'Het woordje maar',
		titleEn: 'The little word maar',
		lines: [
			{
				nl: 'Ik wil wel komen, maar ik heb geen tijd.',
				en: 'I do want to come, but I have no time.'
			},
			{
				nl: 'Kom maar binnen, de koffie staat klaar.',
				en: 'Do come in — the coffee is ready.'
			},
			{
				nl: 'Doe maar een koffie met melk.',
				en: "I'll just have a coffee with milk."
			},
			{
				nl: 'Hij is maar een kind van acht.',
				en: 'He is only an eight-year-old child.'
			}
		]
	},
	{
		id: 'r057',
		tag: 'word-story',
		title: 'Het woord eigenlijk',
		titleEn: 'The word eigenlijk',
		lines: [
			{
				nl: 'Eigenlijk wil ik liever thuisblijven.',
				en: 'Actually I’d rather stay home.'
			},
			{
				nl: 'Wat doe je eigenlijk voor werk?',
				en: 'What do you do for work, actually?'
			},
			{
				nl: 'Het is eigenlijk best een simpele truc.',
				en: 'It is really quite a simple trick.'
			},
			{
				nl: 'Ik had er eigenlijk geen zin in.',
				en: 'To be honest I didn’t feel like it.'
			}
		]
	},
	{
		id: 'r058',
		tag: 'word-story',
		title: 'Het woord gewoon',
		titleEn: 'The word gewoon',
		lines: [
			{
				nl: 'Doe maar gewoon een broodje kaas.',
				en: 'Just a plain cheese sandwich is fine.'
			},
			{
				nl: 'Hij is gewoon te moe om te praten.',
				en: 'He is simply too tired to talk.'
			},
			{
				nl: 'Gewoon doorgaan, niet blijven stilstaan.',
				en: 'Just keep going — don’t stand still.'
			},
			{
				nl: 'Dat is hier gewoon zo, geloof me.',
				en: 'That’s just how it is here, believe me.'
			}
		]
	},
	{
		id: 'r059',
		tag: 'word-story',
		title: 'Het woordje wel',
		titleEn: 'The particle wel',
		lines: [
			{
				nl: 'Ik heb wel zin, maar geen tijd.',
				en: 'I do feel like it, but I have no time.'
			},
			{
				nl: 'Dat kan wel, hoor, geen zorgen.',
				en: "That's fine, really — no worries."
			},
			{
				nl: 'Hij is wel aardig als je hem kent.',
				en: 'He is actually quite nice once you know him.'
			},
			{
				nl: 'Kom je wel op tijd vanavond?',
				en: 'You will be on time this evening, won’t you?'
			}
		],
		note: 'Wel often pushes back against a no: affirmation, mild praise, or check.'
	},
	{
		id: 'r060',
		tag: 'word-story',
		title: 'Het woordje al',
		titleEn: 'The little word al',
		lines: [
			{
				nl: 'Ben je al klaar met je huiswerk?',
				en: 'Are you already done with your homework?'
			},
			{
				nl: 'Ik woon hier al vijf jaar.',
				en: 'I have lived here for five years already.'
			},
			{
				nl: 'Al goed, ik regel het zelf wel.',
				en: 'Never mind — I’ll sort it myself.'
			},
			{
				nl: 'Al is het koud, ik ga toch wandelen.',
				en: 'Even if it is cold, I am going for a walk anyway.'
			}
		]
	}
];
