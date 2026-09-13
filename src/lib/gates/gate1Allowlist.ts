/**
 * Gate 1 — First words. Curated lemma ids from WORD_POOL.
 * Not rank <= 1. Rank is a frequency band; this list is first-year A1.
 *
 * Missing from the entire pool (cannot invent): hallo, huis, fiets, ik,
 * alsjeblieft, dankjewel, brood, melk, thee, kat, zus, and several
 * core infinitives (zijn, hebben, gaan, komen, drinken, kunnen, …).
 * Those stay a content gap — do not flatten WORD_POOL to invent them.
 */

/** Corpus junk / abbreviations — never in any gate homework pool. */
export const DROP_FROM_HOMEWORK_IDS = [
	'w0262', // the
	'w0284', // der
	'w1032', // des
	'w0203', // ten
	'w0255', // ter
	'w0932', // ene
	'w0860', // a.
	'w0931', // d.
	'w0714', // etc
	'w1887', // as (axis)
	'w0787' // name (archaic)
] as const;

/** Formal / abstract / nationality / EU — not first-words. */
export const GATE1_MOVE_LATER_IDS = [
	'w1968',
	'w1261',
	'w0868',
	'w1298',
	'w1572',
	'w0355',
	'w0724',
	'w0445',
	'w1363',
	'w0617',
	'w1083',
	'w0707',
	'w0222',
	'w0378',
	'w1070',
	'w1260',
	'w1289',
	'w1801',
	'w1343',
	'w1301',
	'w1607',
	'w1230',
	'w1085',
	'w1571',
	'w0557',
	'w1845',
	'w0449',
	'w1353',
	'w1330',
	'w0729',
	'w0866',
	'w1257',
	'w1149',
	'w0360',
	'w0495',
	'w0596',
	'w1299',
	'w0328',
	'w0684',
	'w0695',
	'w0781',
	'w0760',
	'w0432',
	'w1836'
] as const;

/** Past / participle cards from the rank 0–1 audit — not G1 targets. */
export const GATE1_PAST_IDS = [
	'w1493',
	'w0746',
	'w0257',
	'w0838',
	'w0228',
	'w0664',
	'w0300',
	'w0378',
	'w1070',
	'w0235',
	'w0621',
	'w1034',
	'w1858',
	'w0701',
	'w0591',
	'w1650',
	'w0716',
	'w0329',
	'w0928',
	'w0578',
	'w0906',
	'w0382'
] as const;

/**
 * First-words allowlist. Ids only — lemmas stay stable if english/pos drift.
 * Days, months, shop, train/bus stay Gate 2 (Everyday Dutch).
 */
