import type { ConnectionsPuzzle, PuzzelrondePuzzle } from '../../shared/types.js';

const connectionsPuzzles: ConnectionsPuzzle[] = [
  // ═══════════════════════════════════════════
  //  EASY — straightforward categories
  // ═══════════════════════════════════════════
  {
    id: 'conn-e1',
    type: 'connections',
    difficulty: 'easy',
    groups: [
      { label: 'Kleuren', words: ['Rood', 'Blauw', 'Groen', 'Geel'], difficulty: 1 },
      { label: 'Fruit', words: ['Appel', 'Peer', 'Banaan', 'Kers'], difficulty: 2 },
      { label: 'Seizoenen', words: ['Lente', 'Zomer', 'Herfst', 'Winter'], difficulty: 3 },
      { label: 'Familieleden', words: ['Moeder', 'Vader', 'Zus', 'Broer'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-e2',
    type: 'connections',
    difficulty: 'easy',
    groups: [
      { label: 'Dieren op de boerderij', words: ['Koe', 'Kip', 'Varken', 'Schaap'], difficulty: 1 },
      { label: 'Vervoersmiddelen', words: ['Fiets', 'Auto', 'Trein', 'Bus'], difficulty: 2 },
      { label: 'Lichaamsdelen', words: ['Arm', 'Been', 'Hoofd', 'Hand'], difficulty: 3 },
      { label: 'Kleding', words: ['Broek', 'Shirt', 'Jas', 'Sok'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-e3',
    type: 'connections',
    difficulty: 'easy',
    groups: [
      { label: 'Groenten', words: ['Wortel', 'Ui', 'Paprika', 'Tomaat'], difficulty: 1 },
      { label: 'Schoolvakken', words: ['Wiskunde', 'Engels', 'Biologie', 'Geschiedenis'], difficulty: 2 },
      { label: 'Muziekinstrumenten', words: ['Gitaar', 'Piano', 'Drums', 'Fluit'], difficulty: 3 },
      { label: 'Planeten', words: ['Mars', 'Venus', 'Jupiter', 'Saturnus'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-e4',
    type: 'connections',
    difficulty: 'easy',
    groups: [
      { label: 'Bloemen', words: ['Tulp', 'Roos', 'Zonnebloem', 'Madeliefje'], difficulty: 1 },
      { label: 'Dagen van de week', words: ['Maandag', 'Woensdag', 'Vrijdag', 'Zondag'], difficulty: 2 },
      { label: 'Dranken', words: ['Koffie', 'Thee', 'Sap', 'Melk'], difficulty: 3 },
      { label: 'Maanden', words: ['Januari', 'Maart', 'Juli', 'Oktober'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-e5',
    type: 'connections',
    difficulty: 'easy',
    groups: [
      { label: 'Huisdieren', words: ['Hond', 'Kat', 'Konijn', 'Hamster'], difficulty: 1 },
      { label: 'Dingen in de keuken', words: ['Pan', 'Mes', 'Bord', 'Lepel'], difficulty: 2 },
      { label: 'Sporten', words: ['Voetbal', 'Tennis', 'Hockey', 'Zwemmen'], difficulty: 3 },
      { label: 'Meubels', words: ['Stoel', 'Tafel', 'Bank', 'Kast'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-e6',
    type: 'connections',
    difficulty: 'easy',
    groups: [
      { label: 'Bomen', words: ['Eik', 'Berk', 'Den', 'Beuk'], difficulty: 1 },
      { label: 'Nederlandse steden', words: ['Amsterdam', 'Rotterdam', 'Utrecht', 'Eindhoven'], difficulty: 2 },
      { label: 'Weersomstandigheden', words: ['Zon', 'Regen', 'Sneeuw', 'Hagel'], difficulty: 3 },
      { label: 'Vormen', words: ['Cirkel', 'Vierkant', 'Driehoek', 'Ster'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-e7',
    type: 'connections',
    difficulty: 'easy',
    groups: [
      { label: 'Gebak', words: ['Taart', 'Koek', 'Cake', 'Wafel'], difficulty: 1 },
      { label: 'Zeedieren', words: ['Vis', 'Krab', 'Zeester', 'Dolfijn'], difficulty: 2 },
      { label: 'Gereedschap', words: ['Hamer', 'Zaag', 'Tang', 'Boor'], difficulty: 3 },
      { label: 'Smaak', words: ['Zoet', 'Zuur', 'Zout', 'Bitter'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-e8',
    type: 'connections',
    difficulty: 'easy',
    groups: [
      { label: 'Insecten', words: ['Bij', 'Vlinder', 'Mier', 'Wesp'], difficulty: 1 },
      { label: 'Broodbeleg', words: ['Hagelslag', 'Pindakaas', 'Kaas', 'Jam'], difficulty: 2 },
      { label: 'Kamers in huis', words: ['Keuken', 'Badkamer', 'Slaapkamer', 'Woonkamer'], difficulty: 3 },
      { label: 'Materialen', words: ['Hout', 'Steen', 'Glas', 'Metaal'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-e9',
    type: 'connections',
    difficulty: 'easy',
    groups: [
      { label: 'In de speeltuin', words: ['Schommel', 'Glijbaan', 'Wip', 'Zandbak'], difficulty: 1 },
      { label: 'Continenten', words: ['Europa', 'Azië', 'Afrika', 'Amerika'], difficulty: 2 },
      { label: 'Ontbijtproducten', words: ['Boterham', 'Ei', 'Yoghurt', 'Muesli'], difficulty: 3 },
      { label: 'Dingen die vliegen', words: ['Vogel', 'Vliegtuig', 'Raket', 'Vlieger'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-e10',
    type: 'connections',
    difficulty: 'easy',
    groups: [
      { label: 'Sprookjesfiguren', words: ['Draak', 'Heks', 'Prins', 'Fee'], difficulty: 1 },
      { label: 'Noten', words: ['Walnoot', 'Cashew', 'Pinda', 'Amandel'], difficulty: 2 },
      { label: 'Voetbalposities', words: ['Keeper', 'Verdediger', 'Middenvelder', 'Spits'], difficulty: 3 },
      { label: 'Op het strand', words: ['Zand', 'Schelp', 'Parasol', 'Handdoek'], difficulty: 4 },
    ],
  },

  // ═══════════════════════════════════════════
  //  MEDIUM — trickier overlaps, wordplay
  // ═══════════════════════════════════════════
  {
    id: 'conn-m1',
    type: 'connections',
    difficulty: 'medium',
    groups: [
      { label: 'Universiteitssteden', words: ['Groningen', 'Leiden', 'Delft', 'Maastricht'], difficulty: 1 },
      { label: 'Kaassoorten', words: ['Gouda', 'Edammer', 'Leidse', 'Maaslander'], difficulty: 2 },
      { label: 'Windmolens', words: ['Wieken', 'Molen', 'Graan', 'Polder'], difficulty: 3 },
      { label: '___dam', words: ['Amster', 'Rotter', 'Volen', 'Schie'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-m2',
    type: 'connections',
    difficulty: 'medium',
    groups: [
      { label: 'Voetbalclubs (NL)', words: ['Ajax', 'Feyenoord', 'PSV', 'Twente'], difficulty: 1 },
      { label: 'Dieren in het bos', words: ['Hert', 'Vos', 'Uil', 'Das'], difficulty: 2 },
      { label: 'Nederlandse rivieren', words: ['Rijn', 'Maas', 'Waal', 'IJssel'], difficulty: 3 },
      { label: 'Naam + dier', words: ['Rob', 'Mees', 'Mus', 'Lam'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-m3',
    type: 'connections',
    difficulty: 'medium',
    groups: [
      { label: 'Nederlandse feestdagen', words: ['Koningsdag', 'Sinterklaas', 'Bevrijdingsdag', 'Carnaval'], difficulty: 1 },
      { label: 'Sporttermen', words: ['Goal', 'Set', 'Ace', 'Finish'], difficulty: 2 },
      { label: 'Watergerelateerd', words: ['Sloot', 'Gracht', 'Kanaal', 'Rivier'], difficulty: 3 },
      { label: 'Fietsen', words: ['Zadel', 'Stuur', 'Ketting', 'Band'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-m4',
    type: 'connections',
    difficulty: 'medium',
    groups: [
      { label: 'Dingen die je draait', words: ['Sleutel', 'Knop', 'Deksel', 'Rad'], difficulty: 1 },
      { label: 'Nederlandse gerechten', words: ['Stamppot', 'Kroket', 'Hutspot', 'Bitterballen'], difficulty: 2 },
      { label: 'Dingen op een boot', words: ['Anker', 'Mast', 'Roer', 'Zeil'], difficulty: 3 },
      { label: 'Hand___', words: ['Schoen', 'Doek', 'Rem', 'Bal'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-m5',
    type: 'connections',
    difficulty: 'medium',
    groups: [
      { label: 'Nederlandse schilders', words: ['Rembrandt', 'Vermeer', 'Mondriaan', 'Escher'], difficulty: 1 },
      { label: 'Gevoel', words: ['Blij', 'Boos', 'Bang', 'Verdrietig'], difficulty: 2 },
      { label: 'Nederlandse provincies', words: ['Zeeland', 'Drenthe', 'Limburg', 'Flevoland'], difficulty: 3 },
      { label: 'Kunnen ook namen zijn', words: ['Storm', 'Steen', 'Berg', 'Bos'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-m6',
    type: 'connections',
    difficulty: 'medium',
    groups: [
      { label: 'Op de snelweg', words: ['Vluchtstrook', 'Afrit', 'Vangrail', 'Berm'], difficulty: 1 },
      { label: 'Nederlandse zoetwaren', words: ['Stroopwafel', 'Drop', 'Pepernoot', 'Tompoes'], difficulty: 2 },
      { label: 'Schaakstukken', words: ['Koning', 'Toren', 'Loper', 'Paard'], difficulty: 3 },
      { label: '___huis', words: ['Gracht', 'Pand', 'Stad', 'Raad'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-m7',
    type: 'connections',
    difficulty: 'medium',
    groups: [
      { label: 'In de badkamer', words: ['Douche', 'Spiegel', 'Handdoek', 'Zeep'], difficulty: 1 },
      { label: 'Kaartspel', words: ['Harten', 'Schoppen', 'Klaveren', 'Ruiten'], difficulty: 2 },
      { label: 'Water___', words: ['Val', 'Polo', 'Lelie', 'Schade'], difficulty: 3 },
      { label: 'Eet je op brood', words: ['Rookvlees', 'Filet', 'Leverworst', 'Cervelaat'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-m8',
    type: 'connections',
    difficulty: 'medium',
    groups: [
      { label: 'Beroepen', words: ['Dokter', 'Bakker', 'Kok', 'Piloot'], difficulty: 1 },
      { label: 'Op een verjaardag', words: ['Slingers', 'Cadeau', 'Ballon', 'Taart'], difficulty: 2 },
      { label: 'Zintuigen', words: ['Zien', 'Horen', 'Ruiken', 'Proeven'], difficulty: 3 },
      { label: 'Dingen die kunnen breken', words: ['Glas', 'Hart', 'Belofte', 'Record'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-m9',
    type: 'connections',
    difficulty: 'medium',
    groups: [
      { label: 'TV-zenders (NL)', words: ['NPO', 'RTL', 'SBS', 'Veronica'], difficulty: 1 },
      { label: 'Sprookjes', words: ['Assepoester', 'Roodkapje', 'Sneeuwwitje', 'Doornroosje'], difficulty: 2 },
      { label: 'Dingen in een tas', words: ['Portemonnee', 'Sleutels', 'Telefoon', 'Zakdoek'], difficulty: 3 },
      { label: 'Rug___', words: ['Zak', 'Slag', 'Pijn', 'Wind'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-m10',
    type: 'connections',
    difficulty: 'medium',
    groups: [
      { label: 'Typisch Hollands', words: ['Klompen', 'Tulpen', 'Molen', 'Kaas'], difficulty: 1 },
      { label: 'Kruiden', words: ['Basilicum', 'Peterselie', 'Oregano', 'Tijm'], difficulty: 2 },
      { label: 'Dansvormen', words: ['Salsa', 'Wals', 'Tango', 'Samba'], difficulty: 3 },
      { label: 'Beginnen met B, ook een naam', words: ['Bas', 'Bram', 'Bloem', 'Beer'], difficulty: 4 },
    ],
  },

  // ═══════════════════════════════════════════
  //  HARD — heavy overlap, abstract connections, wordplay
  // ═══════════════════════════════════════════
  {
    id: 'conn-h1',
    type: 'connections',
    difficulty: 'hard',
    groups: [
      { label: 'Dubbele betekenis', words: ['Bank', 'Slot', 'Bos', 'Veer'], difficulty: 1 },
      { label: '"Gouden" ___', words: ['Medaille', 'Kooi', 'Standaard', 'Eeuw'], difficulty: 2 },
      { label: 'Nederlandse koningen/koninginnen', words: ['Willem', 'Beatrix', 'Juliana', 'Wilhelmina'], difficulty: 3 },
      { label: 'Palindromen', words: ['Lepel', 'Negen', 'Radar', 'Madam'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-h2',
    type: 'connections',
    difficulty: 'hard',
    groups: [
      { label: 'Woorden met "ijs"', words: ['Prijs', 'Bewijs', 'Wijs', 'Grijs'], difficulty: 1 },
      { label: 'Elementen', words: ['Goud', 'Zilver', 'IJzer', 'Koper'], difficulty: 2 },
      { label: 'Muziekgenres', words: ['Pop', 'Rock', 'Jazz', 'Metal'], difficulty: 3 },
      { label: 'Zijn ook een kleur + voornaam', words: ['Rose', 'Amber', 'Violet', 'Jade'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-h3',
    type: 'connections',
    difficulty: 'hard',
    groups: [
      { label: 'Op een klok', words: ['Wijzer', 'Slinger', 'Kast', 'Wijzerplaat'], difficulty: 1 },
      { label: 'Valuta', words: ['Pond', 'Kroon', 'Frank', 'Gulden'], difficulty: 2 },
      { label: 'Zijn ook een achternaam', words: ['Bakker', 'Visser', 'Smit', 'Mulder'], difficulty: 3 },
      { label: '___weg', words: ['Snel', 'Spoor', 'Vlucht', 'Om'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-h4',
    type: 'connections',
    difficulty: 'hard',
    groups: [
      { label: 'Gaan over water', words: ['Brug', 'Veer', 'Pont', 'Sluis'], difficulty: 1 },
      { label: 'Oud-Nederlands eten', words: ['Snert', 'Rolpens', 'Zult', 'Balkenbrij'], difficulty: 2 },
      { label: '___schap', words: ['Land', 'Vriend', 'Bood', 'Maat'], difficulty: 3 },
      { label: 'Kunnen na "onder"', words: ['Broek', 'Grond', 'Wijs', 'Werp'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-h5',
    type: 'connections',
    difficulty: 'hard',
    groups: [
      { label: 'Dingen die draaien', words: ['Molen', 'Tol', 'Plaat', 'Aarde'], difficulty: 1 },
      { label: 'Hoofd___', words: ['Pijn', 'Rol', 'Stad', 'Prijs'], difficulty: 2 },
      { label: 'Nederlandse schrijvers', words: ['Mulisch', 'Wolkers', 'Reve', 'Hermans'], difficulty: 3 },
      { label: 'Woorden die ook een stad zijn', words: ['Nice', 'Bath', 'Cork', 'Essen'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-h6',
    type: 'connections',
    difficulty: 'hard',
    groups: [
      { label: 'Ouderwetse beroepen', words: ['Smid', 'Kuiper', 'Schout', 'Klerk'], difficulty: 1 },
      { label: 'Bol___', words: ['Hoed', 'Vorm', 'Werk', 'Gewas'], difficulty: 2 },
      { label: 'Dingen met gaatjes', words: ['Kaas', 'Zeef', 'Fluit', 'Knoop'], difficulty: 3 },
      { label: 'Bevatten een getal', words: ['Tweeling', 'Driehoek', 'Vierhoek', 'Zestal'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-h7',
    type: 'connections',
    difficulty: 'hard',
    groups: [
      { label: 'Rijmen op -acht', words: ['Nacht', 'Macht', 'Pracht', 'Pacht'], difficulty: 1 },
      { label: 'Het koninklijk huis', words: ['Paleis', 'Troon', 'Kroon', 'Oranje'], difficulty: 2 },
      { label: 'Dubbele klinker woorden', words: ['Vuur', 'Boom', 'Maan', 'Raam'], difficulty: 3 },
      { label: 'Zijn ook een maat', words: ['Voet', 'El', 'Palm', 'Span'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-h8',
    type: 'connections',
    difficulty: 'hard',
    groups: [
      { label: 'Mythische wezens', words: ['Feniks', 'Draak', 'Eenhoorn', 'Griffioen'], difficulty: 1 },
      { label: 'Achter___', words: ['Naam', 'Deur', 'Grond', 'Kant'], difficulty: 2 },
      { label: 'Tien___', words: ['Tallen', 'Daagse', 'Kamp', 'Jarig'], difficulty: 3 },
      { label: '3-letterwoorden, ook Engels', words: ['Arm', 'Bad', 'Dip', 'Gel'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-h9',
    type: 'connections',
    difficulty: 'hard',
    groups: [
      { label: 'Broodje van', words: ['Kroket', 'Frikandel', 'Kaas', 'Haring'], difficulty: 1 },
      { label: 'Voor___', words: ['Recht', 'Hoofd', 'Beeld', 'Deel'], difficulty: 2 },
      { label: 'Eindigen op -heid', words: ['Vrijheid', 'Waarheid', 'Schoonheid', 'Snelheid'], difficulty: 3 },
      { label: '... als een ___', words: ['Ezel', 'Otter', 'Beer', 'Roos'], difficulty: 4 },
    ],
  },
  {
    id: 'conn-h10',
    type: 'connections',
    difficulty: 'hard',
    groups: [
      { label: 'Vliegende dieren', words: ['Uil', 'Vleermuis', 'Mug', 'Papegaai'], difficulty: 1 },
      { label: 'Op___', words: ['Slag', 'Tocht', 'Ruiming', 'Komst'], difficulty: 2 },
      { label: 'Woorden die ook een kleur zijn', words: ['Kastanje', 'Zalm', 'Olijf', 'Aubergine'], difficulty: 3 },
      { label: 'Typisch Sinterklaas', words: ['Pepernoot', 'Schoen', 'Stoomboot', 'Mijter'], difficulty: 4 },
    ],
  },
];

const puzzelrondePuzzles: PuzzelrondePuzzle[] = [
  // ═══════════════════════════════════════════
  //  EASY — common, obvious compound words
  // ═══════════════════════════════════════════
  {
    id: 'puzz-e1',
    type: 'puzzelronde',
    difficulty: 'easy',
    groups: [
      // Koningsdag, Geboortedag, Feestdag, Werkdag
      { words: ['Konings', 'Geboorte', 'Feest', 'Werk'], answer: 'Dag' },
      // Sneeuwbal, Voetbal, Handbal, Basketbal
      { words: ['Sneeuw', 'Voet', 'Hand', 'Basket'], answer: 'Bal' },
      // Huiswerk, Handwerk, Kunstwerk, Maatwerk
      { words: ['Huis', 'Hand', 'Kunst', 'Maat'], answer: 'Werk' },
    ],
  },
  {
    id: 'puzz-e2',
    type: 'puzzelronde',
    difficulty: 'easy',
    groups: [
      // Hoofdpijn, Buikpijn, Rugpijn, Kiespijn
      { words: ['Hoofd', 'Buik', 'Rug', 'Kies'], answer: 'Pijn' },
      // Voordeur, Buitendeur, Kamerdeur, Achterdeur
      { words: ['Voor', 'Buiten', 'Kamer', 'Achter'], answer: 'Deur' },
      // Zonlicht, Maanlicht, Daglicht, Kaarslicht
      { words: ['Zon', 'Maan', 'Dag', 'Kaars'], answer: 'Licht' },
    ],
  },
  {
    id: 'puzz-e3',
    type: 'puzzelronde',
    difficulty: 'easy',
    groups: [
      // Armband, Polsband, Halsband, Hoofdband
      { words: ['Arm', 'Pols', 'Hals', 'Hoofd'], answer: 'Band' },
      // Broodmes, Zakmes, Keukenmes, Vleesmes
      { words: ['Brood', 'Zak', 'Keuken', 'Vlees'], answer: 'Mes' },
      // Kindertijd, Schooltijd, Speeltijd, Leeftijd
      { words: ['Kinder', 'School', 'Speel', 'Leef'], answer: 'Tijd' },
    ],
  },
  {
    id: 'puzz-e4',
    type: 'puzzelronde',
    difficulty: 'easy',
    groups: [
      // Dagboek, Kookboek, Schoolboek, Plakboek
      { words: ['Dag', 'Kook', 'School', 'Plak'], answer: 'Boek' },
      // Bloempot, Koffiepot, Theepot, Verfpot
      { words: ['Bloem', 'Koffie', 'Thee', 'Verf'], answer: 'Pot' },
      // Autoweg, Snelweg, Spoorweg, Ringweg
      { words: ['Auto', 'Snel', 'Spoor', 'Ring'], answer: 'Weg' },
    ],
  },
  {
    id: 'puzz-e5',
    type: 'puzzelronde',
    difficulty: 'easy',
    groups: [
      // Ziekbed, Rivierbed, Waterbed, Bloembed
      { words: ['Ziek', 'Rivier', 'Water', 'Bloem'], answer: 'Bed' },
      // Appelsap, Druivensap, Tomatensap, Groentesap
      { words: ['Appel', 'Druiven', 'Tomaten', 'Groente'], answer: 'Sap' },
      // Zwembad, Bloedbad, Voetbad, Stoombad
      { words: ['Zwem', 'Bloed', 'Voet', 'Stoom'], answer: 'Bad' },
    ],
  },
  {
    id: 'puzz-e6',
    type: 'puzzelronde',
    difficulty: 'easy',
    groups: [
      // Slaapkamer, Woonkamer, Badkamer, Kleedkamer
      { words: ['Slaap', 'Woon', 'Bad', 'Kleed'], answer: 'Kamer' },
      // Boomhuis, Poppenhuis, Woonhuis, Klokhuis
      { words: ['Boom', 'Poppen', 'Woon', 'Klok'], answer: 'Huis' },
      // Boerenland, Vaderland, Binnenland, Buitenland
      { words: ['Boeren', 'Vader', 'Binnen', 'Buiten'], answer: 'Land' },
    ],
  },
  {
    id: 'puzz-e7',
    type: 'puzzelronde',
    difficulty: 'easy',
    groups: [
      // Zeilboot, Motorboot, Roeiboot, Stoomboot
      { words: ['Zeil', 'Motor', 'Roei', 'Stoom'], answer: 'Boot' },
      // Schaatsbaan, Rijbaan, Renbaan, Loopbaan
      { words: ['Schaats', 'Rij', 'Ren', 'Loop'], answer: 'Baan' },
      // Landkaart, Speelkaart, Postkaart, Weerkaart
      { words: ['Land', 'Speel', 'Post', 'Weer'], answer: 'Kaart' },
    ],
  },
  {
    id: 'puzz-e8',
    type: 'puzzelronde',
    difficulty: 'easy',
    groups: [
      // Bureaustoel, Ligstoel, Kantoorstoel, Schommelstoel
      { words: ['Bureau', 'Lig', 'Kantoor', 'Schommel'], answer: 'Stoel' },
      // Handdoek, Theedoek, Vaatdoek, Hoofddoek
      { words: ['Hand', 'Thee', 'Vaat', 'Hoofd'], answer: 'Doek' },
      // Brooddoos, Schoenendoos, Snoepdoos, Cadeaudoos
      { words: ['Brood', 'Schoenen', 'Snoep', 'Cadeau'], answer: 'Doos' },
    ],
  },
  {
    id: 'puzz-e9',
    type: 'puzzelronde',
    difficulty: 'easy',
    groups: [
      // Moestuin, Bloementuin, Voortuin, Daktuin
      { words: ['Moes', 'Bloemen', 'Voor', 'Dak'], answer: 'Tuin' },
      // Tafelpoot, Stoelpoot, Pianopoot, Kastpoot
      { words: ['Tafel', 'Stoel', 'Piano', 'Kast'], answer: 'Poot' },
      // Wijnglas, Bierglas, Waterglas, Cocktailglas
      { words: ['Wijn', 'Bier', 'Water', 'Cocktail'], answer: 'Glas' },
    ],
  },
  {
    id: 'puzz-e10',
    type: 'puzzelronde',
    difficulty: 'easy',
    groups: [
      // Wasmand, Broodmand, Fietsmand, Picknickmand
      { words: ['Was', 'Brood', 'Fiets', 'Picknick'], answer: 'Mand' },
      // Handtas, Schooltas, Reistas, Boodschappentas
      { words: ['Hand', 'School', 'Reis', 'Boodschappen'], answer: 'Tas' },
      // Tafellamp, Bedlamp, Bureaulamp, Nachtlamp
      { words: ['Tafel', 'Bed', 'Bureau', 'Nacht'], answer: 'Lamp' },
    ],
  },

  // ═══════════════════════════════════════════
  //  MEDIUM — less obvious compound words
  // ═══════════════════════════════════════════
  {
    id: 'puzz-m1',
    type: 'puzzelronde',
    difficulty: 'medium',
    groups: [
      // Veldslag, Aanslag, Neerslag, Inslag
      { words: ['Veld', 'Aan', 'Neer', 'In'], answer: 'Slag' },
      // Vuurtoren, Kerktoren, Wachttoren, Uitkijktoren
      { words: ['Vuur', 'Kerk', 'Wacht', 'Uitkijk'], answer: 'Toren' },
      // Stamboom, Stamtafel, Stamgast, Stamcafé
      { words: ['Boom', 'Tafel', 'Gast', 'Café'], answer: 'Stam' },
    ],
  },
  {
    id: 'puzz-m2',
    type: 'puzzelronde',
    difficulty: 'medium',
    groups: [
      // Lachspiegel, Handspiegel, Zijspiegel, Buitenspiegel
      { words: ['Lach', 'Hand', 'Zij', 'Buiten'], answer: 'Spiegel' },
      // Deurslot, Hangslot, Cijferslot, Combinatieslot
      { words: ['Deur', 'Hang', 'Cijfer', 'Combinatie'], answer: 'Slot' },
      // Springveer, Ganzenveer, Bladveer, Schroefveer
      { words: ['Spring', 'Ganzen', 'Blad', 'Schroef'], answer: 'Veer' },
    ],
  },
  {
    id: 'puzz-m3',
    type: 'puzzelronde',
    difficulty: 'medium',
    groups: [
      // Associatief: hints naar het antwoord
      { words: ['Toetsen', 'Vleugel', 'Pedaal', 'Concert'], answer: 'Piano' },
      { words: ['Bel', 'Krijtbord', 'Juf', 'Huiswerk'], answer: 'School' },
      { words: ['Tent', 'Zwembad', 'Caravan', 'Slagboom'], answer: 'Camping' },
    ],
  },
  {
    id: 'puzz-m4',
    type: 'puzzelronde',
    difficulty: 'medium',
    groups: [
      // Windmolen, Windkracht, Windstilte, Windhoos
      { words: ['Molen', 'Kracht', 'Stilte', 'Hoos'], answer: 'Wind' },
      // Tuinschaar, Heggeschaar, Schapenschaar, Nagelschaar
      { words: ['Tuin', 'Hegge', 'Schapen', 'Nagel'], answer: 'Schaar' },
      // Klapbrug, Ophaalbrug, Voetbrug, Valbrug
      { words: ['Klap', 'Ophaal', 'Voet', 'Val'], answer: 'Brug' },
    ],
  },
  {
    id: 'puzz-m5',
    type: 'puzzelronde',
    difficulty: 'medium',
    groups: [
      // Associatief: hints naar het antwoord
      { words: ['Volle', 'Krater', 'Weerwolf', 'Armstrong'], answer: 'Maan' },
      { words: ['Filter', 'Bonen', 'Barista', 'Espresso'], answer: 'Koffie' },
      { words: ['Zout', 'Citroen', 'Mexico', 'Sunrise'], answer: 'Tequila' },
    ],
  },
  {
    id: 'puzz-m6',
    type: 'puzzelronde',
    difficulty: 'medium',
    groups: [
      // Baksteen, Natuursteen, Hoeksteen, Grafsteen
      { words: ['Bak', 'Natuur', 'Hoek', 'Graf'], answer: 'Steen' },
      // Brandhout, Drifthout, Sloophout, Kernhout
      { words: ['Brand', 'Drift', 'Sloop', 'Kern'], answer: 'Hout' },
      // Rijschool, Dansschool, Kookschool, Muziekschool
      { words: ['Rij', 'Dans', 'Kook', 'Muziek'], answer: 'School' },
    ],
  },
  {
    id: 'puzz-m7',
    type: 'puzzelronde',
    difficulty: 'medium',
    groups: [
      // Schrikkeljaar, Kalenderjaar, Nieuwjaar, Geboortejaar
      { words: ['Schrikkel', 'Kalender', 'Nieuw', 'Geboorte'], answer: 'Jaar' },
      // Waterval, Overval, Uitval, Aanval
      { words: ['Water', 'Over', 'Uit', 'Aan'], answer: 'Val' },
      // Buslijn, Tramlijn, Hoogtelijn, Grenslijn
      { words: ['Bus', 'Tram', 'Hoogte', 'Grens'], answer: 'Lijn' },
    ],
  },
  {
    id: 'puzz-m8',
    type: 'puzzelronde',
    difficulty: 'medium',
    groups: [
      // Associatief: hints naar het antwoord
      { words: ['Goal', 'Buitenspel', 'Scheidsrechter', 'Grasmat'], answer: 'Voetbal' },
      { words: ['Boom', 'Cadeau', 'Kalkoen', 'Stal'], answer: 'Kerst' },
      { words: ['Bluf', 'Fiches', 'Rivier', 'All-in'], answer: 'Poker' },
    ],
  },
  {
    id: 'puzz-m9',
    type: 'puzzelronde',
    difficulty: 'medium',
    groups: [
      // Mijnenveld, Slagveld, Korenveld, Voetbalveld
      { words: ['Mijnen', 'Slag', 'Koren', 'Voetbal'], answer: 'Veld' },
      // Vuurwapen, Vuurwerk, Vuurtoren, Vuurspuwer
      { words: ['Wapen', 'Werk', 'Toren', 'Spuwer'], answer: 'Vuur' },
      // Zakgeld, Wisselgeld, Kleingeld, Spaargeld
      { words: ['Zak', 'Wissel', 'Klein', 'Spaar'], answer: 'Geld' },
    ],
  },
  {
    id: 'puzz-m10',
    type: 'puzzelronde',
    difficulty: 'medium',
    groups: [
      // Huisdier, Roofdier, Zoogdier, Prooidier
      { words: ['Huis', 'Roof', 'Zoog', 'Prooi'], answer: 'Dier' },
      // Filmster, Zeester, Popster, Rockster
      { words: ['Film', 'Zee', 'Pop', 'Rock'], answer: 'Ster' },
      // Oorring, Vingerring, Sleutelring, Boksring
      { words: ['Oor', 'Vinger', 'Sleutel', 'Boks'], answer: 'Ring' },
    ],
  },

  // ═══════════════════════════════════════════
  //  HARD — tricky compound words, less obvious
  // ═══════════════════════════════════════════
  {
    id: 'puzz-h1',
    type: 'puzzelronde',
    difficulty: 'hard',
    groups: [
      // Kroonluchter, Kroonprins, Kroonjuweel, Kroongetuige
      { words: ['Luchter', 'Prins', 'Juweel', 'Getuige'], answer: 'Kroon' },
      // Hartslag, Vlinderslag, Borstslag, Rugslag
      { words: ['Hart', 'Vlinder', 'Borst', 'Rug'], answer: 'Slag' },
      // Ondergrond, Bovengrond, Achtergrond, Voorgrond
      { words: ['Onder', 'Boven', 'Achter', 'Voor'], answer: 'Grond' },
    ],
  },
  {
    id: 'puzz-h2',
    type: 'puzzelronde',
    difficulty: 'hard',
    groups: [
      // Associatief: hints naar het antwoord
      { words: ['Slijpen', 'Karaat', 'Ring', 'Onbreekbaar'], answer: 'Diamant' },
      { words: ['Lava', 'Uitbarsting', 'Krater', 'Pompeii'], answer: 'Vulkaan' },
      { words: ['Bubbels', 'Frankrijk', 'Toast', 'Kurk'], answer: 'Champagne' },
    ],
  },
  {
    id: 'puzz-h3',
    type: 'puzzelronde',
    difficulty: 'hard',
    groups: [
      // Hoogtepunt, Dieptepunt, Keerpunt, Vriespunt
      { words: ['Hoogte', 'Diepte', 'Keer', 'Vries'], answer: 'Punt' },
      // IJsberg, Zandberg, Rommelberg, Schuldenberg
      { words: ['IJs', 'Zand', 'Rommel', 'Schulden'], answer: 'Berg' },
      // Rietendak, Platdak, Pannendak, Stroodak
      { words: ['Rieten', 'Plat', 'Pannen', 'Stroo'], answer: 'Dak' },
    ],
  },
  {
    id: 'puzz-h4',
    type: 'puzzelronde',
    difficulty: 'hard',
    groups: [
      // Boomblad, Schouderblad, Weekblad, Werkblad
      { words: ['Boom', 'Schouder', 'Week', 'Werk'], answer: 'Blad' },
      // Brandmuur, Geluidsmuur, Klimmuur, Klaagmuur
      { words: ['Brand', 'Geluids', 'Klim', 'Klaag'], answer: 'Muur' },
      // Dwaalspoor, Voetspoor, Bloedspoor, Karrenspoor
      { words: ['Dwaal', 'Voet', 'Bloed', 'Karren'], answer: 'Spoor' },
    ],
  },
  {
    id: 'puzz-h5',
    type: 'puzzelronde',
    difficulty: 'hard',
    groups: [
      // Associatief: hints naar het antwoord
      { words: ['Farao', 'Egypte', 'Driehoek', 'Sfinx'], answer: 'Pyramide' },
      { words: ['IJsberg', 'Onzinkbaar', 'DiCaprio', 'Ramp'], answer: 'Titanic' },
      { words: ['Cacao', 'Bonbon', 'Reep', 'Belgie'], answer: 'Chocolade' },
    ],
  },
  {
    id: 'puzz-h6',
    type: 'puzzelronde',
    difficulty: 'hard',
    groups: [
      // Grondwet, Natuurwet, Kieswet, Arbeidswet
      { words: ['Grond', 'Natuur', 'Kies', 'Arbeids'], answer: 'Wet' },
      // Toneelstuk, Mondstuk, Muziekstuk, Kunststuk
      { words: ['Toneel', 'Mond', 'Muziek', 'Kunst'], answer: 'Stuk' },
      // Kopstuk, Koploper, Koptelefoon, Kopbal
      { words: ['Stuk', 'Loper', 'Telefoon', 'Bal'], answer: 'Kop' },
    ],
  },
  {
    id: 'puzz-h7',
    type: 'puzzelronde',
    difficulty: 'hard',
    groups: [
      // Bloemsteel, Pannensteel, Bezemsteel, Bijlsteel
      { words: ['Bloem', 'Pannen', 'Bezem', 'Bijl'], answer: 'Steel' },
      // Goederentrein, Stoomtrein, Sneltrein, Nachttrein
      { words: ['Goederen', 'Stoom', 'Snel', 'Nacht'], answer: 'Trein' },
      // Waterleiding, Stoomleiding, Gasleiding, Pijpleiding
      { words: ['Water', 'Stoom', 'Gas', 'Pijp'], answer: 'Leiding' },
    ],
  },
  {
    id: 'puzz-h8',
    type: 'puzzelronde',
    difficulty: 'hard',
    groups: [
      // Associatief: hints naar het antwoord
      { words: ['Donder', 'Inslag', 'Zigzag', 'Flits'], answer: 'Bliksem' },
      { words: ['Noord', 'Naald', 'Roos', 'Richting'], answer: 'Kompas' },
      { words: ['IJs', 'Klap', 'Baan', 'Glijden'], answer: 'Schaatsen' },
    ],
  },
  {
    id: 'puzz-h9',
    type: 'puzzelronde',
    difficulty: 'hard',
    groups: [
      // Handschoen, Handdoek, Handrem, Handschrift
      { words: ['Schoen', 'Doek', 'Rem', 'Schrift'], answer: 'Hand' },
      // Naamplaat, Grammofoonplaat, Nummerplaat, Kookplaat
      { words: ['Naam', 'Grammofoon', 'Nummer', 'Kook'], answer: 'Plaat' },
      // Fietsketting, Halsketting, Sneeuwketting, Voedselketting
      { words: ['Fiets', 'Hals', 'Sneeuw', 'Voedsel'], answer: 'Ketting' },
    ],
  },
  {
    id: 'puzz-h10',
    type: 'puzzelronde',
    difficulty: 'hard',
    groups: [
      // Struisvogel, Roofvogel, Trekvogel, Watervogel
      { words: ['Struis', 'Roof', 'Trek', 'Water'], answer: 'Vogel' },
      // Strohoed, Zonnehoed, Gleufhoed, Feesthoed
      { words: ['Stro', 'Zonne', 'Gleuf', 'Feest'], answer: 'Hoed' },
      // Koplicht, Daglicht, Maanlicht, Zoeklicht
      { words: ['Kop', 'Dag', 'Maan', 'Zoek'], answer: 'Licht' },
    ],
  },
];

export function getConnectionsPuzzles(): ConnectionsPuzzle[] {
  return connectionsPuzzles;
}

export function getPuzzelrondePuzzles(): PuzzelrondePuzzle[] {
  return puzzelrondePuzzles;
}