export const GATE1_WORD_IDS = [
	// yes/no + you
	'w0353', // ja
	'w0757', // nee
	'w0244', // jij
	'w0392', // jou
	'w0324', // jouw
	'w0231', // jullie
	// family / people
	'w0570', // familie
	'w0613', // moeder
	'w0679', // vader
	'w1978', // broer
	'w1000', // zoon
	'w1181', // dochter
	'w0311', // man
	'w0436', // vrouw
	'w0319', // kind
	'w1564', // meisje
	'w1843', // jongen
	'w1587', // vriend
	// eat / drink
	'w0344', // eten
	'w0847', // koffie
	'w0218', // water
	'w1116', // wijn
	'w1506', // glas
	'w0287', // lekker
	'w1999', // vis (pulled from r3)
	'w1429', // vlees (pulled from r3)
	'w0357', // beetje
	// home
	'w1279', // deur
	'w0643', // kamer
	'w1104', // tafel
	'w0390', // thuis
	'w0677', // wonen
	'w0853', // keuken (pulled from r6)
	'w0717', // tuin
	'w1856', // muur
	'w1425', // huizen
	'w0377', // boven
	'w0273', // open (pulled from r2)
	'w1255', // papier
	'w0529', // plek
	// car / walk / street / city
	'w0295', // auto
	'w0402', // lopen
	'w1216', // straat
	'w0327', // stad
	// school / words
	'w0316', // school
	'w0286', // boek
	'w0419', // lezen
	'w0605', // woord
	'w0978', // taal
	'w1531', // Engels
	'w1320', // brief
	'w0213', // vraag
	'w0718', // antwoord
	'w0412', // verhaal
	'w0766', // nummer
	'w0469', // probleem
	// talk / media / home tech
	'w0282', // kijken
	'w1094', // praten
	'w0895', // spreken
	'w0323', // zeggen
	'w0361', // zegt
	'w0817', // vertellen
	'w0654', // schrijven
	'w0264', // naam
	'w0972', // telefoon
	'w1315', // televisie
	'w0708', // film
	'w0456', // muziek
	'w1124', // noemen
	'w1129', // heet
	// body
	'w0321', // hand
	'w0542', // handen
	'w0639', // hoofd
	'w0917', // oog
	'w0576', // ogen
	'w1909', // mond
	'w1482', // neus
	'w1537', // voet
	'w0568', // hart
	// feelings
	'w0747', // blij
	'w0973', // fijn
	// time / small numbers (1–12 that exist; een/twee/drie missing)
	'w0297', // vandaag
	'w1162', // morgen
	'w1105', // gisteren
	'w0555', // avond (pulled from r6)
	'w1045', // acht
	'w0380', // vier
	'w0534', // vijf
	'w0877', // zes
	'w1046', // zeven
	'w1305', // negen
	'w0778', // tien
	'w1832', // elf
	'w1201', // twaalf
	'w0254', // soms
	'w0251', // nooit
	'w1525', // uren
	'w0744', // half
	// animals / weather / outside
	'w0903', // hond (pulled from r2)
	'w0807', // zon (pulled from r2)
	'w1854', // warm
	'w0305', // buiten
	'w0968', // lucht (pulled from r2)
	'w0983', // politie (pulled from r7)
	// describing
	'w0266', // leuk
	'w0256', // mooi
	'w0428', // klein
	'w0629', // oud
	'w0308', // nieuw
	'w0571', // jong
	'w1821', // groen
	'w1783', // wit
	'w1565', // zwart
	'w0603', // kleur
	'w0461', // licht
	'w0678', // hard
	'w0240', // lang
	'w0563', // kort
	'w0764', // makkelijk
	'w0610', // moeilijk
	'w0544', // klaar
	'w0690', // prima
	'w0465', // andere
	'w0397', // beide
	'w0458', // dezelfde
	'w0227', // gewoon
	'w0356', // weinig
	'w0208', // naast
	// present-tense verbs (infinitive or living present; no past/participle)
	'w0581', // beginnen
	'w0597', // betalen
	'w0342', // denken
	'w0359', // helpen
	'w0588', // horen
	'w0620', // kopen
	'w0289', // spelen
	'w0307', // brengen
	'w0438', // doe
	'w0243', // doet
	'w0237', // zie
	'w0349', // ziet
	'w0204', // kun
	'w0206', // mag
	'w0410', // mogen
	'w0214', // wilt
	'w0782', // wachten
	'w0450', // zoeken
	'w0279', // zitten
	'w0437', // liggen
	'w0739', // proberen
	'w1981', // openen
	'w0236', // blijven (pulled from r2)
	'w0719', // leggen
	'w0340', // zetten
	'w1930', // tekenen
	'w0575', // stap
	'w0836', // sport
	'w0863', // geef (pulled — geven missing)
	'w0480', // maak (pulled — maken missing)
	'w0513', // neem (pulled — nemen missing)
	'w0246', // vind (pulled — vinden missing)
	'w0661', // krijg
	'w1895' // hou
] as const;

export type Gate1WordId = (typeof GATE1_WORD_IDS)[number];

export const GATE1_WORD_ID_SET: ReadonlySet<string> = new Set(GATE1_WORD_IDS);

export const DROP_FROM_HOMEWORK_SET: ReadonlySet<string> = new Set(DROP_FROM_HOMEWORK_IDS);

/** Beginner frames for keepers whose WORD_POOL sentence_nl is A2–B1. */
export const GATE1_SENTENCE_OVERLAY: Record<string, { sentence_nl: string; sentence_en: string }> = {
	w1045: { sentence_nl: 'Ik tel tot acht.', sentence_en: 'I count to eight.' },
	w0295: { sentence_nl: 'De auto is nieuw.', sentence_en: 'The car is new.' },
	w0581: { sentence_nl: 'Wij beginnen nu.', sentence_en: 'We start now.' },
	w0597: { sentence_nl: 'Ik betaal de koffie.', sentence_en: 'I pay for the coffee.' },
	w0747: { sentence_nl: 'Ik ben blij.', sentence_en: 'I am happy.' },
	w0286: { sentence_nl: 'Dit is een boek.', sentence_en: 'This is a book.' },
	w0568: { sentence_nl: 'Mijn hart klopt.', sentence_en: 'My heart is beating.' },
	w0321: { sentence_nl: 'Geef mij je hand.', sentence_en: 'Give me your hand.' },
	w0402: { sentence_nl: 'Wij lopen naar school.', sentence_en: 'We walk to school.' },
	w0534: { sentence_nl: 'Ik heb vijf boeken.', sentence_en: 'I have five books.' },
	w0436: { sentence_nl: 'De vrouw is mijn moeder.', sentence_en: 'The woman is my mother.' },
	w0349: { sentence_nl: 'Hij ziet de hond.', sentence_en: 'He sees the dog.' },
	w0361: { sentence_nl: 'Zij zegt ja.', sentence_en: 'She says yes.' },
	w1105: { sentence_nl: 'Vandaag en gisteren.', sentence_en: 'Today and yesterday.' },
	w1162: { sentence_nl: 'Morgen drink ik koffie.', sentence_en: 'Tomorrow I drink coffee.' },
	w1320: { sentence_nl: 'Ik schrijf een brief.', sentence_en: 'I write a letter.' },
	w1181: { sentence_nl: 'Mijn dochter is klein.', sentence_en: 'My daughter is small.' },
	w0903: { sentence_nl: 'De hond is leuk.', sentence_en: 'The dog is nice.' },
	w1999: { sentence_nl: 'Ik eet vis.', sentence_en: 'I eat fish.' },
	w1429: { sentence_nl: 'Ik eet vlees.', sentence_en: 'I eat meat.' },
	w0853: { sentence_nl: 'De keuken is klein.', sentence_en: 'The kitchen is small.' },
	w0983: { sentence_nl: 'De politie helpt ons.', sentence_en: 'The police help us.' },
	w0555: { sentence_nl: 'Het is avond.', sentence_en: 'It is evening.' },
	w0273: { sentence_nl: 'De deur is open.', sentence_en: 'The door is open.' },
	w1425: { sentence_nl: 'De huizen zijn mooi.', sentence_en: 'The houses are pretty.' },
	w1129: { sentence_nl: 'Ik heet Anna.', sentence_en: 'My name is Anna.' },
	w0214: { sentence_nl: 'Jij wilt water.', sentence_en: 'You want water.' },
	w0204: { sentence_nl: 'Kun jij mij helpen?', sentence_en: 'Can you help me?' },
	w0206: { sentence_nl: 'Mag ik water?', sentence_en: 'May I have water?' },
	w0410: { sentence_nl: 'Jullie mogen spelen.', sentence_en: 'You may play.' },
	w0438: { sentence_nl: 'Doe de deur open.', sentence_en: 'Open the door.' },
	w0243: { sentence_nl: 'Hij doet het.', sentence_en: 'He does it.' },
	w0237: { sentence_nl: 'Ik zie de auto.', sentence_en: 'I see the car.' },
	w0807: { sentence_nl: 'De zon is warm.', sentence_en: 'The sun is warm.' },
	w0968: { sentence_nl: 'De lucht is blauw.', sentence_en: 'The sky is blue.' },
	w0863: { sentence_nl: 'Geef mij water.', sentence_en: 'Give me water.' },
	w0480: { sentence_nl: 'Ik maak koffie.', sentence_en: 'I make coffee.' },
	w0513: { sentence_nl: 'Neem het boek.', sentence_en: 'Take the book.' },
	w0246: { sentence_nl: 'Ik vind het leuk.', sentence_en: 'I like it. / I find it nice.' },
	w0661: { sentence_nl: 'Ik krijg een boek.', sentence_en: 'I get a book.' },
	w1895: { sentence_nl: 'Ik hou van je.', sentence_en: 'I love you.' }
};

/** Tokens that mean the stock sentence_nl is not first-words. Hide → lemma only. */
export const HARD_G1_FRAME_RE =
	/achthoek|cardioloog|hoorzitting|milieu|vogelaar|bouwvakkers|psychopaten|Tweede Kamer|Middeleeuwen|Europese Unie|gabber|tsunami|Mount Everest|accountant|Rijksoverheid|waarzegger|stewardess|eksters|vogeltrek|verpleegkundigen|contant geld|geslaagd|bibliotheek geleend|kritiek van de journalist|oudejaarsfeestjes|voldoende gehaald|zuinig|adelaars|industriële|opstel|stichting|democracy|politici/i;
